import React, { Component } from 'react';
import { Container, Content, Text, StyleProvider, Footer, FooterTab, View} from 'native-base';
import PropTypes from 'prop-types'
import EStyleSheet from 'react-native-extended-stylesheet'
import { observer } from 'mobx-react'
import { Dimensions } from "react-native";

// import getTheme from '../../native-base-theme/components'
// import material from '../../native-base-theme/variables/neurolab'

import getBaseTheme from '../../native-base-theme/components';
import custom from '../../neurolab-theme/variables/custom';
import getMyTheme from '../../neurolab-theme/components';
import StyleService from '../../utils/style-service'
import Loader from '../common/loader-view'

const baseTheme = getBaseTheme(custom);
const myTheme = getMyTheme();
const theme = {
  ...baseTheme,
  ...myTheme,
};

@observer
export default class MainLayout extends Component {
  static propTypes = { 
    loading: PropTypes.bool,
  } 

  static defaultProps = { 
    loading: false,
  }

  getStyle(){
    let baseStyles = styles
    if (StyleService.viewMode === 'landscape') {
      return {...baseStyles, ...landscapeStyles};
    } else {
      return baseStyles;
    }
  }

  render() {
    let { 
      navigation,
      bgColor,
      children,
      footer,
      scrollHandler,
      loading,
      contentStyle,
      contentWrap,
      stickyFooter,
      fixedFooter,
      styleFooter,
      noPadding
    } = this.props
    let footerStyle = stickyFooter ? this.getStyle().stickyFooter : this.getStyle().footer
    let handleScroll = scrollHandler ? (event) => scrollHandler(event.nativeEvent) : ()=>{}
    return (
        <StyleProvider style={theme}>
          <Container>
              {navigation}
              <Content 
                contentContainerStyle={[this.getStyle().content, contentStyle, noPadding && this.getStyle().noPadding]}
                onScroll={(event) =>{handleScroll(event)}}
                scrollEventThrottle={16}
                style={{ backgroundColor: bgColor }}>
                  <View style={[this.getStyle().contentWrap, contentWrap]}>
                    {children}
                    {footer && <View style={[footerStyle, styleFooter]}>{footer}</View>}
                  </View>
              </Content>
              {fixedFooter && <View style={[styles.fixedFooter, styleFooter]}>{fixedFooter}</View>}
          {loading && <Loader loading/>}
          </Container>
        </StyleProvider>
    );
  }
}

const styles = EStyleSheet.create({
    // $outline: 1,
    header: {
      paddingHorizontal: 15,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: 20,
    },
    contentWrap: {
      flex: 1,
    },
    footer: {
      justifyContent: 'flex-end'
    },
    get stickyFooter() {
      return {
        ...this.footer,
        flex: 1,
        marginTop: 40,
        marginBottom: 30,
      }
    },
    fixedFooter: {
      paddingHorizontal: 20,
      paddingVertical: 20
    },
    noPadding: {
      paddingHorizontal: 0,
      paddingVertical: 0
    }
})

const landscapeStyles = EStyleSheet.create({
      content: {
        flexGrow: 1,
        paddingLeft: 40,
        paddingRight: 40,
      },
      footer: {
        justifyContent: 'flex-end',
      },
      get stickyFooter() {
        return {
          ...this.footer,
          flex: 1,
          marginTop: 30,
          marginBottom: 20,
        }
      }
})