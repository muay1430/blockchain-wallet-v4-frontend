import bip39 from 'bip39'
import * as FormHelper from './index.js'

describe('FormHelper', () => {
  beforeEach(() => {
    jest.mock('blockchain-wallet-v4')
    jest.mock('./../ValidationHelper')
  })

  afterEach(() => {
    jest.unmock('blockchain-wallet-v4')
    jest.unmock('./../ValidationHelper')
  })

  describe('required()', () => {
    it('returns correct string if no value passed', () => {
      expect(FormHelper.required(null)).toEqual('Required')
    })

    it('returns undefined if value passed', () => {
      expect(FormHelper.required('test')).toBeUndefined()
    })
  })

  describe('optional()', () => {
    it('returns falsy value', () => {
      expect(FormHelper.optional(FormHelper.validNumber('Not num'))()).toBeFalsy()
    })
  })

  describe('validNumber()', () => {
    it('returns correct string if no valid number is passed', () => {
      expect(FormHelper.validNumber('noNum')).toEqual('Invalid number')
    })

    it('returns undefined if number is passed', () => {
      expect(FormHelper.validNumber(42)).toBeUndefined()
    })
  })

  describe('requiredNumber()', () => {
    it('returns correct string if no value passed', () => {
      expect(FormHelper.requiredNumber(-3)).toEqual('Invalid number')
    })

    it('returns undefined if number is greater than zero', () => {
      expect(FormHelper.requiredNumber(42)).toBeUndefined()
    })
  })

  describe('validEmail()', () => {
    it('returns correct string if invalid email passed', () => {
      expect(FormHelper.validEmail('invalid')).toEqual('Invalid email address')
    })

    it('returns undefined if number is greater than zero', () => {
      expect(FormHelper.validEmail('test@test.com')).toBeUndefined()
    })
  })

  describe('validateMnemonic()', () => {
    it('returns correct string if invalid mnemonic passed', () => {
      expect(FormHelper.validMnemonic('zz')).toEqual('Invalid passphrase')
    })

    it('returns undefined if valid mnemonic given', () => {
      expect(FormHelper.validMnemonic(bip39.generateMnemonic())).toBeUndefined()
    })
  })

  describe('validWalletId()', () => {
    it('returns correct string if invalid walletId passed', () => {
      expect(FormHelper.validWalletId('zz')).toEqual('Invalid wallet identifier')
    })

    it('returns undefined if valid walletId is given', () => {
      expect(FormHelper.validWalletId('7e7db3ea-cd5f-4322-9728-39d9ecef1ee8')).toBeUndefined()
    })
  })

  describe('validMobileNumber()', () => {
    it('returns correct string if invalid phone number passed', () => {
      expect(FormHelper.validMobileNumber(123)).toEqual('Invalid mobile number')
    })

    it('returns undefined if valid phone number is given', () => {
      expect(FormHelper.validMobileNumber('+1-213-373-4253')).toBeUndefined()
    })
  })

  describe('validStrongPassword()', () => {
    it('returns correct string if invalid password passed', () => {
      expect(FormHelper.validStrongPassword('password')).toEqual('Your password is not strong enough')
    })

    it('returns undefined if valid password is given', () => {
      expect(FormHelper.validStrongPassword('sk8_d13_H3lp_Me')).toBeUndefined()
    })
  })

  describe('validIpList()', () => {
    it('returns correct string if invalid IP passed', () => {
      expect(FormHelper.validIpList('10.208.124')).toEqual('Invalid IP list')
    })
  })

  describe('validPasswordStretchingNumber()', () => {
    it('returns correct string if invalid password stretcher passed', () => {
      expect(FormHelper.validPasswordStretchingNumber(399999999)).toEqual('Please ensure 1 < PBKDF2 <= 20000')
    })

    it('returns undefined if valid password stretcher is given', () => {
      expect(FormHelper.validPasswordStretchingNumber(421)).toBeUndefined()
    })
  })

  describe('validEtherAddress()', () => {
    it('returns correct string if invalid ether addr passed', () => {
      expect(FormHelper.validEtherAddress('notanaddress')).toEqual('Invalid Ether Address')
    })

    it('returns undefined if valid ether addr is given', () => {
      expect(FormHelper.validEtherAddress('0x1d409aC5ca371B436C0DF3979F832745671044a5')).toBeUndefined()
    })
  })

  describe('validBitcoinAddress()', () => {
    it('returns undefined if valid bitcoin addr is given', () => {
      expect(FormHelper.validBitcoinAddress('1cKtTucHyhVrg8zRzMg7KJrvsYbxeX2eP')).toBeUndefined()
    })
  })

  describe('validEmailCode()', () => {
    it('returns correct string if invalid email code passed', () => {
      expect(FormHelper.validEmailCode('123')).toEqual('Invalid Email Code')
    })

    it('returns undefined if valid email code is given', () => {
      expect(FormHelper.validEmailCode('12E3R')).toBeUndefined()
    })
  })

  describe('validBitcoinPrivateKey()', () => {
    it('returns correct string if invalid btc private key passed', () => {
      expect(FormHelper.validBitcoinPrivateKey('NOTVALIDL1fLj9zU3Fp5vbCN88ZQYXJ3Jn3L1fLj9zU3Fp')).toEqual('Invalid Bitcoin Private Key')
    })

    it('returns undefined if valid btc private key is given', () => {
      expect(FormHelper.validBitcoinPrivateKey('L1fLj9zU3Fp5vbCN88ZQYXJ3Jn3V2XYEWBK3RuG1HEmRZDAYxYZi')).toBeUndefined()
    })
  })

  describe('validBitcoinCashAddress()', () => {
    it('returns correct string if invalid bth addr passed', () => {
      expect(FormHelper.validBitcoinCashAddress('NOTVALIDqqrrt6920wp5zndraya69eltes4tzswn2svhxgqh5a')).toEqual('Invalid Bitcoin Cash Address')
    })

    it('returns undefined if valid bth addr is given', () => {
      expect(FormHelper.validBitcoinCashAddress('qqrrt6920wp5zndraya69eltes4tzswn2svhxgqh5a')).toBeUndefined()
    })
  })

  describe('ageOverEighteen()', () => {
    it('returns correct string if age is not over 18', () => {
      expect(FormHelper.ageOverEighteen(Date.now() - 400000)).toEqual('Must be 18 or older')
    })

    it('returns undefined if age is over 18', () => {
      expect(FormHelper.ageOverEighteen(2100134239)).toBeUndefined()
    })
  })

  describe('requiredSSN()', () => {
    it('returns correct string if not a valid SSN', () => {
      expect(FormHelper.requiredSSN('123-1243-12412')).toEqual('Must be valid SSN')
    })

    it('returns undefined if SSN is valid', () => {
      expect(FormHelper.requiredSSN('111-22-3333')).toBeUndefined()
    })
  })

  describe('requiredDOB()', () => {
    it('returns correct string if DOB is not valid', () => {
      expect(FormHelper.requiredDOB('sfa')).toEqual('Must be valid date')
    })

    it('returns undefined if DOB is valid', () => {
      expect(FormHelper.requiredDOB('11-11-1911')).toBeUndefined()
    })
  })

  describe('requiredUsZipcode()', () => {
    it('returns correct string if DOB is not valid', () => {
      expect(FormHelper.requiredUsZipcode('78342223')).toEqual('Must be valid zipcode')
    })

    it('returns undefined if zip is valid', () => {
      expect(FormHelper.requiredUsZipcode('11322')).toBeUndefined()
    })
  })

  it('normalizeSocialSecurity() returns normalized SSN', () => {
    expect(FormHelper.normalizeSocialSecurity('111223333')).toEqual('111-22-3333')
  })

  it('normalizeDateOfBirth() returns normalized dob', () => {
    expect(FormHelper.normalizeDateOfBirth('11301988')).toEqual('11/30/1988')
  })

  it('normalizeUSZipcode() returns normalized zip code', () => {
    expect(FormHelper.normalizeUSZipcode('11207000')).toEqual('11207')
  })

  it('normalizePhone() returns normalized phone number', () => {
    expect(FormHelper.normalizePhone('+1-342-522-4532')).toEqual('13425224532')
  })
})
