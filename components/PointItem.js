import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useState, useCallback, useRef } from 'react';
import { TouchableOpacity, Alert, Platform } from 'react-native';
import {
  YStack,
  Text,
  XStack,
  H4,
  Input,
  TextArea,
  useTheme,
  View,
  debounce,
  Separator,
  Unspaced,
  YGroup,
} from 'tamagui';

import { DeleteItemMenu } from './DeleteItemMenu';
import { ImagesGrid } from './ImagesGrid';
import { Picker } from './Picker';
import AddIcon from '../assets/icons/add.svg';
import MyLocationIcon from '../assets/icons/my-location.svg';
import { useAuth } from '../authProvider';

const PointItem = React.memo(
  ({ changePointsList, samples, cameraPermission, item, number, indent = 15, onDeletePoint }) => {
    const theme = useTheme();
    const blue = theme.blue11.get();
    const color = theme.color.get();
    const pointId = useRef(item.id);
    const pointLat = useRef(item.latitude);
    const pointLong = useRef(item.longitude);
    const [latitude, setLatitude] = useState(item.latitude);
    const [longitude, setLongitude] = useState(item.longitude);
    const [description, setDescription] = useState(item.description);
    const [photos, setPhotos] = useState(item.photos);
    const [selectedSample, setSelectedSample] = useState(-1);
    if (
      item.id !== pointId.current ||
      item.latitude !== pointLat.current ||
      item.longitude !== pointLong.current
    ) {
      pointId.current = item.id;
      pointLat.current = item.latitude;
      pointLong.current = item.longitude;
      setLatitude(item.latitude);
      setLongitude(item.longitude);
      setDescription(item.description);
      setPhotos(item.photos);
    }
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

    const isLatitude = (num) => {
      if (!isFinite(num) || Math.abs(num) > 90) {
        return false;
      }

      const decimalPart = (num.toString().split('.')[1] || '').length;
      return decimalPart <= 6;
    };

    const isLongitude = (num) => {
      if (!isFinite(num) || Math.abs(num) > 180) {
        return false;
      }

      const decimalPart = (num.toString().split('.')[1] || '').length;
      return decimalPart <= 6;
    };

    const patchWithDelay = useCallback(
      debounce(async (field) => {
        await axiosInstance
          .patch(`/point/${pointId.current}/`, field)
          .catch((error) => {
            console.error(error);
            alert('Ошибка при изменении');
          });
      }, 350),
      [],
    );

    const onLatitudeChange = (latitude) => {
      if (isLatitude(latitude)) {
        setLatitude(latitude);
        patchWithDelay({ latitude });
      }
    };

    const onLongitudeChange = (longitude) => {
      if (isLongitude(longitude)) {
        setLongitude(longitude);
        patchWithDelay({ longitude });
      }
    };

    const onDescriptionChange = (description) => {
      setDescription(description);
      patchWithDelay({ description });
    };

    const getCurrentLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});

        try {
          const { longitude, latitude } = location.coords;
          const limitedLatitude = parseFloat(latitude.toFixed(6));
          const limitedLongitude = parseFloat(longitude.toFixed(6));
          await axiosInstance.patch(`/point/${pointId.current}/`, {
            latitude: limitedLatitude,
            longitude: limitedLongitude,
          });
          changePointsList(
            pointId.current,
            limitedLatitude.toString(),
            limitedLongitude.toString(),
          );
        } catch (error) {
          console.error(error);
          alert('Ошибка при изменении координат.');
        }
      } else {
        alert('Разрешение на получение текущих координат не предоставлено.');
      }
    };

    const deletePhotos = async () => {
      await axiosInstance
        .delete(`/point/${pointId.current}/delete-photos`)
        .then(() => {
          setPhotos([]);
        })
        .catch((error) => {
          console.error(error);
          alert('Ошибка при удалении фото');
        });
    };

    const deletePhoto = async (photoId) => {
      await axiosInstance
        .delete(`/point-photo/${photoId}/`)
        .then(() => {
          setPhotos((prevData) =>
            prevData.filter((photo) => photo.id !== photoId),
          );
        })
        .catch((error) => {
          console.error(error);
          alert('Ошибка при удалении фото');
        });
    };

    const takePhoto = async () => {
      if (!cameraPermission) return;
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      if (!result.assets) {
        return;
      }
  
      const formData = new FormData();
      formData.append('scheme', {
        uri: result.uri,
        type: 'image/jpeg',
        name: result.uri.split('/').pop(),
      });
  
      try {
        const response = await axiosInstance.patch(`/point/${pointId.current}/photos/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setTrip(response.data);
      } catch (error) {
        console.error(error);
        alert('Ошибка при загрузке изображения');
      }
    };

    const uploadPhotos = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (result.assets) {
        const formData = new FormData();
        result.assets.map((asset) => {
          formData.append('photo', {
            uri: asset.uri,
            type: 'image/jpeg',
            name: asset.uri.split('/').pop(),
          });
        });

        await axiosInstance
          .post(`/point/${pointId.current}/photos/`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          .then((response) => {
            setPhotos((prevData) => [...prevData, ...response.data]);
          })
          .catch((error) => {
            console.error(error);
            alert('Ошибка при загрузке изображения');
          });
      }
    };

    const deletePoint = () => {
      Alert.alert('Удаление', 'Вы уверены, что хотите удалить этот элемент?', [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            onDeletePoint(pointId.current);
          },
        },
      ]);
    };

    return (
      <YStack
        backgroundColor="$background"
        borderRadius={indent}
        paddingHorizontal={indent}
        paddingVertical={indent}>
        <XStack alignItems="center">
          <View flex={1} />
          <H4
            flex={1}
            textAlign="center">
            {number + 1}
          </H4>
          <DeleteItemMenu deleteSomething={deletePoint} />
        </XStack>
        <Separator marginVertical={indent} />
        <YStack space={indent}>
          <Text fontSize="$5">Координаты</Text>
          <XStack paddingBottom={indent / 2}>
            <Text flex={1}>Долгота</Text>
            <Text flex={1}>Широта</Text>
            <View width={24} />
          </XStack>
          <Unspaced>
            <XStack
              space={indent}
              alignItems="center">
              <XStack
                flex={1}
                space={indent}>
                <Input
                  flex={1}
                  placeholder="Введите широту"
                  value={latitude}
                  onChangeText={(value) =>
                    onLatitudeChange(value.replace(',', '.'))
                  }
                  maxLength={10}
                  inputMode="decimal"
                />
                <Input
                  flex={1}
                  placeholder="Введите долготу"
                  value={longitude}
                  onChangeText={(value) =>
                    onLongitudeChange(value.replace(',', '.'))
                  }
                  maxLength={11}
                  inputMode="decimal"
                />
              </XStack>
              <TouchableOpacity onPress={getCurrentLocation}>
                <MyLocationIcon
                  fill={blue}
                  height={24}
                  width={24}
                />
              </TouchableOpacity>
            </XStack>
          </Unspaced>
          <Text fontSize="$5">Описание</Text>
          <TextArea
            placeholder="Введите описание"
            value={description}
            onChangeText={onDescriptionChange}
          />
          <Text fontSize="$5">Фотографии</Text>
          <ImagesGrid
            takePhoto={takePhoto}
            deleteImage={deletePhoto}
            deleteImages={deletePhotos}
            uploadImages={uploadPhotos}
            images={photos}
            indent={indent}
          />
          <Text fontSize="$5">Пробы</Text>
          <XStack
            paddingRight={indent * 2}
            space={indent}
            alignItems="center">
            <Picker
              val={selectedSample}
              setVal={setSelectedSample}
              items={samples}
              title="Пробы"
            />
            <TouchableOpacity>
              <AddIcon fill={color} />
            </TouchableOpacity>
          </XStack>
          
        </YStack>
      </YStack>
    );
  },
);

export { PointItem };
