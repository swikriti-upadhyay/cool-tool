import React, { Component} from 'react'
import { View } from 'react-native'

import NavigationService from '../../utils/navigation-service'
import { Storages } from '../../storage/data-storage-helper'
import {auth} from '../../services/AuthService'

import RecordingsLimitPopup from '@components/common/RecordingsLimitPopup'

const withSubscription = (WrappedComponent, selectData) => {
    return class extends Component {
        constructor(props) {
            super(props)
            this.state = {
                visible: false,
                data: selectData,
                isPaid: false
            }
            this.isOverLimit = false
        }

        componentDidMount() {
            auth.updateSubscription()
            .then(subscription => {
                if (subscription) {
                    let isOverLimit = subscription.responseLeft <= 0 && subscription.paid
                    this.setState({
                        isOverLimit
                    })
                }
            })
        }

        updateSubs() {
            auth.updateSubscription()
            return new Promise((res, rej) => {
                Storages.SubscriptionStorage.getSubscription()
                .then(subscription => {
                    let isOverLimit = false
                    if (subscription) {
                        isOverLimit = subscription.responseLeft <= 0 && subscription.paid
                    }
                    res(isOverLimit)
                })
                .catch(e => rej(e))
            })
        }

         handlePress() {
             this.updateSubs().then((isOverLimit) => {
                  if (isOverLimit) {
                    this.setState({visible: true})
                    return
                  }
                this.props.onPress()
             })
         }

         handleAllow() {
            this.handleHide()
            this.props.onPress()
         }

         handleHide() {
            this.setState({
                visible: false
            })
         }
      
          render() {
            // ... and renders the wrapped component with the fresh data!
            // Notice that we pass through any additional props
            const { visible } = this.state
            return (
                <View>
                    <WrappedComponent data={this.state.data} {...this.props} onPress={() => this.handlePress()} />
                    <RecordingsLimitPopup visible={visible} onAllow={() => this.handleAllow()} onHide={() => this.handleHide()} />
                </View>
            );
          }
    }
}

export { withSubscription }