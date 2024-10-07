import React, {Component} from 'react'
import {ScrollView, View} from 'react-native'
import Logger from '../utils/logger'
import Text from './components/text-component'
import EStyleSheet from 'react-native-extended-stylesheet'
import SecondaryButton from './components/secondary-btn-component'

export default class LogsView extends Component {
    state = {
        isReady: false,
        syncing: false
    }

    async sync() {
        this.setState({
            syncing: true
        })
        await Logger.syncToServer()
        this.setState({
            syncing: false
        })
    }

    render() {
        return <ScrollView>
            {Logger.logStorage.length && <View style={styles.buttonWrap}>
                <SecondaryButton
                    title="Sync Logs"
                    onPress={() => this.sync()}
                    disabled={this.state.syncing}
                    loading={this.state.syncing}/>
            </View>}
            {Logger.logStorage.map((item, index) => {
                return <Text key={index}>
                    {item}
                </Text>
            })}
            
        </ScrollView>
    }
}

const styles = EStyleSheet.create({
    buttonWrap: {
        flex: 1,
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center',
        marginVertical: 10
    }
})