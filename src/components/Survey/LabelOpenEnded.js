import React from 'react';
import { View, Text } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'

import {OpenEnded} from './OpenEnded';


// function withLabelOpenEnded(WrappedComponent, data) {
class LabelOpenEnded extends React.Component {
        constructor(props) {
            super(props)
        }

        get text() {
            let { name } = this.props.item;
            if (name.length) return name.replace(/\n/g, ' ');
            return name;
        }

        render() {
            return <View style={styles.row}>
                    <Text style={styles.label}>{this.text}</Text>
                    <OpenEnded style={styles.input} {...this.props}/>
                </View>
        }
    }
// }

export {LabelOpenEnded};

const styles = EStyleSheet.create({
    row: {
        marginBottom: 25,
    },
    label: {
        marginBottom: -5,
        color: '#fff'
    },
    input: {
        flex: 1,
        width: '100%'
    }
})