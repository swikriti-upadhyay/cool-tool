import { StackActions, NavigationActions } from 'react-navigation'

import {
  observable,
  computed,
  action
} from 'mobx'

// let _navigator

class NavigationService {
  instance = null
  timeout = null
  statusBarColors =  {
    default: '#95BC3E',
    transparent: 'transparent'
  }

  @observable androidStatusBarColor	= this.statusBarColors.transparent
  @observable androidStatusBarTransparent = true
  @observable routesLength = 0
  _navigator = null

  constructor() {
    if (this.instance === null) {
      this.instance = this
    }
    return this.instance;
  }

  setTopLevelNavigator(navigatorRef) {
    this._navigator = navigatorRef
  }

  @action.bound
  setRoutesNumber(routesLength) {
    this.routesLength = routesLength
  }

  getActiveRouteName(navigationState) {
    if (!navigationState) {
      return null;
    }
    const route = navigationState.routes[navigationState.index];
    // dive into nested navigators
    if (route.routes) {
      return getActiveRouteName(route);
    }
    return route.routeName;
  }

  navigate(routeName, params) {
    let clear = () => {
      clearTimeout(this.timeout)
      this.timeout = null
    }
    this.debounce(() => {
      this._navigator.dispatch(
        NavigationActions.navigate({
          routeName,
          params
        })
      ), (()=> {
        clear()
      })()
    }, 100)
  }

  debounce(callback, wait, context = this) {
  if (this.timeout)
    return
  this.timeout = setTimeout(callback, wait)
  }

  resetAction(routeName, params) {
    // let routeArray = routeName;
    // let actions = [];
    // if (!(routeName instanceof Array))
    //   routeArray = routeName.split();
    // routeArray.map((routeName) => actions.push(NavigationActions.navigate({ routeName, params })))
    
    const reset = StackActions.reset({
      index: 0,
      key: null,
      actions: [NavigationActions.navigate({ routeName, params })],
    })
    this._navigator.dispatch(reset);
  }

  back() {
    this._navigator.dispatch(NavigationActions.back())
  }

  pop(count = 1) {
    const popAction = StackActions.pop({
      n: count,
    });
    this._navigator.dispatch(popAction);
  }

  @computed
  get canBack() {
    return this.routesLength > 1
  }

  replace(routeName, params) {
    const replace = StackActions.replace({
      routeName: routeName,
      action: NavigationActions.navigate({ routeName, params })
    })
    this._navigator.dispatch(replace);
  }

  push(routeName, params) {
    const pushAction = StackActions.push({
      routeName,
      params
    });
    this._navigator.dispatch(pushAction);
  }

  setAndroidStatusBarColor(color, callback) {
    this.androidStatusBarTransparent = color === 'transparent'
    this.androidStatusBarColor = this.instance.statusBarColors[color];
    callback && callback()
  }

}

// add other navigation functions that you need and export them
const NavServiceInstance = new NavigationService()
let { 
  navigate,
  dispatch,
  debounce,
  resetAction,
  replace,
  pop,
  back,
  push,
  setTopLevelNavigator,
  setRoutesNumber,
  getActiveRouteName,
  androidStatusBarColor,
  setAndroidStatusBarColor,
  androidStatusBarTransparent
} = NavServiceInstance
export default {
  navigate,
  dispatch,
  debounce,
  resetAction,
  replace,
  pop,
  back,
  push,
  setTopLevelNavigator,
  setRoutesNumber,
  getActiveRouteName,
  androidStatusBarColor,
  setAndroidStatusBarColor,
  androidStatusBarTransparent,
  instance: NavServiceInstance
}