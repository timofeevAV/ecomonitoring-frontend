import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
  useEffect,
  createContext,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import { Platform } from 'react-native';

import {
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  USER_LOADED_SUCCESS,
  USER_LOADED_FAIL,
  AUTHENTICATED_SUCCESS,
  AUTHENTICATED_FAIL,
  PASSWORD_RESET_SUCCESS,
  PASSWORD_RESET_FAIL,
  PASSWORD_RESET_CONFIRM_SUCCESS,
  PASSWORD_RESET_CONFIRM_FAIL,
  SIGNUP_SUCCESS,
  SIGNUP_FAIL,
  ACTIVATION_SUCCESS,
  ACTIVATION_FAIL,
  LOGOUT,
  RESTORE_TOKENS,
} from './types/auth';

const AuthContext = createContext();

const AUTH_URL =
  Platform.OS === 'ios' ? 'http://127.0.0.1:8000' : 'http://10.0.2.2:8000';

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(
    (prevState, action) => {
      switch (action.type) {
        case RESTORE_TOKENS:
          return {
            ...prevState,
            accessToken: action.payload.access,
            refreshToken: action.payload.refresh,
          };
        case AUTHENTICATED_SUCCESS:
          return {
            ...prevState,
            isAuthenticated: true,
          };
        case LOGIN_SUCCESS:
          return {
            ...prevState,
            isAuthenticated: true,
          };
        case SIGNUP_SUCCESS:
          return {
            ...prevState,
            isAuthenticated: false,
          };
        case USER_LOADED_SUCCESS:
          return {
            ...prevState,
            user: action.payload,
          };
        case AUTHENTICATED_FAIL:
          return {
            ...prevState,
            isAuthenticated: false,
          };
        case USER_LOADED_FAIL:
          return {
            ...prevState,
            user: null,
          };
        case LOGIN_FAIL:
        case SIGNUP_FAIL:
        case LOGOUT:
          return {
            ...prevState,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            user: null,
          };
        case PASSWORD_RESET_SUCCESS:
        case PASSWORD_RESET_FAIL:
        case PASSWORD_RESET_CONFIRM_SUCCESS:
        case PASSWORD_RESET_CONFIRM_FAIL:
        case ACTIVATION_SUCCESS:
        case ACTIVATION_FAIL:
          return {
            ...prevState,
          };
        case 'APP_READY': {
          return {
            ...prevState,
            isLoading: false,
          };
        }
        default:
          return state;
      }
    },
    {
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      user: null,
      isLoading: true,
    },
  );

  const api = useMemo(
    () => ({
      logout: async () => {
        SecureStore.deleteItemAsync('access');
        SecureStore.deleteItemAsync('refresh');
        dispatch({ type: LOGOUT });
      },
      reset_password_confirm: async (
        uid,
        token,
        new_password,
        re_new_password,
      ) => {
        const config = {
          headers: {
            'Content-Type': 'application/json',
          },
        };

        const body = JSON.stringify({
          uid,
          token,
          new_password,
          re_new_password,
        });

        try {
          await axios.post(
            `${AUTH_URL}/auth/users/reset_password_confirm/`,
            body,
            config,
          );

          dispatch({
            type: PASSWORD_RESET_CONFIRM_SUCCESS,
          });
        } catch (err) {
          dispatch({
            type: PASSWORD_RESET_CONFIRM_FAIL,
          });
        }
      },

      reset_password: async (email) => {
        const config = {
          headers: {
            'Content-Type': 'application/json',
          },
        };

        const body = JSON.stringify({ email });

        try {
          await axios.post(
            `${AUTH_URL}/auth/users/reset_password/`,
            body,
            config,
          );

          dispatch({
            type: PASSWORD_RESET_SUCCESS,
          });
        } catch (err) {
          dispatch({ type: PASSWORD_RESET_FAIL });
        }
      },
      bootstrapAsync: async () => {
        let accessToken;
        let refreshToken;
        try {
          accessToken = await SecureStore.getItemAsync('access');
          refreshToken = await SecureStore.getItemAsync('refresh');
        } catch (e) {
          console.error(e);
        } finally {
          dispatch({
            type: RESTORE_TOKENS,
            payload: {
              access: accessToken,
              refresh: refreshToken,
            },
          });
        }

        if (accessToken) {
          const checkAccessTokenConfig = {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          };

          const getUserConfig = {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `JWT ${accessToken}`,
              Accept: 'application/json',
            },
          };

          try {
            const res_1 = await axios.post(
              `${AUTH_URL}/auth/jwt/verify/`,
              { token: accessToken },
              checkAccessTokenConfig,
            );
            const res_2 = await axios.get(
              `${AUTH_URL}/auth/users/me/`,
              getUserConfig,
            );
            dispatch({
              type: AUTHENTICATED_SUCCESS,
            });
            dispatch({
              type: USER_LOADED_SUCCESS,
              payload: res_2.data,
            });
          } catch (err) {
            dispatch({ type: AUTHENTICATED_FAIL });
            dispatch({ type: USER_LOADED_FAIL });
          } finally {
            dispatch({ type: 'APP_READY' });
          }
        } else {
          dispatch({ type: AUTHENTICATED_FAIL });
          dispatch({ type: USER_LOADED_FAIL });
          dispatch({ type: 'APP_READY' });
        }
      },
      verify: async (uid, token) => {
        const config = {
          headers: {
            'Content-Type': 'application/json',
          },
        };

        const body = JSON.stringify({
          uid,
          token,
        });

        try {
          await axios.post(`${AUTH_URL}/auth/users/activation/`, body, config);

          dispatch({ type: ACTIVATION_SUCCESS });
        } catch (err) {
          dispatch({ type: ACTIVATION_FAIL });
        }
      },
    }),
    [],
  );

  useEffect(() => {
    api.bootstrapAsync();
  }, []);

  return (
    <AuthContext.Provider value={{ state, dispatch, api }}>
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};

export { AuthProvider, useAuth };
