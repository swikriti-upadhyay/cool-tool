import { Text } from 'react-native'
import React from 'react'
import { withStyles } from 'react-native-styleman';

const styles = ({$lightColor}) => ({
    text: {
        color: $lightColor,
        fontFamily: "ProximaRegular"
    }
})

let _Text = (props) => {
    var {children, styles, style, ...newProps} = props;
    return <Text style={[styles.text, style]} {...newProps}>{children}</Text>
}

_Text = withStyles(styles)(_Text)
export { _Text as Text }