const cryptocurrencies = ['Global Chat', 'Bitcoin', 'Solana'];

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function generateRandomDate() {
  const now = new Date();
  const pastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  return new Date(pastYear.getTime() + Math.random() * (now.getTime() - pastYear.getTime()));
}

function generateRandomSentence(minWords, maxWords) {
  const words = [
    'the',
    'be',
    'to',
    'of',
    'and',
    'a',
    'in',
    'that',
    'have',
    'I',
    'it',
    'for',
    'not',
    'on',
    'with',
    'he',
    'as',
    'you',
    'do',
    'at',
    'buy',
    'sell',
    'trade',
    'invest',
    'market',
    'crypto',
    'blockchain',
    'token',
    'wallet',
    'exchange',
  ];
  const sentenceLength = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
  let sentence = '';
  for (let i = 0; i < sentenceLength; i++) {
    sentence += words[Math.floor(Math.random() * words.length)] + ' ';
  }
  return sentence.trim() + '.';
}

function generateRandomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

function generateCryptoChatData(dataLength = 3) {
  const hasStories = Array.from({ length: Math.min(12, dataLength) }, () =>
    Math.floor(Math.random() * dataLength)
  );

  return Array.from({ length: dataLength }).map((_, index) => {
    const cryptoName = cryptocurrencies[index % cryptocurrencies.length];
    return {
      key: generateRandomString(8),
      name: `${cryptoName} Group`,
      avatar: `https://cryptologos.cc/logos/${cryptoName.toLowerCase().replace(' ', '-')}-${cryptoName.toLowerCase().replace(' ', '-')}-logo.png`,
      date: generateRandomDate(),
      message: generateRandomSentence(7, 15),
      hasStories: hasStories.includes(index),
      bg: generateRandomColor(),
    };
  });
}

const myStory = {
  key: generateRandomString(8),
  name: 'My Crypto Portfolio',
  avatar: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  date: generateRandomDate(),
  message: generateRandomSentence(7, 15),
  bg: generateRandomColor(),
  hasStories: false,
};

export { generateCryptoChatData, myStory };
