import { FlashList } from '@shopify/flash-list';
import axios from 'axios';
import React, { useState, useCallback, useEffect } from 'react';
import { Dimensions, RefreshControl, TouchableOpacity } from 'react-native';
import { XStack, YStack, Circle, Input, useTheme, Text } from 'tamagui';

import { SampleItem } from './SampleItem';
import AddIcon from '../assets/icons/add.svg';
import { useAuth } from '../authProvider';

const SamplesList = ({ setScrollY, indent = 15 }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { height, width } = Dimensions.get('window');
  const theme = useTheme();
  const color = theme.color.get();
  const [sampleName, setSampleName] = useState('');
  const [samples, setSamples] = useState([]);
  const [characteristics, setCharacteristics] = useState([]);
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

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setScrollY(offsetY);
  };

  const fetchData = async () => {
    setError(false);
    setLoading(true);
    axios
      .all([
        axiosInstance.get('/samples/'),
        axiosInstance.get('/characteristics/'),
      ])
      .then(
        axios.spread(function (samples, characteristics) {
          setSamples(samples.data);
          setCharacteristics(characteristics.data);
        }),
      )
      .catch((error) => {
        console.error(error);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const removeCharacteristic = async (characteristic_id, sample_id) => {
    await axiosInstance
      .delete('/samplecharacteristics/delete_by_composite_key/', {
        data: { characteristic_id, sample_id },
      })
      .then(() => {
        setSamples(
          samples.map((sample) => {
            if (sample.id === sample_id) {
              return {
                ...sample,
                characteristics: sample.characteristics.filter(
                  (characteristic) => characteristic.id !== characteristic_id,
                ),
              };
            }
            return sample;
          }),
        );
      })
      .catch((error) => {
        console.error(error);
        alert('Ошибка при удалении характеристики');
      });
  };

  const addCharacteristic = async (characteristic_id, sample_id) => {
    await axiosInstance
      .post('/samplecharacteristics/', {
        сharacteristic: characteristic_id,
        sample: sample_id,
      })
      .then(() => {
        setSamples(
          samples.map((sample) => {
            if (sample.id === sample_id) {
              return {
                ...sample,
                characteristics: [
                  ...sample.characteristics,
                  characteristics.find((item) => item.id === characteristic_id),
                ],
              };
            }
            return sample;
          }),
        );
      })
      .catch((error) => {
        console.error(error);
        alert('Ошибка при удалении характеристики');
      });
  };

  const addSample = async () => {
    await axiosInstance
      .post('/samples/', { name: sampleName })
      .then((response) => {
        setSamples((prevData) => [...prevData, response.data]);
        setSampleName('');
      })
      .catch((error) => {
        console.error(error);
        alert('Ошибка при добавлении пробы');
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
      data={samples}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: indent }}
      ListHeaderComponent={
        <XStack
          space={indent}
          paddingBottom={indent}
          alignItems="center">
          <Input
            flex={1}
            placeholder="Введите имя пробы"
            maxLength={128}
            value={sampleName}
            onChangeText={setSampleName}
          />
          {Boolean(sampleName.length) && (
            <TouchableOpacity onPress={addSample}>
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
        <SampleItem
          characteristics={characteristics}
          item={item}
          indent={indent}
          removeCharacteristic={removeCharacteristic}
          addCharacteristic={addCharacteristic}
        />
      )}
    />
  );
};

export { SamplesList };
