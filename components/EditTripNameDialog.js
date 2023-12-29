import axios from 'axios';
import { Formik } from 'formik';
import { Keyboard, TouchableOpacity, Platform } from 'react-native';
import {
  Button,
  Dialog,
  Input,
  Label,
  Unspaced,
  XStack,
  YStack,
  useTheme,
  Text,
} from 'tamagui';
import * as yup from 'yup';

import CloseIcon from '../assets/icons/close.svg';
import { useAuth } from '../authProvider';

const tripNameValidationSchema = yup.object().shape({
  tripName: yup.string().required('Поле не может быть пустым'),
});

const EditTripNameDialog = ({ isOpen, setIsOpen, tripId, changeTitle }) => {
  const theme = useTheme();
  const color = theme.color.get();
  const authContext = useAuth();
  const axiosInstance = axios.create({
    baseURL:
      Platform.OS === 'ios'
        ? 'http://127.0.0.1:8000/api'
        : 'http://10.0.2.2:8000/api',
    headers: {
      Authorization: `JWT ${authContext.state.accessToken}`,
    },
  });
  const renameTrip = async (value) => {
    await axiosInstance
      .patch(`/trip/${tripId}/`, {
        name: value.tripName,
      })
      .then(() => {
        setIsOpen(false);
        changeTitle(value.tripName);
      })
      .catch(() => alert('Ошибка при изменении названия выезда.'));
  };

  return (
    <Dialog
      modal
      open={isOpen}
      onOpenChange={() => {
        setIsOpen(false);
      }}>
      <Dialog.Portal>
        <Dialog.Overlay
          onPress={() => setIsOpen(false)}
          key="overlay"
          animation="medium"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Dialog.Content
          bordered
          elevate
          key="content"
          animateOnly={['transform', 'opacity']}
          animation={[
            'medium',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          gap="$4">
          <Dialog.Title fontSize={24}>Изменить имя выезда</Dialog.Title>
          <Dialog.Description>
            Внесите новое название выезда. Нажмите «Сохранить», когда закончите.
          </Dialog.Description>
          <Formik
            validateOnMount
            validationSchema={tripNameValidationSchema}
            initialValues={{ tripName: '' }}
            onSubmit={(value) => renameTrip(value)}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              isValid,
            }) => (
              <>
                <XStack gap="$4">
                  <Label>Название</Label>
                  <YStack flex={1}>
                    <Input
                      name="tripName"
                      autoFocus
                      maxLength={100}
                      onChangeText={handleChange('tripName')}
                      onBlur={() => {
                        handleBlur('tripName');
                        Keyboard.dismiss();
                      }}
                      value={values.tripName}
                      inputMode="text"
                      placeholder="Введите новое название выезда"
                    />
                    {errors.tripName && (
                      <Text color="$red8">{errors.tripName}</Text>
                    )}
                  </YStack>
                </XStack>

                <XStack
                  alignSelf="flex-end"
                  gap="$4">
                  <Dialog.Close
                    displayWhenAdapted
                    asChild>
                    <Button>Отмена</Button>
                  </Dialog.Close>
                  <Button
                    onPress={handleSubmit}
                    disabled={!isValid}
                    backgroundColor={
                      isValid ? '$background' : '$backgroundTransparent'
                    }
                    color={isValid ? '$color' : '$colorTransparent'}>
                    Сохранить
                  </Button>
                </XStack>
              </>
            )}
          </Formik>
          <Unspaced>
            <Dialog.Close asChild>
              <TouchableOpacity
                style={{ position: 'absolute', top: 10, right: 10 }}>
                <CloseIcon fill={color} />
              </TouchableOpacity>
            </Dialog.Close>
          </Unspaced>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};

export { EditTripNameDialog };
