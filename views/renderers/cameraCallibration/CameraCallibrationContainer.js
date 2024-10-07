import React from 'react';
import { Text, View, ToastAndroid, Platform, Alert, StyleSheet } from 'react-native';
import * as Permissions from 'expo-permissions';
import * as FaceDetector from 'expo-face-detector';
import { Camera } from 'expo-camera';
import EStyleSheet from 'react-native-extended-stylesheet'

import Orientation from 'react-native-orientation-locker'

import PrimaryButton from '../../components/primary-btn-component'
import Loader from '../../common/loader-view'
import Logger from '../../../utils/logger'
import {Storages} from '../../../storage/data-storage-helper'
import DeviceShakeInfo from '../../../utils/device-shake-info'
import BaseRenderer from '../base-renderer'
import StyleService from '../../../utils/style-service'
import CameraRecorder from 'react-native-simple-camera-recorder'
import { observe } from 'mobx'
// import ServiceRunner from '../../../ServiceExample'
// import FullScreen from 'react-native-full-screen'

const errorsMessage = {
    '1': 'No faces has been detected.',
    '21': 'Face is too dark. Reduce background lights.',
    '22': 'Face is too dark. Try to brighten up your face.',
    '3': 'Face is too bright.',
    '41': 'Your left eye is too dark',
    '42': 'Your right eye is too dark',
    '5': 'Image is blurry. Please, hold your device still.',
    '6': 'Align your face towards the camera.',
    '7': 'Place your head in frame\'s center',
    '81': 'You\'re sitting too far, move closer to the camera.',
    '82': 'You\'re sitting too close, move further from the camera.',
    '9': 'Your face is not evenly illuminated.',
    '51': 'Ensure that camera is focused on your face, not on contrast background behind you',
    '10': 'In glasses, the test result may be distorted.',
}

const skipErrors = [6, 7, 10]
const warningMessage = {
  '10': 'In glasses, the test result may be distorted.',
}

const defaultAspectRatio = () => {
  return (StyleService.height / StyleService.width).toFixed(2) + ':1'
}

export default class FaceDetection extends BaseRenderer {
  get className() { return 'FaceDetection' }
  constructor(props) {
    super(props)
    observe(StyleService, change => {
      if (change.newValue !== change.oldValue) {
        this.setState({
          validating: true
        }, () => this.setState({validating: false}))
      }
    })
  }
  state = {
    hasCameraPermission: null,
    selectedCamera: Camera.Constants.Type.front,
    ratio: '16:9',
    screenRatio: 3/4,
    ratios: [],
    faces: [],
    pictureSize: "1280x720",
    pictureSizes: [],
    pictureSizeId: 0,
    isDebug: false,
    isReady: false,
    errors: [],
    isFaceDetected: false,
    visibleToast: false,
    cameraReady: false
  };
  shaker = null
  shakerTimer = null

  async componentDidMount() {
    // FullScreen.onFullScreen();
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
    try {
        this.shaker = new DeviceShakeInfo()
        this.shaker.subscribe()
    } catch(e) {
        Logger.warn(e)
    }
  }

  componentWillUnmount() {
    this.shaker.unsubscribe()
}

static preferedProfiles = Platform.Version === 23 ? ['QUALITY_480P'] : ['QUALITY_1080P', 'QUALITY_720P', 'QUALITY_HIGH', 'QUALITY_480P'];

    getProfile(profiles) {
        let allProfiles = JSON.parse(profiles)
        let onlySupported = []
        for (let p in allProfiles) {
            if (allProfiles[p] === "true")//TODO
                onlySupported.push(p.toLocaleUpperCase())
        }  

        let profile = ''
        for (let i = 0; i < FaceDetection.preferedProfiles.length; i++) {
            if (onlySupported.indexOf(FaceDetection.preferedProfiles[i]) >= 0) {
                profile = FaceDetection.preferedProfiles[i]
                break
            }
        }


        Logger.log('profile: ' + profile)
        
        return profile
    }

