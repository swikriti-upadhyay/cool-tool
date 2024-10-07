import DataStore from 'react-native-local-mongodb'
import Logger from '../utils/logger'
import EventDispatcher from '../utils/event-dispatcher'
import RNFetchBlob from 'rn-fetch-blob'
import FilesystemStorage from 'redux-persist-filesystem-storage'
import Constants from '../constants'

export const DataEntryType = {
    RESPONSEDATA: 0,
    CALIBRATION: 1
}

export const DataType = {
    NONE: 0,
    SCREENSHOTS: 1,
    CAMERA: 2
}

export const PathAction = {
    NONE: 0,
    SYNC: 1,
    DELETE: 2
}

export const SyncStatus = {
    NONE: 0,
    WAITING_FOR_SYNC: 1,
    SUCCESSFUL: 2,
    ERROR: 3
}

export const RespondentStatus = {
    UNKNOWN: 0,
    COMPLETED: 1,
    SKIPPED: 2,
    DISQUALIFIED: 3
}

export const SurveyType = {
    USERS_SURVEY: 0,
    ANON_APP_TEST: 1,
    ANON_WEB_TEST: 2,
    ANON_PROT_TEST: 3
}

export const UserType = {
    ANON: 0,
    GUEST: 1,
    USER: 2,
    ADMIN: 3,
}

const BaseEntitySchema = {
    properties: {
        _id: {
            type: Number,
            mangedByDb: true
        },
        deleted: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            mangedByDb: true
        }, //manged by db
        updatedAt: {
            type: Date,
            mangedByDb: true
        } //manged by db
    },
    validate: (entry, schema) => {

        if (!entry)
            throw new Error('Entry cannot be null or undefined')

        let errors = ''
        for (let ep in entry) {
            if (!schema.properties[ep]) 
                try {
                    entry = Object.keys(entry).reduce((object, key) => {
                        if (key !== ep) {
                          object[key] = entry[key]
                        }
                        return object
                      }, {})
                } catch {
                    errors += `\nProperty ${ep} is not presented in schema`
                }
                // errors += `\nProperty ${ep} is not presented in schema`
        }

        if (errors)
            throw new Error('Entry schema is invalid.' + errors)

        for (let p in schema.properties) {
            let entryValue = entry[p]
            let property = schema.properties[p]
            if (property.mangedByDb) //i'm sure that more elegant solution exists, but no time to waste it
                continue
            if ((entryValue === null || entryValue === undefined) && property.hasOwnProperty('default')) {
                entry[p] = property.default
                entryValue = property.default
            }
            if ((entryValue === null || entryValue === undefined) && !property.optional) {
                errors += `\n${p} value cannot be null or undefined`
                continue
            }
            if ((entryValue !== null && entryValue !== undefined) && entryValue.constructor.name !== property.type.name) {
                errors += `\n${p} type should be of type ${property.type.name} but was ${entryValue.constructor.name}`
            }
        }
        if (errors)
            throw new Error('Entry schema is invalid.' + errors)
    }
}

const RespondentEntitySchema = {
    ...BaseEntitySchema,
    ...{
        collectionName: 'respondents',
        properties: {
            ...BaseEntitySchema.properties,
            ...{
                _id: {
                    type: String
                }, //id string to have an ability to generate it without connection. ct_id.toString() by default
                ct_id: {
                    type: Number
                },
                status: {
                    type: Number
                },
                result: {
                    type: String
                }, //for json string
                uploadedAnswers: {
                    type: Array
                },
                lastUploadedAnswerId: {
                    type: String,
                    default: ""
                },
                areAnswersUploaded: {
                    type: Boolean
                },
                areDataUploaded: {
                    type: Boolean
                },
                resultVideoUrl: {
                    type: String,
                    optional: true
                },
                isOwnProject: {
                    type: Boolean,
                    default: false
                },
                hasNeuroQuestions: {
                    type: Boolean,
                    default: false
                },
                surveyCode: {
                    type: String
                },
                projectName: {
                    type: String
                },
                responseStartDate: {
                    type: Date
                },
                responseEndDate: {
                    type: Date
                }
            }
        }
    }
}

const QuestionEntitySchema = {
    ...BaseEntitySchema,
    ...{
        collectionName: 'questions',
        properties: {
            ...BaseEntitySchema.properties,
            ...{
                _id: {
                    type: String
                },
                qid: {
                    type: Number
                },
                uid: {
                    type: Number
                },
                answers: {
                    type: String
                },
                uploaded: {
                    type: Boolean,
                    default: false
                }
            }
        }
    }
}

