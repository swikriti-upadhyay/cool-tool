import React, { Component } from 'react'
import {
    View,
    ActivityIndicator
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

export default class Loader extends Component {
    render() {
        let {color, loading, size, inline } = this.props
        if (!color)
            color = EStyleSheet.value('$primaryColor')
        size = size || 'large'
        return <View style={[loading && styles.loading, styles.inline, !inline && {flex: 1}]}>
            <ActivityIndicator size={size} color={color} />
        </View>
    }
}

const styles = EStyleSheet.create({
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        opacity: 0.5,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center'
    },
    inline: {
        justifyContent: 'center',
        alignItems: 'center'
    }
})