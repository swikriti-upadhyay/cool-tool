import {Dimensions, TouchableOpacity, PushNotificationIOS, DeviceEventEmitter} from 'react-native'
import PushNotification from 'react-native-push-notification'
import Survey from './datacollection/survey'
import Logger from './utils/logger';

export default class PushNotificationService {
    static configure() {
        PushNotification.configure({

            // (optional) Called when Token is generated (iOS and Android)
            onRegister: function(token) {
                console.log( 'TOKEN:', token )
            },

            // (required) Called when a remote or local notification is opened or received
            onNotification: function(notification) {
                Logger.log('NOTIFICATION:', notification )

                if (notification.action && notification.action.toLowerCase() === 'stop') {
                    const survey = Survey.getCurrent()
                    if (survey) {
                        survey.stop()
                    }
                }

                // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
                notification.finish(PushNotificationIOS.FetchResult.NoData)
            },

            // Should the initial notification be popped automatically
            // default: true
            // popInitialNotification: false,

            /**
             * (optional) default: true
             * - Specified if permissions (ios) and token (android and ios) will requested or not,
             * - if not, you must call PushNotificationsHandler.requestPermissions() later
             */
            requestPermissions: true,
        })
    }

    static cleanUpAll() {
        PushNotification.cancelAllLocalNotifications()
    }
}