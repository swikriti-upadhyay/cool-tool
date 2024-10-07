import React, { Component } from 'react'
import { Button, Text,  Form, Item, Input, Icon } from 'native-base'
import { View, TouchableOpacity } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import NavService from '../../utils/navigation-service'
import { observer } from 'mobx-react'

import NetInfoService from '../../utils/connectionInfo'
import request from '../../utils/request-service'
import {auth} from '../../services/AuthService'
import ProjectService from '../../utils/project-service'
import PermissionsService from '../../utils/permissions-service'
import {SurveyType} from '../../storage/data-storage-helper'
import StyleService from '../../utils/style-service'
import {mainStyles, normalizeFont} from '../../styles'
import { showMessage, hideMessage } from 'react-native-flash-message'

import Layout from '../layout/UxReality'
import Navigation from '../layout/Navigation'
import Logo from '@components/Logo'
import { withStyles } from 'react-native-styleman';

const CODE_MAX_CHARACTERS = 8

const styles = ({ btn, btnText, $darkThemeText }) => ({
  btn,
  btnText,
  contentWrap: {
    '@media': [
      { // Tablet
        // orientation: 'portrait',
        minWidth: 600,
        styles: {
          alignSelf: 'center',
          width: 550
        }
      },
    ]
  },
  btn_disabled: {
    opacity: .5,
    borderColor: 'rgba(255, 255, 255, .5)',
  },
  item: {
      marginLeft: 0,
      marginBottom: 0
  },
  input: {
      textAlign: 'center',
      fontSize: normalizeFont(20),
      height: 52,
  },
  focused_input: {
    '@media': [
      { // mobile
        orientation: 'landscape',
        minWidth: 320,
        maxWidth: 851,
        styles: {
          color: $darkThemeText
        }
      }
    ],
  },
  btnLink: {
    marginBottom: 20,
    borderBottomColor: '#fff',
    borderBottomWidth: 1,
    paddingBottom: 1,
    color: '#fff',
    alignSelf: 'center',
    fontSize: normalizeFont(16),
    fontFamily: 'ProximaSbold'
  },
  title: {
    textAlign: 'center',
    fontSize: normalizeFont(20),
    fontWeight: '600',
    '@media': [
      { // Tablet
        orientation: 'portrait',
        maxWidth: 600,
        styles: {
          height: 52
        }
      },
      {
        orientation: 'landscape',
        minWidth: 320,
        maxWidth: 851,
        styles: {
          height: 24,
          fontSize: normalizeFont(18)
        }
      }
    ],
  },
  footer: {
    width: 320,
    alignSelf: 'center'
  }
})

const Nav = () => {
  return(
    <Navigation
      heading="Welcome"
      // right={
      //   <TouchableOpacity
      //     onPress={() => NavService.navigate("Storage")}
      //       hitSlop={mainStyles.touchArea}>
      //           <Text style={{ fontSize: 16 }}>Storage</Text>
      //   </TouchableOpacity>
      // }
  />
  )
}

class EnterScreen extends Component {

  state = {
      isReady: false,
      surveyCode: '',
      loading: false,
      isCodeIsValid: true,
      isFocused: false

  }

  constructor(props) {
    super(props)
    this.metadata = null
    this.projectService = ProjectService.instance
    this.permissionsService = PermissionsService.instance
  }

  componentDidMount() {
    this.didBlurSubscription = this.props.navigation.addListener(
    'willFocus',
      payload => {
        let surveyCode = payload.state?.params?.surveyCode
        if (surveyCode) {
          this.setState({
            surveyCode: surveyCode
          }, this.beforeValidate)
        }
      }
    );
  }
  componentWillUnmount() {
    this.didBlurSubscription.remove();
  }

  showFlashError(text) {
    showMessage({
        message: 'Error',
        description: text,
        type: 'danger',
        duration: 10000,
        icon: 'auto'
    })
  }

  async startAsResp() {
    this.setState({ loading: true }, () => {
      this.permissionsService.requestStartPermissions()
      .then(permission => {
        return this.goToSurvey()
      })
      .catch(e => this.showFlashError(e.message))
      .finally(() => this.setState({ loading: false}))
    })
  }

  handleEnterCode(text) {
    if(text.length > CODE_MAX_CHARACTERS) return
    this.setState({surveyCode: text})
  }

  beforeValidate() {
    request.then(this.startAsResp.bind(this))
  }

  isCodeIsValid() {
    return !this.state.isCodeIsValid
  }

  clearInput() {
    let { surveyCode } = this.state
    if (surveyCode.length)
      this.setState({surveyCode: '', isCodeIsValid: true})
  }

  handleFocus() {
    this.clearInput()
    this.setState({
      isFocused: true
    })
  }

  handleBlur() {
    this.setState({
      isFocused: false
    })
  }

  resetState() {
    this.setState({
      surveyCode: '',
      loading: false
    })
  }

  async goToSurvey() {
    let { surveyCode } = this.state
    this.metadata = await this.projectService.getCurrentProjectMetadata(surveyCode)
    if (!auth.userService.isUserAuthorized) this.metadata.isGuest = true
    this.metadata.hasNeuroQuestion = true // TODO: !delete question type binding
    this.resetState()
    this.props.navigation.navigate('Survey', {
      surveyMetaData: this.metadata
    })
  }

  renderNav() {
    return(
        <Navigation
        />
    )
  }

  renderFooter() {
    let { surveyCode } = this.state
    let { styles } = this.props
      return (
          <View>
            <TouchableOpacity style={[styles.linkToCode]} onPress={()=>NavService.navigate('CreateProject')}>
                <Text style={[styles.btnLink, {color: '#fff'}]}>What is the invitation code?</Text>
            </TouchableOpacity>
          <Button 
            style={[styles.btn, surveyCode.length ? {} : styles.btn_disabled]} bordered light full onPress={() => this.beforeValidate()}
            disabled={!surveyCode.length}>
              <Text style={[styles.btnText, {color: '#fff'}]} returnKeyType='send'>Next</Text>
          </Button>
      </View>
      )
  }

  render() {
    let { header, styles } = this.props
    let { surveyCode, loading, isFocused } = this.state
    let inputStyle = this.isCodeIsValid() && Boolean(surveyCode.length) ? true : false,
        errorText = Boolean(surveyCode.length) ? 'This code is not valid' : ''
    return (
            <Layout 
            navigation={<Nav />}
            footer={this.renderFooter()}
            contentStyle={styles.contentWrap}
            style={{ textAlign: 'center' }}
            styleFooter={styles.footer}
            loading={loading}
            stickyFooter>
                <Logo />
                <Text style={styles.title}>Enter your invitation code</Text>
                <Form>
                    <Item style={styles.item} error={ inputStyle }>
                        <Input 
                            placeholder="Type here"
                            onChangeText={(text) => this.handleEnterCode(text)}
                            onSubmitEditing={() => this.beforeValidate()}
                            onFocus={() => this.handleFocus()}
                            onBlur={() => this.handleBlur()}
                            value={surveyCode}
                            style={[styles.input, isFocused && styles.focused_input]}
                            />
                    </Item>
                    <View style={styles.item}>
                        <Text style={{ color: 'red', alignSelf: 'flex-start' }}>
                            {this.isCodeIsValid() && errorText}
                        </Text>
                    </View>
                </Form>
            </Layout>
        );
  }
}

export default withStyles(styles)(EnterScreen)