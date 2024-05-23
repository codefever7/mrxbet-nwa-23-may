import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import * as userParams from '../../constants/userParams'
import UserService from '../../services/em/user'
import {
    MESSAGEMODAL
} from "../../constants/types";
import '../../../styles/components/_login.scss'
import {
    setCookie,
    countriesBlockLogin
} from '../../../utils'
import forEach from 'lodash/forEach'
import isUndefined from 'lodash/isUndefined'
import WPService from '../../../services'
const locale = require('react-redux-i18n').I18n

export class UserConsent extends Component {
    state = {
        isShow: false,
        isLoading: false,
        step: 1,
        dataUserConsents: [],
        typeVerified: false
    }
    isOpen = (typeShow) => {
        const { isLogin } = this.props.session
        if (typeShow && !isLogin) {
            this.setState({
                isShow: true,
                typeVerified: true
            })
        } else {
            UserService.getConsentRequirements({ action: 2 }).then((res) => {
                if (res) {
                    this.setState({ dataUserConsents: res, isLoading: false, step: 2, isShow: true, typeVerified: false })
                }
            }).catch((err) => {
                if (isLogin) {
                    setCookie('isLogin', false, 375)
                    this.setState({ isLoading: false, step: 3, isShow: true }, () => {
                        setTimeout(() => {
                            setTimeout(() => {
                                window.location.href = '/'
                            }, 1000)
                            // UserService.logout()
                        }, 2000)
                    })
                }
            })
        }

    }
    isClose = () => {
        this.setState({
            isShow: false,
            typeVerified: false
        }, () => this.props.isLoading(false))
    }
    loginSubmitVerified = (event) => {
        if(WPService.countriesBlockLogin(this.props.session.currentCountry)){
            const set = { messageTitle: locale.t('error'), messageDesc: locale.t('msgBlock'), messageDetail: "", messageType: 'error' }
            this.setState({ isLoading: false }, () => this.props.onSetMessageModal(set))
            event.preventDefault();
            return false;
        }
        let form = event.target
        userParams.loginParams.password = form.elements.password.value;
        userParams.loginParams.usernameOrEmail = form.elements.usernameOrEmail.value;
        this.setState({
            isLoading: true
        })
        if (form.checkValidity() === false) {
            this.setState({ isLoading: false })
            event.preventDefault();
            event.stopPropagation();
        } else {
            UserService.login(userParams.loginParams).then((result) => {
                UserService.getConsentRequirements({ action: 2 }).then((res) => {
                    if (res) {
                        this.setState({ dataUserConsents: res, isLoading: false, step: 2 })
                    }
                }).catch((err) => {
                    window.location.href = '/'
                })
            }).catch((err) => {
                this.setState({
                    isLoading: false
                }, () => {
                    const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
                    this.props.onSetMessageModal(set)
                })
            })
            event.preventDefault();
            event.stopPropagation();
        }
    }
    userConsentsSubmit = (event) => {
        let form = event.target
        let e = form.elements
        const { dataUserConsents } = this.state
        let userConsent = {}
        this.setState({
            isLoading: true
        })
        forEach(dataUserConsents, (o) => {
            userConsent[`${o.code}`] = e[`accept-${o.code}`].checked
        })
        UserService.setUserConsents({ userConsents: userConsent }).then(() => {
            setCookie('isLogin', false, 375)
            this.setState({ isLoading: false, step: 3, isShow: true }, () => {
                setTimeout(() => {
                    setTimeout(() => {
                        window.location.href = '/'
                    }, 1000)
                    // UserService.logout()
                }, 2000)
            })
        })
        event.preventDefault();
        event.stopPropagation();
    }
    _renderPageStep1 = () => {
        const { isLoading } = this.state
        return (
            <Row className="justify-content-center mb-3 mt-3">
                <Col md={10} xs={10} className="text-center">
                    <h1>{locale.t('welcomeWebsite', { text: window.location.hostname })}</h1>
                </Col>
                <Col md={10} xs={10} className="text-center">
                    <p>{locale.t('login')} {'Verified'}</p>
                </Col>
                <Col md={10} xs={10}>
                    <Form onSubmit={(event) => this.loginSubmitVerified(event)}>
                        <Form.Group >
                            <Form.Control className="text-center" type="text" name="usernameOrEmail" placeholder={locale.t('yourUserName')} required />
                        </Form.Group>
                        <Form.Group >
                            <Form.Control className="text-center" type="password" name="password" placeholder={locale.t('yourPassword')} required />
                        </Form.Group>
                        <Form.Group >
                            <Button className="btn-login w-100" type="submit">
                                {
                                    isLoading ?
                                        <div className="loading-2" /> : <p className="text-uppercase m-0">{locale.t('login')}</p>

                                }

                            </Button>
                        </Form.Group>
                    </Form>
                </Col>
            </Row>
        )
    }
    _renderPageStep2 = () => {
        const { isLoading, dataUserConsents } = this.state
        let item = []
        if (!isUndefined(dataUserConsents)) {
            dataUserConsents.map((res, index) => {
                item.push(
                    <Form.Group key={index} className="d-flex">
                        {
                            !isUndefined(res.mustAccept) && res.mustAccept ?
                                <Form.Check value={res.code} checked={true} name={`accept-${res.code}`} type="checkbox" />
                                :
                                <Form.Check value={res.code} name={`accept-${res.code}`} type="checkbox" />
                        }
                        <p className="mx-2 my-0" dangerouslySetInnerHTML={{ __html: res.title }} />
                    </Form.Group>
                )
            })
        }
        return (
            <Row className="justify-content-center mb-3 mb-3 mt-3">
                <Col md={10} xs={10} className="text-center">
                    <h1>{locale.t('welcomeWebsite', { text: window.location.hostname })}</h1>
                </Col>
                <Col md={10} xs={10} className="text-center">
                    <h4>{locale.t('textUserConsents')}</h4>
                </Col>
                <Col md={10} xs={10}>
                    <Form onSubmit={(event) => this.userConsentsSubmit(event)}>
                        {item}
                        <Form.Group >
                            <Button className="btn-login w-100" type="submit">
                                {
                                    isLoading ?
                                        <div className="loading-2" /> : <p className="text-uppercase m-0">{locale.t('submit')}</p>

                                }
                            </Button>
                        </Form.Group>
                    </Form>
                </Col>
            </Row>
        )
    }
    _renderPageStep3 = () => {
        const { typeVerified } = this.state
        return (
            <Row className="justify-content-center mb-3 mb-3 mt-3">
                <Col md={10} xs={10} className="text-center">
                    <h1>{locale.t('welcomeWebsite', { text: window.location.hostname })}</h1>
                </Col>
                <Col md={10} xs={10} className="text-center">
                    {
                        typeVerified ?
                            <h4 className="">{locale.t('login')} {locale.t('verified')}</h4>
                            :
                            <h4>{locale.t('textUserConsents')}</h4>
                    }
                </Col>
                <Col md={10} xs={10}>
                    {/* <h6 className="text-center">{locale.t('textFormUserConsent')}</h6> */}
                </Col>
            </Row>
        )
    }

    render() {
        const { isShow, step } = this.state
        return (
            <Modal centered show={isShow} onHide={() => this.isClose()} className="login" >
                <Modal.Body>
                    <Container>
                        {/* <Row className="justify-content-end mt-3 mb-3">
                            <Col md={2} xs={2} className="text-center">
                                <a className="close" onClick={() => this.isClose()}>
                                    <i className="jb-icon registerpage-x" />
                                </a>
                            </Col>
                        </Row> */}
                        {step === 1 && this._renderPageStep1()}
                        {step === 2 && this._renderPageStep2()}
                        {step === 3 && this._renderPageStep3()}
                    </Container>
                </Modal.Body>
            </Modal>
        )
    }

}

const mapStateToProps = (state) => ({
    modals: state.modalsState
})

const mapDispatchToProps = (dispatch) => ({
    onSetMessageModal: (active) => dispatch({ type: MESSAGEMODAL, active })
})

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(UserConsent)