const DataEntryEntitySchema = {
    ...BaseEntitySchema,
    ...{
        collectionName: 'dataEntries',
        properties: {
            ...BaseEntitySchema.properties,
            ...{
                path: {
                    type: String
                },
                respondentId: {
                    type: String
                },
                questionId: {
                    type: Number
                },
                errorMsg: {
                    type: String,
                    optional: true
                },
                syncStatus: {
                    type: Number
                },
                dataType: {
                    type: Number
                }, //Screenshots or Camera
                entryType: {
                    type: Number
                }, //Respondent or calibration
                uploadedUrl: {
                    type: String
                },
                additionalData: {
                    type: String
                }
            }
        }
    }
}

const SettingsEntitySchema = {
    ...BaseEntitySchema,
    ...{
        collectionName: 'settings',
        properties: {
            ...BaseEntitySchema.properties,
            ...{
                cameraFolder: {
                    type: String
                },
                dataFolder: {
                    type: String
                },
                screenFolder: {
                    type: String
                },
                selectedCamera: {
                    type: Number
                },
                serverUrl: {
                    type: String
                },
                defaultTestSiteUrl: {
                    type: String
                },
                shakeDegree: {
                    type: String
                },
                taskText: {
                    type: String
                },
                cameraProfile: {
                    type: String,
                    optional: true
                },
                isDebug: {
                    type: Boolean
                },
                allowOrientationChange: {
                    type: Boolean,
                    default: true
                },
                advancedFaceValidation: {
                    type: Boolean
                },
                builtinFaceDetection: {
                    type: Boolean
                },
                emotionMeasurement: {
                    type: Boolean,
                    default: true
                },
                cameraData: {
                    type: String,
                    optional: true
                },
                terms: {
                    type: Boolean,
                    default: false
                },
                withAudio: {
                    type: Boolean,
                    default: true
                },
                applicationName: {
                    type: String,
                    optional: true
                },
                applicationTask: {
                    type: String,
                    optional: true
                },
                timeout: {
                    type: Number,
                    default: 15
                },
                filledInstructionData: { // TODO: make migration to delete this key
                    type: Boolean,
                    default: false
                },
                neverAskApp: {
                    type: Boolean,
                    default: false
                },
                neverAskSite: {
                    type: Boolean,
                    default: false
                },
                trialCounter: {
                    type: Number,
                    default: 0
                },
                skipVideo: {
                    type: Boolean,
                    default: false
                },
                syncSkipAsk: {
                    type: Boolean,
                    default: false
                },
                isDeviceRegistered: {
                    type: Boolean,
                    default: false
                },
                defaultProtoLink: {
                    type: String,
                    default: ""
                },
                defaultProtoTask: {
                    type: String,
                    default: ""
                },
                defaultProtoDevice: {
                    type: String,
                    default: ""
                },
                deviceOrientation: {
                    type: String,
                    default: ""
                },
                neverAskProto: {
                    type: Boolean,
                    default: false
                }
            }
        }
    }
}

const ProjectEntitySchema = {
    ...BaseEntitySchema,
    ...{
        collectionName: 'projects',
        properties: {
            ...BaseEntitySchema.properties,
            ...{
                surveyCode: {
                    type: String
                },
                projectId: {
                    type: Number
                },
                projectName: {
                    type: String
                },
                metadata: {
                    type: String
                },
                default: {
                    type: Boolean,
                    default: false
                },
                isCurrentProject: {
                    type: Boolean
                },
                surveyType: {
                    type: Number,
                    default: SurveyType.USERS_SURVEY
                },
                timeout: {
                    type: Number,
                    default: 0
                }
            }
        }
    }
}

const UserEntitySchema = {
    ...BaseEntitySchema,
    ...{
        collectionName: 'users',
        properties: {
            ...BaseEntitySchema.properties,
            ...{
                userId: {
                    type: Number,
                    default: 0
                },
                name: {
                    type: String,
                    default: 'Guest' // gest
                },
                email: {
                    type: String,
                    default: ''
                },
                apiToken: {
                    type: String,
                    default: ''
                },
                roleId: {
                    type: Number,
                    default: 1 // id
                },
                subscription: {
                    type: Number,
                    default: 0
                },
                projectCode: {
                    type: String,
                    default: ''
                }
            }
        }
    }
}

