import React, {Component} from 'react'
import {
    Keyboard
} from 'react-native'
import Swiper from 'react-native-swiper-fix'
import EStyleSheet from 'react-native-extended-stylesheet'
import CenterScreen from './main/_home-screen'
import RecordingsScreen from './main/_recordings-screen'
import SettingsView from './main/_settings-screen'
import {Storages} from '../../storage/data-storage-helper'
import Orientation from 'react-native-orientation-locker'
import UserService from '../../utils/auth-service'

export default class HomeScreen extends Component {

    initialIndex = 1
    state = {
        isSlideChanged: false,
        scrollEnabled: true,
        showsPagination: true,
        screenColor: '#95BC3E',
        hasRecording: false
    }

    constructor(props) {
        super(props)
        this.userService = UserService.instance
    }

    async componentDidMount() {
        let settings = await Storages.SettingsStorage.getSettings()
        settings.allowOrientationChange ? Orientation.unlockAllOrientations() : Orientation.lockToPortrait()
        this.fetchRespondents()
    }

    componentWillUnmount() {
        console.log('unmount home')
      }

    get canStartRecording() {
        let {   } = this.state
        let { isUserAuthorized, isRespondent } = this.userService
        return !hasRecording || isUserAuthorized || isRespondent
    }

    fetchRespondents() {
        Storages.RespondentStorage.getAllSuccess({
            take: 2
        })
        .then((results) => {
            this.setState({
                hasRecording: results.length > 0
            })
        })
    }

    goToRecordings() {
        this.swiper.scrollBy(-1)
    }

    goToSettings() {
        this.swiper.scrollBy(1)
    }

    goToMain() {
        if (this.swiper.state.index != this.initialIndex) {
            this.swiper.scrollBy(this.initialIndex - this.swiper.state.index)
        } 
    }

    onIndexChanged() {
        Keyboard.dismiss()
        // TODO: Find better solution with state update from parent CTMA-46
        if (this.swiper.state.index != this.initialIndex) {
            this.setState({isSlideChanged: true}, () => this.setState({isSlideChanged: false}))
        }
    }

    handleScrollState(state) {
        this.setState({
            scrollEnabled: state
        })
    }

    handleDisableSwipe(state) {
        this.setState({
            showsPagination: state
        }, this.handleScrollState(state))
    }

    render() {
        const lightColor = EStyleSheet.value('$lightColor')
        const currentSlide = this.props.navigation.getParam('slide', this.initialIndex)
        const {scrollEnabled, showsPagination} = this.state

        return (
            <Swiper style={styles.swiperStyle} 
                activeDotColor={lightColor}
                dotColor={'transparent'}
                dotStyle={styles.dotStyle}
                activeDotStyle={styles.activeDotStyle}
                paginationStyle={styles.paginationStyle}
                loop={false}
                index={currentSlide}
                onIndexChanged={() => this.onIndexChanged()}
                scrollEnabled={scrollEnabled}
                showsPagination={showsPagination}
                ref={(ref) => { 
                    if (ref && !this.swiper)
                        this.swiper = ref
                }}>
                    <RecordingsScreen 
                        parent={this}
                        slideChanged={this.state.isSlideChanged}
                        toggleScroll={(state)=>this.handleDisableSwipe(state)}
                        hasRecording={this.state.hasRecording}
                        canStartRecording={this.canStartRecording}/>
                    <CenterScreen 
                        parent={this}
                        hasRecording={this.state.hasRecording}
                        canStartRecording={this.canStartRecording}/>
                    <SettingsView
                        parent={this}
                        slideChanged={this.state.isSlideChanged}/>
            </Swiper>
        )
    }
}

const styles = EStyleSheet.create({
    $dotMargin: 10,
    $topMargin: 23,
    swiperStyle: {
    },
    dotStyle: {
        borderColor: '$lightColor', 
        borderWidth: 1, 
        marginLeft: '$dotMargin', 
        marginRight: '$dotMargin'
    },
    activeDotStyle: {
        marginLeft: '$dotMargin', 
        marginRight: '$dotMargin'
    },
    paginationStyle: {
        top: '$topMargin', 
        bottom: null
    },
    primaryBackground: {
        backgroundColor: '$primaryColor'
    }
})