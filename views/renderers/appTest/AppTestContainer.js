import React from 'react'
import BaseRenderer from '../base-renderer'
import { NativeEventEmitter } from 'react-native'
import format from 'date-fns/format'
import { observer } from 'mobx-react'
import {observe} from 'mobx'

import SurveyLayout from '../../layout/SurveyLayout'
import AppTestView from './AppTestView'
import Loader from '../../common/loader-view'
import ServiceRunner from '../../../ServiceExample'
import Logger from '../../../utils/logger'

@observer
export default class AppTestContainer extends BaseRenderer {
    get className() { return 'AppTestRenderer' }

    constructor(props) {
        super(props)
        observe(this.surveyItem, change => {
            if (change.newValue == 0) {
                ServiceRunner.stopService()
            }
        })
    }

    componentDidMount() {
        let eventEmitter  = new NativeEventEmitter(ServiceRunner);
        let stopEventSend = false;
        eventEmitter.addListener('btnClick', (event) => {
            if (!stopEventSend) {
                stopEventSend = true;
                this.finish()
            }
                // switch (event) {
                //     case event.name == 'stop':
                //         this.finish()
                //         break;
                // }
            }
        )
    }

    state = {
        observableItem: this.surveyItem
    }

    start() {
        ServiceRunner.startService({
            text: this.surveyItem.eyeTrackingWebSiteObjective,
            btn_text: this.props.t('continue_btn')
        })
        return super.start()
            .then(() => {
                Logger.log('App Ifno: ' + this.surveyItem.eyeTrackingWebSiteUrl)
            })
    }

    finish() {
        ServiceRunner.stopService()
        super.finish()
    }

    render() {
        const {observableItem} = this.state,
            timeLeftStr = format(observableItem.timeLeft, 'mm:ss')
        return (
            <SurveyLayout footer={<Loader color='#fff' size={40} inline/>}>
                <AppTestView handleFinish={() => this.finish()} timeLeft={timeLeftStr}/>
            </SurveyLayout>
        )
    }
}