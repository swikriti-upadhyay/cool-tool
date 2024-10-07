import React from 'react'
import {
    Image,
    View
} from 'react-native'
import { withStyles } from 'react-native-styleman';
import { useTranslation } from 'react-i18next';

import Text from '../../components/text-component'

const styles = ({ bigAndBoldText, finishText }) => ({
    bigAndBoldText,
    finishText,
    content: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    image: {
        width: 221,
        height: 221,
        resizeMode: 'contain',
        '@media': [
            {
                orientation: 'landscape',
                minWidth: 320,
                maxWidth: 851,
                styles: {
                    width: 60,
                    height: 60
                }
            }
            ]
    }
})

let renderTitle = (styles) => {
    const {t} = useTranslation();
    return <Text style={[styles.finishText, styles.bigAndBoldText]}>{t('rec_over')}</Text>
}

let renderFooter = (styles, isLast) => {
    const {t} = useTranslation();
    if (isLast) {
        return <Text style={styles.finishText}>{t('now_sync')}</Text>
    }
    return <Text style={styles.finishText}>{t('next_questions')}</Text>
}

let CameraStopRecordView = ({ styles, isLast }) => {
    const imgSource = require('@assets/images/recording_stoped.png')
    return (
        <View style={styles.content}>
            {renderTitle(styles)}
            <Image source={imgSource} style={styles.image} />
            {renderFooter(styles, isLast)}
        </View>
    )
}

export default withStyles(styles)(CameraStopRecordView)