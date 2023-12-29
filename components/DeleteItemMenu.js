import { BlurView } from 'expo-blur';
import { useState } from 'react';
import {
  Modal,
  TouchableWithoutFeedback,
  useColorScheme,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Button, useTheme } from 'tamagui';

import MoreHorizIcon from '../assets/icons/more-horiz.svg';
const DeleteItemMenu = ({ deleteSomething }) => {
  const theme = useTheme();
  const color = theme.color.get();
  const colorScheme = useColorScheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const openMenu = async (e) => {
    await setMenuPosition({
      top: e.nativeEvent.pageY,
      right: Dimensions.get('window').width - e.nativeEvent.pageX,
    });
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={{ flex: 1, alignItems: 'flex-end' }}
        onPress={openMenu}>
        <MoreHorizIcon fill={color} />
      </TouchableOpacity>
      <Modal
        transparent
        visible={menuVisible}
        onRequestClose={closeMenu}
        supportedOrientations={['portrait', 'landscape']}>
        <TouchableWithoutFeedback onPress={closeMenu}>
          <BlurView
            tint={colorScheme === 'dark' ? 'light' : 'dark'}
            intensity={25}
            style={{ flex: 1 }}>
            <Button
              position="absolute"
              top={menuPosition.top}
              right={menuPosition.right}
              backgroundColor="$backgroundStrong"
              color="red"
              onPress={async () => {
                await setMenuVisible(false);
                deleteSomething();
              }}>
              Удалить
            </Button>
          </BlurView>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

export { DeleteItemMenu };
