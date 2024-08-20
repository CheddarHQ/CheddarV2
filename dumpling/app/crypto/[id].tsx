import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, SizableText, Tabs } from 'tamagui';

const moneyEx = ({ value }: { value: string }) => {
  const { id } = useLocalSearchParams();
  const [input, setInput] = useState('');

  const handlePress = (num: string) => {
    setInput((prev) => prev + num);
  };

  const handleBackspace = () => {
    setInput((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setInput('');
  };

  // Determine font size based on input length
  const dynamicFontSize = input.length > 10 ? 40 : 60;

  // Logic to render different content based on value
  let content;
  if (!id) {
    content = <Text style={styles.text}>No ID found</Text>;
  } else {
    switch (value) {
      case 'option1':
        content = <Text style={styles.text}>Content for Option 1</Text>;
        break;
      case 'option2':
        content = <Text style={styles.text}>Content for Option 2</Text>;
        break;
      default:
        content = <Text style={styles.text}>This page id is {id}</Text>;
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Dynamic Text */}
      <Text style={[styles.dynamicText, { fontSize: dynamicFontSize }]}>{input || '0'}</Text>

      {/* Number Keyboard */}
      <View style={styles.keyboard}>
        <View style={styles.row}>
          {[1, 2, 3].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.key}
              onPress={() => handlePress(num.toString())}>
              <Text style={styles.keyText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.row}>
          {[4, 5, 6].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.key}
              onPress={() => handlePress(num.toString())}>
              <Text style={styles.keyText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.row}>
          {[7, 8, 9].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.key}
              onPress={() => handlePress(num.toString())}>
              <Text style={styles.keyText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.key} onPress={handleClear}>
            <Text style={styles.keyText}>C</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handlePress('0')}>
            <Text style={styles.keyText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={handleBackspace}>
            <Text style={styles.keyText}>←</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs Section */}
      <Tabs defaultValue="tab1" style={styles.tabsContainer}>
        <Tabs.List space justifyContent="center" paddingVertical={10}>
          <Tabs.Tab value="tab1">
            <SizableText>BUY</SizableText>
          </Tabs.Tab>
          <Tabs.Tab value="tab2">
            <SizableText>SELL</SizableText>
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Content value="tab1">
          <Text style={styles.text}>{content}</Text>
        </Tabs.Content>
        <Tabs.Content value="tab2">
          <Text style={styles.text}>This is tab 2 content</Text>
        </Tabs.Content>
      </Tabs>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000', // Black background
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  dynamicText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  keyboard: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  key: {
    width: '30%', // Better responsiveness by using percentage
    height: 60,
    backgroundColor: '#555555', // Dark key background
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    color: '#FFFFFF', // White text color on keys
    fontSize: 24,
  },
  tabsContainer: {
    width: '100%',
    marginTop: 20,
    backgroundColor: '#222222', // Darker background for tabs section
    borderRadius: 10,
    paddingVertical: 10,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
  },
});

export default moneyEx;
