import React, { Component } from 'react'
import { Alert } from 'react-native'
import { Camera } from 'expo-camera';
import EStyleSheet from 'react-native-extended-stylesheet'

import StyleService from '../../../utils/style-service'

export default class CameraView extends Component {

    state = {
        cameraReady: false,
        selectedCamera: Camera.Constants.Type.front,
        ratio: '16:9',
        screenRatio: 3/4,
        pictureSize: "1280x720",
    }

    componentDidUpdate(prevProps) {
        if (this.props.takePicture !== prevProps.takePicture) {
            // setTimeout(() => {
                this.createPicture()
                .then((picture) => {
                    this.props.onPictureTaken(picture)
                })
                .catch((e) => {
                    console.log(e)
                })
            // }, 3000)
          }
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

    collectPictureSizes = async () => {
        if (this.camera) {
            this.setState({ 
                cameraReady: true
            });
        }
    }

    async createPicture() {
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
        try {
            const data = await this.camera.takePictureAsync(options);
            let orientation = (data.exif && data.exif.Orientation ? data.exif.Orientation : 0)
            let image = data.base64
            return Promise.resolve({
                orientation,
                image
            })
        } catch(e) {
            console.log(e)
        }
    }

    omMountError = (error) => {
        Logger.error(error.message)
    }



    render() {
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
                  pictureSize={this.state.pictureSize}
                  onMountError={this.omMountError}
                  useCamera2Api={false}
                >
          </Camera>
        )
    }
}

const styles = EStyleSheet.create({
    camera: {
      position: "absolute",
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      justifyContent: 'space-between',
    //   opacity: 0
    },
})