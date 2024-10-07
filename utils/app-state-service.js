import {action, observable} from 'mobx'
import {AppState} from 'react-native'

export default class AppStateService {
    @observable currentState = ''
    
    @action
    appStateChange(nextAppState) {
        if (AppStateService.__instance.currentState.match(/inactive|background/) && nextAppState === 'active') {
            AppStateService.__instance.currentState = 'active'
        } else {
            AppStateService.__instance.currentState = 'background'
        }
    }

    static init() {
        if (AppStateService.__instance == null) {
            AppStateService.__instance = new AppStateService()
            AppStateService.__instance.currentState = AppState.currentState
            AppState.addEventListener('change', AppStateService.__instance.appStateChange)
        } 
    }

    static get instance() {
        return AppStateService.__instance
    }
}