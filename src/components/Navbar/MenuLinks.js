
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
    MESSAGEMODAL,
    THEME
} from "../../constants/types";
import {
    setCookie,
    getLangSplit,
    getLangSplitID,
    getCookie,
    getSymbol,
    convertComma,
    filterByPlatform,
    getLogoHeder,
} from '../../../utils'
import { LazyLoadImage } from 'react-lazy-load-image-component';
import WPService from '../../../services';
import * as casinoParams from '../../constants/casinoParams'
import CasinoService from '../../services/em/casino';
import upperCase from 'lodash/upperCase';
import isUndefined from 'lodash/isUndefined';
import isNull from 'lodash/isNull';
import filter from 'lodash/filter';
import first from 'lodash/first';
import find from 'lodash/find';
import forEach from 'lodash/forEach';
import includes from 'lodash/includes';
import cloneDeep from 'lodash/cloneDeep';
import { isObject } from 'lodash';
import { SetInnerHtml } from '../set-inner-html';
import LoggedoutIcon from '../../../static/svg-js/logout';
import ModalSwitch from './ModalSwitch';
const locale = require('react-redux-i18n').I18n
const config = require(`../../../config`).config;

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
        let { menusLanguages, languagesAction, countpage } = this.state
        const { subMenuStatus, setLanguages, _subMenuToggle, role } = this.props;

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
                        <li className={`line-break ${activeLG == res.id ? 'active' : ''}`} key={index} onClick={() => setLanguages(res)}>
                            <Row className="m-0">
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
                <div className="content-menu">
                    <ul>
                        <li key={`sub-menu`} ref={0}>
                            <Row className="m-0 line-break">
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
                <div className="backdrop-menu" onClick={_subMenuToggle}></div>
            </div>
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
                                <Row className="m-0">
                                    <div className="col-beside img-language">
                                        <img src={`/static/images/country/${upperCase(img)}.jpg`} className="d-block img-fluid" alt={active[0].id} title={active[0].attrTitle} />
                                    </div>
                                    <div className="col-menu">
                                        {active[0].attrTitle}
                                    </div>
                                    <div className="col-beside">
                                        {/* <i className="jb-icon casino-arrow-right" /> */}
                                    </div>
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


class MenuLinks extends Component {
    constructor(props) {
        super(props);
        this.state = {
            menus: [],
            subMenus: [],
            menuActive: { url: '' },
            subMenuActive: { url: '' },
            list: {
                title: locale.t('home'),
                url: '/'
            },
            isSubOpen: false,
            theme: 'dark',
            pageGameCount: []
        }
    }
    getMenu = () => {
        let _self = this
        let res = _self.props.mainMenu
        let menuActive = { url: '' }
        let subMenuActive = { url: '' }
        let foundMenu = find(res, function (o) { return includes(o.url, _self.props.mainMenuActive) });
        let subMenu = []

        if (foundMenu) {
            menuActive = foundMenu
            if (!isUndefined(foundMenu.childItems)) {
                subMenu = foundMenu.childItems
                let foundSubMenu = find(subMenu, function (o) { return includes(o.url, _self.props.subMenuActive) });

                if (foundSubMenu) {
                    subMenuActive = foundSubMenu
                } else {
                    if (_self.props.actualPage == '/page-blog-category') {
                        subMenuActive = head(subMenu)
                    } else {
                        subMenuActive = { url: '' }
                    }
                }
            }
        }
        res.map((item, index) => {
            let pathname = window.location.pathname;
            let isActived = (item.url === pathname);
            const pathSegments = pathname.split('/');
            if(pathSegments.length > 3){
                pathname = `/${pathSegments[1]}/${pathSegments[2]}`;
                if(pathname === '/sports/live-sports'){
                    const pathSegmentsUrl = item.url.split('/');
                    if(pathSegmentsUrl.length > 2){
                        if(`/${pathSegmentsUrl[1]}/${pathSegmentsUrl[2]}` === pathname){
                            isActived = true;
                        }
                    }
                }
            }else{
    
                if(item.url === "/sports" && pathname === "/sports/betting"){
                    isActived = true;
                }
            }
            item.isActived = isActived;
        })

        this.setState({
            menus: res,
            subMenus: subMenu,
            menuActive,
            subMenuActive
        })
    }

