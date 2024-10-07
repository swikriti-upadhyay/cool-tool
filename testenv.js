jest.mock('react-native-device-info', () => {
    return {
      getModel: jest.fn(),
    };
});

jest.mock("react-native-styleman", () => {
    return {
        withStyles: function(hocConf) {
            return function(component) {
                component.defaultProps = {
                    ...component.defaultProps,
                    $darkColor: 'red',
                    $primaryDarkColor: 'black',
                    styles: hocConf
                };
                return component;
            };
          }
    };
});