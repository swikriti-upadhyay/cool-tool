import React, {Component} from 'react'
import {View, Text, Image, ScrollView, TextInput, TouchableOpacity} from 'react-native'
import Icon from 'react-native-vector-icons/EvilIcons'
import IconMatherial from 'react-native-vector-icons/MaterialIcons'
import EStyleSheet from 'react-native-extended-stylesheet'
import {mainStyles} from '../styles'
import PrimaryButton from './components/primary-btn-component'
import Navigation from '../utils/navigation-service'

const StartScreen = (props)=> {
    return (<React.Fragment>
        <View style={[styles.half, {backgroundColor: EStyleSheet.value('$lightColor'), justifyContent: 'center', alignItems: 'center'}]}>
            <IconMatherial name={'thumb-up'}
                    size={50}
                    color={EStyleSheet.value('$primaryBlueColor')}
            />
            <Text style={styles.title}>How likely would you {"\n"} recommend UXReality?</Text>
            </View>
            <View style={[styles.half, {backgroundColor: '#F3F8F8', paddingTop: 20}]}>
            {/* <AirbnbRating 
                size={40}
                showRating={false}
                onFinishRating={(val)=>props.onFinish('usability' ,val)}
                /> */}
            <Text style={[styles.smallTitle, {alignSelf: 'center', paddingVertical: 20}]}>Tap the stars</Text>
            <View style={styles.footer}>
                <PrimaryButton title={'Next'}
                    onPress={()=>props.nextScreen()}
                    buttonStyle={styles.userButton}  
                    />
            </View>
            </View>
    </React.Fragment>)
}

const badExpirience = ()=> {
    return (
        <View><Text>asd</Text></View>
    )
}

export default class FeedbackView extends Component {
    state = {
        quality: null,
        design: null,
        changed: false,
        usability: null
    }
    handleFinish(type, val) {
        this.setState({
            [type]: val
        }, this.handleChange)
    }
    handleChange() {
        this.setState({
            changed: true
        })
    }
    handleBack() {
       this. props.navigation.goBack()
    }
    render() {
        let {changed} = this.state
        let imgSource = require('@assets/images/owl_logo.png')
        return <View style={[mainStyles.container, styles.container]}>
            <TouchableOpacity
                style={styles.closeBtn}
                onPress={()=>this.handleBack()}>
                <Icon name={'close'}
                    size={36}
                    color={'#D6D6D6'}
                />
            </TouchableOpacity>
             <StartScreen 
                onFinish={(type, val)=>{this.handleFinish(type, val)}}
                onNextScreen={()=>this.handleNextScrenn}/>
        </View>
    }
}

const styles = EStyleSheet.create({
    half: {
        height: '50%',
        width: '100%'
    },
    container: {
        flex: 1,
        alignItems: 'center',
    },
    footer: {
        justifyContent: 'flex-end',
        flex: 1,
    },
    title: {
        fontSize: 24,
        color: '#A3A3A3',
        paddingVertical: 5
    },
    smallTitle: {
        fontSize: 20,
        color: '#A1A2A2'
    },
    userButton: {
        width: '100%',
        borderRadius: 0
    },
    logo: {
        width: 65,
        resizeMode: 'contain',
        alignSelf: 'center'
    },
    textArea: {
        height: 150,
        justifyContent: "flex-start",
        textAlignVertical: 'top'
    },
    closeBtn: {
        position: 'absolute',
        top: 5,
        left: 15,
        zIndex: 5
    },
})