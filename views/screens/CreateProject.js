import React, { Component } from 'react'

import { Button, Text,  View } from 'native-base'
import { Linking } from 'react-native'
import NavService from '../../utils/navigation-service'
import { normalizeFont} from '../../styles'

import Layout from '../layout/UxReality'
import Navigation from '../layout/Navigation'
import CreateProjectLogo from '@components/CreateProjectLogo'
import { withStyles } from 'react-native-styleman';

const Nav = () => {
    return(
        <Navigation
            heading="What is the invitation code?"
        />
    )
}

const renderFooter = (styles) => {
    return (
        <View>
            <Button style={[styles.btn]} bordered light full onPress={() => NavService.back()}>
                <Text style={[styles.btnText, {color: '#fff'}]} returnKeyType='send'>Ok, got it!</Text>
            </Button>
        </View>
    )
}

const styles = ({btn, btnText}) => ({
    btn,
    btnText,
    contentWrap: {
      '@media': [
        { // Tablet
          orientation: 'portrait',
          minWidth: 600,
          styles: {
            width: 440,
            alignSelf: 'center'
          }
        },
        {
            orientation: 'landscape',
            minWidth: 600,
            styles: {
                width: '100%'
            }
        }
      ]
    },
    logo: {
        marginBottom: 40,
        '@media': [{
            orientation: 'portrait',
            minWidth: 600,
            styles: {
                marginVertical: 110,
            }
        },
        {
            orientation: 'landscape',
            minWidth: 320,
            maxWidth: 851,
            styles: {
                marginBottom: 20
            }
        },
    ],
    },
    footer: {
      width: '100%',
      alignSelf: 'center',
      maxWidth: 320
    },
    title: {
        height: 52,
        marginBottom: 12,
        fontSize: normalizeFont(16),
        fontWeight: '600',
        textAlign: 'center',
        '@media': [{
            orientation: 'landscape',
            minWidth: 600,
            styles: {
                height: 24
            }
        }]
    },
    row: {
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    col: {
        width: '100%',
        '@media': [{
            orientation: 'landscape',
            minWidth: 320,
            maxWidth: 851,
            styles: {
                width: '49%'
            }
        }]
    },
    text: {
        fontSize: normalizeFont(16)
    },
  })

let CreateProject = ({ styles, props }) => (
    <Layout 
    navigation={<Nav />}
    footer={renderFooter(styles)}
    contentStyle={styles.contentWrap}
    styleFooter={styles.footer}
    stickyFooter>
        <CreateProjectLogo wrapStyle={styles.logo}/>
        {/* <Text style={styles.title}>How to create a remote UX study within UXReality?</Text> */}
        <View style={styles.row}>
            <View style={styles.col}>
                <Text style={styles.text}>
                Invitation code allows participating in user testing projects run at the UXReality platform. Only the research project owner can provide you with the invitation code.{'\n'}
                </Text>
            </View>
            <View style={styles.col}>
                <Text style={styles.text}>
                If you are the research project owner and just want to try going through your test as a respondent,  then go to your account on desktop, open a project you need. In the "Invite testers" tab you'll see the code (generated automatically) - copy it and paste into the field in UXReality app
                </Text>
            </View>
        </View>
    </Layout>
);

export default withStyles(styles)(CreateProject)