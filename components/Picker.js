import React from 'react';
import { Adapt, Select, Sheet, useTheme } from 'tamagui';

import Check from '../assets/icons/check.svg';

const Picker = ({ title = 'default title', val, setVal, items }) => {
  const theme = useTheme();
  const color = theme.color.get();

  return (
    <Select
      value={val}
      onValueChange={(value) => {
        setVal(value);
      }}
      disablePreventBodyScroll>
      <Select.Trigger>
        <Select.Value placeholder="Something" />
      </Select.Trigger>
      <Adapt
        when="sm"
        platform="touch">
        <Sheet
          modal
          dismissOnSnapToBottom
          animationConfig={{
            type: 'direct',
            damping: 20,
            mass: 1.2,
            stiffness: 250,
          }}>
          <Sheet.Frame>
            <Sheet.ScrollView>
              <Adapt.Contents />
            </Sheet.ScrollView>
          </Sheet.Frame>
          <Sheet.Overlay
            animation="100ms"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Sheet>
      </Adapt>
      <Select.Content zIndex={200000}>
        <Select.Viewport>
          <Select.Group>
            <Select.Label>{title}</Select.Label>
            {items.map((item) => {
              return (
                <Select.Item
                  index={item.id}
                  key={item.name}
                  value={item.id}>
                  <Select.ItemText>{item.name}</Select.ItemText>
                  <Select.ItemIndicator marginLeft="auto">
                    <Check fill={color} />
                  </Select.ItemIndicator>
                </Select.Item>
              );
            })}
          </Select.Group>
        </Select.Viewport>
      </Select.Content>
    </Select>
  );
};

export { Picker };
