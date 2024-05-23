
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import '../../../styles/components/_bottomBar.scss';
import Router from 'next/router';
import UserService from '../../services/em/user'
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Dropdown from 'react-bootstrap/Dropdown';
import {
    LANGUAGESACTIVE,
    SETUSERINFO,
    REGISTERMODAL,
    SET_USER_PROFILE,
    LOGINMODAL,
    MESSAGEMODAL
} from "../../constants/types";
import {
    setCookie,
    getLangSplit,
    getLangSplitID,
    getCookie,
    getSymbol,
    convertComma
} from '../../../utils'
import { LazyLoadImage } from 'react-lazy-load-image-component';
import WPService from '../../../services'
import upperCase from 'lodash/upperCase';
import isUndefined from 'lodash/isUndefined';
import isNull from 'lodash/isNull';
import filter from 'lodash/filter';
import first from 'lodash/first';
import find from 'lodash/find';
import forEach from 'lodash/forEach';
import includes from 'lodash/includes';
import { SetInnerHtml } from '../set-inner-html';
import SportsIcon from '../../../static/svg-js/sports';
import CasinoIcon from '../../../static/svg-js/casino';
import LiveCasinoIcon from '../../../static/svg-js/live-casino';
import ESportsIcon from '../../../static/svg-js/e-sports';
import PromotionIcon from '../../../static/svg-js/promotions';
const locale = require('react-redux-i18n').I18n
const config = require(`../../../config`).config;

import MenuLinks from './MenuLinks'

class SubMenuLinks extends Component {
    constructor(props) {
        super(props);
        this.state = {
            menus: this.props.subMenus,
            subMenus: [],
            menuActive: this.props.menuActive,
            subMenuActive: this.props.subMenuActive
        }
    }
    setSubMenus = (menu) => {
        this.setState({
            subMenus: menu.childItems,
            showLanguage: false
        })
    }

    render() {
        const { subMenuStatus, list, subMenus, subMenuActive, _subMenuToggle } = this.props;

        return (
            <div className={subMenuStatus} id='subMenu'>
                <ul>
                    <li key={`sub-menu`} ref={0}>
                        <Row>
                            <Col xs={2} className="col-beside home" onClick={_subMenuToggle}>
                                <i className="jb-icon icon-back casino-arrow-left" />
                            </Col>
                            <Col xs={8} className="col-menu" onClick={() => window.location.href = list.url}>
                                {list.title}
                            </Col>
                            <Col xs={2} className="col-beside" onClick={this.props._menuToggle} >
                                <i className="jb-icon registerpage-x" />
                            </Col>
                        </Row>
                    </li>
                    {
                        subMenus && Object.keys(subMenus).length > 0 ? subMenus.map((menu, i) => {
                            return (
                                <li className={menu.url == subMenuActive.url ? 'active' : ''} key={`sub-${menu.id}`} ref={i + 1}>
                                    <a href={menu.url}>
                                        <Row>
                                            <Col xs={2} className="col-beside">
                                            </Col>
                                            <Col xs={8} className="col-menu">
                                                {menu.title}
                                            </Col>
                                            <Col xs={2} className="col-beside">
                                            </Col>
                                        </Row>
                                    </a>
                                </li>
                            )
                        }) : null
                    }
                </ul>
            </div>
        )
    }
}
class SubMenuLanguages extends Component {
    constructor(props) {
        super(props);
        this.state = {
            menus: this.props.subMenus,
            subMenus: [],
            menuActive: this.props.menuActive,
            subMenuActive: this.props.subMenuActive
        }
    }
    setSubMenus = (menu) => {
        this.setState({
            subMenus: menu.childItems,
            showLanguage: false
        })
    }

    getMenusLanguages = () => {
        WPService.getMenus(this.props.lang, 'languages' + config.menuKey).then((res) => {
            let item = []
            let myLanguages = getCookie('lang', document.cookie)
            let active = !isUndefined(myLanguages) && myLanguages !== '' ? myLanguages : '';
            let listLang = first(res)
            let url = listLang.slug.split("//").pop()

            if (!isUndefined(listLang) && !isNull(listLang) && !isUndefined(listLang.childItems) && listLang.childItems.length > 0) {
                let langID = url.indexOf("/") > 0 ? getLangSplitID(listLang.slug) : config.lang

                item.push({
                    attrTitle: listLang.attrTitle,
                    id: langID,
                    title: listLang.title,
                    url: listLang.url
                })
                forEach(listLang.childItems, (res, index) => {
                    let childUrl = res.slug.split("//").pop()
                    let slugID = childUrl.indexOf("/") > 0 ? getLangSplitID(res.slug) : config.lang

                    item.push({
                        attrTitle: res.attrTitle,
                        id: slugID,
                        title: res.title,
                        url: res.url
                    })
                })
            }
            this.setState({ menusLanguages: item })
        })
    }

