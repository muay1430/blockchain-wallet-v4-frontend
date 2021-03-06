import React from 'react'
import { FormattedMessage } from 'react-intl'
import styled from 'styled-components'
import { Field, reduxForm } from 'redux-form'

import Helper from 'components/BuySell/FAQ'
import { CheckBox } from 'components/Form'
import Terms from 'components/Terms'
import { Button, HeartbeatLoader, Text, TextGroup, Link } from 'blockchain-info-components'
import { Form, ColLeft, ColRight, InputWrapper, PartnerHeader, PartnerSubHeader, ButtonWrapper, ErrorWrapper, ColRightInner } from 'components/BuySell/Signup'

const AcceptTermsContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 25px;
  font-size: 12px;
  a {
    color: ${props => props.theme['brand-secondary']};
    text-decoration: none;
  }
`

const AcceptTerms = (props) => {
  const { busy, email, invalid, onSubmit, signupError, updateUI } = props

  const checkboxShouldBeChecked = value => value ? undefined : 'You must agree to the terms and conditions'

  const helpers = [
    {
      question: <FormattedMessage id='coinifysignup.create.helper1.question' defaultMessage='What is Coinify?' />,
      answer: <FormattedMessage id='coinifysignup.create.helper1.answer' defaultMessage='Answer placeholder' />
    }
  ]

  const faqHelper = () => helpers.map((el, i) => <Helper key={i} question={el.question} answer={el.answer} />)

  return (
    <Form onSubmit={onSubmit}>
      <ColLeft>
        <InputWrapper>
          <PartnerHeader>
            <FormattedMessage id='coinifyexchangedata.create.verifyemail.partner.header.create_your_account' defaultMessage='Create Your Account' />
          </PartnerHeader>
          <PartnerSubHeader>
            <FormattedMessage id='coinifyexchangedata.create.accept.partner.header.enter_email_code' defaultMessage='We teamed up with Coinify’s exchange platform to offer buy and sell to our customers in Europe. We just sent a verification code to your {email} email address.' values={{ email: email }} />
          </PartnerSubHeader>
          <AcceptTermsContainer>
            <Field name='terms' validate={[checkboxShouldBeChecked]} component={CheckBox}>
              <Terms company='coinify' />
            </Field>
          </AcceptTermsContainer>
        </InputWrapper>
      </ColLeft>
      <ColRight>
        <ColRightInner>
          <ButtonWrapper>
            <Button uppercase type='submit' nature='primary' fullwidth disabled={invalid || busy || signupError}>
              {
                !busy
                  ? <span>Continue</span>
                  : <HeartbeatLoader height='20px' width='20px' color='white' />
              }
            </Button>
          </ButtonWrapper>
          <ErrorWrapper>
            {
              signupError && <TextGroup inline>
                <Text size='12px' color='error' weight={300}>
                  <FormattedMessage id='coinifyexchangedata.create.accept.error' defaultMessage='Unfortunately this email is being used for another account.' />
                </Text>
                <Link size='12px' weight={300} onClick={() => updateUI({ create: 'change_email' })}>
                  <FormattedMessage id='clickhere' defaultMessage='Click here' />
                </Link>
                <Text size='12px' color='error' weight={300}>
                  <FormattedMessage id='clickhere' defaultMessage='to change it.' />
                </Text>
              </TextGroup>
            }
          </ErrorWrapper>
          {faqHelper()}
        </ColRightInner>
      </ColRight>
    </Form>
  )
}

export default reduxForm({ form: 'coinifyAcceptTerms' })(AcceptTerms)
