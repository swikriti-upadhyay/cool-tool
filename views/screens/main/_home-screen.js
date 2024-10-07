import React, {Component} from 'react'
import {
    View,
    TouchableOpacity,
    Image,
    TouchableHighlight,
    Animated
} from 'react-native'
import { Text, Button, Icon } from 'native-base'
import EStyleSheet, { value } from 'react-native-extended-stylesheet'
import LinearGradient from 'react-native-linear-gradient'
import { showMessage, hideMessage } from 'react-native-flash-message'
import Orientation from 'react-native-orientation-locker'

import Layout from '../../layout/UxReality'
import Navigation from '../../layout/Navigation'

import NavService from '../../../utils/navigation-service'
import request from '../../../utils/request-service'
import ProjectService from '../../../utils/project-service'
import PermissionsService from '../../../utils/permissions-service';
import NetInfoService from '../../../utils/connectionInfo'
import UserService from '../../../utils/auth-service'

import {auth} from '../../../services/AuthService'
import { mainStyles, normalizeFont} from '../../../styles'
import {SurveyType} from '../../../storage/data-storage-helper'
import Logger from '../../../utils/logger'

import { BaseComponent } from '@components/BaseComponent'
import withStore from '../../../store/withStore'
import { SCALE } from '../../../animations'
import Popup from '@components/common/Popup'
import PulsateLogo from '@components/PulsateLogo'
import { withSubscription } from '@components/withSubscription'

const SubscriptionLogo = withSubscription(PulsateLogo)

class HomeScreen extends BaseComponent {
    state = {
        loading: false,
        baseButtonSize: 200,
        showTrial: false,
        isPopupVisible: false
    }
    
    constructor(props) {
        super(props)
        this.permissionsService = PermissionsService.instance
        this.projectService = ProjectService.instance
        this.userService = UserService.instance
        this.netInfoService = NetInfoService.instance
        this.metadata = null
        this.limitTimeout = 180 * 1000
        this.canNext = true
        this.init(styles, landscapeStyles);
    }

    componentDidMount() {
        Orientation.unlockAllOrientations()
        let screenName = this.props.navigation.state.params?.screenName;
        if (screenName) NavService.navigate(screenName)
        this.didBlurSubscription = this.props.navigation.addListener(
            'didBlur',
            () => this.canNext = true
        );
    }

    componentWillUnmount() {
        this.didBlurSubscription.remove();
    }

    showLoader(visibility) {
        this.setState({
            loading: visibility
        })
    }

    get isLoginByCode() {
        return this.userService.userType.ANON == this.userService.roleId
    }

    get isGuest() {
        return this.userService.isRespondent || !this.userService.isUserAuthorized
    }

    isApp(type) {
        return type === SurveyType.ANON_APP_TEST
    }

    async obtainMetaData(code, surveyType, timeout) {
        let metadata = null
        try {
            metadata = await this.projectService.getDefaultProjectMetadataNew(code, surveyType, timeout)
            return Promise.resolve(metadata)
        } catch{
            return Promise.reject(new Error('Unable to obtain metadata'))
        }
    }

    async goToSurvey(surveyType) {
        this.hideModal()
        let permissions = await this.checkPermissions()
        if (!permissions) return

        let code = this.isGuest ? ProjectService.UniversalSurveyCode : this.props.defaultProjectCode;
        let timeout = this.props.timeout
        let userType = 2
        this.userService.isUserAuthorized || auth.signIn('guest', {code: code})
        if (this.props.showInstruction(surveyType)) {
            NavService.navigate('Instruction', {
                surveyType,
                userType,
                projectService: this.projectService,
            })
            return
        }
        try {
            request.then.bind(this,
                this.obtainMetaData(code, surveyType, timeout)
                .then((metadata) => {
                    if (metadata) {
                        NavService.navigate('Survey', {
                            surveyMetaData: metadata,
                            userType
                        })
                    }
                })
                .catch((e) => {
                    showMessage({
                        message: 'Error',
                        description: e.message,
                        type: 'danger',
                        duration: 10000,
                        icon: 'auto'
                    })
                    Logger.error(e)
                })
            )
        } catch(e) {
            showMessage({
                message: 'Error',
                description: e.message,
                type: 'danger',
                duration: 10000,
                icon: 'auto'
            })
            Logger.error(e)
        }
    }

    checkUser() {
        if (this.isTrialExpired) this.setState({showTrial: true})
    }

    hideModal() {
        this.setState({
            isPopupVisible: false
        }, () => this.canNext = true)
    }

    async checkPermissions() {
        this.setState({loading: true})
        try {
            await this.permissionsService.requestStartPermissions()
            this.setState({loading: false})
            return Promise.resolve(true)
        } catch(e) {
            this.setState({loading: false})
            showMessage({
                message: 'Error',
                description: e.message,
                type: 'danger',
                duration: 10000,
                icon: 'auto'
            })
            return Promise.resolve(false)
        }
    }

    async showModal() {
        if (!this.canNext) return
        this.checkUser()
        if (this.isTrialExpired) return
        this.setState({
            isPopupVisible: true
        }, () => this.canNext = false)
    }

    footerButtons() {
        return (
          <View style={[styles.footer, styles.footerRight]}>
              <TouchableOpacity onPress={() => this.hideModal()}>
                <Text style={styles.btn}>CANCEL</Text>
              </TouchableOpacity>
          </View>
        )
      }

