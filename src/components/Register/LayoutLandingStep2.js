import React, { Component } from 'react'

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import isEmpty from 'lodash/isEmpty'
import isUndefined from 'lodash/isUndefined'
import { LazyLoadImage } from 'react-lazy-load-image-component';

const locale = require('react-redux-i18n').I18n

export default class LayoutLandingStep2 extends Component {
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
            handleSubmitStep2,
            nextStep,
            handleChange,
            _promotionsRender,
            cptCode,
            openPopup
        } = this.props
        let isInput = 'disabled'
        // registerParams.dateOfBirthY = 1990
        if (!isEmpty(registerParams.firstname)
            && !isEmpty(registerParams.surname)
            && !isEmpty(registerParams.address1)
            && !isEmpty(registerParams.postalCode)
            && !isEmpty(registerParams.city)
            && !isEmpty(registerParams.dateOfBirthY)
            && !isEmpty(registerParams.dateOfBirthM)
            && !isEmpty(registerParams.dateOfBirthD)
            && registerParams.acceptTC) {
            // const checked = !isUndefined(checkPM.checked) ? checkPM.checked : false
            // if (cpt || checked || (cptCode && !isEmpty(registerParams.bonusCode))) {
                isInput = ''
            // }
        }
        
        
        return (
            <Row className="body step-body-2">
                <Row className="mx-1 title-block w-100">
                    <Col >
                        <p>{locale.t('formRegisterTextTitle1')}</p>
                    </Col>
                </Row>
                <Form noValidate validated={validated_3} className="w-100" onSubmit={(e) => handleSubmitStep2(e)}>
                    <Col className="text-content">
                        <Form.Row>
                            <Form.Group as={Col} md={3} >
                                <div className="floating-label-wrap">
                                    <Form.Control as="select" name="title" id="la-title" value={registerParams.title} onChange={(e) => handleChange(e)}>
                                        <option value="Mr.">{locale.t('mr')}</option>
                                        <option value="Ms.">{locale.t('ms')}</option>
                                        <option value="Mrs.">{locale.t('mrs')}</option>
                                        <option value="Miss">{locale.t('miss')}</option>
                                    </Form.Control>
                                    <Form.Label htmlFor="la-title">{locale.t('title')}</Form.Label>
                                </div>
                            </Form.Group>
                            <Form.Group as={Col} md={9} >
                                <Form.Row>
                                    <Form.Group as={Col} md={6} className="m-0 mb-xs-2 floating-label-wrap">
                                        <Form.Control required type="text" id="la-firstname" name="firstname" value={registerParams.firstname} onChange={(e) => handleChange(e)} />
                                        <Form.Label htmlFor="la-firstname">{locale.t('firstName')}</Form.Label>
                                    </Form.Group>
                                    <Form.Group as={Col} md={6} className="m-0 floating-label-wrap">
                                        <Form.Control required type="text" id="la-surname" name="surname" value={registerParams.surname} onChange={(e) => handleChange(e)} />
                                        <Form.Label htmlFor="la-surname">{locale.t('lastName')}</Form.Label>
                                    </Form.Group>
                                </Form.Row>
                            </Form.Group>
                        </Form.Row>
                        <Form.Group className="floating-label-wrap">
                            <Form.Control required type="text" id="la-address1" name="address1" value={registerParams.address1} onChange={(e) => handleChange(e)} />
                            <Form.Label htmlFor="la-address1">{locale.t('address')}</Form.Label>
                        </Form.Group>
                        <Form.Row>
                            <Form.Group as={Col} md={6} className="floating-label-wrap">
                                <Form.Control required type="text" id="la-city" name="city" value={registerParams.city} onChange={(e) => handleChange(e)} />
                                <Form.Label htmlFor="la-city">{locale.t('city')}</Form.Label>
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="floating-label-wrap">
                                <Form.Control required type="text" id="la-postalCode" name="postalCode" value={registerParams.postalCode} onChange={(e) => handleChange(e)} />
                                <Form.Label htmlFor="la-postalCode">{locale.t('postcode')}</Form.Label>
                            </Form.Group>
                        </Form.Row>
                        <Form.Group className="floating-label-wrap">
                            <Form.Control required id="la-country" name="country" componentclass="select" value={registerParams.country} onChange={(e) => handleChange(e)} as="select">
                                {countryShow}
                            </Form.Control>
                            <Form.Label htmlFor="la-country">{locale.t('country')}</Form.Label>
                        </Form.Group>

                        <Form.Row>
                            <Form.Group as={Col} md={6}  >
                                <Row className="birth-date ">
                                    <Col md={12} className="p-0">
                                        <p className="m-0">{locale.t('dateOfBirth')}</p>
                                    </Col>
                                    <Col className="p-0 mr-2">
                                        <Form.Control className="p-0" required name="dateOfBirthD" value={registerParams.dateOfBirthD} onChange={(e) => handleChange(e)} componentclass="select" as="select">
                                            <option value="">{locale.t('dateD')}</option>
                                            {dayShow}
                                        </Form.Control>
                                    </Col>

                                    <Col className="p-0 mr-2">
                                        <Form.Control className="p-0" required name="dateOfBirthM" value={registerParams.dateOfBirthM} onChange={(e) => handleChange(e)} componentclass="select" as="select">
                                            <option value="">{locale.t('dateM')}</option>
                                            {monthShow}
                                        </Form.Control>
                                    </Col>
                                    <Col className="p-0 mr-1">
                                        <Form.Control className="p-0" required name="dateOfBirthY" value={registerParams.dateOfBirthY} onChange={(e) => handleChange(e)} componentclass="select" as="select">
                                            <option value="">{locale.t('dateY')}</option>
                                            {yearShow}
                                        </Form.Control>
                                    </Col>
                                </Row>
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="floating-label-wrap">
                                <Form.Control required id="la-language" name="language" value={registerParams.language} onChange={(e) => handleChange(e)} componentclass="select" as="select">
                                    {languagesShow}
                                </Form.Control>
                                <Form.Label htmlFor="la-language">{locale.t('language')}</Form.Label>
                            </Form.Group>
                        </Form.Row>
                        {/* <Form.Row>
                            <Form.Group as={Col} md={6}  className="floating-label-wrap">
                                <Form.Control required id="la-securityQuestion" name="securityQuestion" value={registerParams.securityQuestionShow} onChange={(e) => handleChange(e)} componentclass="select" as="select">
                                    {securityQuestionShow}
                                </Form.Control>
                                <Form.Label htmlFor="la-securityQuestion">{locale.t('securityQuestion')}</Form.Label>
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="floating-label-wrap">
                                <Form.Control required type="text" id="la-securityAnswer" name="securityAnswer" value={registerParams.securityAnswer} onChange={(e) => handleChange(e)} />
                                <Form.Label htmlFor="la-securityAnswer">{locale.t('securityAnswer')}</Form.Label>
                            </Form.Group>
                        </Form.Row> */}
                        <Form.Group className="floating-label-wrap">
                            <Form.Control required id="la-currency" as="select" name="currency" onChange={(e) => handleChange(e)} componentclass="select" value={registerParams.currency} >
                                {currencyShow}
                            </Form.Control>
                            <Form.Label htmlFor="la-currency">{locale.t('currency')}</Form.Label>
                        </Form.Group>

                        {/*<Form.Row>
                            <Form.Group className="conditions" as={Col} md={12}>
                                <Form.Check required name="acceptTC" checked={registerParams.acceptTC} value={registerParams.acceptTC} onChange={(e) => handleChange(e)} type="checkbox" />
                                <div className="conditions">
                                    <p className="mx-2 my-0">
                                        {locale.t('formRegisterTextAcceptTC')}
                                        <a href={`/terms-conditions`} onClick={(e) => openPopup(e, 'general')} className="px-2" target="_blank">{locale.t('formRegisterTextTC')}</a>
                                        {locale.t('and')}
                                        <a href={`/privacy-policy`} onClick={(e) => openPopup(e, 'privacy-policy')} className="px-2" target="_blank">{locale.t('formRegisterTextPP')}</a>
                                    </p>
                               
                                </div>
                            </Form.Group>
                        </Form.Row>*/}
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
                        <Form.Row className="m-0">
                        <Form.Row>
                            <Form.Group className="conditions" as={Col} md={12}>
                                <Form.Check required name="acceptTC" checked={registerParams.acceptTC} value={registerParams.acceptTC} onChange={(e) => handleChange(e)} type="checkbox" />
                                <div className="conditions">
                                    <p className="mx-2 my-0">
                                        {locale.t('over-18')}
                                        <a href={`/terms-conditions`} onClick={(e) => openPopup(e, 'general')} className="px-2" target="_blank">{locale.t('formRegisterTextTC')}</a>
                                        {locale.t('and')}
                                        <a href={`/privacy-policy`} onClick={(e) => openPopup(e, 'privacy-policy')} className="px-2" target="_blank">{locale.t('formRegisterTextPP')}</a>
                                    </p>
                               
                                </div>
                            </Form.Group>
                        </Form.Row>
                    </Form.Row>
                        <Form.Row>
                            <Form.Group className="conditions" as={Col} md={6} xs={6}>
                                <Button className="w-100 btn-next btn-1 d-flex justify-content-center " type="button" onClick={() => nextStep(1)}>
                                    <p className="pl-2 text-uppercase m-0">{locale.t('back')}</p>
                                </Button>
                            </Form.Group>
                            <Form.Group className="conditions" as={Col} md={6} xs={6}>
                                <Button className={`w-100 btn-next btn-3 d-flex justify-content-center ${isInput}`} disabled={isInput !== '' ? true:false}  type="submit">
                                    <p className="text-uppercase m-0 pr-2">{locale.t('formRegisterButtomNextStep')}</p>
                                </Button>
                            </Form.Group>
                        </Form.Row>
                    </Col>


                </Form>
            </Row>
        )
    }
}