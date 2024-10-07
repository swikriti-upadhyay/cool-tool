import {
    createStackNavigator,
    createAppContainer,
    createMaterialTopTabNavigator
} from 'react-navigation'
import {
    View,
    Dimensions,
    Animated,
    Easing,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar
} from 'react-native'
import { Root } from "native-base";

import FlashMessage from 'react-native-flash-message';
import Config from 'react-native-config';
import { I18nextProvider, translate } from 'react-i18next';

// localization file
import i18n from './utils/i18n';
import { FGService } from './utils/foreground-service'

import InitScreen from './views/init-view'
import { rootStore } from './store/RootStore'

import SurveyScreen from './views/survey-view'
import StorageView from './views/datastorage-view'
import React from 'react'
import LogsView from './views/logs-view'
import FeedbackView from './views/feedback-view'
import Calibration from './views/calibration/calibration1/scene'
// import VideoTestView from './views/video-test'
import NavigationService from './utils/navigation-service'
import EStyleSheet from 'react-native-extended-stylesheet'
import PushNotificationService from './notifications'
import Logger from './utils/logger';
import FilesystemStorage from 'redux-persist-filesystem-storage'
import RNFetchBlob from 'rn-fetch-blob'
// import { useScreens } from 'react-native-screens';
import firebase from "react-native-firebase";
// Screens
// import InitScreen from './views/screens/InitScreen'
import EnterScreen from './views/screens/EnterScreen'
// import EnterScreen from './views/renderers/instructions/InstructionsContainer'
import LoginScreen from './views/screens/LoginScreen'
// import LoginScreen from './views/datastorage-view'
import RegisterScreen from './views/screens/RegisterScreen'
import ResetPassword from './views/screens/ResetPassword'
import ForgotPassword from './views/screens/ForgotPassword'
import MainScreen from './views/screens/MainScreen'
import Subscription from './views/screens/SubscriptionScreen'
import Payment from './views/screens/Payment'
// import MainScreen from './views/screens/SubscriptionScreen'

// 
import Recordings from './views/screens/main/_recordings-screen'
import Home from './views/screens/main/_home-screen'
import Settings from './views/screens/main/_settings-screen'
import Technologies from './views/screens/main/_technologies-screen'
import Tasks from './views/screens/main/_tasks-screen'
import Application from './views/screens/main/_application-screen'
import Website from './views/screens/main/_website-screen'
import Prototype from './views/screens/main/_prototype-screen'
import Debugging from './views/screens/main/_debugging-screen'
import FaqScreen from './views/screens/Info/FaqScreen'
import AboutScreen from './views/screens/Info/AboutScreen'
import MyAccountScreen from './views/screens/Account/MyAccountScreen'
import MySubscriptionScreen from './views/screens/Account/MySubscriptionScreen'
import VideoScreen from './views/screens/VideoScreen'
// 

// *
// *

import {init as stylesInit} from './styles'
import AppStateService from './utils/app-state-service'
import NetInfoService from './utils/connectionInfo'
import TermsScreen from './views/screens/TermsScreen';
import UpdateAppScreen from './views/screens/UpdateAppScreen';
import CreateProject from './views/screens/CreateProject';
import Instruction from './views/screens/Instruction';
import { Provider } from 'mobx-react'
import {observe} from 'mobx'
import { StyleManProvider } from 'react-native-styleman';
import withDebug from './src/components/withDebug';
import CustomBar from '@components/CustomBar'

const dbFldrPath = `${RNFetchBlob.fs.dirs.SDCardApplicationDir}/persistStore`

FilesystemStorage.config({
    storagePath: dbFldrPath
})

// useScreens()
stylesInit()

AppStateService.init()

PushNotificationService.configure()

PushNotificationService.cleanUpAll()

Logger.__cleanUp()

const fade = (props) => {
  const {position, scene} = props

  const index = scene.index

  const translateX = 0
  const translateY = 0

  const opacity = position.interpolate({
      inputRange: [index - 0.7, index, index + 0.7],
      outputRange: [0.3, 1, 0.3]
  })

  return {
      opacity,
      transform: [{translateX}, {translateY}]
  }
};

const defaultConfig = {
  defaultNavigationOptions: {
    header: null,
    headerTransparent: true,
    headerMode: 'screen',
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
    headerStyle: { borderBottomWidth: 0 },
  },
  headerLayoutPreset: 'center',
      transitionConfig: () => ({
        screenInterpolator: (props) => {
            return fade(props)
        },
        transitionSpec: {
          duration: 150,
          timing: Animated.timing,
          easing: Easing.ease,
        },
    })
}

const SettingsStack = createStackNavigator(
  {
    Settings: {
        screen: Settings,
        navigationOptions: () => ({
            title: `Settings`,
        }),
    }
  },
  defaultConfig
)

const homeNavigator = createMaterialTopTabNavigator({
    Recordings: {
        navigationOptions: () => ({
            title: `Recordings`,
        }),
        screen: Recordings,
    },
    Home: {
        screen: Home
    },
    Settings: SettingsStack
},
{
    initialRouteName: 'Home',
    tabBarComponent: props => (
        <CustomBar {...props} style={{ width: 60, height: 10 }} />
        ),
      backBehavior: 'none',
      tabBarOptions: {
        style: {
          backgroundColor: 'red'
        }
      }
}
)

