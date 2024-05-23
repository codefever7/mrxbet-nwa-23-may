import React, { Component, Fragment } from 'react'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import Script from 'react-load-script'
import isUndefined from 'lodash/isUndefined'
import { getSymbol } from '../../../utils'
const locale = require('react-redux-i18n').I18n

export default class LayoutCreditCard extends Component {
    render() {
        const {
            cpt,
            handleSetChecked,
            _promotionsRender,
            depositeFromData,
            handleSubmitStep1,
            handleBlur,
            handleChange,
            monthShow,
            yearShow,
            handleScriptCreate,
            handleScriptError,
            handleScriptLoad,
            exitCard,
            errAmount,
            errCardNumber,
            errCardHolderName,
            errCardCVV,
            validated_1,
            payCardOption,
            amount,
            session,
            errDeposit,
            gamingAccountID,
            bonusCode,
            handleClick
        } = this.props
        const currencyWallets = !isUndefined(session.wallets.realMoneyCurrency) ? session.wallets.realMoneyCurrency : 'EUR'

        return (
            <Row className="body step-body-2">
                <Form noValidate validated={validated_1} onSubmit={(e) => handleSubmitStep1(e)}>
                    <Col className="deposit-content text-content">
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
                            <Col xs="9" className="p-l-10">
                                <p >{depositeFromData.name}</p>
                                <p >{getSymbol(currencyWallets)} {depositeFromData.fields.amount.limits[currencyWallets].min} - {getSymbol(currencyWallets)} {depositeFromData.fields.amount.limits[currencyWallets].max}</p>
                            </Col>
                        </Row>
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
                        <Form.Row style={{display: 'none'}}>
                            <Form.Group as={Col} xs={3} >
                                <Form.Text className>{locale.t('formDepositText1')}</Form.Text>
                            </Form.Group>
                            <Form.Group as={Col} xs={9} >
                                <Form.Control name="gamingAccountID" as="select" componentclass="select">
                                    {gamingAccountID}
                                </Form.Control>
                            </Form.Group>
                        </Form.Row>
                        {(depositeFromData.fields.payCardID.options.length < depositeFromData.fields.payCardID.maximumPayCards) &&
                            <Form.Row>
                                <Form.Group as={Col} xs={12} >
                                    <Form.Check inline disabled={depositeFromData.fields.payCardID.options.length == 0 ? true : false} checked={exitCard ? true : false} label=" exits card" onChange={(e) => handleChange(e)} name="exits_card" type="checkbox" id={`inline-radio-1`} />
                                    <Form.Check inline checked={exitCard ? false : true} label=" register new card" onChange={(e) => handleChange(e)} name="new_card" type="checkbox" id={`inline-radio-2`} />
                                </Form.Group>
                            </Form.Row>
                        }
                        {exitCard ? (
                            <Form.Row>
                                <Form.Group as={Col} xs={3} >
                                    <Form.Text className="">{locale.t('formDepositText2')}</Form.Text>
                                </Form.Group>
                                <Form.Group as={Col} xs={9} >
                                    <Form.Control name="payCardID" as="select" componentclass="select" className="input-form-n1">
                                        {payCardOption}
                                    </Form.Control>
                                </Form.Group>
                            </Form.Row>
                        ) : (
                                <Fragment>
                                    <Form.Row>
                                        <Form.Group as={Col} xs={3} >
                                            <Form.Text className="">{locale.t('formDepositText2')}</Form.Text>
                                        </Form.Group>
                                        <Form.Group as={Col} xs={9} className={errCardNumber.class}>
                                            <div id="credit-card-number-wrapper" className={`newCardInput ${errCardNumber.status ? 'err-card-number' : ''}`}></div>
                                            <Form.Control.Feedback type="invalid">{errCardNumber.message}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col} xs={3} >
                                            <Form.Text className="">{locale.t('formDepositText3')}</Form.Text>
                                        </Form.Group>
                                        <Form.Group as={Col} xs={9} className={errCardHolderName.class + ' ' + 'hide-text-mobile'}>
                                            <Form.Control required type="text" className="input-form-n1" name="txtName" onBlur={(e) => handleBlur(e)} onChange={(e) => handleChange(e)} />
                                            <Form.Control.Feedback type="invalid">{errCardHolderName.message}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Form.Row>
                                    <Form.Row>
                                        <Form.Group as={Col} xs={3} >
                                            <Form.Text className="">{locale.t('formDepositText4')}</Form.Text>
                                        </Form.Group>
                                        <Form.Group as={Col} xs={3} >
                                            <Form.Control name="month" as="select" componentclass="select" className="input-form-n1">
                                                {monthShow}
                                            </Form.Control>
                                        </Form.Group>
                                        <Form.Group as={Col} xs={6} >
                                            <Form.Control name="year" as="select" componentclass="select" className="input-form-n1">
                                                {yearShow}
                                            </Form.Control>
                                        </Form.Group>
                                    </Form.Row>
                                </Fragment>
                            )
                        }
                        <Form.Row>
                            <Form.Group as={Col} xs={3} >
                                <Form.Text className="">
                                    {locale.t('formDepositText5')}
                                </Form.Text>
                            </Form.Group>
                            <Form.Group as={Col} xs={9} className={errCardCVV.class}>
                                <div id="credit-card-cvc-wrapper"></div>
                                <Form.Control.Feedback type="invalid">{errCardCVV.message}</Form.Control.Feedback>
                                <p className="text-cvv">*{locale.t('cvvDescription')}</p>
                            </Form.Group>
                        </Form.Row>
                        <Script
                            url={depositeFromData.secureFormScriptUrl}
                            onCreate={(e) => handleScriptCreate(e)}
                            onError={(e) => handleScriptError(e)}
                            onLoad={(e) => handleScriptLoad(e)}
                        />
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
                                <Button  type="submit" block className="btn-3">{locale.t('deposit')}</Button>
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
