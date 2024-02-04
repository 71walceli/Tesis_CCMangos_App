module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'react-native-reanimated/plugin',
      {
        relativeSourceLocation: true,
      },
    ],
    "transform-inline-environment-variables",
    [
      "module-resolver",
      {
        "alias": {
          "@common": "/Common"
        }
      }
    ]
  ],
};
