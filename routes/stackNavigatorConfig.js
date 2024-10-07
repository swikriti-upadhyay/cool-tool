const fade = (props) => {
    const {position, scene} = props
  
    const index = scene.index
  
    const translateX = 0
    const translateY = 0
  
    const opacity = position.interpolate({
        inputRange: [index - 0.7, index, index + 0.7],
        outputRange: [0.3, 1, 0.3]
    })
  
    return {
        opacity,
        transform: [{translateX}, {translateY}]
    }
  };

const stackNavigatorConfig = {
    defaultNavigationOptions: {
      header: null,
      headerTransparent: true,
      headerMode: 'screen',
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerStyle: { borderBottomWidth: 0 },
    },
    headerLayoutPreset: 'center',
        transitionConfig: () => ({
          screenInterpolator: (props) => {
              return fade(props)
          },
          transitionSpec: {
            duration: 150,
            timing: Animated.timing,
            easing: Easing.ease,
          },
      })
  }

export { stackNavigatorConfig }