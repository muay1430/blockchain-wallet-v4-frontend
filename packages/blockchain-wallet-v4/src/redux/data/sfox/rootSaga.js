import ExchangeDelegate from '../../../exchange/delegate'
import { apply, call, put, select, takeLatest } from 'redux-saga/effects'
import * as buySellSelectors from '../../kvStore/buySell/selectors'
import * as buySellAT from '../../kvStore/buySell/actionTypes'
import * as buySellA from '../../kvStore/buySell/actions'
import SFOX from 'bitcoin-sfox-client'
import * as AT from './actionTypes'
import * as S from './selectors'
import * as A from './actions'
let sfox

export default ({ api } = {}) => {
  const refreshSFOX = function * () {
    const state = yield select()
    const delegate = new ExchangeDelegate(state)
    const value = yield select(buySellSelectors.getMetadata)
    sfox = new SFOX(value.data.value.sfox, delegate)
    sfox.api.production = true
    sfox.api.apiKey = 'f31614a7-5074-49f2-8c2a-bfb8e55de2bd'
  }

  const init = function * () {
    try {
      yield call(refreshSFOX)
    } catch (e) {
      throw new Error(e)
    }
  }

  const fetchProfile = function * () {
    try {
      yield put(A.fetchProfileLoading())
      const profile = yield apply(sfox, sfox.fetchProfile)
      yield put(A.fetchProfileSuccess(profile))
    } catch (e) {
      yield put(A.fetchProfileFailure(e))
    }
  }

  const fetchQuote = function * (data) {
    try {
      yield put(A.fetchQuoteLoading())
      const nextAddress = data.payload.nextAddress
      yield put(A.setNextAddress(nextAddress))
      yield call(refreshSFOX)
      const { amt, baseCurr, quoteCurr } = data.payload.quote
      const quote = yield apply(sfox, sfox.getBuyQuote, [amt, baseCurr, quoteCurr])
      yield put(A.fetchQuoteSuccess(quote))
    } catch (e) {
      yield put(A.fetchQuoteFailure(e))
    }
  }

  const fetchTrades = function * () {
    try {
      yield put(A.fetchTradesLoading())
      const trades = yield apply(sfox, sfox.getTrades)
      yield put(A.fetchTradesSuccess(trades))
    } catch (e) {
      yield put(A.fetchTradesFailure(e))
    }
  }

  const fetchAccounts = function * () {
    try {
      yield put(A.fetchAccountsLoading())
      const methods = yield apply(sfox, sfox.getBuyMethods)
      const accounts = yield apply(sfox, methods.ach.getAccounts)
      yield put(A.fetchAccountsSuccess(accounts))
    } catch (e) {
      yield put(A.fetchAccountsFailure(e))
    }
  }

  const handleTrade = function * (data) {
    try {
      yield put(A.handleTradeLoading())
      const quote = data.payload
      const accounts = yield select(S.getAccounts)
      const methods = yield apply(quote, quote.getPaymentMediums)
      const trade = yield apply(methods.ach, methods.ach.buy, [accounts.data[0]])
      yield put(A.handleTradeSuccess(trade))
      yield call(fetchTrades)
      const trades = yield select(S.getTrades)
      yield put(buySellA.setTradesBuySell(trades.data))
    } catch (e) {
      yield put(A.handleTradeFailure(e))
    }
  }

  const setProfile = function * (data) {
    const { firstName, lastName, middleName, dob, address1, address2, city, ssn, state, zipcode } = data.payload
    yield call(fetchProfile)
    try {
      sfox.profile.firstName = firstName
      sfox.profile.middleName = middleName || ''
      sfox.profile.lastName = lastName
      sfox.profile.dateOfBirth = new Date(dob)
      sfox.profile.setSSN(ssn)
      sfox.profile.setAddress(
        address1,
        address2,
        city,
        state,
        zipcode
      )
      yield apply(sfox.profile, sfox.profile.verify)
      // TODO: try refresh profile here to smooth out btwn steps
      yield put(A.setProfileSuccess())
    } catch (e) {
      console.warn('setProfile core saga', e)
      yield put(A.setProfileFailure(e))
    }
  }

  const uploadDoc = function * (data) {
    const { idType, file } = data.payload
    try {
      const profile = yield select(S.getProfile)
      const sfoxUrl = yield apply(profile.data, profile.data.getSignedURL, [idType, file.name])
      yield call(api.uploadVerificationDocument, sfoxUrl.signed_url, file)
      yield call(fetchProfile)
      yield put(A.uploadSuccess())
    } catch (e) {
      console.warn('uploadDoc core saga', e)
      yield put(A.uploadFailure(e))
    }
  }

  const getBankAccounts = function * (data) {
    const token = data.payload
    try {
      const bankAccounts = yield apply(sfox.bankLink, sfox.bankLink.getAccounts, [token])
      yield put(A.getBankAccountsSuccess(bankAccounts))
    } catch (e) {
      console.warn('getBankAccounts core saga', e)
      yield put(A.getBankAccountsFailure(e))
    }
  }

  const setBankAccount = function * (data) {
    const bank = data.payload
    try {
      yield apply(sfox.bankLink, sfox.bankLink.setAccount, [bank])
      yield call(fetchAccounts)
      yield put(A.setBankAccountSuccess())
    } catch (e) {
      console.warn('setBankAccount core saga', e)
      yield put(A.setBankAccountFailure(e))
    }
  }

  return function * () {
    yield takeLatest(buySellAT.FETCH_METADATA_BUYSELL_SUCCESS, init)
    yield takeLatest(AT.FETCH_ACCOUNTS, fetchAccounts)
    yield takeLatest(AT.FETCH_PROFILE, fetchProfile)
    yield takeLatest(AT.HANDLE_TRADE, handleTrade)
    yield takeLatest(AT.FETCH_TRADES, fetchTrades)
    yield takeLatest(AT.FETCH_QUOTE, fetchQuote)
    yield takeLatest(AT.SET_PROFILE, setProfile)
    yield takeLatest(AT.UPLOAD, uploadDoc)
    yield takeLatest(AT.GET_BANK_ACCOUNTS, getBankAccounts)
    yield takeLatest(AT.SET_BANK_ACCOUNT, setBankAccount)
  }
}