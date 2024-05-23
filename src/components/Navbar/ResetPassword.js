import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import UserService from '../../services/em/user'
import {
    MESSAGEMODAL
} from "../../constants/types";
import '../../../styles/components/_login.scss'

const locale = require('react-redux-i18n').I18n

export class ResetPassword extends Component {
    state = {
        isShow: false,
        isLoading: false,
        key: '',
        validated: false
    }
    isOpen = (key) => {
        this.setState({
            isShow: true,
            key
        })
    }
    isClose = () => {
        this.setState({
            isShow: false
        })
    }

    resetPasswordSubmit = (event) => {
        let form = event.target
        let e = form.elements
        const { key } = this.state
        this.setState({
            isLoading: true
        })
        if (form.checkValidity() === false) {
            this.setState({
                isLoading: false,
                validated: true
            })
            event.preventDefault();
            event.stopPropagation();
        } else {
            const isResetPwdParams = {
                key,
                password: e['txtPassword'].value
            }
            UserService.resetPwd(isResetPwdParams).then((res) => {
                this.setState({
                    isLoading: false,
                    isShow:false,
                    key:''
                })
                const set = { messageTitle: locale.t('success'), messageDesc: window.location.hostname, messageDetail: locale.t('textNewPasswordTrue'), messageType: 'success' }
                this.props.onSetMessageModal(set)
                setTimeout(()=>{
                    window.location.href = '/'
                },2000)
            }).catch((err) => {
                const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
                this.props.onSetMessageModal(set)
            })
            event.preventDefault();
            event.stopPropagation();
        }

    }

    render() {
        const { isShow, isLoading, validated } = this.state
        return (
            <Modal centered show={isShow} onHide={() => this.isClose()} className="login" >
                <Modal.Body>
                    <Container>
                        <Row className="justify-content-end mt-3 mb-3">
                            <Col md={2} xs={2} className="text-center">
                                <a className="close" onClick={() => this.isClose()}>
                                    <i className="jb-icon registerpage-x" />
                                </a>
                            </Col>
                        </Row>
                        <Row className="justify-content-center mb-3">
                            <Col md={10} xs={10} className="text-center">
                                <h1>{locale.t('resetPassword')}</h1>
                            </Col>
                            <Col md={10} xs={10} className="text-center">
                                <h4>{locale.t('textNewPassword')}</h4>
                            </Col>
                            <Col md={10} xs={10}>
                                <Form noValidate validated={validated} onSubmit={(event) => this.resetPasswordSubmit(event)}>
                                    <Form.Group >
                                        <Form.Control className="text-center" type="text" name="txtPassword" placeholder={locale.t('textResetPassword')} required />
                                    </Form.Group>
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

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(ResetPassword)