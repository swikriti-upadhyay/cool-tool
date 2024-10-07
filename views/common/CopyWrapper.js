import React from 'react'
import {
    TouchableOpacity,
    Text,
    Clipboard,
    ToastAndroid } from 'react-native'
import { Icon } from 'native-base'
import EStyleSheet from 'react-native-extended-stylesheet'

const copyText = (text) => {
    Clipboard.setString(text)
    ToastAndroid.show('Copied', ToastAndroid.SHORT)
}
export function CopyWrapper({text}) {
    if (text)
        return (
            <TouchableOpacity onPress={() => copyText(text)} style={styles.container}>
                <Text>{text}</Text>
                <Icon 
                    type='MaterialCommunityIcons'
                    name='content-copy'
                    style={styles.icon} />
            </TouchableOpacity>
        )
    return null
}

const styles = EStyleSheet.create({
    container: {
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "row"
    },
    icon: {
        marginLeft: 5,
        fontSize: 15
    }
})