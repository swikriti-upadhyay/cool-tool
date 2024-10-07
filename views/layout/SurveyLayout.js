import React, { Component } from 'react'
import { View } from 'react-native'
import { withStyles } from 'react-native-styleman';
import Loader from '../common/loader-view'

import { mainStyles } from '../../styles'

const styles = ({$primaryColor}) => ({
    container: {
        flex: 1
    },
    primaryBackground: {
        backgroundColor: $primaryColor,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        backgroundColor: 'transparent',
        '@media': [
            {
                orientation: 'landscape',
                minWidth: 320,
                maxWidth: 851,
                styles: {
                    paddingTop: 10
                }
            }
        ]
    },
    footer: {
        width: '100%',
        maxWidth: 320,
        marginVertical: 30,
        '@media': [
            {
                orientation: 'landscape',
                minWidth: 600,
                styles: {
                    marginTop: '5%'
                }
            }
        ]
    }
})

let SurveyLayout = ({styles, footer, header, loading, children}) => {
    return (
        <View style={[mainStyles.container, styles.primaryBackground]}>
            <View style={[styles.content]}>
                {header}
                {children}
            </View>
            <View style={styles.footer}>
                {footer}
            </View>
            {loading && <Loader loading/>}
        </View>
    )
}

export default withStyles(styles)(SurveyLayout)