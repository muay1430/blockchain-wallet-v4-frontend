import React from 'react'
import { Redirect, Switch } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'

import ConnectedIntlProvider from 'providers/ConnectedIntlProvider'
import ThemeProvider from 'providers/ThemeProvider'
import PublicLayout from 'layouts/Public'
import WalletLayout from 'layouts/Wallet'
import AuthorizeLogin from './AuthorizeLogin'
import BuySell from './BuySell'
import Exchange from './Exchange'
import ExchangeHistory from './ExchangeHistory'
import Goals from './Goals'
import Help from './Help'
import Home from './Home'
import Login from './Login'
import Open from './Open'
import Recover from './Recover'
import Reminder from './Reminder'
import Reset2FA from './Reset2FA'
import Reset2FAToken from './Reset2FAToken'
import VerifyEmailToken from './VerifyEmailToken'
import Register from './Register'
import SecurityCenter from './SecurityCenter'
import Addresses from './Settings/Addresses/Btc'
import BchAddresses from './Settings/Addresses/Bch'
import BtcManageAddresses from './Settings/Addresses/Btc/ManageAddresses'
import Info from './Settings/Info'
import Preferences from './Settings/Preferences'
import Security from './Settings/Security'
import BitcoinTransactions from './Transactions/Bitcoin'
import EtherTransactions from './Transactions/Ether'
import BchTransactions from './Transactions/Bch'

class App extends React.PureComponent {
  render () {
    const { store, history, messages } = this.props

    return (
      <Provider store={store}>
        <ConnectedIntlProvider messages={messages}>
          <ThemeProvider>
            <ConnectedRouter history={history}>
              <Switch>
                <PublicLayout path='/a/:payload' component={Goals} />
                <PublicLayout path='/login' component={Login} />
                <PublicLayout path='/help' component={Help} />
                <PublicLayout path='/open' component={Open} />
                <PublicLayout path='/recover' component={Recover} />
                <PublicLayout path='/reminder' component={Reminder} />
                <PublicLayout path='/reset2fa' component={Reset2FA} />
                <PublicLayout path='/reset2fa-token' component={Reset2FAToken} />
                <PublicLayout path='/verify-email-token' component={VerifyEmailToken} />
                <PublicLayout path='/signup' component={Register} />
                <PublicLayout path='/authorize-approve' component={AuthorizeLogin} />
                <WalletLayout path='/home' component={Home} />
                <WalletLayout path='/btc/transactions' component={BitcoinTransactions} />
                <WalletLayout path='/eth/transactions' component={EtherTransactions} />
                <WalletLayout path='/buy-sell' component={BuySell} />
                <WalletLayout path='/bch/transactions' component={BchTransactions} />
                <WalletLayout path='/exchange/history' component={ExchangeHistory} />
                <WalletLayout path='/exchange' component={Exchange} exact />
                <WalletLayout path='/security-center' component={SecurityCenter} />
                <WalletLayout path='/settings/preferences' component={Preferences} />
                <WalletLayout path='/settings/security' component={Security} />
                <WalletLayout path='/settings/addresses/btc/:index' component={BtcManageAddresses} />
                <WalletLayout path='/settings/addresses' component={Addresses} exact />
                <WalletLayout path='/settings/addresses/bch' component={BchAddresses} />
                <WalletLayout path='/settings/info' component={Info} />
                <Redirect from='/' to='/login' />
              </Switch>
            </ConnectedRouter>
          </ThemeProvider>
        </ConnectedIntlProvider>
      </Provider>
    )
  }
}

export default App
