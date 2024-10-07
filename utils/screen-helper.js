import {Dimensions, StatusBar} from 'react-native'

export default class ScreenHelper {

    static getScreenData() {//get new screen data on every data collection start
        let rawScreen = Dimensions.get('screen'),
            rawWindow = Dimensions.get('window'),
            window = {},//Dimensions.get('window'),
            screen = {},//Dimensions.get('screen'),
            scale = 1//rawScreen.scale

        Object.assign(window, rawWindow)
        Object.assign(screen, rawScreen)

        screen.x = 0
        screen.y = 0
        screen.height = parseInt((Math.ceil(screen.height / 2) * 2))
        screen.width = parseInt((Math.ceil(screen.width / 2) * 2))

        //TODO: dimensions could be incorect for Galaxy S8, Note 8 and any other device that can hide android hardware buttons
        window.x = 0
        window.y = StatusBar.currentHeight
        window.height = parseInt((Math.ceil(window.height / 2) * 2)) - StatusBar.currentHeight
        window.width = parseInt((Math.ceil(window.width / 2) * 2))
        let __screenData = {
            window,
            screen,
            scale,
            statusHeight: StatusBar.currentHeight
        }
        return __screenData
    }
}