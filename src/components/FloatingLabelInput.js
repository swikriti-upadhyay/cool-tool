import React, { Component } from 'react';
import { View, StatusBar, TextInput, Text } from 'react-native';
import PropTypes from 'prop-types'
import { withStyles } from 'react-native-styleman';
import StyleService from '../../utils/style-service'

import { normalizeFont } from '../../views/styles/font-normilize'

const styles = ({ btn, btnText, $darkThemeText }) => ({
  btn,
  btnText,
  focused_input: {
    '@media': [
      { // mobile
        orientation: 'landscape',
        minWidth: 320,
        maxWidth: 851,
        styles: {
          color: $darkThemeText
        }
      }
    ],
  },
})
class FloatingLabelInput extends Component {
    state = {
      isFocused: false,
      hasErrors: false,
      testWidth: '99%'
    }
    timeout = null
    // Props:
    static propTypes = { 
      focus: PropTypes.bool,
    } 

    static defaultProps = { 
        focus: false,
    }

    componentDidMount() {
      /* Evidently, resizing triggers something that makes copy-paste work.
      * Timeout is mandatory for this hack, doesn't work otherwise.
     */
    this.timeout = setTimeout(() => {
        this.setState({testWidth: '100%'})
      }, 100)
    }

    componentWillUnmount() {
      clearTimeout(this.timeout)
    }

    componentWillReceiveProps(nextProps) {
      const {focus, errors, name} = nextProps;
      let isError = false

      focus && this.focus();
      errors && errors.length > 0 && errors.map((item, index) => {
        if (item.field === name && item.error) {
          isError = true
        }
      })
      this.setState({
        hasErrors: isError
      })
    }

    focus() {
      this._component.focus(); 
    }
  
    handleFocus = (e) => {
      this.setState({ isFocused: true })
      this.props.onFocus && this.props.onFocus(e)
      if (this.state.hasErrors) {
        // this.setState({hasErrors: false})
      }
    };
    handleBlur = (e) => {
      this.setState({ isFocused: false })
      this.props.onBlur?.(e);
    };

    renderChildren() {
      const {children} = this.props
      return children
    }

    renderErrors() {
      const {errors, name} = this.props;
      return errors && errors.length > 0 && errors.map((item, index) => {
        if (item.field === name && item.error) {
          return item.error
        }
      })
    }

    renderLabel() {
      const { isFocused } = this.state;
      const { label, placeholder, value } = this.props;
      if (!placeholder) return label

      return isFocused || !!value ? label : null
    }
  
    render() {
      const { label, children, value, errors, name, multiline, styles, ...props } = this.props;
      const { isFocused, hasErrors } = this.state;
      const labelStyle = {
        position: 'absolute',
        left: 0,
        top: !isFocused && !value ? 15 : 5,
        fontSize: !isFocused && !value ? normalizeFont(16) : normalizeFont(12),
        color: '#ffffff80',
      };
      const errorLabel = {
        position: 'absolute',
        left: 0,
        top: 5,
        fontSize: 12,
        color:'red'
      };
      const inputStyle = {
        top: !isFocused && !value ? 0 : 10,
        height: !multiline ? 42: null,
        paddingBottom: multiline ? 15: null,
        fontSize: normalizeFont(16),
        color: '#fff'
      }
      return (
        <View style={[this.props.containerStyle ,{borderBottomColor: hasErrors ? 'red' : '#fff'}, { height: !multiline ? 52 : null, borderBottomWidth: 1 }]}>
          <Text style={hasErrors ? errorLabel : labelStyle}>
            {hasErrors ? this.renderErrors() : this.renderLabel()}
          </Text>
          <TextInput
            blurOnSubmit={StyleService.isLandscape ? true : false}
            {...props}
            value={value}
            multiline={multiline}
            blurOnSubmit={!multiline}
            style={[ inputStyle, {width: this.state.testWidth}, isFocused && styles.focused_input, {left: -5}]}
            placeholderTextColor='rgba(255, 255, 255, 0.5)'
            onFocus={this.handleFocus.bind(this)}
            onBlur={this.handleBlur.bind(this)}
            ref={(input) => { this._component = input; }}
          />
          {this.props.children}
        </View>
      );
    }
  }
  
  export default withStyles(styles)(FloatingLabelInput)