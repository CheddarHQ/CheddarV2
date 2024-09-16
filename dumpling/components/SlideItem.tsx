import { Image, StyleSheet, Text, View, Dimensions, Animated, Easing } from 'react-native';
import React from 'react';
import Auth from './Auth';

const { width, height } = Dimensions.get('screen');

const SlideItem = ({ item }: { item: any }) => {
  const translateYImage = new Animated.Value(40);

  Animated.timing(translateYImage, {
    toValue: 0,
    duration: 1000,
    useNativeDriver: true,
    easing: Easing.bounce,
  }).start();

  return (
    <View style={styles.container}>
      <Animated.Image
        source={item.img}
        resizeMode="stretch"
        style={[
          styles.image,
          {
            transform: [
              {
                translateY: translateYImage,
              },
            ],
          },
        ]}
      />

      <View style={styles.content}>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );
};

export default SlideItem;

const styles = StyleSheet.create({
  container: {
    width,
    height,
    alignItems: 'center',
  },
  image: {
    flex: 0.6,
    width: '100%',
  },
  content: {
    flex: 0.4,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  description: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#ffffff',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
  },
});
