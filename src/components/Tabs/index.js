
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import head from 'lodash/head';
import find from 'lodash/find';
import map from 'lodash/map';
import last from 'lodash/last';
import includes from 'lodash/includes';
import GamesRTP from './GamesRTP';
import GamesFPP from './GamesFPP';
import GamesBonus from './GamesBonus';
import General from './General';
import WPService from '../../../services'
import LoadBlock from '../Loading/LoadBlock'
import { overrideLink } from '../../../utils'
import { isUndefined } from 'lodash';
const config = require(`../../../config`).config;

class Tabs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            menu: [],
            tabActive: last(props.segments)||-1,
            pageData: [],
            asPath: props.asPath
        }
    }
    getMenusTabs = () => {
        WPService.getMenus(this.props.lang, this.props.firstSegment + config.menuKey).then((res) => {
            let item = {}
            if(this.state.tabActive==-1 || this.props.segments.length==1){
                item = head(res)
            }else{
                item = find(res,o=>includes(o.url, this.state.tabActive))
            }
            this.setState({
                menu: res
            })
            this.fetchData(item)
        })
    }
    componentDidMount() {
        this.getMenusTabs()
    }

    fetchData=(item, isClick=false)=>{
        if(!isUndefined(item) && !isUndefined(item.url)){
            let firstSegment = window.location.pathname.split( '/' ).filter(function(el) { return el; }).shift();
            if(!includes(item.url,firstSegment)){
                window.location = item.url
            }else{
                if(isClick) window.history.pushState("", "", item.url);
                this.loadBlock.isOpen(true)
                    WPService.getPageDataContent(this.props.lang, item.object_id).then((pageData) => {
                        this.setState({
                            tabActive: item.url,
                            asPath: item.url,
                            pageData
                        }, () => {if (this.loadBlock) this.loadBlock.isOpen(false)})
                    })
            }
        }
    }

    setActiveData = (e, item) => {
        this.fetchData(item, true)
        e.preventDefault()
    }

    render() {
        let { menu, pageData, asPath, tabActive } = this.state
        let accordions = []
        if(menu.length) {
            // if(tabActive==-1 || this.props.segments.length==1){
            //     tabActive = overrideLink(head(menu).url)
            // }
            map(menu, (item, index) => {
                let active = ''
                item.url = overrideLink(item.url)
                if (includes(item.url, tabActive)) {
                    active = 'active'
                }
                let _renderComponent = <General pageData={pageData}/>;
                if(includes(item.url,'games-rtp') ){
                    _renderComponent = <GamesRTP {...this.props}/>
                }else if(includes(item.url,'casino-fpp')){
                    _renderComponent = <GamesFPP {...this.props}/>
                }else if(includes(item.url,'bonus-contribution')){
                    _renderComponent = <GamesBonus {...this.props}/>
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
                                        <span>{item.title}</span>
                                    </Col>
                                </Row>
                            </Accordion.Toggle>
                        </a>
                        <Accordion.Collapse eventKey={item.url}>
                            <Card.Body className="d-block d-lg-none">
                                <h2 className="title">{item.title}</h2>
                                {_renderComponent}
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                )
            })
        }
        let _renderComponentActive = <General pageData={pageData}/>;
        if(includes(tabActive,'games-rtp') ){
            _renderComponentActive = <GamesRTP {...this.props}/>
        }else if(includes(tabActive,'casino-fpp')){
            _renderComponentActive = <GamesFPP {...this.props}/>
        }else if(includes(tabActive,'bonus-contribution')){
            _renderComponentActive = <GamesBonus {...this.props}/>
        }  
        return (
            <Fragment>
                <Container className="container-custom">
                    {menu.length ? <Row>
                        <Col lg={3} md={12} xs={12}>
                            <Accordion defaultActiveKey={tabActive}>
                                <span>{accordions}</span>
                            </Accordion>
                        </Col>
                        <Col lg={9} md={12} xs={12} className="d-none d-lg-block">
                            <div className="jumbotron jumbotron-fluid">
                                <h2 className="title-middle" dangerouslySetInnerHTML={{ __html: pageData.title }}/>
                                {_renderComponentActive}
                            </div>
                        </Col>
                    </Row>
                    : null}
                </Container>
                <LoadBlock ref={ref => this.loadBlock = ref} />
            </Fragment >
        )
    }
}

export default connect(null, null)(Tabs);