import React, { Component } from 'react'
import VideoComponent from '../components/video-player';
import { BaseComponent } from '@components/BaseComponent'
import withStore from '../../store/withStore'
import {observer} from 'mobx-react'
import StyleService from '../../utils/style-service'


@observer
class VideoScreen extends BaseComponent {

    constructor(props) {
        super(props)
        this.videoSource = props.navigation.getParam('videoUrl')
        this.state = {
            videoSource: this.proccessVideoUrl(this.videoSource)
        }
    }

    proccessVideoUrl(url) {
        if (url.indexOf('http') != 0)
            url = 'https:' + url
        return url;
    }

    render() {
        let { videoSource } = this.state;
        const { goBack } = this.props.navigation;
        return <VideoComponent
                    source={{uri: videoSource}}
                    onBack={() => goBack()}
                    navigator={this.props.navigator}
                    height={StyleService.height}
                />
      }
}

export default withStore(VideoScreen)