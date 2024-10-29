module.exports = function (api) {
  api.cache(true);

  const plugins = [
    [
      '@tamagui/babel-plugin',
      {
        components: ['tamagui'],
        config: './tamagui.config.ts',
      },
    ],
    [
      'module-resolver',
      {
        alias: {
          crypto: 'react-native-crypto',
          events: 'events', // Add this line
        },
      },
    ],
    'react-native-reanimated/plugin',
  ];

  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
