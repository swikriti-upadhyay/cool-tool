
import {
    createStackNavigator
} from 'react-navigation'

import { stackNavigatorConfig } from './stackNavigatorConfig'

import Settings from '../views/screens/main/_settings-screen'
import Tasks from '../views/screens/main/_tasks-screen'
import Application from '../views/screens/main/_application-screen'
import Website from '../views/screens/main/_website-screen'
import Debugging from '../views/screens/main/_debugging-screen'

const SettingsStack = createStackNavigator(
    {
      Settings: {
          screen: Settings,
          navigationOptions: () => ({
              title: `Settings`,
          }),
      },
      Tasks: createStackNavigator(
        {
          Tasks: {
            screen: Tasks
          },
          Application: {
            screen: Application
          },
          Website: {
            screen: Website
          }
        },
        stackNavigatorConfig
      ),
      Debugging: {
        screen: Debugging
      }
    },
    stackNavigatorConfig
  )

export { SettingsStack }