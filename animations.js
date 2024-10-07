import { Animated } from 'react-native'

const SCALE = {
    // this defines the terms of our scaling animation. 
    getScaleTransformationStyle(animated, startSize = 1, endSize = 0.99) {
      const interpolation = animated.interpolate({
        inputRange: [0, 1],
        outputRange: [startSize, endSize],
      });
      return {
        transform: [
          { scale: interpolation },
        ],
      };
    },
    // This defines animation behavior we expext onPressIn
   pressInAnimation(animated, config = { duration: 1000, delay: 0}, callback) {
      let { delay, duration } = config
      animated.setValue(0);
      Animated.timing(animated, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }).start(() => callback && callback(animated));
    },
    // This defines animatiom behavior we expect onPressOut
    pressOutAnimation(animated, callback, config = { duration: 1000}) {
      let { duration, delay} = config
      animated.setValue(1);
      Animated.timing(animated, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }).start((animated) => callback && callback(animated));
    },
  };

  export { SCALE };