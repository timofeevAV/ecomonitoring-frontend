import React from 'react';
import { TouchableOpacity, useColorScheme } from 'react-native';

import ArrowLeftIcon from '../assets/icons/arrow-left.svg';

const GoBackBtn = React.memo(({ navigation }) => {
  const colorScheme = useColorScheme();

  return (
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <ArrowLeftIcon
        fill={colorScheme === 'dark' ? '#52a9ff' : '#006adc'}
        width={24}
        height={24}
      />
    </TouchableOpacity>
  );
});

export { GoBackBtn };
