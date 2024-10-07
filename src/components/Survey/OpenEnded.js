import React, { Component } from 'react'

import FloatingLabel from '@components/FloatingLabelInput'

class OpenEnded extends Component {

    constructor(props) {
        super(props);
        this.state = {
            value: ''
        }
    }

    handleChangeText(text, item) {
        let newAnswer = {...item};
        let {isMulti} = this.props
        this.setState({
            value: text
        })
        if (isMulti) {
            newAnswer.valueText = text
        } else {
            newAnswer.value = text
        }
        this.props.onChange(newAnswer)
    }

    render() {
        let { item, onChange, ...props } = this.props
        let { value } = this.state
        return <FloatingLabel {...props} value={value} onChangeText={ (text)=> this.handleChangeText(text, item)}/>
    }
}

export { OpenEnded };