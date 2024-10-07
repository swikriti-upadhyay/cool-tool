import React, { useState } from 'react'
import {
    View,
    Text,
    TouchableOpacity } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import Popup from './Popup'
import withStore from '../../../store/withStore'

function RecordingsLimitPopup({ onAllow, visible, onHide, subscriptionStore }) {
    let extraResponsePrice = subscriptionStore?.subscription?.extraResponsePrice

    return (
        <Popup
            visible={visible}
            title="Recordings limit over"
            width={280}
            onHide={() => onHide()}
            footer={<View style={[styles.footer, styles.footerRight]}>
                        <TouchableOpacity onPress={() => onHide()}>
                            <Text style={styles.btn}>CANCEL</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { onAllow()}}>
                            <Text style={styles.btn}>ALLOW</Text>
                        </TouchableOpacity>
                    </View>}
            >
            <Text>
                You have run out recordings of current subscription.
                Further, all entries outside the subscription will be charged at ${extraResponsePrice}.
            </Text>
        </Popup>
    )
}

const styles = EStyleSheet.create({
    footer: {
        height: 52,
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 4,
      },
      footerRight: {
          justifyContent: 'flex-end'
      },
      btn: {
        color: '#95BC3E',
        fontSize: 14,
        width: 75,
        fontWeight: 'bold',
        paddingVertical: 8,
        marginHorizontal: 4,
        justifyContent: 'center', 
        alignItems: 'center',
        textAlign: 'center',
      },
})

export default withStore(RecordingsLimitPopup)