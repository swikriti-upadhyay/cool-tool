// import React, { Component } from 'react'
import { showMessage, hideMessage } from 'react-native-flash-message';

const TYPES = {
    danger: 'Error'
}
const fleshShow = (type, text) => {
    showMessage({
        message: TYPES[type],
        description: text,
        type: type,
        duration: 10000,
        icon: 'auto'
    })
}
const fleshHide = () => hideMessage()

export {
    fleshHide,
    fleshShow
}