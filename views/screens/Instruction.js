import React, { Component } from 'react'
import { Button, Text, Item, Icon } from 'native-base'
import { View, ToastAndroid, PixelRatio } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import { Form, Field } from 'react-native-validate-form'
import SwitchSelector from 'react-native-switch-selector'
import NLCommon from 'react-native-nl-common'

import NavService from '../../utils/navigation-service'
import StyleService from '../../utils/style-service'
import CommonHelper from '../../utils/common-helper'
import {email, required} from '../../utils/validation-rules'

import {mainStyles, normalizeFont} from '../../styles'
import Constants from '../../constants'
import Layout from '../layout/UxReality'
import {Storages, SurveyType} from '../../storage/data-storage-helper'
import Navigation from '../layout/Navigation'
import FloatingLabelInput from '@components/FloatingLabelInput'
import { BaseComponent } from '@components/BaseComponent'
import Select from '@components/Form/Select2'
import { withSubscription } from '@components/Form/withSubscription'
import CheckBox from '@components/common/CheckBox'
import CheckIco from '@assets/images/check_ico.svg'
import withStore from '../../store/withStore'
import { Api } from '../../utils/Api'

const CustomSelect = withSubscription(Select)

const Nav = () => {
    return(
        <Navigation
            heading="New project"
        />
    )
}

const customIcon = (isSelected) => {
  const primaryDarkColor = EStyleSheet.value('$primaryDarkColor'),
        lightColor = EStyleSheet.value('$lightColor')
  return <Icon 
      type='MaterialCommunityIcons'
      name='clock-outline'
      style={{ marginRight: 7, color: isSelected ? primaryDarkColor : lightColor, fontSize: 20 }}
      ></Icon>
}

class Instruction extends BaseComponent {
  constructor(props) {
    super(props)
    this.surveyType = 1
    this.defaultData = {
      2: {
        title: 'Which website would you like to test?',
        name: Constants.defaultTestSiteUrl,
        labelName: 'Website URL*',
        placeholder: 'Enter website url*',
        labelTask: 'Website Task',
        labelPlaceHolder: 'Set the task for testing'
      },
      1: {
        title: 'What app would you like to test?',
        name: Constants.defaultTestSiteUrl,
        labelName: 'Application Name*',
        placeholder: 'Choose the app*',
        labelTask: 'Application Task',
        labelPlaceHolder: 'Set the task for testing'
      },
      3: {
        title: 'Which prototype would you like to test?',
        name: Constants.defaultTestSiteUrl,
        labelName: 'Prototype link*',
        placeholder: 'Enter prototype url*',
        labelTask: 'Prototype Task',
        labelPlaceHolder: 'Set the task for testing'
      }
    }
  }
  state = {
    appsList: [],
    deviceList: [],
    currentApp: null,
    loading: false,
    surveyType: 2,
    timeout: 0,
    name: '',
    task: '',
    errors: [],
    visibleDefaultButton: true,
    focusTaskInput: false,
    neverAsk: false,
    deviceOrientation: '',
    defaultProtoDevice: ''
  }

  componentDidMount() {
    const surveyType = this.props.navigation.getParam('surveyType');
    this.setState({
      surveyType: surveyType,
      timeout: Constants.DefaultTime
    })
    this.getDataFromStore()
  }

  async getDataFromStore() {
      this.settings = await Storages.SettingsStorage.getSettings()
      let name,
        currentApp,
        task,
        timeout,
        defaultProtoDevice,
        deviceOrientation
      if (this.isWebSite) {
        name = this.settings.defaultTestSiteUrl || ''
        task = this.settings.taskText
      } else if (this.isProto) {
        name = this.settings.defaultProtoLink || ''
        task = this.settings.defaultProtoTask || ''
        defaultProtoDevice = this.settings.defaultProtoDevice || ''
        deviceOrientation = this.settings.deviceOrientation || ''
      } else {
        name = this.settings.applicationName || ''
        currentApp = CommonHelper.getAppNameFromObj(name)
        task = this.settings.applicationTask
      }
      timeout = this.settings.timeout
      this.setState({
        name,
        currentApp,
        task,
        timeout,
        defaultProtoDevice,
        deviceOrientation
      })
  }

  get isWebSite() {
    return SurveyType.ANON_WEB_TEST === this.state.surveyType
  }

  get isApp() {
    return SurveyType.ANON_APP_TEST === this.state.surveyType
  }

  get isProto() {
    return SurveyType.ANON_PROT_TEST === this.state.surveyType
  }

  get currentData() {
    return this.defaultData[this.state.surveyType]
  }

  getStyle(){
    let baseStyles = styles
    if (StyleService.viewMode === 'landscape') {
      return {...baseStyles, ...landscapeStyles};
    } else {
      return baseStyles;
    }
  }

  showLoader(state) {
    this.setState({
      loading: state
    })
  }

