import React from 'react'
import { FormattedMessage } from 'react-intl'

import { Text } from 'blockchain-info-components'

const selectStyle = status => {
  switch (status) {
    case 'processing': return { color: 'transferred' }
    case 'completed': return { color: 'success' }
    case 'rejected': return { color: 'error' }
    case 'failed': return { color: 'error' }
  }
}

// completed, rejected, failed, processing

const renderStatus = (status, isBuy) => {
  switch (status) {
    case 'processing': return isBuy ? <FormattedMessage id='scenes.buysellorderhistory.list.orderstatus.processingbuy' defaultMessage='Pending Buy' /> : <FormattedMessage id='scenes.buysellorderhistory.list.orderstatus.processingsell' defaultMessage='Pending Sell' />
    case 'completed': return isBuy ? <FormattedMessage id='scenes.buysellorderhistory.list.orderstatus.completedbuy' defaultMessage='Completed Buy' /> : <FormattedMessage id='scenes.buysellorderhistory.list.orderstatus.completedsell' defaultMessage='Completed Sell' />
    case 'rejected': return <FormattedMessage id='scenes.buysellorderhistory.list.orderstatus.rejected' defaultMessage='Rejected' />
    case 'failed': return <FormattedMessage id='scenes.buysellorderhistory.list.orderstatus.failed' defaultMessage='Failed' />
    default: return <FormattedMessage id='scenes.buysellorderhistory.list.orderstatus.unknown' defaultMessage='Unknown' />
  }
}

const OrderStatus = props => {
  const { status, isBuy } = props
  const style = selectStyle(status)

  return (
    <Text size='13px' weight={300} {...style}>
      {renderStatus(status, isBuy)}
    </Text>
  )
}

export default OrderStatus