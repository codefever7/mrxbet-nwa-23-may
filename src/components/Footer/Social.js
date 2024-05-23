
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import isEmpty from 'lodash/isEmpty'
import isArray from 'lodash/isArray'
import isUndefined from 'lodash/isUndefined'
import { LazyLoadImage } from 'react-lazy-load-image-component'

class Social extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
        }
    }
    _renderItem = (socialLinks) => {
        let data = []

        if (!isUndefined(socialLinks) && isArray(socialLinks)) {
            socialLinks.forEach((res, index) => {
                data.push(
                    <Col md="auto" xs="auto" key={index}>
                        {
                            isEmpty(res.href) ?
                            <LazyLoadImage
                                effect="blur"
                                visibleByDefault={true}
                                className="header-img"
                                src={res.src}
                                alt={res.title}
                            />
                            :
                            <a href={res.href}>
                                <LazyLoadImage
                                    effect="blur"
                                    visibleByDefault={true}
                                    className="header-img"
                                    src={res.src}
                                    alt={res.title}
                                />
                            </a>
                        }
                    </Col >
                )
            })
        }
        return data;
    }
    _renderMenusItem = (menus, menuActive) => {
        let data = []

        if (!isUndefined(menus) && menus.length) {
            menus && menus.length ? menus.map((menu, i) => {
                data.push (
                    <Col md="auto" xs="6" key={`footer-${menu.id}`} ref={i + 1}>
                        <a href={menu.url} className={menu.url == menuActive.url?'active':''}>{menu.title}</a>
                    </Col>
                )
            })
            :
            null
        }
        return data;
    }
    render() {
        const { footerData } = this.props
        return (
            <div className="social">
                <Container className="container-custom">
                    <Row className="d-flex justify-content-center">
                        <Col lg="4" sm="12" className="box-icon align-self-center">
                            <Row className="d-flex justify-content-lg-round justify-content-center">
                                {this._renderItem(footerData.socialLinks)}  
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}
export default connect(null, null)(Social);