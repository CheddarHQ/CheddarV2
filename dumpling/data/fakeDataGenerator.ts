const cryptocurrencies = ['Moo Deng', 'Iggy Azalea', 'Daddy Tate', 'Fwog', 'Global Chat'];

// Hardcoded image URLs
const avatars = [
  'https://s2.coinmarketcap.com/static/img/coins/64x64/33065.png',
  'https://s2.coinmarketcap.com/static/img/coins/64x64/31510.png',
  'https://s2.coinmarketcap.com/static/img/coins/64x64/31830.png',
  'https://s2.coinmarketcap.com/static/img/coins/64x64/32507.png',
  'https://res.cloudinary.com/dm1hjrsc2/image/upload/c_thumb,w_200,g_face/v1726903021/download_na1hci.png',
];

// Hardcoded messages
const messages = ['@MOODENG', '@MOTHERIggy', '@BuyDADDY', '@FWOGChat', '@GlobalChat'];

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

function generateCryptoChatData(dataLength = 5) {
  const hasStories = Array.from({ length: Math.min(12, dataLength) }, () =>
    Math.floor(Math.random() * dataLength)
  );

  return Array.from({ length: dataLength }).map((_, index) => {
    const cryptoName = cryptocurrencies[index % cryptocurrencies.length];
    return {
      key: generateRandomString(8),
      name: `${cryptoName}`,
      avatar: avatars[index % avatars.length], // Use the hardcoded avatars
      date: generateRandomDate(),
      message: messages[index % messages.length], // Use the hardcoded messages
      hasStories: hasStories.includes(index),
    };
  });
}

const myStory = {
  key: generateRandomString(8),
  name: 'My Crypto Portfolio',
  avatar: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  date: generateRandomDate(),
  message: messages[0], // Use the first hardcoded message
  hasStories: false,
};

export { generateCryptoChatData, myStory };
