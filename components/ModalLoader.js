import React from 'react';
import { Modal } from 'react-native';
import { Spinner, YStack } from 'tamagui';

const ModalLoader = React.memo(() => {
  return (
    <Modal supportedOrientations={['portrait', 'landscape']}>
      <YStack
        justifyContent="center"
        flex={1}
        backgroundColor="$backgroundStrong">
        <Spinner
          size="small"
          color="$color"
        />
      </YStack>
    </Modal>
  );
});

export { ModalLoader };
