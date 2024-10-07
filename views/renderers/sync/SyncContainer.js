import React from 'react'
import { Button } from 'native-base'
import { mainStyles } from '../../../styles'
import {
    View,
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import Text from '../../components/text-component'
import BaseRenderer from '../base-renderer'
import { observer } from 'mobx-react'
import {observe} from 'mobx'
import ImgClose from '@assets/images/close.svg'
import DataUploader, { UploadState } from '../../../sync/data-uploader'
import NetInfoService from '../../../utils/connectionInfo'

import SurveyLayout from '../../layout/SurveyLayout'
import SyncView from './SyncView'

@observer
export default class SyncRenderer extends BaseRenderer {
    get className() { return 'SyncRenderer' }
    
    constructor(props) {
        super(props)
        observe(NetInfoService.instance, change => {
            console.log(props.surveyItem?.respUpload?.state, change.newValue)
            if (props.surveyItem?.respUpload?.state === UploadState.Error && change.newValue) {
                this.restart()
            }
        })
        this.state = {
            canceling: false,
            uploader: {
                currentUploadPercentage: 0,
                totalUploadPercentage: 0,
                currentStep: 1,
                currentJob: '',
            }
        }
    }

    start() {
        super.start()
            .then(() => {
                this.setState({
                    uploader: DataUploader.getInstance()
                })
            })
    }

    restart() {  
        this.surveyItem.restartUploading()
    }

    cancelSync() {
        this.setState({canceling: true}, () => {
            this.surveyItem.cancel()
            this.setState({canceling: false})
        })
    }

    renderSkip() {
        const {uploader} = this.state
        return (
            <View>
                <Button 
                    style={[mainStyles.btn, {width: '100%'}]}
                    onPress={() => this.cancelSync()}
                    disabled={this.state.canceling}  light full>
                        <ImgClose style={styles.close} />
                        <Text style={[mainStyles.btnText, {color: '#95BC3E'}]}>Processing in background</Text>
                </Button>
            </View>
        )
    }
    
    render() {
        const {uploader} = this.state
        return (
            <SurveyLayout footer={!(this.props.surveyItem.survey.isGuest) ? this.renderSkip() : null}>
                <SyncView 
                    isGuest={this.props.surveyItem.survey.isGuest}
                    uploader={uploader}
                    progress={uploader?.currentUploadPercentage}
                    totalProgress={uploader?.totalUploadPercentage}
                    currentStep={uploader?.currentStep}
                    currentJob={uploader?.currentJob}
                    isCanceling={this.state.canceling}
                    surveyItem={this.surveyItem}
                    handleRetry={() => this.restart()}
                />
            </SurveyLayout>
        )
    }
}

const styles = EStyleSheet.create({
    close: {
        width: 16,
        height: 16,
        marginRight: 12,
        resizeMode: 'contain'
    }
})