  async goToSurvey() {
    let code = this.props.defaultProjectCode || 'universal';
    let survType = this.props.navigation.getParam('surveyType')
    let projectService = this.props.navigation.getParam('projectService')
    this.showLoader(true)
        try {
            this.metadata = await projectService.getDefaultProjectMetadataNew(code, survType, this.state.timeout)
            if (this.metadata) {
                NavService.navigate('Survey', {
                    surveyMetaData: this.metadata,
                    userType: this.props.navigation.getParam('userType')
                })
            } else
                throw new Error('Unable to obtain metadata')
        } catch (e) {
          console.log('Unable to fetch data')
        }
        this.showLoader(false)
}

  handleTextChange = (type, newText) => {
    if(type === 'name') {
      newText = newText.replace(/\s/g, '')
      this.setState({
        visibleDefaultButton: !newText.length
      })
    }
    this.setState({ [type]: newText })
  }

  setDefaultSite() {
    this.setState({
      name: this.currentData.name,
      visibleDefaultButton: false
    })
  }

  isNameFilled() {
    return this.isApp ? !!this.state.name.length : !!this.state.name.length && this.isSiteValid()
  }

  hasProtocol(url) {
    return /^https?:\/\//.test(url)
  }

   onFocus() {
    if (this.isApp) return
    if (!this.hasProtocol(this.state.name)) this.setState(
      (prevState, props) => {
        return {
          name: 'https://' + prevState.name
        };
      }
    )
  }

  onBlur() {
    if (this.state.name === 'https://')
      this.setState(
        (prevState, props) => {
          return {
            name: ''
          };
        }
      )
  }

  focused() {
    this.setState({focusTaskInput: false})
  }

  isSiteValid() {
    return (/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(this.state.name))
  }

  isValid() {
    if (this.isProto) {
      return this.isNameFilled() && this.state.defaultProtoDevice.length && this.state.deviceOrientation
    }
    return (this.isWebSite ? this.isSiteValid() : this.isNameFilled()) && !!this.state.timeout
  }

  async save() {
      const { name, task, timeout, neverAsk, defaultProtoDevice, deviceOrientation } = this.state
      this.settings = await Storages.SettingsStorage.getSettings()
      if (this.isWebSite) {
        this.settings.defaultTestSiteUrl = name
        this.settings.taskText = task
        this.settings.neverAskSite = neverAsk
      } else if (this.isProto) {
        this.settings.defaultProtoLink = name
        this.settings.defaultProtoTask = task
        this.settings.neverAskProto = neverAsk
        this.settings.defaultProtoDevice = defaultProtoDevice
        this.settings.deviceOrientation = deviceOrientation
      } else {
        this.settings.applicationName = name
        this.settings.applicationTask = task
        this.settings.neverAskApp = neverAsk
      }
      this.settings.timeout = timeout
      await Storages.SettingsStorage.update(this.settings)
      this.goToSurvey()
  }

  next() {
    this.setState({focusTaskInput: true})
  }

  async getDeviceList() {
    // let res = await Api.post('GetPrototypeDeviceCommand.cmd', {"action":"getlist"})
    let data = res.data.map(item => {
      return {
        name: item.title, value: item.id
      }
    })
    this.setState({deviceList: data})
    return data
  }

  renderTask() {
    return(
        <View style={styles.categoryItem}>
          <FloatingLabelInput
              label={this.currentData.labelTask}
              placeholder={this.currentData.labelPlaceHolder}
              multiline={true}
              value={this.state.task}
              onChangeText={(text) => this.handleTextChange('task', text)}
              focus={this.state.focusTaskInput}
          />
        </View>
    )
  }

  renderButton() {
      if (this.isWebSite) return (
        <View>
            <Text style={styles.greyText}>or</Text>
          <Button style={[this.getStyle().btn, {marginBottom: 16}]} bordered light full onPress={()=> this.setDefaultSite()}>
              <Text style={[this.getStyle().btnText, {color: '#fff'}]}>Use default website</Text>
          </Button>
          <Text style={{  marginTop: 40, textAlign: 'center' }}>You can always change the website used by default in Settings</Text>
        </View>
      )
      else return <View />
  }

  renderSettings() {
    let curTime = Constants.TestingTime.find((time) => time.value === this.state.timeout)
      return <View style={styles.categoryItem}>
                <CustomSelect
                    label='Testing time'
                    placeholder='Set testing time*'
                    currentItem={curTime}
                    title='Set testing time*'
                    data={Constants.TestingTime}
                    onSave={(item) => this.handleSaveTime(item)}
                    labelStyle={mainStyles.surveyLabel}
                />
            </View>
  }

  renderFooter = () => {
        return(
            <View>
                <Button style={[styles.btn, !this.isValid() && styles.nextButtonDisabled]} light full onPress={()=>this.save()} disabled={!this.isValid()}>
                    <Text style={[styles.btnText, {color: '#95BC3E'}]}>Next</Text>
                </Button>
            </View>
        )
    }

