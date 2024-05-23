
import React, { Component } from 'react';
import { connect } from 'react-redux';
import isUndefined from 'lodash/isUndefined'
import isBoolean from 'lodash/isBoolean'
import isEmpty from 'lodash/isEmpty'
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Newsletter from './Newsletter'
import Social from './Social'
import Menu from './Menu'
import isArray from 'lodash/isArray';
import WPService from '../../../services'
import '../../../styles/components/_footer.scss'

const PaymentIcon = ['visa.png', 'mastercard.png', 'bitcoin.png', 'tether.png', 'ethereum.png', 'cashlib.png', 'astropay.png', 'cartasi.png', 'postepay.png', 'flexepin.png'];

class Footer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            licence: [],
            paymentMethods: [],
            vendors: [],
            copyright: '',
            notData: false,
            footerData: []
        }
    }

    getFooterData = () => {
        WPService.getFooterData(this.props.lang).then((res) => {
            if (res && !isUndefined(res)) {
                this.setState({
                    footerData: res,
                    licence: !isUndefined(res.externalLogos) && !isUndefined(res.externalLogos.externalLicence) ? res.externalLogos.externalLicence : [],
                    paymentMethods: !isUndefined(res.externalLogos) && !isUndefined(res.externalLogos.externalPaymentMethods) ? res.externalLogos.externalPaymentMethods : [],
                    vendors: !isUndefined(res.externalLogos) && !isUndefined(res.externalLogos.externalVendors) ? res.externalLogos.externalVendors : [],
                    copyright: !isUndefined(res.copyright) ? res.copyright : '',
                })
            } else {
                this.setState({
                    notData: true
                })
            }
        })
    }

    componentDidMount() {
        this.getFooterData();
    }

    renderPayments = () => {
        const { languagesActive } = this.props;
        const theme = localStorage.getItem('theme-html') || 'dark';

        const item = [];
        for (let i = 0; i < PaymentIcon.length; i++) {
            const name = PaymentIcon[i];
            if (languagesActive !== 'it' && (name === 'cartasi.png' || name === 'postepay.png')) { continue; }
            const pathIcon = `/static/images/footer-providers/${theme}/${name}`;
            item.push(
                <li className='item-2'>
                    <img
                        className="header-img"
                        src={pathIcon}
                        alt={name}
                    />
                </li>
            )
        }

        return item;
    }

    _renderItem = (d, cla) => {
        let data = []
        if (!isUndefined(d) && isArray(d)) {
            d.forEach((res, index) => {
                data.push(this._layoutItem(cla, res, index))
            })
        }

        return data;
    }
    _layoutItem = (className, res, i) => {
        const { languagesActive } = this.props;
        if (languagesActive !== 'it' && (res.title === 'cartasi' || res.title === 'postepay')) { return null }
        if (!isUndefined(res.src) && !isBoolean(res.src) && !isEmpty(res.src)) {

            return <li className={className} key={i}>
                {
                    isEmpty(res.href) ?
                        <img
                            className="header-img"
                            src={res.src}
                            alt={res.title}
                        />
                        :
                        <a href={res.href} target="_blank" rel="noreferrer">
                            <img
                                className="header-img"
                                src={res.src}
                                alt={res.title}
                            />
                        </a>
                }
            </li>
        }
    }

    render() {
        const { isConnected } = this.props;
        const { licence, paymentMethods, vendors, copyright, footerData } = this.state
        return (
            <footer className="footer">
                {/* <Newsletter {...this.props} footerData={footerData} /> */}
                {/* <Social {...this.props} footerData={footerData}/> */}
                <Menu {...this.props} />
                <div className="footer-end">
                    <Container className="container-custom">
                        <Row className="justify-content-center">
                            <Col xs={12} className="justify-content-center flex">
                                <Col xs={12} className="">
                                    <ul className="list-item-2">
                                        {isConnected && this.renderPayments()}
                                    </ul>
                                    {/* <ul className="list-item-2">
                                        {this._renderItem(vendors, 'item-2')}
                                    </ul> */}
                                </Col>
                            </Col>
                        </Row>
                        <Row className="justify-content-center">
                            <Col xs={12}>
                                <ul className="list-item-1 justify-content-center">
                                    {this._renderItem(licence, 'item-1')}
                                </ul>
                            </Col>
                        </Row>

                        <div className="copyright">
                            <div className={`CopyrightText`}>
                                <div dangerouslySetInnerHTML={{ __html: copyright }} />
                            </div>
                        </div>
                    </Container>
                </div>
            </footer>
        )
    }
}

const mapStateToProps = (state) => ({
    isConnected: state.EM.isConnected,
    i18n: state.i18n,
    session: state.sessionState,
});

export default connect(
    mapStateToProps,
    null
)(Footer);