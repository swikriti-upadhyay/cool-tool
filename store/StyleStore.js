import {
    Dimensions
  } from 'react-native'
  import {
    observable,
    computed
  } from 'mobx'

  import remotedev from 'mobx-remotedev/lib/dev';

  import {deviceInfo} from '../utils/device-info-service'
  import styleService from '../utils/style-service'
  
  //Guideline sizes are based on standard ~5" screen mobile device
  const guidelineBaseWidth = 350;
  const guidelineBaseHeight = 680;

class StyleStore {
    @observable width = Dimensions.get("window").width
    @observable height = Dimensions.get("window").height
    @observable viewMode = styleService.height > styleService.width ? "portrait" : "landscape"

    constructor(rootStore) {
        this.rootStore = rootStore
        styleService.attachListener(this.updateStyles);
    }
    
      @computed get isLandscape() {
        return styleService.viewMode === 'landscape'
      }
    
      @computed get isMobilePortrait() {
        return styleService.viewMode === 'portrait' && !deviceInfo.isTablet()
      }
    
      @computed get isMobileLandscape() {
        return styleService.viewMode === 'landscape' && !deviceInfo.isTablet()
      }

      @computed get isTablet() {
          return deviceInfo.isTablet()
      }
    
      scale(size) {
        return styleService.width / guidelineBaseWidth * size
      }
    
      verticalScale(size) {
        return styleService.height / guidelineBaseHeight * size
      }
    
      moderateScale(size, factor = 0.5) {
        return size + ( styleService.scale(size) - size ) * factor
      }

      updateStyles = dims => {
        let currentView = dims.window.height > dims.window.width ? "portrait" : "landscape"
        if (this.viewMode !== currentView)
            this.viewMode = currentView
            this.height = dims.window.height
            this.width = dims.window.width
            // this.resetStyles()
    }
    
}

export default remotedev(StyleStore, { global: true })