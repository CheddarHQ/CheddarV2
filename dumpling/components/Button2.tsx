import { Text, StyleSheet, Pressable, GestureResponderEvent } from 'react-native';
const COLORS = {
  GREEN: '#21E56F',
  PURPLE: '#4E44CE',
  RED: '#EB3742',
  WHITE: '#FFF',
  GREY: 'rgb(42, 42, 42)',
  GREY_2: 'rgb(91, 91, 91)',
  DARK_GREY: 'rgb(34, 34, 34)',
  DARKER_GREY_2: 'rgb(24, 24, 24)',
  LIGHT_GREY: 'rgb(119, 119, 119)',
};

interface ButtonProps {
  onPress: (event: GestureResponderEvent) => void;
  title: string;
  disabled?: boolean;
}

export default function Button2({ title, onPress, disabled = false }: ButtonProps) {
  return (
    <Pressable
      style={disabled ? [styles.button, styles.disabled] : styles.button}
      onPress={onPress}
      disabled={disabled}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 60,
    elevation: 3,
    backgroundColor: COLORS.PURPLE,
  },
  disabled: {
    backgroundColor: COLORS.GREY_2,
  },
  text: {
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '600',
    color: COLORS.WHITE,
  },
});
