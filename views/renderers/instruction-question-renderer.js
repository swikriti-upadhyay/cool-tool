import React from 'react'
import {
    Text,
    View,
    ScrollView,
} from 'react-native'
import { WebView } from 'react-native-webview'
import SurveyButton from '../components/survey-btn-component'
import BaseRenderer from './base-renderer'
import { QuestionItem, TextItem } from '../../datacollection/survey-items'
import EStyleSheet from 'react-native-extended-stylesheet'

import { normalizeFont } from '../styles/font-normilize'
import CommonHelper from '../../utils/common-helper'


export default class TextRenderer extends BaseRenderer {
    get className() { return 'TextRenderer' }
    get value() {
        if (this.surveyItem instanceof QuestionItem) {
            return this.surveyItem.name
        } else if (this.surveyItem instanceof TextItem) {
            return this.surveyItem.text
        } else {
            return ''
        }
    }

    render() {

        const {t} = this.props;
        let html = this.value
        let { heading } = this.surveyItem.params

        if (html.indexOf('<html>') == -1) {
            html = `<html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        html, body {
                            // height: 100%;
                            padding: 0;
                            margin: 0;
                        }
                        .content {
                            padding: 0 20px;
                            display: flex;
                            flex-direction: column;
                            max-width: 460px;
                            margin: 0 auto;
                            color: white;
                        }
                        .app_instruction h3 {
                            margin: 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="content">${CommonHelper.replaceNewLineWithBr(html)}</div>
                </body>
            </html>`
        }

        return <View style={[styles.container, styles.primaryBackground]}>
            <View style={styles.header}>
                <Text style={styles.headerText}>{heading}</Text>
            </View>
            <WebView
                javaScriptEnabledAndroid={true}
                originWhitelist={['*']}
                source={{html: html}}
                style={[styles.primaryBackground, styles.webview]}
            />
            <View style={styles.footerContainer}>
                <SurveyButton
                    title={t('next_btn')}
                    onPress={() => this.finish()}
                    buttonStyle={styles.nextButton}
                />
            </View>
        </View>
    }
}


const styles = EStyleSheet.create({
    container: {
        flex: 1
    },
    primaryBackground: {
        backgroundColor: '$primaryColor'
    },
    header: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        alignSelf: 'center',
        fontSize: normalizeFont(16),
        color: '#fff'
    },
    footerContainer: {
        justifyContent: 'flex-end',
        marginVertical: 30,
        paddingHorizontal: 20
    },
    nextButton: {
        alignSelf: 'center',
        width: '100%',
        maxWidth: 320,
        '@media (min-width: 600)': {
            maxWidth: 440
        }
    }
})