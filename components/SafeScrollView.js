import React from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'tamagui';

const SafeScrollView = React.memo(
  ({
    children,
    yCenter,
    allSafe,
    lrSafe,
    lrIndent = 0,
    tbIndent = 0,
    ...props
  }) => {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const backgroundStrong = theme.backgroundStrong.get();

    const allSidesSafeStyles = {
      paddingTop: insets.top + tbIndent,
      paddingBottom: insets.bottom + tbIndent,
      paddingLeft: insets.left + lrIndent,
      paddingRight: insets.right + lrIndent,
    };

    const lrSidesSafeStyles = {
      paddingLeft: insets.left + lrIndent,
      paddingRight: insets.right + lrIndent,
    };

    return (
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={[{ backgroundColor: backgroundStrong }, props]}
        contentContainerStyle={[
          allSafe ? allSidesSafeStyles : null,
          lrSafe ? lrSidesSafeStyles : null,
          {
            flexGrow: yCenter ? 1 : 0,
            justifyContent: yCenter ? 'center' : 'flex-start',
          },
        ]}>
        {children}
      </KeyboardAwareScrollView>
    );
  },
);

export { SafeScrollView };
