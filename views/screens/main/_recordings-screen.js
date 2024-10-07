import React, {Component} from 'react'
import {
    View,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    TouchableHighlight,
    Alert
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

import ScreenHelper from '../../../utils/screen-helper'
import DataUploader, {UploadState} from '../../../sync/data-uploader'
import {
    Storages,
    RespondentStatus
} from '../../../storage/data-storage-helper'
import Logger from '../../../utils/logger'
import Loader from '../../common/loader-view'
import format from 'date-fns/format'
import {observer} from 'mobx-react'
import NetInfoService from '../../../utils/connectionInfo'
import UserService from '../../../utils/auth-service'
import StyleService from '../../../utils/style-service'
import {pluralize} from '../../../utils/pluralize'
import { mainStyles, normalizeFont} from '../../../styles'


import Layout from '../../layout/UxReality'
import Navigation from '../../layout/Navigation'
import { Text, Button, Icon } from 'native-base'
import navigationService from '../../../utils/navigation-service'

import withStore from '../../../store/withStore'

const fetchLength = 5

@observer
class RecordingsScreen extends Component {

    state = {
        dataUploader: null,
        responses: [],
        isFetching: false,
        hasMore: true,
        inited: false,
        syncCount: 0,
        netInfoService: NetInfoService.instance,
        userService: UserService.instance,
        editMode: false,
        uploadItems: [],
        heading: 'Recordings'
    }

    skip = 0

    componentDidMount() {
        const dataUploader = DataUploader.getInstance()

        this.getValidateAndCountRecords()
            .then(() => {
                this.setState({
                    dataUploader: dataUploader,
                    uploadItems: dataUploader.respsToSyncKeys,
                    inited: true
                })
            })

        this.insertedHdlr = (entry) => this.inserted(entry)
        this.updatedHdlr = (entry) => this.updated(entry)
        this.clearedHdlr = () => this.cleared()

        Storages.RespondentStorage.addListener('inserted', this.insertedHdlr)

        Storages.RespondentStorage.addListener('updated', this.updatedHdlr)

        Storages.RespondentStorage.addListener('cleared', this.clearedHdlr)

        this.fetchItems()
    }

    componentWillUnmount() {

        Storages.RespondentStorage.removeListener('inserted', this.insertedHdlr)

        Storages.RespondentStorage.removeListener('updated', this.updatedHdlr)     

        Storages.RespondentStorage.removeListener('cleared', this.clearedHdlr)
    }

    closePressed() {
        // if (this.state.editMode)
        //     this.setState({editMode: false})
        // else
        this.setState({editMode: false}, navigationService.navigate('Home'))
    }

    toggleEditMode() {
        this.setState({editMode: !this.state.editMode})
    }

    getStyle(){
        let baseStyles = styles
        if (StyleService.viewMode === 'landscape') {
          return {...baseStyles, ...landscapeStyles};
        } else {
          return baseStyles;
        }
      }

    getValidateAndCountRecords() {
        this.setState({validatingRespondents: true})
        return Storages.RespondentStorage.getAllRespondentsToValidate()
            .then(respToValidate => {
                if (respToValidate.length > 0) {
                    return DataUploader.getInstance().validateData(respToValidate)
                }
                return Promise.resolve()
            })
            .then(() => {
                return Storages.RespondentStorage.getAllRespondentsToSync()
            })
            .catch(e => {
                Logger.error(e)
                return Promise.resolve(0)
            })
            .then(itemsToSync => {
                this.setState({
                    syncCount: itemsToSync.length,
                    validatingRespondents: false
                })
                return Promise.resolve()
            })
    }

    isEntryVisible(entry) {
        return !(entry.deleted || entry.status == RespondentStatus.DISQUALIFIED || entry.status == RespondentStatus.SKIPPED)
    }

    inserted(entry) {
        this.getValidateAndCountRecords()
            .then(() => {
                let responses = this.state.responses
                if (!this.isEntryVisible(entry))
                    return
                responses = [entry].concat(responses)
                this.setState({responses})
            })
    }

    updated(entry) {
        this.getValidateAndCountRecords()
            .then(() => {
                let {responses, editMode} = this.state
                let index = responses.findIndex(x => x._id === entry._id)
                if (index >= 0) {
                    if (!this.isEntryVisible(entry))
                        responses.splice(index, 1)
                    else
                        responses[index] = entry
                    if (responses.length == 0)
                        editMode = false
                    this.setState({responses: responses, editMode: editMode})
                }
            })
    }

    cleared() {
        this.getValidateAndCountRecords()
            .then(() => {
                this.setState({responses: [], editMode: false})
            })
    }

    syncAll() {
        this.state.dataUploader.upload()
    }

    syncItem(item) {
        this.state.dataUploader.upload(item._id)
    }

    cancelItemSync(item) {
        this.state.dataUploader.cancel(item._id)
    }

    cancel() {
        this.state.dataUploader.cancel()
    }

    isSyncing(item) {
        let {uploadItems} = this.state
        return uploadItems.indexOf(item._id) >= 0
    }

    isProcessing(item) {
        return item.resultVideoUrl ? false : true
    }

    isSynced(item) {
        return item.areAnswersUploaded && item.areDataUploaded
    }

    fetchItems() {
        if (!this.state.hasMore)
            return
        this.setState({ isFetching: true }, () => {
            Storages.RespondentStorage.getAllSuccess({
                skip: this.skip, 
                take: fetchLength
            })
                .then((results) => {
                    this.skip += results.length
                    this.setState({
                        responses: this.state.responses.concat(results), 
                        isFetching: false, 
                        hasMore: results.length > 0
                    })
                })
        })
    }

    handleDeleteItem(item) {
        Alert.alert(
            'Deletion confirmation',
            `Do you really want to delete ${item.projectName}?`,
            [
              {
                text: 'Yes',
                    onPress: () => Storages.RespondentStorage.markAsDeleted(item._id)
              },
              {
                text: 'No',
                style: 'cancel',
            },
            ]
        )
    }
    handleDeleteAllItems() {
        Alert.alert(
            'Deletion confirmation',
            'Do you really want to delete all recordings?',
            [
                {
                    text: 'Delete',
                    onPress: () => Storages.RespondentStorage.deleteAll()
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ]
        )
    }

    goToVideo(item) {
        if (this.state.editMode) return
        if ((!this.isSynced(item) || this.isProcessing(item))) {
            this.showPopup()
        } else {
            navigationService.navigate('Video', {
                videoUrl: item.resultVideoUrl
            })
        }
    }

    renderNav() {
        const {responses, editMode, heading} = this.state
        return <Navigation
            bgColor={styles.screenColor}
            back={false}
            left={
                <Button
                    transparent
                    onPress={() => navigationService.navigate('Home')}
                    >
                    <Icon name='arrow-back' />
                </Button>
            }
            heading={heading}
            right={
                responses.length > 0 ? <TouchableOpacity
                    transparent
                    onPress={() => this.toggleEditMode()}
                >
                    <Text style={{ fontSize: normalizeFont(16) }}>{!editMode ? 'Edit' : 'Cancel'}</Text>
                </TouchableOpacity> : null
            }
            headerSticky={true}
            />
    }

    renderSync(item, index) {
        return <TouchableOpacity
            onPress={() => {
                this.syncItem(item)
            }}
            style={[styles.iconContainer, { backgroundColor: '#f8a91e' }]}
        >
            <Icon name={'sync'}
                type="FontAwesome5"
                style={{  fontSize: 18, color: EStyleSheet.value('$lightColor')}}
            />
        </TouchableOpacity>
    }

    renderSyncing(item, cancelable = true) {
        let lightColor = '#95BC3E'
        if (cancelable)
            return <TouchableOpacity
                    onPress={() => {
                        this.cancelItemSync(item)
                    }}
                >
                <View>
                    <ActivityIndicator size={32} color={lightColor} />
                    {/* <Text style={[styles.thinText, { color:lightColor }]}>Cancel</Text> */}
                </View>
            </TouchableOpacity>
        return <ActivityIndicator size={32} color={lightColor} />
    }

    renderReady(item) {
        return <TouchableOpacity
                onPress={() => navigationService.navigate('Video', {
                    videoUrl: item.resultVideoUrl
                })}>
            <View style={[styles.iconContainer, { backgroundColor: '#C4E15E' }]}>
                <Icon name={'play-circle-filled'}
                    type="MaterialIcons"
                    style={{ fontSize: 22, color: EStyleSheet.value('$lightColor'),  }}
                />
            </View>
        </TouchableOpacity>
    }
    
    renderMark(item) {
        return <View style={[styles.iconContainer, { backgroundColor: EStyleSheet.value('$primaryColor') }]}>
            <Icon name={'check'}
                type="MaterialIcons"
                size={24}
                style={{ color: EStyleSheet.value('$lightColor') }}
            />
        </View>
    }

    renderDelete(item) {
        return <TouchableHighlight
                onPress={() => {
                    this.handleDeleteItem(item)
                }}
                style={[styles.iconContainer, { backgroundColor: '#A6A6A6' }]}
                underlayColor='#FF3C3C'
            >
            <Icon name={'close'}
                type="AntDesign"
                style={{ fontSize: 22,color: EStyleSheet.value('$lightColor') }}
            />
        </TouchableHighlight>
    }

    renderItem(item, index) {
        const {responses} = this.state
        const { viewMode, isTablet} = this.props

        let state = 'Not synced',
            buttonRenderer = () => this.renderSync(item, index)
        if (this.isSyncing(item)) {
            state = 'Syncing'
            buttonRenderer = () => this.renderSyncing(item)
        } else if (this.isSynced(item)) {
            if (item.isOwnProject) {
                if (this.isProcessing(item)) {
                    state = 'Processing'
                    buttonRenderer = () => this.renderSyncing(item, false)
                } else {
                    state = 'Ready'
                    buttonRenderer = () => this.renderReady(item)
                    // buttonRenderer = () => this.renderSync(item, true)
                }
            } else {
                state = 'Sent'
                buttonRenderer = () => this.renderMark(item)
            }
        }

        if (this.state.editMode) {
            state = 'Delete'
            buttonRenderer = () => this.renderDelete(item)
        }

        return <TouchableOpacity
            style={[this.getStyle().itemContainer, (isTablet && viewMode == 'landscape') ? {width: '48%'} : {width: '100%'}]}
            onPress={this.goToVideo.bind(this, item)}>
            <View style={styles.itemDetailsContainer}>
                <View style={styles.itemDetailsLeft}>
                    <Text style={styles.itemDate}>{format(item.responseEndDate, 'DD/MM/YYYY   hh:mm')}</Text>
                    <Text style={styles.itemTitle} numberOfLines={1}>{item.projectName}</Text>
                </View>
                <View style={styles.itemDetailsRight}>
                    <Text style={styles.itemState}>{state}</Text>
                </View>
            </View>
            <View style={styles.itemsActionContainer}>
                {buttonRenderer()}
            </View>
        </TouchableOpacity>
    }

    showPopup() {
        Alert.alert('Give us a few minutes... ', "This recording is still being processed.  We'll notify you when it's ready. Meanwhile, check other cool features of UXReality", [
            {
                text: 'OK',
                style: 'cancel',
            },
        ])
    }

    renderFooter() {
        if (!this.state.isFetching)
            return null
        return <Loader color={EStyleSheet.value('$lightColor')}/>
    }

    renderSyncButton() {
        const {netInfoService, dataUploader} = this.state
        if (dataUploader.isRunning)
            return <Button
                disabled={!netInfoService.isConnected}
                style={[styles.syncButton, { borderRadius: 8, alignSelf: 'flex-end'}]}
                onPress={() => this.cancel()} bordered light>
                    <Text style={styles.baseText}>Cancel</Text>
                </Button>
        else if (dataUploader.cancelAll)
            return <Text style={styles.syncTitle}>Canceling...</Text>
        else
            return <Button
                disabled={!netInfoService.isConnected}
                style={[styles.syncButton, { borderRadius: 8, alignSelf: 'flex-end'}]}
                onPress={() => this.syncAll()} bordered light>
                    <Text style={styles.baseText}>Sync now</Text>
                </Button>
    }

    renderSyncBtnContainer() {
        const {syncCount, validatingRespondents, responses} = this.state
        let formWidth = ScreenHelper.getScreenData().window.width
        if (formWidth > 500)
            formWidth = 500
        formWidth = formWidth - 50

        let haveRecordings = pluralize('recording', 'recordings', responses.length, 'No recordings yet')
        let recordingText = `You have ${haveRecordings}`

        if(validatingRespondents)
            recordingText = 'Validating responses...'
        else if (syncCount)
            recordingText = pluralize('recording is not synced yet', 'recordings are not synced yet', syncCount)
        // else if (this.isTrialExpired)
        //     recordingText = 'This is your trial recording. Please, Sign Up to get more free recordings'
        
        if (!validatingRespondents && syncCount > 0)
            return <View style={[styles.row, styles.header ]}>
                <View style={[styles.headerSide, {justifyContent: 'center'}]}>
                    <Text style={styles.syncTitle}>{recordingText}</Text>
                </View>
                <View style={[styles.headerSide, {alignItems: 'center', justifyContent: 'center'}]}>
                    {this.renderSyncButton()}
                </View>
            </View>
        
        return <View style={[styles.header, {width: formWidth}]}>
                <View style={[{justifyContent: 'center'}]}>
                    <Text style={[styles.syncTitle]}>{recordingText}</Text>
                </View>
            </View>
    }

    renderDeleteAll() {
        let { responses } = this.state

        return <View style={[ styles.row, styles.header, {justifyContent: 'space-between'} ]}>
                <View style={[{justifyContent: 'center'}]}>
                    {/* <Text style={styles.syncTitle}>You have pluralize{responses.length} recording(s)</Text> */}
                    <Text style={styles.syncTitle}>You have {pluralize('recording', 'recordings', responses.length)}</Text>
                </View>
                <View style={[{alignItems: 'center', justifyContent: 'center'}]}>
                    <Button
                        style={[styles.syncButton, { borderRadius: 8, alignSelf: 'flex-end'}]}
                        onPress={() => this.handleDeleteAllItems()} bordered light>
                            <Text style={[styles.baseText, { textAlign: 'center' }]}>Delete all</Text>
                    </Button>
                </View>
            </View>
    }

    renderRecords() {

        const {responses, netInfoService, isFetching, uploadItems, editMode} = this.state
        const { isTablet, viewMode } = this.props
        
        if (uploadItems.length > 0) { /*ugly piece of shit to make rerender refresh on change */ }

        let formWidth = ScreenHelper.getScreenData().window.width,
        isTabletLandscape = (isTablet && viewMode == 'landscape')
        if (formWidth > 500)
            formWidth = 500
        formWidth = formWidth - 50

        return <View>
                {!editMode ? this.renderSyncBtnContainer() : this.renderDeleteAll()} 
                {responses.length > 0 &&
                    <FlatList
                        {...(isTabletLandscape ? {columnWrapperStyle: this.getStyle().wrapper} : {})}
                        style={styles.itemList}
                        numColumns={isTabletLandscape ? 2 : 1}
                        horizontal={false}
                        data={responses}
                        onEndReached={() => this.fetchItems()}
                        onEndReachedThreshold={1}
                        refreshing={isFetching}
                        renderItem={({item, index}) => this.renderItem(item, index)}
                        keyExtractor={item => item.loading === true ? 'loading' : item._id.toString()}
                        key={(isTabletLandscape ? 'v' : 'h')}
                        ListFooterComponent={() => this.renderFooter()}
                    />
                }
            </View>
    }

    scrollChangeHeading({contentOffset}) {
        // TODO: optimize this code section. replace with shouldComponentUpdate
        if (contentOffset.y > 50) {
            this.setState({
                heading: `${this.state.responses.length} Recordings `
            })
        } else {
            this.setState({
                heading: `Recordings `
            })
        }
    }

    renderMainFooter() {
        return(
            <View>
                 {this.isTrialExpired && 
                    <Button style={[mainStyles.btn]} light full onPress={() => navigationService.navigate('Register')}>
                        <Text style={[mainStyles.btnText, {color: '#95BC3E'}]}>Sign Up</Text>
                    </Button>}
            </View>
            // replace with navservice
        )
    }

    render() {

        const { inited } = this.state

        if (!inited)
            return <Loader/>

        return <Layout
            bgColor={styles.screenColor}
            navigation={this.renderNav()}
            // footer={this.renderMainFooter()}
            scrollHandler={(nativeEvent)=>this.scrollChangeHeading(nativeEvent)}
            style={{ textAlign: 'center' }}
            styleFooter={[{alignSelf: 'center'},this.props.isMobileLandscape || this.props.isTablet ? {width: 320} : {width: '100%'}]}
            stickyFooter>
                {this.renderRecords()}
        </Layout>
    }
}

export default withStore(RecordingsScreen)

RecordingsScreen.propTypes = {
    // parent: PropTypes.object.isRequired
}

const styles = EStyleSheet.create({
    // $outline: 1,
    screenColor: '#31A5C5',
    row: {
        flexDirection: 'row'
    },
    header: {
        // marginTop: StyleService.moderateScale(16),
        marginBottom: 16,
        justifyContent: 'center',
        height: 52
    },
    headerSide: {
        width: '50%'
    },
    syncButton: {
        width: 124,
        justifyContent: "center"
    },
    syncTitle: {
        fontSize: '$fontSize',
        fontFamily: '$proximaSB',
        color: '$lightColor'
    },
    baseText: {
        fontSize: '$fontSize',
        fontFamily: '$proximaSB',
    },
    thinText: {
        fontSize: 12,
        fontFamily: '$proximaRegular'
    },
    $fullWidth: '100%',
    itemList: {
        // flex: 1,
        width: '$fullWidth',
    },
    itemContainer: {
        width: '100%',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: StyleService.moderateScale(4),
        backgroundColor: '$lightColor',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    itemDetailsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    itemDetailsLeft: {
        width: '70%'
    },
    itemDetailsRight: {
        width: '30%', 
        justifyContent: 'center', 
        alignItems: 'flex-end'
    },
    itemTitle: {
        fontSize: '$fontSize',
        fontFamily: '$proximaSB',
        color: '$primaryColor'
    },
    itemDate: {
        fontSize: 12, 
        color: '#000',
        fontFamily: '$proximaRegular'
    },
    itemState: {
        fontSize: 12, 
        color: '#828282', 
        textAlign: 'right',
        fontFamily: '$proximaRegular'
    },
    itemsActionContainer: { 
        // width: 50,
        marginLeft: StyleService.moderateScale(20),
        justifyContent: 'center', 
        alignItems: 'center'
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center'
    },
    '@media (min-width: 600)': {
        syncButton: {
            width: 160
        }
    },
    get customFooter() {
        return {
            '@media (max-width: 600)': {
                width: 320
            },
            '@media (min-width: 600) and (max-width: 1024)': {
                width: 440,
                alignSelf: 'center'
              },
        }
    },
})

const landscapeStyles = EStyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: 'space-between'
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: StyleService.moderateScale(4),
        backgroundColor: '$lightColor',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    }
  })