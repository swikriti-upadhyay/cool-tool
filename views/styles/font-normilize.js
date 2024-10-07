import {PixelRatio} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

export const fontKoef = 1 + (1 - PixelRatio.getFontScale())

export const setNormalizedFontSize = (styleObj)=> {
    let _styleObj = {}
    Object.assign(_styleObj, styleObj)

    if (!_styleObj.fontSize)
        _styleObj.fontSize = EStyleSheet.value('$fontSize')

    _styleObj.fontSize = fontKoef * _styleObj.fontSize
    return _styleObj
}

export const normalizeFont = (size) => {
    const fontKoef = 1 + (1 - PixelRatio.getFontScale());
    return fontKoef * size;
}