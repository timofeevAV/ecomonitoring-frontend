import axios from 'axios';
import { useState, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { Text, Tabs, View, YStack, Spinner } from 'tamagui';

import { useAuth } from '../../authProvider';
import { CharacteristicsList } from '../../components/CharacteristicsList';
import { SamplesList } from '../../components/SamplesList';
import { UniversalView } from '../../components/UniversalView';

const initHeaderHeight = 60;
const initTabHeight = 45;

const ConstructorPage = () => {
  const indent = 15;
  const [scrollY, setScrollY] = useState(0);
  const headerHeight =
    scrollY > 0
      ? initHeaderHeight - scrollY < 0
        ? 0
        : initHeaderHeight - scrollY
      : initHeaderHeight;
  const tabHeight =
    scrollY > 0
      ? initTabHeight - scrollY < 0
        ? 0
        : initTabHeight - scrollY
      : initTabHeight;

  return (
    <UniversalView lrSafe>
      <Tabs
        defaultValue="tab1"
        orientation="horizontal"
        flexDirection="column">
        <Tabs.List
          display={headerHeight === 0 ? 'none' : 'block'}
          height={headerHeight}
          justifyContent="center"
          space={indent}
          paddingBottom={indent}>
          <Tabs.Tab
            height={tabHeight}
            value="tab1"
            borderRadius={10}>
            <Text>Пробы</Text>
          </Tabs.Tab>
          <Tabs.Tab
            height={tabHeight}
            value="tab2"
            borderRadius={10}>
            <Text>Характеристики</Text>
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Content value="tab1">
          <View height="100%">
            <SamplesList setScrollY={setScrollY} />
          </View>
        </Tabs.Content>
        <Tabs.Content value="tab2">
          <View height="100%">
            <CharacteristicsList setScrollY={setScrollY} />
          </View>
        </Tabs.Content>
      </Tabs>
    </UniversalView>
  );
};

export { ConstructorPage };
