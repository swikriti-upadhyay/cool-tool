export default class CommonHelper {
    static groupBy(array, prop) {
        return array.reduce(function(groups, item) {
            const val = item[prop]
            groups[val] = groups[val] || []
            groups[val].push(item)
            return groups
        }, {})
    }

    static getIndexesByValues(array, propNames, propValues) {
        let isUndefined = !array || !propNames || !propValues
        if (isUndefined)
            return []
        let notArray = array.constructor !== Array, 
            isArrayOfProps = propNames.constructor === Array,
            propsNotComparable = isArrayOfProps && propNames.constructor !== propValues.constructor,
            diffLength = isArrayOfProps && propNames.length < 1 && propNames.length !== propValues.length

        if (notArray || propsNotComparable || diffLength)
            return []

        let foundIndexes = []
        for (let i = 0; i < array.length; i++) {
            let currentItem = array[i]
            let isEqual = true
            if (isArrayOfProps) {
                for (let c = 0; c < propNames.length; c++) {
                    if (currentItem[propNames[c]] !== propValues[c]) {
                        isEqual = false
                        break
                    }
                }
            } else {
                isEqual = currentItem[propNames] === propValues
            }
            
            if (isEqual)
                foundIndexes.push(i)
        }
        return foundIndexes
    }

    static replaceBRwithNewLine(text) {
        return CommonHelper.removeAllTags(text.replace(/<br\s*[\/]?>/gm, "\n"));
    }

    static replaceNewLineWithBr(text) {
        return text.replace(/(?:\r\n|\r|\n)/g, '<br>');
    }

    static removeAllTags(text) {
        return text.replace(/<\/?[^>]+(>|$)/g, "");
    }

    static getFirstIndexByValue(array, propNames, propValues) {
        const res = CommonHelper.getIndexesByValues(array, propNames, propValues)
        if (res.length > 0)
            return res[0]
        return null
    }

    static convertObjectToUri(object) {
        let uri = [];
        for (var property in object) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(object[property]);
            uri.push(encodedKey + "=" + encodedValue);
        }
        uri = uri.join("&");
        return uri
    }

    static demoVideo(respondentId, qid, url) {
        let date = new Date()
        let id = respondentId
        let respondent = {
            _id: id.toString(),
            ct_id: qid,
            status: 1, // completed
            areDataUploaded: true,
            areAnswersUploaded: true,
            surveyCode: "",
            projectName: "UXReality demo recording",
            isOwnProject: true,
            result: "",
            responseStartDate: date,
            responseEndDate: date,
            resultVideoUrl: url,
            hasNeuroQuestions: true
        }
        return respondent
    }

    static getAppNameFromObj(obj) {
        let app = {};
        try {
            app = JSON.parse(obj)
        } catch(e) {
        }
        return app
    }

    static debounce(callback, wait, context = this) {
        let timeout = null;
        let callbackArgs = null;
      
        const later = () => callback.apply(context, callbackArgs);
      
        return function() {
          callbackArgs = arguments;
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
        };
    }

    /**
     * Get an application id from url
     * @param stringUrl A App url from Google Play, to be converted.
     */
    static getAppIdFromString(stringUrl) {
        let result = '';
        let index = stringUrl.indexOf('?id=');
        if (index > -1)
            result = stringUrl.substring( stringUrl.indexOf('?id=') + 4 );
        return result.split('&')[0]
    }

    static getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }
}