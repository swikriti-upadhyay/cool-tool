import React, { Component } from 'react'
import { ScrollView, Text, Dimensions, View, StyleSheet, TouchableOpacity, Keyboard, BackHandler } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import { withTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Entypo'
import Dialog, { DialogContent } from 'react-native-popup-dialog';

import UICheckbox from './RadioBox2'
import Loader from '../../../views/common/loader-view'
import Popup from '@components/common/Popup'

class Select extends Component {
    state = {
        value: null,
        visible: false,
      };

      componentDidMount() {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.hideModal.bind(this))
        // this.setState({
        //   value: this.props.value
        // })
      }

      componentWillReceiveProps(nextProps){
        if(nextProps.value !== this.props.value){
          this.setState({value: nextProps.value });
        }
      }

      componentWillUnmount() {
        this.backHandler.remove()
      }

      get name() {
        let  { value } = this.props
        return this.props.options[value]
      }

      hideModal() {
        this.props.onCancel && this.props.onCancel()
        this.setState({
          visible: false,
        });
      }

      handleSelected({value}) {
        this.setState({value})
      }

      handleOk() {
        this.hideModal()
        this.props.onSave(this.state.value)
      }

      showModal() {
        Keyboard.dismiss()
        this.setState({ visible: true }, () => this.props.onLoad?.());
      }

      renderContent() {
          let { options } = this.props
          let data = Object.keys(options)
        return data ? data.map((item, key) => this.renderRadioBox({value: item, name: options[item]}, key)) : null
      }

      get isCurrentItem() {
        if (this.props.currentItem && this.props.currentItem.value) return this.props.currentItem.value
      }

      renderRadioBox(item, index) {
        return (
          <UICheckbox
            key={index}
            data={item}
            text={item.name} 
            current={this.state.value === item.value}
            onSelected={(item) => this.handleSelected(item)}
            style={{ borderColor: 'rgba(0,0,0,.5)', borderWidth: 2, borderStyle: 'solid' }}
            checkedStyle={{ borderColor: '#95BC3E', borderWidth: 2, borderStyle: 'solid' }}
            checkIcoStyle={{ backgroundColor: '#95BC3E', width: 10, height: 10}}
            itemStyle={{ height: 48 }}
          />
        )
      }

    get labelColor() {
      return this.name ? '#fff' : 'rgba(255, 255, 255, 0.5)'
    }

    render() {
      const {t} = this.props;
        return (
            <View>
              <TouchableOpacity onPress={() => this.showModal()}
                style={styles.select}>
                    <View>
                      {this.name ? <Text style={styles.label}>{this.props.label}</Text> : null}
                      <Text style={{ fontSize: 16, color: this.labelColor, fontFamily: 'ProximaRegular' }}>{ this.name ? this.name : this.props.placeholder || t('please_select')}</Text>
                    </View>
                    <Icon name="triangle-right" size={18} color='#fff'/>
                </TouchableOpacity>
              <Popup
                visible={this.state.visible}
                title={this.props.title}
                width={280}
                onHide={this.hideModal.bind(this)}
                footer={<View style={[styles.footer, styles.footerRight]}>
                          <TouchableOpacity onPress={() => this.hideModal()}>
                            <Text style={styles.btn}>{t('cancel_btn')}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => this.handleOk()}>
                            <Text style={styles.btn}>{t('ok_btn')}</Text>
                          </TouchableOpacity>
                      </View>}
              >
                {this.renderContent()}
            </Popup>
            </View>
        )
    }
}

export default withTranslation()(Select)

const styles = EStyleSheet.create({
      overlay: {
          ...StyleSheet.absoluteFill,
          top: 0,
          flex: 1,
          backgroundColor: 'rgba(0,0,0,.5)'
      },
      select: {
        height: 52,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomColor: '#fff',
        borderBottomWidth: 1
      },
      label: {
        fontSize: 12,
        color: '#ffffff80',
      },
      content: {
        paddingHorizontal: 6, // Dafault value - 18
        // height: '100%',
        maxHeight: 150
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
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, .12)',
        paddingHorizontal: 4,
      },
      footerRight: {
          justifyContent: 'flex-end'
      },
      btn: {
        color: '#95BC3E',
        fontSize: 14,
        minWidth: 75,
        fontWeight: 'bold',
        paddingVertical: 8,
        paddingHorizontal: 8,
        marginHorizontal: 8,
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
});