import { Platform } from 'react-native';

export const preferedProfiles = Platform.Version === 23 ? ['QUALITY_480P'] : ['QUALITY_1080P', 'QUALITY_720P', 'QUALITY_HIGH', 'QUALITY_480P'];

export const getProfile = (profiles) => {
    let allProfiles = JSON.parse(profiles)
    let onlySupported = []
    for (let p in allProfiles) {
        if (allProfiles[p] === "true")//TODO
            onlySupported.push(p.toLocaleUpperCase())
    }  

    let profile = ''
    for (let i = 0; i < preferedProfiles.length; i++) {
        if (onlySupported.indexOf(preferedProfiles[i]) >= 0) {
            profile = preferedProfiles[i]
            break
        }
    }

    return profile
}

export const errorsMessage = {
    '1': 'No faces has been detected.',
    '21': 'Face is too dark. Reduce background lights.',
    '22': 'Face is too dark. Try to brighten up your face.',
    '3': 'Face is too bright.',
    '41': 'Your left eye is too dark',
    '42': 'Your right eye is too dark',
    '5': 'Image is blurry. Please, hold your device still.',
    '6': 'Align your face towards the camera.',
    '7': 'Place your head in frame\'s center',
    '81': 'You\'re sitting too far, move closer to the camera.',
    '82': 'You\'re sitting too close, move further from the camera.',
    '9': 'Your face is not evenly illuminated.',
    '51': 'Ensure that camera is focused on your face, not on contrast background behind you',
    '10': 'In glasses, the test result may be distorted.',
}

export const skipErrors = [6, 7, 10]