import React, {Component} from 'react'
import {
    View,
    TouchableOpacity,
    ToastAndroid,
} from 'react-native'
import { Text, Button, Icon } from 'native-base'
import EStyleSheet, { value } from 'react-native-extended-stylesheet'
import isEqual from 'fast-deep-equal'
import RNRestart from 'react-native-restart'
import NLCommon from 'react-native-nl-common'

import Constants from '../../../constants'
import Layout from '../../layout/UxReality'
import Navigation from '../../layout/Navigation'
import FloatingLabelInput from '@components/FloatingLabelInput'
import { SettingsComponent } from '@components/SettingsComponent'
import Select from '@components/Form/Select2'
import { withSubscription } from '@components/Form/withSubscription'
import UICheckbox from '@components/Form/RadioBox2'

import { mainStyles, normalizeFont} from '../../../styles'
import AppInfo from '../../../package.json'
import {Storages} from '../../../storage/data-storage-helper'
import NavService from '../../../utils/navigation-service'
import StyleService from '../../../utils/style-service'

const CustomSelect = withSubscription(Select)

export default class ApplicationScreen extends SettingsComponent {
    constructor(props) {
        super(props)
        super.init(styles, landscapeStyles)
        this.state = {
            appsList: [],
            applicationName: '',
            applicationTask: '',
            applicationTimeout: null,
            isReady: false
        }

        // preserve the initial state in a new object
        this.baseState = {} 
        this.versionCount = 0
    }

    componentDidMount() {
        Storages.SettingsStorage.getSettings()
            .then(settings => {
                let appName = this.getAppNameFromObj(settings.applicationName)
                this.setState({
                    applicationTask: settings.applicationTask,
                    applicationName: settings.applicationName,
                    curApp: appName,
                    applicationTimeout: settings.timeout,
                    isReady: true,
                    saving: false
                }, () => {
                    this.baseState = {...this.state} 
                })
            })
    }

    getAppNameFromObj(obj) {
        let app = {};
        try {
            app = JSON.parse(obj)
        } catch(e) {
        }
        return app
    }

    async onSave(needGoBack) {
        let settings = await Storages.SettingsStorage.getSettings()
        let {
            applicationTask,
            applicationName,
            applicationTimeout
        } = this.state
        settings.applicationTask = applicationTask
        settings.applicationName = applicationName
        settings.timeout = applicationTimeout
        await Storages.SettingsStorage.update(settings)
        if (needGoBack) return NavService.back()
        this.baseState = {...this.state}
        this.setState(this.baseState)
        ToastAndroid.show('Saved', ToastAndroid.SHORT)
    }

    onChangeApp(applicationName) {
        let dbValue = JSON.stringify(applicationName)
        this.setState({
            curApp: applicationName,
            applicationName: dbValue
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

    skipChanges(callback) {
        this.setState(this.baseState, callback)
    }

    handleSave(item) {
        let curTime = Constants.TestingTime.find((time) => time.value === item.value)
        this.setState({
            applicationTimeout: curTime.value
        })
    }

    checkChanges() {
        let showAlert = this.canSave()
        if (!showAlert) {
            this.showPopup(this.onSave.bind(this))
        }
        return !showAlert
    }

    handleBack() {
        let showAlert = this.canSave()
        if (!showAlert) {
            return this.showPopup(this.onSave.bind(this))
        }
        NavService.back()
    }

    async getApps() {
        let apps = await NLCommon.getNonSystemApps()
        // let data = apps.data
        let data = apps.map((app, key) => {
            return {
              id: key,
              name: app.appName,
              value: app.packageName
            }
          })
          this.setState({appsList: data})
          return data
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
        const { applicationTask, curApp, appsList, applicationTimeout } = this.state
        let curTime = Constants.TestingTime.find((time) => time.value === applicationTimeout)
        // if (curTime) curTime = curTime.value
        return <Layout 
            bgColor={this.getStyle().screenColor}
            navigation={this.renderNav()}
            footer={this.renderFooter()}
            style={{ textAlign: 'center' }}
            stickyFooter>
                <View style={[this.getStyle().category, this.getStyle().topCategory]}>
                    <Text style={this.getStyle().categoryTitle}>APPLICATION TASK</Text>
                    <View style={styles.categoryItem}>
                        <Select
                            onLoad={() => this.getApps()}
                            data={this.state.appsList}
                            currentItem={curApp}
                            label='Application Name'
                            placeholder='Choose the app'
                            title='Choose the app'
                            onSave={(item) => this.onChangeApp(item)}
                            labelStyle={mainStyles.surveyLabel}
                        />
                    </View>
                    <View style={styles.categoryItem}>
                        <FloatingLabelInput
                            label="Application Task"
                            value={applicationTask}
                            onChangeText={(text) => this.setState({applicationTask: text})}
                            multiline={true}
                            containerStyle={[this.getStyle().categoryItem, StyleService.isMobileLandscape ? {width: '100%'} : {}]}
                            />
                    </View>
                    <View style={styles.categoryItem}>
                        <CustomSelect
                            label='Testing time'
                            placeholder='Set testing time'
                            currentItem={curTime}
                            title='Set testing time'
                            data={Constants.TestingTime}
                            onSave={(item) => this.handleSave(item)}
                            labelStyle={mainStyles.surveyLabel}
                        />
                    </View>
                </View>
        </Layout>
    }
}

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
    categoryItem: {
        marginBottom: 16
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