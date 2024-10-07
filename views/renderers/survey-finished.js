import React from 'react'

import {
  Linking
} from 'react-native'
import { Button, Text, View } from 'native-base'
import EStyleSheet from 'react-native-extended-stylesheet'
import StyleService from '../../utils/style-service'
import {mainStyles, normalizeFont} from '../../styles'

import { RespondentStatus, Storages } from '../../storage/data-storage-helper';

import Layout from '../layout/UxReality'
import Navigation from '../layout/Navigation'
import Logo from '@components/Logo'

import BaseRenderer from './base-renderer'

export default class SurveyFinishedRenderer extends BaseRenderer { // TODO: refactoring with name thankyou page
  get className() { return 'SurveyFinishedRenderer' }

  async updateCounter() {
    let settings = await Storages.SettingsStorage.getSettings();
    settings.trialCounter = settings.trialCounter ? settings.trialCounter + 1 : 1;
    await Storages.SettingsStorage.update(settings);
  }

  skipVideo() {
    Storages.SettingsStorage.getSettings()
    .then((settings) => {
      settings.skipVideo = true
      Storages.SettingsStorage.update(settings)
    })
  }

  async start(data) {// TODO: CTMA-45 skip finish screen
    let { isGuest, linkForComplete, linkForDisqualified } = this.props.surveyItem.survey
    this.skipVideo()
    if (this.props.surveyItem.survey.isGuest) {
      let respondent = await Storages.RespondentStorage.getById(this.props.surveyItem.survey.respondentId)
      if (respondent.status === RespondentStatus.SKIPPED) {
        if (linkForDisqualified) Linking.openURL(linkForDisqualified)
        return super.start()
      }
      if (linkForComplete) Linking.openURL(linkForComplete)
      return super.start()
    }
    return super.start(data)
          .then(() => {
             return this.finish()
          })
          .then(() => {
            this.updateCounter()
            this.goHome()
            return Promise.resolve()
          })
  }

    getStyle(){
        let baseStyles = styles
        if (StyleService.viewMode === 'landscape') {
          return {...baseStyles, ...landscapeStyles};
        } else {
          return baseStyles;
        }
      }
    
      renderNav() {
        return(
            <Navigation
            />
        )
      }

      renderFooter() {
        const {t} = this.props;
        return (
            <View>
              <Button style={[styles.btn, {marginBottom: 16}]} bordered light full onPress={() => this.goMain()}>
                  <Text style={[styles.btnText, {color: '#fff'}]} returnKeyType='send'>{t('test_again_btn')}</Text>
              </Button>
              <Button style={styles.btn} light full onPress={() => this.closeApp()}>
                  <Text style={[styles.btnText, {color: '#95BC3E'}]}>{t('close_app_btn')}</Text>
              </Button>
            </View>
        )
    }

    renderTitle() {
      const {t} = this.props;
      return <Text style={styles.title}>{t('thx_nice_work')}</Text>
    }

    renderText() {
      const {t} = this.props;
      return <Text style={styles.text}>{t('test_mobile_site')}</Text>
    }

    render() {
        return (
                <Layout
                    navigation={<Navigation back={false} />}
                    footer={this.renderFooter()}
                    contentStyle={this.getStyle().contentWrap}
                    footerStyle={this.getStyle().footer}
                    stickyFooter>
                        <Logo wrapStyle={this.getStyle().logo}/>
                        {this.renderTitle()}
                        {this.renderText()}
                    </Layout>
            );
      }
}

const styles = EStyleSheet.create({
    btn: {
        height: 52,
        width: '100%',
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
    logo: {
      marginVertical: 65,
      '@media (min-width: 600) and (max-width: 1024)': {
        marginVertical: 110,
      },
    },
    title: {
        height: 52,
        marginBottom: 12,
        textAlign: 'center',
        fontSize: normalizeFont(20)
    },
    text: {
        fontSize: normalizeFont(20),
        textAlign: 'center',
    },
    contentWrap: {
        '@media (min-width: 600) and (max-width: 1024)': {
          width: 440,
          alignSelf: 'center'
        },
      },
      footer: {
        '@media (min-width: 600) and (max-width: 1024)': {
            // width: 440,
          },
      }
})
const landscapeStyles = EStyleSheet.create({
  logo: {
    marginVertical: 15,
    '@media (min-width: 600) and (max-width: 1024)': {
      marginVertical: 40,
    },
  }
})