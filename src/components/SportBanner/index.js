
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Picture from '../Picture'
import isEmpty from 'lodash/isEmpty';
import { sportsBetting, sports } from "../../constants/routes";
import Pagination from "react-js-pagination";
import {
    overrideLink
} from '../../../utils'
const locale = require('react-redux-i18n').I18n
const SPORTS = sports
const SPORTSBETTING = sportsBetting

class SportBanners extends Component {
    constructor(props) {
        super(props);
        this.state = {
            promotions: props.promotions,
            pageIndex: props.promotions.page_index,
            perPage: props.promotions.per_page,
            total: props.promotions.total,
            totalPages: props.promotions.totalPages
        }
    }
    
    _renderItem = (sportBanners) => {
        let listItem = []
        let image = {};

        sportBanners.map((res, index) => {
            let goTo = ''
            let seeMore = res.link

            switch (res.promotionButtonType) {
                case "register":
                case "deposit":
                    goTo = SPORTSBETTING + '?m=' + res.promotionButtonType + '&id=' + res.id
                    break;
                case "custom":
                    goTo = overrideLink(res.promotionButtonLink)
                    break;
                case "bet":
                    goTo = `${SPORTSBETTING}?basePath=${overrideLink(res.promotionButtonLink)}`
                    break;
                default:
                    goTo = `${SPORTSBETTING}`
                    break;
            }
        
            image = res.image
            image.alt = res.alt;
            
            listItem.push(
                <div className="sportBanner" key={index} >
                    <div className="sports">
                        <Row>
                            <Picture item={image} />
                            <Col lg={6} md={8} xs={12} className="card-sports">
                                <div className="reletive-box">
                                    <div className="content-box">
                                        <h2 dangerouslySetInnerHTML={{ __html: res.title }}/>
                                        <div className="sport-content" dangerouslySetInnerHTML={{ __html: res.shortDescription }} />
                                        <div className="d-flex justify-content-start">
                                            {res.promotionButtonAvailable && <a href={goTo} className='btn-sport' title={res.title}>
                                                {res.promotionButtonText}
                                                <i className="jb-icon icon-default registerpage-arrow-right" />
                                            </a>}
                                            <a href={seeMore} className='btn-seemore' title={res.title}>
                                                {locale.t('seeMore')}
                                            </a>
                                        </div>
                                    </div>
                                </div> 
                            </Col>
                        </Row>
                    </div>
                </div>
            )
        })

        return listItem;
    }

    handlePageChange = (pageNumber) => {
        let { perPage } = this.state
        let page = SPORTS + '?per_page=' + perPage + '&page_index=' + pageNumber

        this.setState({
            pageIndex: pageNumber
        });
        
        window.location.assign(page);
    }

    render() {
        let { promotions, pageIndex, perPage, total, totalPages } = this.state
        
        return (
            <Fragment>
                {!isEmpty(promotions.data) && this._renderItem(promotions.data)}
                {totalPages > 1 && <div className="card-pagination">
                    <Pagination
                        hideDisabled
                        firstPageText={"<<"}
                        lastPageText={">>"}
                        prevPageText={"<"}
                        nextPageText={">"}
                        activePage={pageIndex}
                        itemsCountPerPage={perPage}
                        totalItemsCount={total}
                        onChange={pageNumber => this.handlePageChange(pageNumber)}
                    />
                </div>}
            </Fragment>
        )
    }
}

export default connect(null, null)(SportBanners);