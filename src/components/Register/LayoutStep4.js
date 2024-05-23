import React, { Component } from 'react'

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import { LazyLoadImage } from 'react-lazy-load-image-component';

const locale = require('react-redux-i18n').I18n

export default class LayoutStep4 extends Component {

    render() {
        const {
            verifyStatus,
            isVerifyLoading,
            verify,
            registerParams,
            finishStep,
            nextStep
        } = this.props
        const img = verifyStatus ? '/static/images/Verify-2.png' : '/static/images/Verify-1.png'
        return (
            <Row className="body step-body-3 justify-content-center">
                <Col md={10} xs={12} className="text-center mb-2">
                    <LazyLoadImage src={img} alt="Verify" className="img-fluid mb-2" width="60px" />
                    <h2 className="font-weight-bold pb-2">{verifyStatus ? locale.t('validationCode') : locale.t('validationTextCode')}</h2>
                    <p>{locale.t('validationText1', { mail: registerParams.email })}</p>
                    {/* <p>{registerParams.email}</p> */}
                </Col>
                <Col md={10} xs={12} className="text-center">
                    <h2 className="font-weight-bold pb-2">{verifyStatus ? locale.t('textRegister1') : <div className="loading-2" />}</h2>
                </Col>

                <Col md={10} xs={12} className="text-center text-content">
                    <p className="detail">{locale.t('validationText3')}</p>
                </Col>
                <Col md={10} xs={12} className="mt-5 mb-5">
                    <Row className="justify-content-center">
                        <Col md={6} xs={12}>
                            <Button className="w-100 btn-next btn-1 d-flex justify-content-center" type="button" onClick={() => finishStep()}>
                                <p className="pl-2 text-uppercase m-0">{locale.t('finish')}</p>
                            </Button>
                        </Col>
                        {/* <Col xs={6}>
                            <Button className="w-100 btn-3 btn-back d-flex justify-content-center" type="button" onClick={() => verify()}>
                                {isVerifyLoading ? <div className="loading-2" /> : <p className="pl-2 text-uppercase m-0">{locale.t('verify')}</p>}
                            </Button>
                        </Col> */}
                    </Row>
                </Col>
            </Row>
        )
    }
}