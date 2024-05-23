
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import Collapse from 'react-bootstrap/Collapse';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';
import {
    TOTALBALNCEACTIVE,
    MESSAGEMODAL,
} from "../../constants/types";
import isUndefined from 'lodash/isUndefined';
import WithdrawService from '../../services/em/withdraw';
const locale = require('react-redux-i18n').I18n
const config = require(`../../../config`).config;


class ProfileMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataPending: null,
        }
    }


    render() {
        const { openCollapse, session: { userInfo, wallets }, handleClose, logout} = this.props;
    
        return (
            <Modal show={openCollapse} className="all-popup-detail menus-totalBalance-modal" onHide={() => handleClose(!openCollapse)} >
                <div className='ProfileCollapse container-fluid'>
                    <h1 className='Title'>{locale.t('profile')}</h1>
                    <div className='ProfileName'>
                        <img className='IconAvatar' src="/static/images/Circle-icons-profile.svg.png" />
                        <div className='Fullname'>
                            {`${userInfo.firstname} ${userInfo.surname}`}
                        </div>
                    </div>
                    <div className='UserVerification'>
                        <span className={userInfo.isEmailVerified ? 'Verified' : 'UnVerified'}>{locale.t('accountIsVerify')}</span>
                    </div>
                    <a className='btn buttonRegister my-3 text-uppercase' href='/account/my-profile'>{locale.t('goTomyProfile')}</a>
                    <button className='btn buttonLogout mb-3 text-uppercase'onClick={() => logout()} >{locale.t('logout')}</button>
                </div>
            </Modal>
        )
    }
}

const mapStateToProps = (state) => ({
    isConnected: state.EM.isConnected,
    session: state.sessionState,
    modals: state.modalsState,
});
const mapDispatchToProps = (dispatch) => ({
    onSetMessageModal: (active) => dispatch({ type: MESSAGEMODAL, active })
})
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ProfileMenu);