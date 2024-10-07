import React from 'react'
import {View, Switch} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import Text from './text-component'

export default class SwitchFormItem extends React.Component {
    render() {
        const lightColor = EStyleSheet.value('$lightColor'),
            secondaryColor = EStyleSheet.value('$secondaryColor'),
            secondaryDarkColor = EStyleSheet.value('$secondaryDarkColor'),
            defaultThumbColor = this.props.thumbColor || lightColor,
            defaultTrackColor = this.props.trackColor || {false: secondaryDarkColor, true: secondaryColor}


        return <View style={[styles.containerStyle, this.props.containerStyle || {}]}>
            <Text style={[styles.label, this.props.labelStyle || {}]}>{this.props.title}</Text>
            <Switch
                thumbColor={this.props.disabled? '#ccc' : defaultThumbColor}
                trackColor={this.props.disabled? '#ccc' : defaultTrackColor}
                style={[styles.switcher, this.props.switchStyle || {}]}
                onValueChange={this.props.onValueChange}
                value={this.props.value}
                disabled={this.props.disabled}/>
        </View>
    }
}

const styles = EStyleSheet.create({
    label: {
        color: '$lightColor',
        fontSize: '$fontSize',
        fontWeight: 'normal',
        marginLeft: 0, 
        marginTop: 0
    },
    switcher: {
        height: 52
    },
    containerStyle: {
        height: 52,
        flexDirection: 'row', 
        alignItems: 'center', 
        alignContent: 'space-between', 
        justifyContent: 'space-between'
    }
})