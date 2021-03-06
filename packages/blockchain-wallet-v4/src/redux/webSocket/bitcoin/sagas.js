import { call, put, select } from 'redux-saga/effects'
import { compose } from 'ramda'
import * as A from '../../actions'
import { Wrapper } from '../../../types/index'
import * as walletSelectors from '../../wallet/selectors'
import { Socket } from '../../../network/index'
import * as btcActions from '../../data/bitcoin/actions'

// TO REVIEW
export default ({ api, btcSocket }) => {
  const send = btcSocket.send.bind(btcSocket)

  const onOpen = function * () {
    const subscribeInfo = yield select(walletSelectors.getInitialSocketContext)
    yield call(compose(send, Socket.onOpenMessage), subscribeInfo)
  }

  const dispatchLogoutEvent = function * () {
    yield window.dispatchEvent(new window.Event('wallet.core.logout'))
  }

  const onMessage = function * (action) {
    const message = action.payload

    switch (message.op) {
      case 'on_change':
        const newChecksum = message.x.checksum
        const wrapper = yield select(walletSelectors.getWrapper)
        const oldChecksum = Wrapper.selectPayloadChecksum(wrapper)
        if (oldChecksum !== newChecksum) {
          yield call(refreshWrapper)
          const walletContext = yield select(walletSelectors.getWalletContext)
          yield put(btcActions.fetchData(walletContext))
        }
        break
      case 'utx':
        yield put(A.webSocket.bitcoin.paymentReceived('You\'ve just received a bitcoin payment.'))
        const walletContext = yield select(walletSelectors.getWalletContext)
        yield put(btcActions.fetchData(walletContext))
        yield put(btcActions.fetchTransactions('', true))
        break
      case 'block':
        const newBlock = message.x
        yield put(A.data.bitcoin.setBitcoinLatestBlock(newBlock.blockIndex, newBlock.hash, newBlock.height, newBlock.time))
        break
      case 'pong':
        break
      case 'email_verified':
        yield put(A.settings.setEmailVerified())
        break
      case 'wallet_logout':
        yield call(dispatchLogoutEvent)
        break

      default:
        console.log('unknown type for ', message)
        break
    }
  }

  const onClose = function * (action) {
  }

  const refreshWrapper = function * () {
    const guid = yield select(walletSelectors.getGuid)
    const skey = yield select(walletSelectors.getSharedKey)
    const password = yield select(walletSelectors.getMainPassword)
    try {
      const newWrapper = yield call(api.fetchWallet, guid, skey, undefined, password)
      yield put(A.wallet.refreshWrapper(newWrapper))
    } catch (e) {
      console.log('REFRESH WRAPPER FAILED (WEBSOCKET) :: should dispatch error action ?')
    }
  }

  return {
    onOpen,
    onMessage,
    onClose
  }
}
