import { ListItem } from 'tamagui';

const CharacteristicItem = ({ item }) => {
  return (
    <ListItem
      borderRadius={10}
      bordered
      pressTheme
      title={item.name}
    />
  );
};

export { CharacteristicItem };
