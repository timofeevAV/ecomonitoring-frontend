import React from 'react';
import { Keyboard, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input, Text, XStack, useTheme } from 'tamagui';

import CloseIcon from '../assets/icons/close.svg';
import SearchIcon from '../assets/icons/search.svg';

const SearchBar = React.memo(
  ({ clicked, searchPhrase, setSearchPhrase, setClicked, safe = false }) => {
    const theme = useTheme();
    const blue = theme.blue11.get();
    const placeholderColor = theme.placeholderColor.get();
    const color = theme.color.get();
    const insets = useSafeAreaInsets();

    return (
      <XStack
        alignItems="center"
        gap={10}
        paddingVertical={15}
        paddingLeft={safe ? insets.left : 5}
        paddingRight={safe ? insets.right : 5}>
        <XStack
          padding={10}
          backgroundColor="$background"
          bordered
          borderRadius={10}
          justifyContent="space-between"
          space={10}
          flex={1}>
          <XStack
            space={10}
            flex={1}>
            <SearchIcon fill={placeholderColor} />
            <Input
              placeholder="Поиск"
              placeholderTextColor={placeholderColor}
              value={searchPhrase}
              onChangeText={setSearchPhrase}
              onFocus={() => {
                setClicked(true);
              }}
              color={color}
              unstyled
              flex={1}
              onBlur={() => setClicked(false)}
            />
          </XStack>
          {clicked && searchPhrase !== '' && (
            <TouchableOpacity onPress={() => setSearchPhrase('')}>
              <CloseIcon fill={placeholderColor} />
            </TouchableOpacity>
          )}
        </XStack>
        {clicked && (
          <TouchableOpacity
            onPress={() => {
              Keyboard.dismiss();
              setClicked(false);
            }}>
            <Text
              color={blue}
              fontSize={16}>
              Отмена
            </Text>
          </TouchableOpacity>
        )}
      </XStack>
    );
  },
);

export { SearchBar };
