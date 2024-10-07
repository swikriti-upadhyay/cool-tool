import React from 'react'
import {
    View,
    TouchableOpacity,
    ToastAndroid,
} from 'react-native'
import { Text, Button, Icon } from 'native-base'
import EStyleSheet, { value } from 'react-native-extended-stylesheet'
import isEqual from 'fast-deep-equal'
import RNRestart from 'react-native-restart'

import Layout from '../../layout/UxReality'
import Navigation from '../../layout/Navigation'
import { SettingsComponent } from '@components/SettingsComponent'
import { mainStyles, normalizeFont} from '../../../styles'
import Switch from '../../components/switch-form-item'

import Constants from '../../../constants'
import AppInfo from '../../../package.json'
import {Storages} from '../../../storage/data-storage-helper'
import NavService from '../../../utils/navigation-service'
import StyleService from '../../../utils/style-service'

export default class TechnologiesScreen extends SettingsComponent {
    constructor(props) {
        super(props)
        super.init(styles, landscapeStyles)
        // preserve the initial state in a new object
        this.baseState = {} 
        this.versionCount = 0
        this.state = {
            isReady: false
        }
    }

    checkChanges() {
        let showAlert = this.canSave()
        if (!showAlert) {
            this.showPopup(this.onSave.bind(this))
        }
        return !showAlert
    }

    componentDidMount() {
        Storages.SettingsStorage.getSettings()
            .then(settings => {
                this.setState({
                    advancedFaceValidation: settings.advancedFaceValidation,
                    builtinFaceDetection: settings.builtinFaceDetection,
                    emotionMeasurement: settings.emotionMeasurement,
                    isDebug: Constants.isDebug,
                    isReady: true,
                    saving: false
                }, () => {
                    this.baseState = {...this.state} 
                })
            })
    }

    countVersionPress() {
        let {isDebug} = this.state
        let versionCount = this.versionCount
            if(isDebug) return
            if (versionCount === 10)
            Storages.SettingsStorage.getSettings()
                    .then(settings => {
                        settings.isDebug = true
                        return Storages.SettingsStorage.update(settings)
                    })
                    .then(() => {
                        ToastAndroid.show('You are in debug mode now', ToastAndroid.SHORT)
                        RNRestart.Restart()
                    })
            else
                this.versionCount += 1
    }

    canSave() {
        return !(!isEqual(this.baseState, this.state) && !!Object.keys(this.baseState).length || false)
    }

    async onSave(needGoBack) {
        let settings = await Storages.SettingsStorage.getSettings()
        let {
            builtinFaceDetection,
            advancedFaceValidation,
            emotionMeasurement,
            isDebug,
        } = this.state
            settings.builtinFaceDetection = builtinFaceDetection
            settings.advancedFaceValidation = advancedFaceValidation
            settings.emotionMeasurement = emotionMeasurement
            settings.isDebug = isDebug
        await Storages.SettingsStorage.update(settings)
        if (needGoBack) return NavService.back()
        this.baseState = {...this.state}
        this.setState(this.baseState)
        ToastAndroid.show('Saved', ToastAndroid.SHORT)
    }

    handleBack() {
        let showAlert = this.canSave()
        if (!showAlert) {
            return this.showPopup(this.onSave.bind(this))
        }
        NavService.back()
    }

    renderNav() {
        return <Navigation
            bgColor={this.getStyle().screenColor}
            back={false}
            left={
                <Button
                    transparent
                    onPress={() => this.handleBack()}
                    >
                    <Icon name='arrow-back' />
                </Button>
            }
            heading={this.props.navigation.getParam('header', 'Settings')}
            right={
                <Button
                    transparent
                    onPress={() => this.onSave()}
                    disabled={this.canSave()}
                >
                    <Text style={{ fontSize: 16 }}>Save</Text>
                </Button>
            }
            />
    }

    renderFooter = () => {
        return(
            <View style={{ alignItems: 'center' }}>
                {this.renderVersion()}
            </View>
        )
    }

    renderVersion() {
        return (<View style={this.getStyle().versionView}>
            <TouchableOpacity onPress={() => this.countVersionPress()}>
                <Text style={{ fontSize: 12 }}>App Version {AppInfo.version}-beta</Text>
            </TouchableOpacity>
        </View>)
    }

    render() {
        const { isDebug, advancedFaceValidation, builtinFaceDetection, emotionMeasurement, withAudio} = this.state,
            redColor = EStyleSheet.value('$redColor'),
            primaryColor = EStyleSheet.value('$primaryColor'),
            lightColor = EStyleSheet.value('$lightColor'),
            switchProps = {thumbColor: lightColor, trackColor: {false: redColor, true: primaryColor}}
        return <Layout 
            bgColor={this.getStyle().screenColor}
            navigation={this.renderNav()}
            footer={this.renderFooter()}
            style={{ textAlign: 'center' }}
            stickyFooter>
                <View style={[this.getStyle().category, this.getStyle().topCategory]}>
                    <Text style={this.getStyle().categoryTitle}>TECHNOLOGIES</Text>
                    <Switch title={'Built-in Face Detection'}
                        {...switchProps}
                        onValueChange={() => { this.setState({ builtinFaceDetection: !builtinFaceDetection }) }}
                        value={builtinFaceDetection}
                        containerStyle={[this.getStyle().categoryItem, StyleService.isMobileLandscape ? {width: '100%'} : {}]}/>
                    <Switch title={'Advanced Face Validation'}
                        {...switchProps}
                        onValueChange={() => { this.setState({ advancedFaceValidation: !advancedFaceValidation }) }}
                        value={advancedFaceValidation}
                        containerStyle={[this.getStyle().categoryItem, StyleService.isMobileLandscape ? {width: '100%'} : {}]}/>
                    <Switch title={'Emotion Measurement'}
                        {...switchProps}
                        onValueChange={() => { this.setState({ emotionMeasurement: !emotionMeasurement }) }}
                        value={emotionMeasurement}
                        containerStyle={[this.getStyle().categoryItem, StyleService.isMobileLandscape ? {width: '100%'} : {}]}/>
                </View>
        </Layout>
    }
}

const styles = EStyleSheet.create({
    // $outline: 1,
    screenColor: '#31A5C5',
    switch: {
        width: '100%',
    },
    row: {
        flexDirection: 'row'
    },
    category: {
        marginTop: StyleService.moderateScale(20),
        marginBottom: 40
    },
    categoryBlock: {
        width: '100%'
    },
    categoryTitle: {
        fontSize: normalizeFont(16),
        fontFamily: 'ProximaBold',
        height: 32
    },
    btn: {
        height: 52,
        borderRadius: 8,
        justifyContent: "center",
        shadowOpacity: 0,
        shadowRadius: 0,
        shadowOffset: { height: 0, width: 0 },
        elevation:0
    },
    btnText: {
        fontSize: normalizeFont(20)
    },
    versionView: {
        top: 15,
        marginVertical: 10,
        alignSelf: 'center'
    },
})

const landscapeStyles = EStyleSheet.create({
    // '@media (min-width: 767)': {
        topCategory: {
            marginBottom: 45
        },
        category: {
            marginBottom: 5,
            flexWrap: 'wrap',
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
        },
        categoryItem: {
            width: '48%',
        },
    // }
})