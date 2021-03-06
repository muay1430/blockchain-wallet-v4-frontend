import React from 'react'
import { actions } from 'data'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { getData } from './selectors'
import Success from './template.success'
import { Remote } from 'blockchain-wallet-v4/src'
import { formValueSelector } from 'redux-form'

class BitcoinWalletsContainer extends React.Component {
  shouldComponentUpdate (nextProps) {
    return !Remote.Loading.is(nextProps.data)
  }

  render () {
    const { search, data, ...rest } = this.props

    return (
      data.cata({
        Success: (value) => (
          <Success
            wallets={value}
            search={search && search.toLowerCase()}
            onUnarchive={(i) => this.props.coreActions.setAccountArchived(i, false)}
            handleClick={() => this.props.actions.showModal('AddBitcoinWallet', { wallets: value })}
            {...rest}
          />
        ),
        Failure: (message) => <div>{message}</div>,
        Loading: () => <div />,
        NotAsked: () => <div />
      })
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions.modals, dispatch),
  coreActions: bindActionCreators(actions.core.wallet, dispatch)
})

const mapStateToProps = (state) => ({
  data: getData(state),
  search: formValueSelector('settingsAddresses')(state, 'search')
})

export default connect(mapStateToProps, mapDispatchToProps)(BitcoinWalletsContainer)
