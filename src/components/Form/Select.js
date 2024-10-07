import React, { Component } from 'react'
import { ScrollView, Text, Dimensions, View, StyleSheet, TouchableOpacity } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import Dialog, { DialogContent } from 'react-native-popup-dialog';
import { withTranslation } from 'react-i18next';
import UICheckbox from './CheckboxGroup'
import Icon from 'react-native-vector-icons/Entypo'
import Popup from '@components/common/Popup'
class Select extends Component {
    state = {
        value: null,
        selectedValue: null,
        visible: false,
        isSelected: false
    };

    componentDidUpdate(prevProps) {
      if (prevProps.items !== this.props.items) {
        this.setState({
          value: null,
          selectedValue: null,
          isSelected: false
        })
      }
    }

      hideModal() {
        this.setState({
          visible: false,
          isSelected: false
        });
      }

      get dialogSize() {
        const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
        let { width, height } = this.props;
        if (width && width > 0.0 && width <= 1.0) {
          width *= screenWidth;
        }
        if (height && height > 0.0 && height <= 1.0) {
          height *= screenHeight;
        }
        return { width, height };
      }

      handleSelected(value) {
        this.setState({
          isSelected: true,
          selectedValue: value
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
        let { value } = this.state
        if (this.state.isSelected) {
          this.props.onSelected(this.state.selectedValue)
          value = this.state.selectedValue
        }
        this.setState({ 
          visible: false,
          value
        });
      }

      showModal() {
        if (this.props.onLoad) this.props.onLoad()
        this.setState({ visible: true });
      }

    render() {
      const {t} = this.props;
        return (
            <View>
              <TouchableOpacity onPress={() => this.showModal()}
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Text style={{ fontSize: 20, color: '#fff', fontFamily: 'ProximaRegular' }}>{ this.state.value ? this.state.value.name : t('please_select')}</Text>
                    <Icon name="triangle-right" size={18} color='#fff'/>
                </TouchableOpacity>
                <Popup
                  visible={this.state.visible}
                  title={t('please_select')}
                  width={280}
                  footer={<View style={[styles.footer, styles.footerRight]}>
                      <TouchableOpacity onPress={() => this.hideModal()}>
                        <Text style={styles.btn}>{t('cancel_btn')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => this.handleOk()}>
                        <Text style={styles.btn}>{t('ok_btn')}</Text>
                      </TouchableOpacity>
                  </View>}
                  onHide={this.hideModal.bind(this)}>
                  <UICheckbox
                    items={this.props.items}
                    onSelected={(option) => this.handleCheckbox(option)}
                    style={{ borderColor: 'rgba(0,0,0,.5)', borderWidth: 2, borderStyle: 'solid' }}
                    checkedStyle={{ borderColor: '#95BC3E', borderWidth: 2, borderStyle: 'solid' }}
                    checkIcoStyle={{ backgroundColor: '#95BC3E', width: 10, height: 10}}
                    onSelected={(value) => this.handleSelected(value)}
                    labelStyle={this.props.labelStyle} />
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
      content: {
        paddingHorizontal: 6, // Dafault value - 18
        height: 300
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