import React, { PureComponent } from "react";
import { StyleSheet, View } from "react-native";

const RADIUS = 10

export class Dot extends PureComponent {
    render() {
        let x = -1000, y = -1000
        if (this.props.currentPosition) {
            x = this.props.currentPosition.x - RADIUS
            y = this.props.currentPosition.y - RADIUS
        }
        if (isNaN(x))
            x = 0
        if (isNaN(y))
            y = 0
        return (
            <View style={[styles.dot, { left: x, top: y }]} />
        )
    }
}

const styles = StyleSheet.create({
    dot: {
        borderColor: '#E8949B',
        borderWidth: 4,
        borderRadius: RADIUS * 2,
        width: RADIUS * 2,
        height: RADIUS * 2,
        backgroundColor: '#D82E37',
        position: 'absolute',
        padding: 3
    }
})