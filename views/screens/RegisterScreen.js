import React, { Component } from 'react'
import { Button, Text, Item, Icon } from 'native-base'
import { View, TouchableOpacity, PixelRatio } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import { Form, Field } from 'react-native-validate-form'
import { observer } from 'mobx-react'

import request from '../../utils/request-service'
import NavService from '../../utils/navigation-service'
import StyleService from '../../utils/style-service'
import {auth} from '../../services/AuthService'
import {email, required, password} from '../../utils/validation-rules'
import ProjectService from '../../utils/project-service'
import {SurveyType} from '../../storage/data-storage-helper'

import {mainStyles, normalizeFont } from '../../styles'
import Layout from '../layout/UxReality'
import Navigation from '../layout/Navigation'
import Logo from '@components/Logo'
import FloatingLabelInput from '@components/FloatingLabelInput'
const Nav = (forceAction) => {
    return(
        <Navigation
        back={true}
        heading="Sign Up"
        right={
          <TouchableOpacity
              onPress={() => NavService.navigate("Login", forceAction)}
                hitSlop={mainStyles.touchArea}>
                    <Text style={{ fontSize: 16 }}>Sign In</Text>
            </TouchableOpacity>
        }
        />
    )
}

@observer
export default class RegisterScreen extends Component {
  state = {
    secure: true,
    name: '',
    job: '',
    email: '',
    password: '',
    focusPasswordInput: false,
    focusEmailInput: false,
    focusJob: false,
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
    this.forceAction = this.props.navigation.getParam('forceAction', null)
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
    let {name, email, password, job} = this.state
    this.setState({loading: true})
    await auth.signUp({name, email, password, job}, (code)=> {
      NavService.resetAction('Home')
    }, (e)=>{
        this.setState({
            errorMessage: e.message,
            loading: false
        })
    })
  }

  handleFocus(e) {
    const newErrors = [...this.state.errors]
    const errors = newErrors.filter(error => error.field != e)
    this.setState({errors, errorMessage: ''})
  }

  focused() {
    this.setState({focusPasswordInput: false, focusEmailInput: false, focusJob: false})
  }

  nextJob() {
    this.setState({focusJob: true})
  }

  nextEmail() {
    this.setState({focusEmailInput: true})
  }
  nextPassword() {
    this.setState({focusPasswordInput: true})
  }

  renderFooter = () => {
        return(
            <View>
                <Button style={styles.btn} light full onPress={()=>this.beforeValidate()}>
                    <Text style={[styles.btnText, {color: '#95BC3E'}]}>Register</Text>
                </Button>
            </View>
        )
    }

  render() {
    // TODO: refactor this peace of shit
    return (
            <Layout 
            navigation={<Nav forceAction={this.forceAction}/>}
            footer={this.renderFooter()}
            contentStyle={this.getStyle().contentWrap}
            loading={this.state.loading}
            stickyFooter>
                <Logo wrapStyle={this.getStyle().logo} />
                <Form ref={(ref) => this.myForm = ref} errors={this.state.errors} validate={true} submit={()=>this.submit()}>
                    <Field
                        required
                        name="name"
                        component={FloatingLabelInput}
                        validations={[ required ]}
                        label="Enter name"
                        value={this.state.name}
                        returnKeyType='next'
                        autoCapitalize='none'
                        onFocus={() => this.handleFocus("name")}
                        onChangeText={(text) => this.handleTextChange('name', text)}
                        onSubmitEditing={() => { this.nextJob() }}
                        onEndEditing={() => { this.focused() }}
                        errors={this.state.errors}
                    />
                    <Field
                        required
                        name="job"
                        component={FloatingLabelInput}
                        validations={[ required ]}
                        label="Job title"
                        value={this.state.job}
                        returnKeyType='next'
                        autoCapitalize='none'
                        onFocus={() => this.handleFocus("job")}
                        onChangeText={(text) => this.handleTextChange('job', text)}
                        onSubmitEditing={() => { this.nextEmail() }}
                        onEndEditing={() => { this.focused() }}
                        focus={this.state.focusJob}
                        errors={this.state.errors}
                    />
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
                        onFocus={() => this.handleFocus("email")}
                        onChangeText={(text) => this.handleTextChange('email', text)}
                        onSubmitEditing={() => { this.nextPassword() }}
                        onEndEditing={() => { this.focused() }}
                        blurOnSubmit={false}
                        focus={this.state.focusEmailInput}
                        errors={this.state.errors}
                    />
                    <Field
                        required
                        component={FloatingLabelInput}
                        validations={[ required, password ]}
                        label="Enter password"
                        name="password"
                        value={this.state.password}
                        onFocus={() => this.handleFocus("password")}
                        onChangeText={(password) => this.handleTextChange('password', password)}
                        onSubmitEditing={()=>this.beforeValidate()}
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