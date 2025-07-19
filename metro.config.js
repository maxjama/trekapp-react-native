const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  'react-native': path.resolve(__dirname, 'node_modules/react-native-web'),
};

// Add custom resolver to handle native-only modules
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle native-only modules for web platform
  if (platform === 'web' && moduleName === 'react-native/Libraries/Utilities/codegenNativeCommands') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/react-native-web/dist/index.js'),
      type: 'empty',
    };
  }
  
  // Fall back to default resolver
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;