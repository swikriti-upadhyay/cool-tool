import React, { Component } from 'react'
import {
    Text,
    View,
    ScrollView,
    TouchableOpacity
} from 'react-native'
import { Picker, Form, Item } from "native-base";
import { withStyles } from 'react-native-styleman';
import SurveyButton from '../components/survey-btn-component'
import BaseRenderer from './base-renderer'
import EStyleSheet from 'react-native-extended-stylesheet'
import Checkbox from '@components/Form/CheckboxGroup'
import { OpenEnded } from '@components/Survey/OpenEnded'
import { LabelOpenEnded } from '@components/Survey/LabelOpenEnded'
import Rating from '@components/Form/RatingQuestion'

import Select from '@components/Form/Select'
import RadioBox from '@components/Form/RadioBox'
import OpenEndedFormQuestion from '@components/Survey/QuestItems/OpenEndedFormQuestItem'
import NoItems from '@components/Survey/NoItems'

import { normalizeFont } from '../styles/font-normilize'
import { mainStyles } from '../../styles'

import Constants from '../../constants'

export default class SimpleQuestionRenderer extends BaseRenderer {
    get className() { return 'SimpleQuestionRenderer'}

    state = {
        value: null
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextState.value != this.state.value) return true
        if (this.props.surveyItem.id !== nextProps.surveyItem.id) return true
        return false
    }

    renderable = {
        1: this.renderOpenEndedMultiQuestion.bind(this),
        2: this.renderOpenEndedQuestion.bind(this),
        3: this.renderSingleQuestion.bind(this),
        4: this.renderMultipleQuestion.bind(this),
        5: this.renderDropdown.bind(this),
        9: this.renderRating.bind(this)
    }

    questionAnswers = []

    get hasTemplate() {
        return typeof this.renderable[this.surveyItem.questionType] !== "undefined"
    }

    get questionTitle() {
        return this.replaceBRwithNewLine(this.surveyItem.name).replace(/<[^>]*>?/gm, '');
    }

    get disabled() {
      let { value } = this.state
      return Constants.isDebug || !this.hasTemplate ? false : !value
    }

    replaceBRwithNewLine(text) {
        return text.replace(/<br\s*[\/]?>/gm, "\n");
    }

    handleChangeOption(val) {
        if (val !== 0) {
          this.setState({value: val});
        }
      }

      setAlternative(item, params) {
        if (item.length) {
            return item.map((it)=> {
                return {
                    id: it.id,
                    value: it.value,
                    valueText: it.valueText,
                      ...params
                }
            })
        } else {
            return {
                id: item.id,
                ...params
            }
        }
      }

      handleCheckbox(item) {
          // in this case item can be Object or Array, based on question type
          // TODO: make class Answer amd extend it
        this.setState({
            value: Array.isArray(item) ? item.length : item
        })
        item.value = 1
        this.surveyItem.alternative = this.setAlternative(item)
      }

      handleChangeText(item) {
        this.setState({
            value: Array.isArray(item) ? item.length : item
        })
        item.valueText = item.value
        this.surveyItem.alternative = this.setAlternative(item, {valueText: item.value})
      }

      handleChangeTextMulti(item) {
        this.setState({
            value: Array.isArray(item) ? item.length : item
        })
        this.surveyItem.alternative = this.setAlternative(item)
      }

      handleNextQuestion() {
          this.state.webviewRef.current.scrollTo({x:0, y:0, animated: true});
          this.setState({
              value: null
          }, this.finish.bind(this))
      }

      handleScroll(y) {
        this.state.webviewRef.current.scrollTo({x: 0, y, animated: true});
      }

      renderSingleQuestion() {
        return <Form style={styles.form}>
                <Checkbox 
                  onSelected={(option) => this.handleCheckbox(option)}
                  items={this.surveyItem.alternatives}
                  labelStyle={[mainStyles.surveyLabel, { color: '#fff' }]}/>
              </Form>
      }

      renderMultipleQuestion() {
        return <Form style={styles.form}>
                  <RadioBox
                    onSelected={(option) => this.handleCheckbox(option)}
                    onChange={(text) => this.handleChangeText(text)}
                    items={this.surveyItem.alternatives}
                    labelStyle={[mainStyles.surveyLabel, { color: '#fff' }]} />
              </Form>
      }

      renderOpenEndedQuestion() {
          let { alternatives } = this.surveyItem;
        return <Form style={styles.form}>
                  {alternatives.map((alternative) => {
                      return <OpenEnded
                              label="Type your answer here"
                              onChange={(text) => this.handleChangeText(text)}
                              multiline
                              item={alternative}
                              key={alternative.id}
                          />
                  })}
              </Form>
      }

      renderDropdown() {
        return <Form style={styles.form}>
                  <Select 
                    onSelected={(option) => this.handleCheckbox(option)}
                    items={this.surveyItem.alternatives}
                    labelStyle={mainStyles.surveyLabel}
                  />
              </Form>
        }

        renderRating() {
            return <Form style={styles.form}>
                    <Rating 
                        items={this.surveyItem.alternatives}
                        onSelected={(option) => this.handleCheckbox(option)}
                        scroll={this.handleScroll.bind(this)}
                    />
                </Form>
        }
        renderOpenEndedMultiQuestion() {
            return <Form>
                      <OpenEndedFormQuestion
                        alternatives={this.surveyItem.alternatives}
                        handleChange={(item) => this.handleChangeTextMulti(item)}
                      />
                    </Form>
        }

        setValue(val) {
            this.surveyItem.alternative = {
                id: null,
                value: null
            }
            this.setState({
                value: val
            })
        }
        renderNoTemplate() {
            return <NoItems />
        }

        

    renderTemplate(question) {
        return this.hasTemplate
                ? this.renderable[question.questionType]
                : this.renderNoTemplate.bind(this)
    }

    handleRef = ref => {
      this.setState({
        webviewRef: ref
      });
    };

    render() {

        const {t} = this.props;
        let { value } = this.state
        let { heading } = this.surveyItem.params

        return <View style={[styles.container, styles.primaryBackground]}>
                  <View style={styles.header}>
                      <Text style={styles.headerText}>{heading}</Text>
                  </View>
                  <StyledContent title={this.questionTitle} handleRef={this.handleRef}>
                      {this.renderTemplate(this.surveyItem)()}
                  </StyledContent>
                  <View style={styles.footerContainer}>
                      <StyledButton
                          title={t('next_btn')}
                          onPress={() => this.handleNextQuestion()}
                          disabled={this.disabled}
                      />
                  </View>
              </View>
    }
}


