import React, { Component } from 'react'
import { Button, Text, Item, Icon } from 'native-base'
import { View, ToastAndroid, PixelRatio } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import { Form, Field } from 'react-native-validate-form'
import { observer } from 'mobx-react'

import NavService from '../../utils/navigation-service'
import StyleService from '../../utils/style-service'
import {auth} from '../../services/AuthService'
import {email, required} from '../../utils/validation-rules'
import ProjectService from '../../utils/project-service'
import NavigationService from '../../utils/navigation-service'
import {SurveyType} from '../../storage/data-storage-helper'

import {mainStyles} from '../../styles'
import Layout from '../layout/UxReality'
import Navigation from '../layout/Navigation'
import Logo from '@components/Logo'
import FloatingLabelInput from '@components/FloatingLabelInput'
const Nav = () => {
    return(
        <Navigation
        back={false}
            left={
                <Button
                    transparent
                    onPress={() => NavService.reset("Login")}
                    >
                    <Icon name='arrow-back' />
                </Button>
            }
        heading="Reset Password"
        />
    )
}

@observer
export default class ResetPasswordScreen extends Component {
  state = {
    secure_new: true,
    secure_confirm: true,
    new_password: '',
    confirm_password: '',
    focusNextPasswordInput: false,
    focusEmailInput: false,
    errors: [],
    errorMessage: '',
    loading: false
  }

  constructor(props) {
    super(props)
    this.projectService = ProjectService.instance
    this.resetHash = this.props.navigation.getParam('resetHash')
  }

  getStyle(){
    let baseStyles = styles
    if (StyleService.viewMode === 'landscape') {
      return {...baseStyles, ...landscapeStyles};
    } else {
      return baseStyles;
    }
  }

  toggleSecure(stateName) {
    this.setState({
        [stateName]: !this.state[stateName]
    })
  }

  handleTextChange = (type, newText) => {
    this.setState({ [type]: newText, errors: [] })
  }

  validate() {
    let submitResults = this.myForm.validate();
    let errors = [],
        hasErrors = false,
        { new_password , confirm_password } = this.state
    submitResults.forEach(item => {
      errors.push({ field: item.fieldName, error: item.error });
      if (!hasErrors) {
       hasErrors = !!item.error.length
      }
    });
    if (!hasErrors) {
      (new_password !== confirm_password) ? errors[errors.length - 1].error = 'Fields do not match' : this.submit()
    }
    this.setState({ errors: errors });
  }

  renderErrorMessage() {
    return <Text style={{ color: 'red' }}>{this.state.errorMessage}</Text>
  }

  async submit() {
    let { new_password } = this.state
    this.setState({loading: true})
    try {
      let data = await auth.changePassword(new_password, this.resetHash)
      ToastAndroid.show(data, ToastAndroid.SHORT)
      NavigationService.resetAction('Login')
    } catch(e) {
      this.setState({
        errorMessage: e.message,
        loading: false
    })
    }
  }

  focused() {
    this.setState({focusNextPasswordInput: false, focusEmailInput: false})
  }

  nextPassword() {
    this.setState({focusNextPasswordInput: true})
  }

  renderFooter = () => {
        return(
            <View>
                <Button style={styles.btn} light full onPress={()=>this.validate()}>
                    <Text style={[styles.btnText, {color: '#95BC3E'}]}>Change Password</Text>
                </Button>
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
                <Logo wrapStyle={this.getStyle().logo} />
                <Form ref={(ref) => this.myForm = ref} errors={this.state.errors} validate={true}>
                    <Field
                        required
                        component={FloatingLabelInput}
                        validations={[ required ]}
                        label="Enter new password"
                        name="new_password"
                        value={this.state.new_password}
                        onChangeText={(password) => this.handleTextChange('new_password', password)}
                        onSubmitEditing={() => { this.nextPassword() }}
                        onEndEditing={() => { this.focused() }}
                        returnKeyType='next'
                        secureTextEntry={this.state.secure_new}
                        errors={this.state.errors}
                    >
                        <Icon 
                          type="MaterialIcons"
                          style={{ position: 'absolute', right: 0, top: 10, fontSize: 30, color: '#ffffff80', paddingTop: 0, paddingRight: 0 }}
                          name={this.state.secure_new ? 'visibility' : 'visibility-off'}
                          onPress={()=>this.toggleSecure('secure_new')} />
                    </Field>
                    <Field
                        required
                        component={FloatingLabelInput}
                        validations={[ required ]}
                        label="Cofnfirm password"
                        name="confirm_password"
                        value={this.state.confirm_password}
                        onChangeText={(password) => this.handleTextChange('confirm_password', password)}
                        onSubmitEditing={()=>this.validate()}
                        returnKeyType='send'
                        secureTextEntry={this.state.secure_confirm}
                        focus={this.state.focusNextPasswordInput}
                        errors={this.state.errors}
                    >
                        <Icon 
                          type="MaterialIcons"
                          style={{ position: 'absolute', right: 0, top: 10, fontSize: 30, color: '#ffffff80', paddingTop: 0, paddingRight: 0 }}
                          name={this.state.secure_confirm ? 'visibility' : 'visibility-off'}
                          onPress={()=>this.toggleSecure('secure_confirm')} />
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
        marginBottom: 10
    },
    label: {
      top: -10
    },
    input: {
        textAlign: 'left',
        fontSize: 20,
        height: 43,
        lineHeight: 43
    },
    text: {
        textAlign: 'center',
        height: 52,
        fontWeight: '600'
    },
    btn: {
        height: 52,
        // borderWidth: 2,
        // borderColor: '#fff',
        borderRadius: 8,
        justifyContent: "center",
        shadowOpacity: 0,
        shadowRadius: 0,
        shadowOffset: { height: 0, width: 0 },
        elevation:0
    },
    btnText: {
        fontSize: 20 / PixelRatio.getFontScale()
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