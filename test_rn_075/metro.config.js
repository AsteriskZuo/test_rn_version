const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  watchFolders: [
    '/Users/asterisk/tmp/2024-11-09/react-native-chat-sdk-1.6.3-rn72.0',
    // path.resolve(__dirname, 'node_modules/react-native-chat-sdk'),
  ],
  resolver: {
    extraNodeModules: {
      'react-native-chat-sdk': '/Users/asterisk/tmp/2024-11-09/react-native-chat-sdk-1.6.3-rn72.0',
      // 'react-native-chat-sdk': path.resolve(__dirname, 'node_modules/react-native-chat-sdk'),
    },
    // nodeModulesPaths: [
    //   '/Users/asterisk/tmp/2024-11-09/react-native-chat-sdk-1.6.3-rn72.0/node_modules',
    // ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