    async getApps() {
      let apps = await NLCommon.getNonSystemApps()
      // let data = apps.data
      let data = apps.map((app, key) => {
          return {
            id: key,
            name: app.appName,
            value: app.packageName
          }
        })
        this.setState({appsList: data})
        return data
    }

  handleSave(item) {
    let curApp = this.state.appsList.find((app) => app.id  === item.id)
    let dbValue = JSON.stringify(curApp)
    if (!dbValue) return
        this.setState({
            currentApp: curApp,
            name: dbValue
        })
  }

  handleSaveTime(item) {
    let curTime = Constants.TestingTime.find((time) => time.value === item.value)
      this.setState({
          timeout: curTime.value
      })
  }

  handleSaveItem(stateName, item) {
    this.setState({
      [stateName]: item.value
    })
  }

    renderName() {
      if (this.isApp) {
        let curApp = this.state.currentApp
        return (
            <Select
                onLoad={() => this.getApps()}
                data={this.state.appsList}
                currentItem={curApp}
                label={this.currentData.labelName}
                placeholder={this.currentData.placeholder}
                title={this.currentData.placeholder}
                onSave={(item) => this.handleSave(item)}
                labelStyle={mainStyles.surveyLabel}
            />
        )
      } else {
        return (
          <FloatingLabelInput
            label={this.currentData.labelName}
            placeholder={this.currentData.placeholder}
            value={this.state.name}
            onChangeText={(text) => this.handleTextChange('name', text)}
            autoCapitalize='none'
            autoCompleteType='off'
            importantForAutofill='no'
            autoCorrect={false}
            keyboardType='url'
            returnKeyType='next'
            onFocus={() => this.onFocus()}
            onBlur={() => this.onBlur()}
            onSubmitEditing={() => { this.next() }}
            onEndEditing={() => { this.focused() }}
            blurOnSubmit={false}
            />
        )
      }
    }

  get isTaskFilled() {
    return !!this.state.task.length
  }

  handleDoNotAsk(state) {
    this.setState({
      neverAsk: state
    })
  }

  renderAdditional() {
    return (
      <View>
        {this.renderTask()}
        {this.renderSettings()}
        {this.isProto && this.renderProto()}
        <View style={styles.checkboxContainer}>
          <CheckBox 
              checkIcon={CheckIco}
              labelStyle={{ color: 'rgba(0,0,0,0.5)'}}
              checkBoxStyle={{ borderColor: '#fff' }}
              checkBoxStyleChecked={{ backgroundColor: '#fff' }}
              onSelected={this.handleDoNotAsk.bind(this)}>
                <Text style={styles.checkBoxText}>Set as default task and do not ask anymore</Text>
          </CheckBox>
        </View>
      </View>
    )
  }

  renderProto() {
    let deviceOrientation = Constants.DeviceOrientation.find((item) => item.value === this.state.deviceOrientation)
    return <View>
      <View style={styles.categoryItem}>
        <Select
            onLoad={() => this.getDeviceList()}
            data={this.state.deviceList}
            currentValue={this.state.defaultProtoDevice}
            label='Device'
            placeholder='Set device*'
            title='Set device*'
            onSave={(item) => this.handleSaveItem('defaultProtoDevice', {value: item.name})}
            labelStyle={mainStyles.surveyLabel}
        />
        </View>
        <View style={styles.categoryItem}>
        <CustomSelect
            label='Device orientation'
            placeholder='Set device orientation*'
            currentItem={deviceOrientation}
            title='Set device orientation*'
            data={Constants.DeviceOrientation}
            onSave={(item) => this.handleSaveItem('deviceOrientation', item)}
            labelStyle={mainStyles.surveyLabel}
        />
        </View>
    </View>
  }

  render() {
    return (
            <Layout
            navigation={<Nav />}
            footer={this.renderFooter()}
            contentStyle={this.getStyle().contentWrap}
            loading={this.state.loading}
            stickyFooter>
                <Text style={styles.questionName}>{this.currentData.title}</Text>
                <Form ref={(ref) => this.myForm = ref} errors={this.state.errors} validate={true}>
                  <View style={styles.categoryItem}>{this.renderName()}</View>
                    {this.isNameFilled() ? this.renderAdditional() : this.renderButton()}
                </Form>
            </Layout>
        );
  }
}

export default withStore(Instruction)

const styles = EStyleSheet.create({
    // $outline: 1,
    switch: {
      width: '100%',
  },
    item: {
        marginBottom: 10
    },
    categoryItem: {
      marginBottom: 16
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
    greyText: {
      marginVertical: 20,
      textAlign: 'center',
      color: 'rgba(255, 255, 255, 0.5)'
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
      nextButtonDisabled: {
        backgroundColor: '#fff',
        opacity: .5
    },
    questionName: {
        marginVertical: 32,
        fontFamily: 'ProximaBold',
        fontSize: normalizeFont(24),
        color: '#fff'
    },
    checkboxContainer: {
      marginTop: 25,
    },
    checkBoxText: {
      fontFamily: 'ProximaRegular',
      fontSize: 15,
      color: '#fff'
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