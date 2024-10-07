import React from 'react'
import { 
    CameraCalibration, 
    EyeTrackerCalibration, 
    QuestionItem, 
    SkipItem, 
    SurveyFinishedItem,
    SurveyStopRecord,
    InstructionItem,
    SurveyItemState,
    SyncItem,
    VisualInstructionItem,
    ProjectStopped,
    AppInstructionItem,
    PermissionsItem,
    VideoInstructionItem,
    TextItem
} from './survey-items'
import { questionType } from './question'
import BaseRenderer from '../views/renderers/base-renderer'
import WebTest from '../views/renderers/web-test-renderer'
import CameraCalibrationView from '../views/renderers/cameraCallibration/CameraCallibrationContainer'
import DisqualifyRenderer from '../views/renderers/skip-renderer'
import EyeTrackerCalibrationRenderer from '../views/renderers/eye-tracker-calibration-renderer'
import SurveyRecordingStoppedRenderer from '../views/renderers/cameraStopRecord/CameraStopRecordContainer'
import SurveyFinishedRenderer from '../views/renderers/survey-finished'
import ProjectStoppedRenderer from '../views/renderers/project-stopped'
import AppTestRenderer from '../views/renderers/appTest/AppTestContainer'
import SyncRenderer from '../views/renderers/sync/SyncContainer'
import AppInstructionRenderer from '../views/renderers/app-instruction-renderer'
import AppPermissionsRenderer from '../views/renderers/app-permissions-renderer'
import VideoInstructionRenderer from '../views/renderers/videoInstruction/VideoInstructionContainer'
import VisualInstructionsRenderer from '../views/renderers/instructions/InstructionsContainer'
import SurveyWebInstructionRenderer from '../views/renderers/survey-web-instruction'
import TextRenderer from '../views/renderers/instruction-question-renderer'
import SimpleQuestionRenderer from '../views/renderers/simple-question-renderer'

export default class SurveyItemRendererResolver {
    static getRenderer(surveyItem, refCb, options) {
        if (surveyItem instanceof QuestionItem) {
            switch(surveyItem.questionType) {
                case questionType.Instructions:
                    return <TextRenderer surveyItem={surveyItem} ref={refCb} t={options.translation}/>
                case questionType.EyeTrackingWebsite:
                    return <WebTest surveyItem={surveyItem} onMessage={options.onMessage} onNavigationChanged={options.onNavigationChanged} ref={refCb} withBar t={options.translation}/>
                case questionType.App:
                    return <AppTestRenderer surveyItem={surveyItem} ref={refCb} t={options.translation}/>
                case questionType.Prototype:
                    return <WebTest surveyItem={surveyItem} onMessage={options.onMessage} onNavigationChanged={options.onNavigationChanged} ref={refCb} t={options.translation} />
            }
        } else if (surveyItem instanceof TextItem) { 
            return <TextRenderer surveyItem={surveyItem} ref={refCb} t={options.translation}/>
        } else if (surveyItem instanceof AppInstructionItem) { 
            return <AppInstructionRenderer surveyItem={surveyItem} ref={refCb} t={options.translation}/>
        } else if (surveyItem instanceof PermissionsItem) {
            return <AppPermissionsRenderer surveyItem={surveyItem} ref={refCb} t={options.translation}/>
        } else if (surveyItem instanceof VideoInstructionItem) {
            return <VideoInstructionRenderer surveyItem={surveyItem} ref={refCb} t={options.translation}/>
        } else if (surveyItem instanceof VisualInstructionItem) { 
            return <VisualInstructionsRenderer surveyItem={surveyItem} ref={refCb} t={options.translation}/>
        } else if (surveyItem instanceof InstructionItem) { 
            return <SurveyWebInstructionRenderer surveyItem={surveyItem} ref={refCb} t={options.translation}/>
        } else if (surveyItem instanceof SurveyStopRecord) {
            return <SurveyRecordingStoppedRenderer surveyItem={surveyItem} ref={refCb} t={options.translation}/>
        } else if (surveyItem instanceof SyncItem) {
            return <SyncRenderer surveyItem={surveyItem} ref={refCb} t={options.translation}/>
        } else if (surveyItem instanceof CameraCalibration) {
            return <CameraCalibrationView surveyItem={surveyItem} ref={refCb} t={options.translation}/>
        } else if (surveyItem instanceof EyeTrackerCalibration) {
            return <EyeTrackerCalibrationRenderer surveyItem={surveyItem} layout={surveyItem.layout} ref={refCb} t={options.translation}/>
        } else if (surveyItem instanceof SkipItem) {
            return <DisqualifyRenderer surveyItem={surveyItem} ref={refCb} t={options.translation}/>
        } else if (surveyItem instanceof SurveyFinishedItem) {
            return <SurveyFinishedRenderer surveyItem={surveyItem} ref={refCb} t={options.translation}/>
        } else if (surveyItem instanceof ProjectStopped) {
            return <ProjectStoppedRenderer surveyItem={surveyItem} ref={refCb} t={options.translation}/>
        }

        return <SimpleQuestionRenderer surveyItem={surveyItem} ref={refCb} t={options.translation}/>
    }
} 