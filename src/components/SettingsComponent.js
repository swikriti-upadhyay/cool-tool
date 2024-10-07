import React from 'react'
import { Alert, BackHandler } from 'react-native'
import { BaseComponent } from './BaseComponent'
import NavService from '../../utils/navigation-service'

export class SettingsComponent extends BaseComponent {
    constructor(props, handleBackPress = () => {}) {
        super(props)
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.checkChanges.bind(this))
    }

    componentWillUnmount() {
        this.backHandler.remove()
    }

    async save(callback) {
        await callback(true)
        return Promise.resolve(true)
    }

    showPopup(callback) {
        Alert.alert(
            'Settings not saved',
            'You will lose all changes if you leave this screen.',
            [
                {
                    text: "Don't Save",
                    onPress: () => NavService.back()
                },
                {
                    text: "Save",
                    onPress: () => this.save(callback)
                }
            ]
        )
    }
}