import React, { useEffect, useState, Fragment } from 'react'
import { Row, Col, Form, Button, Spinner } from 'react-bootstrap'

import UserService from '../../services/em/user'
import * as userParams from '../../constants/userParams'

import WPService from '../../../services'
import {
    setCookie,
    getCookie,
    decodeHtmlCharCodes,
    replaceSpecialCharacters,
    countriesBlock,
    countriesExclude,
    sendMailPromotionLogin,
} from '../../../utils'
import CasinoNWA from '../../services/em/casinoNWA'

import _ from 'lodash'

const locale = require('react-redux-i18n').I18n

const RegisterMobile = (props) => {
    const { handleClose, onSetMessageModal, countryShow, registerParams, currencyShow, mobilePrefixShow, country, dayShow, monthShow, yearShow, openPopup, session } = props
    const [validated, setValidated] = useState(false);
    const [allErrors, setAllErrors] = useState({ email: '', password: '', mobile: '', dateOfBirthY: '', dateOfBirthM: '', dateOfBirthD: '' });
    const [registerParamsState, setRegisterParamsState] = useState({ ...registerParams })
    const [isLoad, setIsLoad] = useState(false)

    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick);
    
        return () => {
          document.removeEventListener('mousedown', handleOutsideClick);
        };
      }, []);

    const handleOutsideClick = (event) => {
        const element = document.getElementById("options-view-button");
        const prefixOption = document.getElementById("options");
        const isChecked = element.checked;
        if(isChecked && !prefixOption.contains(event.target)){
            element.checked = false;
        }
    };

    const handleSubmit = (event) => {
        let form = event.target
        let name = event.target.name
        let txtEmpty = []
        let txtValidated = ''
        if (form.checkValidity() === false) {
            setValidated(true);
            if (!form['acceptTC'].checked) {
                txtEmpty.push(<span key='YYYY' className="d-block">{`${locale.t('textValidityFormRegisterTextTC')}`}</span>)
            }
            if (!form['dateOfBirthY'].checkValidity()) {
                txtEmpty.push(<span key='YYYY' className="d-block">{`${locale.t('textValidityYearOfBirth')}`}</span>)
            }
            if (!form['dateOfBirthM'].checkValidity()) {
                txtEmpty.push(<span key='MM' className="d-block">{`${locale.t('textValidityMonthOfBirth')}`}</span>)
            }
            if (!form['dateOfBirthD'].checkValidity()) {
                txtEmpty.push(<span key='DD' className="d-block">{`${locale.t('textValidityDayOfBirth')}`}</span>)
            }
            txtValidated = {
                renderItem: (
                    <Fragment>
                        {txtEmpty}
                    </Fragment>
                ),
                isHTML: false
            }
            if (txtEmpty.length > 0) {
                const set = { messageTitle: `${locale.t('validity')}!`, messageDesc: txtValidated, messageDetail: '', messageType: 'error' }
                onSetMessageModal(set)
            }
            setAllErrors({
                ...allErrors,
                mobile: form['mobile'].value ? '' : locale.t('formRequiredFields'),
                dateOfBirthY: form['dateOfBirthY'].value ? '' : locale.t('formRequiredFields'),
                dateOfBirthM: form['dateOfBirthM'].value ? '' : locale.t('formRequiredFields'),
                dateOfBirthD: form['dateOfBirthD'].value ? '' : locale.t('formRequiredFields'),
            })
            event.preventDefault();
            event.stopPropagation();
        } else {
            let p = userParams.registerParams
            let m = form['dateOfBirthM'].value
            let d = form['dateOfBirthD'].value
            if (form['dateOfBirthM'].value < 10) {
                m = `0${form['dateOfBirthM'].value}`
            }
            if (form['dateOfBirthD'].value < 10) {
                d = `0${form['dateOfBirthD'].value}`
            }
            p.email = form['email'].value;
            p.password = form['password'].value;
            p.mobilePrefix = form['mobilePrefix'].value;
            p.mobile = form['mobile'].value;
            p.phonePrefix = form['mobilePrefix'].value;
            p.username = form['email'].value;
            p.acceptTC = true;
            p.title = form['title'].value;
            p.gender = form['title'].value === 'Mr.' ? 'M' : 'F';
            p.firstname = form['firstname'].value;
            p.surname = form['surname'].value;
            p.address1 = form['address1'].value;
            p.currency = form['currency'].value;
            p.postalCode = form['postalCode'].value;
            p.personalID = 'none';
            p.city = form['city'].value;
            p.country = form['country'].value;
            p.birthDate = `${form['dateOfBirthY'].value}-${m}-${d}`;
            p.language = 'EN'
            p.securityQuestion = 'none';
            p.securityAnswer = 'none';
            p.userConsents.termsandconditions = true
            // Marketing
            p.acceptSMSOffer = form['acceptMarketing'].checked
            p.acceptNewsEmail = form['acceptMarketing'].checked
            p.userConsents.emailmarketing = form['acceptMarketing'].checked
            p.userConsents.sms = form['acceptMarketing'].checked
            p.userConsents['3rdparty'] = form['acceptMarketing'].checked

            verify(p)
        }
        event.preventDefault();
        event.stopPropagation();
    }

    const verify = (data) => {

        if (WPService.countriesBlock(session.currentCountry)) {
            const set = { messageTitle: locale.t('error'), messageDesc: locale.t('msgBlock'), messageDetail: "", messageType: 'error' }
            return onSetMessageModal(set);
        }

        let params = data
        setIsLoad(true)

        const decodedCookie = decodeURIComponent(replaceSpecialCharacters(document.cookie));
        if (!_.isEmpty(decodedCookie)) {
            const btag = getCookie('btag', decodedCookie)
            if (!_.isUndefined(btag) && !_.isEmpty(btag)) {
                params.affiliateMarker = btag
            }
        }
        params.bonusCode = ''

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
                                    setCookie('isLogin', true, 375)
                                    handleClose()
                                    setIsLoad(false)
                                    setTimeout(() => {
                                        window.location = window.location.origin + '/account/deposit';
                                    }, 2000)
                                })
                            })
                        } else {
                            setCookie('isLogin', true, 375)
                            handleClose()
                            setIsLoad(false)
                            setTimeout(() => {
                                window.location = window.location.origin + '/account/deposit';
                            }, 2000)

                        }
                    })
                } else {
                    setCookie('isLogin', true, 375)
                    handleClose()
                    setIsLoad(false)
                    setTimeout(() => {
                        window.location = window.location.origin + '/account/deposit';
                    }, 2000)
                }
            })


        }).catch((err) => {
            const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail + '[EM]', messageType: 'error' }
            onSetMessageModal(set)
            setIsLoad(false)
        })
    }
    const handleChange = (event) => {
        let value = event.target.value
        let name = event.target.name
        if (name === 'mobile' && !_.isEmpty(value)) {
            if (allErrors.mobile !== '') {
                setAllErrors({
                    ...allErrors,
                    mobile: ''
                })
            }
        }
        if (name === 'country') {
            let reCountry = _.filter(country, (res) => res.code === value)

            if (!_.isUndefined(reCountry[0]) && reCountry[0]) {
                setRegisterParamsState({
                    ...registerParamsState,
                    [`${name}`]: value,
                    mobilePrefix: reCountry[0].phonePrefix
                })
            }
        }
        if (name === 'mobilePrefix') {
            let reMobilePrefix = _.filter(country, (res) => res.phonePrefix === value)
            setRegisterParamsState({
                ...registerParamsState,
                [`${name}`]: value,
                country: !_.isUndefined(reMobilePrefix[0]) ? reMobilePrefix[0].code : country
            })
        }
    }

    const handleBlur = (event) => {
        let value = event.target.value
        let name = event.target.name

        if (name === 'email' && !_.isEmpty(value)) {
            UserService.validateEmail({ email: value }).then((result) => {
                if (result.isAvailable) {
                    setAllErrors((oldState) => {
                        return { ...oldState, email: '' }
                    })
                } else {
                    let desc = result.error
                    if (checkMessageError(desc, 'Email already exists')) {
                        desc = locale.t('textErrorInputRegister1')
                    }
                    setAllErrors((oldState) => {
                        return { ...oldState, email: desc }
                    })
                }
            }, (err) => {
                let desc = err.desc
                if (checkMessageError(desc, 'Incorrect Email format')) {
                    desc = locale.t('textErrorInputRegister2')
                }
                setAllErrors((oldState) => {
                    return { ...oldState, email: desc }
                })
            })
        }
        if (name === 'password' && !_.isEmpty(value)) {
            UserService.pwdGetPolicy().then((result) => {
                let regex = new RegExp(result.regularExpression)
                if (regex.test(value)) {
                    setAllErrors((oldState) => {
                        return { ...oldState, password: '' }
                    })
                } else {
                    let desc = result.message
                    if (checkMessageError(desc, locale.t('passwordTooSimpleAndNotmatch'))) {
                        desc = locale.t('textErrorInputRegister3')
                    }
                    setAllErrors((oldState) => {
                        return { ...oldState, password: desc }
                    })
                }
            }, (err) => {
                const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
                onSetMessageModal(set)
            })
        }
    }

    const checkMessageError = (desc, textValue) => {
        return _.includes(desc.toLowerCase(), textValue.toLowerCase())
    }

    return (
        <Row className="body step-body-mobile">
            <h4 className="m-0">{locale.t('welcomeWebsite', { text: window.location.hostname })}</h4>
            <Col md={12} className="text-content form-register-mobile pt-4">
                <Form noValidate validated={validated} className="w-100" onSubmit={(e) => handleSubmit(e)} >
                    <Form.Group className={!!allErrors.email && "was-validated has-error"}>
                        <Form.Control className="input-form-n1" isInvalid={!!allErrors.email} required type="email" id="la-email" placeholder={locale.t('email')} name="email" onBlur={(e) => handleBlur(e)} autoComplete="email" />
                        <Form.Control.Feedback type="invalid">{allErrors.email}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className={!!allErrors.password && "was-validated has-error"}>
                        <Form.Control className="input-form-n1" isInvalid={!!allErrors.password} required type="password" name="password" placeholder={locale.t('placeHolderPassword')} onBlur={(e) => handleBlur(e)} autoComplete="current-password" />
                        <Form.Control.Feedback type="invalid">{allErrors.password}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Row className={`${!!allErrors.mobile && "was-validated has-error"} select-box-form-group`} >
                        <Form.Group as={Col} xs={4} className="dropdownPrefix m-0" >
                            <div id="select-box">
                                <input type="checkbox" name="options-view-button" id="options-view-button" className="dropdown-prefixmobile-popup" />
                                <div id="select-button" className="brd">
                                    <div id="selected-value" className="dropdown-prefixvalue-popup">
                                        {registerParamsState.country || registerParams.country ?
                                            <Fragment>
                                                <img  class="imgCircle" src={`/static/images/country/${(registerParamsState.country || registerParams.country)}.jpg`} />
                                                {registerParamsState.mobilePrefix || registerParams.mobilePrefix}
                                            </Fragment>
                                            : null
                                        }
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
                            <div className="floating-label-wrap">
                                <Form.Control type="hidden" required name="mobilePrefix" id="mobilePrefix" className="mobilePrefix-value-popup" defaultValue={registerParamsState.mobilePrefix || registerParams.mobilePrefix} />
                            </div>
                        </Form.Group>
                        <Form.Group as={Col} xs={8} className="m-0" >
                            <Form.Control className="input-form-n1" required type="text" minLength={6} placeholder={locale.t('mobileNumber')} name="mobile" onChange={(e) => handleChange(e)} />
                        </Form.Group>
                    </Form.Row>
                    <div className="d-flex pt-3">
                        <Form.Group as={Col} xs={3} className="pl-0" >
                            <Form.Control as="select" className='input-form-n1' name="title">
                                <option value="Mr.">{locale.t('mr')}</option>
                                <option value="Ms.">{locale.t('ms')}</option>
                                <option value="Mrs.">{locale.t('mrs')}</option>
                                <option value="Miss">{locale.t('miss')}</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group as={Col} xs={9} className="p-0">
                            <Form.Control required className='input-form-n1' type="text" name="firstname" placeholder={locale.t('firstName')} />
                        </Form.Group>
                    </div>
                    <Form.Group >
                        <Form.Control required className='input-form-n1' type="text" name="surname" placeholder={locale.t('lastName')} />
                    </Form.Group>
                    <Form.Group >
                        <Form.Control required className='input-form-n1' type="text" name="address1" placeholder={locale.t('address')} />
                    </Form.Group>
                    <Form.Group >
                        <Form.Control required className='input-form-n1' type="text" name="city" placeholder={locale.t('placeHolderCity')} />
                    </Form.Group>
                    <Form.Group >
                        <Form.Control required className='input-form-n1' name="country" componentclass="select" as="select" onChange={(e) => handleChange(e)} defaultValue={registerParamsState.country}>
                            {countryShow}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group >
                        <Form.Control className='input-form-n1' required type="text" name="postalCode" placeholder={locale.t('postcode')} />
                    </Form.Group>
                    <Form.Row className={`${!!allErrors.dateOfBirthD || !!allErrors.dateOfBirthM || !!allErrors.dateOfBirthY ? "was-validated has-error" : ''} select-box-form-group select-date pb-3`} >
                        <Form.Group as={Col} xs={4} className="dropdownPrefix  m-0" >
                            <Form.Control className="input-form-n1" required name="dateOfBirthD" defaultValue={registerParamsState.dateOfBirthD} componentclass="select" as="select">
                                <option value="">{locale.t('dateD')}</option>
                                {dayShow}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group as={Col} xs={4} className="dropdownPrefix m-0" >
                            <Form.Control className="input-form-n1" required name="dateOfBirthM" defaultValue={registerParamsState.dateOfBirthM} componentclass="select" as="select">
                                <option value="">{locale.t('dateM')}</option>
                                {monthShow}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group as={Col} xs={4} className="dropdownPrefix m-0" >
                            <Form.Control className="input-form-n1" required name="dateOfBirthY" defaultValue={registerParamsState.dateOfBirthY} componentclass="select" as="select">
                                <option value="">{locale.t('dateY')}</option>
                                {yearShow}
                            </Form.Control>
                        </Form.Group>
                    </Form.Row>
                    <Form.Group>
                        <Form.Control className='input-form-n1' required as="select" name="currency" componentclass="select" defaultValue={registerParamsState.currency} >
                            {currencyShow}
                        </Form.Control>
                    </Form.Group>
                    <Form.Row className="m-0">
                        <Form.Group className="conditions mb-1" as={Col} md={12}>
                            <Form.Check name="acceptMarketing" className="acceptMarketing" type="checkbox" />
                            <div className="conditions">
                                <p className="mx-2 my-0">
                                    {locale.t('formRegisterTextAcceptMarketing')}
                                    <a href={`/thirdparty`} onClick={(e) => openPopup(e, 'thirdparty')} target="_blank" className="text-lowercase px-2">{`(${locale.t('buttonReadMore')})`}</a>
                                </p>
                            </div>
                        </Form.Group>
                    </Form.Row>
                    <Form.Row className="m-0">
                        <Form.Group className="conditions " as={Col} md={12}>
                            <Form.Check required name="acceptTC" className="acceptTC" type="checkbox" />
                            <div className="conditions">
                                <p className="mx-2 m-0">
                                    {locale.t('over-18')}
                                    <a href={`/terms-conditions`} onClick={(e) => openPopup(e, 'general-2')} className="px-2" target="_blank">{locale.t('formRegisterTextTC')}</a>
                                    {locale.t('and')}
                                    <a href={`/terms-conditions/privacy-policy`} onClick={(e) => openPopup(e, 'privacy-policy-2')} className="px-2" target="_blank">{locale.t('formRegisterTextPP')}</a>
                                </p>
                            </div>
                        </Form.Group>
                    </Form.Row>
                    <Form.Group className="d-flex justify-content-center">
                        {
                            isLoad ?
                                (
                                    <Button className="button btn-3 btn-n1" type="submit" disabled>
                                        <Spinner animation="border" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </Spinner>
                                    </Button>
                                ) :
                                (
                                    <Button className="button btn-3 btn-n1" type="submit">
                                        <p className="pl-2 text-uppercase m-0">{locale.t('finish')}</p>
                                    </Button>
                                )
                        }

                    </Form.Group>
                </Form>
            </Col>
        </Row>
    )
}

export default RegisterMobile