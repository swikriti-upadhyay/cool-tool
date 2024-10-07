import './ReactotronConfig'
import 'es6-symbol/implement'
import {Alert} from 'react-native'
import RNRestart from 'react-native-restart'
import {AppRegistry} from 'react-native'
import {setJSExceptionHandler, setNativeExceptionHandler} from 'react-native-exception-handler'
import App from './App'
import Disposer from './utils/disposer'
import Logger from './utils/logger'
import Constants from './constants'
import DataUploader from './sync/data-uploader'
import NetInfoService from './utils/connectionInfo'
import {
    Storages
} from './storage/data-storage-helper'
// if(__DEV__) {
// import('./ReactotronConfig').then(() => console.log('Reactotron Configured'))
// }
const dataUploader = DataUploader.getInstance()
let startUpload = () => {
    try {
        dataUploader.upload()
    } catch {}
}
Logger.init()
NetInfoService.init()
Constants.init()
startUpload()
if (__DEV__) {
    const errorHandler = (e, isFatal) => {
        if (isFatal) {
            Alert.alert(
                'Unexpected error occurred',
                `Error: ${(isFatal) ? 'Fatal:' : ''} ${e.name} ${e.message}`,
                [{
                    text: 'Restart App',
                    onPress: () => {
                        Disposer.disposeTrackers()
                        RNRestart.Restart()
                    }
                }]
            )
        } else {
            Logger.log(e) // So that we can see it in the ADB logs in case of Android if needed
        }
    }

    setJSExceptionHandler(errorHandler)

    setNativeExceptionHandler((errorString) => {
        let error = new Error(errorString)
        error.name = 'Native exception'
        errorHandler(error, true)
    })
}

Object.defineProperty(Array.prototype, 'flat', {
    value: function(depth = 1) {
      return this.reduce(function (flat, toFlatten) {
        return flat.concat((Array.isArray(toFlatten) && (depth>1)) ? toFlatten.flat(depth-1) : toFlatten);
      }, []);
    }
});
global.URL = URL;

AppRegistry.registerComponent('uxreality', () => App)
