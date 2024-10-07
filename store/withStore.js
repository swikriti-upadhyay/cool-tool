import { inject } from 'mobx-react'

let withStore = (WrappedComponent) => {
    return inject(store => ({
        isAuthenticated: store.rootStore.userStore.isAuthenticated,
        isRespondent: store.rootStore.userStore.isRespondent,
        hasRecording: store.rootStore.respondentStore.hasRecording,
        defaultProjectCode: store.rootStore.userStore.projectCode,
        authToken: store.rootStore.userStore.token,
        isLandscape: store.rootStore.styleService.isLandscape,
        isMobilePortrait: store.rootStore.styleService.isMobilePortrait,
        isMobileLandscape: store.rootStore.styleService.isMobileLandscape,
        isTablet: store.rootStore.styleService.isTablet,
        viewMode: store.rootStore.styleService.viewMode,
        screenWidth: store.rootStore.styleService.width,
        screenHeight: store.rootStore.styleService.height,
        isTermsAgree: store.rootStore.settingsStore.isTermsAgree,
        timeout: store.rootStore.settingsStore.timeout,
        neverAskApp: store.rootStore.settingsStore.neverAskApp,
        neverAskSite: store.rootStore.settingsStore.neverAskSite,
        showInstruction: (survType) => {
            if (survType == 1) {
                return !store.rootStore.settingsStore.neverAskApp
            }
            else {
                return !store.rootStore.settingsStore.neverAskSite
            }
        },
        isAppFilled: store.rootStore.settingsStore.isAppFilled,
        isWebFilled: store.rootStore.settingsStore.isWebFilled,
        surveyCount: store.rootStore.settingsStore.surveyCount,
        allowRotate: store.rootStore.settingsStore.allowOrientationChange,
        isDefaultText: store.rootStore.settingsStore.isDefaultText,
        settings: store.rootStore.settingsStore.settings,
        settingsStore: store.rootStore.settingsStore,
        subscriptionStore: store.rootStore.subscriptionStore
    })
    )(WrappedComponent)
}
export default withStore