import React from 'react'
import { View, Image, Animated, TouchableHighlight } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import EStyleSheet from 'react-native-extended-stylesheet'
import { withStyles } from 'react-native-styleman';

import { SCALE } from '../../animations'

const BASE_BUTTON_SIZE = 200
const LANDSCAPE_BUTTON_SIZE = 150

const styles = ({$darkColor, $primaryDarkColor}) => ({
    logo: {
        width: 105,
        resizeMode: 'contain',
        '@media': [
            {
                orientation: 'landscape',
                maxWidth: 851,
                styles: {
                    width: 80,
                }
            },
        ]
    },
    roundButton: {
        width: BASE_BUTTON_SIZE,
        height: BASE_BUTTON_SIZE,
        borderRadius: BASE_BUTTON_SIZE / 2, 
        opacity: 1,
        shadowRadius: 15, 
        shadowOpacity: 1, 
        elevation: 2, 
        shadowColor: $darkColor, 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'transparent',
        '@media': [
            {
                orientation: 'landscape',
                maxWidth: 851,
                styles: {
                    width: LANDSCAPE_BUTTON_SIZE,
                    height: LANDSCAPE_BUTTON_SIZE,
                    borderRadius: LANDSCAPE_BUTTON_SIZE / 2, 
                }
            },
        ]
    },
    roundButton_disabled: {
        opacity: .5
    },
    innerButton: {
        width: BASE_BUTTON_SIZE - 50, 
        height: BASE_BUTTON_SIZE - 50, 
        borderRadius: (BASE_BUTTON_SIZE - 50) / 2, 
        backgroundColor: $primaryDarkColor,
        justifyContent: 'center',
        alignItems: 'center',
        '@media': [
            {
                orientation: 'landscape',
                maxWidth: 851,
                styles: {
                    width: LANDSCAPE_BUTTON_SIZE - 50,
                    height: LANDSCAPE_BUTTON_SIZE - 50,
                    borderRadius: (LANDSCAPE_BUTTON_SIZE - 50) / 2, 
                }
            },
        ]
    },
    firstBorder: {
        position: 'absolute',
        width: BASE_BUTTON_SIZE,
        height: BASE_BUTTON_SIZE,
        borderRadius: BASE_BUTTON_SIZE / 2, 
        borderWidth: 2,
        borderColor: 'rgba(130, 178, 21, 0.7)',
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'transparent',
        elevation: -1,
        zIndex: -1,
        '@media': [
            {
                orientation: 'landscape',
                maxWidth: 851,
                styles: {
                    width: LANDSCAPE_BUTTON_SIZE,
                    height: LANDSCAPE_BUTTON_SIZE,
                    borderRadius: LANDSCAPE_BUTTON_SIZE / 2, 
                }
            },
        ]
    },
    secondBorder: {
        position: 'absolute',
        width: BASE_BUTTON_SIZE,
        height: BASE_BUTTON_SIZE,
        borderRadius: BASE_BUTTON_SIZE / 2, 
        borderWidth: 2,
        borderColor: 'rgba(130, 178, 21, 0.4)',
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'transparent',
        elevation: -1,
        zIndex: -1,
        '@media': [
            {
                orientation: 'landscape',
                maxWidth: 851,
                styles: {
                    width: LANDSCAPE_BUTTON_SIZE,
                    height: LANDSCAPE_BUTTON_SIZE,
                    borderRadius: LANDSCAPE_BUTTON_SIZE / 2, 
                }
            },
        ]
    },
    thirdBorder: {
        position: 'absolute',
        width: BASE_BUTTON_SIZE,
        height: BASE_BUTTON_SIZE,
        borderRadius: BASE_BUTTON_SIZE / 2, 
        borderWidth: 2,
        borderColor: 'rgba(130, 178, 21, 0.2)',
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'transparent',
        elevation: -1,
        zIndex: -1,
        '@media': [
            {
                orientation: 'landscape',
                maxWidth: 851,
                styles: {
                    width: LANDSCAPE_BUTTON_SIZE,
                    height: LANDSCAPE_BUTTON_SIZE,
                    borderRadius: LANDSCAPE_BUTTON_SIZE / 2, 
                }
            },
        ]
    },
})

class PulsateLogo extends React.Component {

    constructor(props) {
        super(props)
        this.firstCircleAnim = new Animated.Value(0)
        this.secondCircleAnim = new Animated.Value(0)
        this.thirdCircleAnim = new Animated.Value(0)
    }

    componentDidMount() {
        this.props.pulsating ? this.pressInAnimation() : null
    }

    pressInAnimation() {
        if (this.props.disabled) return
        SCALE.pressInAnimation(this.firstCircleAnim, { delay: 200 }, (animated) => SCALE.pressOutAnimation(animated, this.pressInAnimation.bind(this)));
        SCALE.pressInAnimation(this.secondCircleAnim, { delay: 250 }, (animated) =>  SCALE.pressOutAnimation(animated));
        SCALE.pressInAnimation(this.thirdCircleAnim, { delay: 200 }, (animated) =>  SCALE.pressOutAnimation(animated));
    }

    render() {
        const imgSource = require('@assets/images/start_logo.png')
        const primaryDarkColor = EStyleSheet.value('$primaryDarkColor')
        const { styles, containerStyle, disabled } = this.props
        return (
            <View style={containerStyle}>
                <TouchableHighlight
                    activeOpacity={0.5}
                    underlayColor='transparent'
                    onPress={() => this.props.onPress()}>
                    <LinearGradient 
                        start={{x: 1, y: .5}} end={{x: 1, y: 1}}
                        colors={['#A8CC54', primaryDarkColor]} style={[styles.roundButton, disabled && styles.roundButton_disabled]}>
                        <View style={styles.innerButton}>
                            <Image source={imgSource} style={styles.logo} />
                        </View>
                    </LinearGradient>

                </TouchableHighlight>
                <Animated.View style={[styles.firstBorder, SCALE.getScaleTransformationStyle(this.firstCircleAnim, 1, 1.12)]} />
                <Animated.View style={[styles.secondBorder, SCALE.getScaleTransformationStyle(this.secondCircleAnim, 1, 1.24)]} />
                <Animated.View style={[styles.thirdBorder, SCALE.getScaleTransformationStyle(this.thirdCircleAnim, 1, 1.36)]} />
            </View>
        )
    }
}

export default withStyles(styles)(PulsateLogo)