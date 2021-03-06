import { call, put, select } from 'redux-saga/effects'
import { equals, filter, identity, head, lift, path, prop, propEq } from 'ramda'
import * as selectors from '../../selectors'
import * as actions from '../../actions'
import settings from 'config'
import { getPairFromCoin, convertFiatToCoin, convertCoinToFiat, isUndefinedOrEqualsToZero } from './services'
import { selectRates } from '../utils/sagas'

export default ({ api, coreSagas }) => {
  const logLocation = 'components/exchange/sagas.utils'

  const calculateEffectiveBalance = function * (source) {
    const coin = prop('coin', source)
    const address = prop('address', source)
    let payment
    switch (coin) {
      case 'BCH':
        payment = yield coreSagas.payment.bch.create({ network: settings.NETWORK_BCH }).chain().init().fee('priority').from(address).done()
        break
      case 'BTC':
        payment = yield coreSagas.payment.btc.create({ network: settings.NETWORK_BITCOIN }).chain().init().fee('priority').from(address).done()
        break
      case 'ETH':
        payment = yield coreSagas.payment.eth.create({ network: settings.NETWORK_ETHEREUM }).chain().init().from(address).done()
        break
      default:
        yield put(actions.logs.logErrorMessage(logLocation, 'calculateEffectiveBalance', 'Could not get effective balance.'))
        throw new Error('Could not get effective balance.')
    }
    return prop('effectiveBalance', payment.value())
  }

  const createPayment = function * (coin, sourceAddress, targetAddress, amount) {
    let payment
    switch (coin) {
      case 'BCH':
        payment = coreSagas.payment.bch.create({ network: settings.NETWORK_BCH }).chain().init().fee('priority').amount(parseInt(amount))
        break
      case 'BTC':
        payment = coreSagas.payment.btc.create({ network: settings.NETWORK_BITCOIN }).chain().init().fee('priority').amount(parseInt(amount))
        break
      case 'ETH':
        payment = coreSagas.payment.eth.create({ network: settings.NETWORK_ETHEREUM }).chain().init().amount(amount)
        break
      default:
        yield put(actions.logs.logErrorMessage(logLocation, 'createPayment', 'Could not create payment.'))
        throw new Error('Could not create payment.')
    }
    payment = yield payment.from(sourceAddress).to(targetAddress).build().done()
    yield put(actions.logs.logInfoMessage(logLocation, 'createPayment', payment))
    return payment
  }

  const resumePayment = function (coin, payment) {
    switch (coin) {
      case 'BCH': return coreSagas.payment.bch.create({ payment, network: settings.NETWORK_BCH })
      case 'BTC': return coreSagas.payment.btc.create({ payment, network: settings.NETWORK_BITCOIN })
      case 'ETH': return coreSagas.payment.eth.create({ payment, network: settings.NETWORK_ETHEREUM })
      default: throw new Error('Could not resume payment.')
    }
  }

  const getShapeShiftLimits = function * (source, target) {
    const coinSource = prop('coin', source)
    const coinTarget = prop('coin', target)
    const pair = getPairFromCoin(coinSource, coinTarget)
    const shapeshiftPairR = yield select(selectors.core.data.shapeShift.getPair(pair))
    const shapeshiftPair = shapeshiftPairR.getOrFail('Could not find shapeshift pair.')

    return {
      minimum: prop('minimum', shapeshiftPair),
      maximum: prop('limit', shapeshiftPair)
    }
  }

  const convertValues = function * (type) {
    const currencyR = yield select(selectors.core.settings.getCurrency)
    const currency = currencyR.getOrElse('USD')
    const form = yield select(selectors.form.getFormValues('exchange'))
    const sourceCoin = path(['source', 'coin'], form)
    const targetCoin = path(['target', 'coin'], form)
    const sourceRates = yield call(selectRates, sourceCoin)
    const targetRates = yield call(selectRates, targetCoin)
    const pair = getPairFromCoin(sourceCoin, targetCoin)
    const defaultResult = { sourceAmount: 0, sourceFiat: 0, targetAmount: 0, targetFiat: 0 }

    switch (type) {
      case 'sourceFiat': {
        const sourceFiat = prop('sourceFiat', form)
        if (isUndefinedOrEqualsToZero(sourceFiat)) return defaultResult
        const sourceAmount = convertFiatToCoin(sourceFiat, 'USD', sourceCoin, sourceCoin, sourceRates).value
        const quotation = yield call(api.createQuote, sourceAmount, pair, true)
        const targetAmount = path(['success', 'withdrawalAmount'], quotation) || 0
        const targetFiat = convertCoinToFiat(targetAmount, targetCoin, targetCoin, currency, targetRates).value
        return { sourceAmount, sourceFiat, targetAmount, targetFiat }
      }
      case 'targetAmount': {
        const targetAmount = prop('targetAmount', form)
        if (isUndefinedOrEqualsToZero(targetAmount)) return defaultResult
        const quotation = yield call(api.createQuote, targetAmount, pair, false)
        const sourceAmount = path(['success', 'depositAmount'], quotation) || 0
        const sourceFiat = convertCoinToFiat(sourceAmount, sourceCoin, sourceCoin, currency, sourceRates).value
        const targetFiat = convertCoinToFiat(targetAmount, targetCoin, targetCoin, currency, targetRates).value
        return { sourceAmount, sourceFiat, targetAmount, targetFiat }
      }
      case 'targetFiat': {
        const targetFiat = prop('targetFiat', form)
        if (isUndefinedOrEqualsToZero(targetFiat)) return defaultResult
        const targetAmount = convertFiatToCoin(targetFiat, currency, targetCoin, targetCoin, targetRates).value
        const quotation = yield call(api.createQuote, targetAmount, pair, false)
        const sourceAmount = path(['success', 'depositAmount'], quotation) || 0
        const sourceFiat = convertCoinToFiat(sourceAmount, sourceCoin, sourceCoin, currency, sourceRates).value
        return { sourceAmount, sourceFiat, targetAmount, targetFiat }
      }
      case 'sourceAmount':
      default: {
        const sourceAmount = prop('sourceAmount', form)
        if (isUndefinedOrEqualsToZero(sourceAmount)) return defaultResult
        const quotation = yield call(api.createQuote, sourceAmount, pair, true)
        const targetAmount = path(['success', 'withdrawalAmount'], quotation) || 0
        const sourceFiat = convertCoinToFiat(sourceAmount, sourceCoin, sourceCoin, currency, sourceRates).value
        const targetFiat = convertCoinToFiat(targetAmount, targetCoin, targetCoin, currency, targetRates).value
        return { sourceAmount, sourceFiat, targetAmount, targetFiat }
      }
    }
  }

  const getDefaultBtcAccountValue = function * () {
    const btcAccounts = yield call(getActiveBtcAccounts)
    return head(btcAccounts.getOrFail('Could not get BTC HD accounts.'))
  }

  const getDefaultEthAccountValue = function * () {
    const ethAccounts = yield call(getActiveEthAccounts)
    return head(ethAccounts.getOrFail('Could not get ETH accounts.'))
  }

  const getActiveBtcAccounts = function * () {
    const btcAccounts = yield call(getBtcAccounts)
    return btcAccounts.map(filter(propEq('archived', false)))
  }

  const getBtcAccounts = function * () {
    const btcAccounts = yield select(selectors.core.wallet.getHDAccounts)
    const btcData = yield select(selectors.core.data.bitcoin.getAddresses)

    const transform = (btcData) => {
      return btcAccounts.map(acc => ({
        archived: prop('archived', acc),
        coin: 'BTC',
        label: prop('label', acc) || prop('xpub', acc),
        address: prop('index', acc),
        balance: prop('final_balance', prop(prop('xpub', acc), btcData))
      }))
    }

    return lift(transform)(btcData)
  }

  const getActiveEthAccounts = function * () {
    const ethAccounts = yield call(getEthAccounts)
    return ethAccounts.map(filter(propEq('archived', false)))
  }

  const getEthAccounts = function * () {
    const ethData = yield select(selectors.core.data.ethereum.getAddresses)
    const ethMetadata = yield select(selectors.core.kvStore.ethereum.getAccounts)
    const transform = (ethData, ethMetadata) => ethMetadata.map(acc => {
      const data = prop(prop('addr', acc), ethData)

      return {
        archived: prop('archived', acc),
        coin: 'ETH',
        label: prop('label', acc) || prop('addr', acc),
        address: prop('addr', acc),
        balance: prop('balance', data)
      }
    })

    return lift(transform)(ethData, ethMetadata)
  }

  const selectOtherAccount = function * (coin) {
    if (equals('BTC', coin)) {
      return yield call(getDefaultEthAccountValue)
    } else {
      return yield call(getDefaultBtcAccountValue)
    }
  }

  const selectLabel = function * (coin, value) {
    const appState = yield select(identity)
    switch (coin) {
      case 'BTC': return selectors.core.wallet.getAccountLabel(appState)(value) ||
                         selectors.core.wallet.getLegacyAddressLabel(appState)(value)
      case 'BCH': return selectors.core.kvStore.bch.getAccountLabel(appState)(value).getOrElse(value)
      case 'ETH': return selectors.core.kvStore.ethereum.getAccountLabel(appState, value).getOrElse(value)
      default: return value
    }
  }

  const resetForm = function * () {
    yield put(actions.form.change2('exchange', 'sourceAmount', ''))
    yield put(actions.form.change2('exchange', 'sourceFiat', ''))
    yield put(actions.form.change2('exchange', 'targetAmount', ''))
    yield put(actions.form.change2('exchange', 'targetFiat', ''))
  }

  return {
    calculateEffectiveBalance,
    createPayment,
    resumePayment,
    getShapeShiftLimits,
    convertValues,
    getDefaultBtcAccountValue,
    getDefaultEthAccountValue,
    getBtcAccounts,
    getEthAccounts,
    selectLabel,
    selectOtherAccount,
    resetForm
  }
}
