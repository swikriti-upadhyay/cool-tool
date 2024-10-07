import React, { useState, useEffect } from 'react'
import { Button, Text,  View } from 'native-base'
import { TouchableOpacity } from 'react-native'

import NavService from '../../utils/navigation-service'

import { UserType } from '../../storage/data-storage-helper';

import Layout from '../layout/UxReality'
import Navigation from '../layout/Navigation'
import Logo from '@components/Logo'
import {mainStyles, normalizeFont} from '../../styles'
import { withStyles } from 'react-native-styleman';

const styles = ({btn, btnText}) => ({
  btn,
  btnText,
  contentWrap: {
    '@media': [
      { // Tablet
        orientation: 'portrait',
        minWidth: 600,
        styles: {
          alignSelf: 'center'
        }
      },
    ]
  },
  text: {
    textAlign: 'center',
    fontSize: normalizeFont(16)
  },
  footer: {
    width: 320,
    alignSelf: 'center'
  }
})

  let renerNav = () => {
    return(
        <Navigation
            heading="Welcome"
            left={
              <TouchableOpacity
                onPress={() => NavService.navigate("Login")}
                  hitSlop={mainStyles.touchArea}>
                      <Text style={{ fontSize: 16 }}>Sign In</Text>
              </TouchableOpacity>
            }
            right={
              <TouchableOpacity
                onPress={() => NavService.navigate("Register")}
                  hitSlop={mainStyles.touchArea}>
                      <Text style={{ fontSize: 16 }}>Sign Up</Text>
              </TouchableOpacity>
            }
        />
    )
}


  let renderFooter = (styles) => {
      return (
          <View>
          <Button style={[styles.btn, {marginBottom: 16}]} bordered light full onPress={() => NavService.navigate('Enter', { userType: UserType.ANON })}>
              <Text style={[styles.btnText, {color: '#fff'}]} returnKeyType='send'>I’m a respondent</Text>
          </Button>
          <Button style={styles.btn} light full onPress={() => NavService.navigate('Home', { userType: UserType.GUEST })}>
              <Text style={[styles.btnText, {color: '#95BC3E'}]}>Try as a researcher</Text>
          </Button>
      </View>
      )
  }
let _MainScreen = ({ styles, navigation }) => {
  useEffect(() => {
    let action = navigation.getParam('forceNavigate')
    NavService.navigate(action)
  }, []); // TODO: research how to check changes
  return (
      <Layout 
      navigation={renerNav()}
      footer={renderFooter(styles)}
      contentStyle={styles.contentWrap}
      styleFooter={styles.footer}
      stickyFooter>
          <Logo />
          <Text style={styles.text}>Get user’s behavior insights as close to reality as possible</Text>
      </Layout>
  )
};

export default withStyles(styles)(_MainScreen)