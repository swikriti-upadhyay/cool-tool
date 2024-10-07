import React, { Component } from 'react'
import {
    Linking,
    View,
    Image
} from 'react-native'
import {Text} from 'native-base'
import SurveyButton from '../components/survey-btn-component'
import Layout from '../layout/UxReality'
import Constants from '../../constants'
import { withStyles } from 'react-native-styleman';

const styles = ({bigAndBoldText}) => ({
    bigAndBoldText,
    container: {
        paddingTop: 56,
        flex: 1,
        '@media': [
            {
                orientation: 'landscape',
                maxWidth: 851,
                styles: {
                    paddingTop: 20,
                }
            },
        ]
    },
    row: {
        flex: 1,
        justifyContent: 'flex-start',
        '@media': [
            { // Tablet
              orientation: 'landscape',
              styles: {
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
                paddingHorizontal: 12,
                paddingVertical: 8,
              }
            },
          ]
    },
    col1: {
        '@media': [
            { // Tablet
              orientation: 'landscape',
              styles: {
                width: '45%',
                maxWidth: 300
              }
            },
          ]
    },
    col2: {
        '@media': [
            { // Tablet
              orientation: 'landscape',
              styles: {
                width: '55%',
              }
            },
          ]
    },
    wrapper: {
        flex: 1,
        // justifyContent: 'flex-end',
    },
    bigText: {
        fontSize: 24,
        textAlign: 'center',
        marginVertical: 40
    },
    text: {
        textAlign: 'center'
    },
    stickyFooter: {
        justifyContent: 'flex-end',
        flex: 1,
        marginBottom: 30,
    },
    rocket: {
        width: 240,
        height: 240,
        alignSelf: 'center',
        resizeMode: 'contain',
        '@media': [
            {
                orientation: 'landscape',
                maxWidth: 851,
                styles: {
                    width: 160,
                }
            },
        ]
    },
    nextButton: {
        width: 320,
        alignSelf: 'center'
    }
})

const openPlayMarket = () => {
    Linking.openURL(Constants.GP_URL)
}

const UpdateAppScreen = ({ styles, navigation }) => {
    const imgSource = require('@assets/images/rocket.png')
    return (
        <Layout contentWrap={styles.container}>
                <View style={styles.row}>
                    <View style={styles.col1}>
                        <Image source={imgSource} style={styles.rocket} />
                    </View>
                    <View style={styles.col2}>
                        <View style={styles.wrapper}>
                            <Text style={[styles.bigAndBoldText, styles.bigText]}>Important Updates</Text>
                            <Text style={styles.text}>We’ve added important features that’ll make{'\n'} a big difference to your experience</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.stickyFooter}>
                    <SurveyButton
                        title={'Update Now'}
                        onPress={() => openPlayMarket()}
                        buttonStyle={styles.nextButton}
                    />
                </View>
            </Layout>
    )
}

export default withStyles(styles)(UpdateAppScreen)