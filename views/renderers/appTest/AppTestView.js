import React from 'react'
import {
    TouchableOpacity,
    View,
    Image
} from 'react-native'
import { useTranslation } from 'react-i18next';

import Text from '../../components/text-component'
import { withStyles } from 'react-native-styleman';

const $buttonSize = 200
const $buttonInnerSize = 150
const $mobileButtonSize = 80

const styles = ({ bigAndBoldText, finishText, $lightColor, $primaryDarkColor, $redDarkColor }) => ({
    bigAndBoldText, finishText,
    wrapper: {
        alignItems: 'center'
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 20,
        '@media': [
            {
                orientation: 'landscape',
                minWidth: 320,
                maxWidth: 851,
                styles: {
                    marginBottom: 0
                }
            }
            ]
    },
    $firstButtonBorderSize: $buttonSize + 35,
    $secondButtonBorderSize: $buttonSize + 15,
    firstBorder: {
        width: $buttonSize + 35,
        height: $buttonSize + 35,
        borderRadius: ($buttonSize + 35) / 2, 
        borderWidth: .3,
        borderColor: $lightColor,
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'transparent',
        '@media': [
            {
                orientation: 'landscape',
                minWidth: 320,
                maxWidth: 851,
                styles: {
                    width: $mobileButtonSize + 15,
                    height: $mobileButtonSize + 15,
                    borderRadius: ($mobileButtonSize + 15) / 2, 
                }
            }
            ]
    },
    secondBorder: {
        width:  $buttonSize + 15,
        height:  $buttonSize + 15,
        borderRadius: ($buttonSize + 15) / 2, 
        borderWidth: .3,
        borderColor: $lightColor,
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: $primaryDarkColor,
        '@media': [
            {
                orientation: 'landscape',
                minWidth: 320,
                maxWidth: 851,
                styles: {
                    width: $mobileButtonSize + 5,
                    height: $mobileButtonSize + 5,
                    borderRadius: ($mobileButtonSize + 5) / 2, 
                }
            }
            ]
    },
    roundButton: {
        width: $buttonSize,
        height: $buttonSize,
        borderRadius: $buttonSize / 2, 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#F2F2F2',
        '@media': [
            {
                orientation: 'landscape',
                minWidth: 320,
                maxWidth: 851,
                styles: {
                    width: $mobileButtonSize,
                    height: $mobileButtonSize,
                    borderRadius: ($mobileButtonSize) / 2, 
                }
            }
            ]
    },
    innerButton: {
        width: $buttonInnerSize, 
        height: $buttonInnerSize, 
        borderRadius: $buttonInnerSize / 2, 
        backgroundColor: $redDarkColor,
        justifyContent: 'center',
        alignItems: 'center',
        '@media': [
            {
                orientation: 'landscape',
                minWidth: 320,
                maxWidth: 851,
                styles: {
                    width: $mobileButtonSize - 15,
                    height: $mobileButtonSize - 15,
                    borderRadius: ($mobileButtonSize - 15) / 2, 
                }
            }
            ]
    },
    logo: {
        width: 65,
        resizeMode: 'contain',
        '@media': [
            {
                orientation: 'landscape',
                minWidth: 320,
                maxWidth: 851,
                styles: {
                    width: ($mobileButtonSize - 40),
                    height: ($mobileButtonSize - 40),
                }
            }
            ]
    },
    btn: {
        '@media': [
        {
            orientation: 'landscape',
            maxWidth: 851,
            styles: {
                marginVertical: 20,
            }
        },
        ]
    }
})

const renderTitle = (styles) => {
    const {t} = useTranslation();
    return <View>
        <Text style={[styles.finishText, styles.bigAndBoldText]}>{t('tap_to_stop')}</Text>
    </View>
}

const renderFooter = (styles, timeLeft) => {
    const {t} = useTranslation();
    return <View>
        <Text style={[styles.finishText, styles.subtitle]}>{t('rec_finish')}</Text>
        <Text style={[styles.finishText, styles.bigAndBoldText]}>{timeLeft}</Text>
    </View>
}

const AppTestView = ({ styles, handleFinish, timeLeft }) => {
    const imgSource = require('@assets/images/owl_logo.png')
    return (
        <View style={styles.content}>
            {renderTitle(styles)}
            <View style={styles.wrapper}>
                <TouchableOpacity 
                    onPress={() => handleFinish()}
                    style={styles.btn}>
                    <View style={styles.firstBorder}>
                        <View style={styles.secondBorder}>
                            <View style={styles.roundButton}>
                                <View style={styles.innerButton}>
                                    <Image source={imgSource} style={styles.logo}/>
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
            {renderFooter(styles, timeLeft)}
        </View>
    )
}

export default withStyles(styles)(AppTestView)