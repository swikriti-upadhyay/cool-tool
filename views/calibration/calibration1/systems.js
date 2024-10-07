import Logger from '../../../utils/logger'

class MoveDot {
    move(entities, e) {
        if (entities.length < 1)
            throw new Error('No entities specified')
        let dot = entities[0]
        if (dot.isRunning) {
            dot.currentPosition = dot.getCurrentPosition()
        } else {
            dot.currentPosition = {x: -1000, y: -1000}
        }
        return entities
    }
}

export {MoveDot}