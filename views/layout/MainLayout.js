import React, { Component } from 'react';
import { Container, Content, StyleProvider, Footer, FooterTab, View} from 'native-base';
import { withStyles } from 'react-native-styleman';
import { Text, Button, Icon } from 'native-base'

import Navigation from './Navigation'
import Loader from '../common/loader-view'
import NavService from '../../utils/navigation-service'
import getBaseTheme from '../../native-base-theme/components';
import custom from '../../neurolab-theme/variables/custom';
import getMyTheme from '../../neurolab-theme/components';
const baseTheme = getBaseTheme(custom);
const myTheme = getMyTheme();
const theme = {
  ...baseTheme,
  ...myTheme,
};

const styles = ({btn, btnText}) => ({
    btn,
    btnText,
    screenColor: {
        color: '#31A5C5'
    },
    contentWrap: {
        flex: 1,
    },
    contentContainerStyle: {
        flexGrow: 1,
        paddingHorizontal: 20,
    },
    footer: {
        width: '100%',
        alignSelf: 'center',
        // maxWidth: 320,
        justifyContent: 'flex-end',
        flex: 1,
        marginTop: 40,
        marginBottom: 30,
      },
})

const renderHeader = (styles, screenColor, nav) => {
    return <Navigation
        bgColor={screenColor}
        back={false}
        left={
            <Button
                transparent
                onPress={() => NavService.back()}
                >
                <Icon name='arrow-back' />
            </Button>
        }
        heading={nav.heading}
        right={
            <Button
                transparent
                // onPress={() => this.onSave()}
                // disabled={this.canSave()}
            >
                <Text style={{ fontSize: 16 }}>{nav.right}</Text>
            </Button>
        }
        />
}

let MainLayout = ({ styles, children, screenColor, nav, footer, loading }) => (
    <StyleProvider style={theme}>
        <Container>
            {renderHeader(styles, screenColor, nav)}
            <Content 
                contentContainerStyle={styles.contentContainerStyle}
                // onScroll={(event) =>{handleScroll(event)}}
                scrollEventThrottle={16}
                style={{ backgroundColor: screenColor }}
                >
                <View style={styles.contentWrap}>
                    {children}
                    {footer && <View style={styles.footer}>{footer}</View>}
                </View>
            </Content>
            {loading && <Loader loading/>}
            {/* {fixedFooter && <View style={[styles.fixedFooter, styleFooter]}>{fixedFooter}</View>}
        {loading && <Loader loading/>} */}
        </Container>
    </StyleProvider>
)
MainLayout = withStyles(styles)(MainLayout)
export { MainLayout }