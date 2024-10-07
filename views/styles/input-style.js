import EStyleSheet from 'react-native-extended-stylesheet'
export default EStyleSheet.create({
    formField: {
        marginBottom: 10
    },
    labelStyle: {
        color: '$lightColor',
        fontSize: '$fontSize',
        fontWeight: 'normal',
        marginLeft: 0, 
        marginTop: 0,
        // marginBottom: 10
    },
    inputContainerStyle: {
        borderRadius: 10,
        borderColor: '$lightColor',
        borderWidth: 1,
        height: 50
    },
    inputStyle: {
        // textAlign: 'center', //bug: placeholder gone when device rotated
        color: '$lightColor',
        fontSize: '$fontSize',
        paddingLeft: 15,
        paddingRight: 15
    },
    placeholderColor: '$lightColor'
})