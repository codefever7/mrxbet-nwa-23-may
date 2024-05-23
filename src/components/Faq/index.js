
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Container from 'react-bootstrap/Container'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button'
import * as routes from "../../constants/routes"
import isNull from 'lodash/isNull';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import upperCase from 'lodash/upperCase';
import find from 'lodash/find';
import head from 'lodash/head';
import isUndefined from 'lodash/isUndefined'
import Pagination from "react-js-pagination";
import { getQueryString, overrideLink } from '../../../utils'
import WPService from '../../../services'
import LoadBlock from '../Loading/LoadBlock'
const locale = require('react-redux-i18n').I18n

class Faq extends Component {
    constructor(props) {
        super(props);
        this.state = {
            categories: [],
            data: [],
            orderby: 'menu_order',
            order: 'asc',
            search: '',
            slug: '',
            pageIndex: 1,
            perPage: 10,
            total: 0,
            totalPages: 0,
            orderbyOptions: [
                {
                    "title": locale.t('sortByDefault'),
                    "orderby": 'menu_order',
                    "order": 'asc',
                },
                {
                    "title": locale.t('sortAtoZ'),
                    "orderby": 'title',
                    "order": 'asc',
                },
                {
                    "title": locale.t('sortByLastUpdated'),
                    "orderby": 'id',
                    "order": 'desc',
                }
            ],
            tabActive: '',
            isLoading: true,
            showContent: "No",
            content: ""
        }
    }
    
