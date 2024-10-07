import React, { Component } from 'react'
import { ScrollView, Text, Dimensions, View, StyleSheet, TouchableOpacity } from 'react-native'
import Dialog, { DialogContent } from 'react-native-popup-dialog';
import { withTranslation } from 'react-i18next';

import EStyleSheet from 'react-native-extended-stylesheet'

class Popup extends Component {

    hideModal() {
        this.props.onHide()
    }
    
    render() {
      const { t, visible } = this.props
        return(
            <Dialog
                visible={visible}
                onTouchOutside={() => this.hideModal()}
                dialogStyle={{ width: '80%', marginHorizontal: 20, borderRadius: 3 }}
                footer={<View style={[styles.footer, styles.footerRight]}>
                          <TouchableOpacity onPress={() => this.hideModal()}>
                            <Text style={styles.btn}>{t('continue_btn')}</Text>
                          </TouchableOpacity>
                      </View>}
            >
                <DialogContent>
                  <ScrollView style={styles.content}>
                    <Text>asd</Text>
                  </ScrollView>
                </DialogContent>
            </Dialog>
        )
    }
}

export default withTranslation()(Popup)

const styles = EStyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFill,
        top: 0,
        flex: 1,
        backgroundColor: 'rgba(0,0,0,.5)'
    },
    content: {
      paddingHorizontal: 6, // Dafault value - 18
      height: 300
    },
})