const SubscriptionEntitySchema = {
    ...BaseEntitySchema,
    ...{
        collectionName: 'subscription',
        properties: {
            ...BaseEntitySchema.properties,
            ...{
                subscriptionId: {
                    type: Number,
                    default: 0
                },
                paid: {
                    type: Boolean,
                    default: false
                },
                name: {
                    type: String,
                    default: ''
                },
                expiration: {
                    type: Number,
                    default: 0
                },
                maxResponseNumber: {
                    type: Number,
                    default: 0
                },
                responseCollected: {
                    type: Number,
                    default: 0
                },
                responseLeft: {
                    type: Number,
                    default: 0
                },
                downgradeRequested: {
                    type: Boolean,
                    default: false
                },
                monthPackageExpiration: {
                    type: Number,
                    default: 0
                },
                extraResponsePrice: {
                    type: Number,
                    default: 0
                }
            }
        }
    }
}



class BaseStorage extends EventDispatcher {

    constructor() {
        super()
        this.__db = new DataStore({
            filename: this.schema.collectionName,
            timestampData: true,
            autoload: true,
            corruptAlertThreshold: 0, 
            storage: FilesystemStorage
        })
    }

    get schema() {
        throw new Error('Not implemented')
    }

    __validateEntry(entry) {
        this.schema.validate(entry, this.schema)
    }

    toCommonObject(mongoObject) {
        if (!mongoObject)
            return null
        let res = {}
        Object.assign(res, mongoObject)
        return res
    }

    emit(e, args) {
        try {
            super.emit(e, args)
        } catch (e) {
            Logger.error('Error on emit: ' + e.message)
        }
    }

    async getAll(options = {}) {

        let filter = null

        if (options.filter)
            filter = options.filter

        if (filter && JSON.stringify(filter).indexOf('deleted') === -1)
            filter = {$and: [filter, {deleted: {$ne: true}}]}
        else if (!filter)
            filter = {deleted: {$ne: true}}

        // if (Constants.isDebug)
        //     Logger.log(`getAll called on collection ${this.schema.collectionName} with params: ${JSON.stringify(options)}`)

        let cursor = this.__db.find(filter)

        if (options.sort)
            cursor = cursor.sort(options.sort)

        if (options.skip)
            cursor = cursor.skip(options.skip)
        if (options.take)
            cursor = cursor.limit(options.take)

        let all =  await cursor.exec()
        return all.map(this.toCommonObject)
    }

    async getById(id) {
        console.log(id)
        // if (Constants.isDebug)
        //     Logger.log(`getById called on collection ${this.schema.collectionName} with params: ${id}`)
        let entry = await this.__db.findOneAsync({
            _id: id
        })
        if (!entry)
            throw new Error('Entry with specified id is not found')
        return this.toCommonObject(entry) // TODO: multi access check?
    }

    async insert(dataEntry) {
        this.__validateEntry(dataEntry)

        // if (Constants.isDebug)
        //     Logger.log(`insert called on collection ${this.schema.collectionName} with params: ${dataEntry}`)

        await this.__db.insertAsync(dataEntry)

        let entry = await this.getById(dataEntry._id)
        dataEntry = this.toCommonObject(entry)

        this.emit('inserted', dataEntry)
    }

    async update(dataEntry) {
        let _dataEntry = await this.getById(dataEntry._id)
        if (!_dataEntry)
            throw new Error('Data entry with specified id is not found')

        let propsToUpdate = {}

        for (let p in this.schema.properties) {
            if (dataEntry.hasOwnProperty(p) && dataEntry[p] != _dataEntry[p]) {
                _dataEntry[p] = dataEntry[p]
                propsToUpdate[p] = dataEntry[p]
            }
        }

        this.__validateEntry(_dataEntry)

        if (Object.getOwnPropertyNames(propsToUpdate).length > 0) {
            // if (Constants.isDebug)
            //     Logger.log(`update called on collection ${this.schema.collectionName} with params: {id: ${dataEntry._id}, propsToUpdate: ${JSON.stringify(propsToUpdate)}}`)
            await this.__db.updateAsync({
                _id: dataEntry._id
            }, {
                $set: propsToUpdate
            })

            let entry = await this.getById(dataEntry._id)
            entry = this.toCommonObject(entry)

            this.emit('updated', entry)
        }
    }