const styles1 = ({btn, btnDisabled, btnText, $lightColor}) => ({
    btn,
    btnDisabled,
    btnText,
    wrapper: {
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    content: {
        width: '100%',
        '@media': [
            
            {
                orientation: 'landscape',
                minWidth: 320,
                maxWidth: 851,
                styles: {
                    maxWidth: 360
                }
            },
            { // Tablet
                orientation: 'portrait',
                minWidth: 600,
                styles: {
                    maxWidth: 440
                }
            },
            { // Tablet
                orientation: 'landscape',
                minWidth: 960,
                styles: {
                    maxWidth: 440
                }
            },
        ]
    },
    questionName: {
        // paddingHorizontal: 20,
        marginVertical: 32,
        fontFamily: 'ProximaBold',
        fontSize: normalizeFont(24),
        color: '#fff',
        '@media': [
            
            {
                orientation: 'landscape',
                minWidth: 320,
                maxWidth: 851,
                styles: {
                    marginVertical: 12
                }
            }
        ]
    },
    nextButton: {
        alignSelf: 'center',
        width: '100%',
        '@media': [
            
            {
                orientation: 'landscape',
                minWidth: 320,
                maxWidth: 851,
                styles: {
                    maxWidth: 360
                }
            },
            { // Tablet
                orientation: 'portrait',
                minWidth: 600,
                styles: {
                    maxWidth: 440
                }
            },
            { // Tablet
                orientation: 'landscape',
                minWidth: 960,
                styles: {
                    maxWidth: 440
                }
            },
        ]
    },
    nextButtonDisabled: {
        backgroundColor: '#fff',
        opacity: .5
    },
})

const Content = ({ children, styles, title, handleRef }) => {
  const childRef = React.useRef(null);
  React.useEffect(() => {
    handleRef(childRef);
  }, []);

  return (
    <View style={{flex: 1}}>
      <View style={styles.wrapper}>
        <Text style={styles.questionName}>{title}</Text>
      </View>
      <ScrollView ref={childRef}>
        <View style={styles.wrapper}>
          <View style={styles.content}>
              {children}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};


class SurButton extends Component {
    render() {
        let { title, onPress, disabled, styles } = this.props
        return <SurveyButton
                    title={title}
                    onPress={onPress}
                    buttonStyle={[ styles.nextButton, disabled && styles.nextButtonDisabled]}
                    disabled={disabled}
                />
    }
}

const StyledButton = withStyles(styles1)(SurButton)

const StyledContent = withStyles(styles1)(Content)


const styles = EStyleSheet.create({
    primaryBackground: {
      backgroundColor: '$primaryColor'
    },
    container: {
        flex: 1
    },
    header: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        alignSelf: 'center',
        fontFamily: 'ProximaSbold',
        fontSize: normalizeFont(16),
        color: '#fff'
    },
    footerContainer: {
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        marginVertical: 30
    }
})