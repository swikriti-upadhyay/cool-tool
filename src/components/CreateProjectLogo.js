import React, {Component} from 'react'
import { View, Image } from 'react-native'
import { withStyles } from 'react-native-styleman';

const imgSource = require('@assets/images/create_project_x2.png')
const styles = () => ({
    imageWrap: {
        alignItems:'center',
        justifyContent: 'center',
        marginBottom: 42,
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
                minWidth: 320,
                maxWidth: 851,
                styles: {
                    marginVertical: 0,
                    marginBottom: 0
                }
            },
        ]
    },
    logo: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
        '@media': [
        {
            orientation: 'landscape',
            minWidth: 320,
            maxWidth: 851,
            styles: {
                width: 50,
                height: 50
            }
        },
        { // Tablet
            orientation: 'portrait',
            minWidth: 600,
            styles: {
              width: 180,
              height: 180
            }
          },
        ]
    },
})

const CreateProjectLogo = ({ styles, wrapStyle, logo }) => {
    return (
        <View style={[styles.imageWrap, wrapStyle]}>
            <Image source={imgSource} style={[styles.logo, logo]} />
        </View>
    )
}

export default withStyles(styles)(CreateProjectLogo);