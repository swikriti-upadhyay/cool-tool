import React, {Component} from 'react'
import {
    View,
    TouchableOpacity,
    Image,
    TouchableHighlight,
    ToastAndroid,
    Alert
} from 'react-native'
import { Text, Button, Icon } from 'native-base'
import EStyleSheet, { value } from 'react-native-extended-stylesheet'
// import { observer } from 'mobx-react'
import isEqual from 'fast-deep-equal'
import RNRestart from 'react-native-restart'

import Layout from '../../layout/UxReality'
import Navigation from '../../layout/Navigation'
import Switch from '../../components/switch-form-item'
import FloatingLabelInput from '@components/FloatingLabelInput'
import { BaseComponent } from '@components/BaseComponent'
import { ButtonArrow } from '@components/Form/ButtonArrow'
import { mainStyles, normalizeFont} from '../../../styles'

import Constants from '../../../constants'
import AppInfo from '../../../package.json'
import {Storages} from '../../../storage/data-storage-helper'
import NavService from '../../../utils/navigation-service'
import UserService from '../../../utils/auth-service'
import {auth} from '../../../services/AuthService'
import StyleService from '../../../utils/style-service'
import request from '../../../utils/request-service'
import PermissionsService from '../../../utils/permissions-service';
import withStore from '../../../store/withStore'

class _SettingsScreen extends BaseComponent {
    static defaultProps = {
        isDebug: Constants.isDebug,
    }

    constructor(props) {
        super(props)
        super.init(styles, landscapeStyles)

        this.permissionsService = PermissionsService.instance
        this.userService = UserService.instance
        this.versionCount = 0

    }

