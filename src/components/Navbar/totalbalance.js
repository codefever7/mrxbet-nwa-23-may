
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import Collapse from 'react-bootstrap/Collapse';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';
import {
    TOTALBALNCEACTIVE,
    MESSAGEMODAL,
} from "../../constants/types";
import {
    getSymbol,
    convertComma,
    isSportPage
} from '../../../utils';
import isUndefined from 'lodash/isUndefined';
import WithdrawService from '../../services/em/withdraw';
const locale = require('react-redux-i18n').I18n
const config = require(`../../../config`).config;


class Totalbalance extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataPending: null,
        }
    }

    componentDidMount() {
        this.getPendingWithdrawals()
    }

    getPendingWithdrawals = () => {
        WithdrawService.getPendingWithdrawals().then((res) => {
            if (res) {
                this.setState({ dataPending: res})
            }
        }).catch((err) => {
            //const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
            //this.props.onSetMessageModal(set)
        })
    }

    render() {
        const { dataPending } = this.state;
        const { openCollapse, session: { userInfo, wallets }, handleClose, useragent } = this.props;
        
        const currencyWallets = !isUndefined(wallets.realMoneyCurrency) ? wallets.realMoneyCurrency : 'e'
        const currencyBonusWallets = !isUndefined(wallets.bonusMoneyCurrency) ? wallets.bonusMoneyCurrency : 'e'
        const totalWallets = !isUndefined(wallets.realMoney) ? wallets.realMoney : 0
        const totalBonusWallets = !isUndefined(wallets.bonusMoney) ? wallets.bonusMoney : 0
        const classModal = isSportPage(`all-popup-detail menus-totalBalance-modal`, useragent);
        const total = totalWallets + totalBonusWallets;

        return (
            <Modal show={openCollapse} className={classModal}  onHide={() => handleClose(!openCollapse)} >
                <div className='TotalBalanceCollapse  container-fluid'>
                    <h1 className='Title'>{locale.t('cashier')}</h1>
                    <div className='Balance'>
                        <div className='Total'>
                            <small>{locale.t('balance')}</small>
                            <span className='Money'>{`${total.toFixed(2)}${getSymbol(currencyWallets)}`}</span>
                        </div>
                        <div className='Bonus'>
                            <small>{locale.t('bonusBalance')}</small>
                            <span className='Money'>{`${totalBonusWallets.toFixed(2)}${getSymbol(currencyBonusWallets)}`}</span>
                        </div>
                        <div className='RealMoney'>
                            <small>{locale.t('realBalance')}</small>
                            <span className='Money'>{`${totalWallets.toFixed(2)}${getSymbol(currencyWallets)}`}</span>
                        </div>
                    </div>
                {/*dataPending !== null && dataPending.length > 0 &&(<div className='UserVerification'>
                    <span className={'UnVerified'}>{locale.t('youHavePending', { count: dataPending.length })}</span>
        </div>)*/}
                    <div className='LinkWithdraw'>
                        <div className='withdraw'>
                            <a className='btn buttonRegister my-3 text-uppercase' href='/account/withdraw'>{locale.t('withdraw')}</a>
                        </div>
                        <div className='deposit'>
                            <a className='btn buttonLogin my-3 text-uppercase' href='/account/deposit'>{locale.t('deposit')}</a>
                        </div>
                    </div>
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
)(Totalbalance);