import { isUndefined } from "lodash";
import React from "react";
import { Fragment } from "react";
import { connect } from "react-redux";

const locale = require("react-redux-i18n").I18n;
class PaymentMethod extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showHoverContainer: false,
            isMobile: false,
        };
    }
    componentDidMount() {
        window.addEventListener("resize", this.resize.bind(this));
        this.resize();
    }
    resize() {
        let mobile = window.innerWidth < 768;
        if (mobile !== this.state.isMobile) {
            this.setState({
                isMobile: mobile,
            });
        }
    }

    onShowHoverContainer(boolean) {
        this.setState({
            showHoverContainer: boolean,
        });
    }

    renderButton = () => {
        const { getPaymentMethodCfg, payment, selectExternalCashier } = this.props;
        let btn = <button className="">{locale.t('withdraw')}</button>
        if (getPaymentMethodCfg !== undefined) {
            btn = <button className="" onClick={() => getPaymentMethodCfg(payment.code)}>{locale.t('withdraw')}</button>
        }
        if (selectExternalCashier !== undefined) {
            btn = <button className="" onClick={() => selectExternalCashier()}>{locale.t('withdraw')}</button>
        }

        return btn;
    }

    renderPaymentRow = () => {
        const {
            methodName,
            processingType,
            transactionLimit,
            redirectURL,
            imagePath,
            payment,
            isMobile,
            getPaymentMethodCfg,
            title = null,
            pagePayment = 'deposit',
        } = this.props;
        let btn = null;
        if (pagePayment === 'deposit') {
            if (getPaymentMethodCfg !== undefined) {
                btn = <a className="btn buttonLogin" onClick={() => getPaymentMethodCfg(payment.code)}>{locale.t('deposit')}</a>
            } else {
                btn = <a className="btn buttonLogin" href={redirectURL}>{locale.t('deposit')}</a>
            }
        } else {
            if (getPaymentMethodCfg !== undefined) {
                btn = <a className="btn buttonWithdraw" onClick={() => getPaymentMethodCfg(payment.code)}>{locale.t('withdraw')}</a>
            } else {
                btn = <a className="btn buttonWithdraw" href={redirectURL}>{locale.t('withdraw')}</a>
            }
        }

        let name = !isUndefined(payment) && payment !== null ? payment.name : title;
        if(name.toLowerCase() == 'coinspaid') name = 'Crypto';
        return (
            <div
                className="payment-method-container-row"
            >
                <div className="Image">
                    <img className="image" src={imagePath} />
                </div>

                {
                    isMobile ? (
                        <div className="TitleDescriptions">
                            <div className="processing">
                                { (pagePayment === 'deposit')? locale.t("processing") : ''}:
                                <span> {processingType}</span>
                            </div>
                            <div className="transaction-limit">
                                {locale.t("transactionLimit")}
                                <span> {transactionLimit}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="TitleDescriptionsWeb">
                            <div className="name">
                                <span> {name}</span>
                            </div>
                            <div className="processing">
                                <span>{ (pagePayment === 'deposit')? locale.t("processing") : '' }</span>
                                <span className="yellow"> {processingType}</span>
                            </div>
                            <div className="transaction-limit">
                                <span>{locale.t("transactionLimit")}</span>
                                <span className="yellow"> {transactionLimit}</span>
                            </div>
                        </div>
                    )
                }

                <div className="LinkButton">
                    {btn}
                </div>
            </div>
        );
    }

    renderPaymentImage = () => {
        const {
            methodName,
            processingType,
            transactionLimit,
            redirectURL,
            imagePath,
            payment,
        } = this.props;

        return (
            <div className="payment-method-container" >
                <div className="Image">
                    <img src={imagePath} />
                </div>
                <div className="ContentHover">
                    <div className="Title">{methodName}</div>
                    <div className="content">
                        <div className="Processing">
                            <span>{(pagePayment === 'deposit')? locale.t("processing") : ''}</span>
                            <span>{processingType}</span>
                        </div>
                        <div className="Limit">
                            <span>{locale.t("transactionLimit")}</span>
                            <span> {transactionLimit}</span>
                        </div>
                    </div>
                    <div className="Button">
                        {this.renderButton()}
                    </div>
                </div>
            </div>
        );
    }
    render() {
        const { type = 'image' } = this.props;

        return type === 'image' ? this.renderPaymentImage() : this.renderPaymentRow();
    }
}
export default connect(null, null)(PaymentMethod);
