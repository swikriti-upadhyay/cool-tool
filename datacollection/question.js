const QUESTITEMTYPE = {
    APP: 30,
    WEB_SITE: 24,
    IMPLICIT: 26,
    QUESTION: 0
};

const QUESTIONTYPE = {
	None: 0,
	OpenEnded: 1,
	SingleAnswer: 3,
	MultipleAnswers: 4,
	SingleSelectCombo: 5,
	MatrixSingle: 6,
	MatrixMultiple: 7,
	Rating: 8,
    RatingSmile: 9,
	Ranking: 10,
	ConstantSum: 12,
	ContinuousSum: 13,
	RatingSlider: 15,
	SemanticDifferential: 16,
	MediaQuestion: 17,
	Instructions: 18,
    ExternalRedirect: 19,
    EyeTracking: 20,
    ShelfEyeTracking: 21,
    ShelfMedia: 22,
    EyeTrackingVideo: 23,
    EyeTrackingWebsite: 24,
    EyeTrackingWebsiteScreenShot: 25,
    ImplicitPrimingTest : 26,
    App: 30,
    Prototype: 31
};

const neuroQuestions = [
    QUESTIONTYPE.App,
    QUESTIONTYPE.EyeTrackingWebsite,
    QUESTIONTYPE.Prototype
];

export {
    QUESTITEMTYPE as questItemType,
    QUESTIONTYPE as questionType,
    neuroQuestions
};