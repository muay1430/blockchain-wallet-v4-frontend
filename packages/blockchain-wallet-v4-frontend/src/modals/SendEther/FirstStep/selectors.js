import { prop } from 'ramda'
import { selectors } from 'data'

export const getData = state => {
  const paymentR = selectors.components.sendEth.getPayment(state)

  const transform = payment => {
    const effectiveBalance = prop('effectiveBalance', payment) || '0'
    const unconfirmedTx = prop('unconfirmedTx', payment)
    const fee = prop('fee', payment) || '0'

    return {
      effectiveBalance,
      unconfirmedTx,
      fee
    }
  }

  return paymentR.map(transform)
}
