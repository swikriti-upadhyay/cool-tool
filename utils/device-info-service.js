import DeviceInfo from 'react-native-device-info'
class DeviceInfoService {
    __instance = null
    constructor() {
        if (this.instance === null) {
            this.instance = this
          }
          return this.instance;
    }
    getDeviceType() {
        return DeviceInfo.getDeviceType()
    }
    isTablet() {
        return this.getDeviceType() === 'Tablet'
    }
    isLandscape() {
        return DeviceInfo.isLandscape()
    }
    getBuildNumber() {
        return DeviceInfo.getBuildNumber()
    }
    async getMACAddress () {
        let macAddress = await DeviceInfo.getMACAddress()
        return macAddress.replace(/:/g, "")
    }

    getManufacturer() {
        return DeviceInfo.getManufacturer()
    }

    getModel() {
        return DeviceInfo.getModel()
    }

    getSystemVersion() {
        return DeviceInfo.getSystemVersion()
    }

    getBrand() {
        return DeviceInfo.getBrand()
    }

    getDeviceId() {
        return DeviceInfo.getDeviceId()
    }

    getDeviceCountry() {
        return DeviceInfo.getDeviceCountry()
    }

    getSystemName() {
        return DeviceInfo.getSystemName()
    }

    isEmulator() {
        return DeviceInfo.isEmulator()
    }
}
export const deviceInfo = new DeviceInfoService()