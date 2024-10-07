export default class QuestionAnswerContainer {
    constructor(questionId) {
        this.questionId = questionId
        this.answers = []
        this.answerTime = Date.now()
    }

    toJSON() {
        return {
            q: this.questionId,
            d: this.answers,//why d?!
            t: this.answerTime
        }
    }
}