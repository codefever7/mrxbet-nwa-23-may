import React, { Component, Fragment } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import isEmpty from 'lodash/isEmpty'
import forEach from 'lodash/forEach'
import isUndefined from 'lodash/isUndefined'
import isArray from 'lodash/isArray'
import { getSymbol } from '../../../utils'
const locale = require('react-redux-i18n').I18n

export default class LayoutOtherCard extends Component {
    GetFieldProperties = (value) => {
        if (value.type === "Boolean") {
            value.type = "CheckBox";
        }
        return value;
    }
    GetDynamicRegistrationFields = (fields) => {
        const registrationFields = []
        if (fields.payCardID != null &&
            fields.payCardID.registrationFields != null) {
            forEach(fields.payCardID.registrationFields, (value, key) => {
                registrationFields.push({ fieldKey: key, fieldProperties: this.GetFieldProperties(value) });
            })
        }
        return registrationFields;
    }
    GetDynamicAlwaysUserInputFields = (fields) => {
        var alwaysUserInputFields = [];
        forEach(fields, (value, key) => {
            if (value != null &&
                value.hasOwnProperty('label') &&
                value.hasOwnProperty('description') &&
                value.hasOwnProperty('type')) {
                alwaysUserInputFields.push({ fieldKey: key, fieldProperties: this.GetFieldProperties(value) });
            }
        })
        return alwaysUserInputFields;
    }
    _render = (registrationFields) => {
        return (
            !isEmpty(registrationFields) &&
            Object.entries(registrationFields).map(([key, value], i) => {
                return (
                    value.fieldProperties.mandatory &&
                    <Form.Row key={key}>
                        <Form.Group as={Col} md={3}>
                            <Form.Text>
                                {value.fieldProperties.label}
                            </Form.Text>
                        </Form.Group>
                        <Form.Group as={Col} md={9} className="">
                            {
                                value.fieldProperties.type=='Lookup'
                                ?
                                <Form.Control  required id={value.fieldProperties.fieldKey} name={value.fieldKey} as="select" componentclass="select">
                                    {
                                        value.fieldProperties.values.map((v,i)=>{
                                            return <option key={v.key} value={v.key}>{v.value}</option>
                                        })
                                    }
                                </Form.Control>
                                :
                                <Form.Control required id={value.fieldProperties.fieldKey} type={value.fieldProperties.type} pattern={value.fieldProperties.regularExpression} name={value.fieldKey} placeholder={value.fieldProperties.description} />
                            }
                        </Form.Group>
                    </Form.Row>
                )
            })
        )
    }
    _render2 = (alwaysUserInputFields) => {
        return (
            !isEmpty(alwaysUserInputFields) &&
            Object.entries(alwaysUserInputFields).map(([key, value], i) => {
                return (
                    value.fieldProperties.mandatory &&
                    <Form.Row key={key}>
                        <Form.Group as={Col} md={3}>
                            <Form.Text>
                                {value.fieldProperties.label}
                            </Form.Text>
                        </Form.Group>
                        <Form.Group as={Col} md={9} className="">
                            {
                                value.fieldProperties.type=='Lookup'
                                ?
                                <Form.Control  required id={value.fieldProperties.fieldKey} name={value.fieldKey} as="select" componentclass="select">
                                    {
                                        value.fieldProperties.values.map((v,i)=>{
                                            return <option key={v.key} value={v.key}>{v.value}</option>
                                        })
                                    }
                                </Form.Control>
                                :
                                <Form.Control required id={value.fieldProperties.fieldKey} type={value.fieldProperties.type} pattern={value.fieldProperties.regularExpression} name={value.fieldKey} placeholder={value.fieldProperties.description} />
                            }
                        </Form.Group>
                    </Form.Row>
                )
            })
        )
    }
    _renderPayCardID = () => {
        const { depositeFromData } = this.props
        let payCardID = null
        if (!isUndefined(depositeFromData.fields.payCardID.options) && isArray(depositeFromData.fields.payCardID.options)) {
            const options = depositeFromData.fields.payCardID.options
            let item = []
            options.map((res, index) => {
                let dateSelector = index === 0 ? true : false
                item.push(
                    <Form.Check key={index} required defaultChecked={dateSelector} name="payCardID" label={`${res.name}`} type="radio" value={res.id} />
                )
            })
            payCardID = (
                <Form.Group>
                    <Form.Label>{locale.t('formDepositText6')}</Form.Label>
                    {item}
                </Form.Group>
            )
        }
        return payCardID
    }
    render() {
        const {
            cpt,
            handleSetChecked,
            _promotionsRender,
            depositeFromData,
            handleSubmitStep1,
            handleBlur,
            errAmount,
            amount,
            session,
            handleChange,
            errDeposit,
            gamingAccountID,
            handleClick,
            bonusCode,
            exitCard,
            payCardOption
        } = this.props
        const registrationFields = this.GetDynamicRegistrationFields(depositeFromData.fields)
        const alwaysUserInputFields = this.GetDynamicAlwaysUserInputFields(depositeFromData.fields)
        const currencyWallets = !isUndefined(session.wallets.realMoneyCurrency) ? session.wallets.realMoneyCurrency : 'EUR'

        return (
            <Row className="body step-body-2">
                <Form noValidate onSubmit={(e) => handleSubmitStep1(e)}>
                    <Col className="deposit-content">
                        <Row className="deposit-category-header pt-2">
                            <Col md="12">
                                <p className="text-uppercase deposit-title" >{locale.t('payment')}</p>
                            </Col>
                        </Row>
                        <Row className="bank-list">
                            <Col xs="3" className="pr-0">
                                <div className="deposit-categories-logo" dangerouslySetInnerHTML={{ __html: depositeFromData.icon }}>
                                </div>
                            </Col>
                            <Col xs="9" className="pl-10">
                                <p>{depositeFromData.name}</p>
                                <p>{getSymbol(currencyWallets)} {depositeFromData.fields.amount.limits[currencyWallets].min} - {getSymbol(currencyWallets)} {depositeFromData.fields.amount.limits[currencyWallets].max}</p>
                            </Col>
                        </Row>
                        <Form.Row style={{ display: 'none' }}>
                            <Form.Group as={Col} xs={3}>
                                <Form.Text className>{locale.t('formDepositText1')}</Form.Text>
                            </Form.Group>
                            <Form.Group as={Col} xs={9}>
                                <Form.Control name="gamingAccountID" as="select" componentclass="select">
                                    {gamingAccountID}
                                </Form.Control>
                            </Form.Group>
                        </Form.Row>
                        <Form.Row>
                            <Form.Group as={Col} xs={3}>
                                <Form.Text>
                                    {locale.t('amount')}
                                </Form.Text>
                            </Form.Group>
                            <Form.Group as={Col} xs={12} md={9} className={errAmount.class}>
                                <InputGroup className="amount-input">
                                    <Form.Control required type="number" name="amount" step="any" min={depositeFromData.fields.amount.limits[currencyWallets].min} max={depositeFromData.fields.amount.limits[currencyWallets].max} defaultValue={depositeFromData.fields.amount.limits[currencyWallets].min}  placeholder={locale.t('amountPlaceholder')} onBlur={(e) => handleBlur(e)} onChange={(e) => handleChange(e)} />
                                    <InputGroup.Prepend>
                                        <InputGroup.Text>{getSymbol(currencyWallets)}</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <Form.Control.Feedback type="invalid">{errAmount.message}</Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Form.Row>
                        {!isEmpty(depositeFromData) &&
                            <Fragment>
                                {
                                    !exitCard
                                    ?
                                    this._render(registrationFields)
                                    :
                                    <Form.Row>
                                                <Form.Group as={Col} md={3}>
                                                    <Form.Text className="">{locale.t('formDepositText2')}</Form.Text>
                                                </Form.Group>
                                                <Form.Group as={Col} xs={9} >
                                                    <Form.Control name="payCardID" as="select" componentclass="select">
                                                        {payCardOption}
                                                    </Form.Control>
                                                </Form.Group>
                                            </Form.Row>
                                }
                                {
                                    this._render2(alwaysUserInputFields)
                                }
                            </Fragment>
                        }
                        {/* <Form.Row>
                            <Form.Group as={Col} xs={12} md={6}>
                                <Form.Label>{locale.t('bonus')}</Form.Label>
                                <Form.Control type="text" name="bonusCode" value={bonusCode} onChange={(e) => handleChange(e)} placeholder={locale.t('bonusCode')} />
                            </Form.Group>
                        </Form.Row> */}
                        <Row>
                            {/* <Col>
                                <Button name="back_step_1" type="button" block className="btn-1" onClick={(e) => handleClick(e)}>{locale.t('back')}</Button>
                            </Col> */}
                            <Col>
                                <Button type="submit" block className="btn-3">{locale.t('deposit')}</Button>
                            </Col>
                        </Row>
                    </Col>
                    {/* <Col md={6} className="text-content">
                        {_promotionsRender}
                    </Col> */}
                    <Row className="w-100 m-0 pt-2">
                        <Col>
                            <p className="footer-error text-danger">{errDeposit}</p>
                        </Col>
                        {/* <Col md={6}>
                            <Row className="px-2 align-items-center h-100 cpt">
                                <Form.Check checked={cpt} onChange={(evt) => handleSetChecked(evt)} name="cpt" className="promotions" type="checkbox" />
                                <p className="mx-2 my-0">{locale.t('formRegisterTextConPromotion')}</p>
                            </Row>
                        </Col> */}
                    </Row>
                </Form>
            </Row>
        )
    }
}