import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Accordion, XStack, Square, Text, useTheme } from 'tamagui';

import { Picker } from './Picker';
import AddIcon from '../assets/icons/add.svg';
import CloseIcon from '../assets/icons/close.svg';
import ExpandMoreIcon from '../assets/icons/expand-more.svg';

const SampleItem = ({
  characteristics,
  addCharacteristic,
  removeCharacteristic,
  item,
  indent = 15,
}) => {
  const theme = useTheme();
  const color = theme.color.get();
  const red = theme.red8.get();
  const [charId, setCharId] = useState(-1);
  const [charsForChoose, setCharsForChoose] = useState([]);

  useEffect(() => {
    setCharsForChoose(
      characteristics.filter(
        (item2) => !item.characteristics.some((item1) => item1.id === item2.id),
      ),
    );
  }, [item.characteristics]);

  return (
    <Accordion
      overflow="hidden"
      type="multiple">
      <Accordion.Item value="a1">
        <Accordion.Trigger
          borderTopStartRadius={10}
          borderTopEndRadius={10}
          borderBottomEndRadius={10}
          borderBottomStartRadius={10}
          flexDirection="row"
          justifyContent="space-between">
          {({ open }) => (
            <>
              <Text>{item.name}</Text>
              <Square
                animation="quick"
                rotate={open ? '180deg' : '0deg'}>
                <ExpandMoreIcon fill={color} />
              </Square>
            </>
          )}
        </Accordion.Trigger>
        <Accordion.Content
          borderTopStartRadius={10}
          borderTopEndRadius={10}
          borderBottomEndRadius={10}
          borderBottomStartRadius={10}
          gap={indent}>
          {item.characteristics.map((characteristic) => (
            <XStack
              key={characteristic.id.toString()}
              justifyContent="space-between">
              <Text>{characteristic.name}</Text>
              <TouchableOpacity
                onPress={() =>
                  removeCharacteristic(characteristic.id, item.id)
                }>
                <CloseIcon fill={red} />
              </TouchableOpacity>
            </XStack>
          ))}
          {Boolean(charsForChoose.length) && (
            <XStack
              alignItems="center"
              paddingRight={indent * 2}
              space={indent}>
              <Picker
                val={charId}
                setVal={setCharId}
                items={charsForChoose}
                title="Характеристики"
              />
              {charId !== -1 && (
                <TouchableOpacity
                  onPress={() => {
                    addCharacteristic(charId, item.id);
                    setCharId(-1);
                  }}>
                  <AddIcon fill={color} />
                </TouchableOpacity>
              )}
            </XStack>
          )}
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
};

export { SampleItem };