    componentDidMount() {
        this.getMenusLanguages();
    }

    render() {
        let { menusLanguages, languagesAction } = this.state
        const { subMenuStatus, setLanguages, _subMenuToggle } = this.props;

        let item = []
        if (!isUndefined(menusLanguages)) {
            const a = filter(menusLanguages, (res) => res.id === languagesAction)
            let active = !isUndefined(a[0]) ? a : menusLanguages
            let activeLG = languagesAction

            if (!isUndefined(active[0])) {
                if (isNull(languagesAction) || isUndefined(languagesAction) || languagesAction === '') {
                    activeLG = active[0].id
                }
                menusLanguages.forEach((res, index) => {
                    let imgLang = res.id.indexOf("-") > 0 ? getLangSplit(res.id) : res.id
                    item.push(
                        <li className={activeLG == res.id ? 'active' : ''} key={index} onClick={() => setLanguages(res)}>
                            <Row>
                                <Col xs={2} className="col-beside img-language">
                                    <img src={`/static/images/country/${upperCase(imgLang)}.jpg`} className="d-block img-fluid" alt={res.id} title={res.attrTitle} />
                                </Col>
                                <Col xs={7} className="col-menu">
                                    {res.attrTitle}
                                </Col>
                                <Col xs={3} className="col-beside">
                                </Col>
                            </Row>
                        </li>
                    )
                })
            }
        }
        return (
            <div className={subMenuStatus} id='subMenu'>
                <ul>
                    <li key={`sub-menu`} ref={0}>
                        <Row>
                            <Col xs={2} className="col-beside home" onClick={_subMenuToggle}>
                                <i className="jb-icon icon-back casino-arrow-left" />
                            </Col>
                            <Col xs={8} className="col-menu">
                                {locale.t('language')}
                            </Col>
                            <Col xs={2} className="col-beside" onClick={this.props._menuToggle} >
                                <i className="jb-icon registerpage-x" />
                            </Col>
                        </Row>
                    </li>
                    {item}
                </ul>
            </div>
        )
    }
}
// class MenuLinks extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             menus: [],
//             subMenus: [],
//             menuActive: { url: '' },
//             subMenuActive: { url: '' },
//             list: {
//                 title: locale.t('home'),
//                 url: '/'
//             },
//             isSubOpen: false
//         }
//     }
//     getMenu = () => {
//         let _self = this
//         let res = _self.props.mainMenu
//         let menuActive = { url: '' }
//         let subMenuActive = { url: '' }
//         let foundMenu = find(res, function (o) { return includes(o.url, _self.props.mainMenuActive) });
//         let subMenu = []

//         if (foundMenu) {
//             menuActive = foundMenu
//             if (!isUndefined(foundMenu.childItems)) {
//                 subMenu = foundMenu.childItems
//                 let foundSubMenu = find(subMenu, function (o) { return includes(o.url, _self.props.subMenuActive) });

//                 if (foundSubMenu) {
//                     subMenuActive = foundSubMenu
//                 } else {
//                     if (_self.props.actualPage == '/page-blog-category') {
//                         subMenuActive = head(subMenu)
//                     } else {
//                         subMenuActive = { url: '' }
//                     }
//                 }
//             }
//         }

//         this.setState({
//             menus: res,
//             subMenus: subMenu,
//             menuActive,
//             subMenuActive
//         })
//     }

//     componentDidMount() {
//         this.getMenu();
//     }
//     UNSAFE_componentWillReceiveProps(nextProps) {
//         if (nextProps.mainMenu !== this.props.mainMenu) {
//             this.getMenu();
//         }
//     }

