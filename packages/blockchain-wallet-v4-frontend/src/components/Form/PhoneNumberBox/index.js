import React from 'react'
import styled from 'styled-components'

import IntlTelInput from 'react-intl-tel-input'
import 'react-intl-tel-input/dist/libphonenumber.js'
import 'react-intl-tel-input/dist/main.css'

const Container = styled.div`
  > div {
    width: 100%;
  }
  .iti-arrow {
    right: -8px;
  }
  input {
    width: 100%;
    height: 40px;
    font-size: 14px;
    ::-webkit-input-placeholder {
      opacity: .35;
    }
    ::-moz-placeholder {
      opacity: .35;
    }
  }
  * {
    color: ${props => props.theme['gray-5']};
    font-family: 'Montserrat', sans-serif;
    font-weight: 300;
  }
`

const PhoneNumberBox = (field) => {
  const handler = (status, value, countryData, number, id) => {
    field.input.onChange(number)
  }
  const countryCode = field.countryCode && field.countryCode.data.toLowerCase()

  return (
    <Container>
      <IntlTelInput defaultValue={field.defaultValue || ''} onPhoneNumberChange={handler} format defaultCountry={countryCode} preferredCountries={['us', 'gb']} css={['intl-tel-input', 'form-control']} utilsScript={'libphonenumber.js'} />
    </Container>
  )
}

export default PhoneNumberBox
