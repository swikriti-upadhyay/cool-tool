import React, { Component } from 'react'
import {
    View,
    TouchableOpacity,
    ToastAndroid,
} from 'react-native'
import { Text, Button, Icon } from 'native-base'
import { Form, Field } from 'react-native-validate-form'
import EStyleSheet, { value } from 'react-native-extended-stylesheet'
import isEqual from 'fast-deep-equal'
import RNRestart from 'react-native-restart'
import Orientation from 'react-native-orientation-locker'

import Layout from '../../layout/UxReality'
import Navigation from '../../layout/Navigation'
import FloatingLabelInput from '@components/FloatingLabelInput'
import { SettingsComponent } from '@components/SettingsComponent'
import Select2 from '@components/Form/Select2'
import { withSubscription } from '@components/Form/withSubscription'
import { mainStyles, normalizeFont} from '../../../styles'
import Constants from '../../../constants'

import AppInfo from '../../../package.json'
import {Storages} from '../../../storage/data-storage-helper'
import NavService from '../../../utils/navigation-service'
import StyleService from '../../../utils/style-service'
import {url, required} from '../../../utils/validation-rules'

const CustomSelect = withSubscription(Select2)

export default class WebsiteScreen extends SettingsComponent {
    constructor(props) {
        super(props)
        super.init(styles, landscapeStyles)
        this.state = {
            websiteTimeout: null,
            isReady: false
        }

        // preserve the initial state in a new object
        this.baseState = {} 
        this.versionCount = 0
    }

    componentDidMount() {
        Storages.SettingsStorage.getSettings()
            .then(settings => {
                this.setState({
                    defaultTestSiteUrl: settings.defaultTestSiteUrl,
                    taskText: settings.taskText,
                    websiteTimeout: settings.timeout,
                    isReady: true,
                    saving: false
                }, () => {
                    this.baseState = {...this.state} 
                })
            })
    }

    async onSave(needGoBack) {
        let hasErrors = await this.validate()
        if (hasErrors) return
        let settings = await Storages.SettingsStorage.getSettings()
        let {
            defaultTestSiteUrl,
            taskText,
            websiteTimeout
        } = this.state
            settings.defaultTestSiteUrl = defaultTestSiteUrl
            Constants.defaultTestSiteUrl = defaultTestSiteUrl
            settings.taskText = taskText
            settings.timeout = websiteTimeout
        await Storages.SettingsStorage.update(settings)
        if (needGoBack) return NavService.back()
        settings.allowOrientationChange ? Orientation.unlockAllOrientations() : Orientation.lockToPortrait()
        this.baseState = {...this.state}
        this.setState(this.baseState)
        ToastAndroid.show('Saved', ToastAndroid.SHORT)
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
            websiteTimeout: curTime.value
        })
    }

    validate() {
        let submitResults = this.myForm.validate();
        let errors = [];
        let hasErrors = false
        submitResults.forEach(item => {
          errors.push({ field: item.fieldName, error: item.error });
        });
        this.baseState.errors = errors
        hasErrors = submitResults.filter(err => !err.isValid).length
        this.setState({ errors: errors });
        return Promise.resolve(!!hasErrors)
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
        const {defaultTestSiteUrl, taskText, websiteTimeout} = this.state
        let curTime = Constants.TestingTime.find((time) => time.value === websiteTimeout)
        return <Layout 
            bgColor={this.getStyle().screenColor}
            navigation={this.renderNav()}
            footer={this.renderFooter()}
            style={{ textAlign: 'center' }}
            stickyFooter>
                <Form 
                    style={[this.getStyle().category, this.getStyle().topCategory]}
                    ref={(ref) => this.myForm = ref} errors={this.state.errors} validate={true}>
                    <Text style={this.getStyle().categoryTitle}>WEBSITE TASK</Text>
                    <View style={styles.categoryItem}>
                        <Field
                            required
                            name="url"
                            component={FloatingLabelInput}
                            validations={[ required, url ]}
                            errorMessages={['This field is required', 'Email invalid']}
                            label="Website URL"
                            value={defaultTestSiteUrl}
                            onChangeText={(text) => this.setState({defaultTestSiteUrl: text})}
                            autoCapitalize='none'
                            autoCompleteType='off'
                            importantForAutofill='no'
                            autoCorrect={false}
                            keyboardType='url'
                            containerStyle={[StyleService.isMobileLandscape ? {width: '100%'} : {}]}
                            errors={this.state.errors}
                        />
                    </View>
                    <View style={styles.categoryItem}>
                        <FloatingLabelInput
                            label="Website Task"
                            value={taskText}
                            onChangeText={(text) => this.setState({taskText: text})}
                            multiline={true}
                            containerStyle={[StyleService.isMobileLandscape ? {width: '100%'} : {}]}
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
                </Form>
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
    categoryItem: {
        marginBottom: 16
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