//     _menuToggle = () => {
//         this.setState({
//             isSubOpen: !this.state.isSubOpen,
//         }, this.props._menuToggle);
//     }
//     _menuLangToggle = () => {
//         this.setState({
//             isLangOpen: !this.state.isLangOpen,
//         }, this.props._menuToggle);
//     }
//     _subMenuToggle = () => {
//         this.setState({
//             isSubOpen: !this.state.isSubOpen,
//         });
//     }
//     _subLanguagesToggle = () => {
//         this.setState({
//             isLangOpen: !this.state.isLangOpen,
//         });
//     }
//     setSubMenus = (menu) => {
//         this.setState({
//             subMenus: menu.childItems,
//             isSubOpen: true,
//             list: menu
//         })
//     }
//     setSubMenusLanguages(menu) {
//         this.setState({
//             isLangOpen: true
//         })
//     }
//     setLanguages = (res) => {
//         let active = res.id.indexOf("-") > 0 ? getLangSplitID(res.id) : res.id
//         setCookie('lang', active, 375)
//         let slug = window.location.pathname.split('/').filter(function (el) { return el; }).pop();
//         WPService.getPermalink(active, slug).then((data) => {
//             if (data.link !== '/') {
//                 window.location = data.link + window.location.hash
//             } else {
//                 if (this.props.slug === 'home') {
//                     window.location = data.link
//                 } else {
//                     window.location.reload()
//                 }
//             }
//         })
//     }
//     logout = async () => {
//         const { session } = this.props
//         await localStorage.setItem('userInfo', '');
//         await localStorage.setItem('sessionId', '');
//         await setCookie('isLogin', false, 375)
//         await setCookie('role', JSON.stringify(['anonymous']), 375)
//         let active = {
//             userInfo: {},
//             isLogin: false
//         }
//         this.props.onSetUser(active)
//         this.props.onSetUserProfile({})
//         UserService.logout()
//         const message = `<p className="m-0 text-center">${locale.t('succesLoggedOut')}</p>
//                       <p className="m-0 text-center">${locale.t('hopeYouPlayOn')}</p>
//                       <p className="m-0 text-center">${locale.t('welcomeYouBack')}</p>`
//         const set = { messageTitle: locale.t('logout'), messageDesc: message, messageDetail: '', messageType: 'success' }
//         this.props.onSetMessageModal(set)
//     }
//     render() {
//         let { menuStatus, _menuToggle, _menuLangToggle, session, isConnected, isLoadData } = this.props
//         let { menus, menuActive, isSubOpen, list, subMenuActive, isLangOpen } = this.state
//         let subMenuStatus = isSubOpen ? 'isSubOpen' : ''
//         let subLangStatus = isLangOpen ? 'isSubOpen' : ''
//         let logo = '/static/images/small-logo.png'
//         const currencyWallets = !isUndefined(session.wallets.realMoneyCurrency) ? session.wallets.realMoneyCurrency : 'EUR'
//         const currencyBonusWallets = !isUndefined(session.wallets.bonusMoneyCurrency) ? session.wallets.bonusMoneyCurrency : 'EUR'
//         const totalWallets = !isUndefined(session.wallets.realMoney) ? session.wallets.realMoney : 0
//         const totalBonusWallets = !isUndefined(session.wallets.bonusMoney) ? session.wallets.bonusMoney : 0
//         const total = totalWallets + totalBonusWallets

