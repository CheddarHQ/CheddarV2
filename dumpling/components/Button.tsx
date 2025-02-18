import { ComponentProps, forwardRef } from 'react';
//@ts-ignore
import { TamaguiElement, Text } from 'tamagui';

import { Button as TButton } from '../tamagui.config';

type ButtonProps = {
  title: string;
} & ComponentProps<typeof TButton>;

export const Buttonv = forwardRef<TamaguiElement, ButtonProps>(
  ({ title, ...tButtonProps }, ref) => {
    return (
      <TButton {...tButtonProps} ref={ref}>
        <Text fontFamily="Goldman" fontWeight={'bold'}>
          {title}
        </Text>
      </TButton>
    );
  }
);