    lockRotation() {
        Orientation.getOrientation(
            (orientation)=> {
                switch(orientation) {
                    case "PORTRAIT-UPSIDEDOWN":
                        return Orientation.lockToPortraitUpsideDown()
                    case "PORTRAIT":
                        return Orientation.lockToPortrait()
                    case "LANDSCAPE-LEFT":
                        return Orientation.lockToLandscapeLeft()
                    case "LANDSCAPE-RIGHT":
                        return Orientation.lockToLandscape()
                }
            }
        )
    }

async start() {
    try {

        let settings = await Storages.SettingsStorage.getSettings()

        let cameraLength = await CameraRecorder.getCamerasLength()

        if (!cameraLength || cameraLength < 1)
            throw new Error('No cameras found')
        let selectedCamera = settings.selectedCamera
        if (selectedCamera < 0) {
            selectedCamera = 1
        }

        this.setState({
            cameraLength: cameraLength,
            selectedCamera: selectedCamera
        })
        this.builtinFaceDetection = settings.builtinFaceDetection
        this.advancedFaceValidation = settings.advancedFaceValidation
        if (!settings.builtinFaceDetection) {
            this.setState({isFaceDetected: true})
        }
        await super.start()
    } catch (e) {
        Logger.error(e)
        this.setState({
            error: e.message
        })
    }
    this.setState({
        isReady: true
    })
}

finish(data) {
  Logger.log('Calibration is finished')
  return super.finish(data)
}

  takePicture = async function() {
    let cameraPicture = await this.createPicture()
    this.validateImage({image: cameraPicture.image, orientation: cameraPicture.orientation})
  };

  getRatio = async function () {
    let ratio = await this.camera.getSupportedRatiosAsync()
    ToastAndroid.showWithGravity(
        ratio,
        ToastAndroid.LONG,
        ToastAndroid.CENTER
    )
  }

    async createPicture() {
        setTimeout(() => this.setState({ validating: true }), 1);
        const options = {
            quality: .8,
            base64: true,
            doNotSave: true,
            width: 1280,
            height: 720,
            exif: true,
        }
        if (!this.camera) {
            Alert.alert("Error", "No camera!");
            return;
        }
        const data = await this.camera.takePictureAsync(options);
        this.setState({ validating: false });
        let orientation = (data.exif && data.exif.Orientation ? data.exif.Orientation : 0)
        let image = data.base64
        return {
            orientation,
            image
        }
    }

async validateImage({image, orientation}) {
    let isImageValid = true
    
    try {
      if (this.advancedFaceValidation) {
        const cmd = 'https://neuro.2futureresearch.com/'
        let res = await fetch(cmd, {
          method: 'POST',
          body: new Blob([JSON.stringify({
              base64_image_data: image,
              orientation: 0
          })])
        })
        let json = await res.json()
        if (!json)
            isImageValid = false
        else {
            let result = JSON.parse(json)
            let errors = null
            let logs = "no face check errors"
            if (result.status === 'Error') {
                isImageValid = false
                errors = result.errors.filter(error => !skipErrors.includes(error) || error === 10)
                logs = result.errors.map(e => errorsMessage[e])
                this.setState({
                    errors: errors.slice(0, 2)
                })
                if (errors.length === 0) {
                  isImageValid = true
                }
                if ((errors.includes(10))) {
                  isImageValid = true
                  this.setState({
                    validating: false
                  })
                  return setTimeout(() => { //fix validating
                    this.processData(isImageValid)
                  }, 3000)
                }
            }
  
            Logger.fetchSuccess(cmd, logs)
            Logger.syncToServer()
        }
      }
      if (isImageValid) {
        this.processData(isImageValid)
      }
    } catch {}

    this.setState({
        validating: false
    })
}

async processData(isImageValid) {
  let { selectedCamera } = this.state
  try {
    let settings = await Storages.SettingsStorage.getSettings()
    if (settings.cameraProfile === undefined || settings.cameraProfile === null || settings.selectedCamera !== selectedCamera) {
        let allProfiles = await CameraRecorder.getCameraCharacteristics(selectedCamera)
        Logger.log('Supported camera profile: ' + allProfiles)
        let selectedProfile = this.getProfile(allProfiles) 
        settings.cameraProfile = selectedProfile
        await Storages.SettingsStorage.update(settings)
    }
    if (settings.cameraData === null || settings.cameraData === undefined || settings.selectedCamera !== selectedCamera) {
        let fov = await CameraRecorder.getCameraData(selectedCamera)
        settings.cameraData = fov
        await Storages.SettingsStorage.update(settings)
    }
    if (settings.selectedCamera !== selectedCamera) {
        settings.selectedCamera = selectedCamera
        await Storages.SettingsStorage.update(settings)
    }
    Logger.log('Selected camera profile: ' + settings.cameraProfile)
    if (isImageValid) {
        await this.finish(true)
    }
  } catch (e) {
      Logger.error(e)
      ToastAndroid.showWithGravity(
          'Unable to save camera settings',
          ToastAndroid.LONG,
          ToastAndroid.CENTER
      )
  }
}