//         return (
//             <Fragment>
//                 <div className={menuStatus} id='menu'>
//                     <ul>
//                         <li key={`main-home`} ref={0}>
//                             <Row>
//                                 <Col xs={2} className="col-beside home" onClick={() => window.location.href = list.url}>
//                                     <LazyLoadImage src={logo} alt="logo" className="img-fluid" />
//                                 </Col>
//                                 <Col xs={7} className="col-menu">
//                                     {upperCase(locale.t('menu'))}
//                                 </Col>
//                                 <Col xs={3} className="col-beside" onClick={_menuToggle} >
//                                     <i className="jb-icon registerpage-x" />
//                                 </Col>
//                             </Row>
//                         </li>
//                         {isConnected && isLoadData && !session.isLogin &&
//                             <li key={`main-login`} ref={0}>
//                                 <Row className="pl-0">
//                                     <Col xs={6} className="list-login p-0">
//                                         <Row className="m-0 pl-0">
//                                             <Col xs={12} className="col-menu" onClick={() => (isConnected ? this.props.onSetLoginModal(true) : {})}>
//                                                 {locale.t('login')}
//                                             </Col>
//                                             {/* <Col xs={5} className="col-beside pl-0">
//                           <i className="jb-icon icon-list sidemenu-changepassword" />
//                         </Col> */}
//                                         </Row>
//                                     </Col>
//                                     <Col xs={6} className="list-register p-0">
//                                         <Row className="m-0">
//                                             <Col xs={12} className="col-menu" onClick={() => (isConnected ? this.props.onSetRegisterModal(true) : {})}>
//                                                 {locale.t('register')}
//                                             </Col>
//                                             {/* <Col xs={5} className="col-beside">
//                           <i className="jb-icon icon-list user" />
//                         </Col> */}
//                                         </Row>
//                                     </Col>
//                                 </Row>
//                             </li>
//                         }
//                         {session.isLogin &&
//                             <Fragment>
//                                 <li key={`main-balance`} ref={0}>
//                                     <Row>
//                                         <Col xs={2} className="col-beside">
//                                         </Col>
//                                         <Col xs={4} className="col-menu top">
//                                             <p className="m-0 text">{locale.t('balance')}</p>
//                                         </Col>
//                                         <Col xs={6} className="col-beside top">
//                                             <Row>
//                                                 <Col xs={6} className="pr-0">
//                                                     <p className="m-0 text number text-right">{`${convertComma(totalWallets)}`}</p>
//                                                 </Col>
//                                                 <Col xs={2} className="pl-0">
//                                                     <p className="m-0 text number text-left">{`${getSymbol(currencyWallets)}`}</p>
//                                                 </Col>
//                                             </Row>
//                                         </Col>
//                                     </Row>
//                                     <Row>
//                                         <Col xs={2} className="col-beside">
//                                         </Col>
//                                         <Col xs={4} className="col-menu">
//                                             <p className="m-0 text">{locale.t('bonus')}</p>
//                                         </Col>
//                                         <Col xs={6} className="col-beside">
//                                             <Row>
//                                                 <Col xs={6} className="pr-0">
//                                                     <p className="m-0 text number text-right">{`${convertComma(totalBonusWallets)}`}</p>
//                                                 </Col>
//                                                 <Col xs={2} className="pl-0">
//                                                     <p className="m-0 text number text-left">{`${getSymbol(currencyWallets)}`}</p>
//                                                 </Col>
//                                             </Row>
//                                         </Col>
//                                     </Row>
//                                     <Row>
//                                         <Col xs={2} className="col-beside">
//                                         </Col>
//                                         <Col xs={4} className="col-menu bottom">
//                                             <p className="m-0 pt-1 text">{locale.t('total')}</p>
//                                         </Col>
//                                         <Col xs={6} className="col-beside bottom">
//                                             <Row>
//                                                 <Col xs={6} className="pr-0">
//                                                     <p className="m-0 text number text-right">{`${convertComma(total)}`}</p>
//                                                 </Col>
//                                                 <Col xs={2} className="pl-0">
//                                                     <p className="m-0 text number text-left">{`${getSymbol(currencyWallets)}`}</p>
//                                                 </Col>
//                                             </Row>
//                                         </Col>
//                                     </Row>
//                                 </li>
//                                 <li key={`main-deposit`} ref={0}>
//                                     <a href='/account/deposit'>
//                                         <Row>
//                                             <Col xs={2} className="col-beside">
//                                                 <i className="jb-icon icon-list deposit" />
//                                             </Col>
//                                             <Col xs={4} className="col-menu top">
//                                                 {locale.t('deposit')}
//                                             </Col>
//                                             <Col xs={6} className="col-beside top">
//                                             </Col>
//                                         </Row>
//                                     </a>
//                                 </li>
//                             </Fragment>
//                         }
//                         {
//                             menus && Object.keys(menus).length > 0 ? menus.map((menu, i) => {
//                                 if (menu.childItems.length > 0) {
//                                     return (
//                                         <li className={menu.url == menuActive.url ? 'active' : ''} key={`main-${menu.id}`} ref={i + 1}>
//                                             <a onClick={() => this.setSubMenus(menu)}>
//                                                 <Row>
//                                                     <Col xs={2} className="col-beside">
//                                                         <i className={"jb-icon icon-list " + menu.classes} />
//                                                     </Col>
//                                                     <Col xs={7} className="col-menu">
//                                                         {menu.title}
//                                                     </Col>
//                                                     <Col xs={3} className="col-beside">
//                                                         <i className="jb-icon casino-arrow-right" />
//                                                     </Col>
//                                                 </Row>
//                                             </a>
//                                         </li>
//                                     )
//                                 }
//                                 else {
//                                     return (
//                                         <li className={menu.url == menuActive.url ? 'active' : ''} key={`main-${menu.id}`} ref={i + 1}>
//                                             <a href={menu.url}>
//                                                 <Row>
//                                                     <Col xs={2} className="col-beside">
//                                                         <i className={"jb-icon icon-list " + menu.classes} />
//                                                     </Col>
//                                                     <Col xs={7} className="col-menu">
//                                                         {menu.title}
//                                                     </Col>
//                                                     <Col xs={3} className="col-beside">
//                                                     </Col>
//                                                 </Row>
//                                             </a>
//                                         </li>
//                                     )
//                                 }
//                             })
//                                 : null
//                         }
//                         <li key={`main-Languages`} ref={Object.keys(menus).length + 1}>
//                             <a onClick={() => this.setSubMenusLanguages(menu)}><ListMenusLanguages {...this.props} /></a>
//                         </li>
//                         {
//                             session.isLogin &&
//                             <li key={`main-logout`} ref={0}>
//                                 <a onClick={() => this.logout()}>
//                                     <Row>
//                                         <Col xs={2} className="col-beside">
//                                             <i className="jb-icon icon-list logout" />
//                                         </Col>
//                                         <Col xs={10} className="col-menu">
//                                             {locale.t('logout')}
//                                         </Col>
//                                     </Row>
//                                 </a>
//                             </li>
//                         }
//                     </ul>
//                 </div>
//                 <SubMenuLanguages {...this.state} {...this.props} subMenuActive={subMenuActive} subMenuStatus={subLangStatus} _subMenuToggle={this._subLanguagesToggle} _menuToggle={this._menuLangToggle} setLanguages={this.setLanguages} />
//                 <SubMenuLinks {...this.state} subMenuActive={subMenuActive} subMenuStatus={subMenuStatus} _subMenuToggle={this._subMenuToggle} _menuToggle={this._menuToggle} />
//             </Fragment>
//         )
//     }
// }

class Navbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            menusLanguages: [],
            languagesAction: '',
            isLoginOpen: false,
            user: '',
            pass: '',
            hideNav: false,
            isDeposit: false,
            promotionsRegister: '',
            promotionsDeposit: '',
            isLoading: false,
            isLoadData: false
        }
    }
    UNSAFE_componentWillMount() {
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const isLoginCookie = getCookie('isLogin', document.cookie)
        if (nextProps.session.isLogin !== this.props.session.isLogin) {
            this.setState({
                isLoadData: true
            })
        } else if (isLoginCookie === 'false') {
            this.setState({
                isLoadData: true
            })
        }
    }
    componentDidMount() {
        window.addEventListener("resize", this.resize.bind(this));
        this.resize();

        Router.events.on('routeChangeComplete', (err, url) => {
            if (this.state.isOpen) {
                this._menuToggle()
            }
        })
    }
    resize() {
        let currentHideNav = (window.innerWidth <= 768);
        if (currentHideNav !== this.state.hideNav) {
            this.setState({ hideNav: currentHideNav });
        }
    }
    _menuToggle = () => {
        if (!this.state.isOpen) {
            document.body.classList.add('main-menu-active')
        } else {
            document.body.classList.remove('main-menu-active')
        }

        this.setState({
            isOpen: !this.state.isOpen
        });
    }
    render() {
        const { page, session, isConnected, url } = this.props
        const { isOpen } = this.state
        let menuStatus = isOpen ? 'isopen' : '';
        let logo = '/static/images/small-logo.png'
        let menuIcon = '/static/images/Hamburger-1.png'

        return (
            <Fragment>
                <div className="sticky-footer">
                    <a className={`menu-button ${(url === '/sports/betting') ? 'Actived' : ''}`} href='/sports/betting'>
                        <SetInnerHtml TagName="span" innerHtml={SportsIcon} />
                        <div>{locale.t("menu-sport")}</div>
                    </a>
                    <a className={`menu-button ${(url === '/casino') ? 'Actived' : ''}`} href='/casino'>
                        <SetInnerHtml TagName="span" innerHtml={CasinoIcon} />
                        <div>{locale.t("menu-casino")}</div>
                    </a>
                    <a className={`menu-button ${(url === '/casino/live-casino') ? 'Actived' : ''}`} href='/casino/live-casino'>
                        <SetInnerHtml TagName="span" innerHtml={LiveCasinoIcon} />
                        <div>{locale.t("menu-live-casino")}</div>
                    </a>
                    <a className={`menu-button ${(url === '/sports/betting/sport/e-sports/96/tout/0/discipline/direct') ? 'Actived' : ''}`} href='/sports/betting/sport/e-sports/96/tout/0/discipline/direct'>
                        <SetInnerHtml TagName="span" innerHtml={ESportsIcon} />
                        <div>{locale.t("menu-e-sport")}</div>
                    </a>
                    <a className={`menu-button ${(url === '/promotions') ? 'Actived' : ''}`} href='/promotions'>
                        <SetInnerHtml TagName="span" innerHtml={PromotionIcon} />
                        <div>{locale.t("menu-promo")}</div>
                        {/* <span className="badge pulsate">{countPromotions}</span> */}
                    </a>
                </div>
            </Fragment>
        )
    }
}

