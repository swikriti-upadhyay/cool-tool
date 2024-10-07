import React, { Component, useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, TextInput } from 'react-native';

import { withStyles } from 'react-native-styleman';

import Constants from '../../constants'
import NavService from '../../utils/navigation-service'
import { Storages } from '../../storage/data-storage-helper'
import { CopyWrapper } from '../../views/common/CopyWrapper'
import { deviceInfo } from '../../utils/device-info-service'

import Popup from '@components/common/Popup'

const styles = () => ({
  container: {
    position: "absolute",
    top: 100,
    left: 0
  },
  btn: {
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    alignItems: "center",
    justifyContent: "center"
  },
  action: {
    fontSize: 16, 
    color: '#000'
  },
  link: {
    marginBottom: 10
  }
})

const DebugView = ({styles}) => {
  const [visible, setVisible] = useState(false);
  const [deviceId, setDeviceId] = useState(0);
  const [canSkipCalibration, setCanSkip] = useState(false);
  const [value, onChangeText] = React.useState('Useless Placeholder');


  function getDeviceInfo() {
    deviceInfo.getMACAddress()
      .then(macId => setDeviceId(macId))
  }

  function getSettings() {
    Storages.SettingsStorage.getSettings()
    .then(settings => setCanSkip(settings?.selectedCamera !== -1))
  }

  useEffect(() => {
    getDeviceInfo();
    getSettings();
  }, [setVisible, setDeviceId, setCanSkip]);

  const navTo = (path) => { // TODO: memo
    setVisible(false)
    NavService.navigate(path)
  };
  const skipCalibration = () => {
    Constants.skipCalibration = true;
    setCanSkip(false)
  }
  return (
    <View style={styles.container}>
        <TouchableOpacity
          onPress={() => setVisible(true)}
          style={styles.btn}>
                <Text style={{ fontSize: 16, color: '#000' }}>>></Text>
        </TouchableOpacity>
        {/* modal */}
        <Popup 
          visible={visible} 
          width={280}
          onHide={() => setVisible(false)}>
            <TouchableOpacity
              onPress={() => navTo("Storage")}
              style={styles.link}>
                <Text style={styles.action}>Storage</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navTo("Logs")}
              style={styles.link}>
                <Text style={styles.action}>Logs</Text>
            </TouchableOpacity>
            {canSkipCalibration && <TouchableOpacity
              onPress={() => skipCalibration()}
              style={styles.link}>
                <Text style={styles.action}>Skip Face Detection</Text>
            </TouchableOpacity>}
            {/* <TextInput
              style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
              onChangeText={text => onChangeText(text)}
              value={value}
            /> */}
            <View style={{ height: 52, justifyContent: "flex-start", alignItems: "center", flexDirection: "row" }}>
                <Text>Device ID: </Text><CopyWrapper text={deviceId} />
            </View>
          </Popup>
      </View>
  )
}

const StyledDebugView = withStyles(styles)(DebugView)

const withDebug = (Comp) => {
  return ({ children, ...props }) => {
    return(
      <View style={{height: '100%', width: '100%'}}>
        <Comp {...props} />
        <StyledDebugView />
      </View>
    )
  }
}

export default withDebug;