import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ListItem } from 'tamagui';

import { formatDate } from '../utils/format';

const TripItem = React.memo(
  ({ item, isEditing, isSelected, toggleItemSelection }) => {
    const navigation = useNavigation();

    return (
      <ListItem
        title={item.name}
        subTitle={`Последнее изменение: ${formatDate(item.updatedAt)}`}
        borderRadius={10}
        bordered
        pressTheme
        backgroundColor={isSelected ? '$backgroundPress' : '$background'}
        onPress={() => {
          if (isEditing) {
            toggleItemSelection(item.id);
          } else {
            navigation.navigate('trip-details', {
              tripId: item.id,
              title: item.name,
            });
          }
        }}
      />
    );
  },
);

export { TripItem };
