import {
  action,
  observable,
  transaction,
  observe
} from 'mobx'
import NetInfo from "@react-native-community/netinfo";
import {
  showMessage,
  hideMessage
} from 'react-native-flash-message'

import i18n from './i18n'
import Logger from './logger'
import DataUploader from '../sync/data-uploader'

export default class NetInfoService {
  static __instance = null

  @observable isConnected = null
  unsubscribeListener = null

  constructor() {
    if (!NetInfoService.__instance) {
      observe(this, change => {
        this.onStatusChanged(change.newValue)
      })
    }
    return NetInfoService.__instance
  }

  static ERROR_MESSAGE = {
    message: i18n.t('no_internet'),
    description: i18n.t('please_check_internet'),
    type: 'danger',
    autoHide: false,
    hideOnPress: false,
    animationDuration: 50,
    icon: 'warning'
  }

  onStatusChanged(isConnected) {
    Logger.warn(`Network connection: ${isConnected}`)
    isConnected ? hideMessage() : this.showNetworkStatus()
    // isConnected && DataUploader.getInstance().upload()
  }

  handleConnectivityChange({
    isConnected
  }) {
    this.isConnected = isConnected
  }

  showNetworkStatus() {
    console.log(i18n.t('no_internet'))
    showMessage({
      message: i18n.t('no_internet'),
      description: i18n.t('please_check_internet'),
      type: 'danger',
      autoHide: false,
      hideOnPress: false,
      animationDuration: 50,
      icon: 'warning'
    })
  }

  unsubscribe() {
    this?.unsubscribeListener()
    return Promise.resolve() // for disposer
  }

  static init() {
    if (NetInfoService.__instance == null) {
      NetInfoService.__instance = new NetInfoService()
      return NetInfo.fetch()
        .then((state) => {
          NetInfoService.__instance.isConnected = state?.isConnected
        })
        .then(() => {
          NetInfoService.__instance.unsubscribeListener = NetInfo.addEventListener(data => NetInfoService.__instance.handleConnectivityChange(data))
        })
    }
  }

  static get instance() {
    return NetInfoService.__instance
  }
}