import React, {Component} from 'react'
import { Header, Title, Button, Left, Right, Body, Icon } from 'native-base'
import { StatusBar } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'

import NavService from '../../utils/navigation-service'
import StyleService from '../../utils/style-service'

@observer
export default class Navigation extends Component {
    // getStyle(){
    //     let baseStyles = styles
    //     if (StyleService.viewMode === 'landscape') {
    //       return {...baseStyles, ...landscapeStyles};
    //     } else {
    //       return baseStyles;
    //     }
    // }
    // constructor() {
    //     observe(this.permissionsService, change => {

    //     })
    // }

    backBtnRender() {
        return <Button
                transparent
                onPress={() => NavService.back()}
                >
                <Icon name='arrow-back' />
            </Button>
    }

    render() {
        let {heading, left, right, back, headerSticky, bgColor} = this.props
        let transparent = NavService.androidStatusBarTransparent
        let androidStatusBarColor = transparent ? 'transparent' : NavService.androidStatusBarColor
        let renderBack = back && NavService.instance.canBack ? this.backBtnRender() : null
        let renderLeft = left || null
        let headingStyle = headerSticky ? -15 : 0
        let statusBarColor = bgColor //androidStatusBarColor={androidStatusBarColor} transparent={transparent}
        return <Header style={[styles.header, { backgroundColor: statusBarColor }]} noShadow={true}>
            {/* <StatusBar translucent={transparent}/> */}
            <Left style={styles.element}>
                {renderLeft || renderBack}
            </Left>
            <Body style={[styles.element, { justifyContent: 'center', alignItems: 'center', top: headingStyle }, right ? {flex: 2} : {flex: 4}]}>
                <Title style={styles.heading}>{heading}</Title>
            </Body>
            <Right style={styles.element}>
                {right}
            </Right>
        </Header>
    }
}

Navigation.propTypes = {
    // bgColor: PropTypes.string,
    heading: PropTypes.string,
    right: PropTypes.element,
    back: PropTypes.bool,
    headerSticky: PropTypes.bool
}

Navigation.defaultProps = {
    back: true
}

const styles = EStyleSheet.create({
    // $outline: 1,
    element: {
        flex: 1
    },
    heading: {
        fontSize: '$fontSize',
        fontFamily: '$proximaSB'
    }
})

const landscapeStyles = {
    header: {
        // paddingLeft: 20,
        // paddingRight: 20,
        // height: 40
    }
}