import React, { Component } from 'react'
import { View, Text } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler';
import EStyleSheet from 'react-native-extended-stylesheet'
import Check from '@assets/images/check_ico_light.svg'

export default class CheckBox extends Component {

    state = {
        selected: false
    }

    _onSelect(item) {
        let isSelected = this.state.selected
        let current = isSelected ? false : true
        this.setState({
            selected: current
        }, this.props.onSelected(current))
    }

    isChecked() {
        return this.state.selected;
    }

    renderCheck() {
        let { checkIcon } = this.props
        let CustomIcon = checkIcon
        return checkIcon ? <CustomIcon style={styles.checked}/> : <Check style={styles.checked}/>
    }

    render() {
        let { labelStyle, checkBoxStyle, checkBoxStyleChecked } = this.props
        return (
            <TouchableOpacity 
                style={styles.container} 
                onPress={()=> this._onSelect()}>
                <View
                    style={[styles.checkbox, checkBoxStyle, this.isChecked() && styles.checkbox_checked, checkBoxStyleChecked]}>
                    {this.isChecked() && this.renderCheck()}
                </View>
                <Text style={[styles.label, labelStyle]}>{this.props.children}</Text>
            </TouchableOpacity>
        )
    }
}

const styles = EStyleSheet.create({
    container: {
        height: 48,
        flexDirection: 'row',
		alignItems: 'center'
    },
    label: {
        color: '$lightColor'
    },
    checkbox: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#DADADA',
        borderRadius: 3,
        backgroundColor: '$lightColor',
        marginRight: 12
    },
    checkbox_checked: {
        backgroundColor: '#95BC3E',
        borderColor: '#95BC3E'
    },
    checked: {
        width: 14,
        height: 10,
        resizeMode: 'contain'
    }
});