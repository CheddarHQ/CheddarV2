import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

const moneyEx = ({ value }: { value: string }) => {
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

  // Logic to render different content based on value
  let content;

  switch (value) {
    case 'option1':
      content = <Text style={styles.text}>Content for Option 1</Text>;
      break;
    case 'option2':
      content = <Text style={styles.text}>Content for Option 2</Text>;
      break;
    default:
      content = <Text style={styles.text}>Default Content</Text>;
  }

  return (
    <View style={styles.container}>
      {content}

      {/* Input Bar */}
      <TextInput
        value={input}
        style={styles.input}
        placeholder="Enter number"
        keyboardType="numeric"
        editable={false} // Make it read-only if only using the keyboard
      />

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000', // Black background
  },
  input: {
    width: '80%',
    height: 50,
    backgroundColor: '#000000', // Dark background for input
    color: '#FFFFFF', // White text color
    borderRadius: 10,
    paddingHorizontal: 15,
    marginVertical: 100,
    fontSize: 50,
    fontWeight: 'bold',
  },
  keyboard: {
    width: '80%',
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  key: {
    width: 70,
    height: 70,
    backgroundColor: '#000000', // Dark key background
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    color: '#FFFFFF', // White text color on keys
    fontSize: 24,
  },
  text: {
    color: '#FFFFFF', // White text color for dynamic content
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default moneyEx;
