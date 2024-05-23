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

export class UserTC extends Component {
    state = {
        isShow: false,
        isLoading: false,
        acceptTC: false
    }
    isOpen = () => {
        const { isLogin } = this.props.session

        if(!isLogin){
            this.setState({
                isShow: true
            })
        }
    }
    isClose = () => {
        this.setState({
            isShow: false,
            isLoading: false
        })
    }

    userTCSubmit=(event)=>{
        let form = event.target
        this.setState({isLoading: true})
        if(form['acceptTC'].checked){
            UserService.acceptTC().then(()=>{
                this.isClose()
            }).catch((err) => {
                this.setState({
                    isLoading: false
                }, () => {
                    const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
                    this.props.onSetMessageModal(set)
                })
            })
        }
        event.preventDefault();
    }

    _render = () => {
        const { isLoading } = this.state
        return (
            <Row className="justify-content-center mb-3 mt-3">
                <Col md={10} xs={10} className="text-center">
                    <h1>{locale.t('welcomeWebsite', { text: window.location.hostname })}</h1>
                </Col>
                <Col md={10} xs={10} className="text-center">
                    <p>{locale.t('tcText')}</p>
                </Col>
                <Col md={10} xs={10}>
                    <Form onSubmit={(event) => this.userTCSubmit(event)}>
                        <Form.Group className="d-flex">
                        <Form.Check required name="acceptTC"  type="checkbox" />
                            <p className="mx-2 my-0">{locale.t('formRegisterTextTC')}</p>
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
        )
    }

    render() {
        const { isShow } = this.state
        return (
            <Modal centered show={isShow} onHide={() => this.isClose()} className="login" >
                <Modal.Body>
                    <Container>
                        {this._render()}
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

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(UserTC)