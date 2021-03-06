import React from 'react'
import styled from 'styled-components'

import TotalBalance from './TotalBalance'
import BitcoinBalance from './BitcoinBalance'
import EtherBalance from './EtherBalance'
import BchBalance from './BchBalance'

import { FormattedMessage } from 'react-intl'
import { ComponentDropdown, Text } from 'blockchain-info-components'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: relative;

  @media(min-width: 850px) { align-items: flex-end; }
`
const BalanceText = styled(Text)`
  font-size: 20px;
  @media(min-width: 768) {
    font-size: 16px;
  }
`

const BalanceDropdown = styled.div`
  margin-top: 4px;
  > div > ul {
    top: -6px;
    right: 0px;
    padding: 0;
    padding-top: 5px;
    position: absolute;
    background: transparent;
    > li {
      padding: 0px 6px;
      text-align: right;
      background: ${props => props.theme['white']};
      &:first-child {
        margin-bottom: 3px;
        padding-right: 12px;
        background: white;
        > div > span:first-child {
          color: ${props => `${props.theme['gray-5']}`};
        }
      }
      &:last-child {
        padding-bottom: 2px;
      }
    }
  }
  > div > div > div > div > span:first-child {
    color: ${props => `${props.theme['gray-5']}`};
  }
  > div > div > span:last-child {
    top: 1px;
    right: 10px;
    font-size: 11px;
    font-weight: 600;
    position: relative;
  }
`

const Success = props => {
  const { btcContext, ethContext, bchContext, path } = props

  const getComponentOrder = () => {
    switch (path) {
      case '/btc/transactions': return [<BitcoinBalance large context={btcContext} />, <EtherBalance context={ethContext} />, <BchBalance context={bchContext} />, <TotalBalance />]
      case '/eth/transactions': return [<EtherBalance large context={ethContext} />, <BitcoinBalance context={btcContext} />, <BchBalance context={bchContext} />, <TotalBalance />]
      case '/bch/transactions': return [<BchBalance large context={bchContext} />, <BitcoinBalance context={btcContext} />, <EtherBalance context={ethContext} />, <TotalBalance />]
      default: return [<TotalBalance large />, <BitcoinBalance context={btcContext} />, <EtherBalance context={ethContext} />, <BchBalance context={bchContext} />]
    }
  }

  const getBalanceMessage = () => {
    switch (path) {
      case '/btc/transactions': return <FormattedMessage id='scenes.wallet.menutop.balance.bitcoinbalance' defaultMessage='Bitcoin Balance' />
      case '/eth/transactions': return <FormattedMessage id='scenes.wallet.menutop.balance.etherbalance' defaultMessage='Ether Balance' />
      case '/bch/transactions': return <FormattedMessage id='scenes.wallet.menutop.balance.bchbalance' defaultMessage='Bitcoin Cash Balance' />
      default: return <FormattedMessage id='scenes.wallet.menutop.balance.totalbalance' defaultMessage='Total Balance' />
    }
  }

  return (
    <Wrapper>
      <BalanceText weight={300}>
        {getBalanceMessage()}
      </BalanceText>
      <BalanceDropdown>
        <ComponentDropdown
          down
          forceSelected
          color={'gray-5'}
          selectedComponent={getComponentOrder()[0]}
          components={getComponentOrder()}
          callback={() => {}} />
      </BalanceDropdown>
    </Wrapper>
  )
}

export default Success
