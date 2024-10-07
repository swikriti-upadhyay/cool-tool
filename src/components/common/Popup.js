import React, { useState, Component } from 'react'
import { ScrollView, Text, Dimensions, View, StyleSheet, TouchableOpacity } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import Dialog, { DialogContent } from 'react-native-popup-dialog';
import { withStyles } from 'react-native-styleman';

function renderHeader(styles, header) {
  if (header.title)
    return <Text style={styles.header}>{header.title}</Text>
  if (header.bgImage)
    return header.bgImage
}

const styles = () => ({
  overlay: {
    ...StyleSheet.absoluteFill,
    top: 0,
    flex: 1,
    backgroundColor: 'rgba(0,0,0,.5)'
  },
  content: {
    paddingHorizontal: 20, // Dafault value - 18
    marginVertical: 20,
    // maxHeight: 300,
    '@media': [
      {
          orientation: 'landscape',
          minWidth: 320,
          maxWidth: 851,
          styles: {
              maxHeight: 150
          }
      },
    ]
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 24, // Default value for content
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold'
  },
  footer: {
    height: 52,
    alignItems: 'center',
    flexDirection: 'row',
    // borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, .12)',
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

  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
  },
  dialog: {
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  hidden: {
    top: -10000,
    left: 0,
    height: 0,
    width: 0,
  },
  round: {
    borderRadius: 8,
  },
})

function Popup({ styles, dialogStyle, contentStyle, visible, onHide, footer, children, width, height, title, bgImage }) {
  const header = {
    title, bgImage
  }
  return (
      <Dialog
        visible={visible}
        onTouchOutside={() => onHide()}
        dialogStyle={[{ width: '100%', maxHeight: '90%', maxWidth: 350, borderRadius: 3 }]}
        dialogTitle={renderHeader(styles, header)}
        footer={footer}
        >
          <ScrollView style={[styles.content, contentStyle]}>
            {children}
          </ScrollView>
    </Dialog>
)
}

export default withStyles(styles)(Popup)