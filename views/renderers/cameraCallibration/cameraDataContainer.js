import CameraRecorder from 'react-native-simple-camera-recorder'

import {Storages} from '../../../storage/data-storage-helper'
import { getProfile, skipErrors } from './cameraCalibrationHelper'
import Logger from '../../../utils/logger'

export const processData = async (selectedCamera = 0) => {
    try {
      let settings = await Storages.SettingsStorage.getSettings()
      if (settings.cameraProfile === undefined || settings.cameraProfile === null || settings.selectedCamera !== selectedCamera) {
          let allProfiles = await CameraRecorder.getCameraCharacteristics(selectedCamera)
          let selectedProfile = getProfile(allProfiles)
          Logger.log('Supported camera profile: ' + allProfiles)
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
      return Promise.resolve(true)
    } catch (e) {
        Logger.error(e)
        return Promise.reject(false)
    }
}

export const validateImage = async ({image, orientation}) => {
      const cmd = 'https://neuro.2futureresearch.com/'
      let errors = null,
          begin = Date.now(),
          end,
          timeSpent,
          blob = new Blob([JSON.stringify({
              base64_image_data: image,
              orientation: 0
          })])
      let res = await fetch(cmd, {
        method: 'POST',
        body: blob
      })
      let json = await res.json()
      end= Date.now();
      timeSpent = `Spent time for image validation ${(end - begin) / 1000} seconds`;
      Logger.log(timeSpent)
      if (json) {
        let result = JSON.parse(json)
        if (result.status === 'Error') {
            errors = result.errors.filter(error => !skipErrors.includes(error) || error === 10)
            if (errors.length) return Promise.reject(errors)
        }
        Logger.log(result)
      }
        return Promise.resolve()
}