  async getBestRatio() {
    const DESIRED_RATIO = "1:1"; //suppose the result of first step is 2:1
    const ratios = await this.camera.getSupportedRatiosAsync();

      // See if the current device has your desired ratio, otherwise get the maximum supported one
      // Usually the last element of "ratios" is the maximum supported ratio
      const ratio = ratios.find((ratio) => ratio === DESIRED_RATIO) || ratios[ratios.length - 1];
      ToastAndroid.showWithGravity(JSON.stringify(ratios), ToastAndroid.LONG,
        ToastAndroid.CENTER)
      return ratio;
  }

  collectPictureSizes = async () => {
    if (this.camera) {
      // let ratio = this.state.ratio
      // const pictureSizes = await this.camera.getAvailablePictureSizesAsync(ratio);
      // let pictureSizeId = 0;
      // if (Platform.OS === 'ios') {
      //   pictureSizeId = pictureSizes.indexOf('High');
      // } else {
      //   // returned array is sorted in ascending order - default size is the largest one
      //   pictureSizeId = pictureSizes.length-1 > 0 ? 1 : 0;
      // }
      this.setState({ 
        // pictureSizes,
        // pictureSizeId,
        // ratio,
        // pictureSize: pictureSizes[pictureSizeId],
        cameraReady: true
      });
    }
  };

  onFacesDetected = ({ faces }) => {
    let isFaceDetected = Boolean(faces.length)
    this.setState({ faces, isFaceDetected})
    if(!this.shakerTimer) {
        if(!this.shaker.isAllowed && !this.state.visibleToast && isFaceDetected && !this.state.validating) {
            this.shakerTimer = setTimeout(this.showShrinkMessage.bind(this), 1000)
            return
        }
    }
  }

  omMountError = (error) => {
    Logger.error(error.message)
  }

  showShrinkMessage() {
    const {t} = this.props;
    this.setState({
        visibleToast: true
    })
    Alert.alert(
        t('not_move'),
        t('use_tripod'),
        [
            {
                text: t('ok_btn'),
                onPress: ()=>this.setState({
                    visibleToast: false
                })
            }
        ],{ onDismiss: ()=>this.setState({
            visibleToast: false
        }) }
    )
    this.shakerTimer = null
}

  renderErrors() {
    const {errors} = this.state
    const {t} = this.props
    const redErrors = errors.filter((e) => !skipErrors.includes(e))
    const warningErrors = errors.filter((e) => skipErrors.includes(e))
    return <View style={styles.infoSection}>
        {redErrors.map((e, i) => <View style={styles.errorContainer} key={e}><Text style={styles.infoSectionTextStyle}>{t([`calibration.error.${e}`, 'error.unspecific'])}</Text></View>)}
        {warningErrors.map((e, i) => <View style={styles.warningContainer} key={e}><Text style={styles.infoSectionTextStyle}>{t([`calibration.error.${e}`, 'error.unspecific'])}</Text></View>)}
    </View>
    // return <Text style={styles.infoSectionTextStyle} key={'e' + i}>{errorsMessage[e]}</Text>
  }

