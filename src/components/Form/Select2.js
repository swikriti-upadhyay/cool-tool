import React, { Component } from 'react'
import { ScrollView, Text, Dimensions, View, StyleSheet, TouchableOpacity, Keyboard, BackHandler } from 'react-native'
import { withTranslation } from 'react-i18next';
import EStyleSheet from 'react-native-extended-stylesheet'
import Icon from 'react-native-vector-icons/Entypo'
import Dialog, { DialogContent } from 'react-native-popup-dialog';

import UICheckbox from './RadioBox2'
import Loader from '../../../views/common/loader-view'
import Popup from '@components/common/Popup'

class Select extends Component {
    static defaultProps = {
      data: []
    }
    state = {
        value: null,
        visible: false,
        isSelected: false,
        item: null,
        data: []
      };

      componentDidMount() {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.hideModal.bind(this))
        this.setState({
          item: this.props.currentItem,
          data: this.props.data,
          value: this.props.currentValue
        })
      }

      componentWillReceiveProps(nextProps){
        if(nextProps.currentItem !== this.props.currentItem){
          this.setState({item: nextProps.currentItem });
        }
      }

      componentWillUnmount() {
        this.backHandler.remove()
      }

      get name() {
        let  { currentItem, currentValue } = this.props
        if (currentItem && currentItem.name) return currentItem.name
        if (currentValue) return currentValue
      }

      hideModal() {
        this.props.onCancel && this.props.onCancel()
        this.setState({
          visible: false,
          isSelected: false,
          value: null,
          item: null
        });
      }

      handleSelected(item) {
        this.setState({
          isSelected: true,
          value: item.value,
          item: item
        })
      }

      handleCheckbox(item) {
        this.setState({
            value: item
        })
        this.surveyItem.alternative = this.setAlternative(item, {
            value: 1
        })
      }

      handleOk() {
        this.hideModal()
        if (this.state.item) this.props.onSave(this.state.item)
      }

      showModal() {
        Keyboard.dismiss()
        this.setState({ visible: true }, () => {
          this.props.onLoad?.().then((data) => {
            this.setState({data})
          })
        });
      }

      renderContent() {
        return this.state.data.length ? this.state.data.map((item, key) => this.renderItem( {item}, key)) : null
      }

      renderItem(item, key) {
        return this.props.renderItem ? this.props.renderItem(item, key) : this.renderRadioBox(item, key)
      }

      get isCurrentItem() {
        if (this.props.currentValue) return  this.state.data?.find(item => item.name == this.props.currentValue).value
        if (this.props.currentItem && this.props.currentItem.value) return this.props.currentItem.value
      }

      renderRadioBox({item}, index) {
        return (
          <UICheckbox
            key={index}
            data={item}
            text={item.name} 
            current={(this.state.value || this.isCurrentItem) === item.value}
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
                {this.state.data.length ? this.renderContent() : <Loader />}
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