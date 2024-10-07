import EStyleSheet from 'react-native-extended-stylesheet'

import { normalizeFont } from './views/styles/font-normilize'

export { normalizeFont }

export const init = () => {
    EStyleSheet.build({
        // $outline: 1,
        $theme: 'main',
        $primaryColor: '#95BC3E',
        $primaryDarkColor: '#82b215',
        $primaryBlueColor: '#31A5C5',
        $lightBlueColor: '#1AD2D4',
        $redColor: '#ff4545',
        $redDarkColor: '#D80027',
        $secondaryColor: '#eaeaea',
        $secondaryDarkColor: '#c0c1bd',
        $lightColor: '#fff',
        $yellowColor: '#fcff38',
        $darkColor: '#222',
        $fontSize: 16,
        $smallFontSize: 10,
        $largeFontSize: 24,
        $contentWidth: 300,
        $placeholder: '#ffffff54',
        $proximaB: 'ProximaBold',
        $proximaSB: 'ProximaSbold',
        $proximaRegular: 'ProximaRegular'
    })
}

export const mainStyles = EStyleSheet.create({
    // $outline: 1,
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '$secondaryColor'
    },
    screen: {
        backgroundColor: '$primaryColor',
        paddingTop: 50,
        paddingBottom: 20
    },
    content: {
        minWidth: '$contentWidth',
        backgroundColor: 'transparent'
    },
    title: {
        fontSize: '$largeFontSize',
        textAlign: 'center',
        color: '$lightColor',
        fontFamily: '$proximaB'
    },
    disabled: {
        opacity: .2
    },
    textCenter: {
        textAlign: 'center'
    },
    textSmall: {
        fontSize: '$smallFontSize'
    },
    touchArea: {
        top: 15,
        left: 15,
        bottom: 15,
        right: 15
    },
    scrollView: {
        width: '100%',
        alignItems: 'center'
    },
    surveyLabel: {
        fontFamily: 'ProximaRegular',
        fontSize: normalizeFont(20)
    },
    btn: {
        height: 52,
        width: '100%',
        borderRadius: 8,
        justifyContent: "center",
        shadowOpacity: 0,
        shadowRadius: 0,
        shadowOffset: { height: 0, width: 0 },
        elevation:0
    },
    btnText: {
        fontSize: 20,
        fontFamily: 'ProximaSbold',
    },
    bigAndBoldText: {
        fontSize: normalizeFont(24),
        fontWeight: 'bold',
        '@media (min-width: 959) and (orientation: landscape)': {
            fontSize: 18
        }
    },
})