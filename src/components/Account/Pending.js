import React, { Component } from 'react'
import { connect } from 'react-redux'
import { MESSAGEMODAL } from "../../constants/types"
import WithdrawService from '../../services/em/withdraw'
import moment from 'moment'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Table from 'react-bootstrap/Table'
import LoadBlock from '../Loading/LoadBlock'
import isUndefined from 'lodash/isUndefined'
import '../../../styles/components/_pending.scss'
const locale = require('react-redux-i18n').I18n

export class Pending extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dataPending: [],
            step: props.step,
            transactionHold:[]
        }
    }
    componentDidMount() {
        this.loadBlock.isOpen(true)
        this.getPendingWithdrawals()
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.step !== this.props.step) {
            this.loadBlock.isOpen(true)
            this.getPendingWithdrawals()
        }
    }
    getPendingWithdrawals = () => {
        WithdrawService.getPendingWithdrawals().then((res) => {
            if (this.loadBlock) this.loadBlock.isOpen(false)
            if (res) {
                this.setState({ dataPending: res})
            }
        }).catch((err) => {
            const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
            if (this.loadBlock) this.loadBlock.isOpen(false)
            this.props.onSetMessageModal(set)
        })
    }
    rollBack = (id) => {
        this.loadBlock.isOpen(true)
        const parameters = { id }
        WithdrawService.withdrawRollback(parameters).then((res) => {
            this.getPendingWithdrawals()
        }).catch((err) => {
            const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
            if (this.loadBlock) this.loadBlock.isOpen(false)
            this.props.onSetMessageModal(set)
        })
    }
    _renderTable = () => {
        const { dataPending, transactionHold } = this.state
        let item = []

        if (!isUndefined(dataPending) && dataPending.length > 0) {

            dataPending.map((res, index) => {
                let showBtn = transactionHold.includes(res.transactionID.toString());
                if (res.credit.name == 'CoinsPaid' || res.credit.name == 'CryptoPay') {
                    item.push(
                        <tr key={index}>
                            <td>{res.transactionID}</td>
                            <td>{moment(res.time).format('YYYY-MM-DD HH:mm')}</td>
                            <td>{res.debit.name}</td>
                            <td>Crypto</td>
                            <td>{`${res.debit.currency} ${res.debit.amount}`}</td>
                            <td>
                                {!showBtn &&
                                    <Button className="btn-1 w-100" type="button" disabled={res.isRollbackAllowed ? false : true} onClick={() => this.rollBack(res.id, res.transactionID)}>
                                        <p className="pl-2 text-uppercase m-0 pr-2">{locale.t('rollback')}</p>
                                    </Button>
                                }
                            </td>
                        </tr>
                    )
                }
                else {
                    item.push(
                        <tr key={index}>
                            <td>{res.transactionID}</td>
                            <td>{moment(res.time).format('YYYY-MM-DD HH:mm')}</td>
                            <td>{res.debit.name}</td>
                            <td>{res.credit.name}</td>
                            <td>{`${res.debit.currency} ${res.debit.amount}`}</td>
                            <td>
                                {!showBtn &&
                                    <Button className="btn-1 w-100" type="button" disabled={res.isRollbackAllowed ? false : true} onClick={() => this.rollBack(res.id, res.transactionID)}>
                                        <p className="pl-2 text-uppercase m-0 pr-2">{locale.t('rollback')}</p>
                                    </Button>
                                }
                            </td>
                        </tr>
                    )
                }
            })
        }
        return item
    }
    render() {
        return (
            <Row className="pending">
                <Col md={12} xs={12} className="mb-2">
                    <h5>{locale.t('pendingWithdrawals')}</h5>
                </Col>
                <Col md={12} xs={12} className="mb-2">
                    <div className="table-responsive">
                        <Table className="pending-table">
                            <thead>
                                <tr>
                                    <th>{locale.t('txID')}</th>
                                    <th>{locale.t('time')}</th>
                                    <th>{locale.t('withdrawFrom')}</th>
                                    <th>{locale.t('withdrawTo')}</th>
                                    <th>{locale.t('currencyAmount')}</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {this._renderTable()}
                            </tbody>
                        </Table>
                    </div>
                    <LoadBlock ref={ref => this.loadBlock = ref} />
                </Col>
            </Row>
        )
    }
}
const mapStateToProps = (state) => ({})
const mapDispatchToProps = (dispatch) => ({
    onSetMessageModal: (active) => dispatch({ type: MESSAGEMODAL, active })
})
export default connect(mapStateToProps, mapDispatchToProps)(Pending)