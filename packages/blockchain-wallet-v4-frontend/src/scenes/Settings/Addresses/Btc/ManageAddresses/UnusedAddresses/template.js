import React from 'react'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'
import { filter } from 'ramda'

import { Banner, Text, Table, TableHeader, TableRow, TableCell, Icon, IconButton, Link, ComponentDropdown } from 'blockchain-info-components'
import OptionItem from '../../OptionItem'

const Fragment = React.Fragment
const WalletLabelCell = styled.div`
  display: flex;
  align-items: center;
`

const MoreOptions = () => (
  <Link weight={200} size='small'>
    <FormattedMessage id='scenes.settings.manage_addresses.more_options' defaultMessage='More Options' />
  </Link>
)

const UnusedAddressesTemplate = ({ account, labels, receiveIndex, isDefault, deriveAddress, onSetLabel, onEditLabel, onDeleteLabel, onEditBtcAccountLabel, onShowXPub, onMakeDefault, onSetArchived, search }) => {
  labels = labels.map(label => { return { index: label.index, label: label.label, address: deriveAddress(label.index) } })
  const isMatch = (label) => !search || label.label.toLowerCase().indexOf(search.toLowerCase()) > -1 || label.address.toLowerCase().indexOf(search.toLowerCase()) > -1
  const addresses = filter(isMatch, labels).map((entry) => {
    return (
      <TableRow key={entry.index}>
        <TableCell width='40%'>
          <Link href={`https://blockchain.info/address/${entry.address}`} size='small' weight={300} target='_blank'>
            {entry.address}
          </Link>
        </TableCell>
        <TableCell width='40%'>
          <Text size='13px'>{entry.label}</Text>
        </TableCell>
        <TableCell style={{ display: 'flex', justifyContent: 'flex-end' }} width='20%'>
          <Icon cursor name='pencil' onClick={() => onEditLabel(entry.index)} style={{ marginRight: 10 }} />
          <Icon cursor name='trash' onClick={() => onDeleteLabel(entry.index)} />
        </TableCell>
      </TableRow>
    )
  })

  return (
    <Fragment>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <WalletLabelCell>
          <Text weight={400} style={{ marginRight: 10 }}>
            {account.label}
          </Text>
          {isDefault && (
            <Banner label>
              <FormattedMessage id='scene.settings.manage_addresses.is_default' defaultMessage='Default' />
            </Banner>
          )}
        </WalletLabelCell>
        <ComponentDropdown
          down
          forceSelected
          color={'gray-5'}
          selectedComponent={<MoreOptions />}
          components={[
            <OptionItem id='scenes.settings.manage_addresses.edit_name' defaultMessage='Edit Name' onClick={onEditBtcAccountLabel} />,
            (!isDefault && <OptionItem id='scenes.settings.manage_addresses.make_default' defaultMessage='Make Default' onClick={onMakeDefault} />),
            (!isDefault && <OptionItem id='scenes.settings.manage_addresses.archive' defaultMessage='Archive' onClick={onSetArchived} />),
            <OptionItem id='scenes.settings.manage_addresses.show_xpub' defaultMessage='Show xPub' onClick={onShowXPub} />
          ].filter(x => x)} />
      </div>
      <Text weight={400} size='14px' style={{ marginTop: 25 }}>
        <FormattedMessage id='scenes.settings.manage_addresses.unused_addresses' defaultMessage='Unused Addresses' />
      </Text>
      <Text weight={200} size='small' style={{ marginTop: 10, marginBottom: 15 }}>
        <FormattedMessage id='scenes.settings.manage_addresses.unused_addresses.message' defaultMessage='Your Blockchain Wallet contains an unlimited collection of bitcoin addresses that you can use to receive funds from anybody, globally. Your wallet will automatically manage your bitcoin addresses for you. The addresses below are the subset of addresses that are labeled.' />
      </Text>
      {labels.length === 0 ? null : (
        <Table>
          <TableHeader>
            <TableCell width='40%'>
              <Text size='13px' weight={500}>
                <FormattedMessage id='scenes.settings.addresses.address' defaultMessage='Address' />
              </Text>
            </TableCell>
            <TableCell width='40%'>
              <Text size='13px' weight={500}>
                <FormattedMessage id='scenes.settings.addresses.address_label' defaultMessage='Label' />
              </Text>
            </TableCell>
            <TableCell width='20%' style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Text size='13px' weight={500}>
                <FormattedMessage id='scenes.settings.addresses.actions_label' defaultMessage='Actions' />
              </Text>
            </TableCell>
          </TableHeader>
          {addresses}
        </Table>
      )}
      {receiveIndex.cata({
        Success: (index) => (
          <IconButton style={{ marginTop: 15 }} name='plus' onClick={() => onSetLabel(index, 'New Address')}>
            <FormattedMessage id='scenes.settings.manage_addresses.add_label' defaultMessage='Add Next Address' />
          </IconButton>
        ),
        Failure: () => null,
        Loading: () => null,
        NotAsked: () => null
      })}
    </Fragment>
  )
}

export default UnusedAddressesTemplate
