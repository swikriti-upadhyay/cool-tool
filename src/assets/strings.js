const strings = {
    onboarding: {
        welcome: {
        heading: 'Welcome',
        text1: "What you don't know is what you haven't learn",
        text2: 'Visit my GitHub at https://github.com/onmyway133',
        button: 'Log in'
        },
        term: {
        heading: 'Terms and conditions',
        button: 'Read'
        }
    },
    survey: {
        task: {
            heading: "Testing task",
            title: "Before starting the test, please read the task carefully",
            no_task: "No tasks",
            // _text: "",
            // set eyeTrackingWebSiteObjective(val) {
            //     this._text = val !== null ? val : this.no_task
            // },
            // get eyeTrackingWebSiteObjective() {
            //     return this._text
            // }
        },
        recommendation: {
            heading: "Recommendation",
            title: "Before starting the test, please read the information carefully",
            _text: "",
            set eyeTrackingWebSiteObjective(val) {
                this._text = `<p class='large'>Testing of this prototype is designed for ${val}.</p><p class='large'>If your smartphone has other screen settings, then the prototype may not be displayed correctly.</p>`
            },
            get eyeTrackingWebSiteObjective() {
                return this._text
            }
        },
        question: {
            _heading_text: "",
            setHeading(num, total) {
                this._heading_text = `Question ${num} of ${total}`
            },
            get heading() {
                return this._heading_text
            }
        }
    }
}

export default strings