import React, { PureComponent, Fragment } from 'react'
import { connect } from 'react-redux'
import { LazyLoadImage } from 'react-lazy-load-image-component';

import Picture from '../Picture'
import '../../../styles/components/_landingRegister.scss'
import LayoutLandingStep1 from './LayoutLandingStep1'
import LayoutLandingStep2 from './LayoutLandingStep2'
import LayoutLandingStep3 from './LayoutLandingStep3'
import LayoutStep3 from './LayoutStep3'
import LayoutStep4 from './LayoutStep4'
import * as userParams from '../../constants/userParams'
import UserService from '../../services/em/user'
import WPService from '../../../services'

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';


import {
    setCookie,
    getCookie,
    decodeHtmlCharCodes,
    replaceSpecialCharacters,
    countriesBlock,
    countriesExclude,
    sendMailPromotionLogin
} from '../../../utils'
import {
    REGISTERMODAL,
    MESSAGEMODAL,
    ALLMODAL,
    CURRENT_COUNTRY
} from "../../constants/types";

import isEmpty from 'lodash/isEmpty'
import forEach from 'lodash/forEach'
import isUndefined from 'lodash/isUndefined'
import isArray from 'lodash/isArray'
import filter from 'lodash/filter'
import isNull from 'lodash/isNull'
import head from 'lodash/head'
import includes from 'lodash/includes'
import CasinoNWA from '../../services/em/casinoNWA'

const locale = require('react-redux-i18n').I18n

