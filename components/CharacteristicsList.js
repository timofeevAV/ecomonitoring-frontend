import { FlashList } from '@shopify/flash-list';
import axios from 'axios';
import React, { useState, useCallback, useEffect } from 'react';
import { Dimensions, RefreshControl, TouchableOpacity } from 'react-native';
import {
  YStack,
  Text,
  useTheme,
  Input,
  Separator,
  XStack,
  Circle,
} from 'tamagui';

import { CharacteristicItem } from './CharacteristicItem';
import AddIcon from '../assets/icons/add.svg';
import { useAuth } from '../authProvider';

const CharacteristicsList = React.memo(({ setScrollY, indent = 15 }) => {
  const [characteristics, setCharacteristics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { height, width } = Dimensions.get('window');
  const theme = useTheme();
  const color = theme.color.get();
  const placeholderColor = theme.placeholderColor.get();
  const [characteristicName, setCharacteristicName] = useState('');
  const [characteristicExpression, setCharacteristicExpression] = useState('');
  const authContext = useAuth();
  const axiosInstance = axios.create({
    baseURL:
      Platform.OS === 'ios'
        ? 'http://127.0.0.1:8000/api'
        : 'http://10.0.2.2:8000/api',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${authContext.state.accessToken}`,
    },
  });
  const fetchData = async () => {
    setError(false);
    setLoading(true);
    await axiosInstance
      .get('/characteristics/')
      .then((response) => {
        setCharacteristics(response.data);
      })
      .catch((error) => {
        console.error(error);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setScrollY(offsetY);
    // if (offsetY > tabsHeight) {
    //   setTabsHeaderVisible(false);
    // } else {
    //   setTabsHeaderVisible(true);
    // }
  };

  const addCharacteristic = async () => {
    const data = {
      name: characteristicName,
    };

    if (characteristicExpression.length) {
      data.expression = characteristicExpression;
    }

    await axiosInstance
      .post('/characteristics/', data)
      .then((response) => {
        setCharacteristics((prevData) => [...prevData, response.data]);
        setCharacteristicName('');
        setCharacteristicExpression('');
      })
      .catch((error) => {
        console.error(error);
        alert('Ошибка при добавлении характеристики');
      });
  };

  const FlashListSeparator = useCallback(() => {
    return <YStack h={indent} />;
  }, []);

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
    <FlashList
      onScroll={handleScroll}
      scrollEventThrottle={16}
      ItemSeparatorComponent={FlashListSeparator}
      estimatedItemSize={width}
      data={characteristics}
      contentContainerStyle={{ paddingBottom: indent }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <XStack
          space={indent}
          alignItems="center"
          marginBottom={indent}>
          <YStack
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius={10}
            backgroundColor="$background"
            flex={1}>
            <Input
              placeholder="Введите имя характеристики"
              borderWidth={0}
              backgroundColor="transparent"
              value={characteristicName}
              onChangeText={setCharacteristicName}
            />
            <Separator />
            <Input
              placeholder="Введите выражение"
              borderWidth={0}
              backgroundColor="transparent"
              value={characteristicExpression}
              onChangeText={setCharacteristicExpression}
            />
          </YStack>
          {Boolean(characteristicName.length) && (
            <TouchableOpacity onPress={addCharacteristic}>
              <Circle
                width={35}
                height={35}
                bordered
                backgroundColor="$background">
                <AddIcon fill={color} />
              </Circle>
            </TouchableOpacity>
          )}
        </XStack>
      }
      refreshControl={
        <RefreshControl
          onRefresh={fetchData}
          refreshing={loading}
          tintColor={color}
        />
      }
      renderItem={({ item }) => (
        <CharacteristicItem
          item={item}
          indent={indent}
        />
      )}
    />
  );
});

export { CharacteristicsList };
