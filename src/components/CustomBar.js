import React from 'react'
import { View, StatusBar } from 'react-native'
import { withStyles } from 'react-native-styleman';


const styles = ({ $lightColor }) => ({
    tabbar: {
      position: 'absolute',
    //   top: 10, //platform === "android" ? StatusBar.currentHeight : undefined,,
      top: 10, //StatusBar.currentHeight + 10,
      height: 40,
      left: 0,
      right: 0,
      // height: 56,
      justifyContent: 'center', alignItems: 'center',
      elevation: 99,
      // '@media': [
      //   {
      //       orientation: 'landscape',
      //       minWidth: 320,
      //       maxWidth: 851,
      //       styles: {
      //         top: 4, //12
      //       }
      //   },
      //   ]
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 8,
      borderColor: $lightColor, 
      borderWidth: 1, 
      marginLeft: 10, 
      marginRight: 10
    },
    activeDot: {
      backgroundColor: $lightColor
    }
})

const Dot = ({styles, itemIndex, currentIndex}) => {
    let isCurrent = itemIndex === currentIndex
    let currentStyle = isCurrent && styles.activeDot
    return (<View style={[styles.dot, currentStyle]} />)
}

const DotStyled = withStyles(styles)(Dot)

const CustomBar = ({ styles, navigation }) => {
  
    const { routes } = navigation.state;
    return (
      <View style={styles.tabbar}>
        <View style={{ flexDirection: 'row', }}>
          {
            routes.map((route, key) => {
            return <DotStyled itemIndex={key} currentIndex={navigation.state.index} key={route.key} />
          })}
        </View>
      </View>
    )
  }

  export default withStyles(styles)(CustomBar)