import VIForegroundService from '@voximplant/react-native-foreground-service';
import Logger from './logger';
import CommonHelper from './common-helper';

const DEFAULT_CONFIG = {
    enableVibration: false,
    importance: 5,
    defaultConfig: {
        title: 'UXReality',
        id: CommonHelper.getRandomInt(1000, 9999)
    }
}

const NOTIFICATION_CHANNELS = {
    uploading: {
        ...DEFAULT_CONFIG,
        id: '2',
        name: 'Upload Channel',
        description: 'Upload Channel',
        notificationConfig: {
            ...DEFAULT_CONFIG.defaultConfig,
            channelId: '2',
            text: 'Upload in progress',
            icon: 'ic_launcher_round'
        }
    },
    tracking: {
        ...DEFAULT_CONFIG,
        id: '1',
        name: 'Record Channel',
        description: 'Record Channel',
        notificationConfig: {
            ...DEFAULT_CONFIG.defaultConfig,
            channelId: '1',
            text: 'Recording in progress',
            icon: 'rec_in'
        }
    },
    main: {
        ...DEFAULT_CONFIG,
        id: '1',
        name: 'UXReality Channel',
        description: 'UXReality Channel',
        notificationConfig: {
            ...DEFAULT_CONFIG.defaultConfig,
            channelId: '1',
            text: 'Background process',
            icon: 'ic_launcher_round'
        }
    }
}
class ForegroundService {

    static __instance = null

    constructor(chanelConfig, notificationConfig) {
        if (!ForegroundService.__instance) {
            // initialize service
            this.running = false
            return ForegroundService.__instance = this
        }
        return ForegroundService.__instance
    }

    channelConfig({ notificationConfig, ...rest }) {
        return rest
    }

    __config(channel) {
        let channelConfig = this.channelConfig(NOTIFICATION_CHANNELS[channel])
        try {
            VIForegroundService.createNotificationChannel(channelConfig);
        } catch {
            Logger.error("Couldn't configure FG service")
        }
    }

    async start(channel) { // NOTIFICATION_CHANNEL string
        if (this.running) return
        if (NOTIFICATION_CHANNELS.hasOwnProperty('channel')) throw new Error("Wrong settings")
        try {
            this.__config(channel)
            await VIForegroundService.startService(NOTIFICATION_CHANNELS[channel]?.notificationConfig);
            this.running = true
        } catch {
            Logger.log("Can't start the service");
        }
    }
    async stop() {
        this.running = false
        try {
            await VIForegroundService.stopService();
        } catch(e) {
            Logger.log("Unable stop service when app close "+ e);
        }
    }

}

const FGService = new ForegroundService();
export { FGService }