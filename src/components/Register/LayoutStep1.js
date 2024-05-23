import React, { Component } from 'react'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import isEmpty from 'lodash/isEmpty'
import isUndefined from 'lodash/isUndefined'
import { LazyLoadImage } from 'react-lazy-load-image-component';

const locale = require('react-redux-i18n').I18n
export default class LayoutStep1 extends Component {
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
            cptCode,
            dayShow,
            monthShow,
            yearShow,
            theme,
            goToLogin,
        } = this.props
        let isInput = 'disabled'
        if (!isEmpty(registerParams.email)
            && !isEmpty(registerParams.password)
            && !isEmpty(registerParams.mobile)
            && !isEmpty(registerParams.firstname)
            && !isEmpty(registerParams.surname)
            && !isEmpty(registerParams.dateOfBirthY)
            && !isEmpty(registerParams.dateOfBirthM)
            && !isEmpty(registerParams.dateOfBirthD)) {
            const checked = !isUndefined(checkPM.checked) ? checkPM.checked : false
            if (cpt || checked || (cptCode && !isEmpty(registerParams.bonusCode))) {
                isInput = ''
            }
        }

        return (
            <Row className={`body step-body-1 ${theme === 'dark' ? 'dark' : 'light'}`}>
                <Row className="mx-1 title-block w-100">
                    <Col md={12}>
                        <h3>{/*locale.t('formRegisterTitle')*/}</h3>
                    </Col>
                    <Col md={5} className="d-none">
                        <h3>{locale.t('textRegisterPromotion')}</h3>
                    </Col>

                </Row>
                <Form noValidate validated={validated_1} className="w-100" onSubmit={(e) => handleSubmitStep1(e)}>

                    <Col md={12} className="text-content">
                        {/* <Form.Group >
                            <p>{locale.t('formRegisterTextTitle1')}</p>
                        </Form.Group> */}
                        <Form.Group className={`${errEmail.class}`} >
                            <div className="floating-label-wrap">
                                <Form.Control className="input-form-n1" required type="email" id="la-email" placeholder={locale.t('emailAddress')} name="email" value={registerParams.email} onChange={(e) => handleChange(e)} onBlur={(e) => handleBlur(e)} />
                                {/*<Form.Label htmlFor="la-email" className={!isEmpty(registerParams.email) ? 'ac' : ''}>{locale.t('emailAddress')}</Form.Label>*/}
                            </div>
                            <Form.Control.Feedback type="invalid">{errEmail.message}</Form.Control.Feedback>
                            {/* <Form.Text>
                                {locale.t('formRegisterTextEmail')}
                            </Form.Text> */}
                        </Form.Group>
                        <Form.Group className={errPassword.class}>
                            <div className="floating-label-wrap">
                                <Form.Control className="input-form-n1" required type="password" id="la-password" placeholder={locale.t('password')} name="password" value={registerParams.password} onBlur={(e) => handleBlur(e)} onChange={(e) => handleChange(e)} />
                                {/*<Form.Label htmlFor="la-password">{locale.t('password')}</Form.Label>*/}
                            </div>
                            <Form.Control.Feedback type="invalid">{errPassword.message}</Form.Control.Feedback>
                            {/* <Form.Text>
                                {locale.t('formRegisterTextPassword')}
                            </Form.Text> */}
                        </Form.Group>
                   
                        <Form.Row>
                            <Form.Group as={Col} xs={3} className="dropdownPrefix" >
                                <div id="select-box">
                                    <input type="checkbox" id="options-view-button" className="dropdown-prefixmobile-popup" />
                                    <div id="select-button" className="brd">
                                        <div id="selected-value" className="dropdown-prefixvalue-popup">
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
                                    <Form.Control type="hidden" required name="mobilePrefix" id="mobilePrefix" className="mobilePrefix-value-popup" value={registerParams.mobilePrefix} />
                                </div>
                            </Form.Group>
                            <Form.Group as={Col} xs={9}>
                                <div className="floating-label-wrap">
                                    <Form.Control className="input-form-n1" required type="text" minLength={6} maxLength={13} onKeyPress={(event) => this.validate(event)} id="la-mobileNumber" placeholder={locale.t('mobileNumber')} name="mobile" value={registerParams.mobile} onChange={(e) => handleChange(e)} />
                                    {/*<Form.Label htmlFor="la-mobileNumber" className={!isEmpty(registerParams.mobile) ? 'ac' : 'inv'}>{locale.t('mobileNumber')}</Form.Label>*/}
                                </div>
                            </Form.Group>
                        </Form.Row>

                        <Form.Row>
                            <Form.Group as={Col} xs={3} >
                                <div className="floating-label-wrap">
                                    <Form.Control className="input-form-n1" as="select" placeholder={locale.t('title')} name="title" id="la-title" value={registerParams.title} onChange={(e) => handleChange(e)}>
                                        <option value="Mr.">{locale.t('mr')}</option>
                                        <option value="Ms.">{locale.t('ms')}</option>
                                        <option value="Mrs.">{locale.t('mrs')}</option>
                                        <option value="Miss">{locale.t('miss')}</option>
                                    </Form.Control>
                                    {/*<Form.Label htmlFor="la-title">{locale.t('title')}</Form.Label>*/}
                                </div>
                            </Form.Group>
                            <Form.Group as={Col} xs={9}>
                                <Form.Row>
                                    <Form.Group as={Col} className="m-0 mb-xs-2 floating-label-wrap">
                                        <Form.Control className="input-form-n1" required type="text" id="la-firstname" placeholder={locale.t('firstName')} name="firstname" value={registerParams.firstname} onChange={(e) => handleChange(e)} />
                                        {/*<Form.Label htmlFor="la-firstname">{locale.t('firstName')}</Form.Label>*/}
                                    </Form.Group>
                                </Form.Row>
                            </Form.Group>
                            <Form.Group as={Col} xs={12}>
                                <Form.Row>
                                    <Form.Group as={Col} className="m-0 floating-label-wrap">
                                        <Form.Control className="input-form-n1" required type="text" id="la-surname" placeholder={locale.t('lastName')} name="surname" value={registerParams.surname} onChange={(e) => handleChange(e)} />
                                        {/*<Form.Label htmlFor="la-surname">{locale.t('lastName')}</Form.Label>*/}
                                    </Form.Group>
                                </Form.Row>
                            </Form.Group>
                        </Form.Row>

                        <Form.Group>
                            <Form.Row>
                                <Form.Group as={Col} xs={4} className="dropdownPrefix  m-0" >
                                    <Form.Control className="input-form-n1" required name="dateOfBirthD" defaultValue={registerParams.dateOfBirthD} componentclass="select" as="select" onChange={(e) => handleChange(e)}>
                                        <option value="">{locale.t('dateD')}</option>
                                        {dayShow}
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group as={Col} xs={4} className="dropdownPrefix m-0" >
                                    <Form.Control className="input-form-n1" required name="dateOfBirthM" defaultValue={registerParams.dateOfBirthM} componentclass="select" as="select" onChange={(e) => handleChange(e)}>
                                        <option value="">{locale.t('dateM')}</option>
                                        {monthShow}
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group as={Col} xs={4} className="dropdownPrefix m-0" >
                                    <Form.Control className="input-form-n1" required name="dateOfBirthY" defaultValue={registerParams.dateOfBirthY} componentclass="select" as="select" onChange={(e) => handleChange(e)}>
                                        <option value="">{locale.t('dateY')}</option>
                                        {yearShow}
                                    </Form.Control>
                                </Form.Group>
                            </Form.Row>
                        </Form.Group>

                        <Form.Group className="d-md-flex">
                            <Button className={`w-100 buttonSubmitWhite d-flex justify-content-center`} type="submit">
                                <p className="">{locale.t('formRegisterButtomNextStep')}</p>
                                {/*<LazyLoadImage src='/static/images/RegisterPage_Arrow-Right.png' alt="Arrow Right" className="img-fluid" />*/}
                            </Button>
                        </Form.Group>

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

                    <Col md={5} className={`d-none text-content ${validated_pmt_1}`}>
                        <Form.Group>
                            <Row className="align-items-center h-100 cpt">
                                <Form.Check checked={cpt} onChange={(evt) => handleSetChecked(evt)} name="cpt" className="promotions" type="checkbox" />
                                <p className="mx-2 my-0">{locale.t('formRegisterTextConPromotion')}</p>
                            </Row>
                        </Form.Group>
                        {_promotionsRender}
                        <Form.Group className="check-promotions">
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
                        <Form.Group className="d-flex d-md-none">
                            <Button className={`w-100 buttonSubmitWhite d-flex justify-content-center`} type="submit">
                                <p className="">{locale.t('formRegisterButtomNextStep')}</p>
                                <LazyLoadImage src='/static/images/RegisterPage_Arrow-Right.png' alt="Arrow Right" className="img-fluid" />
                            </Button>
                        </Form.Group>
                    </Col>
                </Form>
            </Row>
        )
    }
}