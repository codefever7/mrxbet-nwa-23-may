import React, { Component } from 'react'

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import isEmpty from 'lodash/isEmpty'
import isUndefined from 'lodash/isUndefined'
import { LazyLoadImage } from 'react-lazy-load-image-component';

const locale = require('react-redux-i18n').I18n

export default class LayoutStep3 extends Component {
    validate = (evt) => {
        var theEvent = evt || window.event;

        // Handle paste
        if (theEvent.type === 'paste') {
            key = event.clipboardData.getData('text/plain');
        } else {
            // Handle key press
            var key = theEvent.keyCode || theEvent.which;
            key = String.fromCharCode(key);
        }
        var regex = /[0-9]|\./;
        if (regex.test(key)) {
            theEvent.returnValue = false;
            if (theEvent.preventDefault) theEvent.preventDefault();
        }
    }
    render() {
        const {
            currencyShow,
            validated_3,
            registerParams,
            countryShow,
            cpt,
            checkPM,
            validated_pmt_3,
            handleSetChecked,
            languagesShow,
            dayShow,
            monthShow,
            yearShow,
            securityQuestionShow,
            regionShow,
            handleSubmitStep3,
            nextStep,
            handleChange,
            _promotionsRender,
            cptCode,
            openPopup,
            isVerifyLoading,
            goToLogin,
        } = this.props
        let isInput = 'disabled'
        // registerParams.dateOfBirthY = 1990
        if (!isEmpty(registerParams.address1)
            && !isEmpty(registerParams.postalCode)
            && !isEmpty(registerParams.city)
            && registerParams.acceptTC) {
            const checked = !isUndefined(checkPM.checked) ? checkPM.checked : false
            if (cpt || checked || (cptCode && !isEmpty(registerParams.bonusCode))) {
                isInput = ''
            }
        }

        return (
            <>
                {
                    isVerifyLoading ?
                        <div className='isVerifyLoading'>
                            <div className="loading-2"></div>
                            <h1 className="register-title my-2 w-100 loading-text">
                                { !window.location.href.includes('v.com') &&
                                 locale.t('registration')
                                }
                                <span className="dot-one"> .</span>
                                <span className="dot-two"> .</span>
                                <span className="dot-three"> .</span>
                            </h1>
                        </div>
                        :
                        <Row className="body step-body-2">
                            <Row className="mx-1 title-block w-100">
                                {/* <Col md={12}>
                                    <p>{locale.t('formRegisterTextTitle1')}</p>
                                </Col> */}
                                <Col md={5} className="d-none">
                                    <h3>{locale.t('textRegisterPromotion')}</h3>
                                </Col>
                            </Row>
                            <Form noValidate validated={validated_3} className="w-100" onSubmit={(e) => handleSubmitStep3(e)}>
                                <Col md={12} className="text-content">
                                    <Form.Group className="floating-label-wrap">
                                        <Form.Control className="input-form-n1" required type="text" id="la-address1" placeholder={locale.t('address')} name="address1" value={registerParams.address1} onChange={(e) => handleChange(e)} />
                                        {/*<Form.Label htmlFor="la-address1">{locale.t('address')}</Form.Label>*/}
                                    </Form.Group>
                                    <Form.Row>
                                        <Form.Group as={Col} md={6} className="floating-label-wrap">
                                            <Form.Control className="input-form-n1" required type="text" id="la-city" placeholder={locale.t('city')} name="city" onKeyPress={(event) => this.validate(event)} value={registerParams.city} onChange={(e) => handleChange(e)} />
                                            {/*<Form.Label htmlFor="la-city">{locale.t('city')}</Form.Label>*/}
                                        </Form.Group>
                                        <Form.Group as={Col} md={6} className="floating-label-wrap">
                                            <Form.Control className="input-form-n1" required type="text" id="la-postalCode" placeholder={locale.t('postcode')} name="postalCode" value={registerParams.postalCode} onChange={(e) => handleChange(e)} />
                                            {/*<Form.Label htmlFor="la-postalCode">{locale.t('postcode')}</Form.Label>*/}
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Group className="floating-label-wrap selectdiv">
                                        <Form.Control className="input-form-n1" required id="la-country" placeholder={locale.t('country')} name="country" componentclassname="select" value={registerParams.country} onChange={(e) => handleChange(e)} as="select">
                                            {countryShow}
                                        </Form.Control>
                                        {/*<Form.Label htmlFor="la-country">{locale.t('country')}</Form.Label>*/}
                                    </Form.Group>
                                    <Form.Row>
                                        <Form.Group as={Col} md={6} className="floating-label-wrap">
                                            <div className="selectdiv">
                                                <Form.Control className="input-form-n1" required id="la-language" placeholder={locale.t('language')} name="language" value={registerParams.language} onChange={(e) => handleChange(e)} componentclassname="select" as="select">
                                                    {languagesShow}
                                                </Form.Control>
                                                {/*<Form.Label htmlFor="la-language">{locale.t('language')}</Form.Label>*/}
                                            </div>
                                        </Form.Group>
                                        <Form.Group as={Col} md={6} className="floating-label-wrap">
                                            <div className="selectdiv">
                                                <Form.Control className="input-form-n1" required id="la-currency" as="select" placeholder={locale.t('currency')} name="currency" onChange={(e) => handleChange(e)} componentclassname="select" value={registerParams.currency} >
                                                    {currencyShow}
                                                </Form.Control>
                                            </div>
                                           {/*<Form.Label htmlFor="la-currency">{locale.t('currency')}</Form.Label>*/}
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group className="conditions" as={Col} md={12}>
                                            <Form.Check name="acceptMarketing" type="checkbox" />
                                            <div className="conditions">
                                                <p className="mx-2 my-0">
                                                    {locale.t('formRegisterTextAcceptMarketing')}
                                                    <a href={`/thirdparty`} onClick={(e) => openPopup(e, 'thirdparty')} target="_blank" className="text-lowercase px-2">{`(${locale.t('buttonReadMore')})`}</a>
                                                </p>
                                            </div>
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group className="conditions" as={Col} md={12}>
                                            <Form.Check required name="acceptTC" checked={registerParams.acceptTC} value={registerParams.acceptTC} onChange={(e) => handleChange(e)} type="checkbox" />
                                            <div className="conditions">
                                                <p className="mx-2 my-0">
                                                    {locale.t('over-18')}
                                                    <a href={`/terms-conditions`} onClick={(e) => openPopup(e, 'general-2')} className="px-2" target="_blank">{locale.t('formRegisterTextTC')}</a>
                                                    {locale.t('and')}
                                                    <a href={`/privacy-policy`} onClick={(e) => openPopup(e, 'privacy-policy-2')} className="px-2" target="_blank">{locale.t('formRegisterTextPP')}</a>
                                                </p>
                                            </div>
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row className="d-md-flex">
                                        <Button className={"w-100 btn-next buttonSubmitWhite d-flex justify-content-center"} type="submit">
                                            <p className="">{locale.t('register')}</p>
                                        </Button>
                                    </Form.Row>

                                    <Form.Group className="d-md-flex already-account">
                                        <Col xs={12} className="text-center">
                                        {!window.location.href.includes('v.com') &&
                                            <div>
                                                <span>{locale.t('have-account')} </span>
                                                <a href="#" onClick={() => goToLogin()}>{locale.t('login')}</a>
                                            </div>
                                        }
                                        </Col>
                                    </Form.Group>
                                </Col>
                                <Col md={5} className={`d-none text-content ${validated_pmt_3}`}>
                                    <Form.Group>
                                        <Row className="align-items-center h-100 cpt">
                                            <Form.Check checked={cpt} onChange={(evt) => handleSetChecked(evt)} name="cpt" className="promotions" type="checkbox" />
                                            <p className="mx-2 my-0">{locale.t('formRegisterTextConPromotion')}</p>
                                        </Row>
                                    </Form.Group>
                                    {_promotionsRender}
                                    <Form.Group>
                                        <Row className="align-items-center h-100 cpt">
                                            <Form.Check checked={cptCode} onChange={(evt) => handleSetChecked(evt)} name="cptCode" className="promotions" type="checkbox" />
                                            <p className="mx-2 my-0 text-bonus-code">{locale.t('formRegisterTextBonusCode')}</p>
                                            {
                                                cptCode &&
                                                <div className="floating-label-wrap">
                                                    <Form.Control required type="text" id="la-bonusCode" name="bonusCode" value={registerParams.bonusCode} onChange={(e) => handleChange(e)} />
                                                    <Form.Label htmlFor="la-bonusCode" >{locale.t('bonusCode')}</Form.Label>
                                                </div>
                                            }
                                        </Row>
                                    </Form.Group>
                                    <Form.Row className="d-flex d-md-none">
                                        <Form.Group className="conditions" as={Col} md={6} xs={12}>
                                            <Button className="w-100 btn-next btn-1 d-flex justify-content-center " type="button" onClick={() => nextStep(1)}>
                                                <LazyLoadImage src='/static/images/RegisterPage_Arrow-Left.png' alt="Arrow Left" className="img-fluid" />
                                                <p className="pl-2 text-uppercase m-0">{locale.t('back')}</p>
                                            </Button>
                                        </Form.Group>
                                        <Form.Group className="conditions" as={Col} md={6} xs={12}>
                                            <Button className="w-100 btn-next btn-1 d-flex justify-content-center" type="submit">
                                                <p className="pl-2 text-uppercase m-0">{locale.t('finish')}</p>
                                            </Button>
                                        </Form.Group>
                                    </Form.Row>
                                </Col>
                            </Form>
                        </Row>
                }

            </>
        )
    }
}