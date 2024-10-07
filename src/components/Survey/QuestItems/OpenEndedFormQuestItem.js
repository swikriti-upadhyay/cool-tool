import React, { Component } from 'react';
import { View } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import { Form } from "native-base";
import { OpenEnded } from '@components/Survey/OpenEnded'

export default class OpenEndedFormQuestItem extends Component {

    state = {
        answers: [],
        selectedIds: []
    }

    handleChangeText(changedItem) {
        let answers = [...this.state.answers]
        let itemIndex = answers.findIndex(item => item.id === changedItem.id)
        if(itemIndex === -1) {
            answers.push(changedItem)
        } else {
            answers[itemIndex] = changedItem
            if (changedItem.valueText.length === 0) answers.splice(itemIndex, 1)
        }
        this.setState({
            answers
        })
        this.props.handleChange(answers)
    }

    render() {
        const { alternatives } = this.props
    return(
        <Form style={styles.pickerWrapper}>
            {alternatives.map((alternative) => {
                return <View style={styles.questionWrapper} key={alternative.id}>
                    <OpenEnded
                        isMulti
                        label={alternative.name}
                        onChange={(text) => this.handleChangeText(text)}
                        multiline
                        item={alternative}
                    />
                </View>
            })}
        </Form>
    )
    }
}

const styles = EStyleSheet.create({
    questionWrapper: {
        marginBottom: 8
    },
    pickerWrapper: {
        // paddingHorizontal: 20,
        borderWidth: 0,
        backgroundColor: 'transparent',
     },
})

// export default class OpenEndedFormQuestItem {

// }