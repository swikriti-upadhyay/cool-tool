import React, { Component } from 'react'
import {TextInput, View, Text, TouchableOpacity} from 'react-native'
import styles from '../styles/input-style'
import EStyleSheet from 'react-native-extended-stylesheet'
import Icon from 'react-native-vector-icons/MaterialIcons'
import {fontKoef, setNormalizedFontSize} from '../styles/font-normilize'
export default class PasswordFormItem extends Component {
    state = {
      secure: true
    }

    toggleSecure() {
      this.setState({
        secure: !this.state.secure
      })
    }

    render() {
        // let error = (this.props.errors && this.props.errors.length > 0) ? { borderColor: 'red' } : null
        const placeholder = EStyleSheet.value('$placeholder')
        let placeholderColor = this.props.placeholderTextColor || placeholder
        let inputStyle = setNormalizedFontSize(this.props.style || styles.inputStyle)
        return <View style={styles.formField}>
            <TextInput
                {...this.props}
                secureTextEntry={this.state.secure}
                style={[inputStyle, styles.inputContainerStyle, this.props.inputContainerStyle]}
                placeholderTextColor={placeholderColor}
            />
            {this.props.showIcon ? <TouchableOpacity onPress={()=>this.toggleSecure()} style={ style.eyeIcon }>
              <Icon name={this.state.secure ? 'visibility' : 'visibility-off'}
                size={36}
                color={EStyleSheet.value('$lightColor')}
            /></TouchableOpacity> : null}
            { this.props.errors && this.props.errors.length > 0 && this.props.errors.map((item, index) =>
            item.field === this.props.name && item.error ?
              <Text style={{ color: 'red' }} key={index}>
                {item.error}
              </Text>
            : <View key={index} />
          )
        }
        </View>
    }
}

const style = EStyleSheet.create({
  eyeIcon: {
    position: 'absolute',
    right: 22,
    top: 8
  }
})