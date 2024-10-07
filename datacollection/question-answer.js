export default class QuestionAnswer {
    //alternative, alternative2, value, valueText, neurolabData, neurolabTrackers, actualNeurolabTrackers, elapsedMilliseconds, lang, pageIndex
    constructor(answer) {
        // this.alternative = alternative
        // this.alternative2 = alternative2
        // this.value = value
        // this.valueText = valueText
        // this.neurolabData = neurolabData
        // this.neurolabTrackers = neurolabTrackers
        // this.actualNeurolabTrackers = actualNeurolabTrackers
        // this.elapsedMilliseconds = elapsedMilliseconds
        // this.lang = lang
        // this.pageIndex = pageIndex
        Object.assign(this, answer)
        this.answerDate = new Date()
    }

    toJSON() {
        return {
            a: this.alternative, // answer id
            g: this.alternative2, //? Check what is g
            v: this.value, // 
            t: this.valueText,
            nd: this.neurolabData ? JSON.stringify(this.neurolabData) : undefined,//ugly contract
            nt: this.neurolabTrackers,
            ant: this.actualNeurolabTrackers,
            dataCollectionStartTime: this.dataCollectionStartTime,
            elapsedMilliseconds: this.elapsedMilliseconds,
            lang: this.lang,
            pageIndex: this.pageIndex
        }
    }
}