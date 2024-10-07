export class Move {
    constructor(startPoint, stopPoint, duration, moveDelay, finishDelay = -1) {
        this.startPoint = startPoint
        this.stopPoint = stopPoint
        this.distance = Math.hypot(stopPoint.x - startPoint.x, stopPoint.y - startPoint.y)
        this.moveDelay = moveDelay
        this.finishDelay = finishDelay
        this.duration = duration
        this.isRunning = false
        this.angle = Math.atan2(stopPoint.y - startPoint.y, stopPoint.x - startPoint.x)
    }

    start() {
        this.currentPosition = this.startPoint
        this.startedAt = Date.now()
        this.isRunning = true
    }

    stop(stopTime) {
        if (this.isRunning) {
            this.isRunning = false
            this.stoppedAt = stopTime
        }
    }

    getCurrentPosition() {
        let currentTime = Date.now()
        let timoffset = currentTime - this.startedAt
        if (timoffset >= this.moveDelay) {
            if (!this.movedStatedAt)
                this.movedStatedAt = currentTime
            let finishedKoef = (timoffset - this.moveDelay) / this.duration
            if (finishedKoef >= 1) {
                this.currentPosition = this.stopPoint
                if (!this.movedFinishedAt)
                    this.movedFinishedAt = currentTime
                if (currentTime - this.movedFinishedAt >= this.finishDelay)
                    this.stop(currentTime)
            } else {
                let currentDistance = this.distance * finishedKoef
                let currX = this.startPoint.x + Math.cos(this.angle) * currentDistance,
                    currY = this.startPoint.y + Math.sin(this.angle) * currentDistance
                this.currentPosition = new Point(currX, currY)
            }
        }
        return this.currentPosition
    }
}

export class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}

export class Map {
    static buildDefaultCalibrationMap(allMovesDuration, pointMoveDelay, canvasSize, dotRadius) {
        let timePerMove = allMovesDuration / 5
        if (pointMoveDelay > timePerMove)
            throw new Error('pointMoveDelay should be less or equal to timePerMove')
        const allPoints = [
            new Point(canvasSize.width / 2, canvasSize.height / 2),
            new Point(canvasSize.width - dotRadius, dotRadius),
            new Point(canvasSize.width - dotRadius, canvasSize.height - dotRadius),
            new Point(dotRadius, canvasSize.height - dotRadius),
            new Point(dotRadius, dotRadius),
        ]
        let moves = []
        for (let i = 0; i < allPoints.length; i++) {
            if (i + 1 === allPoints.length)
                break
            let move = new Move(allPoints[i], allPoints[i + 1], timePerMove - pointMoveDelay, pointMoveDelay)
            moves.push(move)
        }
        moves.push(new Move(allPoints[4], allPoints[4], 0, pointMoveDelay))//hack to make last dot visible for delay time
        return moves
    }
}