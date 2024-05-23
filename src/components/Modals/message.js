
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import Alert from 'react-bootstrap/Alert';

import {
    getQueryString
} from '../../../utils'

import {
    MESSAGEMODAL,
    LOGINMODAL,
    FORGOTPASSWORDMODAL
} from "../../constants/types";

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container'
import { SetInnerHtml } from '../set-inner-html';
import ResponsibleIcon from '../../../static/svg-js/responsible';

import isNull from 'lodash/isNull'
import isEmpty from 'lodash/isEmpty'
import isUndefined from 'lodash/isUndefined'
import includes from 'lodash/includes'

const locale = require('react-redux-i18n').I18n
class Message extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showMessage: false,
            messageTitle: '',
            messageDesc: '',
            messageType: '',
            messageDetail: '',
            messageLink: null,
            buttonConfirm: {
                status: false,
                onConfirm: null
            }
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.modals.messageModal !== this.props.modals.messageModal) {
            if (nextProps.modals.messageModal) {
                const { messageTitle, messageDesc, messageDetail, messageType, isClose } = nextProps.modals.messageModal
                let { buttonConfirm } = nextProps.modals.messageModal

                if (isUndefined(isClose) || !isClose) {
                    this.isOpen(messageTitle, messageDesc, messageDetail, messageType, buttonConfirm)
                } else {
                    this.isClose()
                }

            }
        }
    }
    isClose = () => {
        if (!isNull(getQueryString('key')) && !isEmpty(getQueryString('key')) && isEmpty(getQueryString('method'))) {
            this.props.onSetLoginModal(true)
        }
        if (this.state.messageTitle === locale.t('logout')) {
            this.setState({
                showMessage: false,
                messageTitle: '',
                messageDesc: '',
                messageType: '',
                messageDetail: '',
                messageLink: null
            }, () => {
                this.props.onSetMessageModal(false)
                window.location.href = '/'
            })
        } else {
            this.setState({
                showMessage: false,
                messageTitle: '',
                messageDesc: '',
                messageType: '',
                messageDetail: '',
                messageLink: null
            }, () => this.props.onSetMessageModal(false))
        }
    }
    isOpen = (messageTitle, messageDesc, messageDetail, messageType, buttonConfirm) => {

        if (isUndefined(buttonConfirm) || !buttonConfirm.status) {
            buttonConfirm = {
                status: false,
                onConfirm: null
            }
        }

        if (messageTitle === 'failedLogin') {
            const linkLayout = <a className="text-blue" href="" onClick={(event) => { this.props.onSetForgotpasswordModal(true); event.preventDefault(); event.stopPropagation(); }}>{` ${locale.t('errorTextLoginFailedLink')}`}</a>
            this.setState({
                showMessage: true,
                messageTitle: locale.t('errorTextLoginFailedTitle'),
                messageDesc: locale.t('errorTextLoginFailedUP'),
                messageType,
                messageDetail,
                messageLink: linkLayout
            })
        } else {
            if(messageDesc){
                // if(includes(messageDesc, "not logged in")){
                //     this.isClose()
                //     return;
                // }
                this.setState({
                    showMessage: true,
                    messageTitle,
                    messageDesc,
                    messageType,
                    messageDetail,
                    buttonConfirm
                })
            }else{
                this.isClose()
            }
        }

    }

    checkErrorMessage = (err) => {
        if (includes(err, "not registered in our site")) {
            return locale.t('textEmailNotRegister')
        } else if (includes(err, "not logged in")) {
            return locale.t('textNotLoggedIn')
        } else if (includes(err, "email address is not verified")) {
            return locale.t('textEmailNotVerified')
        } else if (includes(err, "You are currently unable to make any deposits as your account is inactive")) {
            return locale.t('textAccountInactiveDeposit')
        } else {
            return err
        }
    }

    render() {
        const { showMessage, messageTitle, messageDesc, messageType, messageDetail, messageLink } = this.state
        let { buttonConfirm } = this.state
        let variant = 'success'
        let iconShow = <img className="icon" src="/static/images/check_mark.svg"alt="check_mark" />
        let renderItemDesc = <div dangerouslySetInnerHTML={{ __html: this.checkErrorMessage(messageDesc) }} />
        if (messageType == 'error') {
            variant = 'danger'
            iconShow = <SetInnerHtml className="icon" TagName="span" innerHtml={ResponsibleIcon} />
        }
        if (!isUndefined(messageDesc) && !isUndefined(messageDesc.isHTML)) {
            if (messageDesc.isHTML) {
                renderItemDesc = <div dangerouslySetInnerHTML={{ __html: this.checkErrorMessage(messageDesc) }} />
            } else {
                renderItemDesc = this.checkErrorMessage(messageDesc.renderItem)
            }
        }
        return (
            <Modal centered show={showMessage} onHide={() => this.isClose()} className="all-popup-detail" >
                <Modal.Body>
                    <Container className="message-popup">
                        <Row className={`message-title ${variant}`}>
                            <Col xs={10}>
                                <p>{messageTitle}</p>
                            </Col>
                            {/* <Col md={2} xs={2} className="text-center">
                                <a className="close" onClick={() => this.isClose()}>
                                    <i className="jb-icon registerpage-x" />
                                </a>
                            </Col> */}
                        </Row>
                        <Col xs={12} className={`content-body ${variant}`}>
                            <div className="group-content">
                                {iconShow}
                                
                                {/* <img className="icon" src="/static/images/account/responsible.svg"alt="responsible-gaming" /> */}
                                <div className="pl-3">
                                    {renderItemDesc}
                                </div>
                            </div>
                            <p className="m-0">
                                {!isNull(messageLink) ? messageLink : null}
                            </p>
                        </Col>

                        {buttonConfirm.status ?
                            (
                                <Col className="text-center">
                                    <button type="button" className="btn btn-success mx-2"
                                        onClick={buttonConfirm.onConfirm}
                                    >
                                        {locale.t('yes')}
                                    </button>
                                    <button type="button" className="btn btn-clear mx-2" onClick={() => this.isClose()}>
                                        {locale.t('cancel')}
                                    </button>
                                </Col>
                            )
                            : (
                                <Col className="text-center pt-3">
                                    <button type="button" className="btn btn-n1" onClick={() => this.isClose()}>
                                        {locale.t('done')}
                                    </button>
                                </Col>
                            )
                        }

                    </Container>
                </Modal.Body>
            </Modal>

        )
    }
}
const mapStateToProps = (state) => ({
    modals: state.modalsState
});

const mapDispatchToProps = (dispatch) => ({
    onSetMessageModal: (active) => dispatch({ type: MESSAGEMODAL, active }),
    onSetLoginModal: (active) => dispatch({ type: LOGINMODAL, active }),
    onSetForgotpasswordModal: (active) => dispatch({ type: FORGOTPASSWORDMODAL, active })
})


export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(Message);
