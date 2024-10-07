import React, {PureComponent} from 'react'
import { Button, Icon } from 'native-base'
import Logger from '../../utils/logger'
import VideoPlayer from 'react-native-video-controls'

export default class VideoComponent extends PureComponent {
    state = {
        paused: false,
        progress: 0,
        duration: 0
    }

    componentDidMount() {
        Logger.log(`File url: ${this.props.source.uri}`)
    }

    goToStart() {
        this.setState({paused: true}, () => {
            this.player.seekTo(0)
        })
    }

    onBack() {
        this.props.onBack && this.props.onBack()
    }

    videoError(e) {
        Logger.error(e)
    }

    setPause(state) {
        this.setState({
            paused: state
        })
    }
    
    render() {
        let closeIconComponent = <Icon name='arrow-back' style={{ color: '#fff' }} />
        return <VideoPlayer
                ref={ref => {
                    this.player = ref
                }}
                source={this.props.source}
                navigator={this.props.navigator}
                controlTimeout={10000}
                fullscreen={true}
                onError={e => this.videoError(e)}
                onEnd={() => this.goToStart()}
                onPause={() => this.setPause(true)}
                onPlay={() => this.setPause(false)}
                onReplay={() => this.setPause(false)}
                paused={this.state.paused}
                disableVolume={true}
                {...this.props}
                disableTimer={true}
                close={closeIconComponent}
                disableFullscreen={true}
                bgColor='#333333bd'
                showOnStart={false}
                screenHeight={this.props.height}
            />
    }
}