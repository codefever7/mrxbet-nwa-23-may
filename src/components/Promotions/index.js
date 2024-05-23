import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Picture from '../Picture'
import WPService from '../../../services'
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import {
    getQueryString,
    overrideLink
} from '../../../utils'
const locale = require('react-redux-i18n').I18n

class Promotions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 0,
            pageIndex: 0,
            promotionType: props.tabActive,
            promotions: [],
            per_page: 100,
            page_index: 1
        }
    }
    componentDidMount() {
        const { role, url, segments,lang } = this.props
        const { per_page, page_index } = this.state
        let queryPerPage = getQueryString('per_page')
        let queryPageIndex = getQueryString('page_index')

        if (!isUndefined(queryPerPage) && !isEmpty(queryPerPage)) {
            per_page = queryPerPage;
        }
        if (!isUndefined(queryPageIndex) && !isEmpty(queryPageIndex)) {
            page_index = queryPageIndex;
        }

        let category = 'all'
        if (segments.length > 1) {
            category = segments[1]
        }
        this.getPromotions(lang,role, category, per_page, page_index)

    }
    getPromotions = (lang,role, category, per_page, page_index) => {

        WPService.getPromotions(lang,role, category, 'all', per_page, page_index, 'grids').then((res) => {
            if (res && !isUndefined(res.data)) {
                this.setState({
                    promotions: res.data
                })
            }
        }).catch((err) => {
            console.log('err', err)
        })
    }
    setFirstItem = (res, index) => {
        let image = {};
        image = res.image
        image.alt = res.alt;
        return (
            <Col md={{ span: 12 }} key={index}>
                <div className="card-promotions">
                    <Row>
                        <Picture item={image} />
                        <Col md={{ span: 6 }} xs={6} className="col-promotion">
                            <h3 dangerouslySetInnerHTML={{ __html: res.title }}></h3>
                            <div className="promotion-content" dangerouslySetInnerHTML={{ __html: res.shortDescription }} />
                            <a href={overrideLink(res.link)} className='btn-sport' title={res.title}>
                                {locale.t('buttonReadMore')}
                                <i className="jb-icon icon-default registerpage-arrow-right" />
                            </a>
                        </Col>
                    </Row>
                </div>
            </Col>
        )
    }

    setAllItem = (res, index) => {
        let image = {};
        image = res.image
        image.alt = res.alt;
        return (
            <Col md={{ span: 6 }} sm={12} key={index}>
                <div className="card-promotions">
                    <Row>
                        <Picture item={image} />
                        <Col md={{ span: 6 }} xs={6} className="col-promotion">
                            <h5 dangerouslySetInnerHTML={{ __html: res.title }}></h5>
                            <div className="promotion-content" dangerouslySetInnerHTML={{ __html: res.shortDescription }} />
                            <a href={overrideLink(res.link)} className='btn-sport' title={res.title}>
                                {locale.t('buttonReadMore')}
                                <i className="jb-icon icon-default registerpage-arrow-right" />
                            </a>
                        </Col>
                    </Row>
                </div>
            </Col>
        )
    }

    _renderItem = (promotions) => {
        let listItem = []
        let promotionsTmp = JSON.parse(JSON.stringify(promotions))

        promotionsTmp.map((res, index) => {
            if (index == 0) {
                let first = this.setFirstItem(res, index)

                listItem.push(first)
            } else {
                let all = this.setAllItem(res, index)

                listItem.push(all)
            }
        })

        return (
            <div className="row">
                {listItem}
            </div>
        );
    }

    render() {
        let { promotions } = this.state
        return (
            <Fragment>
                <div className="content-item container container-custom">
                    {!isEmpty(promotions) && this._renderItem(promotions)}
                </div>
            </Fragment>
        )
    }
}

export default connect(null, null)(Promotions);