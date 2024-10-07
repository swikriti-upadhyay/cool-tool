import React, { Component } from 'react'
import {
    View,
    Image,
    TouchableOpacity,
    ScrollView,
    StyleSheet
} from 'react-native'
import { Button } from 'native-base'
import { withTranslation } from 'react-i18next';
import Swiper from 'react-native-swiper-fix'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { withStyles } from 'react-native-styleman';

import Text from '../../components/text-component'
import Loader from '../../common/loader-view'
import withStore from '../../../store/withStore'
import { mainStyles, normalizeFont } from '../../../styles'
import { showMessage, hideMessage } from 'react-native-flash-message';
import Video from 'react-native-video';

const styles = ({btn, btnDisabled, btnText, $lightColor}) => ({
    btn,
    btnDisabled,
    btnText,
    loaderWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
    },
    progress: {
        color: $lightColor,
        marginVertical: 10,
    },
    element: {
        flex: 1
    },
    header: {
        marginVertical: 16,
        justifyContent: 'center',
        flexDirection: 'row',
        '@media': [
            {
                orientation: 'landscape',
                styles: {
                    marginVertical: 10,
                }
            }
        ]
    },
    headerText: {
        fontSize: 24,
        color: '#000000',
        textAlign: 'center',
    },
    closeBtn: {
        alignSelf: 'flex-end',
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    instructionItem: {
        backgroundColor: $lightColor
    },
    image: {
        // resizeMode: 'center',
        resizeMode: 'contain',
        width: '100%',
        '@media': [
            { // Tablet
            orientation: 'landscape',
            minWidth: 600,
              styles: {
                maxWidth: 1440,
                height: '100%',
                maxHeight: 440
              }
            },
            { // Tablet
            orientation: 'portrait',
            minWidth: 600,
                styles: {
                maxWidth: 400,
                }
            },
            { // Mob
                orientation: 'portrait',
                maxWidth: 600,
                    styles: {
                        maxWidth: 320,
                    }
                },
        ]
    },
    dotStyle: {
        borderColor: $lightColor, 
        marginLeft: '2%', 
        marginRight: '2%'
    },
    activeDotStyle: {
        marginLeft: '2%', 
        marginRight: '2%'
    },
    paginationStyle: {
        '@media': [
            { // Tablet
            orientation: 'landscape',
              styles: {
                  bottom: -20
              }
            },
            {
                orientation: 'portrait',
                minWidth: 320,
                maxWidth: 851,
                styles: {
                    bottom: 0
                }
            }
        ]
    },
    footer: {
        width: 320,
        justifyContent: 'flex-end',
        flex: 1,
        marginVertical: 30,
        alignSelf: 'center',
        '@media': [
            {
                orientation: 'landscape',
                minWidth: 600,
                styles: {
                    marginTop: '5%'
                }
            }
        ]
    },
    backgroundVideo: {
        ...StyleSheet.absoluteFillObject
    }
})

class InstructionsView extends Component {
    state = {
        ready: false
    }

    nextPage() {
        this.props.handleFinish().then(() => hideMessage()).catch((e) => {
            showMessage({
                message: 'Error',
                description: e.message,
                type: 'danger',
                duration: 10000,
                icon: 'auto'
            })
        })
    }

    handleReady() {
        this.setState({
            ready: true
        })
    }

    handleVideoEnd() {
        this.setState({
            skip: true
        })
    }

    hasProtocol(url, protocol) {
        return url.indexOf(protocol) > -1;
    }

    renderVideo() {
        let { styles, fallbackVideo, video } = this.props
        let protocol = "https:"
        const videoSource = video.length 
        ? { uri: this.hasProtocol(video, protocol) ? video : (protocol+video) } 
        : fallbackVideo;
        return <Video source={videoSource}   // Can be a URL or a local file.
            ref={(ref) => {
                this.player = ref
            }}
            onLoad={() => this.handleReady()}
            onEnd={() => this.props.onVideoEnd()}
            // fullscreen={true}
            style={styles.backgroundVideo} />
    }

    get canSkip() {
        return this.props.canGoNext || this.props.settings.skipVideo
    }

    render() {
        let { styles, t } = this.props
        let onPress = () => this.nextPage()
        return (
            <View style={{ flex: 1, zIndex: 5, elevation: 5 }}> 
                {this.renderVideo()}
                {!this.state.ready && <Loader />}
                {this.canSkip && <View style={styles.footer}>
                    <View>
                        <Button 
                            style={[styles.btn, {backgroundColor: '#95BC3E'}]}
                            onPress={onPress} full>
                                <Text style={[mainStyles.btnText, {color: '#FFFFFF'}]}>{t('continue_btn')}</Text>
                        </Button>
                    </View>
                </View>}
            </View>
        )
    }
}

export default withStore(withStyles(styles)(withTranslation()(InstructionsView)))