import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import { TextInput } from 'react-native-gesture-handler';
const negative = require('@assets/images/survey/rating/1.png')
const negativeActive = require('@assets/images/survey/rating/1-active.png')

const icons = {
    1: {
        source: require('@assets/images/survey/rating/1.png'),
        sourceActive: require('@assets/images/survey/rating/1-active.png')
    },
    2: {
        source: require('@assets/images/survey/rating/2.png'),
        sourceActive: require('@assets/images/survey/rating/2-active.png')
    },
    3: {
        source: require('@assets/images/survey/rating/3.png'),
        sourceActive: require('@assets/images/survey/rating/3-active.png')
    },
    4: {
        source: require('@assets/images/survey/rating/4.png'),
        sourceActive: require('@assets/images/survey/rating/4-active.png')
    },
    5: {
        source: require('@assets/images/survey/rating/5.png'),
        sourceActive: require('@assets/images/survey/rating/5-active.png')
    }
}

export default class Rating extends Component {
    constructor(props) {
        super(props)
        this.state = {
            current: null
        }
    }

    static defaultProps = {
        item: null,
        onSelected: null
    }

    _onPressItem(value) {
        let { id } = this.props.item
        this.setState({
            current: value
        });
        this.props.onSelected(id, value)
    }

    render() {
        let { checkedStyle, checkIcoStyle, style, labelStyle } = this.props;
        return <View style={styles.group}>
            <View style={[styles.container]}>
                {this.renderItems()}
            </View>
        </View>
    }

    renderItems() {
        let { current } = this.state;
        return Object.keys(icons).map((index, i) => (
            <TouchableOpacity
                onPress={() => this._onPressItem(index)}
                key={index}>
                    <Image 
                        source={current === index ? icons[index].sourceActive : icons[index].source}
                        style={[styles.item, (current !== null && current !== index) && styles.not_active ]} />
            </TouchableOpacity>
        ))
    }
}

const styles = EStyleSheet.create({
    // $outline: 1,
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    item: {
        width: 48,
        height: 48
    },
    not_active: {
        opacity: 0.5
    }
})