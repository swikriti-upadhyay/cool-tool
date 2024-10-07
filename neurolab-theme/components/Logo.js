import variable from '../variables/custom'

export default (variables /*: * */ = variable) => {
    const LogoTheme = {
        imageWrap: {
            alignItems:'center',
            justifyContent: 'center'
        },
        logo: {
            width: 225,
            height: 80,
            resizeMode: 'contain'
        },
    };
    return LogoTheme;
  };