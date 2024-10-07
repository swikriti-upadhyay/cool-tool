import React, {Component} from 'react';
import {Modal, Text, TouchableHighlight, View, Alert, ScrollView, Image, TouchableOpacity} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import { withTranslation } from 'react-i18next';

import Popup from '@components/common/Popup'

class TaskPopup extends Component {
    static defaultProps = {
        visible: false
    }

  hide() {
    this.props?.onHide()
  }

  render() {
    const { children, visible, t } = this.props
    const imgSource = require('@assets/images/test_site_popup.png')
    return (
        <Popup
            bgImage={<Image source={imgSource} style={styles.bgPopup} />}
            visible={visible}
            headerStyle={{ paddingVertical: 0, paddingHorizontal: 0, marginTop: 0 }}
            footer={<View style={[styles.footer, styles.footerRight]}>
                        <TouchableOpacity onPress={() => this.hide()}>
                          <Text style={styles.btn}>{t('continue_btn')}</Text>
                        </TouchableOpacity>
                    </View>}
            onHide={() => this.hide()}>
                <Text style={{ fontSize: 18, color: '#000000' }}>{children}</Text>
        </Popup>
    );
  }
}

export default withTranslation()(TaskPopup)

const styles = EStyleSheet.create({
  bgPopup: {
      marginTop: -10,
      width: '100%',
      height: 140,
      resizeMode: 'cover'
  },
  footer: {
    height: 52,
    alignItems: 'center',
    flexDirection: 'row',
    borderTopColor: 'rgba(0, 0, 0, .12)',
    paddingHorizontal: 4,
  },
  footerRight: {
      justifyContent: 'flex-end'
  },
  btn: {
    color: '#95BC3E',
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 75,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginHorizontal: 8,
    justifyContent: 'center', 
    alignItems: 'center',
    textAlign: 'center',
  },
})