    componentDidMount() {
        this.getMenu();
        const theme = localStorage.getItem('theme-html') || 'dark';
        this.setState({ theme });
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.mainMenu !== this.props.mainMenu) {
            this.getMenu();
        }
    }

    _menuToggle = () => {
        this.setState({
            isSubOpen: !this.state.isSubOpen,
        }, this.props._menuToggle);
    }
    _menuLangToggle = () => {
        this.setState({
            isLangOpen: !this.state.isLangOpen,
        }, this.props._menuToggle);
    }
    _subMenuToggle = () => {
        this.setState({
            isSubOpen: !this.state.isSubOpen,
        });
    }
    _subLanguagesToggle = () => {
        this.setState({
            isLangOpen: !this.state.isLangOpen,
        });
    }
    setSubMenus = (menu) => {
        this.setState({
            subMenus: menu.childItems,
            isSubOpen: true,
            list: menu
        })
    }
    setSubMenusLanguages(menu) {
        this.setState({
            isLangOpen: true
        })
    }
    setLanguages = (res) => {
        let active = res.id.indexOf("-") > 0 ? getLangSplitID(res.id) : res.id
        setCookie('lang', active, 375)
        let slug = window.location.pathname.split('/').filter(function (el) { return el; }).pop();
        WPService.getPermalink(active, slug).then((data) => {
            if (data.link !== '/') {
                window.location = data.link + window.location.hash
            } else {
                if (this.props.slug === 'home') {
                    window.location = data.link
                } else {
                    window.location.reload()
                }
            }
        })
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

    updateThemeOnHtmlElement = () => {
        const newTheme = this.state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme-html', newTheme);
        this.props.onSetTheme({ theme: newTheme });
        this.setState({ theme: newTheme });
        document.querySelector("html").setAttribute("data-theme", newTheme);
    }

    paramsGame = (gameCategoriesSlug, lobbiesData, useragent) => {
        let getCustomGamesParams = cloneDeep(casinoParams.getCustomGamesParams);
        getCustomGamesParams.categoryID = gameCategoriesSlug;
        getCustomGamesParams.dataSourceName = lobbiesData.datasourceNameCasino;
        getCustomGamesParams.filterByPlatform = filterByPlatform(getCustomGamesParams.filterByPlatform, useragent)
        return getCustomGamesParams
    }

    getLobbies = async (slug) => {
        const { role, useragent } = this.props;
        let page = (slug === '/casino/live-casino') ? 'live-casino' : slug.replace('/', '');
        let count = 0;
        const lobbies = await WPService.getLobbies(this.props.lang, role, page);
        if (isObject(lobbies)) {
            for (let i = 0; i < lobbies.length; i++) {
                const lobby = lobbies[i];
                if (lobby.casinoType !== "live_casino_tables") {
                    lobby.categories.map(async (item, index) => {
                        let getGamesParamsPopular = cloneDeep(casinoParams.getGamesParams);
                        getGamesParamsPopular.pageSize = 100
                        getGamesParamsPopular.sortFields = [{
                            "field": 1024,
                            "order": "DESC"
                        }]
                        getGamesParamsPopular.filterByPlatform = filterByPlatform(getGamesParamsPopular.filterByPlatform, useragent)
                        let getCustomGamesParams = this.paramsGame(`${lobby.datasourceNameCasino}$${item.slug}`, lobby, useragent)
                        const resList = await CasinoService.getCustomGames(getCustomGamesParams)
                        count += resList.children.length;
                        console.log('tset => ', count);
                    })


                } else {
                    // let getGamesParamsLive = cloneDeep(casinoParams.getLiveCasinoTablesParams);
                    // getGamesParamsLive.pageSize = 100
                    // getGamesParamsLive.sortFields = [{
                    //     "field": 1024,
                    //     "order": "DESC"
                    // }]
                    // getGamesParamsLive.filterByPlatform = filterByPlatform(getGamesParamsLive.filterByPlatform, useragent)
                    // const resList = CasinoService.getLiveCasinoTables(getGamesParamsLive)
                    // console.log('reslist => ', resList)

                }
            }

        }
        //return count;
    }

    render() {
        let { menuStatus, _menuToggle, _menuLangToggle, session, isConnected, isLoadData } = this.props
        let { menus, menuActive, isSubOpen, list, subMenuActive, isLangOpen, theme } = this.state
        let subMenuStatus = isSubOpen ? 'isSubOpen' : ''
        let subLangStatus = isLangOpen ? 'isSubOpen' : ''
        let logo = getLogoHeder(false); //`/static/images/logo${theme === 'light'?'-light':''}.png`;
        const currencyWallets = !isUndefined(session.wallets.realMoneyCurrency) ? session.wallets.realMoneyCurrency : 'EUR'
        const currencyBonusWallets = !isUndefined(session.wallets.bonusMoneyCurrency) ? session.wallets.bonusMoneyCurrency : 'EUR'
        const totalWallets = !isUndefined(session.wallets.realMoney) ? session.wallets.realMoney : 0
        const totalBonusWallets = !isUndefined(session.wallets.bonusMoney) ? session.wallets.bonusMoney : 0
        const total = totalWallets + totalBonusWallets
        //const countPage = ['/casino', '/casino/live-casino', '/virtual-sports', '/lottery'];
        const countPage = ['/casino'];
        let pathname = window.location.pathname;
        return (
            <Fragment>
                <div className={menuStatus} id='menu'>
                    <div className="content-menu">
                        <ul>
                            <li key={`main-home`} ref={0} className="py-4 line-break">
                                <Row>
                                    <div className="close" onClick={_menuToggle} >
                                        <img src="/static/images/Hamburger-2.png" alt="menu" className="img-fluid menu-icon" />
                                    </div>
                                    <div className="home LogoHamberger" onClick={() => window.location.href = list.url}>
                                        <LazyLoadImage src={logo} alt="logo" className="img-fluid" />
                                    </div>
                                </Row>
                            </li>
                            {isConnected && isLoadData && !session.isLogin &&
                                <li key={`main-login`} ref={0} className="line-break">
                                    <Row className="pl-0 m-0">
                                        { !window.location.href.includes('v.com') &&
                                        <Col xs={6} className="p-0">
                                            <Row className="m-0">
                                                <Col xs={12} className="col-menu-button" >
                                                    <button className="button buttonRegisterCollapseMenu" onClick={() => (isConnected ? this.props.onSetRegisterModal(true) : {})}>
                                                        {locale.t('register').toLocaleUpperCase()}
                                                    </button>
                                                </Col>
                                            </Row>
                                        </Col>
                                        }
                                        <Col xs={6} className="p-0">
                                            <Row className="m-0 pl-0">
                                                <Col xs={12} className="col-menu-button" >
                                                    <button className="button buttonLoginCollapseMenu" onClick={() => (isConnected ? this.props.onSetLoginModal(true) : {})}>
                                                        {locale.t('login').toLocaleUpperCase()}
                                                    </button>
                                                </Col>
                                            </Row>
                                        </Col>

                                    </Row>
                                </li>
                            }
                            {session.isLogin &&
                                <Fragment key={`main-balance`}>
                                    <li ref={0} className="line-break">
                                        <Row className=''>
                                            <Col xs={12} className='MyProfile'>
                                                <img className='IconAvatar' src="/static/images/Circle-icons-profile.svg.png" />
                                                <div className='Fullname'>
                                                    <span className={session.userInfo.isEmailVerified ? 'Verified' : 'UnVerified'}>
                                                        {session.userInfo.isEmailVerified ? 'Verified' : 'UnVerified'}
                                                    </span>
                                                    <div className='name'>{`${session.userInfo.firstname} ${session.userInfo.surname}`}</div>
                                                </div>
                                                <a className='btn buttonRegister my-3 text-uppercase' href='/account/my-profile'>{locale.t('my-profile')}</a>
                                            </Col>
                                        </Row>
                                    </li>
                                    <li ref={0} className="line-break totalBalance">
                                        <Row className='mb-3 mt-3'>
                                            <Col xs={6} sm={4}>
                                                <p className="text title">{locale.t('balance')}</p>
                                                <h1 className="m-0 text number">{`${convertComma(totalWallets)} ${getSymbol(currencyWallets)}`}</h1>
                                            </Col>
                                            <Col xs={6} sm={4}>
                                                <p className="text title">{locale.t('bonusBalance')}</p>
                                                <h1 className="m-0 text number">{`${convertComma(totalBonusWallets)} ${getSymbol(currencyWallets)}`}</h1>
                                            </Col>
                                            <Col xs={6} sm={4}>
                                                <p className="text title">{locale.t('totalBalance')}</p>
                                                <h1 className="m-0 text number">{`${convertComma(total)} ${getSymbol(currencyWallets)}`}</h1>
                                            </Col>
                                        </Row>
                                    </li>
                                    <li key={`main-deposit`} className={pathname == '/account/deposit' ? 'active':''} ref={0}>
                                        <a href='/account/deposit'>
                                            <Row className="m-0">
                                                <div className="col-beside">
                                                    <i className="jb-icon icon-list deposit" />
                                                </div>
                                                <div className="col-menu top">
                                                    {locale.t('deposit')}
                                                </div>
                                                <div className="col-beside top">
                                                </div>
                                            </Row>
                                        </a>
                                    </li>
                                </Fragment>
                            }
                            {
                                menus && Object.keys(menus).length > 0 ? menus.map((menu, i) => {
                                    if (menu.childItems.length > 0) {
                                        return (
                                            <li className={menu.isActived ? 'active' : ''} key={`main-${menu.id}`} ref={i + 1}>
                                                <a onClick={() => this.setSubMenus(menu)}>
                                                    <Row className="m-0">
                                                        <div className="col-beside-icon">
                                                            <i className={"jb-icon icon-list " + menu.classes} />
                                                        </div>
                                                        <div className={`col-menu ${menu.classes}`}>
                                                            {menu.title}
                                                        </div>
                                                        <div className="col-beside">
                                                            <i className="jb-icon casino-arrow-right" />
                                                        </div>
                                                    </Row>
                                                </a>
                                            </li>
                                        )
                                    } else {
                                        return (
                                            <li className={`${menu.classes} ${menu.isActived ? 'active' : ''}`} key={`main-${menu.id}`} ref={i + 1}>
                                                <a href={menu.url}>
                                                    <Row className="m-0">
                                                        <div className="col-beside-icon">
                                                            <i className={"jb-icon icon-list " + menu.classes} />
                                                        </div>
                                                        <div className={`col-menu `}>
                                                            {menu.title}
                                                        </div>
                                                        <div className="col-beside">
                                                        </div>
                                                    </Row>
                                                </a>
                                            </li>
                                        )
                                    }
                                })
                                    : null
                            }
                            <li key={`main-Languages`} ref={Object.keys(menus).length + 1} className="line-break py-3">
                                <a onClick={() => this.setSubMenusLanguages(menu)}><ListMenusLanguages {...this.props} /></a>
                                <a onClick={() => this.updateThemeOnHtmlElement()} className="mode-theme">
                                    <Row className="m-0">
                                        <div className="col-beside img-language">
                                            {theme === 'dark' ? <img src={`/static/images/sun-icon.svg`} className="d-block img-fluid" /> : <img src={`/static/images/moon-icon.svg`} className="d-block img-fluid" />}
                                        </div>
                                        <div className="col-menu">
                                            {theme === 'dark' ? locale.t('lightMode') : locale.t('darkMode')}
                                        </div>
                                        <div className="col-beside">
                                            {/* <i className="jb-icon casino-arrow-right" /> */}
                                        </div>
                                    </Row>
                                </a>
                            </li>
                            {
                                session.isLogin &&
                                <li key={`main-logout`} ref={0} className="logout-menu">
                                    <a onClick={() => this.logout()}>
                                        <Row className="m-0">
                                            <div className="col-beside-icon">
                                                <SetInnerHtml tagName="span" htmlProps={{ className: 'icon' }} innerHtml={LoggedoutIcon} />
                                                {/* <img className='Icon' src={"/static/images/account/logout-svgrepo-com.svg"} alt={'logout'} /> */}
                                            </div >
                                            <div className="col-menu">
                                                {locale.t('logout')}
                                            </div >
                                        </Row>
                                    </a>
                                </li>
                            }
                            {/* <li key={`main-switch-web`} className="text-mobile-switch-web">
                                <p className="m-0">{locale.t('switchTo')}</p><a href="https://mrxbet8.com" onClick={()=> this.onModalSwitch.countAndRedirect()}><p className="m-0">{locale.t('classicSite')}</p></a>
                            </li> */}
                        </ul>
                    </div>
                    <div className="backdrop-menu" onClick={_menuToggle}></div>
                </div>
                <SubMenuLanguages {...this.state} {...this.props} subMenuActive={subMenuActive} subMenuStatus={subLangStatus} _subMenuToggle={this._subLanguagesToggle} _menuToggle={this._menuLangToggle} setLanguages={this.setLanguages} />
                <SubMenuLinks {...this.state} subMenuActive={subMenuActive} subMenuStatus={subMenuStatus} _subMenuToggle={this._subMenuToggle} _menuToggle={this._menuToggle} />
                <ModalSwitch ref={ref => this.onModalSwitch = ref} />
            </Fragment>
        )
    }
}

const mapDispatchToProps = (dispatch) => ({
    onSetTheme: (active) => dispatch({ type: THEME, active }),
});

export default connect(
    null,
    mapDispatchToProps
)(MenuLinks);