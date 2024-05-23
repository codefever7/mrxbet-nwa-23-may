
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import head from 'lodash/head';
import map from 'lodash/map';
import includes from 'lodash/includes';
import GamesRTP from './GamesRTP';
import General from './General';
import WPService from '../../../services'
import LoadBlock from '../Loading/LoadBlock'

class TermsConditions extends Component {
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
        if(!includes(item.url,'terms-conditions')){
            window.location = item.url
        }else{
            let segments = item.url.split( '/' ).filter(function(el) { return el; }).pop();
            // let url = routes.termsConditions + '/' + segments
            window.history.pushState("", "", item.url);
            this.loadBlock.isOpen(true)
                WPService.getPageData(this.props.lang, segments).then((pageData) => {
                    this.setState({
                        tabActive: item.url,
                        asPath: item.url,
                        pageData
                    }, () => {if (this.loadBlock) this.loadBlock.isOpen(false)})
                })
        }
        e.preventDefault()
    }

    render() {
        let { menu, tabActive, pageData, asPath } = this.state
        let accordions = []
        if(tabActive==-1){
            tabActive = head(menu).url
        }else{
            tabActive = asPath
        }
        map(menu, (item, index) => {
            let active = ''
            if (includes(item.url, tabActive)) {
                active = 'active'
            }
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
                                    <span className="jb-icon icon-default"/>
                                </Col>
                                <Col md={10} xs={10} className="title">
                                    <p dangerouslySetInnerHTML={{ __html: item.title }} />
                                </Col>
                            </Row>
                        </Accordion.Toggle>
                    </a>
                    <Accordion.Collapse eventKey={item.url}>
                        <Card.Body>
                            <h1 dangerouslySetInnerHTML={{ __html: item.title }}/>
                            {includes(item.url,'general') ? <General pageData={pageData}/> : null}
                            {includes(item.url,'games-rtp') ? <GamesRTP {...this.props}/> : null}
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
            )
        })

        return (
            <Fragment>
                <Container className="container-custom">
                    <Row>
                        <Col md={3} xs={12}>
                            <Accordion defaultActiveKey={tabActive}>
                                {accordions}
                            </Accordion>
                        </Col>
                        <Col md={9} xs={12}>
                            <div className="jumbotron jumbotron-fluid">
                                <h2 dangerouslySetInnerHTML={{ __html: pageData.title }}/>
                                {includes(tabActive,'general') ? <General pageData={pageData}/> : null}
                                {includes(tabActive,'games-rtp') ? <GamesRTP {...this.props}/> : null}
                            </div>
                        </Col>
                    </Row>
                </Container>
                <LoadBlock ref={ref => this.loadBlock = ref} />
            </Fragment >
        )
    }
}

export default connect(null, null)(TermsConditions);