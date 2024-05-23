
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { blog } from "../../constants/routes"
import { getAuthorName, getQueryString, overrideLink } from '../../../utils'
import Picture from '../Picture'
import Pagination from "react-js-pagination"
import moment from 'moment'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Navbar from 'react-bootstrap/Navbar'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import isEmpty from 'lodash/isEmpty'
import filter from 'lodash/filter'
import head from 'lodash/head'
import find from 'lodash/find'
import toNumber from 'lodash/toNumber'
import WPService from '../../../services'
const locale = require('react-redux-i18n').I18n
const BLOG = blog

class BlogSearch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            categories: [],
            blogs: [],
            search: '',
            pageIndex: 1,
            perPage: 9,
            total: 0,
            totalPages: 0,
        }
    }

    getBlogSearch=()=>{
        let per_page = 9;
        let page_index = 1;
        let searchText = '';
        if (getQueryString('per_page')!='') {
            per_page = getQueryString('per_page')
        }
        if (getQueryString('page_index')!='') {
            page_index = getQueryString('page_index')
        }
        if (getQueryString('s')!='') {
            searchText = getQueryString('s')
        }
        WPService.getBlogSearch(this.props.lang, this.props.role, searchText, per_page, page_index).then((res)=>{
            this.setState({
                blogs: res.data,
                search: searchText,
                pageIndex: res.page_index,
                perPage: res.per_page,
                total: res.total,
                totalPages: res.totalPages
            })
        })
    }

    componentDidMount() {
        WPService.getCategories(this.props.lang).then((res)=>{
            this.setState({
                categories: res
            })
            this.getBlogSearch();
        })
    }

    setAllItem = (res, index) => {
        const { categories } = this.state
        let image = {};
        let date = moment(res.date).format('MMM, DD YYYY')
        let category = head(res.categories).slug
        let goTo = overrideLink(res.link)
        let goToCategory = BLOG + '/' + category
        let categoryTmp = find(categories, o => o.slug == category)
        let author = getAuthorName(res.author)
        let colSpan = 4

        image = res.image
        image.alt = res.alt;

        let sourcesTmp = filter(JSON.parse(JSON.stringify(image.sources)), function (o) {
            return o.type != 'large' && o.type != 'medium' && o.type != 'desktop'
        });

        image.sources = sourcesTmp

        return (
            <Col md={colSpan} sm={12} key={index}>
                <div className="card-blogs">
                    <Row>
                        <h2 dangerouslySetInnerHTML={{ __html: res.title }}/>
                        <a href={goTo}>
                            <Picture item={image} />
                        </a>
                        <Col className="col-blog">
                            <Row>
                                <Col xs={2} md={2}>
                                    <LazyLoadImage
                                        className="img-writer"
                                        src='/static/images/EB-icon.png'
                                        alt={image.alt}
                                        effect="blur"
                                        visibleByDefault={true}
                                    />
                                </Col>
                                <Col xs={10} md={10}>
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
    _renderItem = (blogs) => {
        let listItem = []
        let blogsTmp = JSON.parse(JSON.stringify(blogs))

        blogsTmp.map((res, index) => {
            let all = this.setAllItem(res, index)

            listItem.push(all)
        })

        return (
            <div className="row">
                {listItem}
            </div>
        );
    }
    _renderNotFound = () => {
        const { searchText } = this.props

        return (
            <div className="not-found">
                <p>{locale.t('nothingMated')}</p>
                <Form inline>
                    <InputGroup>
                        <Form.Control type="text" defaultValue={searchText}/>
                    </InputGroup>
                </Form>
            </div>
        )
    }
    _renderNavBar = () => {
        let { search } = this.state

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
        );
    }
    handlePageChange = (pageNumber) => {
        let { perPage, search } = this.state
        let page = BLOG + '?s=' + search + '&per_page=' + perPage + '&page_index=' + pageNumber
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
        let { blogs, categories, pageIndex, perPage, total, totalPages } = this.state

        return (
            <Fragment>
                {!isEmpty(categories) && this._renderNavBar(categories)}
                <Container className="container-custom">
                    <Row>
                        <Col>
                            {!isEmpty(blogs) ? this._renderItem(blogs) : this._renderNotFound()}
                        </Col>
                    </Row>
                </Container>
                {totalPages > 1 && <div className="card-pagination">
                    <Pagination
                        hideDisabled
                        firstPageText={"<<"}
                        lastPageText={">>"}
                        prevPageText={"<"}
                        nextPageText={">"}
                        activePage={toNumber(pageIndex)}
                        itemsCountPerPage={toNumber(perPage)}
                        totalItemsCount={toNumber(total)}
                        onChange={pageNumber => this.handlePageChange(pageNumber)}
                    />
                </div>}
            </Fragment>
        )
    }
}
export default connect(null, null)(BlogSearch);