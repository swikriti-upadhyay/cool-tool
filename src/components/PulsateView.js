import React, { PureComponent } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback, Animated, Easing, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign'

const styles = StyleSheet.create({
    iconContainer: {
        // margin: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

class PulsateView extends PureComponent {
    constructor(props, context) {
        super(props, context);

        const maxOpacity = 0.25;

        this.state = {
            maxOpacity,
            viewScale: new Animated.Value(1),
            scaleValue: new Animated.Value(0.01),
            opacityValue: new Animated.Value(maxOpacity),
        };

        this.renderRippleView = this.renderRippleView.bind(this);
        this.onPressed = this.onPressed.bind(this);
    }
    componentDidMount() {
        this.timeout = setTimeout(() => {
            this.animateRipple()
        }, 5000);
    }
    componentWillMount() {
        clearTimeout(this.timeout)
    }
    animateRipple() {
        Animated.sequence([
            Animated.delay(this.props.delay || 0),
            Animated.timing(this.state.scaleValue, {
                toValue: 1,
                duration: 500,
                easing: Easing.bezier(0.0, 0.0, 0.2, 1),
                useNativeDriver: Platform.OS === 'android',
            }),
            Animated.spring(this.state.viewScale, {
                toValue: 0.90,
                velocity: 0.1,
                bounciness: 0,
              }),
            Animated.timing(this.state.opacityValue, {
                toValue: 0,
                useNativeDriver: Platform.OS === 'android',
            })
        ]).start(() => {
            this.state.scaleValue.setValue(0.01);
            this.state.viewScale.setValue(1);
            this.state.opacityValue.setValue(this.state.maxOpacity);
            this.animateRipple()
        })
    }
    onPressed() {
        this.props.onPress && this.props.onPress()
    }
    renderRippleView() {
        const { size, color } = this.props;
        const { scaleValue, opacityValue } = this.state;

        const rippleSize = size * 2;

        return (
            <Animated.View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: rippleSize,
                    height: rippleSize,
                    borderRadius: rippleSize / 2,
                    transform: [{ scale: scaleValue }],
                    opacity: opacityValue,
                    backgroundColor: color || 'black',
                }}
            />
        );
    }
    render() {
        const { name, size, color } = this.props;
        const containerSize = size * 2; 
        const iconContainer = { width: containerSize, height: containerSize };

        return (
            <TouchableWithoutFeedback onPress={this.onPressed}>
                <View style={[styles.iconContainer, iconContainer]}>
                    {this.renderRippleView()}
                    <Animated.View style={[{transform: [{scale: this.state.viewScale}]}]}>
                        <Icon name={name} size={size} color={color} />
                    </Animated.View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default PulsateView