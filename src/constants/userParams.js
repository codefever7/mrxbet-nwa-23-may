export const loginParams = {
  "usernameOrEmail": "",
  "password": ""
};

export const registerParams = {
  title               : '',
  firstname           : '',
  surname             : '',
  username            : '',
  alias               : '',
  currency            : 'EUR',
  email               : '',
  password            : '',
  retryPassword       : '',
  birthDate           : '',
  mobilePrefix        : '',
  mobile              : '',
  phonePrefix         : "+47",
  phone               : "",
  region              : '',
  country             : '',
  address1            : '',
  address2            : '',
  city                : '',
  postalCode          : '',
  securityQuestion    : '',
  securityAnswer      : '',
  language            : '',
  acceptSMSOffer      : false,
  acceptNewsEmail     : false,
  gender              : "M",
  legalAge            : true,
  acceptTC            : false,
  affiliateMarker     : '',
  emailVerificationURL: "/activation?id=",
  userConsents        : {
    "termsandconditions": true,
    "emailmarketing": false,
    "sms": false,
    "3rdparty": false
  }
};

export const editProfileParams = {
  alias: "",
  gender: "M",
  title: "",
  firstname: "",
  surname: "",
  birthDate: "",
  mobilePrefix: "",
  mobile: "",
  phonePrefix: "+47",
  phone: "",
  country: "",
  region: "",
  city: "",
  address1: "",
  address2: "",
  postalCode: "",
  personalID: "",
  language: "",
  currency: "",
  nationality: "",
  birthplace: "",
  birthCountry: "",
  securityQuestion: "",
  securityAnswer: "",
  acceptNewsEmail: true,
  acceptSMSOffer: true,
  userConsents: {
    "termsandconditions": true,
    "emailmarketing": true,
    "sms": true,
    "3rdparty": true
  }
};

export const activateParams = {
  verificationCode: ''
}
export const balanceParams = {
  productCategory: '0'
}

export const getGamingAccountsParams = {
  expectBalance: true,
  expectBonus: true
}