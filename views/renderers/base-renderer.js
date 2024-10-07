import {colors} from '../../styles'
import React from 'react'
import { View, BackHandler } from 'react-native'
import Text from '../components/text-component'
import { instanceOf } from 'prop-types'
import { BaseSurveyItem } from '../../datacollection/survey-items'
import NavService from '../../utils/navigation-service'
import Logger from '../../utils/logger';

export default class BaseRenderer extends React.Component {

    static defaultProps = {
        surveyItem: {
            respUpload: {
                error: false
            },
            survey: {
                hasNeuroQuestions: true
            }
        }
    }

    get surveyItem() {
        return this.props.surveyItem
    }

    start(extraData) {
        if(this.props.surveyItem) {
            Logger.log(`Open: ${this.className}`)
            Logger.syncToServer()
        }
        return this.props.surveyItem.start(extraData)
    }

    finish(extraData, skipReason) {
        if(this.props.surveyItem) {
            Logger.log(`Close: ${this.className}`)
        }
        return this.props.surveyItem.finish(extraData, skipReason)
    }

    cancel() {
        if(this.props.surveyItem) {
            Logger.log(`Cancel: ${this.className}`)
        }
        return this.props.surveyItem.cancel()
    }

    skipParent() {
        if(this.props.surveyItem) {
            Logger.log('Skip parent')
        }

        return this.props.surveyItem.skipParent()
    }

    closeApp() {
        BackHandler.exitApp();
    }

    goMain() {
        this.finish()
          .then(() => NavService.resetAction('Enter'))
    }

    goHome() {
        NavService.resetAction('Home', { screenName: 'Recordings' })
    }

    render() {
        return <View>
            <Text>BaseRenderer</Text>
        </View>
    }
}

BaseRenderer.propTypes = {
    surveyItem: instanceOf(BaseSurveyItem).isRequired
}