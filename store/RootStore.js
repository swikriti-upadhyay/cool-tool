import UserStore from './UserStore'
import RespondentStore from './RespondentStore'
import StyleStore from './StyleStore'
import SettingsStore from './SettingStore'
import ProjectStore from './ProjectStore'
import SubscriptionStore from './SubscriptionStore'

class RootStore {
    constructor() {
        if (!RootStore.__instance) {
            this.userStore = new UserStore(this)
            this.respondentStore = new RespondentStore(this)
            this.styleService = new StyleStore(this)
            this.settingsStore = new SettingsStore(this)
            this.projectStore = new ProjectStore(this)
            this.subscriptionStore = new SubscriptionStore(this)

            RootStore.__instance = this
        }

        return RootStore.__instance
    }

    static __instance = null
}

const rootStore = new RootStore()

export { rootStore }