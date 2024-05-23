import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ReCAPTCHA from 'react-google-recaptcha'
import UserService from '../../services/em/user'
import {
    LOGINMODAL,
    MESSAGEMODAL,
    FORGOTPASSWORDMODAL
} from "../../constants/types";
import { getLogoHeder, isSportPage } from '../../../utils';
import '../../../styles/components/_login.scss'
import isEmpty from 'lodash/isEmpty';
import CasinoNWA from '../../services/em/casinoNWA';

const config = require(`../../../config`).config;
const locale = require('react-redux-i18n').I18n

export class Login extends Component {
    state = {
        isLogin: false,
        isSendResetPwd: false,
        captchaPublicKey: config.captchaPublicKey,
        captchaResponse: '',
        validated: false,
        isLoading: false
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.modals.loginModal !== this.props.modals.loginModal) {
            if (nextProps.modals.loginModal) {
                this.isOpen()
            }

        } else if (nextProps.modals.forgotPasswordModal !== this.props.modals.forgotPasswordModal) {
            if (nextProps.modals.forgotPasswordModal) {
                this.isOpenForgot()
            }
        }
    }
    isOpenForgot = () => {
        this.setState({
            isLogin: true,
            isSendResetPwd: true
        })
    }
    isOpen = () => {
        this.setState({
            isLogin: true,
            isSendResetPwd: false
        })
    }
    isClose = () => {
        this.setState({
            isLogin: false,
            isSendResetPwd: false
        }, () => {
            this.props.onSetLoginModal(false)
            this.props.onSetForgotpasswordModal(false)
        })
    }
    resetPwdSubmit = (event) => {
        let form = event.target
        let em = form.elements
        this.setState({ isLoading: true })
        if (form.checkValidity() === false || isEmpty(this.captcha.getValue())) {
            this.setState({ validated: true, isLoading: false })
            event.preventDefault();
            event.stopPropagation();
        } else {
            const { captchaPublicKey, captchaResponse } = this.state
            const parameters = {
                email: em['email'].value,
                changePwdURL: encodeURIComponent(window.location.origin + window.location.pathname + window.location.hash + '?method=register&key='),
                captchaPublicKey: captchaPublicKey,
                captchaChallenge: '',
                captchaResponse: captchaResponse
            }
            CasinoNWA.resetPassword(parameters.email, parameters.changePwdURL, parameters.captchaResponse).then(() => {
                this.setState({ isLoading: false })
                const set = { messageTitle: locale.t('success'), messageDesc: em['email'].value, messageDetail: '', messageType: 'success' }
                this.props.onSetMessageModal(set)
            }).catch((err) => {
                this.setState({ isLoading: false })
                const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
                this.props.onSetMessageModal(set)
            })
            event.preventDefault();
            event.stopPropagation();
        }
    }

    _renderPageResetPwd = () => {
        const { captchaPublicKey, validated, isLoading } = this.state
        return (
            <Row className="justify-content-center mb-3 mt-2">
                {/*<Col md={10} xs={10} className="text-center">
                    <h1>{locale.t('welcomeWebsite', { text: locale.t('mrXBet') })}</h1>
                </Col>
                <Col md={10} xs={10}>
                    <h4 class="titleRegister">{locale.t('forgotPassword')}</h4>
                </Col>*/}
                <Col xs={11}>
                    <Form noValidate validated={validated} onSubmit={(event) => this.resetPwdSubmit(event)}>
                        <Form.Group >
                            <Form.Control className="" type="email" name="email" placeholder={locale.t('emailAddress')} required />
                        </Form.Group>
                        <Form.Group >
                            <ReCAPTCHA
                                ref={(el) => { this.captcha = el; }}
                                sitekey={captchaPublicKey}
                                hl={this.props.languagesActive}
                                name='reCaptcha'
                                onChange={(res) => this.setState({ captchaResponse: res })}
                            />
                        </Form.Group>
                        <Form.Group >
                            <Button className="buttonSubmitWhite d-flex justify-content-center w-100" type="submit">
                                {
                                    isLoading ?
                                        <div className="loading-2" /> : <p className="m-0">{locale.t('sent')}</p>
                                }
                            </Button>
                        </Form.Group>
                    </Form>
                </Col>
                <Col xs={11}>
                    <Button className="buttonBackResetPass w-100" type="button" onClick={() => this.setState({ isSendResetPwd: false })} >
                        <p className="m-0">{locale.t('back')}</p>
                    </Button>
                </Col>
            </Row>
        )
    }

    _renderPageLogin = () => {
        const { loginSubmit, register, isLoading } = this.props
        const { captchaPublicKey, captchaResponse } = this.state
        return (
            <Fragment>
                <Row className="justify-content-center mb-3 mt-2">
                    {/* Hide: Logo on popup login
                    <Col md={8} xs={8} className="text-center logo">
                        <img src={getLogoHeder()} />
                    </Col>*/}
                    <Col xs={11}>
                        <Form onSubmit={(event) => loginSubmit(event)} autoComplete="on">
                            {/*<Form.Group>
                                <h4 class="titleRegister">{locale.t('login')}</h4>
                            </Form.Group>
                            <Form.Group>
                            </Form.Group>*/}
                            <Form.Group >
                                {/*<Form.Label>{locale.t('user')}</Form.Label>*/}
                                <Form.Control type="text" placeholder={locale.t('user')} name="usernameOrEmail" aria-label="usernameOrEmail" required autoComplete="username" />
                            </Form.Group>
                            <Form.Group >
                                {/*<Form.Label>{locale.t('password')}</Form.Label>*/}
                                <Form.Control type="password"  placeholder={locale.t('password')} name="password" aria-label="password" required autoComplete="current-password" />
                            </Form.Group>
                            <Form.Group className="m-0">
                                <div className='d-flex mb-2 justify-content-end'>
                                    {/*<span>{locale.t('forgotPassword')}</span>*/}
                                    <a className='ml-2' onClick={() => this.setState({ isSendResetPwd: true })}>
                                        {locale.t('forgotPassword')}
                                    </a>
                                </div>
                            </Form.Group>
                            <Form.Group >
                                {/*<ReCAPTCHA
                                    ref={(el) => { this.captcha = el; }}
                                    sitekey={captchaPublicKey}
                                    hl={this.props.languagesActive}
                                    name='reCaptcha'
                                    onChange={(res) => this.setState({ captchaResponse: res })}
                                />*/}
                            </Form.Group>
                            <Form.Group >
                                <Button className="button mt-5 buttonLoginPopup w-100" type="submit">
                                    {
                                        isLoading ?
                                            <div className="loading-2" /> : <p className="my-1">{locale.t('login')}</p>
                                    }
                                </Button>
                            </Form.Group>
                        </Form>
                    </Col>
                    <Col md={8} xs={10} className="mt-3 text-center">
                    {/* !window.location.href.includes('v.com') &&
                        <Button className="button buttonRegister w-100" type="button" onClick={() => register()} >
                            <p className="text-uppercase my-1">{locale.t('register-with-newaccount')}</p>
                        </Button>
                    */}
                    { !window.location.href.includes('v.com') &&
                        <div>
                            <span>{locale.t('no-account')} </span>
                            <a href="#" onClick={() => register()}>{locale.t('register')}</a>
                        </div>
                    }
                    </Col>
                    {/* Hide: term & policy
                    <Col md={8} xs={8} className="mt-3 text-center">
                        <div className='terms'>
                            {locale.t('over-18')}
                            <div>
                                <a href={`/terms-conditions-2`} className="px-2" target="_blank">{locale.t('formRegisterTextTC')}</a>
                                {locale.t('and')}
                                <a href={`/terms-conditions-2/privacy-policy-2`} className="px-2" target="_blank">{locale.t('formRegisterTextPP')}</a>
                            </div>
                        </div>
                    </Col>*/}
                </Row>
            </Fragment>
        )
    }
    render() {
        const { isLogin, isSendResetPwd } = this.state
        const { useragent } = this.props;
        let classModal = isSportPage(`login loginModal`, useragent);

        return (
            // <ModalPopup 
            //     isOpen={isLogin}
            //     className="login loginModal"
            //     content={isSendResetPwd ? this._renderPageResetPwd() : this._renderPageLogin()}
            // />
            <Modal centered show={isLogin} onHide={() => this.isClose()} className={classModal} >
                <Modal.Body>
                    {/*<Container className="content-step">
                        <Row className="justify-content-end mt-1 mb-0">
                            <Col md={2} xs={3} className="text-center">
                                <a className="close-icon" onClick={() => this.isClose()}>
                                    <i className="jb-icon registerpage-x" />
                                </a>
                            </Col>
                        </Row>
                        {isSendResetPwd ? this._renderPageResetPwd() : this._renderPageLogin()}
                    </Container>*/}

                    <Container className="content-step">
                        <div className="justify-content-end mt-2 mb-0">
                            <Row className="header row-custom" >
                                <Col xs={10}>
                                    {isSendResetPwd ? <h4 class="titleLogin">{locale.t('forgotPassword')}</h4> : <h4 class="titleLogin">{locale.t('login')}</h4>}
                                </Col>
                                <Col xs={1} className="close-icon">
                                    <a onClick={() => this.isClose()}>
                                        <i className="jb-icon registerpage-x" />
                                    </a>
                                </Col>
                            </Row>
                            {isSendResetPwd ? this._renderPageResetPwd() : this._renderPageLogin()}
                        </div>

                    </Container>

                </Modal.Body>
            </Modal>
        )
    }

}

const mapStateToProps = (state) => ({
    modals: state.modalsState,
    languagesActive: state.sessionState.languagesActive,
})

const mapDispatchToProps = (dispatch) => ({
    onSetLoginModal: (active) => dispatch({ type: LOGINMODAL, active }),
    onSetForgotpasswordModal: (active) => dispatch({ type: FORGOTPASSWORDMODAL, active }),
    onSetMessageModal: (active) => dispatch({ type: MESSAGEMODAL, active })
})

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(Login)