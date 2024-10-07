import React from 'react'
import {
    View,
    Alert
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import {observe} from 'mobx'
import PermissionsService from '../../utils/permissions-service';
import Text from '../components/text-component'
import BaseRenderer from './base-renderer'

import SurveyLayout from '../layout/SurveyLayout'
import SurveyButton from '../components/survey-btn-component'
import { showMessage, hideMessage } from 'react-native-flash-message';
import { questionType } from '../../datacollection/question'


class AppPermissionsRenderer extends BaseRenderer {
    get className() { return 'AppPermissionsRenderer' }

    constructor(props) {
        super(props);
        this.permissionsService = PermissionsService.instance
        this.nextAction = this.finish
        observe(this.permissionsService, change => {
            if (change.name == "isNeverAsk" && change.newValue) {
                return
            }
            if (change.newValue) { // finished
                hideMessage()
                this.finish()
            }
        })
    }

    state = {
        btnNext: 'Get permissions',
        loading: false
    }

    async start() {
        let hasOverlay = true
        if (this.isApp(this.surveyItem.survey.currentNeuroQuestionType)) {
            hasOverlay = await this.permissionsService.checkOverlayPermission()
        }
        await this.permissionsService.hasAllPermissions() && hasOverlay ? this.finish() : super.start()
    }

    grantPermissions() {
        this.setState({
            loading: true
        })
        this.permissionsService.requestStartPermissions()
        .then((hasPermission) => {
            this.setState({
                loading: false
                })
        })
        .catch((e) => {
            this.setState({
                loading: false
            })
            showMessage({
                message: 'Error',
                description: e.message,
                type: 'danger',
                duration: 10000,
                icon: 'auto'
            })
        })
    }

    restrictPermissions() {
        Alert.alert('Permissions denied', 'Go to Settings > Permissions, then allow all listed permissions.', [
            {
                text: 'Open App Settings',
                onPress: () => this.permissionsService.openAppSettings()
            }
        ])
    }

    isApp(qType) {
        return qType === questionType.App
    }

    handleNext() {
        if (this.state.loading) return
        (this.permissionsService.isGranted && this.permissionsService.recordEnabled) ? this.nextAction() : this.grantPermissions()
    }

    renderFooter() {
        return (
            <SurveyButton
                    title={this.state.btnNext}
                    onPress={() => this.handleNext()}
                    buttonStyle={styles.nextButton}
                />
        )
    }

    renderText() {
        return(
            <View>
                <Text style={styles.text}>
                    To continue you must enable all permissions
                </Text>
            </View>
        )
    }

    render() {
        return (
            <SurveyLayout
            footer={this.renderFooter()}
            loading={this.state.loading}
            >
                <View style={styles.wrapper}>
                    {this.renderText()}
                </View>
            </SurveyLayout>
        )
    }
}

const styles = EStyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: 250
    },
    text: {
        fontSize: 16,
        color: '$lightColor',
        textAlign: 'center',
        marginBottom: 15
    },
})

export default AppPermissionsRenderer