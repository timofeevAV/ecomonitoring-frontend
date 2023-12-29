import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'tamagui';

const UniversalView = React.memo(
  ({
    children,
    allSafe = false,
    lrSafe = false,
    xCenter = false,
    yCenter = false,
    ...props
  }) => {
    const insets = useSafeAreaInsets();

    const allSidesSafeStyles = {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    };

    const lrSidesSafeStyles = {
      paddingLeft: insets.left,
      paddingRight: insets.right,
    };

    return (
      <Stack
        justifyContent={yCenter ? 'center' : 'flex-start'}
        alignItems={xCenter ? 'center' : 'stretch'}
        backgroundColor="$backgroundStrong"
        flex={1}
        style={[
          allSafe ? allSidesSafeStyles : null,
          lrSafe ? lrSidesSafeStyles : null,
          props,
        ]}>
        {children}
      </Stack>
    );
  },
);

export { UniversalView };
