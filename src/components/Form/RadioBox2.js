import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import { TextInput } from 'react-native-gesture-handler';

export default class UICheckBoxGroup extends Component {
    constructor(props) {
        super(props)
        this.state = {
            items: [],
            current: null,
            selected: {}
        }
    }

    static defaultProps = {
        checked: false,
        onPress: null
    }

    _onPressItem(item) {
        // this.setState({
        //     selected: item,
        //     current: item.id
        // });
        this.props.onSelected(item)
    }

    handleChangeText(text, item) {
        let newAnswer = {...item};
        newAnswer.value = text
        this.props.onChange(newAnswer)
    }

    render() {
        let { current, data } = this.props;
        let { checkedStyle, checkIcoStyle, style, itemStyle, labelStyle } = this.props;
        return <View style={styles.group}>
            <TouchableOpacity 
                style={[styles.container, itemStyle]} 
                onPress={() => this._onPressItem(data)}>
                <View
                    style={[styles.circle, current ? checkedStyle : style]}>
                    {current && <View style={[styles.checkedCircle, checkIcoStyle]} />}
                </View>
                <Text style={styles.label}>{this.props.text}</Text>
            </TouchableOpacity>
        </View>
    }
}

const styles = EStyleSheet.create({
    // $outline: 1,
    container: {
        height: 48,
        flexDirection: 'row',
		alignItems: 'center'
    },
    checkbox: {
        width: 12,
        height: 12,
        borderRadius: 12 / 2,
    },
    circle: {
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        width: 20,
        height: 20,
        borderRadius: 20 / 2,
        backgroundColor: '$lightColor'
    },
    checkedCircle: {
		width: 14,
		height: 14,
		borderRadius: 7,
		backgroundColor: '#32C1E9',
    },
    label: {
        color: '$darkColor'
    }
})