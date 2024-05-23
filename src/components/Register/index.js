import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'

import Row from 'react-bootstrap/Row';
import Modal from 'react-bootstrap/Modal';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';

import { LazyLoadImage } from 'react-lazy-load-image-component';
import UserService from '../../services/em/user'
import * as userParams from '../../constants/userParams'
import * as routes from '../../constants/routes'
import Picture from '../Picture'

import WPService from '../../../services'
import LayoutStep1 from './LayoutStep1'
import LayoutStep3 from './LayoutStep3'
import LayoutStep4 from './LayoutStep4'
import LoadBlock from '../Loading/LoadBlock'
import RegisterMobile from './RegisterMobile';
import '../../../styles/components/_register.scss'
import {
    setCookie,
    getCookie,
    decodeHtmlCharCodes,
    replaceSpecialCharacters,
    countriesBlock,
    countriesExclude,
    sendMailPromotionLogin,
    isSportPage
} from '../../../utils'
import {
    REGISTERMODAL,
    MESSAGEMODAL,
    ALLMODAL,
    CURRENT_COUNTRY
} from "../../constants/types";
import CasinoNWA from '../../services/em/casinoNWA'

import isEmpty from 'lodash/isEmpty'
import forEach from 'lodash/forEach'
import isUndefined from 'lodash/isUndefined'
import isArray from 'lodash/isArray'
import filter from 'lodash/filter'
import isNull from 'lodash/isNull'
import head from 'lodash/head'
import includes from 'lodash/includes'

const locale = require('react-redux-i18n').I18n

