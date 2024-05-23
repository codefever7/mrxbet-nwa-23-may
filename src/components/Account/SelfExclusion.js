import React, { Component } from 'react'
import { connect } from 'react-redux'
import { MESSAGEMODAL } from "../../constants/types"
import UserService from '../../services/em/user'
import DatePicker from "react-datepicker"
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import isUndefined from 'lodash/isUndefined'
import filter from 'lodash/filter'
import LoadBlock from '../Loading/LoadBlock'
import "../../../styles/datepicker/datepicker.scss"
const locale = require('react-redux-i18n').I18n

export class SelfExclusion extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dataSelf: {},
            dataCoolOff: {},
            validatedCoolOff: false,
            validatedSelf: false,
            coolOffOther: false,
            dateValue: new Date(),
            dateValueCoolOff: new Date(),
            unsatisfied: false,
            unsatisfiedOther: false,
            isDatePicker: false,
            isActiveSelf: true
        }
    }
    componentDidMount() {
        this.loadBlock.isOpen(true)
        this.getSelf()
    }
    getSelf = async () => {
        try {
            const getSelfExclusion = await UserService.getSelfExclusion()
            const getCoolOff = await UserService.getCoolOff()
            let n = new Date()
            let nOff = new Date()
            let minimumDate = null
            let maximumDate = null

            if (this.loadBlock) this.loadBlock.isOpen(false)
            if (!isUndefined(getSelfExclusion.periods)) {
                n = filter(getSelfExclusion.periods, (res) => {
                    return res.name === 'SelfExclusionUntilSelectedDate'
                })
            }
            if (!isUndefined(getCoolOff.periods)) {
                nOff = filter(getCoolOff.periods, (res) => {
                    return res.name === 'CoolOffUntilSelectedDate'
                })
            }
            if (!isUndefined(n[0])) {
                minimumDate = new Date(n[0].minimumDate)
            }
            if (!isUndefined(nOff[0])) {
                minimumDate = new Date(nOff[0].maximumDate)
            }

            this.setState({
                dataSelf: getSelfExclusion,
                dataCoolOff: getCoolOff,
                dateValue: minimumDate,
                dateValueCoolOff: maximumDate
            })
        } catch (err) {
            const set = { messageTitle: 'Error!', messageDesc: locale.t('errorSelfExclusion'), messageDetail: '', messageType: 'error' }
            if (this.loadBlock) {
                if (this.loadBlock) this.loadBlock.isOpen(false)
                // this.props.onSetMessageModal(set)

                this.setState({
                    isActiveSelf: false
                })
            }

        }
    }

    handleConfirm = (event, type) => {
        let timeMessage = ''
        let onConfirm = null
        let eventConfirm = event

        if (type == 1) {
            onConfirm = this.handleSubmitCoolOff(event)
            timeMessage = event.target.elements['txtCoolOffUntil'].value
        } else if (type == 2) {
            onConfirm = this.handleSubmitSelf(event)
            timeMessage = event.target.elements['txtSelfExclusionUntil'].value
        }

        const set = { messageTitle: locale.t('confirm'), messageDesc: '', messageDetail: `${locale.t('selfMessage1')} ${timeMessage}${locale.t('selfMessage2')}`, messageType: 'success', buttonConfirm: { status: true, onConfirm: () => this.confirmSubmit(onConfirm, type) } }
        this.props.onSetMessageModal(set)

        event.preventDefault();
        event.stopPropagation();
    }

    confirmSubmit = (parameters, type) => {
        const set = { isClose: true }

        if (type == 1 && parameters) {
            this.props.onSetMessageModal(set)
            UserService.setCoolOffEnable(parameters).then((res) => {
                window.location.reload()
            })
        } else if (type == 2 && parameters) {
            this.props.onSetMessageModal(set)
            UserService.setSelfExclusionEnable(parameters).then((res) => {
                window.location.reload()
            })
        }

    }

    handleSubmitCoolOff = (event) => {
        const { dataCoolOff } = this.state
        let form = event.target
        let e = form.elements

        if (form.checkValidity() === false) {
            this.setState({ validatedCoolOff: true })
            event.preventDefault();
            event.stopPropagation();
            return false
        } else {
            const reasonRes = filter(dataCoolOff.reasons, (res) => res.name === e['reasons'].value)
            let reasonText = reasonRes[0].text
            let unsatisfiedText = ''

            if (e['reasons'].value === 'other') {
                reasonText = e['txtCoolOffReason'].value
            }
            if (!isUndefined(e['unsatisfied'])) {
                const unsatisfiedReasonRes = filter(dataCoolOff.unsatisfiedReasons, (res) => res.name === e['unsatisfied'].value)

                unsatisfiedText = unsatisfiedReasonRes[0].text
                if (e['unsatisfied'].value === 'other') {
                    unsatisfiedText = e['txtCoolOffUnsatisfied'].value
                }
            }

            let parameters = {
                reason: reasonText,
                unsatisfiedReason: unsatisfiedText,
                period: e['coolOff'].value
            };

            if (e['coolOff'].value === 'CoolOffUntilSelectedDate') {
                parameters.coolOffDate = `${e['txtCoolOffUntil'].value}`
            }

            event.preventDefault();
            event.stopPropagation();

            return parameters
        }

    }
    handleSubmitSelf = (event) => {
        let form = event.target
        let e = form.elements

        if (form.checkValidity() === false) {
            this.setState({ validatedSelf: true })
            event.preventDefault();
            event.stopPropagation();
            return false
        } else {
            const parameters = {
                period: e['selfExclusion'].value
            }

            if (e['selfExclusion'].value === 'SelfExclusionUntilSelectedDate') {
                parameters.selfExclusionDate = `${e['txtSelfExclusionUntil'].value}`
            }

            event.preventDefault();
            event.stopPropagation();
            return parameters
        }
    }
    handleChangeCoolOff = (event) => {
        let form = event.target

        if (form.value === 'other') {
            this.setState({
                coolOffOther: true,
                unsatisfied: false,
                unsatisfiedOther: false
            })
        } else if (form.value === 'unsatisfied') {
            this.setState({
                unsatisfied: true,
                coolOffOther: false,
                unsatisfiedOther: false
            })
        } else {
            this.setState({
                coolOffOther: false,
                unsatisfied: false,
                unsatisfiedOther: false
            })
        }
    }
    handleChangeUnsatisfied = (event) => {
        let form = event.target

        if (form.value === 'other') {
            this.setState({
                unsatisfiedOther: true,
            })
        } else {
            this.setState({
                unsatisfiedOther: false,
            })
        }
    }
    _renderCoolOffUnsatisfied = () => {
        const { dataCoolOff } = this.state
        let item = []

        if (!isUndefined(dataCoolOff.unsatisfiedReasons)) {
            dataCoolOff.unsatisfiedReasons.map((res, index) => {
                item.push(<option key={`unsatisfied-1-${index}`} value={res.name}>{res.text}</option>)
            })
        }

        return item
    }
    _renderCoolOffReason = () => {
        const { dataCoolOff } = this.state
        let item = []

        if (!isUndefined(dataCoolOff.reasons)) {
            dataCoolOff.reasons.map((res, index) => {
                item.push(<option key={`reasons-1-${index}`} value={res.name}>{res.text}</option>)
            })
        }

        return item
    }
    _renderSelectCoolOff = () => {
        const { dataCoolOff } = this.state
        let item = []

        if (!isUndefined(dataCoolOff.periods)) {
            dataCoolOff.periods.map((res, index) => {

                if (res.name == 'CoolOffUntilSelectedDate') {
                    item.push(
                        <Form.Row key={`periods-1-${index}`}>
                            <Form.Group as={Col} md={4} className="align-self-center">
                                <Form.Check className="radio-custom" defaultChecked={res.dateSelector} name="coolOff" label={`${res.text}`} type="radio" value={res.name} />
                            </Form.Group>
                            <Form.Group as={Col} md={8}>
                                <DatePicker
                                    name="txtCoolOffUntil"
                                    dateFormat="yyyy-MM-dd"
                                    selected={this.state.dateValueCoolOff}
                                    onChange={this.handleDateChangeCoolOff} />
                            </Form.Group>
                        </Form.Row>
                    )
                } else {
                    item.push(
                        <Form.Check required key={`periods-1-${index}`} className="radio-custom" defaultChecked={res.dateSelector} name="coolOff" label={`${res.text}`} type="radio" value={res.name} />
                    )
                }
            })
        }

        return item
    }
    _renderSelectSelf = () => {
        const { dataSelf } = this.state
        let item = []

        if (!isUndefined(dataSelf.periods)) {
            dataSelf.periods.map((res, index) => {
                if (res.name === 'SelfExclusionUntilSelectedDate') {
                    item.push(
                        <Form.Row key={`periods-2-${index}`}>
                            <Form.Group as={Col} md={4} className="align-self-center">
                                <Form.Check className="radio-custom" defaultChecked={res.dateSelector} name="selfExclusion" label={`${res.text}`} type="radio" value={res.name} />
                            </Form.Group>
                            <Form.Group as={Col} md={8}>
                                <DatePicker
                                    name="txtSelfExclusionUntil"
                                    dateFormat="yyyy-MM-dd"
                                    selected={this.state.dateValue}
                                    onChange={this.handleDateChange} />
                            </Form.Group>
                        </Form.Row>
                    )
                } else {
                    item.push(<Form.Check required key={`periods-2-${index}`} className="radio-custom" defaultChecked={res.dateSelector} name="selfExclusion" label={`${res.text}`} type="radio" value={res.name} />)
                }
            })
        }
        return item
    }

    handleDateChangeCoolOff = date => {
        this.setState({
            dateValueCoolOff: date
        });
    }
    handleDateChange = date => {
        this.setState({
            dateValue: date,
        });
    }
    render() {
        const { validatedCoolOff, validatedSelf, coolOffOther, unsatisfied, unsatisfiedOther, isActiveSelf } = this.state

        return (
            <Col className="self-exclusion">
                <Row>
                    <Col md={12} xs={12} className="mb-2">
                        <p className="title-menu">{locale.t('selfExclusion')}</p>

                    </Col>
                </Row>

                {
                    !isActiveSelf ?
                        <Row>
                            <Col md={12} xs={12} className="mb-2">
                                <h2 className="title">{locale.t('errorSelfExclusion')}</h2>
                            </Col>
                        </Row>
                        :

                        <Row>
                            <Col md={12} xs={12} className="mb-2">
                                <p className="title m-0">{locale.t('coolOff')}</p>
                                <p>{locale.t('coolOffDesc')}</p>
                                <Form noValidate validated={validatedCoolOff} onSubmit={(e) => this.handleConfirm(e, 1)}>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>{locale.t('textCoolOff')}</Form.Label>
                                                <div className="selectdiv">
                                                    <Form.Control required as="select" name="reasons" onChange={(e) => this.handleChangeCoolOff(e)} componentclass="select"  >
                                                        {this._renderCoolOffReason()}
                                                    </Form.Control>
                                                </div>
                                            </Form.Group>

                                            {
                                                unsatisfied &&
                                                <Form.Group>
                                                    <Form.Label>{locale.t('unsatisfiedReason')}</Form.Label>
                                                    <div className="selectdiv">
                                                    <Form.Control required as="select" name="unsatisfied" onChange={(e) => this.handleChangeUnsatisfied(e)} componentclass="select"  >
                                                        {this._renderCoolOffUnsatisfied()}
                                                    </Form.Control>
                                                    </div>
                                                </Form.Group>
                                            }
                                            {
                                                coolOffOther &&
                                                <Form.Group>
                                                    <Form.Control className="input-custom" required type="text" name="txtCoolOffReason" />
                                                </Form.Group>
                                            }
                                            {
                                                unsatisfiedOther &&
                                                <Form.Group>
                                                    <Form.Control className="input-custom" required type="text" name="txtCoolOffUnsatisfied" />
                                                </Form.Group>
                                            }
                                            <Form.Group>
                                                <Form.Label>{locale.t('textFormCoolOff')}</Form.Label>
                                                {this._renderSelectCoolOff()}
                                            </Form.Group>
                                            <Form.Group>
                                                <Button className="btn-3" type="submit">
                                                    <p className="pl-2 text-uppercase m-0 pr-2">{locale.t('submit')}</p>
                                                </Button>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Form>
                            </Col>
                        </Row>
                }

                {
                    !isActiveSelf ?
                        null
                        :
                        <Row>
                            <Col md={12} xs={12} className="mb-2">
                                <h2 className="title">{locale.t('selfExclusion')}</h2>
                                <p>{locale.t('selfExclusionDesc')}</p>
                                <Form noValidate validated={validatedSelf} onSubmit={(e) => this.handleConfirm(e, 2)}>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>{locale.t('textFormCoolOff')}</Form.Label>
                                                {this._renderSelectSelf()}
                                            </Form.Group>
                                            <Form.Group>
                                                <Button className="btn-3" type="submit">
                                                    <p className="pl-2 text-uppercase m-0 pr-2">{locale.t('submit')}</p>
                                                </Button>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Form>
                            </Col>
                        </Row>
                }
                <LoadBlock ref={ref => this.loadBlock = ref} />
            </Col>
        )
    }
}
const mapDispatchToProps = (dispatch) => ({
    onSetMessageModal: (active) => dispatch({ type: MESSAGEMODAL, active })
})
export default connect(null, mapDispatchToProps)(SelfExclusion)