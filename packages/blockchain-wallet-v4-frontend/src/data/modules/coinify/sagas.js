import { put, call, select } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import * as A from './actions'
import * as actions from '../../actions'
import * as selectors from '../../selectors.js'
import { merge, path, prop, equals, head } from 'ramda'
import * as service from 'services/CoinifyService'

export default ({ coreSagas }) => {
  const logLocation = 'modules/coinify/sagas'

  const coinifySignup = function * (data) {
    const country = data.payload
    try {
      yield call(coreSagas.data.coinify.signup, country)
      const profile = yield select(selectors.core.data.coinify.getProfile)
      if (!profile.error) {
        yield call(coreSagas.data.coinify.triggerKYC)
        yield put(A.coinifyNextStep('isx'))
      } else {
        yield put(A.coinifySignupFailure(profile.error))
      }
    } catch (e) {
      yield put(actions.logs.logErrorMessage(logLocation, 'coinifySignup', e))
      yield put(actions.alerts.displayError('Failed to create Coinify account.'))
    }
  }

  const coinifySaveMedium = function * (data) {
    const medium = data.payload
    yield put(A.saveMediumSuccess(medium))
  }

  const buy = function * (payload) {
    try {
      const buyTrade = yield call(coreSagas.data.coinify.buy, payload)

      if (!buyTrade) {
        const trade = yield select(selectors.core.data.coinify.getTrade)
        const parsed = JSON.parse(trade.error)

        yield put(A.coinifyFailure(parsed))
        return
      }

      if (buyTrade.medium === 'bank') {
        yield put(A.coinifyNextCheckoutStep('bankTransferDetails'))
      } else {
        yield put(A.coinifyNextCheckoutStep('isx'))
      }
      yield put(A.coinifyNotAsked())
    } catch (e) {
      yield put(actions.logs.logErrorMessage(logLocation, 'buy', e))
    }
  }

  const sell = function * (payload) {
    try {
      const sellTrade = yield call(coreSagas.data.coinify.sell, payload)

      if (!sellTrade) {
        const trade = yield select(selectors.core.data.coinify.getTrade)
        const parsed = JSON.parse(trade.error)

        yield put(A.coinifyFailure(parsed))
        return
      }

      yield put(A.coinifyNotAsked())
      yield put(A.coinifyNextCheckoutStep('isx'))
    } catch (e) {
      yield put(actions.logs.logErrorMessage(logLocation, 'sell', e))
    }
  }

  const initialized = function * () {
    try {
      const level = yield select(selectors.core.data.coinify.getLevel)
      const currencyR = level.map(l => l.currency)

      const initialValues = {
        leftVal: '',
        rightVal: '',
        currency: currencyR.getOrElse('EUR')
      }

      yield put(actions.form.initialize('coinifyCheckout', initialValues))
      yield put(actions.core.data.coinify.fetchRateQuote(currencyR.getOrElse('EUR')))
      yield put(A.coinifyCheckoutBusyOn())
    } catch (e) {
      yield put(actions.logs.logErrorMessage(logLocation, 'initialized', e))
    }
  }

  const handleChange = function * (action) {
    try {
      const form = path(['meta', 'form'], action)
      const field = path(['meta', 'field'], action)
      const payload = prop('payload', action)
      if (!equals('coinifyCheckout', form)) return
      yield put(A.clearCoinifyCheckoutError())
      yield put(A.coinifyCheckoutBusyOn())

      const limits = yield select(selectors.core.data.coinify.getLimits)

      const values = yield select(selectors.form.getFormValues('coinifyCheckout'))

      if (!payload) return null

      switch (field) {
        case 'leftVal':
          const leftLimitsError = service.getLimitsError(payload, limits.data, values.currency)
          if (leftLimitsError) {
            yield put(A.setCoinifyCheckoutError(leftLimitsError))
            return
          }
          const leftResult = yield call(coreSagas.data.coinify.fetchQuote, { quote: { amount: payload * 100, baseCurrency: values.currency, quoteCurrency: 'BTC' } })
          const amount = leftResult.quoteAmount
          yield put(actions.form.initialize('coinifyCheckout', merge(values, { 'rightVal': amount / 1e8 })))
          yield put(A.coinifyCheckoutBusyOff())
          break
        case 'rightVal':
          const rightResult = yield call(coreSagas.data.coinify.fetchQuote, { quote: { amount: Math.round((payload * 1e8) * -1), baseCurrency: 'BTC', quoteCurrency: values.currency } })
          const fiatAmount = Math.abs(rightResult.quoteAmount)

          const rightLimitsError = service.getLimitsError(fiatAmount, limits.data, values.currency)
          if (rightLimitsError) {
            yield put(A.setCoinifyCheckoutError(rightLimitsError))
            yield put(actions.form.initialize('coinifyCheckout', merge(values, { 'leftVal': fiatAmount })))
            return
          }
          yield put(actions.form.initialize('coinifyCheckout', merge(values, { 'leftVal': fiatAmount })))
          yield put(A.coinifyCheckoutBusyOff())
          break
        case 'currency':
          yield put(actions.core.data.coinify.fetchRateQuote(payload))
          yield put(actions.form.initialize('coinifyCheckout', merge(values, { 'leftVal': '', 'rightVal': '' })))
          yield put(A.coinifyCheckoutBusyOn())
          break
      }
    } catch (e) {
      yield put(actions.logs.logErrorMessage(logLocation, 'handleChange', e))
    }
  }

  const setMinMax = function * (action) {
    try {
      yield put(A.coinifyCheckoutBusyOn())
      const values = yield select(selectors.form.getFormValues('coinifyCheckout'))
      const leftResult = yield call(coreSagas.data.coinify.fetchQuote, { quote: { amount: action.payload * 100, baseCurrency: values.currency, quoteCurrency: 'BTC' } })
      yield put(actions.form.initialize('coinifyCheckout', merge(values, { 'leftVal': action.payload, 'rightVal': leftResult.quoteAmount / 1e8 })))
      yield put(A.coinifyCheckoutBusyOff())
      yield put(A.clearCoinifyCheckoutError())
    } catch (e) {
      yield put(actions.logs.logErrorMessage(logLocation, 'setCheckoutMax', e))
    }
  }

  const fromISX = function * (action) {
    const status = action.payload
    try {
      const modals = yield select(selectors.modals.getModals)
      const trade = yield select(selectors.core.data.coinify.getTrade)

      if (path(['type'], head(modals)) === 'CoinifyExchangeData') {
        yield put(A.coinifySignupComplete())
        yield call(delay, 500)
        yield put(actions.modals.closeAllModals())
      } else {
        yield put(actions.form.change('buySellTabStatus', 'status', 'order_history'))
      }

      yield put(A.coinifyNextCheckoutStep('checkout'))
      yield call(coreSagas.data.coinify.getKYCs)
      yield put(actions.modals.showModal('CoinifyTradeDetails', { trade: trade.data, status: status }))
    } catch (e) {
      yield put(actions.logs.logErrorMessage(logLocation, 'fromISX', e))
    }
  }

  const triggerKYC = function * () {
    try {
      yield call(coreSagas.data.coinify.triggerKYC)
      yield put(A.coinifyNextCheckoutStep('isx'))
    } catch (e) {
      yield put(actions.logs.logErrorMessage(logLocation, 'triggerKYC', e))
    }
  }

  const openKYC = function * (data) {
    const kyc = data.payload
    try {
      if (!data.payload) {
        yield call(triggerKYC)
      } else if (kyc.state === 'pending') {
        yield call(coreSagas.data.coinify.kycAsTrade, { kyc })
        yield put(A.coinifyNextCheckoutStep('isx'))
      } else {
        yield call(triggerKYC)
      }
    } catch (e) {
      yield put(actions.logs.logErrorMessage(logLocation, 'openKYC', e))
    }
  }

  const finishTrade = function * (data) {
    const tradeToFinish = data.payload
    try {
      if (tradeToFinish.state === 'awaiting_transfer_in') {
        if (tradeToFinish.medium === 'card') {
          yield call(coreSagas.data.coinify.kycAsTrade, { kyc: tradeToFinish }) // core expects obj key to be 'kyc'
          yield put(A.coinifyNextCheckoutStep('isx'))
        } else if (tradeToFinish.medium === 'bank') {
          yield put(actions.modals.showModal('CoinifyTradeDetails', { trade: tradeToFinish }))
        }
      }
    } catch (e) {
      yield put(actions.logs.logErrorMessage(logLocation, 'finishTrade', e))
    }
  }

  const cancelISX = function * () {
    const modals = yield select(selectors.modals.getModals)
    const trade = yield select(selectors.core.data.coinify.getTrade)

    if (path(['type'], head(modals)) === 'CoinifyExchangeData') {
      yield put(actions.modals.closeAllModals())
    } else if (trade.data.state === 'awaiting_transfer_in') {
      yield put(actions.form.change('buySellTabStatus', 'status', 'order_history'))
      yield put(A.coinifyNextCheckoutStep('checkout'))
    } else {
      yield put(A.coinifyNextCheckoutStep('checkout'))
    }
  }

  const cancelTrade = function * (data) {
    const trade = data.payload
    try {
      yield put(A.setCancelTradeId(trade.id))
      yield put(A.coinifyLoading())
      yield call(coreSagas.data.coinify.cancelTrade, { trade })
      yield put(A.coinifySuccess())
    } catch (e) {
      yield put(actions.logs.logErrorMessage(logLocation, 'cancelTrade', e))
    }
  }

  return {
    handleChange,
    initialized,
    buy,
    sell,
    coinifySaveMedium,
    coinifySignup,
    fromISX,
    triggerKYC,
    openKYC,
    setMinMax,
    cancelISX,
    finishTrade,
    cancelTrade
  }
}
