import React, {Component} from 'react'
import {
    View, 
    Picker, 
    ScrollView, 
    InteractionManager, 
    Alert, 
    TouchableOpacity, 
    Text,
    Modal,
    TouchableHighlight,
} from 'react-native'
import {Storages} from '../storage/data-storage-helper'
import {Table, Row} from 'react-native-table-component'
import Loader from './common/loader-view'
import PrimaryButton from './components/primary-btn-component'
import EStyleSheet from 'react-native-extended-stylesheet'
import {mainStyles} from '../styles'
import format from 'date-fns/format'
import { showMessage } from 'react-native-flash-message'
import { CopyWrapper } from './common/CopyWrapper'

export default class DataStorage extends Component {
    state = {
        isReady: false,
        modalVisible: false,
        modalContent: null
    }

    storages = Object.values(Storages)

    clearAll() {
        let deletionFn = () => {
            this.setState({isReady: false}, async () => {
                try {
                await Storages.RespondentStorage.deleteAll()
                await Storages.DataEntryStorage.deleteAll()
                await Storages.ProjectsStorage.deleteAll()
                await Storages.UserStorage.deleteAll()
                this.setStorage(Storages.DataEntryStorage)
                } catch(e) {
                    showMessage({
                        message: 'Error',
                        description: e.message,
                        type: 'danger',
                        duration: 10000,
                        icon: 'auto'
                    })
                }
                this.setState({isReady: true})
            })
        }
        Alert.alert(
            'Deletion confirmation',
            'This will delete all data in database. Are you sure?',
            [
                {text: 'Cancel'},
                {text: 'I`m sure!', onPress: deletionFn}
            ]
        )
    }

    componentDidMount() {
        this.setStorage(this.storages[0])
    }

    setStorage(storage) {
        this.setState({selectedStorage: storage, isReady: false}, () => this.setSchemaToDataGrid())
    }

    setSchemaToDataGrid() {
        InteractionManager.runAfterInteractions(() => {
            return this.getDataModel()
                .then(() => {
                    return this.getData()
                })
                .then(() => {
                    this.setState({isReady: true})
                })
        })
    }

    getDataModel() {
        const {selectedStorage} = this.state
        const model = {
            name: selectedStorage.schema.collectionName,
            fields: Object.keys(selectedStorage.schema.properties)
        }
        this.setState({dataModel: model.fields, data: []})
        return Promise.resolve()
    }

    __getPixelsFromStringLength(stringLength) {
        return (stringLength * fontSize) * .15
    }

    getData() {
        const {selectedStorage, dataModel} = this.state
        selectedStorage.getAll({filter: { $or: [{deleted: true}, {deleted: {$ne: true}}]}, sort: {createdAt: -1} })
            .then(data => {
                let widths = dataModel.map(f => this.__getPixelsFromStringLength(f.length))
                let allPreparedData = []

                if (data)
                    allPreparedData = data.map(d => {
                        let preparedData = []
                        for (let i = 0; i < dataModel.length; i++) {
                            let field = dataModel[i],
                                value = d[field],
                                stringifiedValue = ((value === null || value === undefined) ? '' : value).toString()

                            if (value instanceof Date) {
                                stringifiedValue = format(value, 'MMM Do YYYY, h:mm:ss a')
                            }
                            
                            let stringifiedValueLength = stringifiedValue.length > 0 ? stringifiedValue.length : 0
                                noWrap = false
                            if (!value
                                || value instanceof Date
                                || value.constructor === Boolean) {
                                value = stringifiedValue
                                noWrap = true
                            }

                            if (!noWrap && value.constructor === String && value.length > 20) {
                                value = this.textWrapper(value)
                                stringifiedValueLength = 12
                            }

                            let pixelsWidth = this.__getPixelsFromStringLength(stringifiedValueLength)

                            if (widths[i] < pixelsWidth)
                                widths[i] = pixelsWidth
                            
                            if (value.length < 20) {
                                value = <CopyWrapper text={value} />
                            }
                            preparedData.push(value)
                        }
                        return preparedData
                    })

                return this.setState({data: allPreparedData, widthArr: widths.map(w => w * 5)})
            })
        return Promise.resolve()
    }

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }

    showFull(data) {
        this.setState({modalContent: data}, () => {
            this.setModalVisible(true)
        })
    }

    textWrapper(data) {
        let __data = data.substring(0, 10) + '...'
        return <TouchableOpacity onPress={() => this.showFull(data)}>
            <Text style={styles.text}>{__data}</Text>
        </TouchableOpacity>
    }

    render() {
        const { isReady, dataModel, data, widthArr, selectedStorage, modalContent, modalVisible} = this.state
        if (isReady) {
            return (<View style={mainStyles.container}>
                <View style={{flex: 0, flexDirection: 'row'}}>
                    <Picker
                        selectedValue={selectedStorage.schema.collectionName}
                        style={{height: 50, width: 150}}
                        onValueChange={itemValue => {
                            let storage = this.storages.filter(s => s.schema.collectionName === itemValue)[0]
                            this.setStorage(storage)
                        }}
                    >
                        {this.storages.map(s => {
                            return <Picker.Item label={s.schema.collectionName} value={s.schema.collectionName} key={s.schema.collectionName}/>
                        })}
                    </Picker>
                    <PrimaryButton 
                        title="Delete All Data"
                        onPress={() => this.clearAll()}
                        />
                </View>
                <ScrollView horizontal={true}>
                    <View>
                        <Table borderStyle={{borderColor: '#C1C0B9'}}>
                            <Row data={dataModel} widthArr={widthArr} style={styles.header} textStyle={styles.text}/>
                        </Table>
                        <ScrollView style={styles.dataWrapper}>
                            <Table borderStyle={{borderColor: '#C1C0B9'}}>
                                {
                                    data.map((rowData, index) => (
                                        <Row
                                            key={index}
                                            data={rowData}
                                            widthArr={widthArr}
                                            style={[styles.row, index % 2 && {backgroundColor: '#F7F6E7'}]}
                                            textStyle={styles.text}
                                        />
                                    ))
                                }
                            </Table>
                        </ScrollView>
                    </View>
                </ScrollView>
                
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}>
                    <View style={{justifyContent: 'space-around', flex: 1}}>
                        <View style={styles.modalContent}>
                                <ScrollView>
                                    <CopyWrapper text={modalContent} />
                                </ScrollView>
                                <TouchableHighlight
                                    onPress={() => {
                                        this.setModalVisible(!modalVisible);
                                    }}>
                                    <Text>Close</Text>
                                </TouchableHighlight>
                        </View>
                    </View>
                </Modal>
            </View>)
        }
        return <Loader/>
    }
}

const fontSize = 12

const styles = EStyleSheet.create({
    container: {flex: 1, padding: 16, paddingTop: 30},
    header: {
        backgroundColor: '$primaryColor'
    },
    text: {textAlign: 'center', fontWeight: '100', fontSize: fontSize, marginVertical: 5},
    dataWrapper: {marginTop: -1},
    row: {
        backgroundColor: '$secondaryColor'
    },
    modalContent: {
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'white', 
        alignSelf: 'center', 
        width: '80%', 
        padding: 10,
        borderWidth: 1,
        borderColor: 'gray' 
    }
})