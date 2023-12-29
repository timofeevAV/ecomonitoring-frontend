import axios from 'axios';
import React, { useCallback, useState, useEffect } from 'react';
import {
  FlatList,
  RefreshControl,
  Platform,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Sheet,
  ListItem,
  Separator,
  Text,
  useTheme,
  debounce,
  YStack,
} from 'tamagui';

import { SearchBar } from './SearchBar';
import { useAuth } from '../authProvider';

const AddParticipantSheet = React.memo(({ tripId, isOpen, setIsOpen }) => {
  const theme = useTheme();
  const { height, width } = Dimensions.get('screen');
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const backgroundStrongColor = theme.backgroundStrong.get();
  const [searchPhrase, setSearchPhrase] = useState('');
  const [clicked, setClicked] = useState(false);
  const [error, setError] = useState(false);
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

  const fetchUsers = async () => {
    setIsRefreshing(true);
    setError(false);
    try {
      const response = await axiosInstance.get(
        `/users/${tripId}/?search=${searchPhrase}`,
      );
      setNextPage(response.data.next);
      setUsers(response.data.results);
    } catch (error) {
      console.error(error);
      setError(true);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const loadMoreUsers = debounce(() => {
    if (!isLoading && nextPage) {
      setIsLoading(true);
      axiosInstance
        .get(nextPage)
        .then((response) => {
          setUsers((prevData) => [...prevData, ...response.data.results]);
          setNextPage(response.data.next);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, 500);

  const renderItem = useCallback(({ item }) => {
    return (
      <ListItem
        pressTheme
        title={`${item.lastName} ${item.firstName} ${item.middleName}`}
        subTitle={`${item.id}`}
        onPress={() => addParticipant(item.id)}
        bordered
      />
    );
  }, []);

  const debouncedUpdateSearchPhrase = useCallback(
    debounce(async (searchPhrase) => {
      const res = await axiosInstance
        .get(`/users/${tripId}/?search=${searchPhrase}`)
        .then((response) => {
          setUsers(response.data.results);
          setNextPage(response.data.next);
        })
        .catch((e) => console.error(e));
    }, 250),
    [],
  );

  const handleSearchPhraseChange = (value) => {
    setSearchPhrase(value);
    debouncedUpdateSearchPhrase(value);
  };

  const addParticipant = (userId) => {
    Alert.alert(
      'Добавить участника',
      'Вы уверены, что хотите добавить этого участника?',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Добавить',
          style: 'default',
          onPress: async () => {
            try {
              const res = await axiosInstance.post(
                `/trip-editor/${tripId}/add_editor/`,
                { editor_id: userId },
              );
              setUsers((prevData) =>
                prevData.filter((user) => user.id !== userId),
              );
            } catch {
              alert('Ошибка при добавлении участника');
            }
          },
        },
      ],
    );
  };

  return (
    <Sheet
      modal
      open={isOpen}
      snapPoints={[height - insets.bottom - 25, '50%']}
      snapPointsMode="mixed"
      onOpenChange={() => setIsOpen(false)}
      dismissOnSnapToBottom>
      <Sheet.Overlay
        backgroundColor="$color"
        opacity={0.5}
      />
      <Sheet.Handle />
      <Sheet.Frame
        borderRadius={30}
        borderBottomStartRadius={0}
        borderBottomEndRadius={0}
        borderBottomLeftRadius={0}
        borderBottomRightRadius={0}
        backgroundColor="$backgroundStrong">
        {error ? (
          <YStack
            justifyContent="center"
            flex={1}
            backgroundColor="$backgroundStrong">
            <Text textAlign="center">
              При загрузке данных произошла ошибка.
            </Text>
            <TouchableOpacity onPress={fetchUsers}>
              <Text
                color="$blue11"
                textAlign="center">
                Повторить
              </Text>
            </TouchableOpacity>
          </YStack>
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            stickyHeaderIndices={[0]}
            ListHeaderComponent={
              <YStack>
                <Text
                  textAlign="center"
                  paddingTop={15}
                  fontWeight="900"
                  fontSize="$5">
                  Пользователи
                </Text>
                <SearchBar
                  searchPhrase={searchPhrase}
                  setSearchPhrase={handleSearchPhraseChange}
                  clicked={clicked}
                  setClicked={setClicked}
                />
              </YStack>
            }
            data={users}
            keyExtractor={(item) => item.id.toString()}
            onEndReached={loadMoreUsers}
            onEndReachedThreshold={0.1}
            renderItem={renderItem}
            ItemSeparatorComponent={Separator}
            removeClippedSubviews
            windowSize={10}
            updateCellsBatchingPeriod={30}
            contentContainerStyle={{
              paddingLeft: insets.left,
              paddingRight: insets.right,
            }}
            refreshControl={
              <RefreshControl
                onRefresh={fetchUsers}
                refreshing={isRefreshing}
                tintColor={backgroundStrongColor}
              />
            }
          />
        )}
      </Sheet.Frame>
    </Sheet>
  );
});

export { AddParticipantSheet };
