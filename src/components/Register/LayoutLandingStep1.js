import React, { Component } from 'react'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import isEmpty from 'lodash/isEmpty'
import isUndefined from 'lodash/isUndefined'
import { LazyLoadImage } from 'react-lazy-load-image-component';

const locale = require('react-redux-i18n').I18n
export default class LayoutLandingStep1 extends Component {
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
        if (!regex.test(key)) {
            theEvent.returnValue = false;
            if (theEvent.preventDefault) theEvent.preventDefault();
        }
    }
    render() {
        const {
            registerParams,
            cpt,
            handleSetChecked,
            validated_pmt_1,
            _promotionsRender,
            mobilePrefixShow,
            checkPM,
            errEmail,
            errPassword,
            errCPassword,
            validated_1,
            handleSubmitStep1,
            handleBlur,
            handleChange,
            cptCode
        } = this.props
        let isInput = 'disabled'
        if (!isEmpty(registerParams.email)
            && !isEmpty(registerParams.password)
            && !isEmpty(registerParams.mobile)
            && !isUndefined(registerParams.confirmPassword)
            && !isEmpty(registerParams.confirmPassword)) {
            // const checked = !isUndefined(checkPM.checked) ? checkPM.checked : false
            // if (cpt || checked || (cptCode && !isEmpty(registerParams.bonusCode))) {
            isInput = ''
            // }
        }
        return (
            <Row className="body step-body-1">
                <Row className="mx-1 title-block w-100">
                    <Col>
                        <h3>{/*locale.t('formRegisterTitle')*/}</h3>
                    </Col>
                </Row>
                <Form noValidate validated={validated_1} className="w-100" onSubmit={(e) => handleSubmitStep1(e)}>

                    <Col className="text-content">
                        <Form.Group >
                            <p>{locale.t('formRegisterTextTitle1')}</p>
                        </Form.Group>
                        <Form.Group className={`${errEmail.class}`} >
                            <div className="floating-label-wrap">
                                <Form.Control required type="email" id="la-email" name="email" value={registerParams.email} onChange={(e) => handleChange(e)} onBlur={(e) => handleBlur(e)} />
                                <Form.Label htmlFor="la-email" className={!isEmpty(registerParams.email) ? 'ac' : ''}>{locale.t('emailAddress')}</Form.Label>
                            </div>
                            <Form.Control.Feedback type="invalid">{errEmail.message}</Form.Control.Feedback>
                            <Form.Text className="text-white">
                                {locale.t('formRegisterTextEmail')}
                            </Form.Text>
                        </Form.Group>
                        <Form.Group className={errPassword.class}>
                            <div className="floating-label-wrap">
                                <Form.Control required type="password" id="la-password" name="password" onBlur={(e) => handleBlur(e)} onChange={(e) => handleChange(e)} />
                                <Form.Label htmlFor="la-password">{locale.t('password')}</Form.Label>
                            </div>
                            <Form.Control.Feedback type="invalid">{errPassword.message}</Form.Control.Feedback>
                            <Form.Text className="text-white">
                                {locale.t('formRegisterTextPassword')}
                            </Form.Text>
                        </Form.Group>
                        <Form.Group className={errCPassword.class}>
                            <div className="floating-label-wrap">
                                <Form.Control required type="password" id="la-confirmPassword" name="confirmPassword" onBlur={(e) => handleBlur(e)} onChange={(e) => handleChange(e)} />
                                <Form.Label htmlFor="la-confirmPassword">{locale.t('confirmPassword')}</Form.Label>
                            </div>
                            <Form.Control.Feedback type="invalid">{errCPassword.message}</Form.Control.Feedback>
                            <Form.Text className="text-white">
                                {locale.t('formRegisterTextConfirmPassword')}
                            </Form.Text>
                        </Form.Group>
                        <Form.Row>
                            <Form.Group as={Col} lg={3} className="dropdownPrefix" >
                                <div id="select-box">
                                    <input type="checkbox" id="options-view-button" className="dropdown-prefixmobile" />
                                    <div id="select-button" className="brd">
                                        <div id="selected-value" className="dropdown-prefixvalue">
                                            <img class="imgCircle" src={`/static/images/country/${registerParams.country}.jpg`} /> {registerParams.mobilePrefix}
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
                                    <Form.Control type="hidden" required name="mobilePrefix" id="mobilePrefix" className="mobilePrefix-value" value={registerParams.mobilePrefix} />
                                    {/* <Form.Control required name="mobilePrefix" as="select" id="la-mobilePrefix" componentclass="select" value={registerParams.mobilePrefix} onChange={(e) => handleChange(e)} >
                                        {mobilePrefixShow}
                                    </Form.Control>
                                    <Form.Label htmlFor="la-mobilePrefix">{locale.t('mobilePrefix')}</Form.Label> */}
                                </div>
                            </Form.Group>
                            <Form.Group as={Col} lg={9} >
                                <div className="floating-label-wrap">
                                    <Form.Control required type="text" minLength={6} onKeyPress={(event) => this.validate(event)} id="la-mobileNumber" name="mobile" value={registerParams.mobile} onChange={(e) => handleChange(e)} />
                                    <Form.Label htmlFor="la-mobileNumber" className={!isEmpty(registerParams.mobile) ? 'ac' : 'inv'}>{locale.t('mobileNumber')}</Form.Label>
                                </div>
                            </Form.Group>
                        </Form.Row>

                        <Form.Group>
                            <Button className={`w-100 btn-5 d-flex justify-content-center ${isInput}`} disabled={isInput !== '' ? true : false} type="submit">
                                <p className="pl-2 m-0 pr-2">{locale.t('formRegisterButtomNextStep')}</p>
                            </Button>
                        </Form.Group>
                    </Col>
                </Form>
            </Row>
        )
    }
}