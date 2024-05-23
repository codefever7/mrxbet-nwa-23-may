import React, { PureComponent, Fragment } from 'react'
import { connect } from 'react-redux'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import '../../../styles/components/_deposit.scss'
// Start Service
import DepositService from '../../services/em/deposit'
import UserService from '../../services/em/user'
import WPService from '../../../services'
// End Service
import LayoutStep1 from './LayoutStep1'
import LayoutCreditCard from './LayoutCreditCard'
import LayoutOtherCard from './LayoutOtherCard'
import LayoutCrypto from './LayoutCrypto'
import LayoutStep3 from './LayoutStep3'
import LayoutStep4 from './LayoutStep4'
import LayoutStep5 from './LayoutStep5'
import ExternalCashier from './ExternalCashier'
import isUndefined from 'lodash/isUndefined'
import isEmpty from 'lodash/isEmpty'
import isArray from 'lodash/isArray'
import forEach from 'lodash/forEach'
import includes from 'lodash/includes'
import isNull from 'lodash/isNull'
import head from 'lodash/head'
import sumBy from 'lodash/sumBy'
import filter from 'lodash/filter'
import upperCase from 'lodash/upperCase'
import { MESSAGEMODAL, WALLETS, ALLMODAL } from "../../constants/types"
import {
    fetchPost,
    getQueryString,
    getSymbol,
    countriesExclude,
    setCookie,
    getCookie,
    delCookie
} from '../../../utils'
import LoadBlock from '../Loading/LoadBlock';
import PaymentMethod from '../PaymentMethod';
import { SetInnerHtml } from '../set-inner-html';
const locale = require('react-redux-i18n').I18n
import moment from 'moment'
// Main Window.
let browser = null;
// child window.
let popup = null;
// interval
let timer = null;
let returnURL = null;
let external_cashier_show = true;

