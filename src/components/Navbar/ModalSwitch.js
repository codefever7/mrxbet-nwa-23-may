
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

import isNull from 'lodash/isNull'
import isEmpty from 'lodash/isEmpty'
import isUndefined from 'lodash/isUndefined'
import includes from 'lodash/includes'
import moment from 'moment';
const fetch = require('isomorphic-unfetch')
const config = require(`../../../config`).config;

const locale = require('react-redux-i18n').I18n

class ModalSwitch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showMessage: false
        }
    }
    componentDidMount() {
        // let dateShowPopupSwitch =  localStorage.getItem(`DateShowPopupSwitchTheme`);
        // if (isNull(dateShowPopupSwitch) || isEmpty(dateShowPopupSwitch) || isUndefined(dateShowPopupSwitch)) {
        //     this.doShowPopupAndSaveLocalStorage();
        // }else {
        //     let hours = moment().diff(moment(dateShowPopupSwitch), 'hours');
        //     if(hours >= 24){
        //         this.doShowPopupAndSaveLocalStorage();
        //     }
        // }
        const pathname = window.location.pathname
        if(pathname == '/'){
            let popupSwitch = localStorage.getItem(`is-popup-switch`);
            if (isNull(popupSwitch) || isEmpty(popupSwitch) || isUndefined(popupSwitch)) {
                localStorage.setItem(`is-popup-switch`, moment().unix());
                //this.isOpen();
            } else {
                let now = moment().format('DD/MM/YYYY');
                let popupSwitchDate = moment.unix(popupSwitch).format('DD/MM/YYYY');
                if (now !== popupSwitchDate) {
                    localStorage.setItem(`is-popup-switch`, moment().unix());
                    //this.isOpen();
                } else {
                    this.isClose();
                }
            }
        }
        
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
        // if (nextProps.modals.messageModal !== this.props.modals.messageModal) {
        //     if (nextProps.modals.messageModal) {
        //         const { isClose } = nextProps.modals.messageModal;

        //         if (isUndefined(isClose) || !isClose) {
        //             this.isOpen()
        //         } else {
        //             this.isClose()
        //         }

        //     }
        // }
    }
    isClose = () => {
        this.setState({
            showMessage: false
        })
    }
    isOpen = () => {
        this.setState({
            //showMessage: true
            showMessage: false
        })
    }
    doShowPopupAndSaveLocalStorage = () => {
        this.isOpen();
        localStorage.setItem(`DateShowPopupSwitchTheme`, Date.now());
    }

    clickSwitch = async () => {
        try {
            // const res = await fetch(`${config.api.API_ENDPOINT}en/update_action_click`)
            // this.isClose()

            // if(window.location.href.includes('v.com') || window.location.href.includes('2024.com'))
            //     window.location.href = 'https://mrxclassicv.com'
            // else
            //     window.location.href = 'https://mrxbet8.com'
        } catch (error) {
            console.log('error', error)
        }
    }

    countAndRedirect= async () =>{
        try {
            // const res = await fetch(`${config.api.API_ENDPOINT}en/update_action_click`)
            // if(window.location.href.includes('v.com'))
            //     window.location.href = 'https://mrxclassicv.com'
            // else
            //     window.location.href = 'https://mrxclassic.com'
        } catch (error) {
            console.log('error', error)
        }
    }

    render() {
        const { showMessage } = this.state

        return (
            <Modal size="lg" centered show={showMessage} onHide={() => this.isClose()} className="switch-popup-detail" >
                <Modal.Body>
                    <Container className="message-popup">
                        <Row className={`message-title`}>
                            <Col className="text-center">
                                <p className="p-md-5">{locale.t('modalSwitchText')}</p>
                            </Col>
                        </Row>

                        <Col className="text-center">
                            <button type="button" className="btn btn-success" onClick={() => this.isClose()} >
                                {locale.t('okSwith')}
                            </button>
                        </Col>
                    </Container>
                </Modal.Body>
            </Modal>
        )
    }
}
const mapStateToProps = (state) => ({
    modals: state.modalsState
});




export default connect(mapStateToProps, null, null, { forwardRef: true })(ModalSwitch);
