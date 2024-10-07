import React, { Component } from 'react'

import { Button, Text,  View } from 'native-base'
import withStore from '../../store/withStore'
import NavService from '../../utils/navigation-service'
import { normalizeFont} from '../../styles'

import Layout from '../layout/UxReality'
import Navigation from '../layout/Navigation'
import { withStyles } from 'react-native-styleman';

const Nav = () => {
    return(
        <Navigation
            heading="Subscription"
        />
    )
}

const navigate = (navigation, isAuthenticated) => {
    const navParam =  navigation.getParam('success')
    if (isAuthenticated) {
        NavService.navigate('Payment', { success: navParam, count: 2})
    } else {
        NavService.navigate('Register', {
            forceAction: () => NavService.navigate('Payment', { success: navParam, count: 3})
        })
    }
}

const renderFooter = (styles, navigation, isAuthenticated) => {
    return (
        <View>
            <Button style={[styles.btn]} light full onPress={() => navigate(navigation, isAuthenticated)}>
                <Text style={[styles.btnText, {color: '#95BC3E'}]} returnKeyType='send'>Buy Subscription</Text>
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
                marginBottom: 0
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
        fontSize: normalizeFont(24),
        fontWeight: '600'
    },
    subtitle: {
        marginBottom: 20,
        fontWeight: '600'
    },
    content: {
        flex: 1,
        justifyContent: 'center'
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
            minWidth: 600,
            styles: {
                width: '49%'
            }
        }]
    },
    text: {
        fontSize: normalizeFont(16)
    }
  })

let Subscription = ({ styles, navigation, isAuthenticated }) => (
    <Layout 
    navigation={<Nav />}
    fixedFooter={renderFooter(styles, navigation, isAuthenticated)}
    contentStyle={styles.contentWrap}
    styleFooter={styles.footer}
    stickyFooter>
        {/* <CreateProjectLogo wrapStyle={styles.logo}/> */}
        <Text style={styles.title}>Testing longer than 15 sec is available by subscription</Text>
        <View style={styles.content}>
            <Text style={[styles.text, styles.subtitle]}>What you get with this subscription:</Text>
            <View style={styles.row}>
                <View style={styles.col}>
                    <Text style={styles.text}>
                        1. 30 or more recordings per month{'\n'}
                        2. Remote or in-person research{'\n'}
                        3. Unlimited projects{'\n'}
                        4. Individual Session Replay
                    </Text>
                </View>
                <View style={styles.col}>
                    <Text style={styles.text}>
                        5. Surveys{'\n'}
                        6. Download and export recordings{'\n'}
                        7. 24/7 Support
                    </Text>
                </View>
            </View>
        </View>
    </Layout>
);

export default withStore(withStyles(styles)(Subscription))