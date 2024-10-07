import React from 'react'
import {
    View,
    StyleSheet,
    ToastAndroid,
    BackHandler
} from 'react-native'
import Text from './components/text-component'

import {observer} from 'mobx-react'
import KeepAwake from 'react-native-keep-awake'
import {Storages} from '../storage/data-storage-helper'
import Loader from './common/loader-view'
import {TouchEventType} from '../data/touch-event-data'
import SurveyProxy from '../datacollection/survey-proxy'
import PrimaryButton from './components/primary-btn-component'
import SurveyItemRendererResolver from '../datacollection/renderer-resolver'
import Logger from '../utils/logger'
import {SurveyItemState} from '../datacollection/survey-items'
import Survey from '../datacollection/survey'
import EStyleSheet from 'react-native-extended-stylesheet'

// Utils
import Disposer from '../utils/disposer'

@observer
export default class SurveyView extends SurveyProxy {

    constructor(props) {
        super(props)
        // NavService.setAndroidStatusBarColor('default')
        this.surveyMetaData = this.props.navigation.getParam('surveyMetaData')
        this.survey = Survey.getNewSurvey(this.surveyMetaData)
        this.survey.addListener('surveyItemChanged', () => {
            let renderer = null
            if (this.survey?.currentSurveyItem) {
                renderer = SurveyItemRendererResolver.getRenderer(this.survey.currentSurveyItem, (ref) => this.onRendererRef(ref), {
                    onMessage: (e) => this.onMessage(e),
                    onNavigationChanged: (e) => this.navigationChanged(e),
                    translation: this.props.screenProps.t
                })
                this.setState({
                    currentItem: renderer
                })
            }
        })
    }

    state = {
        isReady: false, 
        survey: null,
        currentItem: null
    }

    handleBackPress = () => {
        const { currentItem } = this.state
        if (!__DEV__ && currentItem?.props?.surveyItem.disableBack) {
            ToastAndroid.show('You cannot quit while survey is running', ToastAndroid.SHORT)
            return true
        }
    }

    componentDidMount() {
        KeepAwake.activate()
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
    }

    onLayoutHandler(event) {
        this.survey.layout = event.layout
        if (!this.isStarted) {
            this.isStarted = true
            this.survey.run()
        }
    }

    componentWillUnmount() {
        Logger.log('Close: Survey_view')
        this.survey.destroy()
        this.surveyMetaData = null
        this.survey = null
        this.backHandler.remove()
        KeepAwake.deactivate()
        Disposer.disposeTrackers()
    }

    onRendererRef(ref) {
        if (ref != null) {
            ref.start()
        }
    }

    render() {
        const {error, currentItem} = this.state,
            inProgress = !currentItem || currentItem.props.surveyItem.state !== SurveyItemState.Running
        if (error) {
            return (<View style={styles.container}>
                <Text>{error}</Text>
                <PrimaryButton
                    title="Skip"
                    onPress={() => this.showNewInterviewPage()}
                />
            </View>)
        } else {
            return (<View style={{flex: 1}}
                          onTouchStart={(e) => this.onTouchEvent(TouchEventType.TouchStart, e.nativeEvent)}
                          onTouchMove={(e) => this.onTouchEvent(TouchEventType.TouchMove, e.nativeEvent)}
                          onTouchCancel={(e) => this.onTouchEvent(TouchEventType.TouchCancel, e.nativeEvent)}
                          onTouchEnd={(e) => this.onTouchEvent(TouchEventType.TouchStop, e.nativeEvent)}
                          onLayout={({nativeEvent}) => this.onLayoutHandler(nativeEvent)}>
                    {currentItem}
                    {inProgress && 
                        <View style={styles.progressStyle}>
                            <Loader/>
                        </View>}
            </View>)
        }
    }
}

const styles = EStyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '$lightColor',
    },
    progressStyle: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        backgroundColor: '$lightColor',
        elevation: 1000
    }
})