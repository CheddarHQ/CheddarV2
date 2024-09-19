import AsyncStorage from '@react-native-async-storage/async-storage';

const saveConnectionDetails = async (connectionData) => {
  try {
    await AsyncStorage.setItem('phantomConnection', JSON.stringify(connectionData));
  } catch (error) {
    console.error('Error saving connection details:', error);
  }
};

const getConnectionDetails = async () => {
  try {
    const connectionData = await AsyncStorage.getItem('phantomConnection');
    
    return connectionData ? JSON.parse(connectionData) : null;
  } catch (error) {
    console.error('Error retrieving connection details:', error);
    return null;
  }
};

const clearConnectionDetails = async () => {
  try {
    await AsyncStorage.removeItem('phantomConnection');
  } catch (error) {
    console.error('Error clearing connection details:', error);
  }
};

export { saveConnectionDetails, getConnectionDetails, clearConnectionDetails };