const StackNav = createStackNavigator(
    {
    Init: {
        screen: InitScreen,
    },
    Home: {
        screen: homeNavigator,
    },
    Technologies: {
      screen: Technologies
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
        },
        Prototype: {
          screen: Prototype
        }
      },
      defaultConfig,
    ),
    Debugging: {
      screen: Debugging
    },
    Main: {
        screen: MainScreen,
    },
    Enter: {
        screen: EnterScreen,
    },
    Register: {
        screen: RegisterScreen, //TODO: replace to separate stack
    },
    ResetPassword: {
        screen: ResetPassword,
    },
    ForgotPassword: {
        screen: ForgotPassword,
    },
    Login: {
        screen: LoginScreen,
    },
    Video: {
      screen: VideoScreen
    },
    Survey: {
        screen: SurveyScreen,
    },
    Storage: {
        screen: StorageView,
    },
    Logs: {
        screen: LogsView,
    },
    Calibration: {
        screen: Calibration,
    },
    Feedback: {
        screen: FeedbackView,
    },
    Terms: {
        screen: TermsScreen,
    },
    UpdateApp: {
        screen: UpdateAppScreen,
    },
    CreateProject: {
        screen: CreateProject,
        navigationOptions: () => ({
            title: `How to create project?`,
        }),
    },
    Instruction: {
      screen: Instruction,
      navigationOptions: () => ({
        title: `New project`,
      }),
    },
    Subscription: {
      screen: Subscription
    },
    Payment: {
      screen: Payment
    },
    Faq: {
      screen: FaqScreen
    },
    About: {
      screen: AboutScreen
    },
    Account: {
      screen: MyAccountScreen
    },
    MySubscription: {
      screen: MySubscriptionScreen
    }
    },
    {
      initialRouteName: 'Init', ...defaultConfig
    }
)

const WrappedStack = () => {
  return <StackNav screenProps={{ t: 123 }} />;
}

const AppContainer = createAppContainer(StackNav)


const THEME_DATA = ({getMRem, getScreenWidthDP}) => (
  {
    $fontSize: 16,
    $proximaB: 'ProximaBold',
    $proximaRegular: 'ProximaRegular',
    $lightColor: '#fff',
    $primaryColor: '#95BC3E',
    $darkThemeText: '#121212',
    $darkColor: '#222',
    $primaryDarkColor: '#82b215',
    $redDarkColor: '#D80027',
    rem: getMRem(getScreenWidthDP(), 320, 0.4),
    btn: {
      height: 52,
      width: '100%',
      borderRadius: 8,
      justifyContent: "center",
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { height: 0, width: 0 },
      elevation:0
  },
  btnDisabled: {
    opacity: .5
  },
  btnText: {
      fontSize: 20 // TODO: import utils normalizeFont
  },
  bigAndBoldText: {
    fontSize: 24,
    fontWeight: 'bold',
    '@media': [
      {
          orientation: 'landscape',
          minWidth: 320,
          maxWidth: 851,
          styles: {
            fontSize: 18
          }
      }
      ]
  },
  finishText: {
    color: '#f2f2f2',
    fontSize: 20,
    textAlign: 'center'
  }
});

const MainView = () => (
  <View style={styless.container}>
    <I18nextProvider i18n={ i18n }>
      <AppContainer
          ref={navigatorRef => {
              NavigationService.setTopLevelNavigator(navigatorRef)
          }}
          onNavigationStateChange={(prevState, currentState, action) => {
              const currentScreen = NavigationService.getActiveRouteName(currentState);
              const prevScreen = NavigationService.getActiveRouteName(prevState);
        
              if (prevScreen !== currentScreen) {
                const routesNumber = currentState.routes.length;
                // the line below uses the Firebase Analytics tracker
                // change the tracker here to use other Mobile analytics SDK.
                NavigationService.setRoutesNumber(routesNumber)
                Logger.log(`Screen_View: ${currentScreen}`)
                Logger.syncToServer()
                firebase.analytics().setCurrentScreen(currentScreen)
              }
            }}
            screenProps={{ 
              t: i18n.getFixedT() 
            }}
      />
      <FlashMessage position="top" />
    </I18nextProvider>
  </View>
)
const MainViewContainer = JSON.parse(Config.DEBUGGUBLE) ? withDebug(MainView) : MainView;
class App extends React.Component {

  constructor(props) {
    super(props);
    observe(NetInfoService.instance, change => {
      if (change.newValue) {
        FGService.start('main')
      } else {
        FGService.stop()
      }
    })
  }

  componentDidMount() {
    FGService.start('main')
  }

  componentWillUnmount() {
    FGService.stop()
  }

  componentWillUnmount() {
    FGService.stop()
  }

    render() {
        // Root need for snackbar (naive base Toast)
      return (
          <Root>
            <StyleManProvider theme={THEME_DATA}>
              <Provider rootStore={rootStore}>
                <MainViewContainer />
              </Provider>
            </StyleManProvider>
            </Root>)
    }
}

const styles = EStyleSheet.create({
  width:'100%',
  height:'100%'
})

const styless = StyleSheet.create({
  container:{
    width:'100%',
    height:'100%'

  }
})
export default App
