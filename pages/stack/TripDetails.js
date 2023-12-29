import { FlashList } from '@shopify/flash-list';
import axios from 'axios';
import { BlurView } from 'expo-blur';
import { Camera } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  useColorScheme,
  Keyboard,
  Platform,
  Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  useTheme,
  debounce,
  YStack,
  XStack,
  Button,
  Text,
  ListItem,
  YGroup,
  Separator,
} from 'tamagui';

import AddIcon from '../../assets/icons/add.svg';
import MyLocationIcon from '../../assets/icons/my-location.svg';
import { useAuth } from '../../authProvider';
import { CustomCalendar } from '../../components/CustomCalendar';
import { PointItem } from '../../components/PointItem';
import { TripDetailsMenu } from '../../components/TripDetailsMenu';
import { UniversalView } from '../../components/UniversalView';

const TripDetailsPage = ({ navigation, route }) => {
  const [cameraPermission, setCameraPermission] = useState(null);
  const { tripId } = route.params;
  const theme = useTheme();
  const color = theme.color.get();
  const borderColor = theme.borderColor.get();
  const red = theme.red8.get();
  const redTransparent = theme.red7.get();
  const indent = 15;
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [points, setPoints] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [nextPointsPage, setNextPointsPage] = useState(null);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { height, width } = Dimensions.get('window');
  const isLandscape = width > height;
  const mapSize = isLandscape ? height : width;
  const mapRef = useRef(null);
  const [trip, setTrip] = useState(null);
  const [samples, setSamples] = useState([]);
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

  const permisionFunction = async () => {
    const cameraPermission = await Camera.requestCameraPermissionsAsync();

    setCameraPermission(cameraPermission.status === 'granted');

    if (cameraPermission.status !== 'granted') {
      alert('Permission for media access needed.');
    }
  };

  useEffect(() => {
    permisionFunction();
  }, []);

  useEffect(() => {
    function onKeyboardWillShow(e) {
      setKeyboardHeight(e.endCoordinates.height);
    }

    function onKeyboardWillHide() {
      setKeyboardHeight(0);
    }

    const showSubscription = Keyboard.addListener(
      'keyboardWillShow',
      onKeyboardWillShow,
    );
    const hideSubscription = Keyboard.addListener(
      'keyboardWillHide',
      onKeyboardWillHide,
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const fetchData = async () => {
    setIsRefreshing(true);
    setError(false);
    await axios
      .all([
        axiosInstance.get(`/trip/${tripId}/`),
        axiosInstance.get(`/trip-points/${tripId}/?perPage=5`),
        axiosInstance.get(`/samples/`),
      ])
      .then(
        axios.spread(function (trip, points, samples) {
          setTrip(trip.data);
          setParticipants([trip.data.owner, ...trip.data.editors]);
          setPoints(points.data.results);
          setNextPointsPage(points.data.next);
          setSamples(samples.data);
        }),
      )
      .catch((e) => {
        setError(true);
      })
      .finally(() => setIsRefreshing(false));
  };

  const addPoint = async () => {
    await axiosInstance
      .post(`/trip-points/${tripId}/`)
      .then((response) => {
        setPoints((prevData) => [...prevData, response.data]);
      })
      .catch((e) => {
        setError(true);
        alert('Ошибка при добавлении точки');
      });
  };

  const deletePoint = useCallback(
    async (id) => {
      try {
        const response = await axiosInstance.delete(`/point/${id}/`);
        setPoints(points.filter((item) => item.id !== id));
      } catch {
        alert('Ошибка при удалении точки.');
      }
    },
    [points],
  );

  const loadMorePoints = debounce(async () => {
    if (!isLoading && nextPointsPage) {
      setIsLoading(true);
      await axiosInstance
        .get(nextPointsPage)
        .then((response) => {
          setPoints((prevData) => [...prevData, ...response.data.results]);
          setNextPointsPage(response.data.next);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, 500);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TripDetailsMenu
          tripName={trip !== null ? trip.name : ''}
          tripId={tripId}
          navigation={navigation}
        />
      ),
    });
  }, [navigation, trip]);

  const uploadScheme = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (result.assets) {
      const formData = new FormData();
      formData.append('scheme', {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        name: result.assets[0].uri.split('/').pop(),
      });

      await axiosInstance
        .patch(`/trip/${tripId}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          setTrip(response.data);
        })
        .catch((error) => {
          console.error(error);
          alert('Ошибка при загрузке изображения');
        });
    }
  };

  const removeScheme = async () => {
    await axiosInstance
      .patch(`/trip/${tripId}/`, { scheme: null })
      .then(() => {
        setTrip({ ...trip, scheme: null });
      })
      .catch((error) => {
        console.error(error);
        alert('Ошибка при удалении изображения');
      });
  };

  const FlashListSeparator = useCallback(() => {
    return <YStack h={indent} />;
  }, []);

  const goToMyLocation = async () => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        enableHighAccuracy: true,
      });

      mapRef.current.animateCamera({
        center: {
          ...location.coords,
        },
        altitude: 500,
      });
    })();
  };

  const removeParticipant = (userId) => {
    Alert.alert(
      'Удалить участника',
      'Вы уверены, что хотите удалить этого участника?',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await axiosInstance.post(
                `/trip-editor/${tripId}/remove_editor/`,
                { editor_id: userId },
              );
              setParticipants((prevData) =>
                prevData.filter((user) => user.id !== userId),
              );
            } catch {
              alert('Ошибка при удалении участника');
            }
          },
        },
      ],
    );
  };

  const handleMarkerDragEnd = async (e, pointId) => {
    e.persist();
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const limitedLatitude = parseFloat(latitude.toFixed(6));
    const limitedLongitude = parseFloat(longitude.toFixed(6));
    try {
      const response = await axiosInstance.patch(`/point/${pointId}/`, {
        latitude: limitedLatitude,
        longitude: limitedLongitude,
      });
      setPoints(
        points.map((p) => {
          if (p.id === pointId) {
            return {
              ...response.data,
            };
          } else {
            return p;
          }
        }),
      );
    } catch {
      console.error('Ошибка при перемещении маркера');
    }
  };

  const onGetCurrentCoords = (pointId, lat, long) => {
    setPoints(
      points.map((p) => {
        if (p.id === pointId) {
          return {
            ...p,
            latitude: lat,
            longitude: long,
          };
        } else {
          return p;
        }
      }),
    );
  };

  if (error)
    return (
      <YStack
        justifyContent="center"
        flex={1}
        backgroundColor="$backgroundStrong">
        <Text textAlign="center">При загрузке данных произошла ошибка.</Text>
        <TouchableOpacity onPress={fetchData}>
          <Text
            color="$blue11"
            textAlign="center">
            Повторить
          </Text>
        </TouchableOpacity>
      </YStack>
    );

  return (
    <UniversalView lrSafe>
      <FlashList
        data={points}
        ListHeaderComponent={
          <YStack
            space={indent}
            paddingBottom={indent}>
            <CustomCalendar tripId={tripId} />
            <YStack space={indent}>
              <Text
                fontSize="$5"
                textAlign="center">
                Участники выезда
              </Text>
              <YGroup
                bordered
                separator={<Separator />}>
                {participants.map((participant) => (
                  <YGroup.Item key={participant.id}>
                    <ListItem
                      onPress={() =>
                        authContext.state.user.id === trip.owner.id
                          ? removeParticipant(participant.id)
                          : {}
                      }
                      title={`${participant.lastName} ${participant.firstName} ${participant.middleName}`}
                      subTitle={`${participant.role}`}
                      disabled={participant.id === authContext.state.user.id}
                      pressTheme
                    />
                  </YGroup.Item>
                ))}
              </YGroup>
            </YStack>
            <View position="relative">
              <MapView
                ref={mapRef}
                style={{
                  width: mapSize,
                  height: mapSize,
                  borderRadius: 10,
                  borderColor,
                  borderWidth: 1,
                  alignSelf: 'center',
                }}>
                {points.map(
                  (point, idx) =>
                    Boolean(point.latitude && point.longitude) && (
                      <Marker
                        title={`${idx + 1}`}
                        draggable
                        onDragEnd={(e) => handleMarkerDragEnd(e, point.id)}
                        key={point.id.toString()}
                        coordinate={{
                          latitude: parseFloat(point.latitude),
                          longitude: parseFloat(point.longitude),
                        }}
                      />
                    ),
                )}
              </MapView>
              <View
                overflow="hidden"
                borderRadius={indent}
                style={{ position: 'absolute', bottom: indent, right: indent }}>
                <BlurView tint={colorScheme === 'dark' ? 'light' : 'dark'}>
                  <TouchableOpacity
                    style={{ flex: 1, padding: 5 }}
                    onPress={goToMyLocation}>
                    <MyLocationIcon fill={color} />
                  </TouchableOpacity>
                </BlurView>
              </View>
            </View>
            {Boolean(trip && trip.scheme) && (
              <View
                w={isLandscape ? height : width}
                h={isLandscape ? height : width}
                borderRadius={10}
                borderColor="$borderColor"
                borderWidth={1}
                alignSelf="center"
                overflow="hidden">
                <Text
                  fontSize="$5"
                  textAlign="center"
                  padding={5}>
                  Схема рекогносцировки
                </Text>
                <Image
                  source={{ uri: trip.scheme }}
                  style={{ width: '100%', height: '100%' }}
                  placeholder={trip?.blurhash}
                  contentFit="cover"
                />
              </View>
            )}
            <XStack
            space={indent}
              justifyContent="center">
              {Boolean(trip && trip.scheme) && (
                <Button
                  flex={1}
                  backgroundColor={red}
                  pressStyle={{ backgroundColor: redTransparent }}
                  onPress={removeScheme}>
                  Очистить
                </Button>
              )}
              <Button flex={1} onPress={uploadScheme}>Загрузить</Button>
            </XStack>
          </YStack>
        }
        ItemSeparatorComponent={FlashListSeparator}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{
          paddingBottom:
            (keyboardHeight === 0 ? insets.bottom : keyboardHeight) + 34,
        }}
        renderItem={({ item, index }) => (
          <PointItem
          cameraPermission={cameraPermission}
            samples={samples}
            item={item}
            number={index}
            indent={indent}
            onDeletePoint={deletePoint}
            changePointsList={onGetCurrentCoords}
          />
        )}
        refreshControl={
          <RefreshControl
            onRefresh={fetchData}
            refreshing={isRefreshing}
            tintColor={color}
          />
        }
        onEndReached={loadMorePoints}
        onEndReachedThreshold={0.1}
        estimatedItemSize={width}
        showsVerticalScrollIndicator={false}
      />
      <View
        overflow="hidden"
        borderRadius={indent}
        position="absolute"
        bottom={insets.bottom === 0 ? indent : insets.bottom}
        right={insets.right === 0 ? indent : insets.right}>
        <BlurView tint={colorScheme === 'dark' ? 'light' : 'dark'}>
          <TouchableOpacity
            style={{ flex: 1, padding: 5 }}
            onPress={addPoint}>
            <AddIcon fill={color} />
          </TouchableOpacity>
        </BlurView>
      </View>
    </UniversalView>
  );
};

export { TripDetailsPage };