export class Deposit extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            step: 1,
            showStep: 0,
            validated: false,
            category: [],
            acceptOffer: false,
            showMorePromotion: {},
            paramsId: '',
            checkPM: '',
            cpt: false,
            depositeFromData: [],
            monthShow: 0,
            yearShow: 0,
            scriptLoaded: false,
            checkCard: '',
            exitCard: false,
            errAmount: { class: '', message: '', status: false },
            errCardNumber: { class: '', message: '', status: false },
            errCardHolderName: { class: '', message: '', status: false },
            errCardCVV: { class: '', message: '', status: false },
            errDeposit: '',
            paymentForm: '',
            payCardOption: '',
            depositPrepare: [],
            bankSelect: '',
            prepareData: '',
            confirmData: '',
            redirectionForm: '',
            depositStatus: { status: '', text: '', detail: '' },
            amount: 0,
            gamingAccountID: '',
            validated_1: false,
            bonuses: null,
            depositBonus: null,
            bonusAction: 1,
            promotionsDeposit: [],
            countryShow: [],
            currencyShow: [],
            countriesDefault: '',
            currencyDefault: '',
            isLoadFilter: false,
            recentUsedData: [],
            isLogin: null,
            cardPaymentMethods: [],
            card: {},
            payCardIdDefault: '',
            isFtd: false

        }
        this.frame = this.frame.bind(this);
    }
    frame() {
        let iframeDeposit = document.getElementById('frame_deposit').contentWindow.document;
        iframeDeposit.getElementsByTagName('form')[0].submit();
    }
    static getDerivedStateFromProps(props, state) {
        if (props.session.isLogin !== state.isLogin) {
            return {
                isLogin: props.session.isLogin
            }
        }
        return null
    }
    componentDidMount() {
        const params = getQueryString('id')
        const status = getQueryString('status')
        const pid = getQueryString('pid')
        const external_cashier = getQueryString('external_cashier')
        if (!isNull(this.props.session.isLogin) && !isNull(this.state.isLogin) && this.props.session.isLogin && this.state.isLogin) {
            this.getRecentUsedPaymentMethods()
            this.checkFtd();
        }
        let m = []
        let y = []
        for (let i = 1; i <= 12; i++) {
            m.push(<option key={`m-${i}`} value={i}>{i}</option>)
        }
        let yyyy = new Date()
        for (let i = yyyy.getFullYear(); i < yyyy.getFullYear() + 20; i++) {
            y.push(<option key={`yyyy-${i}`} value={i}>{i}</option>)
        }
        WPService.getPromotionsBonus(this.props.lang).then((res) => {
            if (res) {
                this.setState({
                    promotionsDeposit: res
                })
            }
        }).catch((err) => {
            //const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
            //this.props.onSetMessageModal(set)
        })

        if (external_cashier) {
            if (external_cashier_show) {
                this.setState({ step: 6 })
            }
            external_cashier_show = false
        } else {
            this.setState({ paramsId: params, monthShow: m, yearShow: y }, () => {
                this.getCategoryPagmentMethod();
            })
        }


        // browser is set to current window
        browser = window.self;
        // each time we send a message will use the `onSuccess`
        browser.onSuccess = (res) => {
            // console.log(' browser.onSuccess',res);
        }

        // each time we failed we will use the `onError`
        browser.onError = (error) => {
            // console.log(' browser.onError',error);
            //const set = { messageTitle: locale.t('error'), messageDesc: error.desc, messageDetail: error.detail, messageType: 'error' }
            if (this.loadBlock) this.loadBlock.isOpen(false)
            //this.props.onSetMessageModal(set)
        }

        // Tells when a child window is open
        browser.onOpen = (message) => {
            // console.log(' browser.onOpen',message);
        }
        // Tells when a child window is close
        browser.onClose = (message) => {
            //  console.log(' browser.onClose',message);
            if (this.loadBlock) this.loadBlock.isOpen(false)
        }
        returnURL = window.location.origin + window.location.pathname
        if (pid !== '') {
            this._redirectDeposit(pid)
        }

        const script = document.createElement("script");
        script.src = "https://helpers.internationalpaymentsolutions.net/3dv2/fp.js";
        document.body.appendChild(script);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.isLogin !== this.state.isLogin && this.state.isLogin) {
            this.getRecentUsedPaymentMethods()
            this.getCategoryPagmentMethod()
            this.checkFtd();
        }
    }
    watcher = () => {
        // if popup is null then let's clean the intervals.
        if (popup === null) {
            clearInterval(timer);
            timer = null;
            // if popup is not null and it is not closed, then let's set the focus on it... maybe...
        } else if (popup !== null && !popup.closed) {
            popup.focus();
            // if popup is closed, then let's clean errthing.
        } else if (popup !== null && popup.closed) {
            clearInterval(timer);
            browser.focus();
            // the onCloseEventHandler it notifies that the child has been closed.
            browser.onClose("child was closed");
            timer = null;
            popup = null;
        }
    }
    _redirectDeposit = (pid) => {
        const { userInfo } = this.props
        DepositService.getTransactionInfo({ pid }).then((data) => {
            switch (data.status) {
                case 'success':
                    const depositAmount = getCookie('tracking-deposit', document.cookie)
                    if (depositAmount) {
                        this._renderTrackingDeposit(userInfo.userID, depositAmount)
                    }
                    let assignRole = '';
                    let unAssignRole = '';
                    if (userInfo.roles && userInfo.roles.indexOf('loyal_customer') >= 0) {
                        assignRole = '';
                        unAssignRole = '';
                    } else if (userInfo.roles && userInfo.roles.indexOf('new_customer_4') >= 0) {
                        assignRole = 'loyal_customer';
                        unAssignRole = 'new_customer_4';
                    } else if (userInfo.roles && userInfo.roles.indexOf('new_customer_3') >= 0) {
                        assignRole = 'new_customer_4';
                        unAssignRole = 'new_customer_3';
                    } else if (userInfo.roles && userInfo.roles.indexOf('new_customer_2') >= 0) {
                        assignRole = 'new_customer_3';
                        unAssignRole = 'new_customer_2';
                    } else if (userInfo.roles && userInfo.roles.indexOf('new_customer_1') >= 0) {
                        assignRole = 'new_customer_2';
                        unAssignRole = 'new_customer_1';
                    } else if (userInfo.roles && userInfo.roles.indexOf('new_customer_0') >= 0) {
                        assignRole = 'new_customer_1';
                        unAssignRole = 'new_customer_0';
                    } else {
                        assignRole = 'new_customer_1';
                        unAssignRole = 'new_customer_0';
                    }
                    const paramsAssign = {
                        name: assignRole
                    }
                    if (assignRole) {
                        fetchPost('/getUsersRoles', paramsAssign, '').then((resGet) => {

                            if (resGet.status) {
                                if (resGet.data) {
                                    const params = {
                                        roleId: resGet.data.id,
                                        userID: userInfo.userID
                                    }
                                    fetchPost('/assignUserRole', params, '')
                                }
                            }
                        }).catch((err) => {
                            console.log('err', err)
                        })
                    }
                    const paramsUn = {
                        name: unAssignRole
                    }
                    if (unAssignRole) {
                        fetchPost('/getUsersRoles', paramsUn, '').then((resGet) => {
                            if (resGet.status) {
                                if (resGet.data) {
                                    const params = {
                                        roleId: resGet.data.id,
                                        userID: userInfo.userID
                                    }
                                    fetchPost('/removeUserRole', params, '')
                                }
                            }
                        })
                    }
                    this.setState({
                        step: 5, depositStatus: {
                            status: 'success',
                            text: locale.t('depositSuccess'),
                            detail: ''
                        }
                    })
                    break;
                case 'incomplete':
                    this.setState({
                        step: 5, depositStatus: {
                            status: 'warning',
                            text: locale.t('incomplete'),
                            detail: ''
                        }
                    })
                    break;
                case 'error':
                    this.setState({
                        step: 5, depositStatus: {
                            status: 'danger',
                            text: data.desc || locale.t('depositFail'),
                            detail: ''
                        }
                    })
                    break;
            }
        },
            (err) => {
                //const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
                if (this.loadBlock) this.loadBlock.isOpen(false)
                //this.props.onSetMessageModal(set)
            })
    }
    getRecentUsedPaymentMethods = async () => {
        try {
            let { userInfo } = this.props
            let currencyDefault = !isUndefined(userInfo.currency) ? userInfo.currency : 'EUR'
            const recentUsedPayment = await DepositService.getRecentUsedPaymentMethods({
                currency: currencyDefault
            })
            if (!isUndefined(recentUsedPayment.paymentMethods)) {
                this.setState({
                    cardPaymentMethods: recentUsedPayment.paymentMethods
                })
            }
        } catch (error) {
            console.log('error getRecentUsedPaymentMethods =>', error)
        }
    }
    getCategoryPagmentMethod = async () => {
        try {
            let { userInfo, session } = this.props
            let _self = this;


            const resCountries = await UserService.getCountries({ expectRegions: true, excludeDenyRegistrationCountry: false })
            const resCcy = await UserService.getCurrencies()

            let ct = [<option value="">{locale.t('pleaseSelect')}</option>]
            let newCountries = WPService.countriesExclude(resCountries.countries)
            // let countriesDefault = !isUndefined(userInfo.ipCountry) ? userInfo.ipCountry : resCountries.currentIPCountry
            forEach(newCountries, (res, index) => {
                ct.push(<option key={`ct-${index}`} value={res.code}>{res.name}</option>)
            })
            let ccy = []
            let currencyDefault = !isUndefined(userInfo.currency) ? userInfo.currency : 'EUR'
            forEach(resCcy, (res, index) => {
                ccy.push(<option key={`ccy-${index}`} value={res.code}>{res.name}</option>)
            })
            let payload = {
                "filterByCountry": '',
                "currency": currencyDefault
            }
            if (!isUndefined(session.isLogin) && session.isLogin) {
                payload = {
                    "filterByCountry": userInfo.userCountry,
                    "currency": userInfo.currency
                }
            }
            const resultPagmentMethod = await DepositService.getCategoryPagmentMethod(payload)
            if (isUndefined(resultPagmentMethod)) {
                setTimeout(function () { _self.getCategoryPagmentMethodByFilter() }, 1000);
                this.setState({
                    countryShow: ct,
                    currencyShow: ccy,
                    countriesDefault: '',
                    currencyDefault
                })
            } else {
                this.setState({
                    countryShow: ct,
                    currencyShow: ccy,
                    countriesDefault: '',
                    currencyDefault,
                    category: resultPagmentMethod.categories
                })
            }

        } catch (error) {
            console.log('error getCategoryPagmentMethod => ', error)
            //const set = { messageTitle: locale.t('error'), messageDesc: error.desc, messageDetail: error.detail, messageType: 'error' }
            //this.props.onSetMessageModal(set)
        }
    }
    setStateBack = (step) => {
        this.setState({
            step,
            validated: false,
            validated_1: false,
            depositBonus: null,
            bonusAction: 1,
            errAmount: { class: '', message: '', status: false },
            errCardNumber: { class: '', message: '', status: false },
            errCardHolderName: { class: '', message: '', status: false },
            errCardCVV: { class: '', message: '', status: false }
        })
    }
    handleClick = (event) => {
        let form = event.target
        if (form.name === 'back') {
            this.setStateBack(2)
        } else if (form.name === 'close') {
            window.location = window.location.origin + window.location.pathname
        } else if (form.name === 'back_step_1') {
            this.setStateBack(1)
        }
    }
    handleChange = (event) => {
        const { bankSelect } = this.state
        let form = event.target
        if (form.name === 'depositBonus') {
            this.setState({ depositBonus: form.value })
        }
        if (form.name === 'acceptOffer') {
            this.setState({ acceptOffer: form.checked })
        }
        if (form.name === 'exits_card') {

            this.setState({ exitCard: true, scriptLoaded: false })
        }
        if (form.name === 'payCardID') {

            this.setState({ payCardIdDefault: form.value })
        }

        if (form.name === 'new_card') {
            this.setState({ exitCard: false, scriptLoaded: false }, (e) => {
                if (bankSelect == 'MoneyMatrix_CreditCard') {
                    this.handleScriptLoad()
                }
            })
        }
    }
    handleBlur = (event) => {
        const { depositeFromData } = this.state;
        //let depositName = depositeFromData.name;
        if (depositeFromData.name == 'CoinsPaid') depositeFromData.name = 'Crypto';
            //depositName = 'Crypto'
        let input = event.target
        const { value, name, validity, min, max } = input
        const classNameInvalid = 'was-validated has-error'
        switch (name) {
            case 'txtName':
                if (value === '') {
                    this.setState({ errCardHolderName: { class: classNameInvalid, message: locale.t('pleaseEnterName'), status: true } })
                } else {
                    this.setState({ errCardHolderName: { class: '', message: '', status: false } })
                }
                break;
            case 'amount':
                if (validity.rangeOverflow) {
                    this.setState({ errAmount: { class: classNameInvalid, message: locale.t('maxAmountDepositErr', { name: depositeFromData.name, num: max }), status: true } })
                } else if (validity.rangeUnderflow) {
                    this.setState({ errAmount: { class: classNameInvalid, message: locale.t('minAmountDepositErr', { name: depositeFromData.name, num: min }), status: true } })
                } else if (value === '') {
                    this.setState({ errAmount: { class: classNameInvalid, message: locale.t('amountNotEmpty'), status: true } })
                } else {
                    this.setState({ amount: value, errAmount: { class: '', message: '', status: false } })
                }
                break;
        }
    }
    handleSetChecked = (e) => {
        this.setState({ [`${e.target.name}`]: e.target.checked })
    }
    handleSubmitStep1 = event => {
        event.preventDefault();
        event.stopPropagation();
        const { depositeFromData, paymentForm, exitCard, bonusAction } = this.state
        const { userInfo } = this.props
        let form = event.target
        let e = form.elements
        this.loadBlock.isOpen(true)
        if (form.checkValidity() === false) {
            if (!isUndefined(paymentForm.fields) && !isUndefined(paymentForm.fields['card-number']) && !paymentForm.fields['card-number'].valid) {
                this.setState({ errCardNumber: { class: 'was-validated has-error', message: locale.t('cardInvalid'), status: true } }, () => {
                    if (this.loadBlock) this.loadBlock.isOpen(false)
                })
            } else {
                this.setState({ validated_1: true })
                if (this.loadBlock) this.loadBlock.isOpen(false)
            }
            event.preventDefault();
            event.stopPropagation();
        } else {
            let bonusCode = ''
            if (bonusAction === 2 && e['bonuses']) {
                bonusCode = e['bonuses'].value
            } else if (bonusAction === 3 && e['selectedBonusCode']) {
                bonusCode = e['selectedBonusCode'].value
            }

            var custom = JSON.parse(window.getJsonBrowserSettings());
            var customFields = {
                BrowserAcceptHeader: custom.customer_browser_acceptHeader,
                BrowserLanguage: custom.customer_browser_language,
                BrowserScreenHeight: custom.customer_browser_screenHeight,
                BrowserScreenWidth: custom.customer_browser_screenWidth,
                BrowserTimeZoneOffset: custom.customer_browser_timezone,
                BroserJavaEnabled: custom.customer_browser_javaEnabled,
                BrowserColorDepth: window.screen.colorDepth,
                BrowserUserAgent: custom.customer_browser_userAgent,
                BrowserDeviceId: custom.customer_browser_deviceId

            }

            if (depositeFromData.paymentMethodCode == 'MoneyMatrix_CreditCard') {
                if (exitCard) {

                    let cardToken = e['payCardID'].selectedOptions[0].getAttribute('data-cardtoken')
                    paymentForm.submitCvv({
                        CardToken: cardToken
                    }).then(
                        (res) => {
                            if (res.Success) {
                                let param = {
                                    paymentMethodCode: 'MoneyMatrix_CreditCard',
                                    fields: {
                                        gamingAccountID: e['gamingAccountID'].value,
                                        currency: userInfo.currency,
                                        amount: e['amount'].value,
                                        payCardID: e['payCardID'].value,
                                        bonusCode,
                                        returnURL: returnURL
                                    },
                                    customFields: customFields,
                                    icon: depositeFromData.icon
                                }
                                this._prepare(param)

                            } else {
                                //const set = { messageTitle: locale.t('informations'), messageDesc: locale.t('mrXBet'), messageDetail: locale.t('canNotDepositContactSupport'), messageType: 'error' }
                                if (this.loadBlock) this.loadBlock.isOpen(false)
                                //this.props.onSetMessageModal(set)
                            }
                        },
                        (err) => {
                            //const set = { messageTitle: locale.t('error'), messageDesc: locale.t('cardSercurityCode'), messageDetail: locale.t('cvvInvalid'), messageType: 'error' }
                            if (this.loadBlock) this.loadBlock.isOpen(false)
                            //this.props.onSetMessageModal(set)
                        }
                    )

                } else {
                    if (!isUndefined(paymentForm.fields) && !isUndefined(paymentForm.fields['card-number']) && !paymentForm.fields['card-number'].valid) {
                        this.setState({ errCardNumber: { class: 'was-validated has-error', message: locale.t('cardInvalid'), status: true } }, () => {
                            if (this.loadBlock) this.loadBlock.isOpen(false)
                        })
                    } else {
                        paymentForm.submit().then(
                            (res) => {
                                if (res.Success) {
                                    let month = e['month'].value >= 10 ? e['month'].value : `0${e['month'].value}`
                                    let expiryDate = `${month}/${e['year'].value}`
                                    let param = {
                                        paymentMethodCode: depositeFromData.paymentMethodCode,
                                        fields: {
                                            cardToken: res.Data.CardToken,
                                            cardHolderName: e['txtName'].value,
                                            cardExpiryDate: expiryDate,
                                            displayCardNumber: !isNull(res.Data.ResponseDisplayText) ? res.Data.ResponseDisplayText : '',
                                            returnURL: returnURL
                                        },
                                        icon: depositeFromData.icon
                                    }

                                    DepositService.getRegisterPayCard(param).then(
                                        (res) => {
                                            paymentForm.submitCvv({ CardToken: res.registeredPayCard.cardToken }).then(
                                                (dataCvv) => {
                                                    if (dataCvv.Success) {
                                                        let paramPrepare = {
                                                            paymentMethodCode: 'MoneyMatrix_CreditCard',
                                                            fields: {
                                                                gamingAccountID: e['gamingAccountID'].value,
                                                                currency: userInfo.currency,
                                                                amount: e['amount'].value,
                                                                payCardID: res.registeredPayCard.id,
                                                                bonusCode,
                                                                returnURL: returnURL
                                                            },
                                                            customFields: customFields,
                                                            icon: depositeFromData.icon
                                                        }
                                                        this._prepare(paramPrepare)

                                                    } else {
                                                        const set = { messageTitle: locale.t('informations'), messageDesc: window.location.hostname, messageDetail: locale.t('canNotDepositContactSupport'), messageType: 'error' }
                                                        if (this.loadBlock) this.loadBlock.isOpen(false)
                                                        this.props.onSetMessageModal(set)
                                                    }
                                                },
                                                (err) => {
                                                    const set = { messageTitle: locale.t('error'), messageDesc: locale.t('cardSercurityCode'), messageDetail: locale.t('cvvInvalid'), messageType: 'error' }
                                                    if (this.loadBlock) this.loadBlock.isOpen(false)
                                                    this.props.onSetMessageModal(set)
                                                }
                                            )
                                        },
                                        (err) => {
                                            const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
                                            if (this.loadBlock) this.loadBlock.isOpen(false)
                                            //this.props.onSetMessageModal(set)
                                        }
                                    )
                                }
                            },
                            (err) => {
                                const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
                                if (this.loadBlock) this.loadBlock.isOpen(false)
                                //this.props.onSetMessageModal(set)
                            })
                    }
                }
            } else {
                let param = {
                    paymentMethodCode: depositeFromData.paymentMethodCode,
                    fields: {
                        gamingAccountID: e['gamingAccountID'].value,
                        currency: userInfo.currency,
                        amount: e['amount'].value,
                        bonusCode,
                        returnURL: returnURL
                    },
                    customFields: customFields,
                    icon: depositeFromData.icon
                }
                const registrationFields = this.GetDynamicRegistrationFields(depositeFromData.fields)
                const alwaysUserInputFields = this.GetDynamicAlwaysUserInputFields(depositeFromData.fields)
                for (var f in alwaysUserInputFields) {
                    if (alwaysUserInputFields[f].fieldProperties.type != 'Label') {
                        if (!isUndefined(e[alwaysUserInputFields[f].fieldKey])) {
                            if (alwaysUserInputFields[f].fieldKey != 'MonitoringSessionId' && alwaysUserInputFields[f].fieldKey != 'PaymentParameterOneTapSessionId' && alwaysUserInputFields[f].fieldKey != 'SkrillUseOneTap') {
                                param.fields[alwaysUserInputFields[f].fieldKey] = e[alwaysUserInputFields[f].fieldKey].value;
                            }
                        }
                    }
                }
                if (exitCard) {
                    param.fields['payCardID'] = e['payCardID'].value;
                } else {
                    for (let rf in registrationFields) {
                        if (registrationFields[rf].fieldProperties.type != 'Label') {
                            if (!isUndefined(e[registrationFields[rf].fieldKey])) {
                                param.fields[registrationFields[rf].fieldKey] = e[registrationFields[rf].fieldKey].value
                            }
                        }
                    }
                }

                if (!isUndefined(e['paymentCryptoCode']) && !isUndefined(e['paymentCryptoCode'].value)) {
                    param.fields.PaymentParameterCryptoCurrency = e['paymentCryptoCode'].value;
                }

                this._prepare(param)

                // if (depositeFromData.fields.payCardID.options.length > 0) {
                //     param.fields['payCardID'] = e['payCardID'].value;
                // }
                // else {
                //     for (var rf in registrationFields) {
                //         if (registrationFields[rf].fieldProperties.type != 'Label') {
                //             if(!isUndefined(e[registrationFields[rf].fieldKey])){
                //                 param.fields[registrationFields[rf].fieldKey] = e[registrationFields[rf].fieldKey].value
                //             }
                //         }
                //     }
                // }

                // for (var f in alwaysUserInputFields) {
                //     if (alwaysUserInputFields[f].fieldProperties.type != 'Label') {
                //         if(!isUndefined(e[alwaysUserInputFields[f].fieldKey])){
                //             if (alwaysUserInputFields[f].fieldKey != 'MonitoringSessionId' && alwaysUserInputFields[f].fieldKey != 'PaymentParameterOneTapSessionId' && alwaysUserInputFields[f].fieldKey != 'SkrillUseOneTap') {
                //                 param.fields[alwaysUserInputFields[f].fieldKey] = e[alwaysUserInputFields[f].fieldKey].value;
                //             }
                //         }
                //     }
                // }

                // this._prepare(param)

            }

        }

        // event.preventDefault();
        // event.stopPropagation();
    }
    handleSubmitStep2 = event => {
        // this.setState

        let form = event.target
        let e = form.elements
        let param = {
            pid: e.pid.value
        }
        this._confirm(param)

        event.preventDefault();
        event.stopPropagation();
    }
    handleScriptCreate() {
        this.setState({ scriptLoaded: false })
    }
    handleScriptError() {
        this.setState({ scriptError: true })
    }
    handleScriptLoad() {
        this.setState({ scriptLoaded: true })
        const { exitCard } = this.state
        const theme = localStorage.getItem('theme-html')
        const background = theme == 'dark' ? '#081009' : '#fff'
        const textColor = theme == 'dark' ? '#fff' : '#000'
        if (exitCard) {
            this.setState({
                paymentForm: new window.CDE.PaymentForm({
                    'card-security-code': {
                        selector: '#credit-card-cvc-wrapper',
                        css: {
                            'display': 'block',
                            'padding': '0.375rem 0.75rem',
                            'font-size': '1rem',
                            'line-height': '1.5',
                            'color': textColor,
                            'background': 'transparent',
                            'background-clip': 'padding-box',
                            'border': '1px solid #32A624',
                            'border-radius': '10px',
                            'transition': 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
                        }
                    }
                })
            })

        } else {
            this.setState({
                paymentForm: new window.CDE.PaymentForm({
                    'card-number': {
                        selector: '#credit-card-number-wrapper',
                        css: {
                            'display': 'block',
                            'width': 'calc(100% - 1.7rem)',
                            'padding': '0.375rem 0.75rem',
                            'font-size': '1rem',
                            'line-height': '1.5',
                            'color': textColor,
                            'background': 'transparent',
                            'background-clip': 'padding-box',
                            'border': '1px solid #32A624',
                            'border-radius': '10px',
                            'transition': 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
                        }
                    },
                    'card-security-code': {
                        selector: '#credit-card-cvc-wrapper',
                        css: {
                            'width': '60%',
                            'display': 'block',
                            'padding': '0.375rem 0.75rem',
                            'font-size': '1rem',
                            'line-height': '1.5',
                            'color': textColor,
                            'background': 'transparent',
                            'background-clip': 'padding-box',
                            'border': '1px solid #32A624',
                            'border-radius': '10px',
                            'transition': 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
                        }
                    }
                })
            })
        }

    }
    handleSelectBank = (bank, card = null) => {

        const payload = {
            "paymentMethodCode": bank,
            "payCardID": ""
        }
        this.loadBlock.isOpen(true)
        DepositService.getPaymentMethod(payload).then(
            (result) => {

                const parameters = {
                    type: "deposit",
                    gamingAccountID: result.fields.gamingAccountID.options[0].id
                }
                DepositService.getApplicableBonuses(parameters).then((res) => {
                    if (!isUndefined(res.bonuses) && res.bonuses.length > 0) {
                        this.setState({ bonuses: res, bonusAction: 1 })
                    }
                }).catch((err) => {
                    console.log('err', err)
                })

                if (isEmpty(result.fields.payCardID.options)) {
                    this.setState({ exitCard: false })
                } else {
                    let cardOption = [];
                    forEach(result.fields.payCardID.options, function (value) {

                        if (value.id) {
                            cardOption.push(<option key={value.id} data-cardtoken={value.cardToken} value={value.id}>{value.name}</option>)
                        } else {
                            cardOption.push(<option key={value.code} value={value.code}>{value.code}</option>)
                        }

                    })
                    this.setState({ exitCard: true, payCardOption: cardOption })
                }
                let gamingAccount = [];
                forEach(result.fields.gamingAccountID.options, function (value) {
                    gamingAccount.push(<option key={value.id} value={value.id}>{value.name}</option>)
                })
                this.setState({ step: 2, depositeFromData: result, gamingAccountID: gamingAccount, bankSelect: bank, card, payCardIdDefault: '' }, () => {
                    if (this.loadBlock) this.loadBlock.isOpen(false)
                })
            },
            (err) => {
                //const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
                if (this.loadBlock) this.loadBlock.isOpen(false)
                //this.props.onSetMessageModal(set)
            }
        )

    }

    getPaymentMethodLink = (method, image, type = null, sub = null, name = '', min = 0, max = 0) => {

        if(min == 0) min = 20;
        if(max == 0) max = 1000;

        const { session: { languagesActive, userInfo: { userID, email, currency } } } = this.props;
        const link = `https://ext.internationalpaymentsolutions.net/?rnd=${userID}&lng=${upperCase(languagesActive)}&email=${email}&method=${method}`;

        let url_external_payment = link;
        if (type !== null) {
            url_external_payment = `${url_external_payment}&p=${type}`;
        }
        if (sub !== null) {
            url_external_payment = `${url_external_payment}&sub=${sub}`;
        }

        // let item = <a className="logo" href={url_external_payment}>
        //         <img className="icon" src={`/static/images/Paymentlogo/${image}`} />
        //     </a>;

        return <PaymentMethod
            methodName={method}
            processingType={locale.t('Instant')}
            transactionLimit={`${getSymbol(currency)}${min} - ${getSymbol(currency)}${max}`}
            redirectURL={url_external_payment}
            imagePath={`/static/images/Paymentlogo/${image}`}
            type='row'
            title={name}
        />;
    }
    showMorePromotion = (id) => {

        const { showMorePromotion } = this.state
        let promotion = {}
        if (isUndefined(showMorePromotion[`${id}`])) {
            promotion[`${id}`] = true

        } else {
            promotion[`${id}`] = !showMorePromotion[`${id}`]
        }
        this.setState({ showMorePromotion: { ...showMorePromotion, ...promotion } })
    }
    checkCard = (evt) => {
        let form = evt.target
        this.setState({ checkCard: { checked: form.checked, id: form.value } })
    }
    GetFieldProperties = (value) => {
        if (value.type === "Boolean") {
            value.type = "CheckBox";
        }
        return value;
    }
    GetDynamicRegistrationFields = (fields) => {
        const registrationFields = []
        if (fields.payCardID != null &&
            fields.payCardID.registrationFields != null) {
            forEach(fields.payCardID.registrationFields, (value, key) => {
                registrationFields.push({ fieldKey: key, fieldProperties: this.GetFieldProperties(value) });
            })
        }

        return registrationFields;
    }
    GetDynamicAlwaysUserInputFields = (fields) => {
        var alwaysUserInputFields = [];
        forEach(fields, (value, key) => {
            if (value != null &&
                value.hasOwnProperty('label') &&
                value.hasOwnProperty('description') &&
                value.hasOwnProperty('type')) {
                alwaysUserInputFields.push({ fieldKey: key, fieldProperties: this.GetFieldProperties(value) });
            }
        })
        return alwaysUserInputFields;

    }
    _prepare = (depositPrepare) => {
        let noRedirect = false;

        if (depositPrepare.paymentMethodCode  === 'MoneyMatrix_CryptoPay') {
            noRedirect = true;
        }

        if (depositPrepare.fields.amount) {
            setCookie('tracking-deposit', depositPrepare.fields.amount, 375)
        }

        DepositService.getPrepare(depositPrepare).then(
            (res) => {
                // res.icon = depositPrepare.icon
                // this.setState({ step: 3, prepareData: res }, () => {
                //     if (this.loadBlock) this.loadBlock.isOpen(false)
                // })
                let param = {
                    pid: res.pid
                }
                this._confirm(param, noRedirect)
            },
            (err) => {
                //const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
                if (this.loadBlock) this.loadBlock.isOpen(false)
                //this.props.onSetMessageModal(set)
            }
        )
    }
    _confirm = (confirmData, noRedirect) => {
        const { userInfo } = this.props
        this.loadBlock.isOpen(true)
        DepositService.getConfirm(confirmData).then(
            (res) => {
                if (res.status == "success") {
                    UserService.getGamingAccounts().then((resWallets) => {
                        if (!isUndefined(resWallets.accounts)) {
                            const real = filter(resWallets.accounts, (o) => !o.isBonusAccount)
                            const bonus = filter(resWallets.accounts, (o) => o.isBonusAccount)
                            let acc = {
                                name: "MainWallet",
                                realMoney: sumBy(real, 'amount'),
                                realMoneyCurrency: head(real).currency,
                                bonusMoney: sumBy(bonus, 'amount'),
                                bonusMoneyCurrency: head(bonus).currency,
                                lockedMoney: 0,
                                lockedMoneyCurrency: null,
                            }
                            localStorage.setItem('balance', JSON.stringify(acc));
                            this.props.onSetWallets(acc)
                        }
                    }).catch((err) => {
                        //const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
                        //this.props.onSetMessageModal(set)
                    })
                    const depositAmount = getCookie('tracking-deposit', document.cookie)
                    if (depositAmount) {
                        this._renderTrackingDeposit(userInfo.userID, depositAmount)
                    }
                    let assignRole = '';
                    let unAssignRole = '';
                    if (userInfo.roles && userInfo.roles.indexOf('loyal_customer') >= 0) {
                        assignRole = '';
                        unAssignRole = '';
                    } else if (userInfo.roles && userInfo.roles.indexOf('new_customer_4') >= 0) {
                        assignRole = 'loyal_customer';
                        unAssignRole = 'new_customer_4';
                    } else if (userInfo.roles && userInfo.roles.indexOf('new_customer_3') >= 0) {
                        assignRole = 'new_customer_4';
                        unAssignRole = 'new_customer_3';
                    } else if (userInfo.roles && userInfo.roles.indexOf('new_customer_2') >= 0) {
                        assignRole = 'new_customer_3';
                        unAssignRole = 'new_customer_2';
                    } else if (userInfo.roles && userInfo.roles.indexOf('new_customer_1') >= 0) {
                        assignRole = 'new_customer_2';
                        unAssignRole = 'new_customer_1';
                    } else if (userInfo.roles && userInfo.roles.indexOf('new_customer_0') >= 0) {
                        assignRole = 'new_customer_1';
                        unAssignRole = 'new_customer_0';
                    } else {
                        assignRole = 'new_customer_1';
                        unAssignRole = 'new_customer_0';
                    }
                    const paramsAssign = {
                        name: assignRole
                    }
                    if (assignRole) {
                        fetchPost('/getUsersRoles', paramsAssign, '').then((resGet) => {

                            if (resGet.status) {
                                if (resGet.data) {
                                    const params = {
                                        roleId: resGet.data.id,
                                        userID: userInfo.userID
                                    }
                                    fetchPost('/assignUserRole', params, '')
                                }
                            }
                        }).catch((err) => {
                            console.log('err', err)
                        })
                    }
                    const paramsUn = {
                        name: unAssignRole
                    }
                    if (unAssignRole) {
                        fetchPost('/getUsersRoles', paramsUn, '').then((resGet) => {
                            if (resGet.status) {
                                if (resGet.data) {
                                    const params = {
                                        roleId: resGet.data.id,
                                        userID: userInfo.userID
                                    }
                                    fetchPost('/removeUserRole', params, '')
                                }
                            }
                        })
                    }

                    this.setState({
                        step: 5,
                        depositStatus: {
                            status: 'success',
                            text: locale.t('depositSuccess'),
                            detail: ''
                        }
                    }, () => {
                        if (this.loadBlock) this.loadBlock.isOpen(false)
                    })
                } else if (res.status == "redirection") {
                    DepositService.getDepositStatusChange(this.statusChange)
                    if (this.loadBlock) {
                        this.loadBlock.isOpen(false)
                    }
                    if (!isUndefined(res.redirectionForm) && res.redirectionForm != '') {
                        // if there is  already a child open, let's set focus on it
                        if (popup && !popup.closed) {
                            popup.focus();
                            return;
                        }
                        // we open a new window.
                        if (!noRedirect) {
                            popup = browser.open('/redirection');
                        }
                        
                        if (popup) {
                            popup.document.write(res.redirectionForm);
                            popup.document.forms[0].submit();
                            setTimeout(() => {
                                // The opener object is created once and only if a window has a parent
                                popup.opener.onOpen("child was opened");
                            }, 0);

                            if (timer === null) {
                                // each two seconds we check if the popup still open or not
                                timer = setInterval(this.watcher, 2000);
                            }
                            return;
                        } else {
                            document.write(res.redirectionForm);
                            document.forms[0].submit();
                        }
                        // this.setState({ step: 4, redirectionForm: res.redirectionForm }, () => {
                        //     if (this.loadBlock) this.loadBlock.isOpen(false)
                        // })
                    }
                }
            },
            (err) => {
                //const set = { messageTitle: locale.t('error'), messageDesc: err.desc.substring(err.desc.indexOf(']') + 1), messageDetail: err.detail, messageType: 'error' }
                if (this.loadBlock) this.loadBlock.isOpen(false)
                //this.props.onSetMessageModal(set)
            }
        )
    }
    statusChange = (data) => {
        const { userInfo } = this.props
        if (popup && !popup.closed) {
            popup.close();
        }
        if (this.loadBlock) this.loadBlock.isOpen(false)
        switch (data.status) {
            case 'success':
                UserService.getGamingAccounts().then((resWallets) => {
                    if (!isUndefined(resWallets.accounts)) {
                        const real = filter(resWallets.accounts, (o) => !o.isBonusAccount)
                        const bonus = filter(resWallets.accounts, (o) => o.isBonusAccount)
                        let acc = {
                            name: "MainWallet",
                            realMoney: sumBy(real, 'amount'),
                            realMoneyCurrency: head(real).currency,
                            bonusMoney: sumBy(bonus, 'amount'),
                            bonusMoneyCurrency: head(bonus).currency,
                            lockedMoney: 0,
                            lockedMoneyCurrency: null,
                        }
                        localStorage.setItem('balance', JSON.stringify(acc));
                        this.props.onSetWallets(acc)
                    }
                }).catch((err) => {
                    //const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
                    //this.props.onSetMessageModal(set)
                })
                const depositAmount = getCookie('tracking-deposit', document.cookie)
                if (depositAmount) {
                    this._renderTrackingDeposit(userInfo.userID, depositAmount)
                }
                let assignRole = '';
                let unAssignRole = '';
                if (userInfo.roles && userInfo.roles.indexOf('loyal_customer') >= 0) {
                    assignRole = '';
                    unAssignRole = '';
                } else if (userInfo.roles && userInfo.roles.indexOf('new_customer_4') >= 0) {
                    assignRole = 'loyal_customer';
                    unAssignRole = 'new_customer_4';
                } else if (userInfo.roles && userInfo.roles.indexOf('new_customer_3') >= 0) {
                    assignRole = 'new_customer_4';
                    unAssignRole = 'new_customer_3';
                } else if (userInfo.roles && userInfo.roles.indexOf('new_customer_2') >= 0) {
                    assignRole = 'new_customer_3';
                    unAssignRole = 'new_customer_2';
                } else if (userInfo.roles && userInfo.roles.indexOf('new_customer_1') >= 0) {
                    assignRole = 'new_customer_2';
                    unAssignRole = 'new_customer_1';
                } else if (userInfo.roles && userInfo.roles.indexOf('new_customer_0') >= 0) {
                    assignRole = 'new_customer_1';
                    unAssignRole = 'new_customer_0';
                } else {
                    assignRole = 'new_customer_1';
                    unAssignRole = 'new_customer_0';
                }
                const paramsAssign = {
                    name: assignRole
                }
                if (assignRole) {
                    fetchPost('/getUsersRoles', paramsAssign, '').then((resGet) => {

                        if (resGet.status) {
                            if (resGet.data) {
                                const params = {
                                    roleId: resGet.data.id,
                                    userID: userInfo.userID
                                }
                                fetchPost('/assignUserRole', params, '')
                            }
                        }
                    }).catch((err) => {
                        console.log('err', err)
                    })
                }
                const paramsUn = {
                    name: unAssignRole
                }
                if (unAssignRole) {
                    fetchPost('/getUsersRoles', paramsUn, '').then((resGet) => {
                        if (resGet.status) {
                            if (resGet.data) {
                                const params = {
                                    roleId: resGet.data.id,
                                    userID: userInfo.userID
                                }
                                fetchPost('/removeUserRole', params, '')
                            }
                        }
                    })
                }
                this.setState({
                    step: 5, depositStatus: {
                        status: 'success',
                        text: locale.t('depositSuccess'),
                        detail: ''
                    }
                })
                break;
            case 'cancel':
                this.setState({
                    step: 5, depositStatus: {
                        status: 'warning',
                        text: locale.t('depositCancel'),
                        detail: ''
                    }
                })
                break;

            case 'error':
                this.setState({
                    step: 5, depositStatus: {
                        status: 'danger',
                        text: locale.t('depositFail'),
                        detail: ''
                    }
                })
                break;
            default:
                this.setState({
                    step: 5, depositStatus: {
                        status: 'danger',
                        text: data.desc || locale.t('depositFail'),
                        detail: ''
                    }
                })
                break;
        }
    }
    _bankCategoryListRender = () => {
        const { category } = this.state
        const { userInfo } = this.props
        let bankRender = []

        const italyUser = userInfo.userCountry === 'IT' ? true : false;
        if (isArray(category) && category.length > 0) {
            if (category.find(x => x.code == 'credit-card').paymentMethods.length) {
                var res = category.find(x => x.code == 'credit-card').paymentMethods[0]
                bankRender.push(
                    <Fragment key={0}>
                        <Row className="deposit-category-header">
                            <Col md="12">
                                <p className="title">{locale.t('creditCards')}</p>
                            </Col>
                        </Row>
                        <div className="payment-list-row">
                            {/* <div className="logo" onClick={(evt) => this.handleSelectBank('MoneyMatrix_CreditCard')} dangerouslySetInnerHTML={{ __html: res.icon }}>
                            </div> */}
                            {/* {this._visaVIP()} */}
                            {/* {this.getPaymentMethodLink('pcc', 'pcc.png')} */}
                            {/* <a className="logo" onClick={(evt) => this.handleSelectBank('MoneyMatrix_CreditCard')}>
                                <img className="icon" src={`/static/images/Paymentlogo/visa-ms.png`} />
                            </a> */}
                            <PaymentMethod
                                methodName={'MoneyMatrix_CreditCard'}
                                processingType={locale.t('Instant')}
                                transactionLimit={`${getSymbol(userInfo.currency || "€")}20 - ${getSymbol(userInfo.currency || "€")}1000`}
                                getPaymentMethodCfg={this.handleSelectBank}
                                payment={res}
                                imagePath={`/static/images/Paymentlogo/visa-ms.png`}
                                type='row'
                            />
                            {this.getPaymentMethodLink('ips', 'visa-mastercard.png', null, null, "Credit Card (EC)", 10, 1000)}
                            {italyUser && this.getPaymentMethodLink('ips', 'cartasi.svg', null, null, "CartaSì", 20, 1000)}
                            {italyUser && this.getPaymentMethodLink('ips', 'postepay.svg', null, null, "Postepay", 20, 1000)}
                            {/*this.getPaymentMethodLink('ap', 'apple.png', null, null, "Apple Pay", 10, 1000)*/}
                            {/*this.getPaymentMethodLink('gp', 'gpay.png', null, null, "Google Pay", 10, 1000)*/}

                        </div>
                    </Fragment>
                )
            }
            else {
                bankRender.push(
                    <Fragment key={1}>
                        <Row className="deposit-category-header">
                            <Col md="12">
                                <p className="title">{locale.t('creditCards')}</p>
                            </Col>
                        </Row>
                        <div className="payment-list-row">
                            {/* {this._visaVIP()} */}
                            {this.getPaymentMethodLink('pcc.png')}
                            {this.getPaymentMethodLink('ips', 'ec.png', null, null, "Credit Card (EC)", 10, 1000)}
                            {/*this.getPaymentMethodLink('ap', 'apple.png', null, null, "Apple Pay")*/}
                        </div>
                    </Fragment>
                )
            }
            if (category.find(x => x.code == 'e-wallet')) {
                var res = category.find(x => x.code == 'e-wallet')
                bankRender.push(
                    <Fragment key={2}>
                        <Row className="deposit-category-header">
                            <Col md="12">
                                <p className="title" >{locale.t(res.code)}</p>
                            </Col>
                        </Row>
                        <div className="payment-list-row">
                            {userInfo.userCountry == 'TR' ? this.getPaymentMethodLink("maksipara", 'maksibanka.png', "bank_transfer", null, 'Maksibanka') : null}
                            {userInfo.userCountry == 'TR' ? this.getPaymentMethodLink("maksipara", 'payfix.png', "payfix", null, 'Payfix') : null}
                            {userInfo.userCountry == 'TR' ? this.getPaymentMethodLink("maksipara", 'papara.png', "papara", null, 'Papara') : null}
                            {this._crypto(res.paymentMethods)}
                            {/*this.getPaymentMethodLink('bt', 'bank_transfer.png')*/}
                            {userInfo.userCountry != 'DE' ? this.getPaymentMethodLink('bt', 'bank_transfer.png', null, null, "Bank Transfer", 20, 900) : null}
                            {/*this.getPaymentMethodLink('re', 'revolut.png')*/}
                            {userInfo.userCountry != 'DE' ? this.getPaymentMethodLink('re', 'revolut.png', null, null, 'Revolut', 10, 1000) : null}
                            {this._bankListRender(res.paymentMethods)}
                            {userInfo.userCountry == 'BR' || userInfo.userCountry == 'CL' || userInfo.userCountry == 'MX' || userInfo.userCountry == 'EC' || userInfo.userCountry == 'PE' || userInfo.userCountry == 'CR' ? this.getPaymentMethodLink('tbl', 'tbl.png', null, null, "Transferencia Bancaria Local") : null}
                            {userInfo.userCountry == 'BR' ? this.getPaymentMethodLink('pix', 'pix.png', null, null, 'Pix') : null}
                            {this._localTransfer()}
                            {this.getPaymentMethodLink('ez', 'ez.png', null, null, 'eZeeWallet', 10, 2500)}
                            {/* {userInfo.userCountry == 'FR' ? this.getPaymentMethodLink('cz', 'cz.png') : null} */}
                        </div>
                    </Fragment>
                )
            }
            if (category.find(x => x.code == 'pre-paid-card').paymentMethods.length) {
                var res = category.find(x => x.code == 'pre-paid-card')
                bankRender.push(
                    <Fragment key={3}>
                        <Row className="deposit-category-header">
                            <Col md="12">
                                <p className="title" >{res.name}</p>
                            </Col>
                        </Row>
                        <div className="payment-list-row">
                            {this._bankListRender(res.paymentMethods)}
                            {/*this.getPaymentMethodLink('ps', 'paysafe.png', null, null, 'Paysafecard')*/}
                            {this.getPaymentMethodLink('vc', 'jeton-cash.png', null, 'jo', 'Jeton Cash', 10, 100)}
                            {/*this.getPaymentMethodLink('vc', 'neosurf.png', null, 'ns', 'Neosurf', 10, 1000)*/}
                            {this.getPaymentMethodLink('fx', 'flexepin.png', null, null, 'Flexepin', 10, 250)}
                        </div>
                    </Fragment>
                )
            }
            if (category.find(x => x.code == 'bank-transfer').paymentMethods.length) {
                var res = category.find(x => x.code == 'bank-transfer')
                const bankPayment = this._bankListRender(res.paymentMethods);
                if (bankPayment.length > 0) {
                    bankRender.push(
                        <Fragment key={4}>
                            <Row className="deposit-category-header">
                                <Col md="12">
                                    <p className="title" >{res.name}</p>
                                </Col>
                            </Row>
                            <div className="payment-list-row">
                                {this._bankListRender(res.paymentMethods)}
                            </div>
                        </Fragment>
                    )
                }
            }

        }

        return bankRender
    }

    _visaVIP = (res) => {
        const { session: { languagesActive, userInfo: { userID, email, currency } } } = this.props
        let url_external_payment = `https://ext.internationalpaymentsolutions.net/?rnd=${userID}&lng=${upperCase(languagesActive)}&email=${email}`;
        return (<Row>
            <Col md="10" xs="6">
                <Row>
                    <Col md="3" xs="12" className="p-0">
                        <div className="logo pl-1">
                            <img className="icon" src="/static/images/visa_2.png" />
                        </div>
                    </Col>
                    <Col md="9" xs="12" className="pl-0 d-none d-md-block">
                        <div className="detail-payment">
                            <p><b>{locale.t('vipCard')}</b></p>
                            <div className="detail-payment-group">
                                <div className="group-t0">
                                    <p className="text-capitalize"><b>{locale.t('processing')}</b></p>
                                    <p >{locale.t('Instant')}</p>
                                </div>
                                <div className="group-t0">
                                    <p className="text-capitalize"><b>{locale.t('transactionLimit')}</b></p>
                                    <p >{getSymbol(res.depositLimit.currency)}10 - {getSymbol(res.depositLimit.currency)}{res.depositLimit.max}</p>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Col>
            <Col md="2" xs="6" className="p-0">
                <Col md="12" xs="12" className="p-0 d-block d-sm-block d-md-none">
                    <p><b>{locale.t('vipCard')}</b></p>
                    <p><p className="text-capitalize"><b>{locale.t('processing')}</b></p>{locale.t('Instant')}</p>
                    <p><p className="text-capitalize"><b>{locale.t('transactionLimit')}</b></p> {getSymbol(res.depositLimit.currency)}10 - {getSymbol(res.depositLimit.currency)}{res.depositLimit.max}</p>
                </Col>
                <Row>
                    <Col className="text-right">
                        <a className="w-auto m-0 d-inline-block" href={url_external_payment}>
                            <Button variant="success">
                                {locale.t('deposit')}
                            </Button>
                        </a>
                    </Col>
                </Row>
            </Col>
        </Row>
        )
    }

    _crypto = (paymentMethods) => {
        const { userInfo } = this.props;
        let bankRender = []
        if (paymentMethods.find(x => x.code == 'MoneyMatrix_CoinsPaid')) {
            var res = paymentMethods.find(x => x.code == 'MoneyMatrix_CoinsPaid');
            let html = (
                // <a key={res.code} className="logo" onClick={(evt) => this.handleSelectBank(res.code)}>
                //     <img className="icon" src="/static/images/Paymentlogo/crypto.png" />
                // </a>
                <PaymentMethod
                methodName={'Crypto'}
                processingType={locale.t('Instant')}
                transactionLimit={`${getSymbol(userInfo.currency || "€")}30 - ${getSymbol(userInfo.currency || "€")}5000`}
                getPaymentMethodCfg={this.handleSelectBank}
                payment={res}
                imagePath={"/static/images/Paymentlogo/crypto.png"}
                type='row'
            />
            )
            bankRender.push(html)
        }
        return bankRender;
    }

    _localTransfer = () => {
        const { session: { languagesActive, userInfo: { userID, email, currency } } } = this.props
        if (isUndefined(userID) || (email != 'domenico@alstonalliance.com' && email != 'treasury@web-servicesonline.com' && email != 'test102@cybeleservices.com')) return null
        return this.getPaymentMethodLink('lt', 'localtransfer.png', null, null, "Local Transfer", 10, 900);
    }

    _bankListRender = (paymentMethods) => {
        const { userInfo } = this.props;
        let bankRender = []
        if (isArray(paymentMethods) && paymentMethods.length > 0) {
            forEach(paymentMethods, (res) => {
                if (res.code != 'MoneyMatrix_CoinsPaid'
                    && res.code != 'MoneyMatrix_CryptoPay'
                    && res.code != 'MoneyMatrix_CreditCard'
                    && res.code != 'MoneyMatrix_MiFinity_Wallet') {

                    let imgPath = "";
                    let min = 20;
                    let max = 1000;
                    switch (res.name) {
                        case "Jeton":
                            imgPath = "/static/images/Paymentlogo/jeton-wallet.png";
                            max = 5000;
                            break;
                        case "MiFinity Wallet":
                            imgPath = "/static/images/Paymentlogo/mifinity.png";
                            min = 10;
                            break;
                        case "E-Pro CASHlib":
                            imgPath = "/static/images/Paymentlogo/cashlib.jpeg";
                            min = 1;
                            max = 150;
                            break;
                        default:
                            imgPath = null;
                            break;
                    }

                    // let html = (
                    //     <div key={res.code} className="logo" onClick={(evt) => this.handleSelectBank(res.code)}>
                    //         <img src={imgPath} className='Icon' />
                    //     </div>
                    // )
                    let html = (
                        <PaymentMethod
                            methodName={res.name}
                            processingType={locale.t('Instant')}
                            transactionLimit={`${getSymbol(userInfo.currency || "€")}${min} - ${getSymbol(userInfo.currency || "€")}${max}`}
                            getPaymentMethodCfg={this.handleSelectBank}
                            payment={res}
                            imagePath={imgPath}
                            type='row'
                        />
                    );
                    imgPath !== null && bankRender.push(html)
                }
            })
        }
        return bankRender
    }

    openPopup = (e, id) => {
        const data = {
            isOpen: true,
            id,
            type: 'bonus'
        }
        this.props.onSetAllModal(data)
        e.preventDefault();
        e.stopPropagation();
    }
    renderItem = (e) => {
        const { bankSelect } = this.state
        let layout = null
        if (e === 1) {
            layout = <LayoutStep1
                {...this.state}
                {...this.props}
                _bankCategoryListRender={this._bankCategoryListRender()}
                handleChange={(e) => this.handleChange(e)}
                handleSetChecked={(e) => this.handleSetChecked(e)} />
        } else if (e === 2) {
            if (bankSelect == 'MoneyMatrix_CreditCard') {
                layout = <LayoutCreditCard
                    {...this.state}
                    {...this.props}
                    _bankCategoryListRender={this._bankCategoryListRender()}
                    handleChange={(e) => this.handleChange(e)}
                    handleSetChecked={(e) => this.handleSetChecked(e)}
                    handleSubmitStep1={(e) => this.handleSubmitStep1(e)}
                    handleScriptCreate={(e) => this.handleScriptCreate(e)}
                    handleScriptError={(e) => this.handleScriptError(e)}
                    handleScriptLoad={(e) => this.handleScriptLoad(e)}
                    handleBlur={(e) => this.handleBlur(e)}
                    handleClick={(e) => this.handleClick(e)}
                    setBonusAction={(e) => this.setState({ bonusAction: e })}
                    openPopup={(e, id) => this.openPopup(e, id)}
                />
            }
            else if (bankSelect == 'MoneyMatrix_CryptoPay' || bankSelect == 'MoneyMatrix_CoinsPaid') {
                layout = <LayoutCrypto
                    {...this.state}
                    {...this.props}
                    _bankCategoryListRender={this._bankCategoryListRender()}
                    handleChange={(e) => this.handleChange(e)}
                    handleSetChecked={(e) => this.handleSetChecked(e)}
                    handleSubmitStep1={(e) => this.handleSubmitStep1(e)}
                    handleScriptCreate={(e) => this.handleScriptCreate(e)}
                    handleScriptError={(e) => this.handleScriptError(e)}
                    handleScriptLoad={(e) => this.handleScriptLoad(e)}
                    handleBlur={(e) => this.handleBlur(e)}
                    handleClick={(e) => this.handleClick(e)}
                    setBonusAction={(e) => this.setState({ bonusAction: e })}
                    setDepositeFromData={(e) => { this.setState({ depositeFromData: { ...this.state.depositeFromData, paymentMethodCode: e } }) }}
                    openPopup={(e, id) => this.openPopup(e, id)}
                />
            }
            else {
                layout = <LayoutOtherCard
                    {...this.state}
                    {...this.props}
                    _bankCategoryListRender={this._bankCategoryListRender()}
                    handleChange={(e) => this.handleChange(e)}
                    handleSetChecked={(e) => this.handleSetChecked(e)}
                    handleSubmitStep1={(e) => this.handleSubmitStep1(e)}
                    handleScriptCreate={(e) => this.handleScriptCreate(e)}
                    handleScriptError={(e) => this.handleScriptError(e)}
                    handleScriptLoad={(e) => this.handleScriptLoad(e)}
                    handleBlur={(e) => this.handleBlur(e)}
                    handleClick={(e) => this.handleClick(e)}
                    setBonusAction={(e) => this.setState({ bonusAction: e })}
                    openPopup={(e, id) => this.openPopup(e, id)}
                />
            }

        } else if (e === 3) {
            layout = <LayoutStep3
                {...this.state}
                handleSubmitStep2={(e) => this.handleSubmitStep2(e)}
                handleClick={(e) => this.handleClick(e)}
            />
        } else if (e === 4) {
            layout = <LayoutStep4
                {...this.state}
                frameData={this.frame}
            />

        } else if (e === 5) {
            layout = <LayoutStep5
                {...this.state}
                handleClick={(e) => this.handleClick(e)}
            />

        }
        return layout
    }

    handleChangeFilter = (event) => {

        let form = event.target
        switch (form.name) {
            case 'country':
                this.setState({
                    countriesDefault: form.value
                })
                break;
            case 'currency':
                this.setState({
                    currencyDefault: form.value
                })
                break;
        }
    }
    handleSubmitFilter = (event) => {

        this.setState({ isLoadFilter: true })

        this.getCategoryPagmentMethodByFilter()
        event.preventDefault();
        event.stopPropagation();

    }
    getCategoryPagmentMethodByFilter = async () => {
        try {
            const { session, userInfo } = this.props
            const { countriesDefault, currencyDefault } = this.state
            let payload = {
                "filterByCountry": countriesDefault,
                "currency": currencyDefault
            }
            if (!isUndefined(session.isLogin) && session.isLogin) {
                payload = {
                    "filterByCountry": userInfo.userCountry,
                    "currency": userInfo.currency
                }
            }
            const resultPagmentMethod = await DepositService.getCategoryPagmentMethod(payload)
            if (!isUndefined(resultPagmentMethod) && !isUndefined(resultPagmentMethod.categories)) {
                this.setState({
                    category: resultPagmentMethod.categories,
                    isLoadFilter: false
                })
            }
        } catch (error) {

        }
    }
    nextDeposit = (e) => {
        this.handleSelectBank(e.code, e)
    }

    checkFtd = () => {
        UserService.getNetDeposit().then(
            (res) => {
                this.setState({
                    isFtd: res.totalDeposits < 200
                })
            }
        )
    }

    renderItemRegistered = () => {
        const { cardPaymentMethods } = this.state
        let cardRegistered = []
        if (!isUndefined(cardPaymentMethods) && isArray(cardPaymentMethods) && cardPaymentMethods.length > 0) {
            forEach(cardPaymentMethods, (res, index) => {
                if (res.name != 'CoinsPaid') {
                    if (res.name != 'CryptoPay') {
                        cardRegistered.push(
                            <Col md="4" xs={12} key={`category-2-${index}`}>
                                <a onClick={() => this.nextDeposit(res)}>
                                    <div className="box-card">
                                        <div className="box-card-1">
                                            <div className="logo pl-1" dangerouslySetInnerHTML={{ __html: res.icon }}>
                                            </div>
                                        </div>
                                        <div className="box-card-2">
                                            <p className="m-0 text-1" >{res.name}</p>
                                            <p className="m-0 text-2" >{res.payCard.name != 'Interac' ? res.payCard.name : ''}</p>
                                        </div>
                                    </div>
                                </a>
                            </Col>
                        )
                    }
                }
                else {
                    cardRegistered.push(
                        <Col md="4" xs={12} key={`category-3-${index}`}>
                            <a onClick={() => this.nextDeposit(res)}>
                                <div className="box-card">
                                    <div className="box-card-1">
                                        <div className="logo pl-1">
                                            <img className="icon" src="/static/images/crypto.png" />
                                        </div>
                                    </div>
                                    <div className="box-card-2">
                                        <p className="m-0 text-1" >Crypto</p>
                                        <p className="m-0 text-2" ></p>
                                    </div>
                                </div>
                            </a>
                        </Col>
                    )
                }
            })
        }

        return <Fragment >
            <Row className="deposit-category-header">
                <Col md="12">
                    <p className="title text-uppercase" >{locale.t('textRegisteredCredit')}</p>
                </Col>
            </Row>
            <Row className="deposit-category-header registered">
                {cardRegistered}
            </Row>
        </Fragment>

    }
    _renderTrackingDeposit = (userID, amount) => {
        const { userInfo } = this.props
        let lastLoginTime = new Date()
        if (!isNull(userInfo.lastLoginTime)) {
            lastLoginTime = new Date(userInfo.lastLoginTime)
        }
        const params = {
            type: "Deposit",
            startTime: moment.utc(lastLoginTime).subtract(1, "year").startOf('day').toISOString(),
            endTime: moment.utc(new Date()).endOf('day').toISOString(),
            pageIndex: 1,
            pageSize: 2
        }
        UserService.getNetDeposit().then(
            (res) => {
                if (res.totalDeposits < 200) {
                    window._adftrack = Array.isArray(window._adftrack) ? window._adftrack : (window._adftrack ? [window._adftrack] : []);
                    window._adftrack.push({
                        HttpHost: 'track.adform.net',
                        pm: 2667344,
                        divider: encodeURIComponent('|'),
                        pagename: encodeURIComponent('Exclusivebet_FTD'),
                        order: {
                            sales: `${amount}`,
                            orderid: `${userID}`,
                            currency: 'EUR'
                        }
                    });
                    (function () { var s = document.createElement('script'); s.type = 'text/javascript'; s.async = true; s.src = 'https://s2.adform.net/banners/scripts/st/trackpoint-async.js'; var x = document.getElementsByTagName('script')[0]; x.parentNode.insertBefore(s, x); })();
                }
                else {
                    window._adftrack = Array.isArray(window._adftrack) ? window._adftrack : (window._adftrack ? [window._adftrack] : []);
                    window._adftrack.push({
                        HttpHost: 'track.adform.net',
                        pm: 2667344,
                        divider: encodeURIComponent('|'),
                        pagename: encodeURIComponent('Exclusivebet_Recurring_Deopsit'),
                        order: {
                            sales: `${amount}`,
                            orderid: `${userID}`,
                            currency: 'EUR'
                        }
                    });
                    (function () { var s = document.createElement('script'); s.type = 'text/javascript'; s.async = true; s.src = 'https://s2.adform.net/banners/scripts/st/trackpoint-async.js'; var x = document.getElementsByTagName('script')[0]; x.parentNode.insertBefore(s, x); })();
                }
            }
        )
    }
    render() {
        const { session } = this.props
        const { step, countryShow, currencyShow, countriesDefault, currencyDefault, isLoadFilter, cardPaymentMethods } = this.state

        return (
            <div className="deposit-page">
                <div className="content-step p-0">
                    <Row className="m-0">
                        <Col>
                            <h2 className="pb-3 DepositTitle">{locale.t('depositText1')}</h2>
                        </Col>
                    </Row>
                    {
                        step === 1 && cardPaymentMethods.length ?
                            <div className="deposit-form">
                                {this.renderItemRegistered()}
                            </div>
                            : null
                    }
                    {
                        // step === 1 && !session.isLogin &&
                        // <Row className="filter-layout">
                        //     <Form noValidate className="w-100 filter-payment" onSubmit={(e) => this.handleSubmitFilter(e)}>
                        //         <Col md={5} xs={12} className="mt-2">
                        //             <p>{locale.t('chooseCountry')}</p>
                        //             <Form.Control name="country" as="select" componentclass="select" value={countriesDefault} onChange={(e) => this.handleChangeFilter(e)} >
                        //                 {countryShow}
                        //             </Form.Control>
                        //         </Col>
                        //         <Col md={5} xs={12} className="mt-2">
                        //             <p>{locale.t('chooseCurrency')}</p>
                        //             <Form.Control name="currency" as="select" componentclass="select" value={currencyDefault} onChange={(e) => this.handleChangeFilter(e)} >
                        //                 {currencyShow}
                        //             </Form.Control>
                        //         </Col>
                        //         <Col md={2} xs={12} className="align-self-end text-right pr-3 pr-md-0 pt-md-0 pt-3">
                        //             <Button className={`btn-3`} type="submit">
                        //                 {isLoadFilter ? <div className="loading-2" /> : <p className="pl-2 text-uppercase m-0 pr-2">{locale.t('filter')}</p>}

                        //             </Button>
                        //         </Col>
                        //     </Form>
                        // </Row>
                    }
                    <div className="deposit-form">
                        {this.renderItem(step)}
                    </div>
                </div>
                <LoadBlock ref={ref => this.loadBlock = ref} />
                {
                    !isNull(session.isLogin) && session.isLogin && isNull(session.userInfo.lastLoginTime) ?

                        <noscript>
                            <p style="margin:0;padding:0;border:0;">
                                <img src="https://track.adform.net/Serving/TrackPoint/?pm=2667344&ADFPageName=Exclusivebet_Recurring_Deopsit&ADFdivider=|" width="1" height="1" alt="" />
                            </p>
                            <p style={{ margin: 0, padding: 0, border: 0 }}>
                                <img src="https://track.adform.net/Serving/TrackPoint/?pm=2667344&ADFPageName=Exclusivebet_FTD&ADFdivider=|" width="1" height="1" alt="" />
                            </p>
                        </noscript>
                        :
                        null
                }
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    isConnected: state.EM.isConnected,
    session: state.sessionState,
    modals: state.modalsState,
    userInfo: state.sessionState.userInfo,
})

const mapDispatchToProps = (dispatch) => ({
    onSetMessageModal: (active) => dispatch({ type: MESSAGEMODAL, active }),
    onSetWallets: (active) => dispatch({ type: WALLETS, active }),
    onSetAllModal: (active) => dispatch({ type: ALLMODAL, active })
});

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(Deposit)
