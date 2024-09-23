
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import React from 'react';

export const Text = ({ style, ...props }: RNTextProps) => {
  return <RNText style={[{ fontFamily: 'Goldman_400Regular' }, style]} {...props} />;
};
