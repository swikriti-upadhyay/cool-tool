import {Text, PixelRatio} from 'react-native'
import {colors} from '../../styles'
import React from 'react'
import EStyleSheet from 'react-native-extended-stylesheet'

        
const fontKoef = 1 + (1 - PixelRatio.getFontScale())

export default class TextComponent extends React.Component {

    setNormalizedFontSize(styleObj) {
        let _styleObj = {}
        Object.assign(_styleObj, styleObj)

        if (!_styleObj.fontSize)
            _styleObj.fontSize = EStyleSheet.value('$fontSize')

        _styleObj.fontSize = fontKoef * _styleObj.fontSize
        return _styleObj
    }

    render() {
        let props = {}

        Object.assign(props, this.props)

        if (fontKoef !== 1) {
            if (!props.style)
                props.style = { }

            if (props.style.constructor === Array) {
                let needToSetFontSize = true
                for (let i = 0; i < props.style.length; i++) {
                    if (props.style[i].fontSize) {
                        props.style[i] = this.setNormalizedFontSize(props.style[i])
                        needToSetFontSize = false
                    }
                }
                if (needToSetFontSize)
                    props.style.push(this.setNormalizedFontSize({}))
            } else {
                props.style = this.setNormalizedFontSize(props.style)
            }
        }

        return <Text
            {...props}
        />
    }
}