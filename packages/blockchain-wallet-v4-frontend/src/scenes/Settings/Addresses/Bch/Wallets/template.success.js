import React from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'
import { filter, take } from 'ramda'
import SwitchableDisplay from 'components/Display/SwitchableDisplay'
import { SettingDescription, SettingHeader } from 'components/Setting'
import { Banner, ComponentDropdown, Link, Table, TableHeader, TableCell, TableRow, Text } from 'blockchain-info-components'

const Wrapper = styled.section`
  box-sizing: border-box;
`
const BchWalletsAddressesSettingHeader = SettingHeader.extend`
  justify-content: flex-start;
`
const WalletTableCell = styled(TableCell)`
  align-items: center;
  min-height: 23px;
`
const ClickableText = styled(Text)`
  cursor: pointer;
`
const LabelCell = styled(Text)`
  margin-right: 6px;
`

const Manage = () => (
  <Link weight={200} size='small'>
    <FormattedMessage id='scenes.settings.addresses.manage' defaultMessage='Manage Wallet' />
  </Link>
)

const OptionItem = ({ id, text, onClick }) => (
  <ClickableText size='small' onClick={onClick}>
    <FormattedMessage id={id} defaultMessage={text} />
  </ClickableText>
)

const Success = (props) => {
  const { bchAccounts, wallets, defaultIndex } = props.data
  const { onEditBchAccountLabel, onMakeDefault, onSetArchived, onShowXPub, search } = props

  const isMatch = (wallet) => !search || wallet.label.toLowerCase().indexOf(search) > -1

  const walletTableRows = filter(isMatch, take(bchAccounts.length, wallets)).map((wallet, i) => {
    const isDefault = i === defaultIndex
    const isArchived = bchAccounts[i].archived

    return (
      <TableRow key={i}>
        <WalletTableCell width='50%'>
          <LabelCell size='13px'>{wallet.label}</LabelCell>
          {isDefault && <Banner label><FormattedMessage id='scenes.settings.addresses.bch.default_label' defaultMessage='Default' /></Banner>}
          {isArchived && <Banner label type='informational'><FormattedMessage id='scenes.settings.bch.addresses.archived_label' defaultMessage='Archived' /></Banner>}
        </WalletTableCell>
        <TableCell width='30%'>
          {!isArchived && <SwitchableDisplay size='13px' coin='BCH'>{wallet.value.balance}</SwitchableDisplay>}
        </TableCell>
        <TableCell width='20%' style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <ComponentDropdown
            down
            forceSelected
            color={'gray-5'}
            selectedComponent={<Manage />}
            components={[
              <OptionItem id='scenes.settings.addresses.bch.edit_name' text='Edit Wallet Name' onClick={() => onEditBchAccountLabel(wallet.value)} />,
              (!isDefault && !isArchived && <OptionItem id='scenes.settings.addresses.bch.make_default' text='Make Default' onClick={() => onMakeDefault(wallet.value)} />),
              (!isDefault &&
                (isArchived
                  ? <OptionItem id='scenes.settings.addresses.bch.unarchive' text='Unarchive' onClick={() => onSetArchived(wallet.value, false)} />
                  : <OptionItem id='scenes.settings.addresses.bch.archive' text='Archive' onClick={() => onSetArchived(wallet.value, true)} />)),
              (!isArchived && <OptionItem id='scenes.settings.addresses.bch.show_xpub' text='Show xPub' onClick={() => onShowXPub(wallet.value)} />)
            ].filter(x => x)} />
        </TableCell>
      </TableRow>
    )
  })

  return (
    <Wrapper>
      <BchWalletsAddressesSettingHeader>
        <FormattedMessage id='scenes.settings.addresses.bch_wallets' defaultMessage='Bitcoin Cash Wallets' />
      </BchWalletsAddressesSettingHeader>
      <SettingDescription>
        <FormattedMessage id='scenes.settings.addresses.bch_wallets_description' defaultMessage='Wallets allow you to organize your funds into categories, like spending or savings. To see all of the individual addresses that have been generated for each wallet, click on ‘Manage‘.' />
      </SettingDescription>
      <Table>
        <TableHeader>
          <TableCell width='50%'>
            <Text size='13px' weight={500}>
              <FormattedMessage id='scenes.settings.addresses.bch.wallet_name' defaultMessage='Wallet Name' />
            </Text>
          </TableCell>
          <TableCell width='30%'>
            <Text size='13px' weight={500}>
              <FormattedMessage id='scenes.settings.addresses.bch.wallet_balance' defaultMessage='Balance' />
            </Text>
          </TableCell>
          <TableCell width='20%' style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Text size='13px' weight={500}>
              <FormattedMessage id='scenes.settings.imported_addresses.bch.wallet_actions' defaultMessage='Actions' />
            </Text>
          </TableCell>
        </TableHeader>
        {walletTableRows}
      </Table>
    </Wrapper>
  )
}

export default Success
