import React, { Component } from 'react';
import { Storages } from '../../storage/data-storage-helper'


import StyleService from '../../utils/style-service'

class _BaseComponent extends Component {

  constructor(props) {
    super(props)
  }

  get isTrialExpired() {
      return this.props.surveyCount > 0 && this.props.isRespondent
  }


  getStyle() {
      if (this.props.viewMode === 'landscape') {
        return {...this.baseStyles, ...this.landscapeStyles};
      } else {
        return this.baseStyles;
      }
  }

  scale(size) {
    return StyleService.scale(size)
  }

  verticalScale(size) {
    return StyleService.verticalScale(size)
  }

  moderateScale(size) {
    return size
  }


  init(baseStyles, landscapeStyles) {
      this.baseStyles = baseStyles
      this.landscapeStyles = landscapeStyles
  }
}

export { _BaseComponent as BaseComponent }