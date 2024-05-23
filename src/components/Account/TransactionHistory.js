
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import UserService from '../../services/em/user'
import Moment from 'react-moment'
import moment from 'moment'
import DatePicker from "react-datepicker"
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Container from 'react-bootstrap/Container'
import Table from 'react-bootstrap/Table'
import LoadBlock from '../Loading/LoadBlock'
import isUndefined from 'lodash/isUndefined'
import "../../../styles/datepicker/datepicker.scss"
const locale = require('react-redux-i18n').I18n

class TransactionHistory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            transactions: [],
            params: {
                type: "Deposit",
                startTime: moment.utc(new Date()).subtract(7, "days").startOf('day').toISOString(),
                endTime: moment.utc(new Date()).endOf('day').toISOString(),
                pageIndex: 1,
                pageSize: 10
            },
            type: "Deposit",
            startDate: moment(new Date()).subtract(7, "days").toDate(),
            endDate: moment(new Date()).toDate(),
        }
    }
    componentDidMount() {
        this.fetchTransactionHistory(this.state.params)
    }
    fetchTransactionHistory = (params) => {
        this.loadBlock.isOpen(true)
        UserService.getTransactionHistory(params).then(
            (res) => {
                if (this.loadBlock) this.loadBlock.isOpen(false)
                this.setState({ transactions: res })
            },
            (err) => {
                if (this.loadBlock) this.loadBlock.isOpen(false)
            }
        )
    }
    handleSubmit = (event) => {
        const { startDate, endDate } = this.state;
        const e = event.target
        let params = {
            "type": this.state.params.type,
            "startTime": moment.utc(startDate).startOf('day').toISOString(),
            "endTime": moment.utc(endDate).endOf('day').toISOString(),
            "pageIndex": 1,
            "pageSize": 10
        }
        this.setState({ transactions: [] })
        this.fetchTransactionHistory(params)
        event.preventDefault();
        event.stopPropagation();
    }
    handleChange = (event) => {
        let { params, startDate, endDate } = this.state;
        const e = event.target
        params.startTime = moment.utc(startDate).startOf('day').toISOString();
        params.endTime = moment.utc(endDate).endOf('day').toISOString();
        if (e.name === 'page') {
            params.pageIndex = e.value
            this.fetchTransactionHistory(params);
        } else if (e.name === 'type') {
            this.setState({ transactions: [] })
            params.type = e.value
            this.fetchTransactionHistory(params);
        }
    }
    _renderPage = () => {
        const { transactions } = this.state
        let page = []

        for (let i = 1; i <= transactions.totalPageCount; i++) {
            page.push(<option key={i} value={i}>{i}</option>)
        }

        return (
            <Row className="pull-right">
                <Col md={12} xs={12} >
                    <Form.Group>
                        <Form.Control as="select" name="page" onChange={(e) => this.handleChange(e)}>
                            {page}
                        </Form.Control>
                    </Form.Group>
                </Col>
            </Row>
        )
    }
    _renderTable = () => {
        const { transactions, params } = this.state
        const item = transactions.transactions.map((item, key) => {
            if (params.type == 'Gambling') {
                return (
                    <Fragment key={key}>
                        <tr key={key}>
                            <td className="detail">{item.transactionID}</td>
                            <td className="detail"><Moment format="DD-MM-YYYY HH:mm" >{new Date(item.time + 'Z')}</Moment></td>
                            <td className="detail">{item.description}</td>
                            {
                                !isUndefined(item.debit)
                                    ?
                                    <td className="detail">{item.debit.currency} {item.debit.amount}</td>
                                    :
                                    <td className="detail">{item.credit.currency} {item.credit.amount}</td>
                            }
                            {
                                !isUndefined(item.debit)
                                    ?
                                    <td className="detail">{locale.t('lose')}</td>
                                    :
                                    <td className="detail">{locale.t('win')}</td>
                            }
                        </tr>
                        <LoadBlock ref={ref => this.loadBlock = ref} />
                    </Fragment>
                )
            } else {
                return (
                    <Fragment key={key}>
                        <tr key={key}>
                            <td>{item.transactionID}</td>
                            <td><Moment format="DD-MM-YYYY HH:mm" >{new Date(item.time + 'Z')}</Moment></td>
                            <td>{params.type}</td>
                            <td>{item.debit.currency} {item.debit.amount}</td>
                            <td>{params.type == 'Deposit' ? 'Success' : item.status}</td>
                        </tr>
                        <LoadBlock ref={ref => this.loadBlock = ref} />
                    </Fragment>
                )
            }
        })

        return item
    }
    render() {
        const { transactions, params } = this.state

        return (
            <Container >
                <div className="transaction-history">
                    <Form noValidate onSubmit={(e) => this.handleSubmit(e)}>
                        <Row className="pb-5">
                            <Col md={12} xs={12}>
                                <p className="m-0 title-menu">{locale.t('transactionHistory')}</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={3} xs={12}>
                                <Form.Group className="selectdiv">
                                    <Form.Control as="select" componentclass="select" name="type" className="select-1" defaultValue={params.type} onChange={(e) => this.handleChange(e)}>
                                        <option value="Deposit">{locale.t('deposit')}</option>
                                        <option value="Withdraw">{locale.t('withdraw')}</option>
                                        <option value="Gambling">{locale.t('gambling')}</option>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col md={3} xs={12}>
                                <DatePicker
                                    className="form-control w-100"
                                    name="startDate"
                                    dateFormat="yyyy-MM-dd"
                                    selected={this.state.startDate}
                                    onChange={date => this.setState({ startDate: date })} />
                            </Col>
                            <Col md={3} xs={12}>
                                <Form.Group>
                                    <DatePicker
                                        className="form-control"
                                        name="endDate"
                                        dateFormat="yyyy-MM-dd"
                                        selected={this.state.endDate}
                                        onChange={date => this.setState({ endDate: date })} />
                                </Form.Group>
                            </Col>
                            <Col md={3} xs={12}>
                                <Button className="btn-4 btn-block" type="submit">
                                    <p className="pl-2 text-uppercase m-0 pr-2">{locale.t('filter')}</p>
                                </Button>
                            </Col>
                            <Col md={12} xs={12}>
                                <div className="table-responsive">
                                    <Table className="table-bordered fixed_header">
                                        <thead className="fixedHeader">
                                            <tr>
                                                <th>{locale.t('transactionID')}</th>
                                                <th>{locale.t('date')}</th>
                                                <th>{params.type == 'Gambling' ? locale.t('description') : locale.t('type')}</th>
                                                <th>{locale.t('amount')}</th>
                                                <th>{locale.t('status')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                Object.keys(transactions).length > 0 ?
                                                    transactions.totalRecordCount > 0 ?
                                                        this._renderTable() :
                                                        <tr>
                                                            <td colSpan="5" className="text-center">
                                                                {/* {locale.t('noResult')} */}
                                                                <LoadBlock ref={ref => this.loadBlock = ref} />
                                                            </td>
                                                        </tr>
                                                    :
                                                    <tr>
                                                        <td colSpan="5" className="text-center">
                                                            {/* {locale.t('noResult')} */}
                                                            <LoadBlock ref={ref => this.loadBlock = ref} />
                                                        </td>
                                                    </tr>
                                            }
                                        </tbody>
                                    </Table>
                                </div>
                            </Col>
                        </Row>
                        {
                            Object.keys(transactions).length > 0 &&
                            transactions.totalRecordCount > 0 &&
                            this._renderPage()
                        }
                    </Form>
                </div>
            </Container>
        )
    }
}
export default connect(null, null)(TransactionHistory);