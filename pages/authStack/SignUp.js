import axios from 'axios';
import { Formik } from 'formik';
import React from 'react';
import { Input, Button, YStack, Label, Text } from 'tamagui';
import * as yup from 'yup';

import { useAuth } from '../../authProvider';
import { SafeScrollView } from '../../components/SafeScrollView';
import { SIGNUP_FAIL, SIGNUP_SUCCESS } from '../../types/auth';

const signUpValidationSchema = yup.object().shape({
  role: yup.string().required('Роль обязательна'),
  lastName: yup.string().required('Фамилия обязательна'),
  firstName: yup.string().required('Имя обязательно'),
  middleName: yup.string().required('Отчество обязательно'),
  email: yup
    .string()
    .email('Пожалуйста, введите действительный адрес электронной почты')
    .required('Эл.адрес обязателен'),
  password: yup
    .string()
    .min(6, ({ min }) => `Пароль должен содержать не менее ${min} символов`)
    .required('Пароль обязателен'),
  re_password: yup
    .string()
    .oneOf([yup.ref('password')], 'Пароли не совпадают')
    .required('Повтор пароля обязателен'),
});

const axiosInstance = axios.create({
  baseURL:
    Platform.OS === 'ios' ? 'http://127.0.0.1:8000/' : 'http://10.0.2.2:8000/',
});

const SignUpPage = () => {
  const authContext = useAuth();

  const signUp = async (data) => {
    try {
      const res = await axiosInstance.post('auth/users/', data);
      authContext.dispatch({
        type: SIGNUP_SUCCESS,
        payload: res.data,
      });
      alert('Письмо с подтверждением отправлено на ваш эл.адрес');
    } catch (err) {
      authContext.dispatch({ type: SIGNUP_FAIL });
      alert('Ошибка регистрации');
    }
  };

  return (
    <SafeScrollView
      yCenter
      lrSafe
      lrIndent={15}>
      <Formik
        validateOnMount
        validationSchema={signUpValidationSchema}
        initialValues={{
          role: '',
          lastName: '',
          firstName: '',
          middleName: '',
          email: '',
          password: '',
          re_password: '',
        }}
        onSubmit={signUp}>
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
            <Label>Роль</Label>
            <Input
              name="role"
              placeholder="Введите роль"
              onChangeText={handleChange('role')}
              onBlur={handleBlur('role')}
              value={values.role}
              inputMode="text"
            />
            {errors.role && touched.role && (
              <Text color="$red8">{errors.role}</Text>
            )}
            <Label>Фамилия</Label>
            <Input
              name="lastName"
              placeholder="Введите фамилию"
              onChangeText={handleChange('lastName')}
              onBlur={handleBlur('lastName')}
              value={values.lastName}
              inputMode="text"
              autoComplete="family-name"
            />
            {errors.lastName && touched.lastName && (
              <Text color="$red8">{errors.lastName}</Text>
            )}
            <Label>Имя</Label>
            <Input
              name="firstName"
              placeholder="Введите имя"
              onChangeText={handleChange('firstName')}
              onBlur={handleBlur('firstName')}
              value={values.firstName}
              inputMode="text"
              autoComplete="given-name"
            />
            {errors.firstName && touched.firstName && (
              <Text color="$red8">{errors.firstName}</Text>
            )}
            <Label>Отчество</Label>
            <Input
              name="middleName"
              placeholder="Введите отчество"
              onChangeText={handleChange('middleName')}
              onBlur={handleBlur('middleName')}
              value={values.middleName}
              inputMode="text"
              autoComplete="additional-name"
            />
            {errors.middleName && touched.middleName && (
              <Text color="$red8">{errors.middleName}</Text>
            )}
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
              inputMode="text"
              autoComplete="new-password"
              secureTextEntry
            />
            {errors.password && touched.password && (
              <Text color="$red8">{errors.password}</Text>
            )}
            <Label>Повторите пароль</Label>
            <Input
              name="re_password"
              placeholder="Введите пароль"
              onChangeText={handleChange('re_password')}
              onBlur={handleBlur('re_password')}
              value={values.re_password}
              inputMode="text"
              autoComplete="new-password"
              secureTextEntry
            />
            {errors.re_password && touched.re_password && (
              <Text color="$red8">{errors.re_password}</Text>
            )}
            <Button
              mt={25}
              onPress={handleSubmit}
              disabled={!isValid}
              backgroundColor={
                isValid ? '$background' : '$backgroundTransparent'
              }
              color={isValid ? '$color' : '$colorTransparent'}>
              Зарегистрироваться
            </Button>
          </YStack>
        )}
      </Formik>
    </SafeScrollView>
  );
};

export { SignUpPage };
