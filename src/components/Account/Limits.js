import React, { Component } from 'react'
import { connect } from 'react-redux'
import { MESSAGEMODAL } from "../../constants/types"
import UserService from '../../services/em/user'
import { getSymbol } from '../../../utils'
import moment from 'moment'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Table from 'react-bootstrap/Table'
import forEach from 'lodash/forEach'
import isNull from 'lodash/isNull'
import isUndefined from 'lodash/isUndefined'
import map from 'lodash/map'

const config = require(`../../../config`).config;
const locale = require('react-redux-i18n').I18n

export class Limits extends Component {
    constructor(props) {
        super(props)
        this.state = {
            listLimits: null,
            showLimit: '',
            currencyShow: [],
            validated: '',
            myCurrency: '',
            isMobile: false
        }
    }
    componentDidMount() {
        window.addEventListener("resize", this.resize.bind(this));
        this.resize();
        UserService.getLimits().then((res) => {
            if (res) {
                this.setState({ listLimits: res })
            }
        })

        UserService.getCurrencies().then((result) => {
            let ccy = []
            let session = this.props.session;
            const currencyWallets = !isUndefined(session.wallets.realMoneyCurrency) ? session.wallets.realMoneyCurrency : config.currency

            forEach(result, (res, index) => {
                ccy.push(<option key={`currency-${index}`} value={res.code}>{res.name}</option>)
            })
            this.setState({
                currencyShow: ccy,
                myCurrency: currencyWallets
            })
        })
    }

    resize() {
        let mobile = window.innerWidth < 768;

        if (mobile !== this.state.isMobile) {
            this.setState({
                isMobile: mobile,
            });
        }
    }

