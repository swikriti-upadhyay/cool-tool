import React from 'react'
import BaseRenderer from '../base-renderer'

import VideoInstructionView from './VideoInstructionView'

export default class VisualInstructionsRenderer extends BaseRenderer {
    get className() { return 'VisualInstructionsRenderer' }
    render() {
        return <VideoInstructionView
                onNext={() => this.finish()}
            />
    }
}