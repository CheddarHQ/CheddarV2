import React, { useMemo, useState, useEffect } from 'react';
import Animated, { LinearTransition, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Text, TextStyle, StyleSheet, View } from 'react-native';

function formatNumber(num: string) {
  if (num === '.') return '0.';
  if (num === '0.00') return '0.00';
  const parsedNum = parseFloat(num);
  if (isNaN(parsedNum)) return '0';
  return num;
}

type AnimatedTextProps = {
  style?: TextStyle;
  displayValue?: string | number;
  gradientColors?: string[];
  formatter?: Intl.NumberFormat;
};

export default function AnimatedText({
  style,
  displayValue = '0',
  gradientColors = ['black', 'transparent'],
  formatter = new Intl.NumberFormat('en-US'),
}: AnimatedTextProps) {
  const [amount, setAmount] = useState(displayValue);
  const initialFontSize = style?.fontSize ?? 124;
  const animationDuration = 300;
  const [fontSize, setFontSize] = useState(initialFontSize);

  const formattedNumbers = useMemo(() => {
    const numberString = formatNumber(String(amount));
    return numberString.split('').map((char, index) => ({
      value: char,
      key: `digit-${index}`,
    }));
  }, [amount]);

  useEffect(() => {
    setAmount(displayValue);
  }, [displayValue]);

  return (
    <Animated.View
      style={{
        height: fontSize * 1.2,
        width: '100%',
        marginBottom: 100,
      }}>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={{
          fontSize: initialFontSize,
          lineHeight: initialFontSize,
          color: 'white',
          fontWeight: 'bold',
          textAlign: 'center',
          position: 'absolute',
          top: -10000,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          opacity: 0,
        }}
        onTextLayout={(e) => {
          setFontSize(Math.round(e.nativeEvent.lines[0].ascender));
        }}>
        {formattedNumbers.map((x) => x.value).join('')}
      </Text>
      <Animated.View
        style={{
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'center',
          flex: 1,
          overflow: 'hidden',
        }}>
        <Text style={[styles.text, { fontSize }]}>₹</Text>
        {formattedNumbers.map((formattedNumber) => (
          <Animated.Text
            layout={LinearTransition.duration(animationDuration)}
            key={formattedNumber.key}
            entering={SlideInDown.duration(animationDuration).withInitialValues({
              originY: initialFontSize / 2,
            })}
            exiting={SlideOutDown.duration(animationDuration).withInitialValues({
              transform: [{ translateY: -initialFontSize / 2 }],
            })}
            style={[styles.text, style, { fontSize }]}>
            {formattedNumber.value}
          </Animated.Text>
        ))}
        {/* Static SOL text */}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  text: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Goldman',
  },
});
