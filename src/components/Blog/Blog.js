
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { blog } from "../../constants/routes"
import { getAuthorName } from '../../../utils'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Picture from '../Picture'
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
import find from 'lodash/find'
import isEmpty from 'lodash/isEmpty'
import WPService from '../../../services'
const locale = require('react-redux-i18n').I18n
const BLOG = blog

class Blog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            blogCategory: [],
            blog: [],
            categories: [],
            relatedPosts: [],
            search: props.searchText||'',
        }
    }

    getBLog=()=>{
        WPService.getBlogSlug(this.props.lang, this.props.role, this.props.slug).then((res)=>{
            this.setState({
                blog: res,
                blogCategory: head(res.categories).slug,
                relatedPosts: res.relatedPosts,
            })
        })
    }

    getCategories=()=>{
        WPService.getCategories(this.props.lang).then((res)=>{
            if(res){
                this.setState({
                    categories: res
                })
            }
            this.getBLog()
        })
    }

    componentDidMount() {
        this.getCategories();
    }

    _renderAllItem = (blog) => {
        const { categories } = this.state
        let image = {};
        let date = moment(blog.date).format('MMM, DD YYYY')
        let category = find(categories, o => o.slug == head(blog.categories).slug)  
        let goTo = BLOG + '/' + category.slug
        let author = getAuthorName(blog.author)

        image = blog.image
        image.alt = blog.alt;

        return (
            <div className="card-blogs">
                <Col className="col-blog">
                    <h3 dangerouslySetInnerHTML={{ __html: blog.title }}/>
                    <Picture item={image} />
                    <Row className="writer-box">
                        <Col xs={2} md={1}>
                            <LazyLoadImage
                                className="img-writer"
                                src='/static/images/jetbull-icon.jpg'
                                alt={image.alt}
                                effect="blur"
                                visibleByDefault={true}
                            />
                        </Col>
                        <Col xs={10} md={10}>
                            <p className="writer">{locale.t('by')} {author} {date} </p>
                            <p className="writer"><a className="author-by" href={goTo}>{category.name}</a></p>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <div className="blog-content" dangerouslySetInnerHTML={{ __html: blog.content }} />
                        </Col>
                    </Row>
                </Col>
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
                                <Form.Control type="text" name="s" className="text-search" value={search} 
                                    onChange={(e) => this.handleChange(e.target)} />
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
        let { blog, relatedPosts, categories } = this.state

        return (
            <Fragment>
                {
                categories.length 
                    ?
                    <Fragment>
                    {this._renderNavBar()}
                    <Container className="container-custom">
                        <Row>
                            {!isEmpty(blog) &&
                                <Col>
                                    {this._renderAllItem(blog)}
                                </Col> 
                            }
                            {!isEmpty(relatedPosts) && 
                                <Col xs={12} md={4} className="col-articles">
                                    <h3>{locale.t('otherArticles')}</h3>
                                    <OtherAuthors relatedPosts={relatedPosts} />
                                </Col>
                            }
                        </Row>
                    </Container>
                    </Fragment>
                    :null
                }
                
            </Fragment>
        )
    }
}
export default connect(null, null)(Blog);