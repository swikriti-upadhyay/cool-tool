import React, {Component} from 'react'
import {Animated, View, Image} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import { withTranslation } from 'react-i18next';
import Text from '../components/text-component'
// import phrases from '@assets/phrases'

class PhrasesRenderer extends Component {
    constructor(props) {
        super(props)
        let getPhrase = () => {
            const randPrase = Math.floor(Math.random() * (42 - 0) + 0) // 42 - array size
            return props.t(`phrases:text.${randPrase}`)
        }
        let aValue = new Animated.Value(1)
        this.state = {
            phrase: getPhrase(),
            opacity: aValue
        }
        aValue.addListener(({value}) => {
            if (value === 0) {
                this.setState({ phrase: getPhrase() })
            }
        })
    }

    componentDidMount() {
        Animated.loop(
            Animated.sequence([
                Animated.timing(this.state.opacity, {
                    toValue: 1,
                    duration: 1500,
                    delay: 1500
                }),
                Animated.timing(this.state.opacity, {
                    toValue: 0,
                    duration: 1500,
                    delay: 8000
                })
            ]), {
                iterations: -1
            }
        ).start()
    }

    render() {
        const { style, phrasesContainer } = this.props
        const { opacity, phrase } = this.state
        const brain = require('@assets/images/brain.png')

        return(
            <View style={styles.phrasesWrap}>
                <Animated.View style={[{opacity}, styles.phrases, {borderWidth:1, borderColor: '#FFF', borderRadius: 20}, phrasesContainer]}>
                    <Text style={[{fontSize: 14, textAlign: 'left'}, style.text]}>{phrase}</Text>
                    <Image source={brain} style={[style.image, styles.brain]}/>
                </Animated.View>
            </View>
        )
    }
}

export default withTranslation()(PhrasesRenderer)

const styles = EStyleSheet.create({
    phrasesWrap: {
        // height:165,
        // '@media (min-width: 959) and (orientation: landscape)': {
        //     height: 150
        // }
    },
    phrases: {
        borderWidth: 1,
        borderColor: '#FFF',
        borderRadius: 20,
        // paddingTop: 20,
        paddingBottom: 45,
        // paddingLeft: 17,
        // paddingRight: 17,
        marginTop: 15,
        // '@media (min-width: 600) and (orientation: landscape)': {
            paddingVertical: 10,
            paddingHorizontal: 10
        // }
    },
    brain: {
        bottom: -17,
        resizeMode: 'contain',
        alignSelf: 'center',
        justifyContent: 'center'
    }
})