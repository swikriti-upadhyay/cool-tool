import React, { PureComponent } from 'react'
import { StyleSheet, StatusBar, Dimensions, Text, Animated } from 'react-native'
import { GameEngine } from 'react-native-game-engine'
import { Dot } from './renderers'
import { MoveDot } from './systems'
import {DotEntity} from './entities'
import {Map} from './move-map'
import Orientation from 'react-native-orientation-locker'
import { normalizeFont } from '../../../styles'

export default class Calibration1 extends PureComponent {
    constructor(props) {
        super(props)
        this.lockRotation()
        let layout = {}
        if (this.props.layout)
            layout = this.props.layout
        else {
            Object.assign(layout, Dimensions.get('window'))
            layout.height = layout.height - StatusBar.currentHeight
        }
        this.dotEntity = new DotEntity(Map.buildDefaultCalibrationMap(11500, 1500, layout, 10), <Dot />)
        if (this.props.onCalibrationStarted)
            this.dotEntity.addListener('started', this.props.onCalibrationStarted)
        if (this.props.onCalibrationFinished) {
            this.dotEntity.addListener('finished', this.props.onCalibrationFinished)
        }
        this.state = {
            opacity: new Animated.Value(1)
        }
    }

    lockRotation() {
        Orientation.getOrientation(
            (orientation)=> {
                switch(orientation) {
                    case "PORTRAIT-UPSIDEDOWN":
                        return Orientation.lockToPortraitUpsideDown()
                    case "PORTRAIT":
                        return Orientation.lockToPortrait()
                    case "LANDSCAPE-LEFT":
                        return Orientation.lockToLandscapeLeft()
                    case "LANDSCAPE-RIGHT":
                        return Orientation.lockToLandscape()
                }
            }
        )
    }

    start() {
        let time = 1000
        this.instructionText(time)
        setTimeout(function() {
            this.dotEntity.start()
        }.bind(this), time)
    }

    instructionText(time) {
        Animated.timing(this.state.opacity, {
            toValue: 0,
            duration: time,
            delay: time / 2
        }).start();
    }

    render() {
        const { t } = this.props;
        let move = new MoveDot()
        let { opacity } = this.state
        return (
            <GameEngine
                style={styles.container}
                systems={[move.move]}
                entities={{
                    0: this.dotEntity
                }}>
                    <Animated.View style={[{opacity}, styles.view]}>
                        <Text style={styles.text}>{t('calibration_instruction')}</Text>
                    </Animated.View>
            </GameEngine>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9'
    },
    view: {
        position: 'absolute',
        top: '50%',
        marginTop: -28,
        alignSelf: 'center',
    },
    text: {
        fontSize: normalizeFont(20),
        fontWeight: 'bold',
        color: '#000000'
    }
})