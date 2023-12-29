import { BlurView } from 'expo-blur';
import React, { memo } from 'react';
import { useColorScheme, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Separator, useTheme, XStack } from 'tamagui';

const BottomMenu = memo(
  ({
    isShow = false,
    setBlurViewHeight,
    selectAllItems = () => {},
    removeSelectedItems = () => {},
    hasSelectedItems,
  }) => {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const theme = useTheme();
    const color = theme.color.get();
    const red = theme.red11.get();
    const redTransparent = theme.red5.get();

    return isShow ? (
      <BlurView
        tint={colorScheme}
        intensity={50}
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          minHeight: insets.bottom * 2,
        }}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setBlurViewHeight(height);
        }}>
        <Separator />
        <XStack
          justifyContent="space-around"
          padding={15}>
          <TouchableOpacity onPress={selectAllItems}>
            <Text style={{ color }}>
              {hasSelectedItems ? 'Отменить выбор' : 'Выбрать все'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={removeSelectedItems}
            disabled={!hasSelectedItems}>
            <Text
              style={{
                color: hasSelectedItems ? red : redTransparent,
              }}>
              Удалить
            </Text>
          </TouchableOpacity>
        </XStack>
      </BlurView>
    ) : null;
  },
);

export { BottomMenu };
