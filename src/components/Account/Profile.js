import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { convertComma, getSymbol, decodeHtmlCharCodes } from '../../../utils'
import UserService from '../../services/em/user'
import ReCAPTCHA from 'react-google-recaptcha'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

import {
    MESSAGEMODAL
} from "../../constants/types";
import forEach from 'lodash/forEach'
import filter from 'lodash/filter'
import isUndefined from 'lodash/isUndefined'
import isEmpty from 'lodash/isEmpty'
import isNull from 'lodash/isNull'
import find from 'lodash/find'
import WPService from '../../../services'
import { isEqual } from 'lodash'
const config = require(`../../../config`).config
const locale = require('react-redux-i18n').I18n

export class Layout extends Component {
    render() {
        return (
            <Col md={6} xs={12} className="pt-3">
                <div className="block">
                    {this.props.children}
                </div>
            </Col>
        )
    }
}

export class LayoutFull extends Component {
    render() {
        return (
            <Col md={12} xs={12} className="pt-3">
                <div className="block">
                    {this.props.children}
                </div>
            </Col>
        )
    }
}


class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            emailActive: 'false',
            smsActive: 'false',
            partyActive: 'false',
            validated_pw: '',
            validated_em_has: '',
            validated_pw_has: '',
            validated: '',
            oldPassword: '',
            newPassword: '',
            conPassword: '',
            errNewPWD: '',
            errConPWD: '',
            // captchaPublicKey: '6LfAjrcUAAAAABGvewDIMmDF0N6KrTXyoER2eSCV', //localhost
            captchaPublicKey: config.captchaPublicKey, //server
            captchaResponse: '',
            errEmail: '',
            showChangeEmail: false,
            balance: 0,
            realMoney: 0,
            bonusMoney: 0,
            fields: '',
            dataUserConsents: [],
            nameRadio: {},
            isDatePicker: false,
            dayShow: 0,
            monthShow: 0,
            yearShow: 0,
            countryShow: [],
            languagesShow: [],
            mobilePrefixShow: [],
            country: [],
            validated_profile: false,
            validated_profile_pmt: '',
            countryCode: '',
        }
    }
    componentDidMount() {
        const { userProfile, wallets } = this.props
        const { nameRadio } = this.state
        if (!isNull(userProfile) && !isUndefined(userProfile.fields)) {
            let useField = userProfile.fields
            //console.log('userProfile', useField.userConsents['3rdparty'])
            if (useField.userConsents) {
                this.setState({
                    fields: useField,
                    emailActive: useField.userConsents['emailmarketing'] ? 'true' : 'false',
                    smsActive: useField.userConsents['sms'] ? 'true' : 'false',
                    partyActive: useField.userConsents['3rdparty'] ? 'true' : 'false',
                })
            } else {
                this.setState({
                    fields: useField
                })
            }

        }
        if (!isNull(wallets) && !isUndefined(wallets.realMoney)) {
            let realMoney = !isUndefined(wallets.realMoney) ? wallets.realMoney : 0
            let bonusMoney = !isUndefined(wallets.bonusMoney) ? wallets.bonusMoney : 0
            let money = convertComma(realMoney + bonusMoney)
            let currency = !isUndefined(wallets.realMoneyCurrency) ? getSymbol(wallets.realMoneyCurrency) : 0
            this.setState({
                balance: `${money}${currency}`,
                realMoney: `${realMoney}${currency}`,
                bonusMoney: `${bonusMoney}${currency}`,
            })
        }

        UserService.getConsentRequirements({ action: 3 }).then((res) => {
            if (res) {
                this.setState({ dataUserConsents: res })
            }
        }).catch((err) => {
            console.log('getConsentRequirements error=>', err);
        })

        // UserService.getPhonePrefixes().then((result) => {
        //     let ppf = []
        //     forEach(result, (res, index) => {
        //         ppf.push(<option key={index} value={res}>{res}</option>)
        //     })
        //     this.setState({
        //         mobilePrefixShow: ppf
        //     })
        // })

        if (this.props.userProfile) {
            this.getDataCountry()
        }


        WPService.getSecurityQuestions(this.props.lang).then((res) => {
            let sq = []
            if (!isUndefined(res.data)) {
                res.data.forEach((res, index) => {
                    sq.push(<option key={index} value={decodeHtmlCharCodes(res)}>{decodeHtmlCharCodes(res)}</option>)
                })
                this.setState({ securityQuestionShow: sq })
            }
        })

        UserService.getLanguages().then((result) => {
            let lg = []
            forEach(result, (res, index) => {
                if (res.code === 'en' || res.code === 'fr' || res.code === 'it' || res.code === 'es') {
                    lg.push(<option key={index} value={res.code}>{res.name}</option>)
                }
            })
            this.setState({
                languagesShow: lg
            })
        })

        let d = []
        let m = []
        let y = []

        for (let i = 1; i <= 31; i++) {
            d.push(<option key={i} value={i}>{i}</option>)
        }
        for (let i = 1; i <= 12; i++) {
            m.push(<option key={i} value={i}>{i}</option>)
        }
        let yyyy = new Date()
        for (let i = yyyy.getFullYear() - 100; i < yyyy.getFullYear() - 17; i++) {
            y.push(<option key={i} value={i}>{i}</option>)
        }

        this.setState({
            dayShow: d,
            monthShow: m,
            yearShow: y
        })


    }

    getDataCountry = () => {
        const { userProfile } = this.props
        UserService.getCountries({
            expectRegions: true,
            excludeDenyRegistrationCountry: true
        }).then((result) => {
            let ct = []
            let countriesDefault = result.countries[0]
            let countriesShow = []
            let regions = []
            let countryName = !isUndefined(userProfile.fields) && userProfile.fields.country === "NO" ? "Norway" : ''
            let countryCode = ''

            if (userProfile.fields.country === "FR") countryName = "France";

            forEach(result.countries, (res, index) => {
                countriesShow.push(<option key={index} value={res.code}>{res.name}</option>)

                if (!isUndefined(userProfile.fields) && res.code === userProfile.fields.country) {
                    countryName = res.name

                    if (!isUndefined(res.regions)) {
                        forEach(res.regions, (item, key) => {
                            regions.push(<option key={item.id} value={item.id}>{item.name}</option>)
                        })
                    }
                }
            })

            console.log('Country:', regions)

            let ppf = []
            if (!isUndefined(userProfile.fields)) {
                let myData = [].concat(result.countries)
                    .sort((a, b) => a.phonePrefix > b.phonePrefix ? 1 : -1);

                forEach(myData, (res, index) => {
                    if (!isEmpty(res.phonePrefix) && !res.phonePrefix.includes("?")) {
                        if (res.phonePrefix === userProfile.fields.mobilePrefix) {
                            countryCode = res.code
                        }
                        if(res.code == "IM") res.phonePrefix = "+44 1624";

                        ppf.push(
                            <div className="option" key={index} onClick={(e) => this.setPrefix(res.phonePrefix, res.code)}>
                                <img src={`/static/images/country/${res.code}.jpg`} width='20' />
                                <span className="label">{res.phonePrefix}</span>
                                <span className="opt-val">{res.phonePrefix}</span>

                            </div>
                        )
                    }
                })
            }
            this.setState({
                countryShow: countriesShow,
                country: result.countries,
                regionShow: regions,
                countryName: countryName,
                countryCode: countryCode,
                mobilePrefixShow: ppf
            })
        })
    }

    componentDidUpdate(prevProps) {
        if (!isEqual(prevProps.userProfile, this.props.userProfile)) {
            this.getDataCountry()
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.userProfile !== this.props.userProfile) {
            const userProfile = nextProps.userProfile
            if (!isNull(userProfile) && !isUndefined(userProfile.fields)) {
                let useField = userProfile.fields

                if (useField.userConsents) {
                    this.setState({
                        fields: useField,
                        emailActive: useField.userConsents['emailmarketing'] ? 'true' : 'false',
                        smsActive: useField.userConsents['sms'] ? 'true' : 'false',
                        partyActive: useField.userConsents['3rdparty'] ? 'true' : 'false',
                    })
                } else {
                    this.setState({
                        fields: useField
                    })
                }
            }
        }
        if (nextProps.wallets !== this.props.wallets) {
            if (!isNull(nextProps.wallets) && !isUndefined(nextProps.wallets.realMoney)) {
                let realMoney = nextProps.wallets.realMoney
                let bonusMoney = nextProps.wallets.bonusMoney
                let money = convertComma(realMoney + bonusMoney)
                let currency = getSymbol(nextProps.wallets.realMoneyCurrency)
                this.setState({
                    balance: `${money}${currency}`,
                    realMoney: `${realMoney}${currency}`,
                    bonusMoney: `${bonusMoney}${currency}`,
                })
            }
        }
    }

    setPrefix = (phonePrefix, code) => {

        if (!isEmpty(code) && !isNull(code) && code != '' && !isUndefined(code)) {
            let txt = `<img src='/static/images/country/${code}.jpg' width='20' />`
            let els = document.getElementsByClassName('profilembilePrefix')
            for (let i = 0; i < els.length; i++) {
                els[i].innerHTML = `${txt} ${phonePrefix}`
            }
            if (document.getElementById('mobile-profile')) {
                document.getElementById('mobile-profile').value = phonePrefix
            }
            if (document.getElementById('mobile-menuleft')) {
                document.getElementById('mobile-menuleft').value = phonePrefix
            }
        }

        let elsView = document.getElementsByClassName('OptionsView')
        for (let i = 0; i < elsView.length; i++) {
            elsView[i].checked = false
        }

    }

    handleSubmitPassword = (e) => {
        let form = e.target
        let em = form.elements

        if (form.checkValidity() === false) {
            this.setState({ validated_pw: 'was-validated', validated_pw_has: 'was-validated' })
            e.preventDefault();
            e.stopPropagation();
        } else {
            if (em['newPassword'].value === em['conPassword'].value) {
                const parameters = {
                    oldPassword: em['oldPassword'].value,
                    newPassword: em['newPassword'].value
                }
                UserService.pwdChange(parameters).then(
                    (result) => {
                        if (result.isCaptchaEnabled) {
                            const set = { messageTitle: locale.t('error'), messageDesc: locale.t('isCaptchaEnabled'), messageDetail: '', messageType: 'error' }
                            this.props.onSetMessageModal(set)
                        } else {
                            const set = { messageTitle: locale.t('success'), messageDesc: locale.t('passChangedSuccess'), messageDetail: '', messageType: 'success' }
                            this.props.onSetMessageModal(set)
                        }
                    },
                    (err) => {
                        this.setState({
                            validated_pw: 'was-validated',
                            validated_pw_has: 'was-validated has-error',
                            errNewPWD: err.desc
                        })
                    })
            } else {
                this.setState({
                    validated_pw: 'was-validated',
                    validated_pw_has: 'was-validated has-error',
                    errConPWD: locale.t('passwordNotMatch')
                })
            }
            e.preventDefault();
        }
    }
    handleSubmitEmail = (e) => {
        let form = e.target
        let em = form.elements
        const { captchaPublicKey, captchaResponse, fields } = this.state

        if (form.checkValidity() === false) {
            this.setState({ validated: 'was-validated' })
            e.preventDefault();
            e.stopPropagation();
        } else {
            if (!isEmpty(captchaResponse)) {
                const parameters = {
                    email: em['newEmail'].value,
                    password: em['password'].value,
                    emailVerificationURL: window.location.origin + window.location.pathname + window.location.hash + `?method=changeEmail&email=${fields.email}&key=`,
                    captchaPublicKey: captchaPublicKey,
                    captchaChallenge: '',
                    captchaResponse: captchaResponse
                }
                UserService.emailChange(parameters).then(
                    (result) => {
                        if (result.isCaptchaEnabled) {
                            const set = { messageTitle: locale.t('error'), messageDesc: locale.t('isCaptchaEnabled'), messageDetail: '', messageType: 'error' }
                            this.props.onSetMessageModal(set)
                        } else {
                            const set = { messageTitle: locale.t('success'), messageDesc: locale.t('verificationEmail'), messageDetail: '', messageType: 'success' }
                            this.props.onSetMessageModal(set)
                        }
                    },
                    (err) => {
                        this.setState({
                            validated: 'was-validated',
                            validated_em_has: 'was-validated has-error',
                            errEmail: err.desc
                        })
                    })
            } else {
                this.setState({
                    validated: 'was-validated',
                    validated_em_has: 'was-validated has-error',
                    errEmail: locale.t('captchaInvalid')
                })
            }
            e.preventDefault();
        }
    }
    clearUserConsents = () => {
        const { fields } = this.state
        this.setState({
            emailActive: fields.acceptNewsEmail ? 'true' : 'false',
            smsActive: fields.acceptSMSOffer ? 'true' : 'false',
        })
    }
    handleSubmitUserConsents = (e) => {
        const { userProfile } = this.props
        const { emailActive, smsActive } = this.state
        let form = e.target
        let useField = userProfile.fields
        useField.acceptNewsEmail = emailActive
        useField.acceptSMSOffer = smsActive
        UserService.updateProfile(useField).then((res) => {
            const set = { messageTitle: locale.t('success'), messageDesc: locale.t('success'), messageDetail: '', messageType: 'success' }
            this.props.onSetMessageModal(set)
        }).catch((err) => {
            const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
            this.props.onSetMessageModal(set)
        })
        e.preventDefault();
    }
    handleChange = (e) => {
        const { newPassword, conPassword } = this.state
        const { userProfile } = this.props
        let form = e.target
        let useField = userProfile.fields
        let data = { [`${form.name}`]: form.value }

        if (form.name === 'newPassword' && !isEmpty(form.value) && !isEmpty(conPassword)) {
            if (form.value === conPassword) {
                data = {
                    ...data,
                    validated_pw_has: '',
                    errConPWD: ''
                }
            } else {
                data = {
                    ...data,
                    validated_pw_has: 'was-validated has-error',
                    errConPWD: locale.t('passwordNotMatch')
                }
            }
        }
        if (form.name === 'conPassword' && !isEmpty(form.value) && !isEmpty(newPassword)) {
            if (form.value === newPassword) {
                data = {
                    ...data,
                    validated_pw_has: '',
                    errConPWD: ''
                }
            } else {
                data = {
                    ...data,
                    validated_pw_has: 'was-validated has-error',
                    errConPWD: locale.t('passwordNotMatch')
                }
            }
        }
        if (form.name === 'emailActive') {
            useField.userConsents['emailmarketing'] = form.value === 'true' ? true : false
            // useField.acceptNewsEmail = form.value === 'true' ? true : false
            // UserService.updateProfile(useField)
        }
        if (form.name === 'smsActive') {
            useField.userConsents['sms'] = form.value === 'true' ? true : false
            // useField.acceptSMSOffer = form.value === 'true' ? true : false
            // UserService.updateProfile(useField)
        }
        if (form.name === 'partyActive') {
            useField.userConsents['3rdparty'] = form.value === 'true' ? true : false
            // useField.acceptSMSOffer = form.value === 'true' ? true : false
            // UserService.updateProfile(useField)
        }
        this.setState(data)
    }

    handleChangeProfile = (event) => {
        const { fields, country } = this.state
        let form = event.target

        if (form.name === 'country') {
            let reCountry = filter(country, (res) => res.code === form.value)

            if (!isUndefined(reCountry[0]) && reCountry[0]) {
                this.setState({
                    fields: {
                        ...fields,
                        [`${form.name}`]: form.value,
                        mobilePrefix: reCountry[0].phonePrefix
                    },

                })
            }
        } else if (form.name === 'mobilePrefix') {
            let reMobilePrefix = filter(country, (res) => res.phonePrefix === form.value)
            this.setState({
                fields: {
                    ...fields,
                    [`${form.name}`]: form.value,
                    country: !isUndefined(reMobilePrefix[0]) ? reMobilePrefix[0].code : country
                }
            })
        } else {
            this.setState({ fields: { ...fields, [`${form.name}`]: form.value } })
        }
    }

    handleSubmitProfile = (event) => {
        let { fields } = this.state
        let form = event.target;
        let e = form.elements
        let p = fields
        let txtValidated = ''
        let txtEmpty = []

        p.title = e['title'].value;
        p.gender = e['title'].value === 'Mr.' ? 'M' : 'F';
        p.firstname = e['firstname'].value;
        p.surname = e['surname'].value;
        p.mobilePrefix = e['mobilePrefix'].value;
        p.mobile = e['mobile'].value;
        p.address1 = e['address1'].value;
        p.address2 = e['address2'].value;
        p.postalCode = e['postalCode'].value;
        p.birthDate = e['birthDay'].value;
        p.language = e['language'].value;
        p.country = e['country'].value;

        if (!e['firstname'].checkValidity()) {
            txtEmpty.push(<span key='firstName' className="d-block">{`${locale.t('textValidity')} ${locale.t('firstName')}`}</span>)
        }
        if (!e['surname'].checkValidity()) {
            txtEmpty.push(<span key='lastName' className="d-block">{`${locale.t('textValidity')}  ${locale.t('lastName')}`}</span>)
        }
        if (!e['mobile'].checkValidity()) {
            txtEmpty.push(<span className="d-block">{`${locale.t('textValidity')} ${locale.t('mobileNumber')}`}</span>)
        }
        if (!e['address1'].checkValidity()) {
            txtEmpty.push(<span key='addressLine1' className="d-block">{`${locale.t('textValidity')}  ${locale.t('addressLine1')}`}</span>)
        }
        if (!e['postalCode'].checkValidity()) {
            txtEmpty.push(<span key='postcode' className="d-block">{`${locale.t('textValidity')}  ${locale.t('postcode')}`}</span>)
        }
        if (!e['city'].checkValidity()) {
            txtEmpty.push(<span key='city' className="d-block">{`${locale.t('textValidity')}  ${locale.t('city')}`}</span>)
        }
        if (!e['birthDay'].checkValidity()) {
            txtEmpty.push(<span key='birthDay' className="d-block">{`${locale.t('textValidity')}  ${locale.t('birthDay')}`}</span>)
        }
        txtValidated = {
            renderItem: (
                <Fragment>
                    {txtEmpty}
                </Fragment>
            ),
            isHTML: false
        }
        if (form.checkValidity() === false) {
            this.setState({ validated_profile: 'was-validated', validated_profile_pmt: 'validated-pmt' })
            const set = { messageTitle: `${locale.t('validity')}!`, messageDesc: txtValidated, messageDetail: '', messageType: 'error' }
            this.props.onSetMessageModal(set)
            event.preventDefault();
            event.stopPropagation();
        } else {
            // success
            let parameters = {
                "userID": p.userID,
                "username": p.username,
                "email": p.email,
                "country": p.country,
                "region": p.region,
                "personalID": p.personalID,
                "mobilePrefix": p.mobilePrefix,
                "mobile": p.mobile,
                "phonePrefix": p.phonePrefix,
                "phone": p.phone,
                "currency": p.currency,
                "title": p.title,
                "firstname": p.firstname,
                "surname": p.surname,
                "birthDate": p.birthDate,
                "city": p.city,
                "address1": p.address1,
                "address2": p.address2,
                "postalCode": p.postalCode,
                "language": p.language,
                "nationality": p.nationality,
                "birthplace": p.birthplace,
                "birthCountry": p.birthCountry,
                "securityQuestion": p.securityQuestion,
                "securityAnswer": p.securityAnswer,
                "acceptNewsEmail": p.acceptNewsEmail,
                "acceptSMSOffer": p.acceptSMSOffer,
                "gender": p.gender,
                "userConsents": p.userConsents
            }

            UserService.updateProfile(parameters).then((res) => {
                const set = { messageTitle: locale.t('success'), messageDesc: locale.t('success'), messageDetail: '', messageType: 'success' }
                this.props.onSetMessageModal(set)
            }).catch((err) => {
                //const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
                //this.props.onSetMessageModal(set)
            })
            event.preventDefault();
        }

    }

    handleClickDisplayForm = (event, formname) => {
        const targetElement = event.target
        const targetForm = document.getElementById(formname);
        const isShow = targetElement.classList.contains('arrowDown');
        if(!isNull(targetForm)){
            if(isShow){
                targetForm.classList.add('d-block');
            }else{
                targetForm.classList.remove('d-block');
            }
        }
        if (isShow) {
            targetElement.classList.remove('arrowDown');
            targetElement.classList.add('arrowUp');
        } else {
            targetElement.classList.remove('arrowUp');
            targetElement.classList.add('arrowDown');
        }
    }

    userConsentsSubmit = (event) => {
        let form = event.target
        let e = form.elements
        const { userProfile } = this.props
        const { dataUserConsents } = this.state
        let useField = userProfile.fields
        // console.log('useField', useField)
        // forEach(dataUserConsents, (o) => {
        //     useField.userConsents[`${o.code}`] = e[`accept-${o.code}`].checked
        // })
        UserService.updateProfile(useField).then((res) => {
            const set = { messageTitle: locale.t('success'), messageDesc: locale.t('success'), messageDetail: '', messageType: 'success' }
            this.props.onSetMessageModal(set)
        }).catch((err) => {
            //const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
            //this.props.onSetMessageModal(set)
        })
        event.preventDefault();
        event.stopPropagation();
    }

    checkErrorMessage = (err) => {
        if (err.includes("not match the pattern")) {
            return locale.t('passWordNotMatch')
        } else {
            return err
        }
    }

    _renderUserConsents = () => {
        const { dataUserConsents, fields, emailActive, smsActive, partyActive } = this.state
        let item = []
        if (!isUndefined(dataUserConsents)) {
            dataUserConsents.map((res, index) => {
                if (res.code === 'emailmarketing') {
                    item.push(
                        <Form.Group key={index}>
                            {/* <Form.Check className="pr-0" disabled={res.mustAccept && fields.userConsents[`${res.code}`]} value={res.code} defaultChecked={fields.userConsents[`${res.code}`]} name={`accept-${res.code}`} type="checkbox" /> */}
                            <p className="text-title mb-0">{locale.t('emailmarketing')}</p>
                            <div className="d-flex mb-2">
                                <Form.Check className="radio-custom" checked={emailActive === 'true'} value={'true'} label={locale.t('yes')} onChange={(evt) => this.handleChange(evt)} name={`emailActive`} type="radio" />
                                <Form.Check className="radio-custom" checked={emailActive === 'false'} value={'false'} label={locale.t('no')} onChange={(evt) => this.handleChange(evt)} name={`emailActive`} type="radio" />
                            </div>
                        </Form.Group>
                    )
                } else if (res.code === 'sms') {
                    item.push(
                        <Form.Group key={index}>
                            {/* <Form.Check className="pr-0" disabled={res.mustAccept && fields.userConsents[`${res.code}`]} value={res.code} defaultChecked={fields.userConsents[`${res.code}`]} name={`accept-${res.code}`} type="checkbox" />
                            <p className="mx-2 my-0">{locale.t('sms')}</p> */}
                            <p className="text-title mb-0">{locale.t('sms')}</p>
                            <div className="d-flex mb-2">
                                <Form.Check className="radio-custom" checked={smsActive === 'true'} value={'true'} label={locale.t('yes')} onChange={(evt) => this.handleChange(evt)} name={`smsActive`} type="radio" />
                                <Form.Check className="radio-custom" checked={smsActive === 'false'} value={'false'} label={locale.t('no')} onChange={(evt) => this.handleChange(evt)} name={`smsActive`} type="radio" />
                            </div>
                        </Form.Group>
                    )
                } else if (res.code === '3rdparty') {

                    item.push(
                        <Form.Group key={index}>
                            {/* <Form.Check className="pr-0" disabled={res.mustAccept && fields.userConsents[`${res.code}`]} value={res.code} defaultChecked={fields.userConsents[`${res.code}`]} name={`accept-${res.code}`} type="checkbox" />
                            <p className="mx-2 my-0">{locale.t('3rdparty')}</p> */}
                            <p className="text-title mb-0">{locale.t('3rdparty')}</p>
                            <div className="d-flex mb-2">
                                <Form.Check className="radio-custom" checked={partyActive === 'true'} value={'true'} label={locale.t('yes')} onChange={(evt) => this.handleChange(evt)} name={`partyActive`} type="radio" />
                                <Form.Check className="radio-custom" checked={partyActive === 'false'} value={'false'} label={locale.t('no')} onChange={(evt) => this.handleChange(evt)} name={`partyActive`} type="radio" />
                            </div>
                        </Form.Group>
                    )
                }
            })
        }

        return (
            <Form id="marketingConsents" className='formMarketingConsents' noValidate onSubmit={(event) => this.userConsentsSubmit(event)}>
                {item}
                <Form.Row className="pt-3">
                    <Form.Group as={Col} md={6}  >
                        <Button className="btn-4 w-100" type="submit">
                            <p className="pl-2 text-uppercase m-0 pr-2">{locale.t('save')}</p>
                        </Button>
                    </Form.Group>
                </Form.Row>
            </Form>
        )
    }

    render() {
        const { placement } = this.props
        const { fields, emailActive, countryName, countryCode, securityQuestionShow, captchaPublicKey, balance, smsActive, validated, validated_pw, validated_pw_has, validated_em_has, oldPassword, newPassword, conPassword, errNewPWD, errConPWD, showChangeEmail, errEmail, dayShow, monthShow, yearShow, countryShow, languagesShow, mobilePrefixShow, validated_profile, personalID, realMoney, bonusMoney } = this.state

        let myMoney = 0.00;
        if(!isUndefined(realMoney)) myMoney = parseFloat(realMoney).toFixed(2);

        let myBonus = 0.00;
        if(!isUndefined(bonusMoney)) myBonus = parseFloat(bonusMoney).toFixed(2);

        let myBalance = 0.00;
        if(!isUndefined(balance)) myBalance = parseFloat(balance).toFixed(2);

        return (
            <Row className="profile">
                <Layout>
                    <p className="m-0 title-menu">{locale.t('gamingAccountBalance')}</p>
                    <div className="gaming-account-balance">
                        <div className="real-money">
                            <p className="label">{locale.t('realMoney')}</p>
                            <p className="value">{myMoney}</p>
                        </div>
                        <div className="bonus-money">
                            <p className="label">{locale.t('bonusBalance')}</p>
                            <p className="value">{myBonus}</p>
                        </div>
                        <div className="money">
                            <p className="label">{locale.t('totalBalance')}</p>
                            <p className="value">{myBalance}</p>
                        </div>
                    </div>


                </Layout>
                <Layout>
                    <p className="title-menu">{locale.t('quickDeposit')}</p>
                    <Button className="btn-4" type="button" onClick={() => window.location.href = '/account/deposit'}>
                        <p className="pl-2 text-uppercase m-0 pr-2">{locale.t('deposit')}</p>
                    </Button>
                </Layout>
                <Layout>
                    <div className='d-flex justify-content-between'>
                    <p className="title-menu">{locale.t('marketingConsents')}</p>
                    <div className='arrowDown' onClick={(e)=>this.handleClickDisplayForm(e, 'marketingConsents')}></div>
                    </div>
                    {this._renderUserConsents()}

                </Layout>

                <Layout>
                    <div className='d-flex justify-content-between'>
                    <p className="title-menu">{locale.t('changePassword')}</p>
                    <div className='arrowDown' onClick={(e)=>this.handleClickDisplayForm(e, 'formChangePassword')}></div>
                    </div>
                    <Form noValidate validated={validated_pw} onSubmit={(e) => this.handleSubmitPassword(e)} id="formChangePassword" className="form-change-password">
                        <Form.Group className={validated_pw_has}>
                            <Form.Label>{locale.t('oldPassword')}</Form.Label>
                            <Form.Control required type="password" name="oldPassword" value={oldPassword} onChange={(evt) => this.handleChange(evt)} placeholder={locale.t('enterYourOldPassword')} />
                        </Form.Group>
                        <Form.Group className={validated_pw_has}>
                            <Form.Label>{locale.t('newPassword')}</Form.Label>
                            <Form.Control required type="password" name="newPassword" value={newPassword} onChange={(evt) => this.handleChange(evt)} placeholder={locale.t('enterYourNewPassword')} />
                            <Form.Control.Feedback type="invalid">{this.checkErrorMessage(errNewPWD)}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className={validated_pw_has}>
                            <Form.Label>{locale.t('confirmPassword')}</Form.Label>
                            <Form.Control required type="password" name="conPassword" value={conPassword} onChange={(evt) => this.handleChange(evt)} placeholder={locale.t('Re-typeYourNewPassword')} />
                            <Form.Control.Feedback type="invalid">{this.checkErrorMessage(errConPWD)}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Row className="pt-3">
                            <Form.Group as={Col} md={5}  xs={6}>
                                <Button className="btn-4 w-100" type="submit">
                                    <p className="pl-2 text-uppercase m-0 pr-2">{locale.t('save')}</p>
                                </Button>
                            </Form.Group>
                            <Form.Group as={Col} md={5}  xs={6}>
                                <Button className="btn-4 w-100 cancel" type="button">
                                    <p className="pl-2 text-uppercase m-0 pr-2">{locale.t('cancel')}</p>
                                </Button>
                            </Form.Group>
                        </Form.Row>
                    </Form>

                </Layout>

                <LayoutFull>
                    <div className='d-flex justify-content-between'>
                    <p className="title-menu">{locale.t('accountInformation')}</p>
                    <div className='arrowDown' onClick={(e)=>this.handleClickDisplayForm(e, 'AccountInformation')}></div>
                    </div>
                    <div id="AccountInformation" className="acc-info">
                        <Row>
                            <Col md={6} xs={12}>
                                <Form.Group as={Row} className="mb-0">
                                    <Col sm="12">
                                        <Form.Label>
                                            <p className="account-title">{locale.t('email')}: </p>
                                        </Form.Label>
                                    </Col>
                                    <Col sm="12" className="col-form-label">
                                        <p className="label-box mb-0 bt-disabled">{!isEmpty(fields) && fields.email}</p>
                                        <a className="chang-email text-right" onClick={() => this.setState({ showChangeEmail: !showChangeEmail })}>
                                            <p className="m-0">{showChangeEmail ? locale.t('hide') : locale.t('change')}</p>
                                        </a>
                                    </Col>
                                    {/* <Col sm="12" className="col-form-label">
                                        <a className="chang-email text-right" onClick={() => this.setState({ showChangeEmail: !showChangeEmail })}>
                                            <p className="m-0">{showChangeEmail ? locale.t('hide') : locale.t('change')}</p>
                                        </a>
                                    </Col> */}
                                </Form.Group>
                                {
                                    showChangeEmail ? (<Form noValidate validated={validated} onSubmit={(e) => this.handleSubmitEmail(e)}>
                                        <Form.Group className={validated}>
                                            <Form.Control required type="email" name="newEmail" placeholder={locale.t('newEmailAddress')} />
                                        </Form.Group>
                                        <Form.Group className={`${validated} ${validated_em_has}`}>
                                            <Form.Control required type="password" name="password" placeholder={locale.t('password')} />
                                            <Form.Control.Feedback type="invalid">{errEmail}</Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group>
                                            <ReCAPTCHA
                                                ref={(el) => { this.captcha = el; }}
                                                sitekey={captchaPublicKey}
                                                onChange={(res) => this.setState({ captchaResponse: res })}
                                            />
                                        </Form.Group>
                                        <Form.Group>
                                            <Button className="btn-4" type="submit">
                                                <p className="pl-2 text-uppercase m-0 pr-2">{locale.t('save')}</p>
                                            </Button>
                                        </Form.Group>
                                    </Form>)
                                        : null
                                }
                            </Col>
                        </Row>

                        <Form noValidate validated={validated_profile} className="w-100" onSubmit={(e) => this.handleSubmitProfile(e)}>
                            <Row>
                                <Col md={6} xs={12}>
                                    <Form.Group as={Row} className="mb-0">
                                        <Col sm="12">
                                            <Form.Label>
                                                <p className="account-title">{locale.t('firstName')}: </p>
                                            </Form.Label>
                                        </Col>
                                        <Col sm="5" className="col-form-label">
                                            <Form.Group className="selectdiv">
                                                <Form.Control className="select-1" required name="title" value={`${fields.title}`} onChange={(e) => this.handleChangeProfile(e)} componentclass="select" as="select">
                                                    <option value="Mr.">{locale.t('mr')}</option>
                                                    <option value="Ms.">{locale.t('ms')}</option>
                                                    <option value="Mrs.">{locale.t('mrs')}</option>
                                                    <option value="Miss">{locale.t('miss')}</option>
                                                </Form.Control>
                                            </Form.Group>
                                        </Col>
                                        <Col sm="7" className="col-form-label">
                                            <Form.Group>
                                                <Form.Control required disabled={fields.firstname && fields.firstname.length} type="text" name="firstname" onChange={(e) => this.handleChangeProfile(e)} value={`${fields.firstname}`} placeholder={locale.t('firstName')} />
                                            </Form.Group>
                                        </Col>
                                    </Form.Group>
                                </Col>
                                <Col md={6} xs={12}>
                                    <Form.Group as={Row} className="mb-0">
                                        <Col sm="12">
                                            <Form.Label>
                                                <p className="account-title">{locale.t('lastName')}: </p>
                                            </Form.Label>
                                        </Col>
                                        <Col sm="12" className="col-form-label">
                                            <Form.Group>
                                                <Form.Control required type="text" disabled={fields.surname && fields.surname.length} name="surname" onChange={(e) => this.handleChangeProfile(e)} value={`${fields.surname}`} placeholder={locale.t('lastName')} />
                                            </Form.Group>
                                        </Col>
                                    </Form.Group>
                                </Col>
                            </Row>


                            <Row>
                                <Col md={6} xs={12}>
                                    <Form.Group as={Row} className="mb-0">
                                        <Col sm="12">
                                            <Form.Label>
                                                <p className="account-title">{locale.t('dateOfBirth')}: </p>
                                            </Form.Label>
                                        </Col>
                                        <Col className="col-form-label">
                                            <Form.Group>
                                                <Form.Control required type="text" name="birthDay" disabled={true} value={!isEmpty(fields) && fields.birthDate} onChange={(e) => this.handleChangeProfile(e)} placeholder={locale.t('dateOfBirth')} />
                                            </Form.Group>
                                        </Col>
                                    </Form.Group>
                                </Col>
                                <Col md={6} xs={12}>
                                    <Form.Group as={Row} className="mb-0">
                                        <Col sm="12">
                                            <Form.Label>
                                                <p className="account-title">{locale.t('phoneNumber')}: </p>
                                            </Form.Label>
                                        </Col>
                                        <Col sm="5" className="col-form-label dropdownPrefix">
                                            <div className="select-box">
                                                <input type="checkbox" key={placement} id={`options-view-button-${placement}`} className="OptionsView" />
                                                <div id="select-button" className="brd">
                                                    <div className="selected-value profilembilePrefix">
                                                        <img src={`/static/images/country/${countryCode}.jpg`} width='20' /> {fields.mobilePrefix}
                                                    </div>
                                                    <div id="chevrons">
                                                        <i className="fas fa-chevron-up"></i>
                                                        <i className="fas fa-chevron-down"></i>
                                                    </div>
                                                </div>
                                                <div id="options">
                                                    {mobilePrefixShow}
                                                    <div id="option-bg"></div>
                                                </div>
                                            </div>
                                            <Form.Control type="hidden" name="mobilePrefix" id={`mobile-${placement}`} className="mobilePrefixValue" value={fields.mobilePrefix} />

                                            {/* <Form.Group>
                                            <Form.Control className="select-1" required name="mobilePrefix" value={ `${fields.mobilePrefix}`} onChange={(e) => this.handleChangeProfile(e)} componentclass="select" as="select">
                                                { mobilePrefixShow }
                                            </Form.Control>
                                        </Form.Group> */}
                                        </Col>
                                        <Col sm="7" className="col-form-label">
                                            <Form.Group>
                                                <Form.Control required type="text" name="mobile" onChange={(e) => this.handleChangeProfile(e)} value={!isEmpty(fields) && `${fields.mobile}`} placeholder={locale.t('mobile')} />
                                            </Form.Group>
                                        </Col>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6} xs={12}>
                                    <Form.Group as={Row} className="mb-0">
                                        <Col sm="12">
                                            <Form.Label>
                                                <p className="account-title">{locale.t('addressLine1')}: </p>
                                            </Form.Label>
                                        </Col>
                                        <Col sm="12" className="col-form-label">
                                            <Form.Group>
                                                <Form.Control required type="text" name="address1" onChange={(e) => this.handleChangeProfile(e)} value={!isEmpty(fields) && `${fields.address1}`} placeholder={locale.t('addressLine1')} />
                                            </Form.Group>
                                        </Col>
                                    </Form.Group>
                                </Col>
                                <Col md={6} xs={12}>
                                    <Form.Group as={Row} className="mb-0">
                                        <Col sm="12">
                                            <Form.Label>
                                                <p className="account-title">{locale.t('addressLine2')}: </p>
                                            </Form.Label>
                                        </Col>
                                        <Col sm="12" className="col-form-label">
                                            <Form.Group>
                                                <Form.Control type="text" name="address2" onChange={(e) => this.handleChangeProfile(e)} value={!isEmpty(fields) && `${fields.address2}`} placeholder={locale.t('addressLine2')} />
                                            </Form.Group>
                                        </Col>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6} xs={12}>
                                    <Form.Group as={Row} className="mb-0">
                                        <Col sm="12">
                                            <Form.Label>
                                                <p className="account-title">{locale.t('city')}: </p>
                                            </Form.Label>
                                        </Col>
                                        <Col sm="12" className="col-form-label">
                                            <Form.Group>
                                                <Form.Control required type="text" name="city" onChange={(e) => this.handleChangeProfile(e)} value={!isEmpty(fields) && `${fields.city}`} placeholder={locale.t('city')} />
                                            </Form.Group>
                                        </Col>
                                    </Form.Group>
                                </Col>
                                <Col md={6} xs={12}>
                                    <Form.Group as={Row} className="mb-0">
                                        <Col sm="12">
                                            <Form.Label>
                                                <p className="account-title">{locale.t('postcode')}: </p>
                                            </Form.Label>
                                        </Col>
                                        <Col sm="12" className="col-form-label">
                                            <Form.Group>
                                                <Form.Control required type="text" name="postalCode" onChange={(e) => this.handleChangeProfile(e)} value={!isEmpty(fields) && `${fields.postalCode}`} placeholder={locale.t('postcode')} />
                                            </Form.Group>
                                        </Col>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6} xs={12}>
                                    <Form.Group as={Row} className="mb-0">
                                        <Col sm="12">
                                            <Form.Label>
                                                <p className="account-title">{locale.t('country')}: </p>
                                            </Form.Label>
                                        </Col>
                                        <Col sm="12" className="col-form-label">
                                            <Form.Group>
                                                <Form.Control required type="text" disabled={true} name="country" componentclass="select" value={countryName} placeholder={locale.t('country')} />
                                            </Form.Group>
                                        </Col>
                                    </Form.Group>
                                </Col>
                                <Col md={6} xs={12}>
                                    <Form.Group as={Row} className="mb-0">
                                        <Col sm="12">
                                            <Form.Label>
                                                <p className="account-title">{locale.t('language')}: </p>
                                            </Form.Label>
                                        </Col>
                                        <Col sm="12" className="col-form-label">
                                            <Form.Group className="selectdiv">
                                                <Form.Control className="select-1" required name="language" componentclass="select" value={!isEmpty(fields) && `${fields.language}`} onChange={(e) => this.handleChangeProfile(e)} as="select">
                                                    {languagesShow}
                                                </Form.Control>
                                            </Form.Group>
                                        </Col>
                                    </Form.Group>
                                </Col>
                            </Row>


                            <Row>
                                <Col md={12} xs={12}>
                                    <Form.Group as={Row} className="mb-0">
                                        <Col sm="12">
                                            <Form.Label>
                                                <p className="account-title">{locale.t('personalID')}: </p>
                                            </Form.Label>
                                        </Col>
                                        <Col sm="12" className="col-form-label">
                                            <Form.Group>
                                                <Form.Control type="text" name="personalID" disabled={true} onChange={(e) => this.handleChangeProfile(e)} value={!isEmpty(fields) && `${fields.personalID}`} placeholder={locale.t('personalID')} />
                                            </Form.Group>
                                        </Col>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6} xs={12}>
                                    <Form.Group as={Row} className="mb-0">
                                        <Col sm="12">
                                            <Form.Label>
                                                <p className="account-title">{locale.t('securityQuestion')}: </p>
                                            </Form.Label>
                                        </Col>
                                        <Col sm="12" className="col-form-label">
                                            <Form.Group className="selectdiv">
                                                <Form.Control className="select-1" required name="securityQuestion" value={!isEmpty(fields) && `${fields.securityQuestion}`} onChange={(e) => this.handleChangeProfile(e)} componentclass="select" as="select">
                                                    {securityQuestionShow}
                                                </Form.Control>
                                            </Form.Group>
                                        </Col>
                                    </Form.Group>
                                </Col>
                                <Col md={6} xs={12}>
                                    <Form.Group as={Row} className="mb-0">
                                        <Col sm="12">
                                            <Form.Label>
                                                <p className="account-title">{locale.t('securityAnswer')}: </p>
                                            </Form.Label>
                                        </Col>
                                        <Col sm="12" className="col-form-label">
                                            <Form.Group>
                                                <Form.Control required type="text" name="securityAnswer" value={!isEmpty(fields) && `${fields.securityAnswer}`} onChange={(e) => this.handleChangeProfile(e)} />
                                            </Form.Group>
                                        </Col>
                                    </Form.Group>
                                </Col>
                            </Row>


                            <Row>
                                <Col md={3} xs={6}>
                                    <Form.Group sm="3">
                                        <Button className="btn-4 w-100" type="submit">
                                            <p className="pl-2 text-uppercase m-0 pr-2">{locale.t('save')}</p>
                                        </Button>
                                    </Form.Group>
                                </Col>
                                <Col md={3} xs={6}>
                                    <Form.Group sm="3">
                                        <Button className="btn-4 w-100 cancel" type="button">
                                            <p className="pl-2 text-uppercase m-0 pr-2">{locale.t('cancel')}</p>
                                        </Button>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                </LayoutFull>
            </Row>
        )
    }
}
const mapStateToProps = (state) => ({
    userInfo: state.sessionState.userInfo,
    userProfile: state.sessionState.userProfile,
    wallets: state.sessionState.wallets
});
const mapDispatchToProps = (dispatch) => ({
    onSetMessageModal: (active) => dispatch({ type: MESSAGEMODAL, active })
})
export default connect(mapStateToProps, mapDispatchToProps)(Profile);