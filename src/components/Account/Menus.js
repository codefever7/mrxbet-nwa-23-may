import React, { Component } from 'react'
import { connect } from 'react-redux'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import Container from 'react-bootstrap/Container'
import Modal from 'react-bootstrap/Modal'
import map from 'lodash/map'
import isUndefined from 'lodash/isUndefined'
import find from 'lodash/find'
import UserService from '../../services/em/user'
import WPService from '../../../services';
import { SetInnerHtml } from '../set-inner-html';
import {
    SETUSERINFO,
    SET_USER_PROFILE,
    MESSAGEMODAL
} from "../../constants/types";
import {
    setCookie,
    getCookie
} from '../../../utils';
import DepositIcon from '../../../static/svg-js/deposit';
import BonusIcon from '../../../static/svg-js/bonus';
import HistoryIcon from '../../../static/svg-js/history';
import LogoutIcon from '../../../static/svg-js/logout';
import MybetsIcon from '../../../static/svg-js/mybets';
import MyProfileIcon from '../../../static/svg-js/myporfile';
import SportIcon from '../../../static/svg-js/sportsetting';
import WithdrawIcon from '../../../static/svg-js/withdraw';
import ResponsibleIcon from '../../../static/svg-js/responsible';
const locale = require('react-redux-i18n').I18n
const config = require(`../../../config`).config;

