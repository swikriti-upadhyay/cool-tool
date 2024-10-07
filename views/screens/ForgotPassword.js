import React, { Component } from 'react'
import { Button, Text, Item, Icon } from 'native-base'
import { View, PixelRatio } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import { Form, Field } from 'react-native-validate-form'
import { observer } from 'mobx-react'

import NavService from '../../utils/navigation-service'
import StyleService from '../../utils/style-service'
import {auth} from '../../services/AuthService'
import {email, required} from '../../utils/validation-rules'
import ProjectService from '../../utils/project-service'
import {SurveyType} from '../../storage/data-storage-helper'

import {mainStyles} from '../../styles'
import Layout from '../layout/UxReality'
import Navigation from '../layout/Navigation'
import Logo from '@components/Logo'
import FloatingLabelInput from '@components/FloatingLabelInput'
const Nav = () => {
    return(
        <Navigation
        back={true}
        heading="Forgot Password"
        />
    )
}

@observer
export default class ForgotPasswordScreen extends Component {
  state = {
    secure: true,
    name: '',
    email: '',
    new_password: '',
    confirm_password: '',
    focusPasswordInput: false,
    focusEmailInput: false,
    errors: [],
    message: '',
    messageColor: 'red',
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

  toggleSecure() {
    this.setState({
        secure: !this.state.secure
    })
  }

  handleTextChange = (type, newText) => {
    this.setState({ [type]: newText, errors: [] })
  }

  validate() {
    let submitResults = this.myForm.validate();
    let errors = [];
    submitResults.forEach(item => {
      errors.push({ field: item.fieldName, error: item.error });
    });
    this.setState({ errors: errors });
  }

  renderMessage() {
    const { message, messageColor } = this.state
    return <Text style={{ color: messageColor }}>{message}</Text>
  }

  async submit() {
    let { email } = this.state
    this.setState({loading: true})
    try {
      let data = await auth.resetPassword(email)
      this.setState({
        message: data,
        messageColor: '#fff',
        loading: false
      })
    } catch(e) {
      this.setState({
        message: e.message,
        messageColor: 'red',
        loading: false
      })
    }
}

  focused() {
    this.setState({focusPasswordInput: false, focusEmailInput: false})
  }

  renderFooter = () => {
        return(
            <View>
                <Button style={styles.btn} light full onPress={()=>this.validate()}>
                    <Text style={[styles.btnText, {color: '#95BC3E'}]}>Send</Text>
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
                <Form ref={(ref) => this.myForm = ref} errors={this.state.errors} validate={true} submit={()=>this.submit()}>
                <Item style={{ borderBottomWidth: 0, justifyContent: 'center' }}>
                  <Text style={styles.text}>Enter email registered in UXReality {'\n'} and we send you a recovery link</Text>
                </Item>
                <Field
                        required
                        name="email"
                        component={FloatingLabelInput}
                        validations={[ required, email ]}
                        label="Enter email"
                        value={this.state.email}
                        returnKeyType='next'
                        keyboardType="email-address"
                        autoCapitalize='none'
                        onChangeText={(text) => this.handleTextChange('email', text)}
                        onSubmitEditing={()=>this.validate()}
                        onEndEditing={() => { this.focused() }}
                        errors={this.state.errors}
                    />
                    <Item style={{ borderBottomWidth: 0 }}>{this.renderMessage()}</Item>
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