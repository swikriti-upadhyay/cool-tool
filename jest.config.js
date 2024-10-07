module.exports = {
  "setupFiles": [
    "./testenv.js"
  ],
  "preset": "react-native",
    "collectCoverage": true,
    "coverageDirectory": "__coverage__",
    "transformIgnorePatterns": [
      "node_modules/(?!react-native|native-base|react-navigation|react-native-fabric|react-native-paper)"
    ]
}