    async markAsDeleted(id) {
        let entry = await this.getById(id)
        entry.deleted = true
        await this.update(entry)
        this.emit('updated', entry)
    }

    async deleteAll() {
        // if (Constants.isDebug)
        //     Logger.log(`deleteAll called on collection ${this.schema.collectionName}`)
        await this.__db.removeAsync({}, {
            multi: true
        })
        this.emit('cleared', this.schema.name)
    }

    deleteItem(id, onDone) {
        let self = this
        this.__db.remove({_id: id}, {}, (err, numRemoved)=>{
            if(err) {
                throw new Error(err)
            }
            self.emit('deleted', self.schema.collectionName)
            onDone && onDone()
        })
    }
}

class DataEntryStorage extends BaseStorage {
    get schema() {
        return DataEntryEntitySchema
    }

    async setSyncStatus(respondentId, syncStatus, questionId = null) {

        let filter = {
            respondentId: respondentId.toString(),
            syncStatus: {
                $ne: SyncStatus.SUCCESSFUL
            }
        }
        if (questionId)
            filter.questionId = questionId

        // if (Constants.isDebug)
        //     Logger.log(`setSyncStatus called on collection ${this.schema.collectionName} with params: ${JSON.stringify(filter)}`)

        let entries = await this.__db.find(filter)

        let updated = []
        for (let i = 0; i < entries.length; i++) {
            let dataEntry = entries[i]
            this.__setSyncStatus(dataEntry, syncStatus)
            await this.update(dataEntry)
            updated.push(dataEntry)
        }

        for (let i = 0; i < updated.length; i++)
            this.emit('updated', this.toCommonObject(updated[i]))
    }

    async setSyncStatusById(dataEntryId, syncStatus, error) {
        let entry = await this.getById(dataEntryId)
        this.__setSyncStatus(entry, syncStatus, error)
        await this.update(entry)
        this.emit('updated', this.toCommonObject(entry))
    }

    __setSyncStatus(entry, syncStatus, error) {
        if (entry.syncStatus === SyncStatus.SUCCESSFUL) {
            return
        }
        entry.syncStatus = syncStatus
        if (entry.syncStatus === SyncStatus.ERROR)
            entry.errorMsg = error
    }

    static __allDataToSyncFilter = {
        syncStatus: {
            $ne: SyncStatus.SUCCESSFUL
        }
    }

    async __getAllDataToSync() {
        let entries = await this.getAll({
            filter: this.__allDataToSyncFilter
        })
        return entries.map(this.toCommonObject)
    }

    async getCalibrationForRespondent(respId) {
        let entries = await this.getAll({
            filter: {
                entryType: DataEntryType.CALIBRATION,
                respondentId: respId
            }
        })
        if (entries.length === 1)
            return this.toCommonObject(entries[0])
        return null
    }

    async getRespondentDataToSync(respId) {
        let filter = {
            ...this.__allDataToSyncFilter,
            ...{
                respondentId: respId,
                entryType: { $ne: DataEntryType.CALIBRATION }
            }
        }
        let entries = await this.getAll({
            filter: filter
        })
        return entries.map(this.toCommonObject)
    }
}

class RespondentStorage extends BaseStorage {
    get schema() {
        return RespondentEntitySchema
    }

    async getAllRespondentsToValidate() {
        let entries = await this.getAll({
            filter: {
                status: {
                    $nin: [RespondentStatus.SKIPPED, RespondentStatus.DISQUALIFIED, RespondentStatus.COMPLETED]
                }
            }
        })
        return entries.map(e => e._id)
    }

    async getAllRespondentsToSync() {
        console.log('get reps')
        let entries = await this.getAll({
            filter: {
                $and: [{
                        status: RespondentStatus.COMPLETED
                    },
                    {
                        $or: [{
                                areDataUploaded: false
                            },
                            {
                                areAnswersUploaded: false
                            }
                        ]
                    }
                ]
            }
        })
        return entries.map(e => e._id)
    }

    async getAllSuccess(options = {}) {
        let respondents = await this.getAll({
            skip: options.skip,
            take: options.take,
            filter: {
                status: { $nin: [RespondentStatus.DISQUALIFIED, RespondentStatus.SKIPPED]}, 
            $or: [
                {
                    hasNeuroQuestions: true,
                    isOwnProject: true
                }
            ] }, 
            sort: {createdAt: -1}
        })
        return respondents
    }

