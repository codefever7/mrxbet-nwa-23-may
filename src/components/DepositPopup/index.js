import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import '../../../styles/components/_deposit.scss'
import DepositService from '../../services/em/deposit'
import UserService from '../../services/em/user'
import Picture from '../Picture';
import WPService from '../../../services'
import LayoutStep1 from './LayoutStep1'
import LayoutCreditCard from './LayoutCreditCard'
import LayoutOtherCard from './LayoutOtherCard'
import LayoutStep3 from './LayoutStep3'
import LayoutStep4 from './LayoutStep4'
import LayoutStep5 from './LayoutStep5'
import * as routes from '../../constants/routes'
import isUndefined from 'lodash/isUndefined'
import isEmpty from 'lodash/isEmpty'
import isArray from 'lodash/isArray'
import forEach from 'lodash/forEach'
import includes from 'lodash/includes'
import isNull from 'lodash/isNull'
import filter from 'lodash/filter'
import head from 'lodash/head'
import upperCase from 'lodash/upperCase'
import { DEPOSITMODAL, MESSAGEMODAL, ALLMODAL, WALLETS } from "../../constants/types"
import LoadBlock from '../Loading/LoadBlock'
import {
    fetchPost,
    getQueryString,
    getSymbol,
    countriesExclude
} from '../../../utils'
const locale = require('react-redux-i18n').I18n
// Main Window.
let browser = null;
// child window.
let popup = null;
// interval
let timer = null;
let returnURL = null;

