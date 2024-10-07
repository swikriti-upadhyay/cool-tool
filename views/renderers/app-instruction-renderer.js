import React from 'react'
import {
    Linking,
    Image,
    View,
    AppState
} from 'react-native'
import { withStyles } from 'react-native-styleman';

import NLCommon from 'react-native-nl-common'
import CommonHelper from '../../utils/common-helper'
import BaseRenderer from './base-renderer'
import {mainStyles, normalizeFont} from '../../styles'

import SurveyLayout from '../layout/SurveyLayout'
import SurveyButton from '../components/survey-btn-component'
import BorderButton from '../components/border-btn-component'
import {fleshShow, fleshHide} from '@components/FlashInfoBox'
import { Text } from '@components/common/Text'
import Loader from '../common/loader-view'

const styles = () => ({
    wrapper: {
        flex: 1,
        alignItems: 'center',
        marginTop: 36
    },
    row: {
        flex: 1,
        justifyContent: 'flex-start',
        '@media': [
            { // Tablet
              orientation: 'landscape',
              styles: {
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
                paddingHorizontal: 12,
                paddingVertical: 8,
              }
            },
          ]
    },
    col1: {
        '@media': [
            { // Tablet
              orientation: 'landscape',
              styles: {
                width: '45%',
                maxWidth: 300
              }
            },
          ]
    },
    col2: {
        '@media': [
            { // Tablet
              orientation: 'landscape',
              styles: {
                width: '55%',
              }
            },
          ]
    },
    title: {
        marginVertical: 40,
        textAlign: 'center',
        fontSize: normalizeFont(24),
        fontWeight: 'bold',
        fontFamily: 'ProximaBold',
        '@media': [
            {
                orientation: 'landscape',
                maxWidth: 851,
                styles: {
                    marginVertical: 10
                }
            },
        ]
    },
    text: {
        fontSize: normalizeFont(16),
        textAlign: 'center',
        fontWeight: 'bold',
        fontFamily: 'ProximaSbold',
        lineHeight: 24
    },
    download: {
        maxWidth: 200,
        maxHeight: 200,
        marginBottom: 40,
        resizeMode: 'contain',
        alignSelf: 'center',
        '@media': [
            {
                orientation: 'landscape',
                maxWidth: 851,
                styles: {
                    maxHeight: 160,
                    marginBottom: 0,
                }
            },
        ]
    }
})


class AppInstructionRenderer extends BaseRenderer {
    get className() { return 'AppInstructionRenderer' }

    state = {
        isInstalled: false,
        ready: false,
        packageName: "",
        packageUrl: ""
    }
    packageID = null

    componentDidMount() {
        try {
            let { name, eyeTrackingWebSiteUrl } = this.surveyItem?.survey?.appData;
            AppState.addEventListener('change', this._onStateChange)
            this.packageID = CommonHelper.getAppIdFromString(eyeTrackingWebSiteUrl);
            this.setState({
                packageUrl: eyeTrackingWebSiteUrl,
                packageName: name
            })
        } catch(e) {
            console.log('error '+ e)
        }
    }

    start() {
        // return Promise.reject(new Error('Unable to start camera record'))
        this.checkInstall(true)
        super.start()
    }

    finish() {
        AppState.removeEventListener('change', this._onStateChange);
        super.finish()
    }

    _onStateChange = (nextAppState) => {
        if (nextAppState === 'active') this.checkInstall()
    }

    checkInstall(isNext) {
        NLCommon.isPackageInstalled(this.packageID)
            .then((result) => {
                fleshHide();
                this.setState({isInstalled: true})
                if (isNext) this.finish()
            })
            .catch((error) => {
                if (!this.packageID) return this.finish() // if app url not specified then skip screen
            })
            .finally(() => this.setState({ready: true}))
    }

    openPlayMarket() {
        Linking.openURL(this.state.packageUrl)
    }

    renderFooter() {
        const {t} = this.props;
        return (
            <View>
                {/* <Button style={[styles.btn, {marginBottom: 16}]} bordered light full onPress={() => this.openPlayMarket()}>
                    <BaseText style={[styles.btnText, {color: '#fff'}]} returnKeyType='send'>Open Play Market</BaseText>
                </Button> */}
                {this.state.isInstalled ? <SurveyButton
                    title={t('next_btn')}
                    onPress={() => this.checkInstall(true)}
                /> :
                <BorderButton 
                    title={t('open_play_btn')}
                    onPress={() => this.openPlayMarket()}
                />}
            </View>
        )
    }

    

    render() {
        return <View style={{ flex: 1 }}>
            <RenderView 
                    footer={() => this.renderFooter()}
                    ready={this.state.ready}
                    packageName={this.state.packageName}
                    isInstalled={this.state.isInstalled}
                    t={this.props.t}
                />
        </View>
    }
}

let RenderText = ({styles, packageName, isInstalled, t}) => {
    return isInstalled ? <View>
            <Text style={styles.title} weight="bold">{t('app_install_heading')}</Text>
            <Text style={styles.text} weight="sBold">{t('app_install_text')}</Text>
        </View> :
        <View>
            <Text style={styles.title} weight="bold">{t('app_not_found_heading')}</Text>
            <Text style={styles.text} weight="sBold">{t('app_not_found_text')}</Text>
        </View>
}

let RenderView = ({ styles, ready, footer, packageName, isInstalled, t }) => {
        const imgSource = require('@assets/images/download.png')
        return (
            <SurveyLayout footer={footer()}>
                <View style={styles.wrapper}>
                    <View style={styles.row}>
                        <View style={styles.col1}>
                            <Image source={imgSource} style={styles.download} />
                        </View>
                        <View style={styles.col2}>
                            {ready ? <RenderText 
                                styles={styles}
                                packageName={packageName}
                                isInstalled={isInstalled}
                                t={t} />: <Loader />}
                        </View>
                    </View>
                </View>
            </SurveyLayout>
        )
}
RenderView = withStyles(styles)(RenderView)

export default AppInstructionRenderer