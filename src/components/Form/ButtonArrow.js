import React, { PureComponent } from 'react'
import {
    TouchableOpacity,
    View
} from 'react-native'
import { 
    Text,
    Icon
} from 'native-base'
import EStyleSheet, { value } from 'react-native-extended-stylesheet'

import { normalizeFont} from '../../../styles'

class ButtonArrow extends PureComponent {

    static defaultProps = {
        onPress: () => {},
        showIcon: true
    }

    render() {
        let {
            title,
            styleContainer,
            onPress,
            iconStyle,
            fontSize,
            styleTitle,
            showIcon,
            children
        } = this.props
        return (
            <TouchableOpacity 
                style={[styles.item, styleContainer]}
                onPress={() => onPress()}>
                <View>
                    <Text style={[styles.text, fontSize, styleTitle]}>
                        {title}
                    </Text>
                    {children && <Text>
                        {children}
                    </Text>}
                </View>
                {showIcon && <Icon 
                    type='MaterialCommunityIcons'
                    name='chevron-right'
                    style={[styles.icon, iconStyle]}
                ></Icon>}
            </TouchableOpacity>
        )
    }
}

export { ButtonArrow }

const styles = EStyleSheet.create({
    item: {
        height: 52,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    text: {
        fontSize: normalizeFont(16)
    },
    icon: {
        marginLeft: 7,
        fontSize: 30,
        color: '#CCD1CC'
    }
})