    UNSAFE_componentWillReceiveProps(nextProps) {
        this.setState({
            orderbyOptions: [
                {
                    "title": locale.t('sortByDefault'),
                    "orderby": 'menu_order',
                    "order": 'asc',
                },
                {
                    "title": locale.t('sortAtoZ'),
                    "orderby": 'title',
                    "order": 'asc',
                },
                {
                    "title": locale.t('sortByLastUpdated'),
                    "orderby": 'id',
                    "order": 'desc',
                }
            ]
        })
    }
    componentDidMount() {
        let per_page = 10;
        let page_index = 1;
        let orderby = 'menu_order'
        let order = 'asc'

        this.loadBlock.isOpen(true)
        if (getQueryString('per_page') != '') {
            per_page = getQueryString('per_page')
        }
        if (getQueryString('page_index')!='') {
            page_index = getQueryString('page_index');
        }
        if (getQueryString('orderby')!='') {
            orderby = getQueryString('orderby');
        }
        if (getQueryString('order')!='') {
            order = getQueryString('order');
        }

        if (!isEmpty(getQueryString('s'))) {
            let searchText = getQueryString('s')
            WPService.getFAQSearch(this.props.lang, searchText, per_page, page_index).then((res) => {
                if (res.data.length) {
                    this.setState({
                        categories: res.categories,
                        data: res.data,
                        orderby: !isNull(res.orderby) ? res.orderby : 'menu_order',
                        order: !isNull(res.order) ? res.order : 'asc',
                        search: res.searchText || '',
                        slug: res.slug,
                        pageIndex: res.page_index,
                        perPage: res.per_page,
                        total: res.total,
                        totalPages: res.totalPages,
                        isLoading: false
                    }, () => this.loadBlock.isOpen(false))
                }
            })
        } else {
            WPService.getFAQ(this.props.lang, this.props.tabActive, per_page, page_index, orderby, order, this.props.slug).then((res) => {
                let findActive = false
                let tabActive = false
                let showContent = 'No'
                let content = ''
                    if (res.data.length) {
                        tabActive = head(res.data).category.slug
                        findActive = find(res.categories , { slug: head(res.data).category.slug })
                        if(findActive){
                            showContent = findActive && !isUndefined(findActive.showContent) && findActive.showContent == "Yes" ? "Yes" : "No"
                            content = findActive && !isUndefined(findActive.showContent) && !isUndefined(findActive.content) && findActive.showContent == "Yes" ? findActive.content : ""
                        }
                    }else{
                        if(this.props.tabActive==-1){
                            tabActive = head(res.categories).slug
                            findActive = head(res.categories)
                        }else{
                            tabActive = this.props.tabActive
                            findActive = find(res.categories , { slug: this.props.tabActive })
                        }
                        showContent = findActive && !isUndefined(findActive.showContent) && findActive.showContent == "Yes" ? "Yes" : "No"
                        content = findActive && !isUndefined(findActive.showContent) && !isUndefined(findActive.content) && findActive.showContent == "Yes" ? findActive.content : ""
                    }
                    this.setState({
                        categories: res.categories,
                        data: res.data,
                        orderby: !isNull(res.orderby) ? res.orderby : 'menu_order',
                        order: !isNull(res.order) ? res.order : 'asc',
                        search: res.searchText || '',
                        slug: res.slug,
                        pageIndex: res.page_index,
                        perPage: res.per_page,
                        total: res.total,
                        totalPages: res.totalPages,
                        tabActive,
                        isLoading: false,
                        showContent,
                        content
                    }, () => this.loadBlock.isOpen(false))
                
            })
        }
    }
    handleChange = (target) => {
        let search = target.value
        this.setState({ search })
    }
    handleChangeSort = (target) => {
        const { tabActive } = this.props
        const { search, orderbyOptions } = this.state
        let item = find(orderbyOptions, (o, key) => key == target.value)
        let page = routes.faq

        if (tabActive != -1 && tabActive != 'search') {
            page = page + '/' + tabActive
        } 
        if (!isEmpty(search)) {
            page = page + '?s=' + search + '&orderby=' + item.orderby + '&order=' + item.order
        } else {
            page = page + '?orderby=' + item.orderby + '&order=' + item.order
        }

        window.location.assign(page);
    }
    handleSearch = () => {
        let { search } = this.state
        let page = routes.faq + '?s=' + search

        window.location.assign(page);
    }
    handlePageChange = (pageNumber) => {
        const { tabActive } = this.props
        let { perPage } = this.state
        let page = routes.faq + '/' + tabActive + '?per_page=' + perPage + '&page_index=' + pageNumber

        if (tabActive == -1) {
            page = routes.faq  + '?per_page=' + perPage + '&page_index=' + pageNumber
        }

        this.setState({
            pageIndex: pageNumber
        });
        window.location.assign(page);
    }
    _renderCategories = (categories) => {
        let listItem = []

        map(categories, (item, index) => {
            const { tabActive } = this.state
            let goTo = routes.faq + '/' + item.slug

            if (tabActive != -1) {
                listItem.push(
                    <a key={index} href={goTo} className={item.slug == tabActive ? "nav-link active" : "nav-link"}>
                        {item.title}
                        {item.slug == tabActive ? <span className="jb-icon casino-arrow-right"/> : null}
                    </a>
                )
            } else {
                listItem.push(
                    <a key={index} href={goTo} className={item.slug == head(categories).slug ? "nav-link active" : "nav-link"}>
                        {item.title}
                        {item.slug == head(categories).slug ? <span className="jb-icon casino-arrow-right" /> : null}
                    </a>
                )
            } 
        })

        return (
            <nav className="nav-categories nav flex-column">
                <h2>{upperCase("categories")}</h2>
                {listItem}
            </nav>
        )
    }
    _renderContents = (data) => {
        let listItem = []

        map(data, (item, index) => {
            listItem.push(
                <a key={index} href={overrideLink(item.link)}>
                    <p>
                        <span className="jb-icon faq"/>
                        <span dangerouslySetInnerHTML={{ __html: item.title }} />
                    </p>
                </a>
            )
        })

        return listItem
    }
    _renderFAQDetail = (faq) => {
        return (
            <div dangerouslySetInnerHTML={{ __html: faq.content }} />
        )
    }
    _renderSort = () => {
        let { orderby, orderbyOptions } = this.state
        let listItem = []

        map(orderbyOptions, (item, index) => {
            listItem.push(
                <option key={"dropdown-" + index} value={index}>
                    {item.title}
                </option>
            )
        })

        return (
            <Fragment>
                <select value={orderby} className="custom-select" onChange={e => this.handleChangeSort(e.target)}>
                    {listItem}
                </select>
                <i className="jb-icon registerpage-dropdown-3"></i>
            </Fragment>
        )
    }
    _renderNotFound = () => {
        return (
            <div className="not-found">
                <p>{locale.t('nothingMated')}</p>
            </div>
        )
    }
    handleSubmit = (event) => {
        let { search } = this.state
        let page = BLOG + '?s=' + search

        window.location.assign(page);
        event.preventDefault();
    }
    render() {
        const { tabActive } = this.props
        let { search, categories, data, slug, pageIndex, perPage, total, totalPages, isLoading,showContent, content } = this.state
        let faq = head(data)
        return (
            <Container className="contact-container container-custom">
                {!isLoading ? <Row>
                    <Col md={3} className='order-2 order-md-1'>
                        {/* <Form inline onSubmit={(event) => this.handleSubmit(event)}>
                            <InputGroup>
                                <Form.Control type="text" name="s" className="text-search" value={search}
                                    placeholder={locale.t('search')} onChange={(e) => this.handleChange(e.target)}/>
                                <InputGroup.Prepend>
                                    <Button className="btn btn-search" onClick={this.handleSearch}>
                                        <span className="jb-icon icon-default search" />
                                    </Button>
                                </InputGroup.Prepend>
                            </InputGroup>
                        </Form> */}
                        {this._renderCategories(categories)}
                    </Col>
                    <Col md={9} className='order-1 order-md-2'>
                        {isEmpty(slug) ?
                            <div className="jumbotron jumbotron-fluid">
                                <Row>
                                    <Col md={8} sm={12}>
                                        {/* <h2>{tabActive != -1 ? upperCase(tabActive) : upperCase(head(categories).title)}</h2> */}
                                    </Col>
                                        {tabActive != 'search' && showContent == "No" ? 
                                            <Col md={4} sm={12} className='sort-by'>
                                                {this._renderSort()}
                                            </Col>
                                        : null}
                                </Row>
                                <Row>
                                    <Col className="list-faq">
                                        {showContent == "Yes" ? <div dangerouslySetInnerHTML={{ __html: content }} /> : !isEmpty(data) ? this._renderContents(data) : this._renderNotFound()}
                                    </Col>
                                </Row>
                                {totalPages > 1 && showContent == "No" && <div className="card-pagination">
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
                            </div>
                        :
                            <div className="jumbotron jumbotron-fluid">
                               
                                <Row>
                                    <Col>
                                    {showContent == "No" ?<h2 dangerouslySetInnerHTML={{ __html: !_.isUndefined(faq) && !_.isUndefined(faq.title) ? faq.title : "" }} /> :null}
                                    </Col>
                                </Row>
                               
                                <Row>
                                    <Col className="col-content">
                                        {showContent == "Yes" ? <div dangerouslySetInnerHTML={{ __html: content }} /> : !isUndefined(faq) ? this._renderFAQDetail(faq) : this._renderNotFound()}
                                    </Col>
                                </Row>
                            </div>
                        }
                    </Col>
                </Row>
                : null}
                <LoadBlock ref={ref => this.loadBlock = ref} />
            </Container>
        )
    }
}
const mapStateToProps = (state) => ({
    isConnected: state.EM.isConnected,
    session: state.sessionState,
});
export default connect(mapStateToProps, null)(Faq);