import axios from 'axios';
import { BlurView } from 'expo-blur';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import {
  TouchableOpacity,
  useColorScheme,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme, Separator, XStack, YStack, Text } from 'tamagui';

import { AddParticipantSheet } from './AddParticipantSheet';
import { EditTripNameDialog } from './EditTripNameDialog';
import AddPersonIcon from '../assets/icons/add-person.svg';
import DownloadIcon from '../assets/icons/download.svg';
import EditIcon from '../assets/icons/edit.svg';
import MenuIcon from '../assets/icons/menu.svg';

const baseURL =
  Platform.OS === 'ios'
    ? 'http://127.0.0.1:8000/api'
    : 'http://10.0.2.2:8000/api';

const TripDetailsMenu = ({ navigation, tripName, tripId }) => {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const yellow = theme.yellow11.get();
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const indent = 10;
  const [isEditTripNameDialogOpen, setIsEditTripNameDialogOpen] =
    useState(false);
  const [isAddParticipantMenuOpen, setIsAddParticipantMenuOpen] =
    useState(false);
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

  const handleChangeTitle = (tripName) => {
    navigation.setOptions({
      title: tripName,
    });
  };

  const downloadTripLog = async () => {
    try {
      const downloadInstance = FileSystem.createDownloadResumable(
        `${baseURL}/trip/${tripId}/download/`,
        FileSystem.documentDirectory + `ЖР_${tripName}_${tripId}.docx`,
      );

      const result = await downloadInstance.downloadAsync();
      Sharing.shareAsync(result.uri);
    } catch (error) {
      console.error('Ошибка при скачивании журнала рекогносцировки:', error);
    }
  };

  return (
    <>
      <TouchableOpacity onPress={openMenu}>
        <MenuIcon fill={colorScheme === 'dark' ? '#52a9ff' : '#006adc'} />
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
            <YStack
              backgroundColor="$background"
              borderRadius={indent}
              justifyContent="flex-end"
              position="absolute"
              top={menuPosition.top}
              right={menuPosition.right}>
              <XStack
                pressStyle={{ backgroundColor: '$backgroundPress' }}
                borderTopEndRadius={indent}
                borderTopStartRadius={indent}
                padding={indent}
                flex={1}
                alignItems="center"
                space={indent}
                onPress={async () => {
                  await closeMenu();
                  setIsEditTripNameDialogOpen(true);
                }}>
                <EditIcon fill={yellow} />
                <Text>Переименовать выезд</Text>
              </XStack>
              <Separator />
              <XStack
                pressStyle={{ backgroundColor: '$backgroundPress' }}
                padding={indent}
                flex={1}
                alignItems="center"
                space={indent}
                onPress={async () => {
                  await closeMenu();
                  downloadTripLog();
                }}>
                <DownloadIcon fill={yellow} />
                <Text>Скачать журнал</Text>
              </XStack>
              <Separator />

              <XStack
                pressStyle={{ backgroundColor: '$backgroundPress' }}
                borderBottomEndRadius={indent}
                borderBottomStartRadius={indent}
                padding={indent}
                alignItems="center"
                space={indent}
                onPress={async () => {
                  await closeMenu();
                  setIsAddParticipantMenuOpen(true);
                }}>
                <AddPersonIcon
                  fill={colorScheme === 'dark' ? '#52a9ff' : '#006adc'}
                />
                <Text>Добавить участников</Text>
              </XStack>
            </YStack>
          </BlurView>
        </TouchableWithoutFeedback>
      </Modal>
      <EditTripNameDialog
        tripId={tripId}
        changeTitle={handleChangeTitle}
        isOpen={isEditTripNameDialogOpen}
        setIsOpen={setIsEditTripNameDialogOpen}
      />
      <AddParticipantSheet
        tripId={tripId}
        isOpen={isAddParticipantMenuOpen}
        setIsOpen={setIsAddParticipantMenuOpen}
      />
    </>
  );
};

export { TripDetailsMenu };
