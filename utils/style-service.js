import {
  Dimensions,
  StatusBar
} from 'react-native'
import {
  observable,
  computed
} from 'mobx'
import {deviceInfo} from './device-info-service'

//Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;

class StyleService {
  @observable width = Dimensions.get("window").width
  @observable height = Dimensions.get("window").height
  @observable viewMode = this.height > this.width ? "portrait" : "landscape"
  statusBarHeight = StatusBar.currentHeight

  constructor() {
    Dimensions.addEventListener("change", this.updateStyles);
  }

  static __instance = null

  static get instance() {
      if (StyleService.__instance === null)
          StyleService.__instance = new StyleService()
      return StyleService.__instance
  }

  listeners = [];

  attachListener(callback) {
    this.listeners.push(callback)
  }

  @computed get isLandscape() {
    return this.viewMode === 'landscape'
  }

  @computed get isMobilePortrait() {
    return this.viewMode === 'portrait' && !deviceInfo.isTablet()
  }

  @computed get isMobileLandscape() {
    return this.viewMode === 'landscape' && !deviceInfo.isTablet()
  }

  scale(size) {
    return this.width / guidelineBaseWidth * size
  }

  verticalScale(size) {
    return this.height / guidelineBaseHeight * size
  }

  moderateScale(size, factor = 0.5) {
    return size + ( this.scale(size) - size ) * factor
  }

  // componentWillUnmount() {
  //   Dimensions.removeEventListener("change", this.updateStyles);
  // }

  updateStyles = dims => {
      this.listeners.map(listener => listener(dims))
      let currentView = dims.window.height > dims.window.width ? "portrait" : "landscape"
      if (this.viewMode !== currentView)
          this.viewMode = currentView
          this.height = dims.window.height - this.statusBarHeight
          this.width = dims.window.width
          // this.resetStyles()
  }

  init(baseStyles, landscapeStyles) {
    this.baseStyles = baseStyles
    this.landscapeStyles = landscapeStyles
  }

  getStyle() {
      if (this.viewMode === 'landscape') {
        return {...this.baseStyles, ...this.landscapeStyles};
      } else {
        return this.baseStyles;
      }
  }

  static initialize() {
    if (StyleService.__instance == null) {
        StyleService.__instance = new StyleService()
    }
  }
}

export default StyleService.instance // create Singleton object
export {
  StyleService
}