    countVersionPress() {
        let {isDebug} = this.props.settings
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

    signOut() {
        console.log('sign out')
        auth.signOut(()=>NavService.resetAction('Login'))
    }

    showSignOutConfirmation() {
        Alert.alert(
            'Sign Out',
            'Are you sure that you want to sign out?',
            [
                {
                    text: 'No',
                    style: 'cancel'
                },
                {
                    text: 'Yes',
                    onPress: () => this.signOut()
                }
            ]
        )
    }

    renderNav() {
        return <Navigation
            bgColor={this.getStyle().screenColor}
            back={false}
            left={
                <Button
                    transparent
                    onPress={() => NavService.navigate('Home')}
                    >
                    <Icon name='arrow-back' />
                </Button>
            }
            heading='Settings'
            headerSticky={true}
        />
    }

    renderAuthButtons() {
        return(
            <View style={StyleService.isLandscape ? {flexDirection: 'row', justifyContent: 'space-between'} : {}}>
                <Button style={[this.getStyle().btn, {marginBottom: 16}]} bordered light full onPress={()=>NavService.navigate('Enter')}>
                    <Text style={[this.getStyle().btnText, {color: '#fff'}]}>Test as a Respondent</Text>
                </Button>
                <Button style={[this.getStyle().btn, ]} light full onPress={() => request.then(this.showSignOutConfirmation.bind(this))}>
                    <Text style={[this.getStyle().btnText, {color: '#31A5C5'}]}>Logout</Text>
                </Button>
            </View>
        )
    }

    renderTrialButtons() {
        return (
            <View style={StyleService.isLandscape ? {flexDirection: 'row', justifyContent: 'space-between'} : {}}>
                <Button style={[this.getStyle().btn, {marginBottom: 16}]} bordered light full onPress={()=>NavService.navigate('Enter')}>
                    <Text style={[this.getStyle().btnText, {color: '#fff'}]}>Test as a Respondent</Text>
                </Button>
                <Button style={[this.getStyle().btn, ]} light full onPress={()=>NavService.navigate('Login')}>
                    <Text style={[this.getStyle().btnText, {color: '#31A5C5'}]}>Sign In</Text>
                </Button>
            </View>
        )
    }

    renderFooter = () => {
        return(
            <View>
                {this.userService.isUserAuthorized ? this.renderAuthButtons() : this.renderTrialButtons()}
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
        const { isDebug } = this.props.settings,
            redColor = EStyleSheet.value('$redColor'),
            primaryColor = EStyleSheet.value('$primaryColor'),
            lightColor = EStyleSheet.value('$lightColor'),
            switchProps = {thumbColor: lightColor, trackColor: {false: redColor, true: primaryColor}}
        return <Layout 
            bgColor={this.getStyle().screenColor}
            navigation={this.renderNav()}
            footer={this.renderFooter()}
            style={{ textAlign: 'center' }}
            stickyFooter
            styleFooter={[this.getStyle().customFooter]}>
                <View style={[this.getStyle().category, this.getStyle().topCategory]}>
                    <Text style={this.getStyle().categoryTitle}>MAIN SETTINGS</Text>
                    {this.userService.isUserAuthorized && <ButtonArrow
                        title='My account'
                        onPress={() => request.then(() => NavService.navigate('Account', { header: 'Main Settings' }))}
                        styleContainer={this.getStyle().categoryItem}
                    />}
                    <ButtonArrow
                        title='Technologies'
                        onPress={() => NavService.navigate('Technologies', { header: 'Main Settings' })}
                        styleContainer={this.getStyle().categoryItem}
                    />
                    <ButtonArrow
                        title='Open App Settings'
                        onPress={() => this.permissionsService.openAppSettings()}
                        styleContainer={this.getStyle().categoryItem}
                    />
                    <ButtonArrow
                        title='Testing Tasks'
                        onPress={() => NavService.navigate('Tasks', { header: 'Main Settings' })}
                        styleContainer={this.getStyle().categoryItem}
                    />
                </View>
                <View style={this.getStyle().category}>
                    <Text style={this.getStyle().categoryTitle}>INFO CENTER</Text>
                    <ButtonArrow
                        title='Terms & Conditions'
                        onPress={() => NavService.navigate('Terms', { showButtons: false })}
                        styleContainer={this.getStyle().categoryItem}
                    />
                    <ButtonArrow
                        title='FAQ'
                        onPress={() => NavService.navigate('Faq')}
                        styleContainer={this.getStyle().categoryItem}
                    />
                    <ButtonArrow
                        title='About UXReality'
                        onPress={() => NavService.navigate('About')}
                        styleContainer={this.getStyle().categoryItem}
                    />
                    {isDebug && <ButtonArrow
                        title='Debugging'
                        onPress={() => NavService.navigate('Debugging', { header: 'Info Center' })}
                        styleContainer={this.getStyle().categoryItem}
                    />}
                </View>
        </Layout>
    }
}

export default withStore(_SettingsScreen)

const styles = EStyleSheet.create({
    // $outline: 1,
    screenColor: '#31A5C5',
    row: {
        flexDirection: 'row'
    },
    category: {
        marginTop: 20,
    },
    topCategory: {
        marginBottom: 15
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
        // top: 15,
        marginVertical: 10,
        alignSelf: 'center'
    },
    get customFooter() {
        return {
            marginTop: 25,
            marginBottom: 0,
            '@media (min-width: 600) and (max-width: 1024)': {
                width: '100%',
                maxWidth: 440,
                alignSelf: 'center'
              },
        }
    },
})

const landscapeStyles = EStyleSheet.create({
    // '@media (min-width: 767)': {
        
        category: {
            marginTop: StyleService.moderateScale(15),
            flexWrap: 'wrap',
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
        },
        get categoryTitle() {
            return {
                ...styles.categoryTitle,
                flexBasis: '100%'
            }
        },
        categoryItem: {
            width: '100%',
        },
        get btn() {
            return {
                ...styles.btn,
                width: '48%'
            }
        },
        get customFooter() {
            return {
                marginTop: 25,
                marginBottom: 0,
                '@media (min-width: 600) and (max-width: 1024)': {
                    width: '100%',
                    alignSelf: 'center'
                  },
            }
        },
    // }
})