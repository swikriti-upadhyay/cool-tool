import React from 'react';
import { TouchableWithoutFeedback, Keyboard, View } from 'react-native';

const withDismissKeyboardHOC = (Comp) => {
  return ({ children, ...props }) => (
    <TouchableWithoutFeedback onPress={() => console.log('press')} accessible={false}>
      <Comp {...props} />
    </TouchableWithoutFeedback>
  );
};
// const DismissKeyboardView = DismissKeyboardHOC(View)
export { withDismissKeyboardHOC }