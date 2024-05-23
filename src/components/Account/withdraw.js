import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { MESSAGEMODAL } from "../../constants/types"
import Frame from 'react-frame-component'
import Pending from '../Account/Pending'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import WithdrawService from '../../services/em/withdraw'
import LoadBlock from '../Loading/LoadBlock'

import isUndefined from 'lodash/isUndefined'
import isNull from 'lodash/isNull'
import includes from 'lodash/includes'
import find from 'lodash/find'
import isEmpty from 'lodash/isEmpty'
import groupBy from 'lodash/groupBy'
import values from 'lodash/values'
import '../../../styles/components/_withdrawPage.scss'
import {
    getSymbol,
    getPathPaymentLogo
} from '../../../utils'
import { CryptoCurrencies } from '../../../utils/CONSTANTS'
import PaymentMethod from '../PaymentMethod';
const config = require(`../../../config`).config
const locale = require('react-redux-i18n').I18n

class Withdraw extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            paymentMethods: [],
            paymentMethodCfg: [],
            withdrawParams: {
                currency: '',
                filterByCountry: ''
            },
            step: 1,
            validated: false,
            hasErr: {},
            paymentConfirm: null,
            redirectionForm: '',
            statusConfiem: {},
            statusChange: {},
            amount: 0,
            errorMessage: false,
            exitCard: false,
            amountMessageErr: '',
            cryptoActive: 'BTC',
        };
    }
    componentDidMount() {
        const { userProfile } = this.props

        WithdrawService.getWithdrawStatusChange((res) => {
            if (res) {
                this.setState({
                    step: 5,
                    statusChange: res
                })
            }
        })

        this.getPaymentMethods(userProfile)
    }
    getPaymentMethods = (userProfile) => {
        const { withdrawParams } = this.state

        if (!isUndefined(userProfile.fields)) {
            let params = withdrawParams

            params.currency = userProfile.fields.currency
            params.filterByCountry = userProfile.fields.country
            WithdrawService.getPaymentMethods({ currency: userProfile.fields.currency, filterByCountry: userProfile.fields.country, includeAll: true }).then((res) => {
                if (res) {
                    this.setState({
                        paymentMethods: res.paymentMethods,
                        withdrawParams: params
                    })
                }
            }).catch((err) => {
                let set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
                const descErr = includes(err.desc.toLowerCase(), 'You cannot withdraw because your account is not actived.'.toLowerCase());
                if (descErr) {
                    set = { messageTitle: locale.t('errorTextWithdrawTitle'), messageDesc: locale.t('errorTextWithdrawDesc'), messageDetail: '', messageType: 'error' }
                    this.setState({
                        errorMessage: true
                    }, () => {
                        this.props.onSetMessageModal(set)
                    })
                } else {
                    this.setState({
                        errorMessage: true
                    }, () => {
                        this.props.onSetMessageModal(set)
                    })
                }
            })
        }
    }
    UNSAFE_componentWillReceiveProps(newProps) {
        if (newProps.userProfile != this.props.userProfile) {
            this.getPaymentMethods(newProps.userProfile)
        }
    }
    getPaymentMethodCfg = (code) => {
        const { cryptoActive } = this.state
        const { withdrawParams } = this.state
        const cfg = {
            paymentMethodCode: code,
            payCardID: ''
        }
        let params = withdrawParams

        this.loadBlock.isOpen(true)
        WithdrawService.getPaymentMethodCfg(cfg).then((res) => {
            if (this.loadBlock) this.loadBlock.isOpen(false)
            if (res) {
                let exitCard = false
                if (!isUndefined(res.fields) &&
                    !isUndefined(res.fields.payCardID) &&
                    !isUndefined(res.fields.payCardID.options) &&
                    res.fields.payCardID.options.length > 0
                    && res.name != "CoinsPaid") {
                    exitCard = true
                }
                this.setState({
                    step: 2,
                    paymentMethodCfg: res,
                    withdrawParams: params,
                    exitCard
                })
                if (res.name == "CoinsPaid")
                    this.changeCrypto(cryptoActive);
            }
        }).catch((err) => {
            const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
            if (this.loadBlock) this.loadBlock.isOpen(false)
            this.props.onSetMessageModal(set)
        })
    }

    changeCrypto = (e) => {
        this.setState({
            cryptoActive: e
        })
        switch (e) {
            case "BTC":
            case "XRP":
            case "LTC":
            case "USDT":
            case "XLM":
                this.setState({ paymentMethodCfg: { ...this.state.paymentMethodCfg, paymentMethodCode: 'MoneyMatrix_CryptoPay' } });
                break;
            default:
                this.setState({ paymentMethodCfg: { ...this.state.paymentMethodCfg, paymentMethodCode: 'MoneyMatrix_CoinsPaid' } });
                break;

        }
    }

    selectExternalCashier = () => {
        let sessionID = localStorage.getItem(`sessionId`).replace(/"/g, '');
        const endpoint = config.api.API_ENDPOINT.replace('exclusivebet/', '');
        this.setState({
            step: 6,
            externalLink: `${endpoint}external-cashier/?page=withdraw&session_id=${sessionID}`
        })
    }
    handleSubmit = (event) => {
        const { paymentMethodCfg, hasErr } = this.state;
        let form = event.target;
        let e = form.elements
        let errExpression = find(hasErr, (o) => o == false)

        if (form.checkValidity() === false || !isUndefined(errExpression)) {
            const { value, name, validity, min, max, validationMessage } = e['amount']
            let amountValid = {}
            if (validity.rangeOverflow) {
                amountValid = { amountMessageErr: locale.t('maxAmountWithdrawErr', { name: paymentMethodCfg.name, num: max }) }
            } else if (validity.rangeUnderflow) {
                amountValid = { amountMessageErr: locale.t('minAmountWithdrawErr', { name: paymentMethodCfg.name, num: min }), status: true }
            } else if (value === '') {
                amountValid = { amountMessageErr: locale.t('amountNotEmpty') }
            } else {
                amountValid = { amountMessageErr: validationMessage }
            }
            this.setState({ validated: true, ...amountValid })
            event.preventDefault();
            event.stopPropagation();
        } else {
            if (!isUndefined(paymentMethodCfg)) {
                this.loadBlock.isOpen(true)
                let parameters = {
                    paymentMethodCode: paymentMethodCfg.paymentMethodCode,
                    fields: {
                        gamingAccountID: e['gamingAccount'].value,
                        currency: e['currency'].value,
                        amount: e['amount'].value
                    }
                }
                if (!isUndefined(e['payCardID'])) {
                    parameters.fields.payCardID = e['payCardID'].value
                    if (!isUndefined(paymentMethodCfg.fields) && !isUndefined(paymentMethodCfg.fields.payCardID) && !isUndefined(paymentMethodCfg.fields.payCardID.options)) {
                        let optionFields = find(paymentMethodCfg.fields.payCardID.options, o => o.id == Number(e['payCardID'].value))
                        if (optionFields) {
                            let displaySpecificFields = optionFields.displaySpecificFields;
                            for (var rf in displaySpecificFields) {
                                parameters.fields[rf] = displaySpecificFields[rf]
                            }
                        }
                    }
                }
                if (!isUndefined(paymentMethodCfg.fields.payCardID)) {
                    let fields = null

                    if (!isUndefined(paymentMethodCfg.fields.payCardID.registrationFields)) {
                        fields = paymentMethodCfg.fields.payCardID.registrationFields
                    } else if (!isUndefined(paymentMethodCfg.fields.payCardID.inputFields)) {
                        fields = paymentMethodCfg.fields.payCardID.inputFields
                    }

                    if (!isNull(fields)) {
                        for (var rf in fields) {
                            if (fields[rf].type != 'Label') {
                                if (!isUndefined(e[rf])) {
                                    parameters.fields[rf] = e[rf].value
                                }
                            }
                        }
                    }
                }
                if (paymentMethodCfg.paymentMethodCode == 'MoneyMatrix_CryptoPay') {
                    parameters.fields.PaymentParameterWithdrawWalletAddress = parameters.fields.PaymentParameterCryptoAddress;

                    if (!isUndefined(e['paymentCryptoCode']) && !isUndefined(e['paymentCryptoCode'].value)) {
                        parameters.fields.PaymentParameterCryptoCurrency = e['paymentCryptoCode'].value;
                    }

                }

                WithdrawService.setWithdrawPrepare(parameters).then((res) => {
                    if (this.loadBlock) this.loadBlock.isOpen(false)
                    if (res) {
                        this.setState({
                            paymentConfirm: res,
                            step: 3,
                            amount: e['amount'].value,
                            amountMessageErr: ''
                        })
                    }
                }).catch((err) => {
                    const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
                    if (this.loadBlock) this.loadBlock.isOpen(false)
                    this.props.onSetMessageModal(set)
                })
            }
            event.preventDefault();
            event.stopPropagation();
        }
    }


    _renderPaymentList = () => {
        const { paymentMethods, errorMessage } = this.state
        let item = []
        let url_check = window.location.hostname;
        let show_external = (url_check == 'stage' || url_check == 'localhost') ? true : false;
        const banckExclude = ['MoneyMatrix_BestPayCard_CryptoPay', 'MoneyMatrix_CryptoPay']
        let counterCrypto = 0;
        let counterBank = 0;
        if (paymentMethods.length > 0) {
            let paymentMethodsSort = groupBy(paymentMethods, 'code')
            values(paymentMethodsSort).map((resItem, index) => {
                const res = resItem[0]
                if (!includes(banckExclude, res.code) && res.code !== 'MoneyMatrix_MiFinity_Wallet') {
                    if (res.code == 'MoneyMatrix_CoinsPaid') {
                        if (counterCrypto == 0) {
                            let evt = (
                                <PaymentMethod
                                    key={`litscrypto-${index}`}
                                    methodName='Crypto'
                                    processingType={locale.t('')}
                                    transactionLimit={`${getSymbol(res.withdrawLimit.currency)}${res.withdrawLimit.min} - ${getSymbol(res.withdrawLimit.currency)}${res.withdrawLimit.max}`}
                                    getPaymentMethodCfg={this.getPaymentMethodCfg}
                                    payment={res}
                                    imagePath={getPathPaymentLogo(res.code)}
                                    type='row'
                                    pagePayment='withdraw'
                                />

                            )
                            counterCrypto = 1;
                            item.push(evt)
                        }
                    }
                    else {
                        if (res.code == 'MoneyMatrix_BankTransfer') {
                            if (counterBank == 0) {
                                let evt = (
                                    <PaymentMethod
                                        key={`litsBankTransfer-${index}`}
                                        methodName={this.switchLang(res.name)}
                                        processingType={locale.t('')}
                                        transactionLimit={`${getSymbol(res.withdrawLimit.currency)}${res.withdrawLimit.min} - ${getSymbol(res.withdrawLimit.currency)}${res.withdrawLimit.max}`}
                                        getPaymentMethodCfg={this.getPaymentMethodCfg}
                                        payment={res}
                                        imagePath={getPathPaymentLogo(res.code)}
                                        type='row'
                                        pagePayment='withdraw'
                                    />

                                )
                                counterBank = 1;
                                item.push(evt)
                            }
                        }
                        else {
                            let evt = (
                                <PaymentMethod
                                    key={`lits${res.name}-${index}`}
                                    methodName={this.switchLang(res.name)}
                                    processingType={locale.t('')}
                                    transactionLimit={`${getSymbol(res.withdrawLimit.currency)}${res.withdrawLimit.min} - ${getSymbol(res.withdrawLimit.currency)}${res.withdrawLimit.max}`}
                                    getPaymentMethodCfg={this.getPaymentMethodCfg}
                                    payment={res}
                                    imagePath={getPathPaymentLogo(res.code)}
                                    title='External Cashier'
                                    type='row'
                                    pagePayment='withdraw'
                                />

                            )
                            item.push(evt)
                        }
                    }
                }
            })
        }

        if (show_external && !errorMessage) {
            let evt = (
                <PaymentMethod
                    key={`litsexternal-cashier-`}
                    methodName='External Cashier'
                    processingType={locale.t('')}
                    transactionLimit={`-`}
                    selectExternalCashier={this.selectExternalCashier}
                    imagePath={getPathPaymentLogo('external-cashier')}
                    title='External Cashier'
                    type='row'
                    pagePayment='withdraw'
                />
            )
            item.push(evt)
        }

        return item
    }
    handleChange = (event) => {
        const { withdrawParams } = this.state
        let form = event.target

        this.setState({
            withdrawParams: {
                ...withdrawParams,
                [`${form.name}`]: form.value
            }
        })
    }
    handleChangeFields = (event) => {
        const { paymentMethodCfg, hasErr } = this.state
        let form = event.target

        if (!isUndefined(paymentMethodCfg.fields) && !isUndefined(paymentMethodCfg.fields.payCardID) && !isNull(paymentMethodCfg.fields.payCardID)) {
            let fields = null

            if (!isUndefined(paymentMethodCfg.fields.payCardID.registrationFields)) {
                fields = paymentMethodCfg.fields.payCardID.registrationFields
            } else if (!isUndefined(paymentMethodCfg.fields.payCardID.inputFields)) {
                fields = paymentMethodCfg.fields.payCardID.inputFields
            }

            if (!isNull(fields) && fields[form.name].mandatory) {
                let err = hasErr

                if (!isNull(fields[form.name].regularExpression)) {
                    var regex = new RegExp(fields[form.name].regularExpression)
                    let n = regex.test(form.value)

                    err = { ...hasErr, [`${form.name}`]: n }
                } else {
                    if (isEmpty(form.value)) {
                        err = { ...hasErr, [`${form.name}`]: false }
                    }
                }

                this.setState({
                    hasErr: err
                })
            }
        }
    }
    _renderCurrency = () => {
        const { paymentMethodCfg } = this.state
        const { userProfile } = this.props
        let item = []

        if (!isUndefined(paymentMethodCfg.fields) && !isUndefined(paymentMethodCfg.fields.currency) && !isUndefined(paymentMethodCfg.fields.currency.options)) {
            const currency = paymentMethodCfg.fields.currency.options

            currency.map((res, index) => {
                if (!isUndefined(userProfile.fields) && userProfile.fields.currency == res.code) {
                    item.push(<option key={index} value={res.code}>{res.name}</option>)
                }
            })
            if (item.length == 0) {
                currency.map((res, index) => {
                    item.push(<option key={index} value={res.code}>{res.name}</option>)
                })
            }
        }

        return item
    }
    _renderGamingAccount = () => {
        const { paymentMethodCfg } = this.state
        let item = []

        if (!isUndefined(paymentMethodCfg.fields) && !isUndefined(paymentMethodCfg.fields.gamingAccountID) && !isUndefined(paymentMethodCfg.fields.gamingAccountID.options)) {
            const gamingAccount = paymentMethodCfg.fields.gamingAccountID.options

            gamingAccount.map((res, index) => {
                let checked = false
                if (index === 0) {
                    checked = true
                }
                if (res.vendor === "CasinoWallet") {
                    item.push(<Form.Check key={index} defaultChecked={true} name="gamingAccount" label={`${this.switchLang(res.name)} ${res.currency} ${res.amount}`} type="radio" value={res.id} />)
                }

            })
        }

        return item
    }
    _renderFields = () => {
        const { paymentMethodCfg, hasErr} = this.state
        let item = []

        if (!isUndefined(paymentMethodCfg.fields) && !isUndefined(paymentMethodCfg.fields.payCardID) && !isNull(paymentMethodCfg.fields.payCardID)) {
            let fields = null

            if (!isUndefined(paymentMethodCfg.fields.payCardID.registrationFields)) {
                fields = paymentMethodCfg.fields.payCardID.registrationFields
            } else if (!isUndefined(paymentMethodCfg.fields.payCardID.inputFields)) {
                fields = paymentMethodCfg.fields.payCardID.inputFields
            }
            if (!isNull(fields) && Object.keys(fields).length > 0) {
                Object.keys(fields).map((res, index) => {
                    if (fields[res].type === 'Text') {
                        let required = fields[res].mandatory ? true : false
                        let has = ''

                        if (!isUndefined(hasErr[res])) {
                            has = hasErr[res] ? '' : 'has-error'
                        }

                        item.push(
                            <Form.Group key={index} className={has}>
                                <Form.Label>{this.switchLang(fields[res].label)} {required ? <span>*</span> : ''}</Form.Label>
                                <Form.Control
                                    required={required}
                                    type="text"
                                    name={res}
                                    onChange={(e) => this.handleChangeFields(e)}
                                />
                            </Form.Group>
                        )
                    }
                    if (fields[res].type === 'Lookup') {
                        let required = fields[res].mandatory ? true : false
                        let has = ''
                        const paymentParameterBankCode = fields[res].values
                        let paramBank = []

                        if (!isUndefined(hasErr[res])) {
                            has = hasErr[res] ? '' : 'has-error'
                        }

                        paymentParameterBankCode.map((res, index) => {
                            paramBank.push(<option key={index} value={res.key}>{res.value}</option>)
                        })

                        item.push(
                            <Form.Group key={index} className={has}>
                                <Form.Label>{fields[res].label} {required ? <span>*</span> : ''}</Form.Label>
                                <Form.Control as="select" name={res} required={required} onChange={(e) => this.handleChangeFields(e)} componentclassname="select">
                                    {paramBank}
                                </Form.Control>
                            </Form.Group>
                        )
                    }
                })
            }
        } else if (!isUndefined(paymentMethodCfg.paymentMethodCode) && paymentMethodCfg.paymentMethodCode === 'MoneyMatrix_CreditCard') {
            if (!isUndefined(paymentMethodCfg.fields) && !isUndefined(paymentMethodCfg.fields.payCardID) && isUndefined(paymentMethodCfg.fields.payCardID.options)) {
                let year = new Date()
                let yearShow = []
                let monthShow = []

                for (let i = year.getFullYear(); i < year.getFullYear() + 20; i++) {
                    yearShow.push(<option key={i} value={i}>{i}</option>)
                }
                for (let i = 1; i <= 12; i++) {
                    monthShow.push(<option key={i} value={i}>{i}</option>)
                }

                item.push(
                    <Fragment key={paymentMethodCfg.paymentMethodCode}>
                        <Form.Group>
                            <Form.Label>{locale.t('cardNumber')}  <span>*</span> </Form.Label>
                            <Form.Control required={true} type="number" minLength='10' maxLength='19' name='cardNumber' onChange={(e) => this.handleChangeFields(e)} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>{locale.t('cardHolderName')}  <span>*</span> </Form.Label>
                            <Form.Control required={true} type="text" name='cardName' onChange={(e) => this.handleChangeFields(e)} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>{locale.t('cardSecurityCode')}  <span>*</span> </Form.Label>
                            <Form.Control required={true} type="number" name='securityCode' onChange={(e) => this.handleChangeFields(e)} />
                        </Form.Group>
                        <Form.Row>
                            <Form.Group as={Col} md={6} >
                                <Form.Label>{locale.t('year')}  <span>*</span> </Form.Label>
                                <Form.Control required name="year" componentclassname="select" onChange={(e) => handleChangeFields(e)} as="select">
                                    {yearShow}
                                </Form.Control>
                            </Form.Group>
                            <Form.Group as={Col} md={6} >
                                <Form.Label>{locale.t('month')}  <span>*</span> </Form.Label>
                                <Form.Control required name="month" componentclassname="select" onChange={(e) => handleChangeFields(e)} as="select">
                                    {monthShow}
                                </Form.Control>
                            </Form.Group>
                        </Form.Row>
                    </Fragment>
                )
            }
        }

        return item
    }


    _renderFieldsCrypto = () => {
        const { paymentMethodCfg, hasErr } = this.state
        let item = []

        if (!isUndefined(paymentMethodCfg.fields) && !isUndefined(paymentMethodCfg.fields.payCardID) && !isNull(paymentMethodCfg.fields.payCardID)) {
            let fields = null
            paymentMethodCfg.fields.payCardID.registrationFields = {
                "PaymentParameterCryptoCurrency": {
                    "label": "Crypto Currency",
                    "description": "Crypto Currency",
                    "placeholder": "Please Choose",
                    "type": "Lookup",
                    "mandatory": true,
                    "regularExpression": null,
                    "values": [
                        {
                            "key": "BTC",
                            "value": "Bitcoin"
                        },
                        {
                            "key": "LTC",
                            "value": "LTC"
                        },
                        {
                            "key": "DOGE",
                            "value": "DOGE"
                        },
                        {
                            "key": "BCH",
                            "value": "BCH"
                        },
                        {
                            "key": "ETH",
                            "value": "Ethereum"
                        },
                        {
                            "key": "NEO",
                            "value": "NEO"
                        },
                        {
                            "key": "XRP",
                            "value": "XRP"
                        },
                        {
                            "key": "ADA",
                            "value": "ADA"
                        },
                        {
                            "key": "TBTC",
                            "value": "TBTC"
                        },
                        {
                            "key": "OMNIBTC",
                            "value": "OMNIBTC"
                        },
                        {
                            "key": "USDT",
                            "value": "USDT"
                        },
                        {
                            "key": "USDTE",
                            "value": "USDTE"
                        },
                        {
                            "key": "BNB",
                            "value": "BNB"
                        },
                        {
                            "key": "EURS",
                            "value": "EURS"
                        },
                        {
                            "key": "USDC",
                            "value": "USDC"
                        },
                        {
                            "key": "TRX",
                            "value": "TRX"
                        },
                        {
                            "key": "USDTT",
                            "value": "USDTT"
                        },
                        {
                            "key": "WBTC",
                            "value": "WBTC"
                        },
                        {
                            "key": "XED",
                            "value": "XED"
                        },
                        {
                            "key": "DAI",
                            "value": "DAI"
                        },
                        {
                            "key": "CPD",
                            "value": "CPD"
                        },
                        {
                            "key": "MRX",
                            "value": "MRX"
                        },
                        {
                            "key": "BNB-BSC",
                            "value": "BNB-BSC"
                        },
                        {
                            "key": "CPD-BSC",
                            "value": "CPD-BSC"
                        },
                        {
                            "key": "SNACK",
                            "value": "SNACK"
                        },
                        {
                            "key": "CSC",
                            "value": "CSC"
                        },
                        {
                            "key": "XLM",
                            "value": "Stellar"
                        }
                    ]
                },
                "PaymentParameterCryptoAddress": {
                    "label": "Crypto Address",
                    "description": "Please be careful to send only selected crypto currency to this address. Sending any other currency may result in withdrawal delay or funds being lost",
                    "type": "Text",
                    "mandatory": true,
                    "regularExpression": null
                },
                "PaymentParameterTagMemo": {
                    "label": "Tag/Memo",
                    "description": "Please pay attention, that the value Tag is required for Ripple or BNB crypto currencies only, and the value Memo is required for Bitshares or EOS crypto currencies only",
                    "type": "Text",
                    "mandatory": false,
                    "regularExpression": "^[a-zA-Z0-9]{1,9}$"
                }
            };
            if (!isUndefined(paymentMethodCfg.fields.payCardID.registrationFields)) {
                fields = paymentMethodCfg.fields.payCardID.registrationFields
            } else if (!isUndefined(paymentMethodCfg.fields.payCardID.inputFields)) {
                fields = paymentMethodCfg.fields.payCardID.inputFields
            }

            if (!isNull(fields) && Object.keys(fields).length > 0) {
                Object.keys(fields).map((res, index) => {
                    if (fields[res].type === 'Text') {
                        let required = fields[res].mandatory ? true : false
                        let has = ''

                        if (!isUndefined(hasErr[res])) {
                            has = hasErr[res] ? '' : 'has-error'
                        }

                        item.push(
                            <Form.Group key={index} className={has}>
                                <Form.Label>{this.switchLang(fields[res].label)} {required ? <span>*</span> : ''}</Form.Label>
                                <Form.Control required={required} type="text" name={res} onChange={(e) => this.handleChangeFields(e)} />
                            </Form.Group>
                        )
                    }
                    if (fields[res].type === 'Lookup') {
                        let required = fields[res].mandatory ? true : false
                        let has = ''
                        const paymentParameterBankCode = fields[res].values
                        let paramBank = []

                        if (!isUndefined(hasErr[res])) {
                            has = hasErr[res] ? '' : 'has-error'
                        }

                        paymentParameterBankCode.map((res, index) => {
                            paramBank.push(<option key={index} value={res.key}>{res.value}</option>)
                        })

                        item.push(
                            <Form.Group key={index} className={has} style={{ visibility: "hidden", maxHeight: "0" }}>
                                <Form.Label>{fields[res].label} {required ? <span>*</span> : ''}</Form.Label>
                                <Form.Control as="select" name={res} required={required} onChange={(e) => this.handleChangeFields(e)} componentclassname="select" value={this.state.cryptoActive}>
                                    {paramBank}
                                </Form.Control>
                            </Form.Group>
                        )
                    }
                })
            }
        }
        return item
    }

    _renderOptions = () => {
        const { paymentMethodCfg } = this.state
        let item = null

        if (!isUndefined(paymentMethodCfg.fields) && !isUndefined(paymentMethodCfg.fields.payCardID) && !isUndefined(paymentMethodCfg.fields.payCardID.options)) {
            const options = paymentMethodCfg.fields.payCardID.options
            let items = []

            options.map((res, index) => {
                items.push(
                    <Form.Check key={index} defaultChecked={index === 0 ? true : false} name="payCardID" label={`${res.name}`} type="radio" value={res.id} />
                )
            })

            item = (
                <Row >
                    <Col md={6}>
                        {items}
                    </Col>
                </Row>
            )
        }

        return item
    }

    switchLang = (text) => {
        if (text.includes("CasinoWallet")) {
            return locale.t('CasinoWallet')
        } else
            if (text.includes("Bank Transfer")) {
                return locale.t('BankTransfer')
            } else
                if (text.includes("Money transfer")) {
                    return locale.t('DescriptionBankTransfer')
                } else
                    if (text.includes("Account Holder Name")) {
                        return locale.t('AccountHolderName')
                    } else
                        if (text.includes("Bank Name")) {
                            return locale.t('BankName')
                        } else {
                            return text
                        }
    }
    handleCardOptions = (event) => {
        let form = event.target
        if (form.name === 'exits_card') {
            this.setState({ exitCard: true })
        } else if (form.name === 'new_card') {
            this.setState({ exitCard: false })
        }
    }
    _renderCardOptions = () => {
        const { paymentMethodCfg, exitCard } = this.state
        return (
            <Form.Group as={Col} xs={12} className="check-card">
                <Form.Check inline disabled={paymentMethodCfg.fields.payCardID.options.length == 0 ? true : false} checked={exitCard ? true : false} label={` ${locale.t("formWithdrawText2")}`} onChange={(e) => this.handleCardOptions(e)} name="exits_card" type="checkbox" id={`inline-radio-1`} />
                {/* <Form.Check inline disabled={disabledCard} checked={exitCard ? true : false} label={` ${locale.t("formWithdrawText2")}`} onChange={(e) => this.handleCardOptions(e)} name="exits_card" type="checkbox" id={`inline-radio-1`} /> */}
                <Form.Check inline checked={exitCard ? false : true} label={` ${locale.t("formWithdrawText1")}`} onChange={(e) => this.handleCardOptions(e)} name="new_card" type="checkbox" id={`inline-radio-2`} />
            </Form.Group>
        )
    }

    renderCryptoItem = (index) => {
        const { cryptoActive } = this.state;
        const { code, icon, name } = CryptoCurrencies[index];
        return (
            <div className="col-4 col-md-2" key={`cryp${code}${index}`}>
                <div type="button" className={`m-2 button-crypto ${cryptoActive === code ? "crypto_active" : ""}`} onClick={() => { this.changeCrypto(code); }}>
                    <span className="span-crypto">
                        <div className='d-flex'>
                            <div className="paymentButton_gradient">
                                <img src={icon} />
                            </div>
                        </div>
                        <div className="PaymentButton__name">{name}</div>
                    </span>
                </div>
            </div>
        );
    }

    _renderPaymentCFG = () => {
        const { paymentMethodCfg, withdrawParams, validated, exitCard, amountMessageErr, cryptoActive } = this.state
        let item = null
        if (!isUndefined(paymentMethodCfg)) {
            if (paymentMethodCfg.name != 'CoinsPaid') {
                item = (
                    <Fragment>
                        <Row>
                            <Col>
                                <img src={getPathPaymentLogo(paymentMethodCfg.paymentMethodCode)} />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <p>{this.switchLang(paymentMethodCfg.name)}</p>
                                <p>{this.switchLang(paymentMethodCfg.withdrawDesc)}</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <hr />
                            </Col>
                        </Row>
                        <Form noValidate validated={validated} onSubmit={(e) => this.handleSubmit(e)} className="payment-form">
                            <Row>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>{locale.t('selectGamingAccount')}</Form.Label>
                                        {this._renderGamingAccount()}
                                    </Form.Group>
                                    {this._renderCardOptions()}
                                    <Form.Group>
                                        <Form.Label>{locale.t('currency')}</Form.Label>
                                        <Form.Control required as="select" name="currency" onChange={(e) => this.handleChange(e)} componentclassname="select" value={withdrawParams.currency} >
                                            {this._renderCurrency()}
                                        </Form.Control>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>{locale.t('amount')} <span>*</span></Form.Label>
                                        <Form.Control required type="number" name="amount" onChange={(e) => this.handleChange(e)} min={paymentMethodCfg.fields.amount.limits[withdrawParams.currency].min} step="0.01" pattern="[0-9]" max={paymentMethodCfg.fields.amount.limits[withdrawParams.currency].max} defaultValue={paymentMethodCfg.fields.amount.limits[withdrawParams.currency].min} placeholder={locale.t('zero')} />
                                        <Form.Control.Feedback type="invalid">{amountMessageErr}</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>
                            {exitCard && this._renderOptions()}
                            {
                                !exitCard &&
                                <Row>
                                    <Col md={6}>
                                        {this._renderFields()}
                                    </Col>
                                </Row>
                            }
                            <Row>
                                <Col>
                                    <hr />
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6} className="d-flex">
                                    <Button variant="secondary" type="button" block onClick={() => this.setState({ step: 1, validated: false })}>{locale.t('back')}</Button>
                                    <Button variant="success" block type="submit">{locale.t('withdraw')}</Button>
                                </Col>
                            </Row>
                        </Form>
                    </Fragment>
                )
            }
            else {

                item = (
                    <Fragment>
                        <Row>
                            <Col>
                                <img className="icon" src="/static/images/Paymentlogo/crypto.png" />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <p>Crypto</p>
                                <p>{this.switchLang(paymentMethodCfg.withdrawDesc)}</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <hr />
                            </Col>
                        </Row>
                        <Form noValidate validated={validated} onSubmit={(e) => this.handleSubmit(e)} className="payment-form">
                            <Row>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>{locale.t('selectGamingAccount')}</Form.Label>
                                        {this._renderGamingAccount()}
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>{locale.t('currency')}</Form.Label>
                                        <Form.Control required as="select" name="currency" onChange={(e) => this.handleChange(e)} componentclassname="select" value={withdrawParams.currency} >
                                            {this._renderCurrency()}
                                        </Form.Control>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>{locale.t('amount')} <span>*</span></Form.Label>
                                        <Form.Control required type="number" name="amount" onChange={(e) => this.handleChange(e)} min={paymentMethodCfg.fields.amount.limits[withdrawParams.currency].min} step="0.01" pattern="[0-9]" max={paymentMethodCfg.fields.amount.limits[withdrawParams.currency].max} defaultValue={paymentMethodCfg.fields.amount.limits[withdrawParams.currency].min} placeholder={locale.t('zero')} />
                                        <Form.Control.Feedback type="invalid">{amountMessageErr}</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <input type="hidden" name="paymentCryptoCode" value={cryptoActive} />
                            {exitCard && this._renderOptions()}
                            {
                                !exitCard &&
                                <Row>
                                    <Col md={12}>
                                        <div className='cryptoContainer'>
                                            <Form.Row style={{ paddingBottom: "10px" }}>
                                                {Object.keys(CryptoCurrencies).map(this.renderCryptoItem)}

                                            </Form.Row>
                                        </div>
                                        {/* {this._renderCryptos()} */}
                                    </Col>
                                    <Col md={6}>
                                        {this._renderFieldsCrypto()}
                                    </Col>
                                </Row>
                            }
                            <Row>
                                <Col>
                                    <hr />
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6} className="d-flex">
                                    <Button variant="secondary" type="button" block onClick={() => this.setState({ step: 1, validated: false })}>{locale.t('back')}</Button>
                                    <Button variant="success" block type="submit">{locale.t('withdraw')}</Button>
                                </Col>
                            </Row>
                        </Form>
                    </Fragment>
                )
            }
        }

        return item
    }
    withdrawConfirm = () => {
        const { paymentConfirm, amount } = this.state

        this.loadBlock.isOpen(true)
        let parameters = {
            pid: paymentConfirm.pid
        }

        WithdrawService.setWithdrawConfirm(parameters).then((res) => {
            if (this.loadBlock) this.loadBlock.isOpen(false)
            if (res) {
                if (!isUndefined(res.redirectionForm)) {
                    this.setState({
                        statusConfiem: res,
                        step: 4
                    })
                } else {
                    this.setState({
                        step: 5,
                        statusChange: { status: locale.t('withdrawalProcessedSoonAsPossible', { text: locale.t('mrXBet') }) }
                    })
                }
            }
        }).catch((err) => {
            let message = err.desc
            let detail = err.detail
            let title = locale.t('error')
            if (includes(err.desc, "Insufficient funds")) {
                title = locale.t('insufficientFundsTitle')
                message = locale.t('insufficientFunds')
                detail = ''
            }

            const set = { messageTitle: title, messageDesc: message, messageDetail: detail, messageType: 'error' }

            if (this.loadBlock) this.loadBlock.isOpen(false)
            this.props.onSetMessageModal(set)
        })
    }
    _renderConfirm = () => {
        const { paymentConfirm } = this.state
        let item = null

        if (!isNull(paymentConfirm)) {
            item = (
                <Fragment>
                    <Row>
                        <Col md={8}>
                            <Row>
                                <Col md={8}>
                                    <p>{`${locale.t('confirmAmount')} ${paymentConfirm.debit.name}`}</p>
                                </Col>
                                <Col md={4}>
                                    <p>{`${paymentConfirm.debit.currency} ${paymentConfirm.debit.amount}`}</p>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row className="mt-2">
                        <Col md={6} className="d-flex">
                            <Button variant="secondary" block onClick={() => this.setState({ step: 2, validated: false })}>{locale.t('back')}</Button>
                            <Button variant="success" block onClick={() => this.withdrawConfirm(paymentConfirm.pid)}>{locale.t('confirm')}</Button>
                        </Col>
                    </Row>
                </Fragment>
            )
        }

        return item
    }
    redirectionFormSubmit() {
        let iframeDeposit = document.getElementById('frame_withdraw').contentWindow.document;
        iframeDeposit.getElementsByTagName('form')[0].submit();
    }
    _renderStep = () => {
        const { step, statusConfiem, statusChange, errorMessage } = this.state
        let item = []

        switch (step) {
            case 1:
                item = (
                    <Fragment>
                        <div className="payment-list-row">
                            {this._renderPaymentList()}
                        </div>
                        {
                            errorMessage && <Row>
                                <Col>
                                    <p dangerouslySetInnerHTML={{ __html: locale.t('readPrivacyPolicyHere', { link: `<a className="text-blue" href="/privacy-policy">${window.location.hostname}/privacy-policy </a>` }) }}></p>
                                </Col>
                            </Row>
                        }
                    </Fragment>
                )
                break;
            case 2:
                item = (
                    <Fragment>
                        <Row>
                            <Col>
                                <div className="title">{locale.t('withdraw')}</div>
                            </Col>
                        </Row>
                        {this._renderPaymentCFG()}
                    </Fragment>
                )
                break;
            case 3:
                item = (
                    <Fragment>
                        <Row>
                            <Col>
                                <div className="title">{locale.t('withdraw')}</div>
                            </Col>
                        </Row>
                        {this._renderConfirm()}
                    </Fragment>
                )
                break;
            case 4:
                item = (
                    <Fragment>
                        <Row >
                            <Frame id="frame_withdraw" contentDidMount={() => this.redirectionFormSubmit()} width="100%" height="550px">
                                <div dangerouslySetInnerHTML={{ __html: statusConfiem.redirectionForm }}></div>
                            </Frame>
                        </Row>
                    </Fragment>
                )
                break;
            case 5:
                item = (
                    <Fragment>
                        <Row >
                            <Col>
                                <div className="title">{`${locale.t('withdrawMoneyStatus')} : ${statusChange.status}`}</div>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6} className="d-flex">
                                <Button variant="secondary" block onClick={() => this.setState({ step: 1, validated: false })}>{locale.t('back')}</Button>
                            </Col>
                        </Row>
                    </Fragment>
                )
                break;
        }

        return item
    }
    render() {
        const { step } = this.state

        return (
            <div>
                <div className="withdraw-page">
                    <Container className="p-0">
                        <Row>
                            <Col>
                                <h2 className="DepositTitle">{locale.t('withdrawMoney')}</h2>
                            </Col>
                        </Row>
                        <div className="withdraw-form">
                            <div className={`step-body-${step}`}>
                                {this._renderStep()}
                            </div>
                        </div>
                        <LoadBlock ref={ref => this.loadBlock = ref} />
                    </Container>
                    <Container className="p-0 mt-4">
                        <Pending step={step} />
                    </Container>
                </div>
            </div>
        )
    }
}
const mapStateToProps = (state) => ({
    isConnected: state.EM.isConnected,
    languagesActive: state.sessionState.languagesActive,
    userProfile: state.sessionState.userProfile
});
const mapDispatchToProps = (dispatch) => ({
    onSetMessageModal: (active) => dispatch({ type: MESSAGEMODAL, active })
})
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Withdraw);