export class LandingRegister extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            step: 1,
            showStep: 1,
            validated: false,
            validated_1: false,
            validated_3: false,
            validated_4: '',
            validated_pmt_1: '',
            validated_pmt_3: '',
            cPwd: '',
            conPwd: '',
            mobilePrefixShow: [],
            countryShow: [],
            regionShow: [],
            country: [],
            currencyShow: [],
            languagesShow: [],
            securityQuestionShow: [],
            dayShow: 0,
            monthShow: 0,
            yearShow: 0,
            validationCode: '',
            registerParams: userParams.registerParams,
            errEmail: { class: '', message: '', status: false },
            errPassword: { class: '', message: '', status: false },
            errCPassword: { class: '', message: '', status: false },

            acceptOffer: false,
            promotionsRegister: [],
            showMorePromotion: {},
            paramsId: '',
            checkPM: '',
            cpt: true,
            cptCode: false,
            isRegister: false,
            errAlias: '',
            verifyStatus: false,
            isVerifyLoading: false,
            dataUserConsents: [],
            isLogin: null
        }
    }
    static getDerivedStateFromProps(props, state) {
        if (state.isLogin !== props.session.isLogin) {
            return {
                isLogin: props.session.isLogin
            }
        }
        return null
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevState.isLogin !== this.state.isLogin && this.state.isLogin) {
            window.location.href = '/'
        }
    }
    getCountries = async () => {
        try {
            const { registerParams } = this.state
            const result = await UserService.getCountries({
                expectRegions: true,
                excludeDenyRegistrationCountry: false
            })
            this.props.onSetCurrentCountry(result.currentIPCountry)
            let ct = [<option key="none" value="">{locale.t('pleaseSelect')}</option>]
            let regions = []
            let newCountries = WPService.countriesExclude(result.countries)
            let countriesDefault = newCountries[0]
            countriesDefault.code = '';
            countriesDefault.phonePrefix = '';
            forEach(newCountries, (res, index) => {
                if (result.currentIPCountry === res.code) {
                    countriesDefault = newCountries[index]
                }

                if(res.code == "FR" || res.code == "GF"|| res.code == "PF"|| res.code == "TF"){
                    //DO NOTHING
                }
                else{
                    ct.push(<option key={index} value={res.code}>{res.name}</option>)
                }
            })
            // set mobilePrefix
            let ppf = []
            let myData = [].concat(result.countries)
                .sort((a, b) => a.phonePrefix > b.phonePrefix ? 1 : -1);

            forEach(myData, (res, index) => {
                if (!isEmpty(res.phonePrefix)) {
                    if(res.code == "IM") res.phonePrefix = "+44 1624";
                    if(res.code == "FR" || res.code == "GF"|| res.code == "PF"|| res.code == "TF"){
                        //DO NOTHING
                    }
                    else{
                        ppf.push(
                            <div className="option" key={index} onClick={(e) => this.setPrefix(e, res.phonePrefix, res.code)}>

                                <img src={`/static/images/country/${res.code}.jpg`} width='20' />
                                <span className="label">{res.phonePrefix}</span>
                                <span className="opt-val">{res.phonePrefix}</span>

                            </div>
                        )
                    }
                }
            })
            registerParams.country = countriesDefault.code
            registerParams.mobilePrefix = countriesDefault.phonePrefix
            this.setState({
                countryShow: ct,
                country: newCountries,
                registerParams,
                mobilePrefixShow: ppf
            })
        } catch (error) {
            console.log('error getCountries', error)
        }
    }


    componentDidMount() {
        const { registerParams } = this.state
        if (this.props.session.isLogin) {
            window.location.href = '/'
        }
        /** getCountries*/
        this.getCountries()
        /** getPhonePrefixes*/

        // UserService.getPhonePrefixes().then((result) => {
        //     let ppf = [<option key="none" value="">{locale.t('pleaseSelect')}</option>]
        //     forEach(result, (res, index) => {
        //         ppf.push(<option key={index} value={res}>{res}</option>)
        //     })

        //     this.setState({ mobilePrefixShow: ppf })
        // })
        // /** getCurrencies*/
        UserService.getCurrencies().then((result) => {

            let ccy = []
            forEach(result, (res, index) => {
                ccy.push(<option key={index} value={res.code}>{res.name}</option>)
            })
            registerParams.currency = 'EUR'
            this.setState({ currencyShow: ccy, registerParams })
        })
        // /** getCurrencies*/
        UserService.getLanguages().then((result) => {
            let lg = []
            forEach(result, (res, index) => {
                if (res.code === 'en') {
                    registerParams.language = 'en'
                }
                if (res.code === 'en' || res.code === 'fr' || res.code === 'it' || res.code === 'es') {
                    if(this.props.lang==res.code){
                        registerParams.language = res.code
                    }
                    lg.push(<option key={index} value={res.code}>{res.name}</option>)
                }
            })
            this.setState({ languagesShow: lg, registerParams })
        })
        // /** getConsentRequirements*/
        UserService.getConsentRequirements({ action: 1 }).then((res) => {
            if (res) {
                this.setState({ dataUserConsents: res })
            }
        }).catch((err) => {
            console.log('getConsentRequirements=>', err);
        })

        let sq = []
        let d = []
        let m = []
        let y = []
        let sqs = [{
            name: locale.t('myFavouriteBet')
        }, {
            name: locale.t('myFavouriteColour')
        }, {
            name: locale.t('myFavouriteHorse')
        }, {
            name: locale.t('myFavouritePlace')
        }, {
            name: locale.t('myFavouritesuperhero')
        }, {
            name: locale.t('myMiddleName')
        }, {
            name: locale.t('myMotherMaidenName')
        }, {
            name: locale.t('myPetName')
        }]
        WPService.getSecurityQuestions(this.props.lang).then((res) => {
            if (!isUndefined(res.data)) {
                res.data.forEach((res, index) => {
                    sq.push(<option key={index} value={decodeHtmlCharCodes(res)}>{decodeHtmlCharCodes(res)}</option>)
                })
                this.setState({ securityQuestionShow: sq })
            }
        })
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
        registerParams.dateOfBirthY = "1990"
        const searchParams = new URLSearchParams(window.location.search);
        const params = !isUndefined(searchParams.get('id')) && !isEmpty(searchParams.get('id')) ? searchParams.get('id') : ''
        const paramsPM = !isEmpty(params) ? { checked: true, id: params } : ''
        this.setState({
            dayShow: d,
            monthShow: m,
            yearShow: y,
            paramsId: params,
            checkPM: paramsPM,
            registerParams
        })
    }

    setPrefix = (e, phonePrefix, code) => {
        let txt = `<img class='imgCircle' src='/static/images/country/${code}.jpg' width='20' />`
        // document.getElementById('selected-value').innerHTML = `${txt} ${phonePrefix}`
        // document.getElementById('mobilePrefix').value = phonePrefix
        // document.getElementById('options-view-button').checked = false;

        let dpv = document.getElementsByClassName('dropdown-prefixvalue')
        for (var i = 0; i < dpv.length; i++) {
            dpv[i].innerHTML = `${txt} ${phonePrefix}`;
        }

        let mpv = document.getElementsByClassName('mobilePrefix-value')
        for (var i = 0; i < mpv.length; i++) {
            mpv[i].value = phonePrefix
        }

        let dp = document.getElementsByClassName('dropdown-prefixmobile')
        for (var i = 0; i < dp.length; i++) {
            dp[i].checked = false;
        }
        //e.preventdefault();
        return false;
    }

    handleSubmitStep1 = event => {
        const { errEmail, errPassword, errCPassword, promotionsRegister } = this.state
        let form = event.target
        let e = form.elements
        let p = userParams.registerParams
        let txtValidated = ''
        let txtEmpty = []
        p.email = e['email'].value;
        p.password = e['password'].value;
        p.mobilePrefix = e['mobilePrefix'].value;
        p.mobile = e['mobile'].value;
        p.emailVerificationURL = window.location.origin + window.location.pathname + window.location.hash + '?key=';
        p.phonePrefix = e['mobilePrefix'].value;
        p.username = e['email'].value;
        if (!e['email'].checkValidity()) {
            txtEmpty.push(<span key='emailAddress' className="d-block">{`${locale.t('textValidityEmail')}`}</span>)
        }
        if (!e['password'].checkValidity() || errPassword.status) {
            txtEmpty.push(<span key='password' className="d-block">{`${locale.t('textValidityPassword')}`}</span>)
        }
        if (!e['confirmPassword'].checkValidity() || errCPassword.status) {
            txtEmpty.push(<span key='confirmPassword' className="d-block">{`${locale.t('textValidityConfirmPassword')}`}</span>)
        }
        if (!e['mobile'].checkValidity()) {
            txtEmpty.push(<span className="d-block">{`${locale.t('textValidityMobile')}`}</span>)
        }
        if (!e['mobilePrefix'].checkValidity()) {
            txtEmpty.push(<span className="d-block">{`${locale.t('textValidityMobilePrefix')}`}</span>)
        }
        let isCheck = false
        // if (!e['cpt'].checked) {

        //     if (isArray(promotionsRegister.data) && promotionsRegister.data.length > 0) {
        //         forEach(promotionsRegister.data, (res, index) => {

        //             if (e[`acceptTC-${res.id}`].checked) {
        //                 isCheck = true
        //             }
        //         })
        //     }
        //     if (e['cptCode'].checked) {
        //         isCheck = true
        //         p.bonusCode = e['bonusCode'].value
        //         if (isEmpty(e['bonusCode'].value)) {
        //             txtEmpty.push(<span key='bonusCode' className="d-block">{`${locale.t('textValidity')} ${locale.t('bonusCode')}`} </span>)
        //         }
        //     }
        // } else {
        //     isCheck = true
        // }


        // if (!isCheck) {
        //     txtEmpty.push(<span key='checkPromotion' className="d-block">{`${locale.t('textValidityPromotion')}`}</span>)
        // }
        txtValidated = {
            renderItem: (
                <Fragment>
                    {txtEmpty}
                </Fragment>
            ),
            isHTML: false
        }
        // if (isCheck) {
        if (form.checkValidity() === false) {
            this.setState({ validated_1: 'was-validated', validated_pmt_1: '' })
            const set = { messageTitle: `${locale.t('validity')}!`, messageDesc: txtValidated, messageDetail: '', messageType: 'error' }
            this.props.onSetMessageModal(set)
            event.preventDefault();
            event.stopPropagation();
        } else {
            if (e['password'].value === e['confirmPassword'].value) {
                if (!errEmail.status && !errPassword.status && !errCPassword.status) {
                    this.setState({ validated_1: true, step: 2, showStep: 2 })
                }
            } else {
                this.setState({ validated_1: 'was-validated', validated_pmt_1: '' })
            }
            event.preventDefault();
        }
        // } else {
        //     this.setState({ validated_1: 'was-validated', validated_pmt_1: 'validated-pmt' })
        //     const set = { messageTitle: `${locale.t('validity')}!`, messageDesc: txtValidated, messageDetail: '', messageType: 'error' }
        //     this.props.onSetMessageModal(set)
        //     event.preventDefault();
        //     event.stopPropagation();
        // }
    };
    handleSubmitStep2 = event => {
        const { promotionsRegister, dataUserConsents } = this.state
        let form = event.target;
        let e = form.elements
        let p = userParams.registerParams
        let m = e['dateOfBirthM'].value
        let txtValidated = ''
        let txtEmpty = []

        if (e['dateOfBirthM'].value < 10) {
            m = `0${e['dateOfBirthM'].value}`
        }
        let d = e['dateOfBirthD'].value
        if (e['dateOfBirthD'].value < 10) {
            d = `0${e['dateOfBirthD'].value}`
        }
        p.title = e['title'].value;
        p.gender = e['title'].value === 'Mr.' ? 'M' : 'F';
        p.firstname = e['firstname'].value;
        // p.bonusCode = e['bonusCode'].value;
        p.surname = e['surname'].value;
        p.address1 = e['address1'].value;
        p.currency = e['currency'].value;

        p.acceptTC = e['acceptTC'].checked;
        p.postalCode = e['postalCode'].value;
        p.city = e['city'].value;
        p.country = e['country'].value;
        // p.region = e['region'].value;
        p.birthDate = `${e['dateOfBirthY'].value}-${m}-${d}`;
        p.language = e['language'].value;
        p.securityQuestion = e['securityQuestion'].value;
        p.securityAnswer = e['securityAnswer'].value;
        p.userConsents.termsandconditions = true
        // Marketing
        p.acceptSMSOffer = e['acceptMarketing'].checked
        p.acceptNewsEmail = e['acceptMarketing'].checked
        // forEach(dataUserConsents, (o) => {
        //     p.userConsents[`${o.code}`] = e['acceptMarketing'].checked
        // })
        p.userConsents.emailmarketing = e['acceptMarketing'].checked
        p.userConsents.sms = e['acceptMarketing'].checked
        p.userConsents['3rdparty'] = e['acceptMarketing'].checked
        let isCheck = false
        if (!e['firstname'].checkValidity()) {
            txtEmpty.push(<span key='firstName' className="d-block">{`${locale.t('textValidity')} ${locale.t('firstName')}`}</span>)
        }
        if (!e['surname'].checkValidity()) {
            txtEmpty.push(<span key='lastName' className="d-block">{`${locale.t('textValidity')}  ${locale.t('lastName')}`}</span>)
        }
        if (!e['address1'].checkValidity()) {
            txtEmpty.push(<span key='address' className="d-block">{`${locale.t('textValidity')}  ${locale.t('address')}`}</span>)
        }
        if (!e['postalCode'].checkValidity()) {
            txtEmpty.push(<span key='postcode' className="d-block">{`${locale.t('textValidity')}  ${locale.t('postcode')}`}</span>)
        }
        if (!e['city'].checkValidity()) {
            txtEmpty.push(<span key='city' className="d-block">{`${locale.t('textValidity')}  ${locale.t('city')}`}</span>)
        }
        if (!e['dateOfBirthY'].checkValidity()) {
            txtEmpty.push(<span key='YYYY' className="d-block">{`${locale.t('textValidity')}  ${locale.t('dateOfBirth')} YYYY`}</span>)
        }
        if (!e['dateOfBirthM'].checkValidity()) {
            txtEmpty.push(<span key='MM' className="d-block">{`${locale.t('textValidity')}  ${locale.t('dateOfBirth')} MM`}</span>)
        }
        if (!e['dateOfBirthD'].checkValidity()) {
            txtEmpty.push(<span key='DD' className="d-block">{`${locale.t('textValidity')}  ${locale.t('dateOfBirth')} DD`}</span>)
        }
        if (!e['securityAnswer'].checkValidity()) {
            txtEmpty.push(<span key='securityAnswer' className="d-block">{`${locale.t('textValidity')}  ${locale.t('securityAnswer')}`}</span>)
        }

        // if (!e['cpt'].checked) {
        //     if (isArray(promotionsRegister.data) && promotionsRegister.data.length > 0) {
        //         forEach(promotionsRegister.data, (res, index) => {
        //             if (e[`acceptTC-${res.id}`].checked) {
        //                 isCheck = true
        //             }
        //         })
        //     }
        //     if (e['cptCode'].checked) {
        //         isCheck = true
        //         p.bonusCode = e['bonusCode'].value
        //         if (isEmpty(e['bonusCode'].value)) {
        //             txtEmpty.push(<span key='bonusCode' className="d-block">{`${locale.t('textValidity')}  ${locale.t('bonusCode')}`}</span>)
        //         }
        //     }
        // } else {
        //     isCheck = true
        // }
        // if (!isCheck) {
        //     txtEmpty.push(<span key='checkPromotion' className="d-block">{`${locale.t('textValidityPromotion')}`}</span>)
        // }
        if (!e['acceptTC'].checked) {
            txtEmpty.push(<span key='formRegisterTextTC' className="d-block">{`${locale.t('textValidity')} ${locale.t('formRegisterTextTC')}`}</span>)
        }
        txtValidated = {
            renderItem: (
                <Fragment>
                    {txtEmpty}
                </Fragment>
            ),
            isHTML: false
        }
        // if (isCheck) {
        if (form.checkValidity() === false) {
            this.setState({ validated_3: 'was-validated', validated_pmt_3: '', errAlias: '' })
            const set = { messageTitle: `${locale.t('validity')}!`, messageDesc: txtValidated, messageDetail: '', messageType: 'error' }
            this.props.onSetMessageModal(set)
            event.preventDefault();
            event.stopPropagation();
        } else {
            this.setState({ validated_4: '', step: 3, showStep: 3 }, () => {
                this.verify()
            })
            event.preventDefault();
            event.stopPropagation();
        }
        // } else {
        //     this.setState({ validated_3: 'was-validated', validated_pmt_3: 'validated-pmt' })
        //     const set = { messageTitle: `${locale.t('validity')}!`, messageDesc: txtValidated, messageDetail: '', messageType: 'error' }
        //     this.props.onSetMessageModal(set)
        //     event.preventDefault();
        //     event.stopPropagation();
        // }

    };
    verify = () => {
        const { validationCode, checkPM, promotionsRegister, cptCode } = this.state
        if (WPService.countriesBlock(this.props.session.currentCountry)) {
            const set = { messageTitle: locale.t('error'), messageDesc: locale.t('msgBlock'), messageDetail: "", messageType: 'error' }
            this.setState({ isVerifyLoading: false }, () => this.props.onSetMessageModal(set))
            return false;
        }
        this.setState({ isVerifyLoading: true })
        let params = userParams.registerParams
        const decodedCookie = decodeURIComponent(replaceSpecialCharacters(document.cookie));
        if (!isEmpty(decodedCookie)) {
            const btag = getCookie('btag', decodedCookie)
            if (!isUndefined(btag) && !isEmpty(btag)) {
                params.affiliateMarker = btag
            }
        }
        if (cptCode) {
            const p = {
                id: params.bonusCode,
                bonusCode: params.bonusCode,
                title: params.bonusCode
            }
            setCookie('promotion-register', JSON.stringify(p), 7)
        } else {
            params.bonusCode = ''
        }
        if (!isUndefined(checkPM.id)) {
            const getId = filter(promotionsRegister.data, (o) => o.id.toString() === checkPM.id.toString())
            if (!isUndefined(head(getId))) {
                const data = head(getId)
                params.bonusCode = data.bonusCode;
                const p = {
                    id: data.id,
                    bonusCode: data.bonusCode,
                    title: data.title
                }
                setCookie('promotion-register', JSON.stringify(p), 7)
            }
        }
        const dateOfBirth = new Date(params.birthDate)

        CasinoNWA.register({
            username: params.username,
            firstname: params.firstname,
            lastname: params.surname,
            motherMaidenName: '',
            address1: params.address1,
            birth: {
                day: dateOfBirth.getDate(),
                month: dateOfBirth.getMonth() + 1,
                year: dateOfBirth.getFullYear(),
            },
            city: params.city,
            country: params.country,
            currency: params.currency,
            email: params.email,
            postalCode: params.postalCode,
            password: params.password,
            title: params.title,
            securityAnswer: params.securityAnswer,
            securityQuestion: params.securityQuestion,
            docType: '',
            docNumber: '',
            mobile: {
              prefix: params.mobilePrefix,
              number: params.mobile,
            },
            address2: params.address2,
            userConsents: params.userConsents,
            nationality: params.country,
            personalId: params.personalId,
            birthPlace: '',
            affiliateMarker: params.affiliateMarker,
            alias: params.alias,
            language: params.language,
            gender: params.gender,
        }).then((res) => {
            // if (!isUndefined(res.userID)) {
            //     const userID = res.userID
            setCookie('btag', '', 30)
            let loginParams = {}
            loginParams.password = params.password;
            loginParams.usernameOrEmail = params.email;
            sendMailPromotionLogin(loginParams.usernameOrEmail, this.props.lang, params.firstname);

            UserService.login(loginParams).then((result) => {   
                if (result.loginCount < 1) {
                    setCookie('__limitset_pop', "false", 375)
                }
                if (result.hasToSetUserConsent) {
                    UserService.getConsentRequirements({ action: 2 }).then((res) => {
                        if (res) {
                            let userConsent = {}
                            forEach(res, (o) => {
                                userConsent[`${o.code}`] = true
                            })
                            UserService.setUserConsents({ userConsents: userConsent }).then(() => {
                                // UserService.login(loginParams).then((result) => {
                                setCookie('isLogin', true, 375)
                                this.setState({ validated_4: 'was-validated', verifyStatus: true, isVerifyLoading: false }, () => {
                                    setTimeout(() => {

                                        window.location.reload()
                                    }, 2000)
                                })
                                // })
                            })
                        } else {
                            setCookie('isLogin', true, 375)
                            this.setState({ validated_4: 'was-validated', verifyStatus: true, isVerifyLoading: false }, () => {
                                setTimeout(() => {

                                    window.location.reload()
                                }, 2000)
                            })
                        }
                    })
                } else {
                    setCookie('isLogin', true, 375)
                    this.setState({ validated_4: 'was-validated', verifyStatus: true, isVerifyLoading: false }, () => {
                        setTimeout(() => {
                            window.location.reload()
                        }, 2000)
                    })
                }
            })
            // }

        }).catch((err) => {
            //const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
            //this.setState({ isVerifyLoading: false }, () => this.props.onSetMessageModal(set))
        })
    }
    handleBlur = (event) => {
        const { registerParams } = this.state
        let value = event.target.value
        let name = event.target.name
        const classNmaeInvalid = 'was-validated has-error'
        const classNmaeValid = 'was-validated'
        if (name === 'email' && !isEmpty(value)) {
            UserService.validateEmail({ email: value }).then((result) => {
                if (result.isAvailable) {
                    this.setState({ errEmail: { class: classNmaeValid, message: '', status: false } })
                } else {
                    let desc = result.error
                    if (this.checkMessageError(desc, 'Email already exists')) {
                        desc = locale.t('textErrorInputRegister1')
                    }
                    this.setState({ errEmail: { class: classNmaeInvalid, message: desc, status: true } })
                }
            }, (err) => {
                let desc = err.desc
                if (this.checkMessageError(desc, 'Incorrect Email format')) {
                    desc = locale.t('textErrorInputRegister2')
                }
                this.setState({ errEmail: { class: classNmaeInvalid, message: desc, status: true } })
            })
        }
        if (name === 'password' && !isEmpty(value)) {
            UserService.pwdGetPolicy().then((result) => {
                let regex = new RegExp(result.regularExpression)
                if (regex.test(value)) {
                    let data = {
                        errPassword: { class: classNmaeValid, message: '', status: false },
                    }
                    if (!isEmpty(registerParams.confirmPassword)) {
                        if (registerParams.confirmPassword === value) {
                            data = {
                                errPassword: { class: classNmaeValid, message: '', status: false },
                                errCPassword: { class: classNmaeValid, message: '', status: false }
                            }
                        } else {
                            data = {
                                errPassword: { class: classNmaeValid, message: '', status: false },
                                errCPassword: { class: classNmaeInvalid, message: locale.t('passwordNotMatch'), status: true }
                            }
                        }
                    }
                    this.setState(data)
                } else {
                    let desc = result.message
                    if (this.checkMessageError(desc, locale.t('passwordTooSimpleAndNotmatch'))) {
                        desc = locale.t('textErrorInputRegister3')
                    }
                    let data = {
                        errPassword: { class: classNmaeInvalid, message: desc, status: true },
                    }
                    if (!isEmpty(registerParams.confirmPassword)) {
                        if (registerParams.confirmPassword === value) {
                            data = {
                                errPassword: { class: classNmaeInvalid, message: desc, status: true },
                                errCPassword: { class: classNmaeValid, message: '', status: false }
                            }
                        } else {
                            data = {
                                errPassword: { class: classNmaeInvalid, message: desc, status: true },
                                errCPassword: { class: classNmaeInvalid, message: locale.t('passwordNotMatch'), status: true }
                            }
                        }
                    }

                    this.setState(data)
                }
            }, (err) => {
                //const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
                //this.props.onSetMessageModal(set)
            })
        }
        if (name === 'confirmPassword' && !isEmpty(value)) {
            if (registerParams.password === value) {
                this.setState({ errCPassword: { class: classNmaeValid, message: '', status: false } })
            } else {
                this.setState({ errCPassword: { class: classNmaeInvalid, message: locale.t('passwordNotMatch'), status: true } })
            }
        }

    }
    handleChange = (event) => {
        const { registerParams, country } = this.state
        let form = event.target

        if (form.name === 'country') {
            let reCountry = filter(country, (res) => res.code === form.value)

            if (!isUndefined(reCountry[0]) && reCountry[0]) {
                this.setState({
                    registerParams: {
                        ...registerParams,
                        [`${form.name}`]: form.value,
                        mobilePrefix: reCountry[0].phonePrefix
                    },

                })
            }
        } else if (form.name === 'mobilePrefix') {
            let reMobilePrefix = filter(country, (res) => res.phonePrefix === form.value)
            this.setState({
                registerParams: {
                    ...registerParams,
                    [`${form.name}`]: form.value,
                    country: !isUndefined(reMobilePrefix[0]) ? reMobilePrefix[0].code : country
                }
            })
        } else if (form.name === 'acceptOffer') {
            this.setState({ acceptOffer: form.checked })
        } else if (form.name === 'acceptTC') {
            this.setState({ registerParams: { ...registerParams, [`${form.name}`]: form.checked } })
        } else {
            this.setState({ registerParams: { ...registerParams, [`${form.name}`]: form.value } })
        }
    }

    checkMessageError = (desc, textValue) => {

        return includes(desc.toLowerCase(), textValue.toLowerCase())
    }
    handleSetChecked = (e) => {
        if (e.target.name === 'cpt') {
            if (e.target.checked) {
                this.setState({ cpt: true, checkPM: '', cptCode: false })
            } else {
                this.setState({ cpt: false })
            }
        } else if (e.target.name === 'cptCode') {
            if (e.target.checked) {
                this.setState({ cptCode: true, checkPM: '', cpt: false })
            } else {
                this.setState({ cptCode: false })
            }
        } else {
            this.setState({ [`${e.target.name}`]: e.target.checked })
        }
    }

    nextStep = (step) => {
        const { registerParams } = this.state
        if (step === 1) {
            registerParams.password = ''
            registerParams.confirmPassword = ''
        }

        this.setState({ step, showStep: step, registerParams })
    }
    openPopup = (e, id) => {
        const data = {
            isOpen: true,
            id,
            type: 'page'
        }
        this.props.onSetAllModal(data)
        e.preventDefault();
        e.stopPropagation();
    }
    renderStep = (e) => {
        const { isRegister } = this.state;
        let layout = null
        if (e === 1) {
            layout = <LayoutLandingStep1
                {...this.state}
                handleSubmitStep1={(e) => this.handleSubmitStep1(e)}
                handleBlur={(e) => this.handleBlur(e)}
                handleChange={(e) => this.handleChange(e)}
                handleSetChecked={(e) => this.handleSetChecked(e)} />
        } else if (e === 2) {
            layout = <LayoutLandingStep2
                {...this.state}
                nextStep={(e) => this.nextStep(e)}
                handleSubmitStep2={(e) => this.handleSubmitStep2(e)}
                handleChange={(e) => this.handleChange(e)}
                handleSetChecked={(e) => this.handleSetChecked(e)}
                openPopup={(e, id) => this.openPopup(e, id)} />
        } else if (e === 3) {
            layout = <LayoutLandingStep3
                {...this.state}
                verify={() => this.verify()}
                nextStep={(e) => this.nextStep(e)}

                handleVerify={(e) => this.handleSetValue(e)} />
        }
        return layout
    }
    handleSetValue = (e) => {
        this.setState({ [`${e.target.name}`]: e.target.value })
    }
    render() {
        const { pageData } = this.props
        const { step, showStep, isRegister } = this.state
        let image = {};
        let title = ''
        let des = ''
        if (!isUndefined(pageData) && !isUndefined(pageData.landing)) {
            image = pageData.landing
            image.alt = pageData.landing.title;
            title = pageData.landing.title;
            des = pageData.landing.description
        }

        return (
            <Col>
                <Row>
                    <Col md={6}>
                        <div className="form-register">
                            <Row className="header row-custom" >
                                <Col xs={8}>
                                    {showStep === 1 && <h3 className="m-0">{locale.t('welcomeWebsite', { text: window.location.hostname })}</h3>}
                                    {/*showStep === 2 && <h3 className="m-0">{locale.t('formRegisterHeader')}</h3>*/}
                                </Col>
                                <Col xs={4} className="text-right">
                                    <p className="m-0">{locale.t('step')} {showStep} {locale.t('ofThree')}</p>
                                </Col>
                            </Row>
                            {this.renderStep(step)}
                            <Row className="footer">
                                <div className={showStep >= 1 ? 'active' : ''} />
                                <div className={showStep >= 2 ? 'active' : ''} />
                                <div className={showStep >= 3 ? 'active' : ''} />
                            </Row>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="bonus">
                            <Picture item={image} />
                            <div className="detail">
                                <h2>{title}</h2>
                                <p className="m-0">{des}</p>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Col>
        )
    }
}

const mapStateToProps = (state) => ({
    isConnected: state.EM.isConnected,
    session: state.sessionState,
    modals: state.modalsState
})

const mapDispatchToProps = (dispatch) => ({
    onSetMessageModal: (active) => dispatch({ type: MESSAGEMODAL, active }),
    onSetCurrentCountry: (currentCountry) => dispatch({ type: CURRENT_COUNTRY, currentCountry }),
    onSetAllModal: (active) => dispatch({ type: ALLMODAL, active }),
    onSetRegisterModal: (active) => dispatch({ type: REGISTERMODAL, active })
})

export default connect(mapStateToProps, mapDispatchToProps)(LandingRegister)
