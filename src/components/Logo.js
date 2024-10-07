import React, {Component} from 'react'
import { View, Image } from 'react-native'
import { withStyles } from 'react-native-styleman';

const imgSource = require('@assets/images/main_logo.png') // TODO: replace to retina source file(-2x)

const styles = () => ({
    imageWrap: {
        alignItems:'center',
        justifyContent: 'center',
        marginVertical: 65,
        '@media': [
        { // Tablet
            orientation: 'portrait',
            minWidth: 600,
            styles: {
            marginVertical: 110,
            }
        },
        ],
        '@media': [
        {
            orientation: 'landscape',
            maxWidth: 851,
            styles: {
            marginVertical: 20,
            }
        },
        ]
    },
    logo: {
        width: 225,
        height: 80,
        resizeMode: 'contain',
        '@media': [
        {
            orientation: 'landscape',
            minWidth: 320,
            maxWidth: 851,
            styles: {
            width: 168.75,
            height: 60
            }
        },
        { // Tablet
            orientation: 'portrait',
            minWidth: 600,
            styles: {
              width: 337,
              height: 120
            }
          },
        ]
    },
})

const Logo = ({ styles, wrapStyle, logoStyle }) => {
        const imgSource = require('@assets/images/logo_reality_white_x2.png')
        return (
            <View style={[styles.imageWrap, wrapStyle]}>
                <Image source={imgSource} style={[styles.logo, logoStyle]} />
            </View>
        )
}
export default withStyles(styles)(Logo)