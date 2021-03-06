import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, compose } from 'redux'

import { actions } from 'data'
import modalEnhancer from 'providers/ModalEnhancer'
import ShowUsedAddresses from './template.js'

class ShowUsedAddressesContainer extends React.PureComponent {
  constructor (props) {
    super(props)
    this.handleContinue = this.handleContinue.bind(this)
  }

  handleContinue () {
    this.props.actions.toggleUsedAddresses(this.props.walletIndex, true)
  }

  render () {
    return (
      <ShowUsedAddresses {...this.props} handleContinue={this.handleContinue} />
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  modalActions: bindActionCreators(actions.modals, dispatch),
  actions: bindActionCreators(actions.components.usedAddresses, dispatch)
})

const enhance = compose(
  modalEnhancer('ShowUsedAddresses'),
  connect(undefined, mapDispatchToProps)
)

export default enhance(ShowUsedAddressesContainer)