class ListMenusLanguages extends Component {
    constructor(props) {
        super(props);
        this.state = {
            menusLanguages: [],
            languagesAction: ''
        }
    }
    getMenusLanguages = () => {
        WPService.getMenus(this.props.lang, 'languages' + config.menuKey).then((res) => {
            let item = []
            let myLanguages = getCookie('lang', document.cookie)
            let active = !isUndefined(myLanguages) && myLanguages !== '' ? myLanguages : '';
            let listLang = first(res)
            let url = listLang.slug.split("//").pop()

            if (!isUndefined(listLang) && !isNull(listLang) && !isUndefined(listLang.childItems) && listLang.childItems.length > 0) {
                let langID = url.indexOf("/") > 0 ? getLangSplitID(listLang.slug) : config.lang

                item.push({
                    attrTitle: listLang.attrTitle,
                    id: langID,
                    title: listLang.title,
                    url: listLang.url
                })
                forEach(listLang.childItems, (res, index) => {
                    let childUrl = res.slug.split("//").pop()
                    let slugID = childUrl.indexOf("/") > 0 ? getLangSplitID(res.slug) : config.lang

                    item.push({
                        attrTitle: res.attrTitle,
                        id: slugID,
                        title: res.title,
                        url: res.url
                    })
                })
            }
            this.setState({ menusLanguages: item })
            this.props.onSetLanguagesActive(active)
        })
    }
    componentDidMount() {
        this.getMenusLanguages();
    }
    render() {
        let { menusLanguages, languagesAction } = this.state
        let renderItem = []

        if (!isUndefined(menusLanguages)) {
            const a = filter(menusLanguages, (res) => res.id === languagesAction)
            let active = !isUndefined(a[0]) ? a : menusLanguages
            let activeLG = languagesAction

            if (!isUndefined(active[0])) {
                if (isNull(languagesAction) || languagesAction === '') {
                    activeLG = active[0].id
                }
                let img = active[0].id.indexOf("-") > 0 ? getLangSplit(active[0].id) : active[0].id

                renderItem.push(
                    <div className="menus-languages" key={0}>
                        <Dropdown>
                            <Dropdown.Toggle id="dropdown-custom-2">
                                <Row>
                                    <Col xs={2} className="col-beside img-language">
                                        <img src={`/static/images/country/${upperCase(img)}.jpg`} className="d-block img-fluid" alt={active[0].id} title={active[0].attrTitle} />
                                    </Col>
                                    <Col xs={7} className="col-menu">
                                        {active[0].attrTitle}
                                    </Col>
                                    <Col xs={3} className="col-beside">
                                        <i className="jb-icon casino-arrow-right" />
                                    </Col>
                                </Row>
                            </Dropdown.Toggle>
                        </Dropdown>
                    </div>
                )
            }
        }
        return renderItem
    }
}

const mapStateToProps = (state) => ({
    isConnected: state.EM.isConnected,
    session: state.sessionState,
    modals: state.modalsState
});

const mapDispatchToProps = (dispatch) => ({
    onSetLanguagesActive: (active) => dispatch({ type: LANGUAGESACTIVE, active }),
    onSetRegisterModal: (active) => dispatch({ type: REGISTERMODAL, active }),
    onSetLoginModal: (active) => dispatch({ type: LOGINMODAL, active }),
    onSetUser: (active) => dispatch({ type: SETUSERINFO, active }),
    onSetUserProfile: (active) => dispatch({ type: SET_USER_PROFILE, userProfile: active }),
    onSetMessageModal: (active) => dispatch({ type: MESSAGEMODAL, active })
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Navbar);
