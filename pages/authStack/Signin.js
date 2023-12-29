import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Formik } from 'formik';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input, YStack, Button, Text, Label, XStack, useTheme } from 'tamagui';
import * as yup from 'yup';

import { useAuth } from '../../authProvider';
import { SafeScrollView } from '../../components/SafeScrollView';
import { LOGIN_FAIL, LOGIN_SUCCESS } from '../../types/auth';

const loginValidationSchema = yup.object().shape({
  email: yup
    .string()
    .email('Пожалуйста, введите действительный адрес электронной почты')
    .required('Эл.адрес обязателен'),
  password: yup
    .string()
    .min(6, ({ min }) => `Пароль должен содержать не менее ${min} символов`)
    .required('Пароль обязателен'),
});

const axiosInstance = axios.create({
  baseURL:
    Platform.OS === 'ios' ? 'http://127.0.0.1:8000/' : 'http://10.0.2.2:8000/',
});

const SignInPage = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const authContext = useAuth();

  const signIn = async (data) => {
    try {
      const res = await axiosInstance.post('/auth/jwt/create/', data);
      await SecureStore.setItemAsync('refresh', res.data.refresh);
      await SecureStore.setItemAsync('access', res.data.access);
      authContext.api.bootstrapAsync();
    } catch (err) {
      authContext.dispatch({ type: LOGIN_FAIL });
      alert('Ошибка входа');
    }
  };

  return (
    <SafeScrollView
      yCenter
      allSafe
      lrIndent={15}>
      <Formik
        validateOnMount
        validationSchema={loginValidationSchema}
        initialValues={{ email: '', password: '' }}
        onSubmit={signIn}>
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          isValid,
        }) => (
          <YStack>
            <Label>Электронный адрес</Label>
            <Input
              name="email"
              placeholder="Введите эл.адрес"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
              inputMode="email"
              autoComplete="email"
            />
            {errors.email && touched.email && (
              <Text color="$red8">{errors.email}</Text>
            )}
            <Label>Пароль</Label>
            <Input
              name="password"
              placeholder="Введите пароль"
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
              secureTextEntry
            />
            {errors.password && touched.password && (
              <Text color="$red8">{errors.password}</Text>
            )}

            <Button
              mt={25}
              onPress={handleSubmit}
              disabled={!isValid}
              backgroundColor={
                isValid ? '$background' : '$backgroundTransparent'
              }
              color={isValid ? '$color' : '$colorTransparent'}>
              Войти
            </Button>
          </YStack>
        )}
      </Formik>
      <XStack
        position="absolute"
        bottom={insets.bottom}
        justifyContent="center"
        flexWrap="wrap"
        gap={5}
        alignSelf="center">
        <Text>Ещё нет аккаунта?</Text>
        <Text
          color="$blue11"
          pressStyle={{ scale: 0.95 }}
          onPress={() => navigation.navigate('sign-up')}>
          Зарегистрируйтесь.
        </Text>
      </XStack>
    </SafeScrollView>
  );
};

export { SignInPage };
