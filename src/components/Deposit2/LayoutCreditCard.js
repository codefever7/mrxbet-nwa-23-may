import React, { Component, Fragment } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import Script from 'react-load-script'
import { getSymbol, getCookie, replaceSpecialCharacters } from '../../../utils'
import isNull from 'lodash/isNull'
import isUndefined from 'lodash/isUndefined'
import isArray from 'lodash/isArray'
import findIndex from 'lodash/findIndex'
import filter from 'lodash/filter'
import head from 'lodash/head'
import isEmpty from 'lodash/isEmpty'
const locale = require('react-redux-i18n').I18n

export default class LayoutCreditCard extends Component {
    componentDidMount(){
        let elActive = document.getElementsByClassName('collapse show');
        if(!isUndefined(elActive) && elActive.length){
            window.scrollTo(elActive[0].offsetTop, 0);  
        }
    }

    _setBobusAction=(e)=>{
        const { setBonusAction } = this.props;
        const bonusAction = (e.currentTarget.checked)?3:1;
        setBonusAction(bonusAction)
    }
    
    _renderBonus = () => {
        const { bonuses, bonusAction, setBonusAction, promotionsDeposit, openPopup } = this.props
        let item = null
        let bonus = []
        let itemInput = (
            <Form.Group as={Col} md={6} className="p-0">
                <Form.Control required type="text" name="bonuses" placeholder={locale.t('code')} />
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
                        <input type="checkbox"  onChange={(e) => this._setBobusAction(e)} />
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
                    {!isNull(bonuses) && !isUndefined(bonuses.bonuses) && isArray(bonuses.bonuses) && bonuses.bonuses.length > 0 ?
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
    render() {
        const {
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
            userInfo,
            errDeposit,
            gamingAccountID,
            handleClick,
            session,
            card,
            payCardIdDefault
        } = this.props
        let isCard =  ''
        if(!isNull(card) && !isUndefined(card.payCard) && !isUndefined(card.payCard.id) && isEmpty(payCardIdDefault)){
            isCard = card.payCard.id
        }else{
            isCard = payCardIdDefault
        }
        const currencyWallets = !isUndefined(session.wallets.realMoneyCurrency) ? session.wallets.realMoneyCurrency : 'EUR'

        return (
            <Row className="body step-body-2">
                <Form noValidate validated={validated_1} onSubmit={(e) => handleSubmitStep1(e)}>
                    <Col md={12} className="deposit-content text-content">
                        <Row className="deposit-category-header pt-2">
                            <Col md="12">
                                <p className="text-uppercase title" >{locale.t('payment')}</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs="3" className="pr-0">
                                <div className="logo" dangerouslySetInnerHTML={{ __html: depositeFromData.icon }}>
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <p>{getSymbol(currencyWallets)} {depositeFromData.fields.amount.limits[currencyWallets].min} - {getSymbol(currencyWallets)} {depositeFromData.fields.amount.limits[currencyWallets].max}</p>
                                <p>{depositeFromData.name}</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <hr />
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <div className="payment-form">
                                    <Form.Row>
                                        <Form.Group as={Col} xs={3} >
                                            <Form.Text className="">
                                                {locale.t('amount')}
                                            </Form.Text>
                                        </Form.Group>
                                        <Form.Group as={Col} xs={9} md={4} className={errAmount.class}>
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
                                            <Form.Control name="gamingAccountID" as="select" componentclassname="select"  >
                                                {gamingAccountID}
                                            </Form.Control>
                                        </Form.Group>
                                    </Form.Row>
                                    {(depositeFromData.fields.payCardID.options.length < depositeFromData.fields.payCardID.maximumPayCards) &&
                                        <Form.Row>
                                            <Form.Group as={Col} xs={12} className="check-card">
                                                <Form.Check inline disabled={depositeFromData.fields.payCardID.options.length == 0 ? true : false} checked={exitCard ? true : false} label={` ${locale.t("exitsCard")}`} onChange={(e) => handleChange(e)} name="exits_card" type="checkbox" id={`inline-radio-1`} />
                                                <Form.Check inline checked={exitCard ? false : true} label={` ${locale.t("registerNewCard")}`} onChange={(e) => handleChange(e)} name="new_card" type="checkbox" id={`inline-radio-2`} />
                                            </Form.Group>
                                        </Form.Row>
                                    }
                                    {exitCard ? (
                                        <Form.Row>
                                            <Form.Group as={Col} xs={3} >
                                                <Form.Text className="">{locale.t('formDepositText2')}</Form.Text>
                                            </Form.Group>
                                            <Form.Group as={Col} xs={9} >
                                                <Form.Control name="payCardID" as="select" componentclassname="select" value={isCard}  onChange={(e) => handleChange(e)}>
                                                    {payCardOption}
                                                </Form.Control>
                                            </Form.Group>
                                            <Form.Group as={Col} xs={3}>
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
                                    ) : (
                                            <Fragment>
                                                <Form.Row>
                                                    <Form.Group as={Col} xs={3} >
                                                        <Form.Text className="">{locale.t('formDepositText2')}</Form.Text>
                                                    </Form.Group>
                                                    <Form.Group as={Col} xs={9} md={4} className={errCardNumber.class}>
                                                        <div id="credit-card-number-wrapper" className={`newCardInput ${errCardNumber.status ? 'err-card-number' : ''}`}></div>
                                                        <Form.Control.Feedback type="invalid" name="invalid-card-number">{errCardNumber.message}</Form.Control.Feedback>
                                                    </Form.Group>
                                                </Form.Row>
                                                <Form.Row>
                                                    <Form.Group as={Col} xs={3} >
                                                        <Form.Text className="">{locale.t('formDepositText3')}</Form.Text>
                                                    </Form.Group>
                                                    <Form.Group as={Col} xs={9} md={4} className={errCardHolderName.class + ' ' + 'hide-text-mobile'}>
                                                        <Form.Control required type="text" name="txtName" onBlur={(e) => handleBlur(e)} onChange={(e) => handleChange(e)} />
                                                        <Form.Control.Feedback type="invalid">{errCardHolderName.message}</Form.Control.Feedback>
                                                    </Form.Group>
                                                </Form.Row>
                                                <Form.Row>
                                                    <Form.Group as={Col} xs={3}>
                                                        <Form.Text className="">{locale.t('formDepositText4')}</Form.Text>
                                                    </Form.Group>
                                                    <Form.Group as={Col} xs={4} md={2}>
                                                        <Form.Control name="month" as="select" componentclassname="select"  >
                                                            {monthShow}
                                                        </Form.Control>
                                                    </Form.Group>
                                                    <Form.Group as={Col} xs={5} md={2}>
                                                        <Form.Control name="year" as="select" componentclassname="select"  >
                                                            {yearShow}
                                                        </Form.Control>
                                                    </Form.Group>
                                                    <Form.Group as={Col} xs={3} md={1}>
                                                        <Form.Text className="">
                                                            {locale.t('formDepositText5')}
                                                        </Form.Text>
                                                    </Form.Group>
                                                    <Form.Group as={Col} xs={9} md={4} className={errCardCVV.class}>
                                                        <div id="credit-card-cvc-wrapper"></div>
                                                        <Form.Control.Feedback type="invalid">{errCardCVV.message}</Form.Control.Feedback>
                                                        <p className="text-cvv">*{locale.t('cvvDescription')}</p>
                                                    </Form.Group>
                                                </Form.Row>
                                            </Fragment>
                                        )
                                    }
                                    <Script
                                        url={depositeFromData.secureFormScriptUrl}
                                        onCreate={(e) => handleScriptCreate(e)}
                                        onError={(e) => handleScriptError(e)}
                                        onLoad={(e) => handleScriptLoad(e)}
                                    />
                                </div>
                            </Col>
                        </Row>
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