
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import WPService from '../../../services'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import head from 'lodash/head'
import map from 'lodash/map'
import includes from 'lodash/includes'
import LoadBlock from '../Loading/LoadBlock'
import { overrideLink } from '../../../utils'
class AboutUs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            menu: props.menusTabs,
            tabActive: props.tabActive,
            pageData: props.pageData,
            asPath: props.asPath
        }
    }
    setActiveData = (e, item) => {
        let segments = item.url.split( '/' ).filter(function(el) { return el; }).pop();
        window.history.pushState("", "", item.url);
        this.loadBlock.isOpen(true)
        WPService.getPageData(this.props.lang, segments).then((pageData) => {
            this.setState({
                tabActive: item.url,
                asPath: item.url,
                pageData
            }, () => {if (this.loadBlock) this.loadBlock.isOpen(false)})
        })
        e.preventDefault()
    }
    render() {
        let { menu, tabActive, pageData, asPath } = this.state
        let accordions = []
        if(menu.length && tabActive==-1)
            tabActive = overrideLink(head(menu).url)
        else
            tabActive = asPath
        
        map(menu, (item, index) => {
            item.url = overrideLink(item.url)
            let active = includes(item.url, tabActive) ? 'active' : ''
            
            accordions.push(
                <Card key={"accordion" + index}>
                    <a href={item.url} onClick={(e) => this.setActiveData(e, item)}>
                        <Accordion.Toggle
                            as={Card.Header}
                            eventKey={item.url}
                            className={active}
                        >
                            <Row>
                                <Col md={2} xs={2} className="icon" align="center">
                                    <span className="jb-icon icon-default" />
                                </Col>
                                <Col md={10} xs={10} className="title">
                                    {item.title}
                                </Col>
                            </Row>
                        </Accordion.Toggle>
                    </a>
                    <Accordion.Collapse eventKey={item.url}>
                        <Card.Body>
                            <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
            )
        })
        return (
            <Fragment>
                <Container className="about-container">
                    <Row>
                        <Col md={4} xs={12}>
                            <Accordion defaultActiveKey={tabActive}>
                                {accordions}
                            </Accordion>
                        </Col>
                        <Col md={8} xs={12}>
                            <div className="jumbotron jumbotron-fluid">
                                <h2 dangerouslySetInnerHTML={{ __html: pageData.title }}/>
                                <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
                            </div>
                        </Col>
                    </Row>
                </Container>
                <LoadBlock ref={ref => this.loadBlock = ref} />
            </Fragment>
        )
    }
}
export default connect(null, null)(AboutUs);