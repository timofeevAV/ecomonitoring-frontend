import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { useTheme } from 'tamagui';

import { GoBackBtn } from './GoBackBtn';
import { useAuth } from '../authProvider';
import { SignUpPage } from '../pages/authStack/SignUp';
import { SignInPage } from '../pages/authStack/Signin';
import { ConstructorPage } from '../pages/bottomTabs/Constructor';
import { ProfilePage } from '../pages/bottomTabs/Profile';
import { TripsListPage } from '../pages/bottomTabs/TripsList';
import { TripDetailsPage } from '../pages/stack/TripDetails';

SplashScreen.preventAutoHideAsync();

const BottomTabs = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const UserTabs = () => {
  const theme = useTheme();
  const backgroundStrong = theme.backgroundStrong.get();
  const color = theme.color.get();
  const blue = theme.blue11.get();

  return (
    <BottomTabs.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: backgroundStrong,
        },
        headerTitleStyle: {
          color,
        },
        tabBarStyle: {
          backgroundColor: backgroundStrong,
        },
        tabBarActiveTintColor: blue,
      }}>
      <BottomTabs.Screen
        name="trips-list"
        component={TripsListPage}
        options={{
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
            backgroundColor: backgroundStrong,
          },
          title: 'Выезды',
        }}
      />
      <BottomTabs.Screen
        name="creator"
        component={ConstructorPage}
        options={{
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
            backgroundColor: backgroundStrong,
          },
          title: 'Конструктор',
        }}
      />
      <BottomTabs.Screen
        name="profile"
        component={ProfilePage}
        options={{ title: 'Профиль' }}
      />
    </BottomTabs.Navigator>
  );
};

const AuthStack = () => {
  const theme = useTheme();
  const blue = theme.blue11.get();
  const backgroundStrong = theme.backgroundStrong.get();


  return (
    <Stack.Navigator
      screenOptions={({ navigation, route }) => ({
        headerTintColor: blue,
        headerTransparent: true,
        title: null,
        headerBackTitleVisible: false,
        headerLeft: ({ tintColor }) =>
          route.name !== 'sign-in' ? (
            <GoBackBtn
              navigation={navigation}
              tintColor={tintColor}
            />
          ) : null,
      })}>
      <Stack.Screen
        name="sign-in"
        component={SignInPage}
      />
      <Stack.Screen
        name="sign-up"
        component={SignUpPage}
        options={{headerTransparent: false, headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
          backgroundColor: backgroundStrong,
        },}}
      />
    </Stack.Navigator>
  );
};

const Router = () => {
  const theme = useTheme();
  const backgroundStrong = theme.backgroundStrong.get();
  const color = theme.color.get();
  const blue = theme.blue11.get();
  const authContext = useAuth();
  useEffect(() => {
    if (!authContext.state.isLoading) {
      SplashScreen.hideAsync();
    }
  }, [authContext.state.isLoading]);

  if (authContext.state.isLoading) return null;

  return (
    <NavigationContainer>
      {authContext.state.isAuthenticated ? (
        <Stack.Navigator
          screenOptions={({ navigation, route }) => ({
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: backgroundStrong,
            },
            headerTitleStyle: {
              color,
            },
            headerTintColor: blue,
            headerBackTitleVisible: false,
            headerLeft: ({ tintColor }) =>
              route.name !== 'user-tabs' ? (
                <GoBackBtn
                  navigation={navigation}
                  tintColor={tintColor}
                />
              ) : null,
          })}>
          <Stack.Screen
            name="user-tabs"
            component={UserTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="trip-details"
            component={TripDetailsPage}
            options={({ route }) => ({
              title: route.params.title,
            })}
          />
        </Stack.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

export { Router };
