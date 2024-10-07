import React from 'react'
import BaseButton from './base-button'
import EStyleSheet from 'react-native-extended-stylesheet'

export default class SurveyButton extends BaseButton {
    color = EStyleSheet.value('$primaryColor')
    backgroundColor = EStyleSheet.value('$lightColor')
    borderWidth = 0
}