import { View } from 'react-native'
import { withStyles } from 'react-native-styleman';

const styles = ({}) => ({

})

const validationErrors = {
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
    '9': 'Your face is not evenly illuminated',
    '10': "Take off your glasses, please",
    '51': 'Ensure that camera is focused on your face, not on contrast background behind you'
}

let CameraCallibrationView = ({ styles, isGuest }) => {
    return (
        <View style={styles.content}>
            {renderTitle(styles)}
            <Image source={imgSource} style={styles.image} />
            {renderFooter(styles, isGuest)}
        </View>
    )
}

export default withStyles(styles)(CameraCallibrationView)