import React, { Component } from 'react'
import { 
          Text,
          Button,
          Icon } from 'native-base'
import { 
          WebView } from 'react-native-webview';
import EStyleSheet from 'react-native-extended-stylesheet'

import { BaseComponent } from '@components/BaseComponent'
import Layout from '../../../views/layout/UxReality'
import Navigation from '../../../views/layout/Navigation'
import NavService from '../../../utils/navigation-service'
import Loader from '../../../views/common/loader-view'

export default class PageView extends BaseComponent {
  static defaultProps = { 
    uri: '',
    heading: ''
  }

  constructor(props) {
    super(props)
    super.init(styles, landscapeStyles)
  }

  renderNav() {
    return <Navigation
              back={false}
              left={
                  <Button
                      transparent
                      onPress={() => NavService.back()}
                      >
                      <Icon name='arrow-back' />
                  </Button>
              }
              heading={this.props.heading}
            />
}

  render() {
    let { 
          uri } = this.props
    return <Layout 
                  navigation={this.renderNav()}
                  style={{ textAlign: 'center' }}
                  contentStyle={this.getStyle().contentStyle}
                  noPadding
                  stickyFooter>
              <WebView 
                source={{uri: uri}}
                startInLoadingState={true}
                renderLoading={() => <Loader loading/>}
              />
            </Layout>
  }
}

const styles = EStyleSheet.create({
  contentStyle: {
    paddingHorizontal: 0,
    marginTop: -70
  },
})

const landscapeStyles = EStyleSheet.create({
  contentStyle: {
      paddingLeft: 0,
      paddingRight: 0,
      marginTop: -70
    },
})