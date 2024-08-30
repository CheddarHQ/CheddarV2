import React, { forwardRef } from 'react';
import { Button, ButtonProps } from 'react-native';

type ForwardedButtonProps = ButtonProps & {
  title : string
};

const ForwardedButton = forwardRef<Button, ForwardedButtonProps>((props, ref) => (
  <Button {...props} ref={ref} />
));

export default ForwardedButton;