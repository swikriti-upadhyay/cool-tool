import React, { Component} from 'react'

import NavigationService from '../../../utils/navigation-service'
import { Storages } from '../../../storage/data-storage-helper'
import { auth } from '../../../services/AuthService'
import withStore from '../../../store/withStore'

const withSubscription = (WrappedComponent, selectData) => {
    return withStore(class extends Component {
        constructor(props) {
            super(props)
            this.state = {
                data: selectData
            }
        }

        updateSubscription(item) {
            auth.updateSubscription()
            this.props.onSave(item)
        }

         handleSave(item) {
             if (item.value > 15 && !this.props.subscriptionStore.isPaid) {
                 return NavigationService.navigate('Subscription', {
                     success: this.updateSubscription.bind(this, item)
                 })
             }
             this.props.onSave(item)
         }
      
          render() {
            // ... and renders the wrapped component with the fresh data!
            // Notice that we pass through any additional props
            return <WrappedComponent data={this.state.data} {...this.props} onSave={(item) => this.handleSave(item)} />;
          }
    })
}

export { withSubscription }