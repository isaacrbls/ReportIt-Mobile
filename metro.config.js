const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure for NativeWind v2
config.transformer.babelTransformerPath = require.resolve('react-native-css-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'css');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'css'];

// Ensure proper transpilation
config.transformer.minifierConfig = {
  mangle: {
    keep_fnames: true,
  },
  output: {
    ascii_only: true,
    quote_style: 3,
    wrap_iife: true,
  },
  sourceMap: {
    includeSources: false,
  },
  toplevel: false,
  compress: {
    reduce_funcs: false,
  },
};

module.exports = config;