import {Button} from 'react-native-elements'
import {colors} from '../../styles'
import React from 'react'
import {PixelRatio} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'


const fontKoef = 1 + (1 - PixelRatio.getFontScale())

export default class BaseButton extends React.Component {

    color = EStyleSheet.value('$darkColor')
    backgroundColor = EStyleSheet.value('$lightColor')
    borderWidth = 1

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

        if (!props.color)
            props.color = this.color
        
        if (!props.fontWeight)
            props.fontWeight = 'bold'

        if (props.icon) {
            if (!props.icon.color)
                props.icon.color = this.color
            if (!props.icon.type)
                props.icon.type = 'font-awesome'
        }

        const initialStyle = EStyleSheet.create({
            height: 55, 
            paddingLeft: 20, 
            paddingRight: 20, 
            justifyContent: 'center', 
            alignItems: 'center', 
            borderRadius: 10,
            borderColor: this.color,
            borderWidth: this.borderWidth,
            backgroundColor: this.backgroundColor
        })

        let btnStyle = props.buttonStyle 
        if (!btnStyle)
            btnStyle = {}
        if (btnStyle && btnStyle.constructor !== Array)
            btnStyle = [btnStyle]

        props.buttonStyle = [initialStyle].concat(btnStyle)
        
        if (fontKoef) {
            if (!props.titleStyle)
                props.titleStyle = { }

            if (props.titleStyle.constructor === Array) {
                let needToSetFontSize = true
                for (let i = 0; i < props.titleStyle.length; i++) {
                    if (props.titleStyle[i].fontSize) {
                        props.titleStyle[i] = this.setNormalizedFontSize(props.titleStyle[i])
                        needToSetFontSize = false
                    }
                }
                if (needToSetFontSize)
                    props.titleStyle.push(this.setNormalizedFontSize({}))
            } else {
                props.titleStyle = this.setNormalizedFontSize(props.titleStyle)
            }
        }
        props.titleStyle = [{color: this.color}, props.titleStyle]

        return <Button
            {...props}
        />
    }
}