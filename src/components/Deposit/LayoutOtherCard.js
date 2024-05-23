import React, { Component, Fragment } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import forEach from 'lodash/forEach'
import isEmpty from 'lodash/isEmpty'
import isUndefined from 'lodash/isUndefined'
import isArray from 'lodash/isArray'
import isNull from 'lodash/isNull'
import findIndex from 'lodash/findIndex'
import filter from 'lodash/filter'
import head from 'lodash/head'
import { getSymbol, getCookie, replaceSpecialCharacters, getPathPaymentLogo } from '../../../utils'
const locale = require('react-redux-i18n').I18n

export default class LayoutOtherCard extends Component {
    componentDidMount() {
        let elActive = document.getElementsByClassName('collapse show');
        if (!isUndefined(elActive) && elActive.length) {
            window.scrollTo(elActive[0].offsetTop, 0);
        }
    }
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
                        <Form.Group as={Col} md={3} >
                            <Form.Text className="">
                                {value.fieldProperties.label}
                            </Form.Text>
                        </Form.Group>
                        <Form.Group as={Col} md={9} className="">
                            {
                                value.fieldProperties.type == 'Lookup'
                                    ?
                                    <Form.Control required id={value.fieldProperties.fieldKey} name={value.fieldKey} as="select" componentclassname="select">
                                        {
                                            value.fieldProperties.values.map((v, i) => {
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
                        <Form.Group as={Col} md={3} >
                            <Form.Text className="">
                                {value.fieldProperties.label}
                            </Form.Text>
                        </Form.Group>
                        <Form.Group as={Col} md={9} className="">
                            {
                                value.fieldProperties.type == 'Lookup'
                                    ?
                                    <Form.Control required id={value.fieldProperties.fieldKey} name={value.fieldKey} as="select" componentclassname="select">
                                        {
                                            value.fieldProperties.values.map((v, i) => {
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
    _setBobusAction = (e) => {
        const { setBonusAction } = this.props;
        const bonusAction = (e.currentTarget.checked) ? 3 : 1;
        setBonusAction(bonusAction)
    }

    _renderBonus = () => {
        const { bonuses, bonusAction, setBonusAction, promotionsDeposit, openPopup } = this.props
        let item = null
        let bonus = []
        let itemInput = (
            <Form.Group as={Col} md={6} className="p-0">
                <Form.Control required type="text" name="bonuses" placeholder="Code" />
            </Form.Group>
        )
        if (!isNull(bonuses) && !isUndefined(bonuses.bonuses) && isArray(bonuses.bonuses)) {
            const decodedCookie = decodeURIComponent(replaceSpecialCharacters(document.cookie));
            const promotionRegister = getCookie('promotion-register', decodedCookie)
            let pmCodeIndex = 0
            if (promotionRegister) {
                if (JSON.parse(promotionRegister)) {
                    const inx = findIndex(bonuses.bonuses, (o) => o.code === JSON.parse(promotionRegister).bonusCode)
                    if (inx !== -1) {
                        pmCodeIndex = inx
                    }
                }
            }
            bonuses.bonuses.map((res, index) => {
                let dateSelector = index === pmCodeIndex ? true : false
                let code = res.code
                let title = res.name
                let description = res.description
                let link = null
                if (!isUndefined(promotionsDeposit.data)) {
                    const data = filter(promotionsDeposit.data, (o) => o.bonusCode === res.code)
                    if (head(data)) {
                        const reData = head(data)
                        code = reData.bonusCode
                        title = reData.title
                        description = reData.shortDescription
                        link = <a href={reData.link} onClick={(e) => openPopup(e, reData.id)} alt={reData.alt} target="_blank" className="bonus-link w-100"><p>{locale.t('clickForBonusDetail')}</p></a>
                    }
                }
                bonus.push(
                    <div className="bonus-deposit-code" key={`bonus-deposit-code-${index}`}>
                        <Form.Check required defaultChecked={dateSelector} name="selectedBonusCode" type="radio" value={code} />
                        <Col>
                            <p className="m-0 bonus-title w-100">{title}</p>
                            <div className="bonus-description w-100" dangerouslySetInnerHTML={{ __html: description }}></div>
                            {link}
                        </Col>
                    </div>
                )
            })
        }
        item = (
            <div className={`bonus-deposit`}>
                <div className="d-flex bonus-layout checkbox-switch">
                    <div className="col-2">
                        <label className="switch">
                            <input type="checkbox" onChange={(e) => this._setBobusAction(e)} />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    <div className="col-10">
                        {bonusAction === 1 && locale.t('selectBonus')}
                        {bonusAction === 3 && (isNull(bonuses) || isUndefined(bonuses.bonuses) || (isArray(bonuses.bonuses) && bonuses.bonuses.length == 0)) &&
                            locale.t('noBonus')}
                    </div>
                    {/* <button type="button" className={`bonus-button ${bonusAction === 1 ? 'active' : ''}`} onClick={() => setBonusAction(1)}>
                        <p className="m-0 text-center">{locale.t('bonusTab1')}</p>
                    </button>
                    <button type="button" className={`bonus-button ${bonusAction === 2 ? 'active' : ''}`} onClick={() => setBonusAction(2)}>
                        <p className="m-0 text-center">{locale.t('bonusTab2')}</p>
                    </button>
                    {!isNull(bonuses) && !isUndefined(bonuses.bonuses) ?
                        <button type="button" className={`bonus-button ${bonusAction === 3 ? 'active' : ''}`} onClick={() => setBonusAction(3)}>
                            <p className="m-0 text-center">{locale.t('bonusTab3')}</p>
                        </button>
                        : null} */}
                </div>
                {bonusAction === 2 && itemInput}
                {bonusAction === 3 && bonus}
            </div>
        )
        return item
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
            handleClick,
            depositeFromData,
            handleSubmitStep1,
            handleBlur,
            errAmount,
            amount,
            userInfo,
            handleChange,
            validated_1,
            gamingAccountID,
            session,
            exitCard,
            payCardOption,
            card,
            payCardIdDefault
        } = this.props
        const registrationFields = this.GetDynamicRegistrationFields(depositeFromData.fields)
        const alwaysUserInputFields = this.GetDynamicAlwaysUserInputFields(depositeFromData.fields)
        const currencyWallets = !isUndefined(session.wallets.realMoneyCurrency) ? session.wallets.realMoneyCurrency : 'EUR'
        let isCard = ''
        if (!isNull(card) && !isUndefined(card.payCard) && !isUndefined(card.payCard.id) && isEmpty(payCardIdDefault)) {
            isCard = card.payCard.id
        } else {
            isCard = payCardIdDefault
        }
        return (
            <Row className="body step-body-2">
                <Form noValidate validated={validated_1} onSubmit={(e) => handleSubmitStep1(e)}>
                    <Col md={12} className="deposit-content">
                        <Row className="deposit-category-header pt-2">
                            <Col md="12">
                                <p className="text-uppercase deposit-title" >{locale.t('payment')}</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs="3" className="pr-0">
                                {getPathPaymentLogo(depositeFromData.paymentMethodCode) !== null ?
                                    <img src={getPathPaymentLogo(depositeFromData.paymentMethodCode)} /> :
                                    (
                                        <div className="deposit-categories-logo" dangerouslySetInnerHTML={{ __html: depositeFromData.icon }}>
                                        </div>
                                    )
                                }
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <p >{depositeFromData.name}</p>
                                <p >{getSymbol(currencyWallets)} {depositeFromData.fields.amount.limits[currencyWallets].min} - {getSymbol(currencyWallets)} {depositeFromData.fields.amount.limits[currencyWallets].max}</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <hr />
                            </Col>
                        </Row>
                        <Form.Row style={{ display: 'none' }}>
                            <Form.Group as={Col} xs={3} >
                                <Form.Text className>{locale.t('formDepositText1')}</Form.Text>
                            </Form.Group>
                            <Form.Group as={Col} xs={9} >
                                <Form.Control name="gamingAccountID" as="select" componentclassname="select" >
                                    {gamingAccountID}
                                </Form.Control>
                            </Form.Group>
                        </Form.Row>
                        <Form.Row>
                            <Form.Group as={Col} xs={3} >
                                <Form.Text className="">
                                    {locale.t('amount')}
                                </Form.Text>
                            </Form.Group>
                            <Form.Group as={Col} xs={9} className={errAmount.class}>
                                <InputGroup className="amount-input">
                                    <Form.Control required type="number" name="amount" step="any" min={depositeFromData.fields.amount.limits[currencyWallets].min} max={depositeFromData.fields.amount.limits[currencyWallets].max} defaultValue={depositeFromData.fields.amount.limits[currencyWallets].min} placeholder={locale.t("amountPlaceholder")} onBlur={(e) => handleBlur(e)} onChange={(e) => handleChange(e)} />
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
                                        <Row>
                                            <Col md={12}>
                                                {
                                                    this._render(registrationFields)
                                                }
                                            </Col>
                                        </Row>
                                        :
                                        <Form.Row>
                                            <Form.Group as={Col} md={3} >
                                                <Form.Text className="">{locale.t('formDepositText2')}</Form.Text>
                                            </Form.Group>
                                            <Form.Group as={Col} xs={9} >
                                                <Form.Control name="payCardID" as="select" componentclassname="select" value={isCard} onChange={(e) => handleChange(e)} >
                                                    {payCardOption}
                                                </Form.Control>
                                            </Form.Group>
                                        </Form.Row>
                                }
                                <Row>
                                    <Col md={12}>
                                        {this._render2(alwaysUserInputFields)}
                                    </Col>
                                </Row>
                            </Fragment>
                        }
                        <Form.Group>
                            {/* <p className="bonus-header">{locale.t('bonus')}</p> */}
                            {this._renderBonus()}
                        </Form.Group>
                        <Row>
                            {/* <Col className="pr-2">
                                <Button name="back_step_1" type="button" block className="btn-1" onClick={(e) => handleClick(e)}>{locale.t('back')}</Button>
                            </Col> */}
                            <Col>
                                <Button type="submit" block className="btn-3">{locale.t('deposit')}</Button>
                            </Col>
                        </Row>
                    </Col>
                </Form>
            </Row>
        )
    }
}