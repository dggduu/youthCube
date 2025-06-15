import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const App = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  const handlePress = (value) => {
    if (value === 'C') {
      setInput('');
      setResult('');
    } else if (value === '=') {
      try {
        // 使用 eval 来计算表达式（仅用于演示）
        const evalResult = eval(input);
        setResult(evalResult.toString());
      } catch (e) {
        setResult('Error');
      }
    } else {
      setInput((prev) => prev + value);
    }
  };

  const renderButton = (value) => (
    <TouchableOpacity style={styles.button} onPress={() => handlePress(value)}>
      <Text style={styles.buttonText}>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.display}>
        <Text style={styles.inputText}>{input || '0'}</Text>
        <Text style={styles.resultText}>{result}</Text>
      </View>

      <View style={styles.row}>
        {renderButton('7')}
        {renderButton('8')}
        {renderButton('9')}
        {renderButton('/')}
      </View>

      <View style={styles.row}>
        {renderButton('4')}
        {renderButton('5')}
        {renderButton('6')}
        {renderButton('*')}
      </View>

      <View style={styles.row}>
        {renderButton('1')}
        {renderButton('2')}
        {renderButton('3')}
        {renderButton('-')}
      </View>

      <View style={styles.row}>
        {renderButton('0')}
        {renderButton('.')}
        {renderButton('=')}
        {renderButton('+')}
      </View>

      <View style={styles.row}>
        {renderButton('C')}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#f2f2f2',
    paddingTop: 50,
    padding: 10,
  },
  display: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
    borderRadius: 10,
    minHeight: 80,
    justifyContent: 'flex-end',
  },
  inputText: {
    fontSize: 28,
    textAlign: 'right',
  },
  resultText: {
    fontSize: 24,
    color: 'gray',
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    flex: 1,
    margin: 5,
    backgroundColor: '#ddd',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
  },
  buttonText: {
    fontSize: 24,
  },
});

export default App;