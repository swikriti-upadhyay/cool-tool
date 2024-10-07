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
import Config from 'react-native-config';

import Layout from '../../layout/UxReality'
import Navigation from '../../layout/Navigation'
import { BaseComponent } from '@components/BaseComponent'
import { ButtonArrow } from '@components/Form/ButtonArrow'
import FloatingLabelInput from '@components/FloatingLabelInput'
import { mainStyles, normalizeFont} from '../../../styles'

import AppInfo from '../../../package.json'
import {Storages} from '../../../storage/data-storage-helper'
import NavService from '../../../utils/navigation-service'
import StyleService from '../../../utils/style-service'
import Constants from '../../../constants'
import {deviceInfo} from '../../../utils/device-info-service'
import {CopyWrapper} from '../../common/CopyWrapper'
import {auth} from '../../../services/AuthService'
import {observer} from 'mobx-react'
import withStore from '../../../store/withStore'

@observer
class DebuggingScreen extends BaseComponent {
    constructor(props) {
        super(props)
        super.init(styles, landscapeStyles)
        this.state = {
            isReady: false,
            macId: 0
        }

        // preserve the initial state in a new object
        this.baseState = {} 
        this.versionCount = 0
    }

    componentDidMount() {
        Storages.SettingsStorage.getSettings()
            .then(settings => {
                this.setState({
                    serverUrl: settings.serverUrl,
                    shakeDegree: settings.shakeDegree,
                    isReady: true,
                    saving: false
                }, () => {
                    this.baseState = {...this.state} 
                })
            })
        deviceInfo.getMACAddress().then(macId => this.setState({macId}))
    }

    async onSave() {
        if (!JSON.parse(Config.CAN_EDIT_API)) {
            ToastAndroid.show('You can\'t edit in release mode', ToastAndroid.SHORT)
            return
        }
        let settings = await Storages.SettingsStorage.getSettings()
        let {
            serverUrl,
            shakeDegree
        } = this.state
            settings.serverUrl = serverUrl
            Constants.serverUrl = serverUrl
            settings.shakeDegree = shakeDegree
            Constants.shakeDegree = shakeDegree
        await Storages.SettingsStorage.update(settings)
        this.baseState = {...this.state}
        this.setState(this.baseState)
        ToastAndroid.show('Saved', ToastAndroid.SHORT)
        auth.signOut(()=>NavService.resetAction('Login'))
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

    renderNav() {
        return <Navigation
            bgColor={this.getStyle().screenColor}
            back={false}
            left={
                <Button
                    transparent
                    onPress={() => NavService.back()}
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
            <Button style={[styles.btn]} light full onPress={() => auth.toggleToStarter()}>
                <Text style={[styles.btnText, {color: '#31A5C5'}]} returnKeyType='send'>Toggle Starter</Text>
            </Button>
        </View>)
    }

    render() {
        const { serverUrl, shakeDegree, macId } = this.state;
        return <Layout 
            bgColor={this.getStyle().screenColor}
            navigation={this.renderNav()}
            footer={this.renderFooter()}
            style={{ textAlign: 'center' }}
            stickyFooter>
                <View style={[this.getStyle().category, this.getStyle().topCategory]}>
                    <Text style={this.getStyle().categoryTitle}>DEBBUGING</Text>
                    <ButtonArrow
                        title='View logs'
                        onPress={() => NavService.navigate('Logs')}
                        styleContainer={this.getStyle().categoryItem}
                    />
                    <ButtonArrow
                        title='View data'
                        onPress={() => NavService.navigate('Storage')}
                        styleContainer={this.getStyle().categoryItem}
                    />
                    <FloatingLabelInput
                        label="Server URL"
                        value={serverUrl}
                        onChangeText={(text) => this.setState({serverUrl: text})}
                        containerStyle={[this.getStyle().categoryItem, StyleService.isMobileLandscape ? {width: '100%'} : {}]}
                        />
                    <FloatingLabelInput
                        label="Max shaking degree"
                        value={shakeDegree}
                        onChangeText={(text) => this.setState({shakeDegree: text})}
                        keyboardType='number-pad'
                        containerStyle={[this.getStyle().categoryItem, StyleService.isMobileLandscape ? {width: '100%'} : {}]}
                        />
                        <View style={{ height: 52, justifyContent: "flex-start", alignItems: "center", flexDirection: "row" }}>
                            <Text>Device ID: </Text><CopyWrapper text={macId} />
                        </View>
                </View>
        </Layout>
    }
}

export default withStore(DebuggingScreen)

const styles = EStyleSheet.create({
    // $outline: 1,
    screenColor: '#31A5C5',
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