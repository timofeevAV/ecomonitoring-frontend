import { FlashList } from '@shopify/flash-list';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YStack, useTheme, debounce, Text as TamaguiText } from 'tamagui';

import { useAuth } from '../../authProvider';
import { BottomMenu } from '../../components/BottomMenu';
import { ModalLoader } from '../../components/ModalLoader';
import { SearchBar } from '../../components/SearchBar';
import { TripItem } from '../../components/TripItem';

const TripsListPage = ({ navigation }) => {
  const [trips, setTrips] = useState([]);
  const [nextTripsPage, setNextTripsPage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstLoading, setIsFirstLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchPhrase, setSearchPhrase] = useState('');
  const [clicked, setClicked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTrips, setSelectedTrips] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const theme = useTheme();
  const backgroundStrong = theme.backgroundStrong.get();
  const color = theme.color.get();
  const blue = theme.blue11.get();
  const blueTransparent = theme.blue5.get();
  const insets = useSafeAreaInsets();
  const [blurViewHeight, setBlurViewHeight] = useState(0);
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

  const fetchData = async () => {
    setIsRefreshing(true);
    setError(false);
    const res = await axiosInstance
      .get(`/trips/?perPage=15`)
      .then((response) => {
        setTrips(response.data.results);
        setNextTripsPage(response.data.next);
      })
      .catch((e) => {
        setError(true);
      })
      .finally(() => {
        setIsRefreshing(false);
        setIsFirstLoading(false);
      });
  };

  const loadMoreTrips = debounce(() => {
    if (!isLoading && nextTripsPage) {
      setIsLoading(true);
      axiosInstance
        .get(nextTripsPage)
        .then((response) => {
          setTrips((prevData) => [...prevData, ...response.data.results]);
          setNextTripsPage(response.data.next);
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
      tabBarStyle: {
        backgroundColor: backgroundStrong,
        display: isEditing ? 'none' : 'flex',
      },
      tabBarActiveTintColor: blue,
    });
  }, [backgroundStrong, blue, isEditing]);

  useEffect(() => {
    if (!trips.length) {
      setIsEditing(false);
      setSelectedTrips([]);
    }
  }, [trips]);

  const addTrip = async () => {
    await axiosInstance
      .post('/trips/')
      .then((response) => {
        setTrips((prevData) => [...prevData, response.data]);
      })
      .catch((e) => {
        alert(e);
      });
  };

  // const removeTrip = async (itemId) => {
  //   await axiosInstance
  //     .delete(`/trip/${itemId}/`)
  //     .then(() => {
  //       setTrips((prevState) => prevState.filter((item) => item.id !== itemId));
  //     })
  //     .catch((e) => {
  //       alert(e);
  //     });
  // };

  const removeSelectedItems = async () => {
    await axiosInstance
      .delete('/trips/delete/', {
        data: { trip_ids: selectedTrips },
      })
      .then(() => {
        setTrips((prevData) =>
          prevData.filter((item) => !selectedTrips.includes(item.id)),
        );
        setSelectedTrips([]);
      })
      .catch(() => alert('Ошибка удаления'));
  };

  const selectAllItems = () => {
    if (selectedTrips.length) {
      setSelectedTrips([]);
    } else {
      const allItemIds = trips.map((item) => item.id);
      setSelectedTrips(allItemIds);
    }
  };

  const toggleItemSelection = (itemId) => {
    if (selectedTrips.includes(itemId)) {
      setSelectedTrips(selectedTrips.filter((id) => id !== itemId));
    } else {
      setSelectedTrips([...selectedTrips, itemId]);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={addTrip}>
          <Text style={{ color: blue, left: 10, fontSize: 16 }}>Добавить</Text>
        </TouchableOpacity>
      ),
    });
  }, [blue]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            setIsEditing(!isEditing);
            setSelectedTrips([]);
          }}
          disabled={!trips.length}>
          <Text
            style={{
              color: !trips.length ? blueTransparent : blue,
              right: 10,
              fontSize: 16,
            }}>
            {isEditing ? 'Готово' : 'Изм.'}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [blue, blueTransparent, trips, isEditing]);

  const FlashListSeparator = useCallback(() => {
    return <YStack h={15} />;
  }, []);

  const debouncedUpdateSearchPhrase = useCallback(
    debounce(async (searchPhrase) => {
      await axiosInstance
        .get(`/trips/?search=${searchPhrase}`)
        .then((response) => {
          setTrips(response.data.results);
          setNextTripsPage(response.data.next);
        })
        .catch((e) => console.error(e));
    }, 250),
    [],
  );

  const handleSearchPhraseChange = (value) => {
    setSearchPhrase(value);
    debouncedUpdateSearchPhrase(value);
  };

  if (isFirstLoading) return <ModalLoader />;
  if (error)
    return (
      <YStack
        justifyContent="center"
        flex={1}
        backgroundColor="$backgroundStrong">
        <TamaguiText textAlign="center">
          При загрузке данных произошла ошибка.
        </TamaguiText>
        <TouchableOpacity onPress={fetchData}>
          <TamaguiText
            color="$blue11"
            textAlign="center">
            Повторить
          </TamaguiText>
        </TouchableOpacity>
      </YStack>
    );

  return (
    <YStack
      backgroundColor="$backgroundStrong"
      flex={1}>
      <FlashList
        data={trips}
        contentContainerStyle={{
          paddingLeft: insets.left,
          paddingRight: insets.right,
          paddingBottom: isEditing ? blurViewHeight + 15 : 15,
        }}
        ListHeaderComponent={
          <SearchBar
            searchPhrase={searchPhrase}
            setSearchPhrase={handleSearchPhraseChange}
            clicked={clicked}
            setClicked={setClicked}
          />
        }
        ItemSeparatorComponent={FlashListSeparator}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TripItem
            item={item}
            isEditing={isEditing}
            isSelected={selectedTrips.includes(item.id)}
            toggleItemSelection={toggleItemSelection}
          />
        )}
        refreshControl={
          <RefreshControl
            onRefresh={fetchData}
            refreshing={isRefreshing}
            tintColor={color}
          />
        }
        onEndReached={loadMoreTrips}
        onEndReachedThreshold={0.1}
        estimatedItemSize={Dimensions.get('window').width}
        extraData={[isEditing, selectedTrips]}
        showsVerticalScrollIndicator={false}
      />
      <BottomMenu
        isShow={isEditing}
        setBlurViewHeight={setBlurViewHeight}
        selectAllItems={selectAllItems}
        removeSelectedItems={removeSelectedItems}
        hasSelectedItems={selectedTrips.length}
      />
    </YStack>
  );
};

export { TripsListPage };
