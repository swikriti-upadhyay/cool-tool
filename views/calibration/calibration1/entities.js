import Logger from '../../../utils/logger'
import EventDispatcher from '../../../utils/event-dispatcher'

export class DotEntity extends EventDispatcher {
    constructor(moves, renderer) {
        super()
        this.moves = moves
        this.renderer = renderer
        this.currentMoveIndex = -1
        this.isRunning = false
    }

    start() {
        this.currentMoveIndex = 0
        this.isRunning = true
        this.statedAt = Date.now()
        this.emit('started', this)
        this.startCurrentMove()
    }

    startCurrentMove() {
        this.moves[this.currentMoveIndex].start()
    }

    getCurrentPosition() {
        if (!this.moves[this.currentMoveIndex].isRunning && this.isRunning) {
            if (this.moves.length - this.currentMoveIndex === 1) {
                if (!this.finishedAt)
                    this.finishedAt = Date.now()
                    this.isRunning = false
                    this.emit('finished', this)
            } else {
                this.currentMoveIndex++
                this.startCurrentMove(this.currentMoveIndex)
            }
        }
        return this.moves[this.currentMoveIndex].getCurrentPosition()
    }
}