import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { actions } from 'data'
import Settings from './template.js'

class SettingContainer extends Component {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.state = { show2FAWarning: false }
  }

  handleClick () {
    const { smsNumber, smsVerified, authType, modalActions } = this.props

    if (!smsVerified && smsNumber) {
      modalActions.showModal('MobileNumberVerify', { mobileNumber: smsNumber })
    } else if (authType === 5) {
      this.setState({ show2FAWarning: true })
    } else {
      modalActions.showModal('MobileNumberChange')
    }
  }

  render () {
    return <Settings
      {...this.props}
      handleClick={this.handleClick}
      showWarning={this.state.show2FAWarning}
      resetWarning={() => this.setState({ show2FAWarning: false })}
    />
  }
}

const mapDispatchToProps = (dispatch) => ({
  modalActions: bindActionCreators(actions.modals, dispatch)
})

export default connect(null, mapDispatchToProps)(SettingContainer)
