
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { blog } from "../../constants/routes"
import { getPathNameFromUrl, getAuthorName, getQueryString, overrideLink } from '../../../utils'
import Picture from '../Picture'
import Pagination from "react-js-pagination"
import moment from 'moment'
import OtherAuthors from '../OtherAuthors'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Navbar from 'react-bootstrap/Navbar'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import head from 'lodash/head'
import isUndefined from 'lodash/isUndefined'
import find from 'lodash/find'
import isEmpty from 'lodash/isEmpty'
import WPService from '../../../services'

const locale = require('react-redux-i18n').I18n
const BLOG = blog

class BlogCategory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            blogCategory: '',
            blogCategoryName: '',
            categories: [],
            blogs: [],
            relatedPosts: [],
            search: props.searchText||'',
            pageIndex: 1,
            perPage: 9,
            total: 0,
            totalPages: 0
        }
    }

    getBlog=()=>{
        let per_page = 9;
        let page_index = 1;
        if (getQueryString('per_page')!='') {
            per_page = getQueryString('per_page')
        }
        if (getQueryString('page_index')!='') {
            page_index = getQueryString('page_index')
        }
        WPService.getBlog(this.props.lang, this.props.role, this.props.category, per_page, page_index).then((res)=>{
            this.setState({
                blogs: res.data,
                relatedPosts: res.relatedPosts,
                pageIndex: res.page_index,
                perPage: res.per_page,
                total: res.total,
                totalPages: res.totalPages
            })
        })
    }

    componentDidMount() {
        WPService.getCategories(this.props.lang).then((res)=>{
            let path = getPathNameFromUrl().substring(6)
            let categoryTitle = find(res, o => o.slug == path)
            this.setState({
                categories: res,
                blogCategory: !isEmpty(path) ? path : "casino-tips",
                blogCategoryName: !isUndefined(categoryTitle) ? categoryTitle.name : "casino-tips"
            })
            this.getBlog();
        })
    }
    
    setFirstItem = (res, index) => {
        let image = {}
        let goTo = overrideLink(res.link)

        image = res.image
        image.alt = res.alt;

        return (
            <Col md={{ span: 12 }} key={index}>
                <div className="card-promotions">
                    <Row>
                        <Picture item={image} />
                        <Col md={{ span: 8 }} sm={12} className="col-promotion">
                            <h3 dangerouslySetInnerHTML={{ __html: res.title }}/>
                            <div className="promotion-content" dangerouslySetInnerHTML={{ __html: res.shortDescription }} />
                            <a href={goTo} className='btn-sport' title={res.title}>
                                {locale.t('buttonReadMore')}
                                <i className="jb-icon icon-default registerpage-arrow-right" />
                            </a>
                        </Col>
                    </Row>
                </div>
            </Col>
        )
    }
    setSecondItem = (res, index) => {
        let image = {}
        let goTo = overrideLink(res.link)

        image = res.image
        image.alt = res.alt;

        return (
            <Col md={6} sm={6} key={index}>
                <div className="card-promotions">
                    <Row>
                        <Picture item={image} />
                        <Col md={{ span: 8 }} sm={12} className="col-promotion">
                            <h3 dangerouslySetInnerHTML={{ __html: res.titlt }}/>
                            <div className="promotion-content" dangerouslySetInnerHTML={{ __html: res.shortDescription }} />
                            <a href={goTo} className='btn-sport' title={res.title}>
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
        const { categories, relatedPosts } = this.state
        let image = {};
        let date = moment(res.date).format('MMM, DD YYYY')
        let category = head(res.categories).slug
        let goTo = overrideLink(res.link)
        let goToCategory = BLOG + '/' + category
        let categoryTmp = find(categories, o => o.slug == category)
        let author = getAuthorName(res.author)
        let colSpan = !isEmpty(relatedPosts) ? 6 : 4

        image = res.image
        image.alt = res.alt;
        
        return (
            <Col md={colSpan} sm={6} key={index}>
                <div className="card-blogs">
                    <Row>
                        <h2 dangerouslySetInnerHTML={{ __html: res.titlt }}/>
                        <a href={goTo}>
                            <Picture item={image} />
                        </a>
                        <Col className="col-blog">
                            <Row>
                                <Col xs={2} sm={3} md={3} lg={2}>
                                    <LazyLoadImage
                                        className="img-writer"
                                        src='/static/images/EB-icon.png'
                                        alt={image.alt}
                                        effect="blur"
                                        visibleByDefault={true}
                                    />
                                </Col>
                                <Col xs={10} sm={9} md={9} lg={10}>
                                    <p className="writer">{locale.t('by')} {author} {date}</p>
                                    <p className="writer"><a href={goToCategory}>{categoryTmp.name}</a></p>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <div className="blog-content" dangerouslySetInnerHTML={{ __html: res.content }} />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
            </Col>
        )
    }
    _renderItem = (blogs, relatedPosts) => {
        let listTopItem = []
        let listItem = []
        let blogsTmp = JSON.parse(JSON.stringify(blogs))

        blogsTmp.map((res, index) => {
            if (index == 0) {
                let first = this.setFirstItem(res, index)
                listTopItem.push(first)
            } else if (index > 0 && index < 3) {
                let second = this.setSecondItem(res, index)
                listTopItem.push(second)
            }
            else {
                let third = this.setAllItem(res, index)
                listItem.push(third)
            }
        })

        return (
            <Container className="container-custom">
                <div className="row">
                    {listTopItem}
                </div>

                <div className="row">
                    <Col>
                        <div className="row">
                            {listItem}
                        </div>
                    </Col>

                    {!isEmpty(relatedPosts) &&
                        <Col sm={12} md={4} className="">
                            <h3>{locale.t('otherArticles')}</h3>
                            <OtherAuthors relatedPosts={relatedPosts} />
                        </Col>
                    }
                </div>
            </Container>
        )
    }
    _renderNavBar = () => {
        let { search} = this.state
        return (
            <Navbar variant="pills" bg="dark">
                <Container className="container-custom">
                    <Col>

                    </Col>
                    <Col sm={12} md={6} lg={3} className="d-flex justify-content-md-end">
                        <Form inline onSubmit={(event) => this.handleSubmit(event)}>
                            <InputGroup>
                                <Form.Control type="text" name="s" className="text-search" value={search} onChange={(e) => this.handleChange(e.target)} />
                                <InputGroup.Prepend>
                                    <Button className="btn btn-search" onClick={this.handleSearch}>
                                        <i className="jb-icon icon-default search" />
                                    </Button>
                                </InputGroup.Prepend>
                            </InputGroup>
                        </Form>
                    </Col>
                </Container>
            </Navbar>
        )
    }
    handlePageChange = (pageNumber) => {
        let { perPage } = this.state
        let page = BLOG + '?per_page=' + perPage + '&page_index=' + pageNumber

        this.setState({
            pageIndex: pageNumber
        });
        window.location.assign(page);
    }
    handleSearch = () => {
        let { search } = this.state
        let page = BLOG + '?s=' + search

        window.location.assign(page);
    }
    handleChange = (target) => {
        let search = target.value

        this.setState({
            search
        })
    }
    handleSubmit = (event) => {
        let { search } = this.state
        let page = BLOG + '?s=' + search
        window.location.assign(page);
        event.preventDefault();
    }
    render() {
        let { blogs, relatedPosts, categories, pageIndex, perPage, total, totalPages } = this.state

        return (
            <Fragment>
                {!isEmpty(categories) && this._renderNavBar()}
                {!isEmpty(blogs) && this._renderItem(blogs, relatedPosts)}
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
export default connect(null, null)(BlogCategory);