export class Register extends Component {
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
            codeCountrySouthAmerica: [
                'AR',
                'BO',
                'BV',
                'BR',
                'CL',
                'CO',
                'EC',
                'FK',
                'GF',
                'GY',
                'PY',
                'PE',
                'GS',
                'SR',
                'UY',
                'VE',
            ],
            isMobile: false,
        }
    }
    componentDidMount() {
        const { registerParams } = this.state
        window.addEventListener("resize", this.resize.bind(this));
        this.resize();
        /** getCountries*/
        UserService.getCountries({
            expectRegions: true,
            excludeDenyRegistrationCountry: false
        }).then((result) => {
            this.props.onSetCurrentCountry(result.currentIPCountry)
            let ct = [<option key="none" value="">{locale.t('pleaseSelect')}</option>]
            let regions = []
            let newCountries = WPService.countriesExclude(result.countries)
            let countriesDefault = newCountries[0]
            countriesDefault.code = '';
            countriesDefault.phonePrefix = '';
            forEach(newCountries, (res, index) => {
                if (result.currentIPCountry === res.code) {
                    countriesDefault = newCountries[index];
                }

                if(res.code == "FR" || res.code == "GF"|| res.code == "PF"|| res.code == "TF"){
                    //DO NOTHING
                }
                else{
                    ct.push(<option key={index} value={res.code}>{res.name}</option>)
                }
            })
            // if (!isUndefined(countriesDefault.regions)) {
            //     forEach(countriesDefault.regions, (res, index) => {
            //         regions.push(<option key={index} value={res.id}>{res.name}</option>)
            //     })
            // }
            //Set Prefix mobile number
            //let ppf = [<option key="none" value="">{locale.t('pleaseSelect')}</option>]
            let ppf = []
            let myData = [].concat(result.countries)
                .sort((a, b) => a.phonePrefix > b.phonePrefix ? 1 : 0);

            forEach(myData, (res, index) => {
                if (!isEmpty(res.phonePrefix) && !res.phonePrefix.includes('?')) {
                    // ppf.push(<option key={index} value={res.phonePrefix}>
                    //     {res.phonePrefix}
                    //     </option>
                    // )    
                    if(res.code == "IM") res.phonePrefix = "+44-1624";
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
                // regionShow: regions,,
                registerParams,
                mobilePrefixShow: ppf
            })
        })
        /** getPhonePrefixes*/
        // UserService.getPhonePrefixes().then((result) => {
        //     let ppf = [<option key="none" value="">{locale.t('pleaseSelect')}</option>]
        //     forEach(result, (res, index) => {
        //         ppf.push(<option key={index} value={res}>{res}</option>)
        //     })
        //     this.setState({ mobilePrefixShow: ppf })
        // })
        /** getCurrencies*/
        UserService.getCurrencies().then((result) => {

            let ccy = [];
            forEach(result, (res, index) => {
                ccy.push(<option key={index} value={res.code}>{res.name}</option>);
            })
            
            registerParams.currency = 'EUR'
            this.setState({ currencyShow: ccy, registerParams });
        })
        /** getCurrencies*/
        UserService.getLanguages().then((result) => {
            let lg = []
            //Default nation
            registerParams.language = result.currentIPCountry;
            forEach(result, (res, index) => {
                if (res.code === 'en') {
                    registerParams.language = 'en'
                }
                if (res.code === 'en' || res.code === 'fr' || res.code === 'it' || res.code === 'es' || res.code === 'pt') {
                    if (this.props.lang == res.code) {
                        registerParams.language = res.code
                    }
                    lg.push(<option key={index} value={res.code}>{res.name}</option>)
                }
            })
            if (this.props.lang == 'sv' || this.props.lang == 'tr') {
                registerParams.language = this.props.lang
            }
            lg.push(<option key={5} value={'sv'}>{'Svenska'}</option>)
            lg.push(<option key={6} value={'tr'}>{'Türkçe'}</option>)

            this.setState({ languagesShow: lg, registerParams })
        })
        /** getConsentRequirements*/
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
        // forEach(sqs, (res, index) => {
        //     sq.push(<option key={index} value={res.name}>{res.name}</option>)
        // })
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
            // securityQuestionShow: sq,
            dayShow: d,
            monthShow: m,
            yearShow: y,
            paramsId: params,
            checkPM: paramsPM,
            registerParams
        }, () => {
            if (this.props.modals.registerModal) {
                this.isOpen()
            }
        })
    }



    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.modals.registerModal !== this.props.modals.registerModal) {
            if (nextProps.modals.registerModal) {
                if (!isNull(nextProps.modals.registerId)) {
                    this.isOpen(nextProps.modals.registerId)
                } else {
                    this.isOpen()
                }
            }
        }
    }

    resize() {
        let mobile = window.innerWidth <= 1365;
        if (mobile !== this.state.isMobile) {
            this.setState({
                isMobile: mobile,
            });
        }
    }

    setPrefix = (e, phonePrefix, code) => {
        let txt = `<img class='imgCircle' src='/static/images/country/${code}.jpg' />`
        // document.getElementById('selected-value').innerHTML = `${txt} ${phonePrefix}`
        // document.getElementById('mobilePrefix').value = phonePrefix
        // document.getElementById('options-view-button').checked = false;
        let dpv = document.getElementsByClassName('dropdown-prefixvalue-popup')
        for (var i = 0; i < dpv.length; i++) {
            dpv[i].innerHTML = `${txt} ${phonePrefix}`;
        }

        let mpv = document.getElementsByClassName('mobilePrefix-value-popup')
        for (var i = 0; i < mpv.length; i++) {
            mpv[i].value = phonePrefix
        }

        let dp = document.getElementsByClassName('dropdown-prefixmobile-popup')
        for (var i = 0; i < dp.length; i++) {
            dp[i].checked = false;
        }
        //e.preventdefault();
        return false;
    }

    isOpen = async (idPromotions = null) => {
        if (!isNull(idPromotions)) {
            this.setState({
                isRegister: true,
                paramsId: `${idPromotions}`,
                checkPM: { checked: true, id: idPromotions }
            })
            WPService.getPromotionsByID(this.props.lang, 'anonymous', idPromotions).then((res) => {
                if (!isUndefined(res.data)) {
                    this.setState({
                        promotionsRegister: res
                    })
                } else {
                    const set = { messageTitle: locale.t('error'), messageDesc: locale.t('textPromotionRequest'), messageDetail: '', messageType: 'error' }
                    this.props.onSetMessageModal(set)
                }
            }).catch((err) => {
                //const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
                //this.props.onSetMessageModal(set)
            })
        } else {
            this.setState({
                isRegister: true
            })
            WPService.getPromotions(this.props.lang, 'anonymous', this.props.page, 'register').then((res) => {
                if (!isUndefined(res.data)) {
                    this.setState({
                        promotionsRegister: res
                    })
                } else {
                    const set = { messageTitle: locale.t('error'), messageDesc: locale.t('textPromotionRequest'), messageDetail: '', messageType: 'error' }
                    this.props.onSetMessageModal(set)
                }
            }).catch((err) => {
                //const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
                //this.props.onSetMessageModal(set)
            })
        }
    }

    isClose = () => {
        this.setState({
            isRegister: false,
            step: 1,
            showStep: 1,
            validated: false,
            validated_1: false,
            validated_3: false,
            validated_4: '',
            validated_pmt_1: '',
            validated_pmt_3: '',
            errEmail: { class: '', message: '', status: false },
            errPassword: { class: '', message: '', status: false },
            errCPassword: { class: '', message: '', status: false },

        }, () => this.props.onSetRegisterModal(false))
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
    checkPromotion = (evt) => {
        let form = evt.target
        this.setState({ checkPM: { checked: form.checked, id: form.value }, cpt: false, cptCode: false })
    }
    _promotionsRender = () => {
        const { promotionsRegister, showMorePromotion, paramsId, checkPM, cpt } = this.state
        let promotionsRender = []
        if (isArray(promotionsRegister.data) && promotionsRegister.data.length > 0) {
            forEach(promotionsRegister.data, (res, index) => {
                let image = {};
                image = res.image
                image.alt = res.alt;
                const mh = !isUndefined(showMorePromotion[res.id]) && showMorePromotion[res.id] ? 'active-pm' : ''
                const text = !isUndefined(showMorePromotion[res.id]) && showMorePromotion[res.id] ? locale.t('hideMore') : locale.t('showMore')
                const img = !isUndefined(showMorePromotion[res.id]) && showMorePromotion[res.id] ? '/static/images/RegisterPage_DropDown-5.png' : '/static/images/RegisterPage_DropDown-4.png'
                const backgroundSpan = !isUndefined(showMorePromotion[res.id]) && showMorePromotion[res.id] ? null : <span className="linear-text" />
                let ck = false
                if (!cpt) {
                    if (!isEmpty(paramsId) && isUndefined(checkPM.id) && paramsId.toString() === res.id.toString()) {
                        ck = true
                    } else if (!isUndefined(checkPM.id) && checkPM.id.toString() === res.id.toString()) {
                        ck = checkPM.checked
                    }
                }
                if (ck == true || res.type != "disable") {
                    promotionsRender.push(
                        <Row key={`p-${index}`} className="px-3 content-wp">
                            <Col md={12} className={`block-content`}>
                                <p className="text-uppercase mb-0" dangerouslySetInnerHTML={{ __html: res.title }}></p>
                            </Col>
                            <Col md={12} className="px-0 block-promotion-image">
                                <Picture item={image} />
                            </Col>
                            <Col md={12} className="px-0 mb-3 des">
                                <div className="conditions">
                                    <Form.Check checked={ck} value={res.id} onChange={(evt) => this.checkPromotion(evt)} name={`acceptTC-${res.id}`} className="promotions" type="checkbox" />
                                    <div className="conditions-content">
                                        <p className="mx-2 my-0">{res.checkboxText}</p>
                                        {/* <a href={`${routes.promotions}/${res.categories}/${res.slug}`} target="_blank"  >{locale.t('terms')}</a> */}
                                        {/* <p className="mx-2 my-0">{locale.t('formRegisterTextPromotion2AcceptTC')}</p> */}
                                    </div>
                                </div>
                                <div className="position-relative">
                                    <p className="px-3 pb-0 mb-0">
                                        <a onClick={(e) => this.openPopupBonus(e, res.id)} target="_blank" className="link text-small" href={res.categories == 'casino-promotions' ? routes.casinoTerms : routes.sportsTerms}  >
                                            {locale.t(res.categories == 'casino-promotions' ? 'casinoTerms' : 'sportsTerms')}
                                        </a>
                                    </p>
                                </div>
                                <div className="position-relative">
                                    <div className={`px-3 text-wp-pm ${mh}`} dangerouslySetInnerHTML={{ __html: res.shortDescription }} />
                                    {backgroundSpan}
                                </div>
                                <a className="d-flex py-2 text-center align-items-center justify-content-center more" onClick={() => this.showMorePromotion(res.id)}>
                                    <p className="m-0 pr-3">{text}</p>
                                    <LazyLoadImage src={img} alt="Arrow" className="img-fluid" />
                                </a>
                            </Col>
                        </Row>
                    )
                }
            })

        } else {
            // promotionsRender.push(<LoadBlock key={0} loadTrue={true} />)
        }
        return promotionsRender
    }

    nextStep = (step) => {
        const { registerParams } = this.state
        // if (step === 1) {
        //     registerParams.password = ''
        //     registerParams.confirmPassword = ''
        // }

        this.setState({ step, showStep: step, registerParams })
    }

    finishStep = () => {
        window.location = window.location.origin;
    }

    handleSubmitStep1 = event => {
        const { errEmail, errPassword, errCPassword, promotionsRegister } = this.state
        let form = event.target
        let e = form.elements
        let p = userParams.registerParams
        let txtValidated = ''
        let txtEmpty = []
        let m = e['dateOfBirthM'].value

        p.email = e['email'].value;
        p.password = e['password'].value;
        p.mobilePrefix = e['mobilePrefix'].value;
        p.mobile = e['mobile'].value;
        p.title = e['title'].value;
        p.gender = e['title'].value === 'Mr.' ? 'M' : 'F';
        p.firstname = e['firstname'].value;
        p.surname = e['surname'].value;
        // p.emailVerificationURL = window.location.origin + window.location.pathname + window.location.hash + '?key=';
        p.phonePrefix = e['mobilePrefix'].value;
        p.username = e['email'].value;

        if (e['dateOfBirthM'].value < 10) {
            m = `0${e['dateOfBirthM'].value}`
        }
        let d = e['dateOfBirthD'].value
        if (e['dateOfBirthD'].value < 10) {
            d = `0${e['dateOfBirthD'].value}`
        }
        p.birthDate = `${e['dateOfBirthY'].value}-${m}-${d}`;

        if (!e['email'].checkValidity()) {
            txtEmpty.push(<span key='emailAddress' className="d-block">{`${locale.t('textValidityEmail')}`}</span>)
        }
        if (!e['password'].checkValidity() || errPassword.status) {
            txtEmpty.push(<span key='password' className="d-block">{`${locale.t('textValidityPassword')}`}</span>)
        }
        // if (!e['confirmPassword'].checkValidity() || errCPassword.status) {
        //     txtEmpty.push(<span key='confirmPassword' className="d-block">{`${locale.t('textValidityConfirmPassword')}`}</span>)
        // }
        if (!e['mobile'].checkValidity()) {
            txtEmpty.push(<span className="d-block">{`${locale.t('textValidityMobile')}`}</span>)
        }
        if (!e['mobilePrefix'].checkValidity()) {
            txtEmpty.push(<span className="d-block">{`${locale.t('textValidityMobilePrefix')}`}</span>)
        }
        if (!e['firstname'].checkValidity()) {
            txtEmpty.push(<span key='firstName' className="d-block">{`${locale.t('textValidityFirstName')}`}</span>)
        }
        if (!e['surname'].checkValidity()) {
            txtEmpty.push(<span key='lastName' className="d-block">{`${locale.t('textValidityLastName')}`}</span>)
        }
        if (!e['dateOfBirthY'].checkValidity()) {
            txtEmpty.push(<span key='YYYY' className="d-block">{`${locale.t('textValidityYearOfBirth')}`}</span>)
        }
        if (!e['dateOfBirthM'].checkValidity()) {
            txtEmpty.push(<span key='MM' className="d-block">{`${locale.t('textValidityMonthOfBirth')}`}</span>)
        }
        if (!e['dateOfBirthD'].checkValidity()) {
            txtEmpty.push(<span key='DD' className="d-block">{`${locale.t('textValidityDayOfBirth')}`}</span>)
        }


        let isCheck = false
        if (!e['cpt'].checked) {

            if (isArray(promotionsRegister.data) && promotionsRegister.data.length > 0) {
                forEach(promotionsRegister.data, (res, index) => {

                    if (e[`acceptTC-${res.id}`].checked) {
                        isCheck = true
                    }
                })
            }
            if (e['cptCode'].checked) {
                isCheck = true
                p.bonusCode = e['bonusCode'].value
                if (isEmpty(e['bonusCode'].value)) {
                    txtEmpty.push(<span key='bonusCode' className="d-block">{`${locale.t('textValidityBonusCode')}`} </span>)
                }
            }
        } else {
            isCheck = true
        }


        if (!isCheck) {
            txtEmpty.push(<span key='checkPromotion' className="d-block">{`${locale.t('textValidityPromotion')}`}</span>)
        }
        txtValidated = {
            renderItem: (
                <Fragment>
                    {txtEmpty}
                </Fragment>
            ),
            isHTML: false
        }
        if (isCheck) {
            if (form.checkValidity() === false) {
                this.setState({ validated_1: 'was-validated', validated_pmt_1: '' })
                const set = { messageTitle: `${locale.t('validity')}!`, messageDesc: txtValidated, messageDetail: '', messageType: 'error' }
                this.props.onSetMessageModal(set)
                event.preventDefault();
                event.stopPropagation();
            } else {
                if (e['password'].value) {
                    if (!errEmail.status && !errPassword.status && !errCPassword.status) {
                        this.setState({ validated_1: true, step: 2, showStep: 2 })
                    }
                } else {
                    this.setState({ validated_1: 'was-validated', validated_pmt_1: '' })
                }
                event.preventDefault();
            }
        } else {
            this.setState({ validated_1: 'was-validated', validated_pmt_1: 'validated-pmt' })
            const set = { messageTitle: `${locale.t('validity')}!`, messageDesc: txtValidated, messageDetail: '', messageType: 'error' }
            this.props.onSetMessageModal(set)
            event.preventDefault();
            event.stopPropagation();
        }


    };

    handleSubmitStep3 = event => {
        const { promotionsRegister, dataUserConsents, registerParams } = this.state
        let form = event.target;
        let e = form.elements
        let p = userParams.registerParams
        let txtValidated = ''
        let txtEmpty = []
        
        p.address1 = e['address1'].value;
        p.currency = e['currency'].value;

        p.acceptTC = e['acceptTC'].checked;
        p.postalCode = e['postalCode'].value;
        p.personalID = 'none';
        p.city = e['city'].value;
        p.country = e['country'].value;
        // p.region = e['region'].value;
        p.language = e['language'].value;
        p.securityQuestion = 'none';
        p.securityAnswer = 'none';
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
       
        if (!e['address1'].checkValidity()) {
            txtEmpty.push(<span key='address' className="d-block">{`${locale.t('textValidityAddressLine1')}`}</span>)
        }
        if (!e['city'].checkValidity()) {
            txtEmpty.push(<span key='city' className="d-block">{`${locale.t('textValidityCity')}`}</span>)
        }
        if (!e['postalCode'].checkValidity()) {
            txtEmpty.push(<span key='postcode' className="d-block">{`${locale.t('textValidityPostcode')}`}</span>)
        }
        // if (!e['securityAnswer'].checkValidity()) {
        //     txtEmpty.push(<span key='securityAnswer' className="d-block">{`${locale.t('textValiditySecurityAnswer')}`}</span>)
        // }

        if (!e['cpt'].checked) {
            if (isArray(promotionsRegister.data) && promotionsRegister.data.length > 0) {
                forEach(promotionsRegister.data, (res, index) => {
                    if (e[`acceptTC-${res.id}`].checked) {
                        isCheck = true
                    }
                })
            }
            if (e['cptCode'].checked) {
                isCheck = true
                p.bonusCode = e['bonusCode'].value
                if (isEmpty(e['bonusCode'].value)) {
                    txtEmpty.push(<span key='bonusCode' className="d-block">{`${locale.t('textValidityBonusCode')}`}</span>)
                }
            }
        } else {
            isCheck = true
        }
        if (!isCheck) {
            txtEmpty.push(<span key='checkPromotion' className="d-block">{`${locale.t('textValidityPromotion')}`}</span>)
        }
        if (!e['acceptTC'].checked) {
            txtEmpty.push(<span key='formRegisterTextTC' className="d-block">{`${locale.t('textValidityFormRegisterTextTC')}`}</span>)
        }
        txtValidated = {
            renderItem: (
                <Fragment>
                    {txtEmpty}
                </Fragment>
            ),
            isHTML: false
        }
        if (isCheck) {
            if (form.checkValidity() === false) {
                this.setState({ validated_3: 'was-validated', validated_pmt_3: '', errAlias: '' })
                const set = { messageTitle: `${locale.t('validity')}!`, messageDesc: txtValidated, messageDetail: '', messageType: 'error' }
                this.props.onSetMessageModal(set)
                event.preventDefault();
                event.stopPropagation();
            } else {
                this.setState({ validated_4: '' }, () => {
                    this.verify()
                })
                event.preventDefault();
            }
        } else {
            this.setState({ validated_3: 'was-validated', validated_pmt_3: 'validated-pmt' })
            const set = { messageTitle: `${locale.t('validity')}!`, messageDesc: txtValidated, messageDetail: '', messageType: 'error' }
            this.props.onSetMessageModal(set)
            event.preventDefault();
            event.stopPropagation();
        }

    };
    checkMessageError = (desc, textValue) => {

        return includes(desc.toLowerCase(), textValue.toLowerCase())
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
        const { registerParams, country, codeCountrySouthAmerica } = this.state
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

    fetchPost = (url, params) => {
        return fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'CSRF-Token': this.props.csrfToken
            },
            body: JSON.stringify(params)
        }).then((resJson) => {
            return resJson.json()
        })
    }
    verify = () => {
        const { validationCode, checkPM, promotionsRegister, cptCode } = this.state
        this.setState({ isVerifyLoading: true })
        if (WPService.countriesBlock(this.props.session.currentCountry)) {
            const set = { messageTitle: locale.t('error'), messageDesc: locale.t('msgBlock'), messageDetail: "", messageType: 'error' }
            this.setState({ isVerifyLoading: false }, () => this.props.onSetMessageModal(set))
            return false;
        }

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
            setCookie('tracking-register', params.email, 30)
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
                                UserService.login(loginParams).then((result) => {
                                    //sendMailPromotionLogin(loginParams.usernameOrEmail, this.props.lang, params.firstname);
                                    setCookie('isLogin', true, 375)
                                    this.setState({ validated_4: 'was-validated', verifyStatus: true }, () => {
                                        setTimeout(() => {
                                            this.isClose()
                                            window.location = window.location.origin
                                        }, 3000)
                                    })
                                })
                            })
                        } else {
                            setCookie('isLogin', true, 375)
                            this.setState({ validated_4: 'was-validated', verifyStatus: true }, () => {
                                setTimeout(() => {
                                    this.isClose()
                                    window.location = window.location.origin
                                }, 3000)
                            })
                        }
                    })
                } else {
                    setCookie('isLogin', true, 375)
                    this.setState({ validated_4: 'was-validated', verifyStatus: true }, () => {
                        setTimeout(() => {
                            this.isClose()
                            window.location = window.location.origin
                        }, 3000)
                    })
                }
            })
        }).catch((err) => {
            //const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
            //this.setState({ isVerifyLoading: false }, () => this.props.onSetMessageModal(set))
        })
    }

    handleSetValue = (e) => {
        this.setState({ [`${e.target.name}`]: e.target.value })
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
    openPopupBonus = (e, id) => {
        const data = {
            isOpen: true,
            id,
            type: 'bonus'
        }
        this.props.onSetAllModal(data)
        e.preventDefault();
        e.stopPropagation();
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
        // const { isRegister, isMobile, countryShow, registerParams, currencyShow, mobilePrefixShow, country, dayShow, monthShow, yearShow } = this.state;
        const { goToLogin } = this.props
        const theme = localStorage.getItem('theme-html')
        let layout = null
        // if (isMobile) {
        //     return <RegisterMobile
        //         countryShow={countryShow}
        //         registerParams={registerParams}
        //         currencyShow={currencyShow}
        //         mobilePrefixShow={mobilePrefixShow}
        //         country={country}
        //         dayShow={dayShow}
        //         monthShow={monthShow}
        //         yearShow={yearShow}
        //         session={this.props.session}

        //         handleClose={() => this.isClose()}
        //         onSetMessageModal={(e) => this.props.onSetMessageModal(e)}
        //         openPopup={(e, id) => this.openPopup(e, id)}
        //     />
        // }
        if (e === 1) {
            layout = <LayoutStep1
                {...this.state}
                _promotionsRender={this._promotionsRender()}
                handleSubmitStep1={(e) => this.handleSubmitStep1(e)}
                handleBlur={(e) => this.handleBlur(e)}
                handleChange={(e) => this.handleChange(e)}
                handleSetChecked={(e) => this.handleSetChecked(e)} 
                theme={theme}
                goToLogin={goToLogin}
                />
        } else if (e === 2) {
            layout = <LayoutStep3
                {...this.state}
                _promotionsRender={this._promotionsRender()}
                nextStep={(e) => this.nextStep(e)}
                handleSubmitStep3={(e) => this.handleSubmitStep3(e)}
                handleChange={(e) => this.handleChange(e)}
                handleSetChecked={(e) => this.handleSetChecked(e)}
                openPopup={(e, id) => this.openPopup(e, id)} 
                theme={theme}
                goToLogin={goToLogin}
                />
        }
        // } else if (e === 3) {
        //     layout = <LayoutStep4
        //         {...this.state}
        //         verify={() => this.verify()}
        //         nextStep={(e) => this.nextStep(e)}
        //         finishStep={ () => this.finishStep() }
        //         handleVerify={(e) => this.handleSetValue(e)} />
        // }
        return layout
    }

    render() {
        const { step, showStep, isRegister, isMobile } = this.state
        const { useragent } = this.props;

        let classModal = isSportPage(`register step-${step}`, useragent);
        return (
            <Modal centered show={isRegister} onHide={() => this.isClose()} className={classModal} >
                <Modal.Body>
                    <Container className="content-step">
                        <div className="content-body-register">
                            {/* Move [X] popup to same row of text register.
                            <Row className="row-custom">
                                <Col className="close-icon" >
                                    <a onClick={() => this.isClose()}><i className="jb-icon registerpage-x" /></a>
                                </Col>
                            </Row>
                            */}
                            <Row className="header row-custom" >
                                <Col xs={8}>
                                    {(showStep === 1 || showStep === 2) && <h4 class="titleRegister">{locale.t('registration')}</h4>}
                                    {/*showStep === 2 && <h4 className="m-0">{locale.t('formRegisterHeader')}</h4>*/}
                                </Col>
                                {/* Hide text: Step X of Y
                                <Col xs={4} className="text-right">
                                    <p className="m-0">{locale.t('step')} {showStep} {locale.t('ofThree')}</p>
                                </Col>
                                */}
                                <Col className="close-icon" >
                                    <a onClick={() => this.isClose()}><i className="jb-icon registerpage-x" /></a>
                                </Col>
                            </Row>
                        
                            {this.renderStep(step)}

                            <Row className="footer-register">
                                <div className={showStep >= 1 ? 'active' : ''} />
                                <div className={showStep >= 2 ? 'active' : ''} />
                                {/* <div className={showStep >= 3 ? 'active' : ''} /> */}
                            </Row>
                        </div>

                    </Container>
                </Modal.Body>
            </Modal>
        )
    }
}

const mapStateToProps = (state) => ({
    isConnected: state.EM.isConnected,
    session: state.sessionState,
    modals: state.modalsState
})

const mapDispatchToProps = (dispatch) => ({
    onSetRegisterModal: (active) => dispatch({ type: REGISTERMODAL, active }),
    onSetMessageModal: (active) => dispatch({ type: MESSAGEMODAL, active }),
    onSetAllModal: (active) => dispatch({ type: ALLMODAL, active }),
    onSetCurrentCountry: (currentCountry) => dispatch({ type: CURRENT_COUNTRY, currentCountry })

})

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    { forwardRef: true }
)(Register)