export class Deposit extends Component {
    constructor(props) {
        super(props)
        this.state = {
            step: 1,
            showStep: 0,
            validated: false,
            category: [],
            acceptOffer: false,
            promotionsDeposit: [],
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
            isDeposit: false,
            prepareData: '',
            confirmData: '',
            redirectionForm: '',
            depositStatus: { status: '', text: '', detail: '' },
            amount: 0,
            gamingAccountID: '',
            validated_1: false,
            bonuses: null,
            depositBonus: null,
            bonusCode: '',
            countryShow: [],
            currencyShow: [],
            countriesDefault: '',
            currencyDefault: '',
            isLoadFilter: false

        }
        this.frame = this.frame.bind(this);
    }
    frame() {
        let iframeDeposit = document.getElementById('frame_deposit').contentWindow.document;
        iframeDeposit.getElementsByTagName('form')[0].submit();
    }
    componentDidMount() {
        const params = getQueryString('id')
        const status = getQueryString('status')
        const pid = getQueryString('pid')
        let m = []
        let y = []
        for (let i = 1; i <= 12; i++) {
            m.push(<option key={i} value={i}>{i}</option>)
        }
        let yyyy = new Date()
        for (let i = yyyy.getFullYear(); i < yyyy.getFullYear() + 20; i++) {
            y.push(<option key={i} value={i}>{i}</option>)
        }
        this.setState({ paramsId: params, monthShow: m, yearShow: y }, () => {
            if (this.props.modals.depositModal) {
                this.isOpen()
            }
            this.getCategoryPagmentMethod()
        })

        // browser is set to current window
        browser = window.self;
        // each time we send a message will use the `onSuccess`
        browser.onSuccess = (res) => {
            // console.log(' browser.onSuccess',res);
        }

        // each time we failed we will use the `onError`
        browser.onError = (error) => {
            // console.log(' browser.onError',error);
            const set = { messageTitle: locale.t('error'), messageDesc: error.desc, messageDetail: error.detail, messageType: 'error' }
            if (this.loadBlock) this.loadBlock.isOpen(false)
            this.props.onSetMessageModal(set)
        }

        // Tells when a child window is open
        browser.onOpen = (message) => {
            // console.log(' browser.onOpen',message);
        }
        // Tells when a child window is close
        browser.onClose = (message) => {
            // console.log(' browser.onClose',message);
            if (this.loadBlock) this.loadBlock.isOpen(false)
        }
        returnURL = window.location.origin + window.location.pathname
        if (pid !== '') {
            this._redirectDeposit(pid)
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
                const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
                if (this.loadBlock) this.loadBlock.isOpen(false)
                this.props.onSetMessageModal(set)
            })
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
                ct.push(<option key={index} value={res.code}>{res.name}</option>)
            })
            let ccy = []
            let currencyDefault = !isUndefined(userInfo.currency) ? userInfo.currency : 'EUR'
            forEach(resCcy, (res, index) => {
                ccy.push(<option key={index} value={res.code}>{res.name}</option>)
            })
            let payload = {
                "filterByCountry": '',
                "currency": currencyDefault
            }
            if (!isUndefined(session.isLogin) && session.isLogin) {
                payload = {
                    "filterByCountry": userInfo.ipCountry,
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
            const set = { messageTitle: locale.t('error'), messageDesc: error.desc, messageDetail: error.detail, messageType: 'error' }
            this.props.onSetMessageModal(set)
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.modals.depositModal !== this.props.modals.depositModal) {
            if (nextProps.modals.depositModal) {
                if (!isNull(nextProps.modals.depositId)) {
                    this.isOpen(nextProps.modals.depositId)
                } else {
                    this.isOpen()
                }
            }
        }
    }
    isOpen = async (idPromotions = null) => {
        if (this.state.step === 1) {
            if (!isNull(idPromotions)) {
                WPService.getPromotionsByID(this.props.lang, this.props.role, idPromotions).then((res) => {
                    if (res) {
                        let setBonusCode = ''
                        if (!isUndefined(res.data) && isArray(res.data)) {
                            const id = filter(res.data, (o) => o.id === idPromotions)
                            if (head(id) && !isUndefined(head(id).bonusCode)) {
                                setBonusCode = head(id).bonusCode
                            }
                        }
                        this.setState({
                            promotionsDeposit: res,
                            paramsId: idPromotions,
                            bonusCode: setBonusCode
                        })
                    }
                }).catch((err) => {
                    const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
                    this.props.onSetMessageModal(set)
                })
            } else {
                WPService.getPromotions(this.props.lang, this.props.role, this.props.page, 'deposit').then((res) => {
                    if (res) {
                        this.setState({
                            promotionsDeposit: res,
                            bonusCode: ''
                        })
                    }
                }).catch((err) => {
                    const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
                    this.props.onSetMessageModal(set)
                })
            }
        }
        this.setState({
            isDeposit: true
        })
    }
    isClose = () => {
        this.setState({
            isDeposit: false,
            step: 1
        }, () => this.props.onSetDepositModal(false))
    }
    handleChange = (event) => {
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
        if (form.name === 'bonusCode') {
            this.setState({ bonusCode: form.value })
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
        if (e.target.name === 'cpt') {
            if (e.target.checked) {
                this.setState({ [`${e.target.name}`]: e.target.checked, checkPM: '', bonusCode: '' })
            } else {
                this.setState({ [`${e.target.name}`]: e.target.checked })
            }
        } else {
            this.setState({ [`${e.target.name}`]: e.target.checked })
        }
    }
    handleSubmitStep1 = event => {
        event.preventDefault();
        event.stopPropagation();
        const { depositeFromData, paymentForm, exitCard } = this.state
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
            if (!isEmpty(e['bonusCode'].value)) {
                bonusCode = e['bonusCode'].value
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
                                    icon: depositeFromData.icon
                                }
                                this._prepare(param)
                            } else {
                                const set = { messageTitle: locale.t('error'), messageDesc: window.location.hostname, messageDetail: locale.t('canNotDepositContactSupport'), messageType: 'error' }
                                if (this.loadBlock) this.loadBlock.isOpen(false)
                                this.props.onSetMessageModal(set)
                            }
                            event.preventDefault();
                            event.stopPropagation();
                        },
                        (err) => {
                            const set = { messageTitle: locale.t('error'), messageDesc: locale.t('cardSercurityCode'), messageDetail: locale.t('cvvInvalid'), messageType: 'error' }
                            if (this.loadBlock) this.loadBlock.isOpen(false)
                            this.props.onSetMessageModal(set)
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    )

                    event.preventDefault();
                    event.stopPropagation();
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
                                                            }
                                                        }
                                                        this._prepare(paramPrepare)

                                                    } else {
                                                        const set = { messageTitle: locale.t('error'), messageDesc: window.location.hostname, messageDetail: locale.t('canNotDepositContactSupport'), messageType: 'error' }
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
                                            this.props.onSetMessageModal(set)
                                        }
                                    )
                                }
                            },
                            (err) => {
                                const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
                                if (this.loadBlock) this.loadBlock.isOpen(false)
                                this.props.onSetMessageModal(set)
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
            event.preventDefault();
        }
        // event.preventDefault();
        // event.stopPropagation();
    }
    handleSubmitStep2 = event => {
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
                            'background-color': background,
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
                            'width': '80%',
                            'padding': '0.375rem 0.75rem',
                            'font-size': '1rem',
                            'line-height': '1.5',
                            'color': textColor,
                            'background-color': background,
                            'background-clip': 'padding-box',
                            'border': '1px solid #32A624',
                            'border-radius': '10px',
                            'transition': 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
                        }
                    },
                    'card-security-code': {
                        selector: '#credit-card-cvc-wrapper',
                        css: {
                            'display': 'block',
                            'padding': '0.375rem 0.75rem',
                            'font-size': '1rem',
                            'line-height': '1.5',
                            'color': textColor,
                            'background-color': background,
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
    handleSelectBank = (bank) => {
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
                    this.setState({ bonuses: res })
                }).catch((err) => {
                    console.log('err', err)
                })
                this.setState({ bankSelect: bank })
                // if (bank == 'MoneyMatrix_CreditCard') {
                //     if (isEmpty(result.fields.payCardID.options)) {
                //         this.setState({ exitCard: false })
                //     } else {
                //         let cardOption = [];
                //         forEach(result.fields.payCardID.options, function (value) {
                //             if (value.id) {
                //                 cardOption.push(<option key={value.id} data-cardtoken={value.cardToken} value={value.id}>{value.name}</option>)
                //             } else {
                //                 cardOption.push(<option key={value.code} value={value.code}>{value.code}</option>)
                //             }
                //         })
                //         this.setState({ exitCard: true, payCardOption: cardOption })
                //     }
                // }
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
                this.setState({ step: 2, depositeFromData: result, gamingAccountID: gamingAccount, bankSelect: bank }, () => {
                    if (this.loadBlock) this.loadBlock.isOpen(false)
                })
            },
            (err) => {
                const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
                if (this.loadBlock) this.loadBlock.isOpen(false)
                this.props.onSetMessageModal(set)
            }
        )
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
    checkPromotion = (evt, data) => {
        let form = evt.target
        if (form.checked) {
            this.setState({ checkPM: { checked: form.checked, id: form.value }, bonusCode: data.bonusCode })
        } else {
            this.setState({ checkPM: { checked: form.checked, id: form.value }, bonusCode: '' })
        }
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
        DepositService.getPrepare(depositPrepare).then(
            (res) => {
                // res.icon = depositPrepare.icon
                // this.setState({ step: 3, prepareData: res }, () => {
                //     if (this.loadBlock) this.loadBlock.isOpen(false)
                // })
                let param = {
                    pid: res.pid
                }
                this._confirm(param)
            },
            (err) => {
                const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
                if (this.loadBlock) this.loadBlock.isOpen(false)
                this.props.onSetMessageModal(set)
            }
        )
    }
    _confirm = (confirmData) => {
        const { userInfo } = this.props
        this.loadBlock.isOpen(true)
        DepositService.getConfirm(confirmData).then(
            (res) => {
                if (res.status == "success") {
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
                    }, () => {
                        if (this.loadBlock) this.loadBlock.isOpen(false)
                    })
                } else if (res.status == "redirection") {
                    DepositService.getDepositStatusChange(this.statusChange)
                    if (this.loadBlock) {
                        this.loadBlock.isOpen(false)
                    }
                    // if there is  already a child open, let's set focus on it
                    if (popup && !popup.closed) {
                        popup.focus();
                        return;
                    }
                    // we open a new window.
                    popup = browser.open('/redirection');
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
                    // this.setState({ step: 4, redirectionForm: res.redirectionForm }, () => {
                    //     if (this.loadBlock) this.loadBlock.isOpen(false)
                    // })
                }
            },
            (err) => {
                const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
                if (this.loadBlock) this.loadBlock.isOpen(false)
                this.props.onSetMessageModal(set)
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
                    const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
                    this.props.onSetMessageModal(set)
                })
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
    _promotionsRender = () => {
        const { promotionsDeposit, showMorePromotion, paramsId, checkPM, cpt } = this.state
        let promotionsRender = []

        if (isArray(promotionsDeposit.data) && promotionsDeposit.data.length > 0) {
            forEach(promotionsDeposit.data, (res, index) => {
                if (!isUndefined(res.id)) {
                    let image = {};
                    image = res.image
                    image.alt = res.alt;
                    const mh = !isUndefined(showMorePromotion[res.id]) && showMorePromotion[res.id] ? '100%' : 75
                    const text = !isUndefined(showMorePromotion[res.id]) && showMorePromotion[res.id] ? locale.t('hideMore') : locale.t('showMore')
                    const img = !isUndefined(showMorePromotion[res.id]) && showMorePromotion[res.id] ? '/static/images/RegisterPage_DropDown-3.png' : '/static/images/RegisterPage_DropDown-2.png'
                    const backgroundSpan = !isUndefined(showMorePromotion[res.id]) && showMorePromotion[res.id] ? null : <span className="linear-text" />
                    let ck = false
                    if (!cpt) {
                        if (!isEmpty(paramsId.toString()) && isUndefined(checkPM.id) && (paramsId.toString() === res.id.toString())) {
                            ck = true
                        } else if (!isUndefined(checkPM.id) && checkPM.id.toString() === res.id.toString()) {
                            ck = checkPM.checked
                        }
                    }

                    if (ck == true || res.type != "disable") {
                        promotionsRender.push(
                            <Row key={index} className="px-2 content-wp">
                                <Col md={12} className={`block-content py-2`}>
                                    <p className="text-uppercase mb-0" dangerouslySetInnerHTML={{ __html: res.title }} />
                                </Col>
                                <Col md={12} className="px-0">
                                    <Picture item={image} />
                                </Col>
                                <Col md={12} className="px-0 mb-3 des">
                                    <div className="conditions p-3">
                                        <Form.Check checked={ck} value={res.id} onChange={(evt) => this.checkPromotion(evt, res)} name={`acceptTC-${res.id}`} type="checkbox" />
                                        <div className="conditions-content">
                                            <p className="mx-2 my-0">{res.checkboxText}</p>
                                            {/* <a href={`${routes.promotions}/${res.categories}/${res.slug}`} target="_blank"  >{locale.t('terms')}</a>
                                            <p className="mx-2 my-0">{locale.t('formRegisterTextPromotion2AcceptTC')}</p> */}
                                        </div>
                                    </div>
                                    <div className="position-relative">
                                        <p className="px-3 pb-0 mb-0"><a target="_blank" className="text-blue" href={res.categories == 'casino-promotions' ? routes.casinoTerms : routes.sportsTerms}  >{locale.t(res.categories == 'casino-promotions' ? 'casinoTerms' : 'sportsTerms')}</a></p>
                                    </div>
                                    <div className="position-relative">
                                        <div className="px-3" style={{ maxHeight: mh, overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: res.shortDescription }} />
                                        {backgroundSpan}
                                    </div>
                                    <a className="d-flex py-2 text-center align-items-center justify-content-center more" onClick={() => this.showMorePromotion(res.id)}>
                                        <p className="m-0 pr-3">{text}</p>
                                        {/* <LazyLoadImage src={img} alt="Arrow" className="img-fluid" /> */}
                                    </a>
                                </Col>
                            </Row>
                        )
                    }
                }
            })
        } else {
            promotionsRender.push(<LoadBlock key={0} loadTrue={true} />)
        }

        return promotionsRender
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

                    <Fragment key={'key-deposit-0'}>
                        <Row className="deposit-category-header py-3">
                            <Col md="12" className="m-0 p-0">
                                <p className="deposit-title" >{locale.t('creditCards')}</p>
                            </Col>
                        </Row>
                        <div className="payment-list">
                            <a className="logo" onClick={(evt) => this.handleSelectBank('MoneyMatrix_CreditCard')}>
                                <img className="icon" src={`/static/images/Paymentlogo/visa-ms.png`} />
                            </a>
                            {this.getPaymentMethodLink('ips', 'visa-mastercard.png')}
                            {italyUser && this.getPaymentMethodLink('ips', 'cartasi.svg')}
                            {italyUser && this.getPaymentMethodLink('ips', 'postepay.svg')}
                            {this.getPaymentMethodLink('ap', 'apple.png')}
                            {this.getPaymentMethodLink('gp', 'gpay.png')}
                        </div>
                    </Fragment>
                )
            } else {
                bankRender.push(
                    <Fragment key={1}>
                        <Row className="deposit-category-header py-3">
                            <Col md="12" className="m-0 p-0">
                                <p className="deposit-title">{locale.t('creditCards')}</p>
                            </Col>
                        </Row>
                        <div className="payment-list">
                            {/* {this._visaVIP()} */}
                            {this.getPaymentMethodLink('pcc.png')}
                            {this.getPaymentMethodLink('ips', 'ec.png')}
                            {this.getPaymentMethodLink('ap', 'apple.png')}
                        </div>
                    </Fragment>
                )
            }
            if (category.find(x => x.code == 'e-wallet')) {
                var res = category.find(x => x.code == 'e-wallet')
                bankRender.push(
                    <Fragment key={2}>
                        <Row className="deposit-category-header py-3">
                            <Col md="12" className="m-0 p-0">
                                <p className="deposit-title" >{locale.t(res.code)}</p>
                            </Col>
                        </Row>
                        <div className="payment-list">
                            {userInfo.userCountry == 'TR' ? this.getPaymentMethodLink("maksipara", 'maksibanka.png', "bank_transfer") : null}
                            {userInfo.userCountry == 'TR' ? this.getPaymentMethodLink("maksipara", 'payfix.png', "payfix") : null}
                            {userInfo.userCountry == 'TR' ? this.getPaymentMethodLink("maksipara", 'papara.png', "papara") : null}
                            {this._crypto(res.paymentMethods)}
                            {/*this.getPaymentMethodLink('bt', 'bank_transfer.png')*/}
                            {userInfo.userCountry != 'DE' ? this.getPaymentMethodLink('bt', 'bank_transfer.png') : null}
                            {/*this.getPaymentMethodLink('re', 'revolut.png')*/}
                            {userInfo.userCountry != 'DE' ? this.getPaymentMethodLink('re', 'revolut.png') : null}
                            {this._bankListRender(res.paymentMethods)}
                            {userInfo.userCountry == 'BR' || userInfo.userCountry == 'CL' || userInfo.userCountry == 'MX' || userInfo.userCountry == 'EC' || userInfo.userCountry == 'PE' || userInfo.userCountry == 'CR' ? this.getPaymentMethodLink('tbl', 'tbl.png') : null}
                            {userInfo.userCountry == 'BR' ? this.getPaymentMethodLink('pix', 'pix.png') : null}
                            {this._localTransfer()}
                            {this.getPaymentMethodLink('ez', 'ez.png')}
                            {/* {userInfo.userCountry == 'FR' ? this.getPaymentMethodLink('cz', 'cz.png') : null} */}
                        </div>
                    </Fragment>
                )
            }

            if (category.find(x => x.code == 'pre-paid-card').paymentMethods.length) {
                var res = category.find(x => x.code == 'pre-paid-card')
                bankRender.push(
                    <Fragment key={3}>
                        <Row className="deposit-category-header py-3">
                            <Col md="12" className="m-0 p-0">
                                <p className="deposit-title" >{res.name}</p>
                            </Col>
                        </Row>
                        <div className="payment-list">
                            {this._bankListRender(res.paymentMethods)}
                            {this.getPaymentMethodLink('ps', 'paysafe.png')}
                            {this.getPaymentMethodLink('vc', 'jeton-cash.png', null, 'jo')}
                            { /*this.getPaymentMethodLink('vc', 'neosurf.png', null, 'ns')*/}
                            {this.getPaymentMethodLink('fx', 'flexepin.png')}
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
                            <Row className="deposit-category-header py-3">
                                <Col md="12" className="m-0 p-0">
                                    <p className="deposit-title" >{res.name}</p>
                                </Col>
                            </Row>
                            <div className="payment-list">
                                {bankPayment}
                            </div>
                        </Fragment>
                    )
                }
            }

            // forEach(category, (res, index) => {
            //     res.code != 'debit-card' && (isArray(res.paymentMethods) && res.paymentMethods.length > 0) &&
            //         bankRender.push(

            //             <Fragment key={index}>
            //                 <Row className="deposit-category-header">
            //                     <Col md="12 m-0 p-0 ">
            //                         <p className="deposit-title" >{res.name}</p>
            //                     </Col>
            //                 </Row>
            //                 {this._bankListRender(res.paymentMethods)}
            //             </Fragment>
            //         )
            // })
        }

        return bankRender
    }
    // _bankListRender = (paymentMethods) => {
    //     let { userInfo } = this.props
    //     let bankRender = []

    //     if (isArray(paymentMethods) && paymentMethods.length > 0) {
    //         forEach(paymentMethods, (res, index) => {

    //             bankRender.push(
    //                 <Row key={index} className="bank-list">
    //                     <Col md="3" xs="3" className="p-0">
    //                         <div className="deposit-categories-logo" dangerouslySetInnerHTML={{ __html: res.icon }}>
    //                         </div>
    //                     </Col>
    //                     <Col md="5" xs="5" className="pl-0">
    //                         <p><b>{res.name}</b></p>
    //                         <p className="text-capitalize"><b>{locale.t('processing')}</b></p>
    //                         <p >{isEmpty(res.depositProcessingTime) ? '-' : locale.t(res.depositProcessingTime)}</p>
    //                         <p className="text-capitalize"><b>{locale.t('transactionLimit')}</b></p>
    //                         <p >{getSymbol(res.depositLimit.currency)}{res.depositLimit.min} - {getSymbol(res.depositLimit.currency)}{res.depositLimit.max}</p>
    //                     </Col>
    //                     <Col md="4" xs="4" className="p-0 text-right">
    //                         <Button variant="success" onClick={(evt) => this.handleSelectBank(res.code)}>{locale.t('deposit')}</Button>
    //                     </Col>
    //                 </Row>
    //             )
    //         })
    //     }

    //     return bankRender
    // }

    _localTransfer = () => {
        const { session: { languagesActive, userInfo: { userID, email, currency } } } = this.props
        if (isUndefined(userID) || (email != 'domenico@alstonalliance.com' && email != 'treasury@web-servicesonline.com' && email != 'test102@cybeleservices.com')) return null
        return this.getPaymentMethodLink('lt', 'localtransfer.png');
    }

    _crypto = (paymentMethods) => {
        let bankRender = []
        if (paymentMethods.find(x => x.code == 'MoneyMatrix_CoinsPaid')) {
            var res = paymentMethods.find(x => x.code == 'MoneyMatrix_CoinsPaid');
            let html = (
                <a key={res.code} className="logo" onClick={(evt) => this.handleSelectBank(res.code)}>
                    <img className="icon" src="/static/images/Paymentlogo/crypto.png" />
                </a>
            )
            bankRender.push(html)
        }
        return bankRender;
    }

    _bankListRender = (paymentMethods) => {
        let bankRender = []
        if (isArray(paymentMethods) && paymentMethods.length > 0) {
            forEach(paymentMethods, (res) => {
                if (res.code != 'MoneyMatrix_CoinsPaid'
                    && res.code != 'MoneyMatrix_CryptoPay'
                    && res.code != 'MoneyMatrix_CreditCard'
                    && res.code != 'MoneyMatrix_MiFinity_Wallet') {

                    let imgPath = "";
                    switch (res.name) {
                        case "Jeton":
                            imgPath = "/static/images/Paymentlogo/jeton-wallet.png";
                            break;
                        case "MiFinity Wallet":
                            imgPath = "/static/images/Paymentlogo/mifinity.png";
                            break;
                        case "E-Pro CASHlib":
                            imgPath = "/static/images/Paymentlogo/cashlib.jpeg";
                            break;
                        default:
                            imgPath = null;
                            break;
                    }

                    let html = (
                        <div key={res.code} className="logo" onClick={(evt) => this.handleSelectBank(res.code)}>
                            <img src={imgPath} className='Icon' />
                        </div>
                    )
                    imgPath !== null && bankRender.push(html)
                }
            })
        }
        return bankRender
    }

    handleClickPayment = (event,  url) => {
        const { session } = this.props;
        if(session.isLogin){
            window.location.href = url;
        }else{
            //const set = { messageTitle: locale.t('error'), messageDesc: locale.t('textNotLoggedIn'), messageDetail: "", messageType: 'error' }
            //this.props.onSetMessageModal(set)
        }
        event.preventDefault();
    }

    getPaymentMethodLink = (method, image, type = null, sub = null) => {

        const { session: { languagesActive, userInfo: { userID, email, currency } } } = this.props;
        
        const link = `https://ext.internationalpaymentsolutions.net/?rnd=${userID}&lng=${upperCase(languagesActive)}&email=${email}&method=${method}`;

        let url_external_payment = link;
        if (type !== null) {
            url_external_payment = `${url_external_payment}&p=${type}`;
        }
        if (sub !== null) {
            url_external_payment = `${url_external_payment}&sub=${sub}`;
        }

        let item = <a className="logo" onClick={(e) => this.handleClickPayment(e, url_external_payment)}>
            <img className="icon" src={`/static/images/Paymentlogo/${image}`} />
        </a>;

        return item;
    }
    setStateBack = (step) => {
        this.setState({
            step,
            validated: false,
            validated_1: false,
            depositBonus: null,
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
                _promotionsRender={this._promotionsRender()}
                _bankCategoryListRender={this._bankCategoryListRender()}
                handleChange={(e) => this.handleChange(e)}
                handleSetChecked={(e) => this.handleSetChecked(e)} />
        } else if (e === 2) {
            if (bankSelect == 'MoneyMatrix_CreditCard') {
                layout = <LayoutCreditCard
                    {...this.state}
                    {...this.props}
                    _promotionsRender={this._promotionsRender()}
                    _bankCategoryListRender={this._bankCategoryListRender()}
                    handleChange={(e) => this.handleChange(e)}
                    handleSetChecked={(e) => this.handleSetChecked(e)}
                    handleSubmitStep1={(e) => this.handleSubmitStep1(e)}
                    handleScriptCreate={(e) => this.handleScriptCreate(e)}
                    handleScriptError={(e) => this.handleScriptError(e)}
                    handleScriptLoad={(e) => this.handleScriptLoad(e)}
                    handleBlur={(e) => this.handleBlur(e)}
                    handleClick={(e) => this.handleClick(e)}
                    openPopup={(e, id) => this.openPopup(e, id)}
                />
            } else {
                layout = <LayoutOtherCard
                    {...this.state}
                    {...this.props}
                    _promotionsRender={this._promotionsRender()}
                    _bankCategoryListRender={this._bankCategoryListRender()}
                    handleChange={(e) => this.handleChange(e)}
                    handleSetChecked={(e) => this.handleSetChecked(e)}
                    handleSubmitStep1={(e) => this.handleSubmitStep1(e)}
                    handleScriptCreate={(e) => this.handleScriptCreate(e)}
                    handleScriptError={(e) => this.handleScriptError(e)}
                    handleScriptLoad={(e) => this.handleScriptLoad(e)}
                    handleBlur={(e) => this.handleBlur(e)}
                    handleClick={(e) => this.handleClick(e)}
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
    render() {
        const { session } = this.props
        const { step, isDeposit, promotionsDeposit, countryShow, currencyShow, countriesDefault, currencyDefault, isLoadFilter } = this.state

        return (
            <Modal centered show={isDeposit} onHide={() => this.isClose()} className={`deposit `} >
                <Modal.Header>
                    <Modal.Title id="example-modal-sizes-title-sm">
                        <h3 className="title-middle">{locale.t('deposit')}</h3>
                    </Modal.Title>
                    <Row className="row-custom">
                        <Col className="close-icon" >
                            <a onClick={() => this.isClose()}><i className="jb-icon registerpage-x" /></a>
                        </Col>
                    </Row>
                </Modal.Header>
                <Modal.Body>
                    <Container className="content-step">
                        {
                            Object.keys(promotionsDeposit).length > 0 && step === 1 && !session.isLogin &&
                            <Row className="filter-layout">
                                <Form noValidate className="w-100 filter-payment" onSubmit={(e) => this.handleSubmitFilter(e)}>
                                    <Col md={5} className="pt-3">
                                        <p>{locale.t('chooseCountry')}</p>
                                        <Form.Control className="input-form-n1" name="country" as="select" componentclass="select" value={countriesDefault} onChange={(e) => this.handleChangeFilter(e)} >
                                            {countryShow}
                                        </Form.Control>
                                    </Col>
                                    <Col md={5} className="pt-3">
                                        <p>{locale.t('chooseCurrency')}</p>
                                        <Form.Control className="input-form-n1" name="currency" as="select" componentclass="select" value={currencyDefault} onChange={(e) => this.handleChangeFilter(e)} >
                                            {currencyShow}
                                        </Form.Control>
                                    </Col>
                                    <Col md={2} className="align-self-end pt-3">
                                        <Button className={`w-100 btn-3 btn-n1 d-flex justify-content-center`} type="submit">
                                            {isLoadFilter ? <div className="loading-2" /> : <p className="pl-2 text-uppercase m-0 pr-2">{locale.t('filter')}</p>}

                                        </Button>
                                    </Col>
                                </Form>
                            </Row>
                        }
                        {Object.keys(promotionsDeposit).length > 0 ? this.renderItem(step) : null}
                        
                        <LoadBlock ref={ref => this.loadBlock = ref} />
                    </Container>
                </Modal.Body>
            </Modal>
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
    onSetDepositModal: (active) => dispatch({ type: DEPOSITMODAL, active }),
    onSetMessageModal: (active) => dispatch({ type: MESSAGEMODAL, active }),
    onSetAllModal: (active) => dispatch({ type: ALLMODAL, active }),
    onSetWallets: (active) => dispatch({ type: WALLETS, active })
});
export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(Deposit)