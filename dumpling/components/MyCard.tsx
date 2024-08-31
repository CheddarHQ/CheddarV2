import { SizableText, XStack, YStack } from 'tamagui';

export default function MyCard({
  text,
  value,
  icon,
}: {
  text: string;
  value: string;
  icon: JSX.Element;
}) {
  return (
    <YStack
      borderWidth={2}
      borderRadius={20}
      backgroundColor={'#141414'}
      padding={20}
      width={110}
      height={80}
      alignContent="center"
      alignItems="center"
      justifyContent="center">
      <XStack alignContent="center" alignItems="center" justifyContent="center" gap={5}>
        <SizableText size="$5" color={'#fff'} fontWeight={'bold'}>
          {value}
        </SizableText>
        {icon}
      </XStack>
      <SizableText size="$2" color={'#808080'}>
        {text}
      </SizableText>
    </YStack>
  );
}