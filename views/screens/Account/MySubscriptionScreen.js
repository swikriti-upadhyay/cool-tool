import React, { Component } from 'react'
import { View, Alert } from 'react-native'
import {observer} from 'mobx-react'
import { Text, Button, Toast } from 'native-base'
import EStyleSheet from 'react-native-extended-stylesheet'
import { distanceInWordsStrict, differenceInDays } from 'date-fns'

import { ButtonArrow } from '@components/Form/ButtonArrow'
import { MainLayout } from '../../layout/MainLayout'
import NavService from '../../../utils/navigation-service'
import withStore from '../../../store/withStore'
import {auth} from '../../../services/AuthService'

const Subscriptions = [
    {
        name: 'Starter',
        details: `
1. 15 seconds recordings
2. Individual session replay
3. Webcam eye tracking
4. Facial coding
5. Voice Recording
6. UXReality branding`
    },
    {
        name: 'Expert',
        details: `
1. Unlimited projects
2. Up to 3 minutes recordings
3. 30 recordings per month
4. $5 for each extra recording
5. Individual session replay
6. Webcam eye tracking
7. Facial coding
8. Voice recording & surveys
9. Downloadable recordings
10. UXReality branding
11. 24/7 Support`
    },
    {
        name: 'Pro',
        details: `
1. Unlimited projects
2. Up to 3 minutes recordings
3. 100 recordings per month
4. $4 for each extra recording
5. Individual session replay
6. Webcam eye tracking
7. Facial Coding
8. Voice recording & surveys
9. Downloadable recordings
10. Custom branding
11. Advanced analytics
12. Priority support`
    },
]

@observer
class MySubscriptionScreen extends Component {

    async cancel() {
        auth.cancelSubscription()
    }

    get daysLeft() {
        if (this.dayDiff <= 0) return "Last day"
        let left = distanceInWordsStrict(
            new Date(),
            new Date(this.props.subscriptionStore.subscription.expiration),
            {unit: "d", partialMethod: "floor"}
        )
        return `${left} left`
    }

    get dayDiff() {
        return differenceInDays(
            new Date(this.props.subscriptionStore.subscription.expiration),
            new Date()
        )
    }

    get packageName() {
        return this.props.subscriptionStore.subscription.name.toUpperCase()
    }

    get isFree() {
        return !this.props.subscriptionStore.subscription?.paid
    }

    get isCancelable() {
        return !this.props.subscriptionStore.subscription.downgradeRequested && this.props.subscriptionStore.subscription?.paid
    }

    get isCanceled() {
        return this.props.subscriptionStore.subscription?.downgradeRequested && this.props.subscriptionStore.subscription?.paid
    }

    showSnack() {
        Toast.show({
            text: `Subscription was successfully canceled`,
            buttonText: "OK",
            duration: 3000,
            style:{ backgroundColor: "#ffffff" },
            textStyle: { color: "#979797"},
            buttonTextStyle: { color: "#95BC3E"}
        })
    }

    confirmCancellation() {
        Alert.alert(
            'Cancel Subscription',
            'Are you sure that you want to unsubscribe?\nYou can continue to use the app until the end of the month',
            [
                {
                    text: 'No',
                    style: 'cancel'
                },
                {
                    text: 'Yes',
                    onPress: () => this.cancel()
                }
            ]
        )
    }

    renderPackageDetails() {
        let currentPackage = this.props.subscriptionStore.subscription
        let packageCollectedResponses = currentPackage.responseCollected
        if (!this.isFree)
            return <Text>
                    <Text style={styles.bold}>{packageCollectedResponses}</Text> from {currentPackage.maxResponseNumber} recording / 
                    <Text style={styles.bold}> {this.daysLeft}</Text>
                </Text>
        else
            return <Text>
                <Text style={styles.bold}>∞</Text> recordings (15 sec)
            </Text>
    }

    renderText() {
        let currentText = Subscriptions.find(subscription => subscription.name === this.props.subscriptionStore.subscription.name)
        if (!currentText) {
            return "Custom Enterprise Subscription"
        }
        return currentText.details
    }

    renderPackageInfo() {
        let {subscription} = this.props.subscriptionStore
        if (subscription) {
            let status = this.isCanceled ? '(canceled)' : ''
            let title = `${this.packageName} ${status}`
            return <View>
                <Text style={styles.categoryTitle}>MY SUBSCRIPTION</Text>
                <ButtonArrow
                    showIcon={false}
                    title={title}
                    styleTitle={{ fontWeight: 'bold' }}
                    styleContainer={{ marginBottom: 15 }}
                >
                    <Text style={{ fontSize: 12, position: 'absolute', left: 0, top: 20 }}>
                        {this.renderPackageDetails()}
                    </Text>
                </ButtonArrow>
                <Text style={[styles.text, styles.bold]}>What you get with this package:</Text>
                <View style={styles.packageInfo}>
                    <Text style={styles.text}>{this.renderText()}</Text>
                </View>
            </View>
        }
    }

    renderFooter() {
        return <View>
            {/* {this.isCancelable && <Button style={[styles.btn, {marginBottom: 16}]} bordered light full onPress={() => {this.confirmCancellation()}}>
                <Text style={[styles.btnText, {color: '#fff'}]} returnKeyType='send'>Cancel Subscription</Text>
            </Button>} */}
            <Button style={[styles.btn]} light full onPress={() => NavService.navigate('Payment')}>
                <Text style={[styles.btnText, {color: '#31A5C5'}]} returnKeyType='send'>Change Subscription</Text>
            </Button>
        </View>
    }

    render() {
        return <MainLayout
            screenColor="#31A5C5"
            nav={
                {
                    heading: "Subscription",
                    right: ""
                }
            }
            footer={this.renderFooter()}>
            {this.renderPackageInfo()}
        </MainLayout>
    }
}

export default withStore(MySubscriptionScreen)


const styles = EStyleSheet.create({
    avatar: {
        marginBottom: 10
    },
    btn: {
        height: 52,
        width: '100%',
        borderRadius: 8,
        justifyContent: "center",
        shadowOpacity: 0,
        shadowRadius: 0,
        shadowOffset: { height: 0, width: 0 },
        elevation:0
      },
      btnText: {
        fontSize: 20 // TODO: import utils normalizeFont
    },
    categoryTitle: {
        fontSize: 16,
        fontFamily: 'ProximaBold',
        height: 32
    },
    name: {
        fontSize: 24,
        fontFamily: 'ProximaRegular',
        color: '#ffffff'
    },
    bold: {
        fontWeight: 'bold',
        fontFamily: 'ProximaBold',
    },
    text: {
        fontSize: 16,
        fontFamily: 'ProximaRegular',
        color: '#ffffff'
    },
    packageInfo: {
        marginTop: 5
    },
    email: {
        fontSize: 14,
        fontFamily: 'ProximaRegular',
        color: '#DADADA'
    },
    avatar: {
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20
    },
  })