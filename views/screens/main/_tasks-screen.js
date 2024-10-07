import React from 'react'
import {
    View,
    TouchableOpacity,
    ToastAndroid,
} from 'react-native'
import { Text, Button, Icon } from 'native-base'
import EStyleSheet, { value } from 'react-native-extended-stylesheet'
import isEqual from 'fast-deep-equal'
import RNRestart from 'react-native-restart'

import Layout from '../../layout/UxReality'
import Navigation from '../../layout/Navigation'
import { BaseComponent } from '@components/BaseComponent'
import { ButtonArrow } from '@components/Form/ButtonArrow'
import { mainStyles, normalizeFont} from '../../../styles'

import AppInfo from '../../../package.json'
import {Storages} from '../../../storage/data-storage-helper'
import NavService from '../../../utils/navigation-service'
import StyleService from '../../../utils/style-service'

export default class TasksScreen extends BaseComponent {
    constructor(props) {
        super(props)
        super.init(styles, landscapeStyles)
        // preserve the initial state in a new object
        this.baseState = {} 
        this.versionCount = 0
    }

    countVersionPress() {
        let {isDebug} = this.state
        let versionCount = this.versionCount
            if(isDebug) return
            if (versionCount === 10)
            Storages.SettingsStorage.getSettings()
                    .then(settings => {
                        settings.isDebug = true
                        return Storages.SettingsStorage.update(settings)
                    })
                    .then(() => {
                        ToastAndroid.show('You are in debug mode now', ToastAndroid.SHORT)
                        RNRestart.Restart()
                    })
            else
                this.versionCount += 1
    }

    canSave() {
        return !(!isEqual(this.baseState, this.state) && !!Object.keys(this.baseState).length || false)
    }

    renderNav() {
        return <Navigation
            bgColor={this.getStyle().screenColor}
            back={false}
            left={
                <Button
                    transparent
                    onPress={() => NavService.back()}
                    >
                    <Icon name='arrow-back' />
                </Button>
            }
            heading={this.props.navigation.getParam('header', 'Settings')}
            />
    }

    renderFooter = () => {
        return(
            <View style={{ alignItems: 'center' }}>
                {this.renderVersion()}
            </View>
        )
    }

    renderVersion() {
        return (<View style={this.getStyle().versionView}>
            <TouchableOpacity onPress={() => this.countVersionPress()}>
                <Text style={{ fontSize: 12 }}>App Version {AppInfo.version}-beta</Text>
            </TouchableOpacity>
        </View>)
    }

    render() {
        return <Layout 
            bgColor={this.getStyle().screenColor}
            navigation={this.renderNav()}
            footer={this.renderFooter()}
            style={{ textAlign: 'center' }}
            stickyFooter>
                <View style={[this.getStyle().category, this.getStyle().topCategory]}>
                    <Text style={this.getStyle().categoryTitle}>TESTING TASKS</Text>
                    <ButtonArrow
                        title='Application'
                        onPress={() => NavService.navigate('Application', { header: 'Testing Tasks' })}
                        styleContainer={this.getStyle().categoryItem}
                    />
                    <ButtonArrow
                        title='Website'
                        onPress={() => NavService.navigate('Website', { header: 'Testing Tasks' })}
                        styleContainer={this.getStyle().categoryItem}
                    />
                    <ButtonArrow
                        title='Prototype'
                        onPress={() => NavService.navigate('Prototype', { header: 'Testing Tasks' })}
                        styleContainer={this.getStyle().categoryItem}
                    />
                </View>
        </Layout>
    }
}

const styles = EStyleSheet.create({
    // $outline: 1,
    screenColor: '#31A5C5',
    switch: {
        width: '100%',
    },
    row: {
        flexDirection: 'row'
    },
    category: {
        marginTop: StyleService.moderateScale(20),
        marginBottom: 40
    },
    categoryBlock: {
        width: '100%'
    },
    categoryTitle: {
        fontSize: normalizeFont(16),
        fontFamily: 'ProximaBold',
        height: 32
    },
    btn: {
        height: 52,
        borderRadius: 8,
        justifyContent: "center",
        shadowOpacity: 0,
        shadowRadius: 0,
        shadowOffset: { height: 0, width: 0 },
        elevation:0
    },
    btnText: {
        fontSize: normalizeFont(20)
    },
    versionView: {
        top: 15,
        marginVertical: 10,
        alignSelf: 'center'
    },
})

const landscapeStyles = EStyleSheet.create({
    // '@media (min-width: 767)': {
        topCategory: {
            marginBottom: 45
        },
        category: {
            marginBottom: 5,
            flexWrap: 'wrap',
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
        },
        categoryItem: {
            width: '48%',
        },
    // }
})