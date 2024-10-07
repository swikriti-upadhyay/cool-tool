import BackgroundTimer from 'react-native-background-timer'

export default class EventDispatcher {

    __listeners = new Map()

    addListener(label, callback) {
        this.__listeners.has(label) || this.__listeners.set(label, [])
        this.__listeners.get(label).push(callback)
    }

    removeListener(label, callback) {
        let listeners = this.__listeners.get(label),
            index

        if (listeners && listeners.length) {
            index = listeners.reduce((i, listener, index) => {
                return (listener === callback) ? index : i
            }, -1)

            if (index > -1) {
                listeners.splice(index, 1)
                this.__listeners.set(label, listeners)
                return true
            }
        }
        return false
    }

    emit(label, eventArgs) {
        let listeners = this.__listeners.get(label)
        if (listeners && listeners.length) {
            let args = {}
            Object.assign(args, eventArgs)
            args.et = label
            args.sender = this
            listeners.forEach((listener) => {
                listener(args)
            });
            return true
        }
        return false
    }

    emitAsync(label, eventArgs) {
        BackgroundTimer.setTimeout(() => {
            this.emit(label, eventArgs)
        }, 100)
    }
}