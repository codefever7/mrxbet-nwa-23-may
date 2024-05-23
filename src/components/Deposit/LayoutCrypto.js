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
import { getSymbol, getCookie, replaceSpecialCharacters } from '../../../utils';
import { CryptoCurrencies } from '../../../utils/CONSTANTS'
import { SetInnerHtml } from '../set-inner-html';
import checkedIcon from '../../../static/svg-js/circle-checked';
import unCheckedIcon from '../../../static/svg-js/circle-unchecked';
const locale = require('react-redux-i18n').I18n

const CryptoItems = [
    "BTC", "ETH", "USDT", "USDTE", "USDTT", "BNB", "BNB-BSC", "XRP", "TRX", "LTC", "DOGE", "BCH", "ADA", "USDC", "CPD",
    "NEO", "TBTC", "OMNIBTC", "EURS", "WBTC", "XED", "DAI", "MRX", "CPD-BSC", "SNACK", "CSC", "XLM"
]


export default class LayoutCrypto extends Component {
    state = {
        cryptoActive: 'BTC'
    }

    componentDidMount() {
        let elActive = document.getElementsByClassName('collapse show');
        if (!isUndefined(elActive) && elActive.length) {
            window.scrollTo(elActive[0].offsetTop, 0);
        }
        const { setDepositeFromData } = this.props;
        setDepositeFromData('MoneyMatrix_CryptoPay');
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
                    <Form.Row key={key} style={{ visibility: "hidden", maxHeight: "0" }}>
                        <Form.Group as={Col} md={3} >
                            <Form.Text className="">
                                {value.fieldProperties.label}
                            </Form.Text>
                        </Form.Group>
                        <Form.Group as={Col} md={9} className="">
                            {
                                value.fieldProperties.type == 'Lookup'
                                    ?
                                    <Form.Control required id={value.fieldProperties.fieldKey} name={value.fieldKey} as="select" componentclassname="select" value={this.state.cryptoActive}>
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
                    <Form.Row key={key} style={{ visibility: "hidden", maxHeight: "0" }}>
                        <Form.Group as={Col} md={3}>
                            <Form.Text className="">
                                {value.fieldProperties.label}
                            </Form.Text>
                        </Form.Group>
                        <Form.Group as={Col} md={9} className="">
                            {
                                value.fieldProperties.type == 'Lookup'
                                    ?
                                    <Form.Control required id={value.fieldProperties.fieldKey} name={value.fieldKey} as="select" componentclassname="select" value={this.state.cryptoActive}>
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


    changeCrypto = (e) => {
        const { setDepositeFromData } = this.props;
        switch (e) {
            case "BTC":
            case "XRP":
            case "LTC":
            case "USDT":
            case "XLM":
                setDepositeFromData('MoneyMatrix_CryptoPay');
                break;
            default:
                setDepositeFromData('MoneyMatrix_CoinsPaid');
                break;

        }
        this.setState({
            cryptoActive: e
        })
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

    renderCryptoItem = (index) => {
        const { cryptoActive } = this.state;
        const { code, icon, name} = CryptoCurrencies[index];
        return (
            <div className="col-4 col-md-2" key={`cryp${code}${index}`}>
                <div type="button" className={`m-2 button-crypto ${cryptoActive === code ? "crypto_active" : ""}`} onClick={() => { this.changeCrypto(code); }}>
                    <span className="span-crypto">
                        <div className='d-flex'>
                            <div className="paymentButton_gradient">
                                <img src={icon} />
                            </div>
                        </div>
                        <div className="PaymentButton__name">{name}</div>
                    </span>
                </div>
            </div>
        );
    }

    render() {
        const {cryptoActive } = this.state;
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
            payCardIdDefault,
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
                        <Row>
                            <Col>
                                <p >Crypto</p>
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
                        <input type="hidden" name="paymentCryptoCode" value={cryptoActive} />
                        <div className='cryptoContainer'>
                            <Form.Row style={{ paddingBottom: "10px" }}>
                                {Object.keys(CryptoCurrencies).map(this.renderCryptoItem)}
                                
                            </Form.Row>
                        </div>
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
                                                <Form.Control name="payCardID" as="select" componentclassname="select" value={isCard} onChange={(e) => handleChange(e)}>
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