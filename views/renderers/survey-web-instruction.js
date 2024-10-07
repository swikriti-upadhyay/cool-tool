import React from 'react'
import {
    Text,
    View,
    ScrollView,
} from 'react-native'
import { Button, Icon } from 'native-base'
import { WebView } from 'react-native-webview'
import SurveyButton from '../components/survey-btn-component'
import BaseRenderer from './base-renderer'
import { QuestionItem, TextItem } from '../../datacollection/survey-items'
import EStyleSheet from 'react-native-extended-stylesheet'
import { Storages } from '../../storage/data-storage-helper'
import CommonHelper from '../../utils/common-helper'
import Constants from '../../constants'
import NavService from '../../utils/navigation-service'

import { normalizeFont } from '../styles/font-normilize'



export default class TextRenderer extends BaseRenderer {

    get className() { return 'TextRenderer' }

    render() {
        const { t } = this.props;
        let { eyeTrackingWebSiteObjective: text } = this.surveyItem.question
        let { heading, title } = this.surveyItem.params
        let html = ""

        if (text.indexOf('<html>') == -1) {
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
                        .content .large {
                            font-size: 20px;
                        }
                        .heading {
                            color: white;
                            font-size: 24px;
                            margin: 40px 0;
                        }
                        .app_instruction h3 {
                            margin: 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="content">
                        <h1 class="heading">${title}</h1>
                        <div>${CommonHelper.replaceNewLineWithBr(text)}</div>
                    </div>
                </body>
            </html>`
        }

        return <View style={[styles.container, styles.primaryBackground]}>
            <View style={styles.header}>
                <View style={styles.element}>
                    {!this.surveyItem.survey.isGuest && <Button
                        transparent
                        onPress={() => NavService.back()}
                        light
                        >
                        <Icon name='arrow-back' />
                    </Button>}
                </View>
                <Text style={[styles.headerText, styles.element, {  flex: 2, justifyContent: 'center', alignItems: 'center' }]}>{ heading }</Text>
                <View style={styles.element}></View>
            </View>
            <WebView
                javaScriptEnabledAndroid={true}
                originWhitelist={['*']}
                source={{html: html}}
                style={styles.primaryBackground}
            />
            <View style={styles.footerContainer}>
                <SurveyButton
                    title={t("next_btn")}
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
    element: {
        flex: 1
    },
    header: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    headerText: {
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: normalizeFont(16),
        color: '#fff'
    },
    questionName: {
        paddingHorizontal: 20,
        marginVertical: 32,
        fontFamily: 'ProximaBold',
        fontSize: normalizeFont(24),
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