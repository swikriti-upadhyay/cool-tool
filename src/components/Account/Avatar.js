import React, { Component } from 'react'
import {
    View,
    Text,
    Image
} from 'react-native'
import { withStyles } from 'react-native-styleman';

const styles = ({btn, btnText}) => ({
    btn,
    btnText,
    circle: {
      width: 80,
      height: 80,
      borderRadius: 80,
      borderWidth: 2,
      borderColor: '#DADADA',
      backgroundColor: '#ffffff',
      overflow: 'hidden'
    },
    center: {
      justifyContent: 'center',
      alignContent: 'center',
    },
    label: {
      textAlign: 'center',
      fontSize: 24,
      color: '#00bceb',
      fontFamily: 'ProximaRegular'
    },
    image: {
      width: 80,
      height: 80,
      resizeMode: 'contain',
    }
  })

class Avatar extends Component {
    static defaultProps = {
      image: "",
      label: ""
    }
    render() {
        let { styles, label, image } = this.props
        return <View style={[styles.circle, styles.center]}>
                  {image.length === 0 ? <Text style={styles.label}>{label}</Text> : <Image source={{ uri:image }} style={styles.image}/>}
                </View>
    }
}

Avatar = withStyles(styles)(Avatar)

export { Avatar }