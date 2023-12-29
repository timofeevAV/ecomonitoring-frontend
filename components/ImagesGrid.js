import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Modal, useColorScheme, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YStack, XStack, View, Button, useTheme } from 'tamagui';

const numColumns = 3;

const ImagesGrid = React.memo(
  ({ deleteImage, deleteImages, uploadImages, takePhoto, images, indent = 15 }) => {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const [selectedImage, setSelectedImage] = useState(null);
    const theme = useTheme();
    const red = theme.red8.get();
    const redTransparent = theme.red7.get();
    const { height, width } = Dimensions.get('window');
    const isLandscape = Boolean(width > height);
    const imgSize = isLandscape
      ? (width - (insets.left + insets.right) - indent * (numColumns + 1)) /
        numColumns
      : (width - indent * (numColumns + 1)) / numColumns;

    return (
      <YStack gap={images.length ? indent : 0}>
        <XStack
          flexWrap="wrap"
          gap={indent}>
          {images.map((image) => {
            return (
              <View
                key={image.id.toString()}
                w={imgSize}
                h={imgSize}
                onLongPress={() => setSelectedImage(image)}>
                <Image
                  source={{ uri: image.photo }}
                  style={{ width: '100%', height: '100%' }}
                  placeholder={image?.blurhash}
                  contentFit="cover"
                />
              </View>
            );
          })}
        </XStack>
        <XStack columnGap={indent} rowGap={indent} flexWrap='wrap' justifyContent='center'>
          {images.length ? (
            <Button
              backgroundColor={red}
              pressStyle={{ backgroundColor: redTransparent }}
              onPress={deleteImages}>
              Очистить
            </Button>
          ) : null}
          <Button
            onPress={uploadImages}>
            Загрузить
          </Button>
          <Button
            onPress={takePhoto}>
            Сделать фото
          </Button>
        </XStack>
        <Modal
          animationType="fade"
          visible={selectedImage !== null}
          onRequestClose={() => setSelectedImage(null)}
          transparent
          supportedOrientations={['portrait', 'landscape']}>
          <BlurView
            tint={colorScheme === 'dark' ? 'light' : 'dark'}
            intensity={25}
            style={{
              flex: 1,
            }}>
            <ReactNativeZoomableView
              maxZoom={2.5}
              minZoom={1}
              bindToBorders
              onPanResponderEnd={(
                event,
                gestureState,
                zoomableViewEventObject,
              ) => {
                if (
                  (zoomableViewEventObject.offsetY > 50 ||
                    zoomableViewEventObject.offsetY < -50) &&
                  zoomableViewEventObject.zoomLevel == 1
                ) {
                  setSelectedImage(null);
                }
              }}>
              <Image
                source={{ uri: selectedImage?.photo }}
                style={{ width: '100%', height: '100%' }}
                contentFit="contain"
              />
            </ReactNativeZoomableView>
            <XStack
              alignSelf="center"
              space
              position="absolute"
              bottom={insets.bottom}>
              <Button
                backgroundColor={red}
                onPress={() =>
                  deleteImage(selectedImage?.id).then(() =>
                    setSelectedImage(null),
                  )
                }
                pressStyle={{ backgroundColor: redTransparent }}>
                Удалить
              </Button>
              <Button onPress={() => setSelectedImage(null)}>Закрыть</Button>
            </XStack>
          </BlurView>
        </Modal>
      </YStack>
    );
  },
);

export { ImagesGrid };
