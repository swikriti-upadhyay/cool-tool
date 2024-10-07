import React, { Component } from 'react'
import { Button, Text,  Item, Icon } from 'native-base'
import { View, TouchableOpacity, PixelRatio } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import { Form, Field } from 'react-native-validate-form'
import { observer } from 'mobx-react'

import NavService from '../../utils/navigation-service'
import request from '../../utils/request-service'
import StyleService from '../../utils/style-service'
import ProjectService from '../../utils/project-service'
import {SurveyType} from '../../storage/data-storage-helper'

import {mainStyles, normalizeFont} from '../../styles'
import Layout from '../layout/UxReality'
import Navigation from '../layout/Navigation'
import Logo from '@components/Logo'
import FloatingLabelInput from '@components/FloatingLabelInput'
import {auth} from '../../services/AuthService'
import Constants from '../../constants'
import {email, required} from '../../utils/validation-rules'
import {Storages} from '../../storage/data-storage-helper'

const Nav = () => {
    return(
        <Navigation
        back={true}
        heading="Sign In"
        // right={
        //     <TouchableOpacity
        //       onPress={() => NavService.navigate("Register")}
        //         hitSlop={mainStyles.touchArea}>
        //             <Text style={{ fontSize: 16 }}>Sign Up</Text>
        //     </TouchableOpacity>
        // }
        />
    )
}

@observer
export default class LoginScreen extends Component {
  state = {
    secure: true,
    email: '',
    password: '',
    focusPasswordInput: false,
    errors: [],
    errorMessage: '',
    loading: false
  }

  constructor(props) {
    super(props)
    this.projectService = ProjectService.instance
    this.forceAction = null
  }

  componentDidMount() {
    let settingsStorage = Storages.SettingsStorage
    settingsStorage.getSettings()
    .then((settings) => {
      if(!settings?.terms) {
        NavService.replace('Terms', { replace: 'Login' })
      }
    })
    
    // this.forceAction = this.props.navigation.getParam('forceAction', null)
  }

  
  getStyle(){
    let baseStyles = styles
    if (StyleService.viewMode === 'landscape') {
      return {...baseStyles, ...landscapeStyles};
    } else {
      return baseStyles;
    }
  }

  toggleSecure() {
    this.setState({
        secure: !this.state.secure
    })
  }
  
  handleTextChange = (type, newText) => {
    this.setState({ [type]: newText })
  }

  beforeValidate() {
    request.then(this.validate.bind(this))
  }

  validate() {
    let submitResults = this.myForm.validate();
    let errors = [];
    submitResults.forEach(item => {
      errors.push({ field: item.fieldName, error: item.error });
    });
    this.setState({ errors: errors });
  }

  renderErrorMessage() {
    return <Text style={{ color: 'red' }}>{this.state.errorMessage}</Text>
  }

  async submit() {
    let {email, password} = this.state
    this.setState({loading: true})
    await auth.signIn('email', {email, password}, ()=> {
      NavService.resetAction('Home')
    }, (e)=>{
        this.setState({
          errorMessage: e.message,
          loading: false
        })
    })
  }

  async authorizeByToken() {
    await auth.authorizeByToken(this.state.email, ()=> NavService.resetAction('Home'))
  }

  handleFocus(e) {
    const newErrors = [...this.state.errors]
    const errors = newErrors.filter(error => error.field != e)
    this.setState({errors, errorMessage: ''})
  }

  focused() {
    this.setState({focusPasswordInput: false})
  }

  next() {
    this.setState({focusPasswordInput: true})
  }

  renderFooter = () => {
      return(
          <View>
              <Button style={styles.btn} light full onPress={()=>this.beforeValidate( )}>
                  <Text style={[styles.btnText, {color: '#95BC3E'}]}>Start</Text>
              </Button>
              {Constants.isDebug && <Button style={[styles.btn,{marginTop: 15}]} light full onPress={()=>this.authorizeByToken( )}>
                  <Text style={[styles.btnText, {color: '#95BC3E'}]}>Auth by code</Text>
              </Button>}
          </View>
      )
  }

  render() {
    return (
            <Layout 
            navigation={<Nav />}
            footer={this.renderFooter()}
            contentStyle={this.getStyle().contentWrap}
            loading={this.state.loading}
            stickyFooter>
                <Logo wrapStyle={this.getStyle().logo}/>
                <Form style={{ marginBottom: 25 }} ref={(ref) => this.myForm = ref} errors={this.state.errors} validate={true} submit={()=>this.submit()}>
                    <Field
                        required
                        name="email"
                        component={FloatingLabelInput}
                        validations={[ required, email ]}
                        errorMessages={['This field is required', 'Email invalid']}
                        label="Enter email"
                        value={this.state.email}
                        returnKeyType='next'
                        keyboardType="email-address"
                        autoCapitalize='none'
                        onFocus={() => this.handleFocus("email")}
                        onChangeText={(text) => this.handleTextChange('email', text)}
                        onSubmitEditing={() => { this.next() }}
                        onEndEditing={() => { this.focused() }}
                        blurOnSubmit={false}
                        errors={this.state.errors}
                    />
                    <Field
                        required
                        component={FloatingLabelInput}
                        validations={[ required ]}
                        label="Enter password"
                        name="password"
                        value={this.state.password}
                        onFocus={() => this.handleFocus("password")}
                        onChangeText={(password) => this.handleTextChange('password', password)}
                        onSubmitEditing={()=>this.validate()}
                        returnKeyType='send'
                        secureTextEntry={this.state.secure}
                        focus={this.state.focusPasswordInput}
                        errors={this.state.errors}
                    >
                        <Icon 
                          type="MaterialIcons"
                          style={{ position: 'absolute', right: 0, top: 10, fontSize: 30, color: '#ffffff80', paddingTop: 0, paddingRight: 0 }}
                          name={this.state.secure ? 'visibility' : 'visibility-off'}
                          onPress={()=>this.toggleSecure()} />
                    </Field>
                    <Item style={{ borderBottomWidth: 0 }}>{this.renderErrorMessage()}</Item>
                </Form>
            </Layout>
        );
  }
}


const styles = EStyleSheet.create({
    // $outline: 1,
    item: {
        marginTop: 0
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
        fontSize: normalizeFont(18)
    },
    logo: {
      marginVertical: 65,
      '@media (min-width: 600) and (max-width: 1024)': {
        marginVertical: 110,
      },
    },
    contentWrap: {
      '@media (min-width: 600) and (max-width: 1024)': {
        width: 440,
        alignSelf: 'center'
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