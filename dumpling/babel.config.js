module.exports = function (api) {
  api.cache(true);

  const plugins = [
    ['module:react-native-dotenv', { moduleName: '@env', path: '.env' }],
    [
      '@tamagui/babel-plugin',
      {
        components: ['tamagui'],
        config: './tamagui.config.ts',
      },
    ],
    'react-native-reanimated/plugin',
  ];

  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
