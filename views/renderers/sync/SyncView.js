import React, { Component } from 'react'
import {
    View,
    Image,
    TouchableOpacity,
    ScrollView,
    ProgressBarAndroid
} from 'react-native'
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons'
import { withStyles } from 'react-native-styleman';

import Text from '../../components/text-component'
import PhrasesRenderer from '../animation-phrases-renderer'
import { mainStyles, normalizeFont } from '../../../styles'

const styles = ({btn, btnText, $lightColor}) => ({
    btn,
    btnText,
    progress: {
        color: $lightColor,
    },
    contentWrap: {
        maxWidth: 300,
      '@media': [
        {
            orientation: 'landscape',
            styles: {
                maxWidth: '100%'
            }
        }
      ]
    },
    subtitle: {
        fontWeight: 'bold',
        fontSize: normalizeFont(18),
        '@media': [
            {
                orientation: 'landscape',
                minWidth: 320,
                maxWidth: 851,
                styles: {
                    fontSize: normalizeFont(12)
                }
            }
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
    col: {
        justifyContent: 'center',
        alignItems: 'center',
        '@media': [
            { // Tablet
              orientation: 'landscape',
              styles: {
                width: '48%',
                maxWidth: 300
              }
            },
          ]
    },
    cloudProgressContainer: {
        width: 200,
        height: 135,
        position: 'relative',
        marginBottom: 10,
        marginTop: 30,
        '@media': [
            {
                orientation: 'landscape',
                minWidth: 320,
                maxWidth: 851,
                styles: {
                    width: 150,
                    height: 100,
                    marginBottom: 3,
                }
            }
        ]
    },
    cloudProgress: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff'
    },
    imagesContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 135,
        resizeMode: 'contain',
        '@media': [
            {
                orientation: 'landscape',
                minWidth: 320,
                maxWidth: 851,
                styles: {
                    height: 100
                }
            }
        ]
    },
    currentWork: {
        alignSelf: 'flex-start',
        width: '100%'
    },
    phraseWrapper: {
        '@media': [
            { // Tablet
                minWidth: 600,
                styles: {
                    paddingTop: 40
                }
            },
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
    images: {
        position: 'absolute'
    },
    owl: {
        bottom: 25,
        height: 68,
        resizeMode: 'contain',
        '@media': [
            {
                orientation: 'landscape',
                minWidth: 320,
                maxWidth: 851,
                styles: {
                    height: 40
                }
            }
        ]
    },
    cloud: {
        height: 136,
        resizeMode: 'contain',
        '@media': [
            {
                orientation: 'landscape',
                minWidth: 320,
                maxWidth: 851,
                styles: {
                    height: 100
                }
            }
        ]
    },
    progressValue: {
        position: 'absolute',
        bottom: 5,
        fontSize: 16,
        fontFamily: 'ProximaBold',
        color: '#95BC3E',
        '@media': [
            {
                orientation: 'landscape',
                minWidth: 320,
                maxWidth: 851,
                styles: {
                    bottom: 2
                }
            }
        ]
    },
    currentStep: {
        marginVertical: 4,
        fontSize: 28,
        fontFamily: 'ProximaSbold',
        '@media': [
            {
                orientation: 'landscape',
                minWidth: 320,
                maxWidth: 851,
                styles: {
                    fontSize: 16,
                    marginVertical: 2
                }
            }
        ]
    },
    text: {
      textAlign: 'center',
      color: $lightColor,
    //   fontSize: normalizeFont(16)
    },
    phraseText: {
        color: $lightColor,
    },
    footer: {
      width: 320,
      alignSelf: 'center'
    }
  })

let renderTitle = (styles, isGuest = false) => {
    const {t} = useTranslation();
    return <View style={{marginBottom: 10}}>
                <Text style={[styles.text, mainStyles.bigAndBoldText]}>{t('not_close_app')}</Text>
            </View>
};

let renderCurrentWork = ({styles, uploader, isCanceling, surveyItem, handleRetry, progress, currentJob, currentStep}) => {
    const progressColor = styles.progress.color
    const {t} = useTranslation();
        if (uploader) {
            let err = surveyItem.respUpload && surveyItem.respUpload.error
            if (err) {
                return <View style={styles.currentWork}>
                    <Text style={[styles.text, {fontSize:18}]}>{err.message || err.toString()}</Text>
                    <TouchableOpacity
                        disabled={isCanceling}
                        onPress={() => handleRetry()}
                        style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}
                        >
                        <Icon name="replay" size={18} color="#fff" fontWeight='700'/>
                        <Text style={[styles.text, styles.subtitle, {fontWeight: 'normal', marginLeft: 10}]}>{t('try_again')}</Text>
                    </TouchableOpacity>
                </View>
            } else {
                return <View style={styles.currentWork}>
                    {(surveyItem.survey.hasNeuroQuestions) && <Text style={[styles.text, styles.currentStep]}>{`${currentStep}/4`}</Text>}
                    <View style={styles.progress}>
                        <ProgressBarAndroid
                            color={progressColor} // TODO: add IOS support ProgressViewIOS
                            styleAttr="Horizontal"
                            indeterminate={false}
                            progress={progress}
                            />
                    </View>
                    <Text style={[styles.text, styles.subtitle]}>{currentJob}</Text>
                </View>
            }
        }

        return <View style={styles.prepareData}>
            <Text style={[styles.text, styles.subtitle]}>{t('preparing_data')}</Text>
        </View>
}


let renderFooter = (styles) => {
    return <PhrasesRenderer style={{ text: styles.phraseText, image: styles.images}} phrasesContainer={styles.phraseWrapper}/>
}

let SyncView = ({ styles, isGuest, uploader, isCanceling, surveyItem, handleRetry, progress, totalProgress = 0, currentJob, currentStep }) => {
    const imgSource = require('@assets/images/cloud_arrow.png'),
            cloud = require('@assets/images/cloud_mask.png');
    return (
        <View style={styles.contentWrap}>
            {renderTitle(styles, isGuest)}
            <View style={styles.row}>
                <View style={styles.col}>
                    <View style={styles.cloudProgressContainer}>
                        <View style={[styles.cloudProgress, {height: `${totalProgress}%`}]}></View>
                        <View style={styles.imagesContainer}>
                            <Image source={cloud} style={[styles.images, styles.cloud]}/>
                            <Image source={imgSource} style={[styles.images, styles.owl]}/>
                            <Text style={styles.progressValue}>{`${totalProgress}%`}</Text>
                        </View>
                    </View>
                    {renderCurrentWork({
                        uploader: uploader,
                        styles: styles,
                        isCanceling: isCanceling,
                        surveyItem: surveyItem,
                        handleRetry: handleRetry,
                        progress: progress,
                        currentJob: currentJob,
                        currentStep: currentStep
                    })}
                </View>
                <View style={styles.col}>
                    {renderFooter(styles)}
                </View>
            </View>
        </View>
    )
}

export default withStyles(styles)(SyncView)