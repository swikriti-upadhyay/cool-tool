import React from 'react'
import { mainStyles } from '../../styles'
import {
    View
} from 'react-native'
import Text from '../components/text-component'
import { observer } from 'mobx-react'
import SecondaryButton from '../components/secondary-btn-component'
import BaseRenderer from './base-renderer'
import NavigationService from '../../utils/navigation-service'
import Loader from '../common/loader-view';

@observer
export default class SkipRenderer extends BaseRenderer {
    get className() { return 'SkipRenderer' }

    home() {
        this.finish()
            .then(() => NavigationService.resetAction('Enter'))
    }

    render() {
        let textStyle = this.props.surveyItem.isError ? { color: 'red' } : {}
        if (this.surveyItem.skipInProgress)
            return <Loader/>
        return <View style={mainStyles.container}>
            <Text style={textStyle}>{this.props.surveyItem.skipReason}</Text>
            <SecondaryButton
                title={'Home'}
                onPress={() => this.home()}
            />
        </View>
    }
}