    async getUniversal() {
        return await this.getAll({
            filter: {
                surveyCode: 'universal'
            }
        })
    }

    async setStatus(respId, status) {
        let entry = await this.getById(respId.toString())
        if (entry.status !== status) {
            entry.status = status
            await this.update(entry)
            this.emit('updated', this.toCommonObject(entry))
        }

        let syncAction = SyncStatus.NONE
        if (status === RespondentStatus.COMPLETED)
            syncAction = SyncStatus.WAITING_FOR_SYNC
        await Storages.DataEntryStorage.setSyncStatus(respId, syncAction)
    }

    async setAnswers(respId, lastQuestionId, answers) {
        try {
            let entry = await this.getById(respId.toString())
            entry.result = JSON.stringify(answers)
            // entry.lastUploadedAnswerId = lastQuestionId
            await this.update(entry)
        } catch(e) {
            console.log(e)
        }
    }

    async answersUploaded(respId) {
        let entry = await this.getById(respId)
        entry.areAnswersUploaded = true
        await this.update(entry)
        this.emit('updated', this.toCommonObject(entry))
    }

    async answerUploaded(respId, questionId, lastAnswerId) {
        let entry = await this.getById(respId)
        entry.lastUploadedAnswerId = lastAnswerId.toString();
        if (entry.uploadedAnswers.indexOf(questionId) === -1) {
            entry.uploadedAnswers.push(questionId)
        }
        await this.update(entry)
        this.emit('updated', this.toCommonObject(entry))
    }

    async getUploadedAnswers(respId) {
        let entry = await this.getById(respId);
        return entry.uploadedAnswers;
    }

    async dataUploaded(respId) {
        let entry = await this.getById(respId)
        entry.areDataUploaded = true
        await this.update(entry)
        this.emit('updated', this.toCommonObject(entry))
    }

    async getAllRespondentEntries(respId) {
        return await Storages.DataEntryStorage.getAll({
            filter: {
                respondentId: respId
            }
        })
    }

    async markAsDeleted(id) {
        await super.markAsDeleted(id)
        let dataEntries = await this.getAllRespondentEntries(id)
        for (let i = 0; i < dataEntries.length; i++) {
            let currentEntry = dataEntries[i]
            try {
                await Storages.DataEntryStorage.markAsDeleted(currentEntry._id)
                let exists = await RNFetchBlob.fs.exists(currentEntry.path)
                if (exists)
                    await RNFetchBlob.fs.unlink(currentEntry.path)
            } catch (e) {
                Logger.error(`Unable to delete data entry ${currentEntry._id}:\n ${e.message}`)
            }
        }
    }

    async deleteAll() {
        let resps = await this.getAll({filter: { $or: [{deleted: true}, {deleted: {$ne: true}}]} })
        for (let i = 0; i < resps.length; i++) {
            let currentResp = resps[i]
            try {
                await this.markAsDeleted(currentResp._id)
            } catch(e) {
                Logger.error(`Unable to delete respondent ${currentResp._id}:\n ${e.message}`)
            }
        }
        await super.deleteAll()
    }

    async getRespWithNoVideo() {
        let entries = await this.getAll({
            filter: {
                status: RespondentStatus.COMPLETED,
                areDataUploaded: true,
                areAnswersUploaded: true,
                isOwnProject: true,
                hasNeuroQuestions: true,
                $or: [
                        {resultVideoUrl: null}, 
                        {resultVideoUrl: {$exists: false}}
                    ] 
            }
        })
        return entries.map(x => x._id)
    }
}

class QuestionStorage extends BaseStorage {
    get schema() {
        return QuestionEntitySchema
    }
    
    async insertOrUpdate(answer) {
        try {
            const question = await super.insert(answer)
        } catch {
            await super.update(answer)
        }
    }
    
    async getAllRespondentAnswersToUpload(respId) {
        let resp = Number(respId)
        return await this.getAll({
            filter: {
                uid: resp,
                uploaded: false
            }
        })
    }

    async answerUploaded(questions) {
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            let entry = await this.getById(question.toString())
            entry.uploaded = true;

            await this.update(entry)
            this.emit('updated', this.toCommonObject(entry))
        }
    }
}

class SettingsStorage extends BaseStorage {
    get schema() {
        return SettingsEntitySchema
    }

    async hasSettings() {
        let count = await this.__db.count().exec()
        return count > 0
    }

    // needMigrate(entry) {
    //     if (!entry) return false
    //     return entry.dbVersion !== Constants.DB_VERSION
    // }