    handleSubmitCode = (event) => {
        let form = event.target
        let e = form.elements

        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            event.preventDefault();
        }
    }

    _layoutTd = (data_1, data_2) => {
        return (
            <td className="px-0">
                <tr>
                    <td className="border-0">{data_1}</td>
                </tr>
                <tr>
                    <td >{data_2}</td>
                </tr>
            </td>
        )
    }
    handleSubmit = async (event, key) => {
        let form = event.target
        let e = form.elements
        let data = {}

        data.period = e['depositLimit'].value;
        data.amount = e['amount'].value;
        data.currency = e['currency'].value;

        if (form.checkValidity() === false) {
            this.setState({ validated: 'was-validated' })
        } else {
            if (key === 'wagering') {
                UserService.setWageringLimit(data).then(() => {
                    UserService.getLimits().then((res) => {
                        if (res) {
                            this.setState({ listLimits: res, showLimit: '' })
                        }
                    })
                })
            } else if (key === 'loss') {
                UserService.setLossLimit(data).then(() => {
                    UserService.getLimits().then((res) => {
                        if (res) {
                            this.setState({ listLimits: res, showLimit: '' })
                        }
                    })
                })
            } else {
                UserService.setDepositLimit(data).then(() => {
                    UserService.getLimits().then((res) => {
                        if (res) {
                            this.setState({ listLimits: res, showLimit: '' })
                        }
                    })
                })
            }
        }

        event.preventDefault();
    }
    handleSubmitSession = (event) => {
        let form = event.target
        let e = form.elements

        if (form.checkValidity() === false) {
            this.setState({ validated: 'was-validated' })
        } else {
            UserService.setSessionLimit({ minutes: e['minutes'].value }).then(() => {
                UserService.getLimits().then((res) => {
                    if (res) {
                        this.setState({ listLimits: res, showLimit: '' })
                    }
                })
            })
        }

        event.preventDefault();
        event.stopPropagation();
    }
    handleSubmitStake = (event) => {
        let form = event.target
        let e = form.elements
        let data = {}
        data.amount = e['amount'].value;
        data.currency = e['currency'].value;

        if (form.checkValidity() === false) {
            this.setState({ validated: 'was-validated' })
        } else {
            UserService.setMaxStakeLimit(data).then(() => {
                UserService.getLimits().then((res) => {
                    if (res) {
                        this.setState({ listLimits: res, showLimit: '' })
                    }
                })
            })
        }

        event.preventDefault();
        event.stopPropagation();
    }
    _renderTable = () => {
        const { listLimits, showLimit, currencyShow, validated, myCurrency } = this.state
        let data = []
        let name = [{
            name: locale.t('dailyDepositLimit'),
            key: 'depositPerDay'
        }, {
            name: locale.t('weeklyDepositLimit'),
            key: 'depositPerWeek'
        }, {
            name: locale.t('monthlyDepositLimit'),
            key: 'depositPerMonth'
        }, {
            name: locale.t('lossLimit'),
            key: 'loss'
        }, {
            name: locale.t('wageringLimit'),
            key: 'wagering'
        }, {
            name: locale.t('sessionTimeLimit'),
            key: 'session'
        }, {
            name: locale.t('maxStakeLimit'),
            key: 'stake'
        }, {
            name: locale.t('depositLimit'),
            key: 'deposit'
        }]

        if (!isNull(listLimits)) {
            map(name, (res, index) => {
                let limit = locale.t('noLimit')
                let statusText = locale.t('active')
                let timeText = locale.t('noExpiration')
                let amount = (<td>{limit}</td>)
                let status = (<td>{statusText}</td>)
                let time = (<td>{timeText}</td>)

                if (!isUndefined(listLimits[res.key]) && !isNull(listLimits[res.key])) {
                    let n = listLimits[res.key]

                    if (!isNull(n.current) && isNull(n.queued)) {
                        if (res.key === 'session') {
                            limit = `${n.current.minutes} ${locale.t('minutes')}`
                        } else if (res.key === 'stake') {
                            const expiryDate = moment(n.current.ins).format('YYYY-MM-DD HH:mm')

                            limit = `${n.current.currency} ${n.current.amount}`
                            time = (<td>{`${locale.t('expiryDate')} : ${expiryDate}`}</td>)
                        } else {
                            limit = `${n.current.currency} ${n.current.amount} / ${n.current.period}`
                        }
                        amount = (<td>{limit}</td>)
                    } else if (!isNull(n.current) && !isNull(n.queued)) {
                        const expiryDate = moment(n.current.expiryDate).format('YYYY-MM-DD HH:mm')

                        if (res.key === 'session') {
                            amount = this._layoutTd(`${n.current.minutes} ${locale.t('minutes')}`, `${n.queued.minutes} ${locale.t('minutes')}`)
                        } else if (res.key === 'stake') {
                            amount = this._layoutTd(`${n.current.currency} ${n.current.amount}`, `${n.queued.currency} ${n.queued.amount}`)
                            expiryDate = moment(n.current.ins).format('YYYY-MM-DD HH:mm')
                        } else {
                            amount = this._layoutTd(`${n.current.currency} ${n.current.amount} / ${n.current.period}`, `${n.queued.currency} ${n.queued.amount} / ${n.queued.period}`)
                        }

                        status = this._layoutTd(locale.t('active'), locale.t('queued'))
                        time = this._layoutTd(`${locale.t('expiryDate')} : ${expiryDate}`, `${locale.t('validFrom')} : ${expiryDate}`)
                    }

                    let sh = showLimit === res.key ? true : false

                    data.push(
                        <tr key={index} onClick={() => n.updatable ? (sh ? this.setState({ showLimit: '' }) : this.setState({ showLimit: res.key })) : {}}>
                            <td>{res.name}</td>
                            {amount}
                            {status}
                            {time}
                            <td className="text-center">
                                {
                                    n.updatable ? (
                                        // <Button className="btn-3 w-100" type="button" >
                                        //     <p className="pl-2 text-uppercase m-0 pr-2">{sh ? locale.t('hide') : locale.t('change')}</p>
                                        // </Button>
                                        sh ? <i className="icon-custom jb-icon registerpage-dropdown-2" /> : <i className="icon-custom jb-icon registerpage-dropdown-3" />
                                    )
                                        : null
                                }
                            </td>
                        </tr>
                    )
                    if (sh) {
                        let def_1 = false
                        let def_2 = false
                        let def_3 = false
                        let dis_1 = false
                        let dis_2 = false
                        let dis_3 = false

                        if (res.key === 'depositPerDay') {
                            def_1 = true
                            dis_2 = true
                            dis_3 = true
                        } else if (res.key === 'depositPerWeek') {
                            def_2 = true
                            dis_1 = true
                            dis_3 = true
                        } else if (res.key === 'depositPerMonth') {
                            def_3 = true
                            dis_1 = true
                            dis_2 = true
                        } else {
                            def_1 = true
                        }

                        data.push(
                            <tr key={`sh-${index}`}>
                                <td colSpan="5">
                                    <div>
                                        <p>
                                            {locale.t(`limitsDesc-${res.key}`)}
                                        </p>
                                        {res.key !== 'session' && res.key !== 'stake' &&
                                            <Form noValidate validated={validated} onSubmit={(e) => this.handleSubmit(e, res.key)}>
                                                <div className="d-flex">
                                                    <Form.Group as={Col} md={4} >
                                                        <Form.Label>{locale.t('currency')}</Form.Label>
                                                        <div className="selectdiv">
                                                            <Form.Control required as="select" name="currency" componentclass="select" defaultValue={myCurrency} disabled={true}>
                                                                {currencyShow}
                                                            </Form.Control>
                                                        </div>
                                                    </Form.Group>
                                                    <Form.Group as={Col} md={4} >
                                                        <Form.Label>{locale.t('amount')}</Form.Label>
                                                        <Form.Control required type="number" name="amount" placeholder={locale.t('amount')} />
                                                    </Form.Group>
                                                </div>
                                                <Form.Group as={Col} md={6} >
                                                    <Form.Check className="radio-custom py-2" defaultChecked={def_1} disabled={dis_1} name="depositLimit" label={locale.t('dailyLimit')} type="radio" value="daily" />
                                                    <Form.Check className="radio-custom py-2" defaultChecked={def_2} disabled={dis_2} name="depositLimit" label={locale.t('weeklyLimit')} type="radio" value="weekly" />
                                                    <Form.Check className="radio-custom py-2" defaultChecked={def_3} disabled={dis_3} name="depositLimit" label={locale.t('monthlyLimit')} type="radio" value="monthly" />
                                                </Form.Group>
                                                <Form.Group as={Col} md={6}>
                                                    <Button className="btn-4 w-50" type="submit">
                                                        <p className="pl-2 text-uppercase m-0 pr-2">{locale.t('save')}</p>
                                                    </Button>
                                                </Form.Group>
                                            </Form>
                                        }
                                        {res.key === 'session' && <Form noValidate validated={validated} onSubmit={(e) => this.handleSubmitSession(e)}>
                                            <Form.Group as={Col} md={6} >
                                                <Form.Label>{locale.t('maximumAllowedSessionAliveTime')}</Form.Label>
                                                <Form.Control required type="text" name="minutes" placeholder={locale.t('minutes')} />
                                            </Form.Group>

                                            <Form.Group as={Col} md={6}>
                                                <Button className="btn-4 w-50" type="submit">
                                                    <p className="pl-2 text-uppercase m-0 pr-2">{locale.t('save')}</p>
                                                </Button>
                                            </Form.Group>
                                        </Form>}
                                        {res.key === 'stake' && <Form noValidate validated={validated} onSubmit={(e) => this.handleSubmitStake(e)}>
                                            <Form.Group as={Col} md={6} >
                                                <Form.Label>{locale.t('currency')}</Form.Label>
                                                <Form.Control required as="select" name="currency" componentclass="select" defaultValue={myCurrency} >
                                                    {currencyShow}
                                                </Form.Control>
                                            </Form.Group>
                                            <Form.Group as={Col} md={6} >
                                                <Form.Label>{locale.t('amount')}</Form.Label>
                                                <Form.Control required type="text" name="amount" placeholder={locale.t('amount')} />
                                            </Form.Group>

                                            <Form.Group as={Col} md={6}>
                                                <Button className="btn-4 w-50" type="submit">
                                                    <p className="pl-2 text-uppercase m-0 pr-2">{locale.t('save')}</p>
                                                </Button>
                                            </Form.Group>
                                        </Form>}
                                    </div>
                                </td>
                            </tr>
                        )
                    }
                }
            })
        }
        return data
    }

    _renderTableMobile = () => {
        const { listLimits, showLimit, currencyShow, validated, myCurrency } = this.state
        let data = []
        let name = [{
            name: locale.t('dailyDepositLimit'),
            key: 'depositPerDay'
        }, {
            name: locale.t('weeklyDepositLimit'),
            key: 'depositPerWeek'
        }, {
            name: locale.t('monthlyDepositLimit'),
            key: 'depositPerMonth'
        }, {
            name: locale.t('lossLimit'),
            key: 'loss'
        }, {
            name: locale.t('wageringLimit'),
            key: 'wagering'
        }, {
            name: locale.t('sessionTimeLimit'),
            key: 'session'
        }, {
            name: locale.t('maxStakeLimit'),
            key: 'stake'
        }, {
            name: locale.t('depositLimit'),
            key: 'deposit'
        }]

        if (!isNull(listLimits)) {
            map(name, (res, index) => {
                let limit = locale.t('noLimit')
                let statusText = locale.t('active')
                let timeText = locale.t('noExpiration')
                let amount = (<td>{limit}</td>)
                let status = (<td>{statusText}</td>)
                let time = (<td>{timeText}</td>)

                if (!isUndefined(listLimits[res.key]) && !isNull(listLimits[res.key])) {
                    let n = listLimits[res.key]

                    if (!isNull(n.current) && isNull(n.queued)) {
                        if (res.key === 'session') {
                            limit = `${n.current.minutes} ${locale.t('minutes')}`
                        } else if (res.key === 'stake') {
                            const expiryDate = moment(n.current.ins).format('YYYY-MM-DD HH:mm')

                            limit = `${n.current.currency} ${n.current.amount}`
                            time = (<td>{`${locale.t('expiryDate')} : ${expiryDate}`}</td>)
                        } else {
                            limit = `${n.current.currency} ${n.current.amount} / ${n.current.period}`
                        }
                        amount = (<td>{limit}</td>)
                    } else if (!isNull(n.current) && !isNull(n.queued)) {
                        const expiryDate = moment(n.current.expiryDate).format('YYYY-MM-DD HH:mm')

                        if (res.key === 'session') {
                            amount = this._layoutTd(`${n.current.minutes} ${locale.t('minutes')}`, `${n.queued.minutes} ${locale.t('minutes')}`)
                        } else if (res.key === 'stake') {
                            amount = this._layoutTd(`${n.current.currency} ${n.current.amount}`, `${n.queued.currency} ${n.queued.amount}`)
                            expiryDate = moment(n.current.ins).format('YYYY-MM-DD HH:mm')
                        } else {
                            amount = this._layoutTd(`${n.current.currency} ${n.current.amount} / ${n.current.period}`, `${n.queued.currency} ${n.queued.amount} / ${n.queued.period}`)
                        }

                        status = this._layoutTd(locale.t('active'), locale.t('queued'))
                        // time = this._layoutTd(`${locale.t('expiryDate')} : ${expiryDate}`, `${locale.t('validFrom')} : ${expiryDate}`)
                    }

                    let sh = showLimit === res.key ? true : false

                    data.push(
                        <tr key={index} onClick={() => n.updatable ? (sh ? this.setState({ showLimit: '' }) : this.setState({ showLimit: res.key })) : {}}>
                            <td>{res.name}</td>
                            {amount}
                            {status}
                            <td className="text-center">
                                {
                                    n.updatable ? (
                                        sh ? <i className="icon-custom jb-icon registerpage-dropdown-2" /> : <i className="icon-custom jb-icon registerpage-dropdown-3" />
                                    )
                                        : null
                                }
                            </td>
                        </tr>
                    )
                    if (sh) {
                        let def_1 = false
                        let def_2 = false
                        let def_3 = false
                        let dis_1 = false
                        let dis_2 = false
                        let dis_3 = false

                        if (res.key === 'depositPerDay') {
                            def_1 = true
                            dis_2 = true
                            dis_3 = true
                        } else if (res.key === 'depositPerWeek') {
                            def_2 = true
                            dis_1 = true
                            dis_3 = true
                        } else if (res.key === 'depositPerMonth') {
                            def_3 = true
                            dis_1 = true
                            dis_2 = true
                        } else {
                            def_1 = true
                        }

                        data.push(
                            <tr key={`sh-${index}`}>
                                <td colSpan="5">
                                    <div>
                                        <p>
                                            {locale.t(`limitsDesc-${res.key}`)}
                                        </p>
                                        {res.key !== 'session' && res.key !== 'stake' &&
                                            <Form noValidate validated={validated} onSubmit={(e) => this.handleSubmit(e, res.key)}>
                                           
                                                <Form.Group as={Col} md={4} >
                                                    <div className="selectdiv">
                                                        <Form.Control required as="select" name="currency" componentclass="select" defaultValue={myCurrency} disabled={true}>
                                                            {currencyShow}
                                                        </Form.Control>
                                                    </div>
                                                </Form.Group>
                                                <Form.Group as={Col} md={4} >
                                                    <Form.Control required type="number" name="amount" placeholder={locale.t('amount')} />
                                                </Form.Group>
                                                <Form.Group as={Col} md={6} >
                                                    <Form.Check className="radio-custom py-2" defaultChecked={def_1} disabled={dis_1} name="depositLimit" label={locale.t('dailyLimit')} type="radio" value="daily" />
                                                    <Form.Check className="radio-custom py-2" defaultChecked={def_2} disabled={dis_2} name="depositLimit" label={locale.t('weeklyLimit')} type="radio" value="weekly" />
                                                    <Form.Check className="radio-custom py-2" defaultChecked={def_3} disabled={dis_3} name="depositLimit" label={locale.t('monthlyLimit')} type="radio" value="monthly" />
                                                </Form.Group>
                                                <Form.Group as={Col} md={6}>
                                                    <Button className="btn-4 w-100" type="submit">
                                                        <p className="pl-2 text-uppercase m-0 pr-2">{locale.t('save')}</p>
                                                    </Button>
                                                </Form.Group>
                                            </Form>
                                        }
                                        {res.key === 'session' && <Form noValidate validated={validated} onSubmit={(e) => this.handleSubmitSession(e)}>
                                            <Form.Group as={Col} md={6} >
                                                <Form.Label>{locale.t('maximumAllowedSessionAliveTime')}</Form.Label>
                                                <Form.Control required type="text" name="minutes" placeholder={locale.t('minutes')} />
                                            </Form.Group>

                                            <Form.Group as={Col} md={6}>
                                                <Button className="btn-4 w-100" type="submit">
                                                    <p className="pl-2 text-uppercase m-0 pr-2">{locale.t('save')}</p>
                                                </Button>
                                            </Form.Group>
                                        </Form>}
                                        {res.key === 'stake' && <Form noValidate validated={validated} onSubmit={(e) => this.handleSubmitStake(e)}>
                                            <Form.Group as={Col} md={6} >
                                                <Form.Label>{locale.t('currency')}</Form.Label>
                                                <Form.Control required as="select" name="currency" componentclass="select" defaultValue={myCurrency} >
                                                    {currencyShow}
                                                </Form.Control>
                                            </Form.Group>
                                            <Form.Group as={Col} md={6} >
                                                <Form.Label>{locale.t('amount')}</Form.Label>
                                                <Form.Control required type="text" name="amount" placeholder={locale.t('amount')} />
                                            </Form.Group>

                                            <Form.Group as={Col} md={6}>
                                                <Button className="btn-4 w-100" type="submit">
                                                    <p className="pl-2 text-uppercase m-0 pr-2">{locale.t('save')}</p>
                                                </Button>
                                            </Form.Group>
                                        </Form>}
                                    </div>
                                </td>
                            </tr>
                        )
                    }
                }
            })
        }
        return data
    }

    render() {
        const { isMobile } = this.state
        return (
            <Row>
                <Col>
                    <div className="limits">
                        <p className="title-menu">{locale.t('yourLimits')}</p>
                        <div className="table-responsive">
                            {
                                isMobile ? (
                                    <Table className="limits-table limits-table-mobile">
                                        <thead>
                                            <tr>
                                                <th>{locale.t('limitType')}</th>
                                                <th>{locale.t('amount')}</th>
                                                <th>{locale.t('status')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this._renderTableMobile()}
                                        </tbody>
                                    </Table>
                                ) : (
                                    <Table className="limits-table">
                                        <thead>
                                            <tr>
                                                <th>{locale.t('limitType')}</th>
                                                <th>{locale.t('amount')}</th>
                                                <th>{locale.t('status')}</th>
                                                <th></th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this._renderTable()}
                                        </tbody>
                                    </Table>
                                )
                            }

                        </div>
                    </div>
                </Col>
            </Row>
        )
    }
}
const mapStateToProps = (state) => ({})
const mapDispatchToProps = (dispatch) => ({
    onSetMessageModal: (active) => dispatch({ type: MESSAGEMODAL, active })
})
export default connect(mapStateToProps, mapDispatchToProps)(Limits)