class Menu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showSubMenu: {},
            menu: []
        }
    }
    getMenusTabs = () => {
        WPService.getMenus(this.props.lang, this.props.firstSegment + config.menuKey).then((res) => {
            this.setState({ menu: res })
        })
    }

    componentDidMount() {
        this.getMenusTabs();
        const isLoginCookie = getCookie('isLogin', document.cookie)
        if (isLoginCookie == 'false') {
            window.location.href = '/'
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {

        // if (nextProps.isConnected !== this.props.isConnected && nextProps.isConnected === false) {
            
            // if (!nextProps.isConnected) {
            //     this.onIsConnected()
            // }
        // }
    }

    onIsConnected = async () => {
        await localStorage.setItem('userInfo', '');
        await localStorage.setItem('sessionId', '');
        await setCookie('isLogin', false, 375)
        await setCookie('role', JSON.stringify(['anonymous']), 375)
        let active = {
            userInfo: {},
            isLogin: false
        }
        this.props.onSetUser(active)
        this.props.onSetUserProfile({})
        window.location.href = '/'
    }

    logout = async () => {
        const { session } = this.props
        await localStorage.setItem('userInfo', '');
        await localStorage.setItem('sessionId', '');
        await localStorage.setItem('PopupToRedirectDomain', '');
        await setCookie('isLogin', false, 375)
        await setCookie('role', JSON.stringify(['anonymous']), 375)
        let active = {
            userInfo: {},
            isLogin: false
        }
        this.props.onSetUser(active)
        this.props.onSetUserProfile({})
        UserService.logout()
        const message = `<p className="m-0 text-center">${locale.t('succesLoggedOut')}</p>
                        <p className="m-0 text-center">${locale.t('hopeYouPlayOn')}</p>
                        <p className="m-0 text-center">${locale.t('welcomeYouBack')}</p>`
        const set = { messageTitle: locale.t('logout'), messageDesc: message, messageDetail: '', messageType: 'success' }
        this.props.onSetMessageModal(set)
    }

    getIcon = (slug) => {
        let imageSrc = null;
        switch (slug) {
            case "/account/deposit":
                imageSrc = <SetInnerHtml tagName="span" htmlProps={{ className: 'icon' }} innerHtml={DepositIcon} />;
                break;
            case "/account/withdraw":
                imageSrc = <SetInnerHtml tagName="span" htmlProps={{ className: 'icon' }} innerHtml={WithdrawIcon} />;
                break;
            case "/account/transaction-history":
                imageSrc = <SetInnerHtml tagName="span" htmlProps={{ className: 'icon' }} innerHtml={HistoryIcon} />;
                break;
            case "/account/my-profile":
                imageSrc = <SetInnerHtml tagName="span" htmlProps={{ className: 'icon' }} innerHtml={MyProfileIcon} />;
                break;
            case "/account/my-bets":
                imageSrc = <SetInnerHtml tagName="span" htmlProps={{ className: 'icon' }} innerHtml={MybetsIcon} />;
                break;
            case "/account/responsible-gaming":
                imageSrc = <SetInnerHtml tagName="span" htmlProps={{ className: 'icon' }} innerHtml={ResponsibleIcon} />;
                break;
            case "/account/active-bonuses":
                imageSrc = <SetInnerHtml tagName="span" htmlProps={{ className: 'icon' }} innerHtml={BonusIcon} />;
                break;
            case "/sports/betting/settings":
                imageSrc = <SetInnerHtml tagName="span" htmlProps={{ className: 'icon' }} innerHtml={SportIcon} />;
                break;
            case "logout":
                imageSrc = <SetInnerHtml tagName="span" htmlProps={{ className: 'icon' }} innerHtml={LogoutIcon} />;
                break;
        }

        return imageSrc;
    }

    _renderListMenu = () => {
        const { tabActive, componentRender, isConnected, session, isMobile } = this.props
        const { showSubMenu, menu } = this.state
        let accordions = []
        map(menu, (item, index) => {
            let active = ''
            let slug = item.url.split('/').pop()

            if (tabActive === slug && tabActive !== 'responsible-gaming') {
                active = 'active'
            }

            if (item.childItems.length) {
                let show = !isUndefined(showSubMenu[slug]) && showSubMenu[slug] ? 'block' : 'none'
                let finds = find(item.childItems, o => o.url.split('/').pop() == tabActive)

                if (!isUndefined(finds) || tabActive === 'responsible-gaming') {
                    show = 'block'
                    active = 'active'
                }

                accordions.push(
                    <Card key={"accordion" + index} className={`${isMobile ? 'accordion-mobile' : ''}`}>
                        <a href={item.url}>
                            <Accordion
                                as={Card.Header}
                                key={slug}
                                className={active}
                            >
                                <Row>
                                    <Col md={2} xs={2} className="icon" align="center">
                                        {this.getIcon(item.slug) || <span className={"jb-icon icon-default " + item.classes} />}
                                        {/* <span className={"jb-icon icon-default " + item.classes} /> */}
                                    </Col>
                                    <Col md={10} xs={10} className="title">
                                        <span dangerouslySetInnerHTML={{ __html: item.title }} />
                                    </Col>
                                </Row>
                            </Accordion>
                        </a>
                    </Card>
                )

                map(item.childItems, (itemSub, indexSub) => {
                    let activeSub = ''
                    let showCollapse = ''
                    let slug = itemSub.url.split('/').pop()

                    if (tabActive === slug) {
                        activeSub = 'active'
                    }
                    if (tabActive === 'responsible-gaming' && itemSub.slug == '/account/limits') {
                        activeSub = 'active'
                        showCollapse = 'show'
                    }

                    accordions.push(
                        <Card key={"subAccordion" + indexSub} className={`sub-menu ${isMobile ? 'accordion-mobile' : ''}`} style={{ display: show }}>
                            <a href={itemSub.url}>
                                <Accordion.Toggle
                                    as={Card.Header}
                                    eventKey={slug}
                                    className={activeSub}
                                >
                                    <Row>
                                        <Col md={2} xs={2} className="icon" align="center"></Col>
                                        <Col md={2} xs={2} className="icon-sub" align="center">
                                            <span className={"jb-icon icon-default " + itemSub.classes} />
                                        </Col>
                                        <Col md={8} xs={8} className="title">
                                            {itemSub.title}
                                        </Col>
                                    </Row>
                                </Accordion.Toggle>
                            </a>
                            <Accordion.Collapse eventKey={slug} className={showCollapse}>
                                <Card.Body>
                                    {isConnected && activeSub == 'active' ? componentRender : null}
                                </Card.Body>
                            </Accordion.Collapse>
                        </Card>
                    )
                })
            } else {
                accordions.push(
                    <Card key={"accordion" + index} className={`${isMobile ? 'accordion-mobile' : ''}`}>
                        <a href={item.url}>
                            <Accordion
                                as={Card.Header}
                                key={slug}
                                className={active}
                            >
                                <Row>
                                    <Col md={2} xs={2} className="icon" align="center">
                                        {/* <span className={"jb-icon icon-default " + item.classes} /> */}
                                        {this.getIcon(item.slug) || <span className={"jb-icon icon-default " + item.classes} />}
                                    </Col>
                                    <Col md={10} xs={10} className="title">
                                        <span>{item.title}</span>
                                    </Col>
                                </Row>
                            </Accordion>
                        </a>
                        <Accordion.Collapse eventKey={slug}>
                            <Card.Body>
                                {isConnected && active == 'active' ? componentRender : null}
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                )
            }
        })

        if (session.isLogin) {
            accordions.push(
                <Card key={"accordion-logout"} className={`pt-4 ${isMobile ? 'accordion-mobile' : ''}`}>
                    <Accordion
                        as={Card.Header}
                        key={"accordion-logout"}
                        onClick={() => this.logout()}
                    >
                        <Row>
                            <Col md={2} xs={2} className="icon" align="center">
                                {/* <span className={"jb-icon logout "} /> */}
                                {this.getIcon('logout')}
                            </Col>
                            <Col md={10} xs={10} className="title">
                                <span>{locale.t('logout')}</span>
                            </Col>
                        </Row>
                    </Accordion>
                </Card>
            )
        }

        return (
            <Accordion defaultActiveKey={tabActive} className={`${isMobile ? 'accordion-main-ismobile' : ''}`}>
                {accordions}
            </Accordion>
        )
    }
    render() {

        return (
            <div className="menu">
                {this._renderListMenu()}
            </div>
        )
    }
}
const mapStateToProps = (state) => ({
    isConnected: state.EM.isConnected,
    languagesActive: state.sessionState.languagesActive,
    userInfo: state.sessionState.userInfo,
    userProfile: state.sessionState.userProfile,
    session: state.sessionState,
});

const mapDispatchToProps = (dispatch) => ({
    onSetUser: (active) => dispatch({ type: SETUSERINFO, active }),
    onSetUserProfile: (active) => dispatch({ type: SET_USER_PROFILE, userProfile: active }),
    onSetMessageModal: (active) => dispatch({ type: MESSAGEMODAL, active })
});

export default connect(mapStateToProps, mapDispatchToProps)(Menu);