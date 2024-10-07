import React from 'react'

import { Button, Text, View } from 'native-base'
import EStyleSheet from 'react-native-extended-stylesheet'
import StyleService from '../../utils/style-service'
import NavService from '../../utils/navigation-service'
import {mainStyles, normalizeFont} from '../../styles'

import { UserType, Storages } from '../../storage/data-storage-helper';

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
    return <Text style={styles.title}>{t('thx_participation')}</Text>
  }

  renderText() {
    const {t} = this.props;
      return <Text style={styles.text}>{t('project_stopped')}</Text>
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
        fontSize: normalizeFont(20),
        fontWeight: 'bold'
    },
    text: {
        fontSize: normalizeFont(20),
        textAlign: 'center',
        fontWeight: 'bold'
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