    async insert(settings) {
        settings._id = 1
        return await super.insert(settings)
    }

    async getSettings() {
        let hasSettings = await this.hasSettings()
        if (!hasSettings)
            return null
        let entry = await this.getById(1)
        entry = this.toCommonObject(entry)
        return entry
    }

    clearAccountSettings() {
        this.getSettings().then((settings) => {
            settings.applicationName = ''
            settings.applicationTask = ''
            settings.defaultTestSiteUrl = ''
            settings.taskText = ''
            settings.neverAskApp = false
            settings.neverAskSite = false
            settings.timeout = Constants.DefaultTime
            this.update(settings)
        })
    }

    // async checkMigrate() {
    //     let hasSettings = await this.hasSettings()
    //     if (!hasSettings)
    //         return null
    //     let entry = await this.getById(1)
    //     entry = this.toCommonObject(entry)
    //     return this.needMigrate(entry)
    // }
}

class ProjectsStorage extends BaseStorage {
    get schema() {
        return ProjectEntitySchema
    }

    async getCurrentProject() {
        let entries = await this.getAll({
            filter: {
                isCurrentProject: true
            }
        })
        let res = null
        if (entries.length > 0) {
            res = this.toCommonObject(entries[0])
        }
        return res
    }

    async getDefaultProject() {
        let entries = await this.getAll({
            filter: {
                default: true
            }
        })
        let res = null
        if (entries.length > 0) {
            res = this.toCommonObject(entries[0])
        }
        return res
    }

    async setCurrentProject(project) {
        await this.__db.updateAsync({}, {
            $set: {
                isCurrentProject: false
            }
        }, {
            multi: true
        })

        let count = await this.__db.count({_id: project._id}).exec()
        if (count > 0) {
            let entry = await this.getById(project._id)
            entry.isCurrentProject = true
            entry.projectName = project.projectName
            entry.surveyType = project.surveyType
            entry.timeout = project.timeout || 0
            await this.update(entry)
            this.emit('updated', this.toCommonObject(entry))
        } else {
            project.isCurrentProject = true
            await this.insert(project)
            this.emit('inserted', this.toCommonObject(project))
        }
    }
    async unsetCurrentProject() {
        await this.__db.updateAsync({}, {
            $set: {
                isCurrentProject: false
            }
        }, {
            multi: true
        })
    }
}

class UserStorage extends BaseStorage {
    get schema() {
        return UserEntitySchema
    }

    async hasUser() {
        let count = await this.__db.count().exec()
        return count > 0
    }

    async insert(user) {
        user._id = 1
        return await super.insert(user)
    }

    async insertOrUpdate(newUser) {
        newUser._id = 1
        let user
        try {
            user = await super.update(newUser)
        } catch(e) {
            user = await super.insert(newUser)
        }
        return newUser.roleId
    }

    async getUser() {
        let hasUser = await this.hasUser()
        if (!hasUser)
            return null
        let entry = await this.getById(1)
        entry = this.toCommonObject(entry)
        return entry
    }

    async getUserName() {
        let hasUser = await this.hasUser()
        if (!hasUser)
            return null
        let entry = await this.getById(1)
        entry = this.toCommonObject(entry)
        return entry.name
    }

    async cleanApiKey() {
        await this.__db.updateAsync({}, {
            $set: {
                apiToken: ''
            }
        }, {
            multi: true
        })
    }
}

class SubscriptionStorage extends BaseStorage {
    get schema() {
        return SubscriptionEntitySchema
    }
    async insert(subscription) {
        subscription._id = 1
        return await super.insert(subscription)
    }

    async update(subscription) {
        subscription._id = 1
        return await super.update(subscription)
}
    async getSubscription() {
        try {
            let entry = await this.getById(1)
                entry = this.toCommonObject(entry)
                return entry
        } catch {
            return null
        }
    }

    async insertOrUpdate(subscription) {
        this.update(subscription)
        .catch(async () => await this.insert(subscription))
    }
}

export const Storages = {
    DataEntryStorage: new DataEntryStorage(),
    SettingsStorage: new SettingsStorage(),
    ProjectsStorage: new ProjectsStorage(),
    RespondentStorage: new RespondentStorage(),
    QuestionStorage: new QuestionStorage(),
    UserStorage: new UserStorage(),
    SubscriptionStorage: new SubscriptionStorage()
}