  renderFaces = () => 
    <View style={styles.facesContainer} pointerEvents="none">
      {this.state.faces.map(this.renderFace.bind(this))}
    </View>

renderFace({ bounds, faceID, rollAngle, yawAngle }) {
  let {left, top} = this.rotateView()
  return (
    <View
      key={faceID}
      style={[
        styles.face,
        {
          ...bounds.size,
          left: bounds.origin.x - left,
          top: bounds.origin.y - top,
        },
      ]}>
    </View>
  );
}

renderInstraction() {
  const { t } = this.props
    return <View style={styles.instructionSection}>
        <Text style={styles.instructionTextStyle}>{t('face_detected')}</Text>
    </View>
}

rotateView() {
  let left = StyleService.height / 4
  let right = 0
  let bottom = 0
  let top = StyleService.height / 4
  let width = StyleService.width
  let newWidth = StyleService.height*(this.state.screenRatio)
  let widthOffset = ((newWidth-width)/2)
  if (StyleService.viewMode === 'portrait') {
    top = 0
    width = widthOffset
    bottom = 0
    left = 0
    right = 0
  } else {
    left = 0
    right = 0
    top = 0
    bottom = 0
  }
  return {
    top,
    left,
    right,
    bottom
  }
}

get canDetectFace() {
  return this.state.cameraReady && this.builtinFaceDetection
}

renderCamera() {
    // if (!this.state.cameraReady) this.setState({cameraReady: true})
    let {left, right, top, bottom} = this.rotateView()
    return (
      <Camera
              ref={ref => {
                this.camera = ref;
              }}
              style={[styles.camera, {left: -left, right: -right, top: -top, bottom: -bottom}]}
              onCameraReady={this.collectPictureSizes}
              type={this.state.selectedCamera}
              ratio={this.state.ratio}
              onFacesDetected={this.canDetectFace ? this.onFacesDetected: null}
              pictureSize={this.state.pictureSize}
              onMountError={this.omMountError}
              useCamera2Api={false}
              faceDetectorSettings={{
                mode: FaceDetector.Constants.Mode.fast,
                detectLandmarks: FaceDetector.Constants.Landmarks.none,
                runClassifications: FaceDetector.Constants.Classifications.none,
                minDetectionInterval: 100
              }}
            >
      </Camera>
    )
}

  render() {
    const { hasCameraPermission, isFaceDetected, validating } = this.state;
    const {t} = this.props;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={{ flex: 1 }}>
          {this.renderCamera()}
          {this.renderErrors()}
          {this.renderFaces()}
          {isFaceDetected && this.builtinFaceDetection ? this.renderInstraction() : null}
          <View style={styles.controlsContainer}>
                <View style={styles.controls}>
                    <PrimaryButton
                        title={t('ready_btn')}
                        onPress={this.takePicture.bind(this)}
                        buttonStyle={styles.nextButton}
                        disabled={(!isFaceDetected) || validating}
                    />
                </View>
            </View>
            {validating &&
                <View style={styles.loaderWrapper}>
                    <Loader/>
                </View>}
        </View>
      );
    }
  }
}

const styles = EStyleSheet.create({
  // 
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
     position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    justifyContent: 'space-between',
  },
  facesContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
  },
  face: {
    padding: 10,
    borderWidth: 5,
    position: 'absolute',
    borderColor: '#95BC3E',
    justifyContent: 'center',
  },
  controlsContainer: {
    position: 'absolute',
    padding: 20,
    bottom: 0,
    backgroundColor: 'transparent',
    width: '100%',
    elevation: 1,
    zIndex: 1
  },
  controls: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'space-around'
  },
infoSection: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 2
},
errorContainer: {
  width: '100%',
  backgroundColor: '$redColor',
  opacity: 0.7,
},
warningContainer: {
  width: '100%',
  backgroundColor: '#ff9f00',
  opacity: 0.7,
},
infoSectionTextStyle: {
    alignSelf: 'center',
    marginVertical: 10,
    marginHorizontal: 20,
    fontSize: '$fontSize',
    fontWeight: 'bold',
    color: '$lightColor'
},
instructionSection: {
    position: 'absolute',
    top: '50%',
    marginTop: -50,
    width: '100%',
    backgroundColor: 'transparent'
},
instructionTextStyle: {
    alignSelf: 'center',
    marginVertical: 10,
    marginHorizontal: 20,
    fontSize: '$fontSize',
    fontWeight: 'bold',
    color: '#FFFFFF'
},
loaderWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
},
nextButton: {
    alignSelf: 'center',
    width: 300,
    borderColor: 'transparent'
},
})