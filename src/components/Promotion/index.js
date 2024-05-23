import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Picture from '../Picture'
import { sportsBetting } from "../../constants/routes";
import { REGISTERMODAL, DEPOSITMODAL } from "../../constants/types";
import WPService from '../../../services'

import isEmpty from 'lodash/isEmpty';
import filter from 'lodash/filter';
import map from 'lodash/map';
import {
    overrideLink
} from '../../../utils'
const locale = require('react-redux-i18n').I18n

class Promotion extends Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 0,
            pageIndex: 0,
            pageData: '',
            promotions: []
        }
    }

    componentDidMount() {
        const { role, slug, lang } = this.props
        const { promotions } = this.state
        this.getPromotion(role, slug, lang)
    }
    getPromotion = (role, slug, lang) => {
        WPService.getPromotion(lang, role, slug).then((res) => {
            if (res) {
                this.setState({
                    pageData: res,
                    promotions: res.relatedPromotions
                })
            }
        }).catch((err) => {
            console.log('err : promotion detail =>', err)
        })
    }
    handleToggle = (data) => {
        const { onSetRegisterModal, onSetDepositModal } = this.props
        if (data.promotionButtonType == 'register') {
            const params = {
                status: true,
                id: data.id,
            }
            onSetRegisterModal(params);
        } else if (data.promotionButtonType == 'deposit') {
            const params = {
                status: true,
                id: data.id,
            }
            onSetDepositModal(params);
        }
    }

    _renderOtherPromotions = (promotions) => {
        let layout = []
        if (promotions.length) {
            map(promotions, (item, index) => {
                let image = {}
                image = item.image
                image.alt = item.alt
                let sourcesTmp = filter(JSON.parse(JSON.stringify(image.sources)), function (o) {
                    return o.type != 'desktop' && o.type != 'tablet'
                });
                image.sources = sourcesTmp
                layout.push(
                    <div key={index} className="other">
                        <Row>
                            <Picture item={image} />
                            <Col md={8} className="card-other">
                                <h2 dangerouslySetInnerHTML={{ __html: item.title }}/>
                                <div className="other-content" dangerouslySetInnerHTML={{ __html: item.shortDescription }} />
                                <a href={overrideLink(item.link)} className='btn-join' title={item.title}>
                                    {locale.t('buttonReadMore')}
                                    <i className="jb-icon icon-default registerpage-arrow-right" />
                                </a>
                            </Col>
                        </Row>
                    </div>
                )
            })
        }
        return layout;
    }

    _renderContent = (pageData, promotions) => {
        let image = {}
        let button = ''

        switch (pageData.promotionButtonType) {
            case "register":
                button = !this.props.session.isLogin?
                    <a title={pageData.promotionButtonText} className='btn-join' onClick={() => { this.handleToggle(pageData) }}>
                        {pageData.promotionButtonText}
                        <i className="jb-icon icon-default registerpage-arrow-right" />
                    </a>:null
                break;
            case "deposit":
                button = <a title={pageData.promotionButtonText} className='btn-join' onClick={() => { this.handleToggle(pageData) }}>
                    {pageData.promotionButtonText}
                    <i className="jb-icon icon-default registerpage-arrow-right" />
                </a>
                break;
            case "custom":
                button = <a href={overrideLink(pageData.promotionButtonLink)} className='btn-join' title={pageData.promotionButtonText}>
                    {pageData.promotionButtonText}
                    <i className="jb-icon icon-default registerpage-arrow-right" />
                </a>
                break;
            case "bet":
                let goTo = `${sportsBetting}?basePath=${overrideLink(pageData.promotionButtonLink)}`
                button = <a href={goTo} className='btn-join' title={pageData.promotionButtonText}>
                    {pageData.promotionButtonText}
                    <i className="jb-icon icon-default registerpage-arrow-right" />
                </a>
                break;
        }

        image = pageData.image
        image.alt = pageData.alt

        return (
            <div className="container container-detail container-custom">
                <Row>
                    <Col>
                        <div className="card-promotions">
                            <Row>
                                <Picture item={image} />
                                <Col md={{ span: 8 }} xs={12} className="col-promotion">
                                    <h5 dangerouslySetInnerHTML={{ __html: pageData.title }}></h5>
                                    <div className="promotion-content" dangerouslySetInnerHTML={{ __html: pageData.shortDescription }} />
                                    {pageData.promotionButtonAvailable && button}
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col md={8} sm={12} className="main-promotions">
                        <Row className="row-detail">
                            <Col>
                                {/* <h3 className="title-middle" dangerouslySetInnerHTML={{ __html: pageData.title }}/> */}
                                <div className="detail-content" dangerouslySetInnerHTML={{ __html: pageData.description }} />
                                {/* {pageData.promotionButtonAvailable && button} */}
                            </Col>
                        </Row>
                        <Row className="row-terms">
                            <Col>
                                <div className="terms-content" dangerouslySetInnerHTML={{ __html: pageData.termsAndConditions }} />
                            </Col>
                        </Row>
                    </Col>
                    <Col md={4} sm={12} className="other-promotions">
                        <h3 className="title-middle">{locale.t('otherPromotions')}</h3>
                        {this._renderOtherPromotions(promotions)}
                    </Col>
                </Row>
            </div>
        )
    }

    render() {
        let { pageData, promotions } = this.state

        return (
            <Fragment>
                {!isEmpty(pageData) && this._renderContent(pageData, promotions)}
            </Fragment>
        )
    }
}
const mapStateToProps = (state) => ({
    session: state.sessionState
})
const mapDispatchToProps = (dispatch) => ({
    onSetRegisterModal: (active) => dispatch({ type: REGISTERMODAL, active }),
    onSetDepositModal: (active) => dispatch({ type: DEPOSITMODAL, active })
});

export default connect(mapStateToProps, mapDispatchToProps)(Promotion);