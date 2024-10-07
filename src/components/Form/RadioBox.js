import React, { Component } from 'react'
import { View, Text } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler';
import EStyleSheet from 'react-native-extended-stylesheet'
import Check from '@assets/images/check_ico.svg'

export default class RadioBox extends Component {

    state = {
        selected: []
    }

    _onSelect(item) {
        var selected = this.state.selected
        if(selected.indexOf(item) == -1){
            selected.push(item)
            this.setState({
                selected: selected
            })
        } else {
            selected = selected.filter(i => i != item)
            this.setState({
                selected: selected
            })
        }
        this.props.onSelected(selected)
    }

    isChecked(item) {
        return this.state.selected.includes(item);
    }

    _onPressItem(item) {
        this.setState({
            value: item.id,
        });
        this.props.onSelected(item)
    }

    render() {
        let { items, labelStyle } = this.props
        return (
            <View style={styles.group}>
            {items.map((checkbox) => {
                return <TouchableOpacity 
                            style={styles.container} 
                            onPress={()=> this._onSelect(checkbox)}
                            key={checkbox.id}>
                            <View
                                style={styles.checkbox}>
                                {this.isChecked(checkbox) && <Check style={styles.checked}/>}
                            </View>
                            <Text style={[styles.label, labelStyle]}>{checkbox.name}</Text>
                        </TouchableOpacity>
            })}
        </View>
        )
    }
}

const styles = EStyleSheet.create({
    container: {
        paddingVertical: 14,
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
        borderRadius: 3,
        backgroundColor: '$lightColor',
        marginRight: 12
    },
    checked: {
        width: 14,
        height: 10,
        resizeMode: 'contain'
    }
});