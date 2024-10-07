import React from 'react'
import BaseButton from './base-button'
import EStyleSheet from 'react-native-extended-stylesheet'

export default class BorderButton extends BaseButton {
    color = EStyleSheet.value('$lightColor')
    backgroundColor = EStyleSheet.value('$primaryColor')
    borderWidth = 2
}