    renderChooseType() {
        const webSource = require('@assets/images/test_web.png')
        const appSource = require('@assets/images/test_app.png')
        const protoSource = require('@assets/images/test_prototype.png')
        return (
            <Popup 
                visible={this.state.isPopupVisible}
                title='Choose what to test' width={280}
                footer={this.footerButtons()}
                // contentStyle={{ height: 100 }}
                onHide={this.hideModal.bind(this)}>
                    <TouchableOpacity style={styles.testType} onPress={() => this.goToSurvey(SurveyType.ANON_APP_TEST)}>
                        <Image source={appSource} style={styles.testIco} />
                        <Text style={styles.textDark}>Application</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.testType} onPress={() => this.goToSurvey(SurveyType.ANON_WEB_TEST)}>
                        <Image source={webSource} style={styles.testIco} />
                        <Text  style={styles.textDark}>Mobile Website</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.testType} onPress={() => this.goToSurvey(SurveyType.ANON_PROT_TEST)}>
                        <Image source={protoSource} style={styles.testIco} />
                        <Text  style={styles.textDark}>Prototype</Text>
                    </TouchableOpacity>
            </Popup>
        )
    }

    renderNav() {
        return <Navigation
            back={false}
            left={
                <TouchableOpacity
                        onPress={() => NavService.navigate('Recordings')}
                        hitSlop={mainStyles.touchArea}>
                            <Text style={this.getStyle().btnText}>Recordings</Text>
                </TouchableOpacity>
            }
            right={
                <TouchableOpacity
                        onPress={() => NavService.navigate('Settings')}
                        hitSlop={mainStyles.touchArea}>
                            <Text style={this.getStyle().btnText}>Settings</Text>
                </TouchableOpacity>
            }
            />
    }

    renderFooter() {
        return(
            <View style={{flex: 1, justifyContent: 'center',alignItems: 'center'}}>
                 {this.state.showTrial && this.renderSignUp()}
                 {!this.state.showTrial && <TouchableOpacity style={[styles.linkToCode]} onPress={()=>NavService.navigate('CreateProject')}>
                        <Text style={[styles.btnLink, {color: '#fff'}]}>How to create remote UX project?</Text>
                    </TouchableOpacity>}
            </View>
        )
    }

    renderTitle() {
        return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={[mainStyles.title, this.getStyle().topTitle, this.props.isMobilePortrait ? {}:{paddingTop:15}, this.props.isMobileLandscape ? {paddingTop: 0, paddingBottom: 25} : {}]}>Tap to capture experience</Text>
        </View>
    }

    renderSignUp() {
        return (
                <View style={styles.signup}>
                    <Text style={{ flex: 1, fontSize: normalizeFont(16), textAlign: 'center', textAlignVertical: "center" }}>
                        You've already used your trial recording.{'\n'}
                        Please, Sign Up to do more recordings. 
                    </Text>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        {this.renderSignIn()}
                    </View>
                </View>
        )
    }

    renderSignIn() {
        return (
            <Button style={[mainStyles.btn, {width: '100%'}]} light full onPress={() => NavService.navigate('Register')}>
                <Text style={[mainStyles.btnText, {color: '#95BC3E'}]}>Sign Up</Text>
            </Button>
        )
    }

    render() {
        let {loading} = this.state
        return <Layout 
            navigation={this.renderNav()}
            loading={loading}
            stickyFooter>
                    {this.renderTitle()}
                    <View style={[(this.props.isMobileLandscape && this.state.showTrial) ? {flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'} : {flexDirection: 'column', flex: 1}]}>
                        <SubscriptionLogo
                            onPress={() => this.showModal()}
                            containerStyle={[this.getStyle().startWrapper, this.props.isMobilePortrait && {marginTop: this.moderateScale(25) }, this.props.isMobileLandscape && {marginTop: 0}]}
                            pulsating={true}
                            disabled={this.state.showTrial} />
                            {this.renderFooter()}
                    </View>
                    {this.renderChooseType()}
        </Layout>
    }
}

export default withStore(HomeScreen)
const styles = EStyleSheet.create({
    // $outline: 1,
    screenColor: '#1AD2D4',
    topTitle: {
        fontSize: normalizeFont(24)
    },

    signup: {
        width: '100%',
        maxWidth: 375,
        flex: 1,
    },

    startWrapper: {
        alignSelf: 'center',
    },
    linkToCode: {
        alignSelf: 'center'
    },
    btnLink: {
        borderBottomColor: '$lightColor',
        borderBottomWidth: 1,
        paddingBottom: 1,
        color: '$lightColor',
        alignSelf: 'center',
        fontSize: normalizeFont(16),
        fontFamily: '$proximaSB'
    },
    btnText: {
        fontSize: normalizeFont(16)
    },
    contentWrap: {
        flex: 1,
        // flexDirection: 'column',
        // justifyContent: 'center',
        // '@media (min-width: 320) and (max-width: 851)': {
        //     flex: 0,
        // }
    },
    footer: {
        height: 52,
        alignItems: 'center',
        flexDirection: 'row',
        // borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, .12)',
        paddingHorizontal: 4,
      },
      footerRight: {
          justifyContent: 'flex-end'
      },
      testType: {
          height: 56,
          flexDirection: 'row',
          alignItems: 'center'
      },
      testIco: {
          width: 40,
          height: 40,
          marginRight: 15
      },
      textDark: {
          color: '#000'
      },
      btn: {
        color: '#95BC3E',
        fontSize: 14,
        fontWeight: 'bold',
        paddingVertical: 8,
        marginHorizontal: 4,
        justifyContent: 'center', 
        alignItems: 'center',
        textAlign: 'center',
      },
})

const landscapeStyles = {
        topTitle: {
            width: '100%',
        },
        btnText: {
            fontSize: normalizeFont(14)
        },
}
