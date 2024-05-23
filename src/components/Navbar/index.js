
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import '../../../styles/components/_navbar.scss';
import Moment from 'react-moment'
import Router from 'next/router';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Collapse from 'react-bootstrap/Collapse';
import Dropdown from 'react-bootstrap/Dropdown';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {
    LANGUAGESACTIVE,
    SETUSERINFO,
    REGISTERMODAL,
    DEPOSITMODAL,
    SET_USER_PROFILE,
    LOGINMODAL,
    CURRENCY,
    WALLETS,
    SET_ISLOGIN,
    CALLBACKSHOW,
    MESSAGEMODAL,
    THEME,
} from "../../constants/types";
import {
    setCookie,
    getLangSplit,
    getLangSplitID,
    replaceSpecialCharacters,
    getCookie,
    getQueryString,
    getSymbol,
    convertComma,
    fetchPost,
    overrideLink,
    countriesBlock,
    countriesBlockLogin,
    delCookie,
    getLogoHeder
} from '../../../utils'
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Register from '../Register'
import Login from '../Login'
import CountryPopup from './countryPopup'
import UserService from '../../services/em/user'
import WPService from '../../../services'
import * as userParams from '../../constants/userParams'
import ModalMessage from '../Modals/message'
import AllDetail from '../Modals/AllDetail'
import Deposit from '../DepositPopup';
import UserConsent from './userConsent'
import UserTC from './userTC'
import ResetPassword from './ResetPassword'
import isUndefined from 'lodash/isUndefined'
import filter from 'lodash/filter'
import isNull from 'lodash/isNull'
import forEach from 'lodash/forEach'
import upperCase from 'lodash/upperCase'
import first from 'lodash/first'
import find from 'lodash/find'
import isEmpty from 'lodash/isEmpty'
import head from 'lodash/head'
import includes from 'lodash/includes'
import merge from 'lodash/merge'
import sumBy from 'lodash/sumBy'
import MenusLanguages from './language';
import MainMenuLinks from './menu-header';
import Totalbalance from './totalbalance';
import ProfileMenu from './profileMenu';
import FFPpoints from './FFPpoints';
import ModalSwitch from './ModalSwitch';
import MyModalPopup from './MyModalPopup';

const locale = require('react-redux-i18n').I18n
const config = require(`../../../config`).config;
const fetch = require('isomorphic-unfetch');

import MenuLinks from './MenuLinks'

import axios from 'axios';

// let isOpenColl = true
// class MainMenuLinks extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             menus: [],
//             subMenu: [],
//             menuActive: { url: '' },
//             subMenuActive: { url: '' },
//         }
//     }

//     /** Fetch menu from CMS */
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
//         this.setState({ menus: res, subMenu, menuActive, subMenuActive })
//     }

//     componentDidMount() {
//         this.getMenu();
//     }
//     UNSAFE_componentWillReceiveProps(nextProps) {
//         if (nextProps.mainMenu !== this.props.mainMenu) {
//             this.getMenu();
//         }
//     }
//     componentDidUpdate() {

//         if (this.props.openCollapse) {
//             isOpenColl = false
//         }
//         if (!this.props.openCollapse && isOpenColl) {
//             let navbarHeaderbar = document.getElementsByClassName('navbar-headerbar')
//             document.getElementsByClassName('body-custom')[0].style.paddingTop = `${navbarHeaderbar[0].clientHeight}px`
//         }
//     }

//     render() {
//         let { sticky } = this.props;
//         let { menus, subMenu, menuActive, subMenuActive } = this.state;
//         let stickyClass = sticky ? "sticky" : ""
//         if (subMenuActive.url == '/casino/live-casino') {
//             return (
//                 <div>
//                     <div className={"main-menu hide-mobile hide-tablet " + stickyClass}>
//                         <div className="container container-custom">
//                             <Nav activeKey={'/casino/live-casino'}>
//                                 {
//                                     menus && menus.length ? menus.map((menu, i) => {
//                                         return (
//                                             <Nav.Item key={`main-${menu.id}-${Math.random()}`}>
//                                                 <Nav.Link href={menu.url}><i className={`jb-icon icon-default ${menu.classes}`}></i>{menu.title}</Nav.Link>
//                                             </Nav.Item>
//                                         )
//                                     })
//                                         :
//                                         null
//                                 }
//                             </Nav>
//                         </div>
//                     </div>
//                     <div className={!isUndefined(subMenu) && subMenu.length ? "main-sub-menu hide-mobile hide-tablet show-sub-menu" + stickyClass : "main-sub-menu hide-mobile hide-tablet "} style={!isUndefined(subMenu) && subMenu.length ? {} : { display: 'none' }}>
//                         <div className="container container-custom">
//                             <Nav activeKey={subMenuActive && subMenuActive.url ? subMenuActive.url : `/`}>
//                                 {
//                                     subMenu && subMenu.length ? subMenu.map((subMenu, i) => {
//                                         return (
//                                             <Nav.Item key={`main-${subMenu.id}-${Math.random()}`}>
//                                                 <Nav.Link href={subMenu.url}>{subMenu.title}</Nav.Link>
//                                             </Nav.Item>
//                                         )
//                                     })
//                                         :
//                                         null
//                                 }
//                             </Nav>
//                         </div>
//                     </div>
//                 </div>
//             )
//         }
//         else if (subMenuActive.url == '/sports/live-sports/live-sports/football/1/all/0') {
//             return (
//                 <div>
//                     <div className={"main-menu hide-mobile hide-tablet " + stickyClass}>
//                         <div className="container container-custom">
//                             <Nav activeKey={'/sports/live-sports/live-sports/football/1/all/0'}>
//                                 {
//                                     menus && menus.length ? menus.map((menu, i) => {
//                                         return (
//                                             <Nav.Item key={`main-${menu.id}-${Math.random()}`}>
//                                                 <Nav.Link href={menu.url}><i className={`jb-icon icon-default ${menu.classes}`}></i>{menu.title}</Nav.Link>
//                                             </Nav.Item>
//                                         )
//                                     })
//                                         :
//                                         null
//                                 }
//                             </Nav>
//                         </div>
//                     </div>
//                     <div className={!isUndefined(subMenu) && subMenu.length ? "main-sub-menu hide-mobile hide-tablet show-sub-menu" + stickyClass : "main-sub-menu hide-mobile hide-tablet "} style={!isUndefined(subMenu) && subMenu.length ? {} : { display: 'none' }}>
//                         <div className="container container-custom">
//                             <Nav activeKey={subMenuActive && subMenuActive.url ? subMenuActive.url : `/`}>
//                                 {
//                                     subMenu && subMenu.length ? subMenu.map((subMenu, i) => {
//                                         return (
//                                             <Nav.Item key={`main-${subMenu.id}-${Math.random()}`}>
//                                                 <Nav.Link href={subMenu.url}>{subMenu.title}</Nav.Link>
//                                             </Nav.Item>
//                                         )
//                                     })
//                                         :
//                                         null
//                                 }
//                             </Nav>
//                         </div>
//                     </div>
//                 </div>
//             )

//         }
//         else {
//             return (
//                 <div>
//                     <div className={"main-menu hide-mobile hide-tablet " + stickyClass}>
//                         <div className="container container-custom">
//                             <Nav activeKey={menuActive.url ? menuActive.url : `/`}>
//                                 {
//                                     menus && menus.length ? menus.map((menu, i) => {
//                                         return (
//                                             <Nav.Item key={`main-${menu.id}-${Math.random()}`}>
//                                                 <Nav.Link href={menu.url}><i className={`jb-icon icon-default ${menu.classes}`}></i>{menu.title}</Nav.Link>
//                                             </Nav.Item>
//                                         )
//                                     })
//                                         :
//                                         null
//                                 }
//                             </Nav>
//                         </div>
//                     </div>
//                     <div className={!isUndefined(subMenu) && subMenu.length ? "main-sub-menu hide-mobile hide-tablet show-sub-menu" + stickyClass : "main-sub-menu hide-mobile hide-tablet "} style={!isUndefined(subMenu) && subMenu.length ? {} : { display: 'none' }}>
//                         <div className="container container-custom">
//                             <Nav activeKey={subMenuActive && subMenuActive.url ? subMenuActive.url : `/`}>
//                                 {
//                                     subMenu && subMenu.length ? subMenu.map((subMenu, i) => {
//                                         return (
//                                             <Nav.Item key={`main-${subMenu.id}-${Math.random()}`}>
//                                                 <Nav.Link href={subMenu.url}>{subMenu.title}</Nav.Link>
//                                             </Nav.Item>
//                                         )
//                                     })
//                                         :
//                                         null
//                                 }
//                             </Nav>
//                         </div>
//                     </div>
//                 </div>
//             )

//         }
//     }
// }


class Navber extends Component {
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
            isLoadData: false,
            isSticky: false,
            openCollapse: false,
            countryPopupShow: false,
            reloadDouble: false,
            openTotalBalance: false,
            theme: 'dark'
        }
    }

    UNSAFE_componentWillMount() {
        if (typeof window !== 'undefined') {
            let force = getQueryString('force')
            if (force === '1') {
                localStorage.clear()
                // this.props.onSetUser({isLogin: null})
                // this.clearLocalStorage()
            } else {
                if (localStorage.length) {
                    let keyArr = ['sessionId', 'userInfo', 'profile', 'currency', 'balance', 'timeStore', 'theme-html', 'wdlastestAc']
                    const HOUR = 1000 * 60 * 15;
                    const anHourAgo = new Date() - HOUR;
                    let timeStore = localStorage.getItem('timeStore');
                    if (isNull(timeStore)) {
                        localStorage.setItem('timeStore', new Date());
                    } else {
                        if (anHourAgo > new Date(timeStore).getTime()) {
                            Object.keys(localStorage).map((key, index) => {
                                if (!includes(keyArr, key)) {
                                    localStorage.removeItem(key)
                                }
                            })
                            localStorage.setItem('timeStore', new Date());
                        }
                    }
                }
            }
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.isConnected !== this.props.isConnected) {
            if (nextProps.isConnected) {
                this.onSession()
            }
            // if (nextProps.isConnected === false) {
            //     localStorage.setItem('userInfo', '');
            //     localStorage.setItem('sessionId', '');
            //     setCookie('isLogin', false, 375)
            //     setCookie('role', JSON.stringify(['anonymous']), 375)
            //     window.location.href = '/'
            // }
        }
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
        if (nextProps.session.currentCountry !== this.props.session.currentCountry) {
            if (nextProps.session.currentCountry.toUpperCase() === 'GB') {
                const acceptCountry = getCookie('acceptCountry', document.cookie)
                if (isEmpty(acceptCountry)) {
                    this.setState({
                        countryPopupShow: true
                    })
                }
            }
        }
    }

    onSession = () => {
        const sessionIdRes = localStorage.getItem('sessionId')
        // if (!isUndefined(sessionIdRes) && !isNull(sessionIdRes) && !isEmpty(sessionIdRes)) {
        //     const response = {
        //         sessionId: JSON.parse(sessionIdRes)
        //     }
        //     UserService.loginWithCmsSessionID(response).then((res) => {
        //         this.onGetUserLocal()
        //     }).catch((err) => {
        //         this.onGetUserLocal()
        //     })
        // } else {
        this.onGetUserLocal()
        // }
        UserService.sessionStateChange(this.sessionStateChange)
        this.verificationCode()
        let type = getQueryString('m')
        if (type == 'register') {
            setTimeout(() => {
                if(this.register){
                    this.register.isOpen()
                }
            },1000)
            // this.props.onSetRegisterModal(true);
        }
    }

    componentDidMount() {
        window.addEventListener("resize", this.resize.bind(this));
        window.addEventListener('scroll', this.handleScroll);

        this.resize();
        const decodedCookie = decodeURIComponent(replaceSpecialCharacters(document.cookie));
        if (!isEmpty(decodedCookie)) {
            const isLogin = getCookie('isLogin', decodedCookie)
            if (!isEmpty(isLogin)) {
                if (isLogin === 'false') {
                    this.setState({
                        isLoadData: true
                    }, () => setCookie('role', JSON.stringify(['anonymous']), 375))
                } else {
                    this.onGetUserLocal(true)
                }
            } else {
                this.setState({
                    isLoadData: true
                }, () => {
                    setCookie('role', JSON.stringify(['anonymous']), 375)
                    setCookie('isLogin', false, 375)
                })
            }
        } else {
            this.setState({
                isLoadData: true
            }, () => {
                setCookie('role', JSON.stringify(['anonymous']), 375)
                setCookie('isLogin', false, 375)
            })
        }

        Router.events.on('routeChangeComplete', (err, url) => {
            if (this.state.isOpen) {
                this._menuToggle()
            }
        })

        let type = getQueryString('m')
        let btag = getQueryString('btag')
        if (!isEmpty(btag)) {
            setCookie('btag', btag, 30)
        }
        if (type == 'register') {
            // setTimeout(() => {

            //     this.register.isOpen()
            // },1000)
            // this.props.onSetRegisterModal(true);
        } else if (type == 'deposit') {
            this.props.onSetDepositModal(true);
        }

        const theme = localStorage.getItem('theme-html') || 'dark';
        document.querySelector("html").setAttribute("data-theme", theme);
        this.setState({ theme });

    }

    onGetUserLocal = (m = false) => {
        const sessionIdRes = localStorage.getItem('sessionId')
        const userInfoRes = localStorage.getItem('userInfo')
        const profileRes = localStorage.getItem('profile')
        const currencyRes = localStorage.getItem('currency')
        const balanceRes = localStorage.getItem('balance')
        if (m) {
            if (!isUndefined(sessionIdRes) && !isNull(sessionIdRes) && !isEmpty(sessionIdRes)) {
                if (!isUndefined(userInfoRes) && !isNull(userInfoRes) && !isEmpty(userInfoRes) && !isUndefined(profileRes) && !isNull(profileRes) && !isEmpty(profileRes) && !isUndefined(balanceRes) && !isNull(balanceRes) && !isEmpty(balanceRes)) {
                    let active = {
                        userInfo: JSON.parse(userInfoRes),
                        isLogin: true
                    }
                    let profile = JSON.parse(profileRes);
                    let balance = JSON.parse(balanceRes);
                    this.onSetUserToProps(active, profile, currencyRes)
                    this.onSetBalanceToProps(balance)
                }
            }
        } else {
            UserService.getSessionInfo({ culture: this.props.lang }).then((res) => {
                if (isNull(res.email)) {
                    this.clearLocalStorage();
                } else {

                    UserService.watchBalance()
                    UserService.balanceChanged(this.setBalance)
                    if (!isUndefined(sessionIdRes) && !isNull(sessionIdRes) && !isEmpty(sessionIdRes)) {
                        if (!isUndefined(userInfoRes) && !isNull(userInfoRes) && !isEmpty(userInfoRes) && !isUndefined(profileRes) && !isNull(profileRes) && !isEmpty(profileRes) && !isUndefined(balanceRes) && !isNull(balanceRes) && !isEmpty(balanceRes)) {
                            let active = {
                                userInfo: JSON.parse(userInfoRes),
                                isLogin: true
                            }
                            let profile = JSON.parse(profileRes);
                            let balance = JSON.parse(balanceRes);
                            this.onSetUserToProps(active, profile, currencyRes)
                            this.onSetBalanceToProps(balance)
                        }
                    }
                }
            }).catch((err) => {
                console.log('err', err)
            })
        }
    }

    onSetUserLocal = (userInfo, sessionId, profile, currency) => {
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        localStorage.setItem('sessionId', JSON.stringify(sessionId));
        localStorage.setItem('profile', JSON.stringify(profile));
        localStorage.setItem('currency', JSON.stringify(currency));
    }

    onSetBalanceToProps = (balance) => {
        this.setState({
            reloadDouble: false
        }, () => {
            this.props.onSetWallets(balance)
        })
    }

    onSetUserToProps = (active, profile, currency) => {
        this.props.onSetUser(active)
        this.props.onSetUserProfile(profile)
        this.props.onSetUserCurrency(currency)
    }

    handleScroll = () => {
        if (window.scrollY > 0) {
            this.setState({
                isSticky: true
            })
        }
        else {
            this.setState({
                isSticky: false
            })
        }
    }
    getSessionInfoChange = async () => {
        try {
            const getSessionInfo = await UserService.getSessionInfo({ culture: this.props.lang })
            const getUserProfile = await UserService.getUserProfile()
            const getNetDeposit = await UserService.getNetDeposit()
            const getCmsSessionID = await UserService.getCmsSessionID()
            return { getSessionInfo, getUserProfile, getNetDeposit, getCmsSessionID }
        } catch (err) {
            console.log('err', err)
        }
    }

    sessionStateChange = (data) => {
        if (!isUndefined(data.code) && data.code === 0) {
            this.getSessionInfoChange().then((res) => {
                // const params = {
                //     name: '-'
                //Call to send userId and domain to save user info
                //
                // }
                if(!window.location.href.includes('v.com')) this.callApiUserSwitchSites(res.getSessionInfo.userID);
                this._renderTrackingRegister(res.getSessionInfo.userID)
                let roles = res.getSessionInfo.roles
                let assignRole = '';
                if (roles && roles.indexOf('loyal_customer') >= 0) {
                    assignRole = '';
                } else if (roles && roles.indexOf('new_customer_4') >= 0) {
                    assignRole = '';
                } else if (roles && roles.indexOf('new_customer_3') >= 0) {
                    assignRole = '';
                } else if (roles && roles.indexOf('new_customer_2') >= 0) {
                    assignRole = '';
                } else if (roles && roles.indexOf('new_customer_1') >= 0) {
                    assignRole = '';
                } else if (roles && roles.indexOf('new_customer_0') >= 0) {
                    assignRole = '';
                } else {
                    assignRole = 'new_customer_0';
                }
                if (assignRole) {
                    const params = {
                        name: 'new_customer_0'
                    }
                    fetchPost('/getUsersRoles', params, '').then((resGet) => {
                        if (!isUndefined(resGet) && !isUndefined(resGet.data) && !isUndefined(resGet.data.id)) {
                            const params2 = {
                                roleId: resGet.data.id,
                                userID: res.getSessionInfo.userID
                            }
                            fetchPost('/assignUserRole', params2, '')
                            setCookie('role', JSON.stringify([...roles, 'new_customer_0']), 375)
                        }
                    })
                } else {
                    setCookie('role', JSON.stringify(res.getSessionInfo.roles), 375)
                }

                let assignWebRole = true;
                for (let index in config.webRoles) {
                    if (includes(roles, config.webRoles[index])) {
                        assignWebRole = false
                    }
                }
                if (assignWebRole) {
                    fetchPost('/getUsersRoles', { name: config.webRole }, '').then((resGet) => {
                        if (resGet.status) {
                            if (!isUndefined(resGet.data) && resGet.data) {
                                fetchPost('/assignUserRole', {
                                    roleId: resGet.data.id,
                                    userID: res.getSessionInfo.userID
                                }, '')
                            }
                        }
                    })
                }

                setCookie('isLogin', true, 375)
                const _merge = res.getSessionInfo
                const profile = merge(res.getUserProfile, res.getNetDeposit)
                let active = {
                    userInfo: _merge,
                    isLogin: true
                }

                this.onSetUserLocal(_merge, res.getCmsSessionID.cmsSessionID, profile, _merge.currency)
                this.onSetUserToProps(active, profile, _merge.currency)
                this.setBalance()
            }).catch((err) => {
                console.log('err', err)
            })
        } else {
            localStorage.setItem('userInfo', '');
            localStorage.setItem('sessionId', '');
            setCookie('isLogin', false, 375)
            setCookie('role', JSON.stringify(['anonymous']), 375)
            let active = {
                userInfo: {},
                isLogin: false
            }
            this.props.onSetUser(active)
            this.props.onSetUserProfile({})
            window.location.reload()
        }
    }
    setBalance = () => {
        UserService.getGamingAccounts().then((res) => {
            if (!isUndefined(res.accounts)) {
                UserService.getGrantedBonuses({ skipRecords: 0, maxRecords: 999, status: 'active' }).then((data) => {
                    //let sumBonus = 0
                    let currencyBonus = ''
                    const real = filter(res.accounts, (o) => !o.isBonusAccount)
                    const bonus = filter(res.accounts, (o) => o.isBonusAccount)
                    //if (Object.keys(data).length > 0 && data.totalRecords > 0) {
                    //    const ACCEPTED_BONUS_STATUSES = ['active', 'Granted'];
                    //    const EXCLUDED_BONUS_TYPES = ['freeBet', 'cashBack', 'freeRound', 'wagering', 'oddsBoost'];
                    //    sumBonus = sumBy(data.bonuses, function (o) { return (includes(ACCEPTED_BONUS_STATUSES, o.status) && !includes(EXCLUDED_BONUS_TYPES, o.type)) ? o.remainingAmount : 0; });
                    //}

                    if (real.length > 0) {
                        currencyBonus = head(real).currency
                        let acc = {
                            name: "MainWallet",
                            realMoney: sumBy(real, 'amount'),
                            realMoneyCurrency: head(real).currency,
                            bonusMoney: sumBy(bonus, 'amount'),
                            bonusMoneyCurrency: currencyBonus,
                            lockedMoney: 0,
                            lockedMoneyCurrency: null,
                        }
                        localStorage.setItem('balance', JSON.stringify(acc));
                        this.onSetBalanceToProps(acc)
                    }
                }).catch((err) => {
                    console.log("bonuses err", err);
                })
            }
        }).catch((err) => {
            console.log('err getGamingAccounts ', err)
            //this.message.isOpen(locale.t('error'), err.desc, err.detail, 'error')
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
        // if (!this.state.isOpen) {
        //     document.body.classList.add('main-menu-active')
        // } else {
        //     document.body.classList.remove('main-menu-active')
        // }

        // this.setState({
        //     isOpen: !this.state.isOpen
        // });
    }

    loginToggle = () => {
        this.setState({
            isLoginOpen: !this.state.isLoginOpen
        });
    }

    setLanguages = (res) => {
        let active = res.id.indexOf("-") > 0 ? getLangSplitID(res.id) : res.id
        setCookie('lang', active, 375)
        let slug = filter(window.location.pathname.split('/'), function (el) { return el; }).pop();
        WPService.getPermalink(active, slug, this.props.pageData.postType || 'no').then((data) => {
            if (data.link !== '/') {
                window.location = overrideLink(data.link + window.location.hash)
            } else {
                if (this.props.slug === 'home') {
                    window.location = overrideLink(data.link)
                } else {
                    window.location = '/'
                }
            }
        })
    }

    loginTrue = (isPromotion, promotionRegister) => {
        if (isPromotion && promotionRegister) {
            if (JSON.parse(isPromotion)) {
                setCookie('is-promotion-register-login', false, 7)
                // this.login.isClose()
                // window.location.href = '/account/deposit'
                this.setState({
                    isLoading: false,
                    isloginFade: false
                }, () => {
                    this.login.isClose()
                    this.props.onSetCallbackShow(true)
                    // window.location.reload()
                })
            } else {
                this.setState({
                    isLoading: false,
                    isloginFade: false
                }, () => {
                    this.login.isClose()
                    this.props.onSetCallbackShow(true)
                    // window.location.reload()
                })
            }
        } else {
            this.setState({
                isLoading: false,
                isloginFade: false
            }, () => {
                this.login.isClose()
                this.props.onSetCallbackShow(true)
                // window.location.reload()
            })
        }
    }
    
    async callApiToSaveUserLoginDetails(user_id) {
        try{
            let res = await fetch('https://api.mypts.cc/api/UserLogins', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    UserId: user_id,
                    ProductId: 15,
                    Website: window.location.hostname
                })
            })
            //console.log('res', res)
        } catch(e) {
            console.log('Error callApiToSaveUserLoginDetails:', e);
        }
    } 

    async callApiUserSwitchSites(user_id) {
        try{
            let res = await fetch('https://api.mypts.cc/api/userSwitchSites', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    UserId: user_id,
                    ProductId: 15,
                    sourceUrl: window.location.hostname
                })
            })

            const data = await res.json();

            //console.log('userSwitchSites:', data);
            if (!isUndefined(data) && !isNull(res) && !isEmpty(data)){
                if(data.url != '')
                    this.onModalPopup.GetReadyToRedirect(data.url);
            }     
        } catch(e) {
            console.log('Error userSwitchSites:', e);
        }
    }

    loginSubmit = (event) => {
        if (WPService.countriesBlockLogin(this.props.session.currentCountry)) {
            const set = { messageTitle: locale.t('error'), messageDesc: locale.t('msgBlock'), messageDetail: "", messageType: 'error' }
            this.setState({ isLoading: false }, () => this.props.onSetMessageModal(set))
            event.preventDefault();
            return false;
        }
        let form = event.target
        userParams.loginParams.password = form.elements.password.value;
        userParams.loginParams.usernameOrEmail = form.elements.usernameOrEmail.value;
        this.setState({
            isLoading: true
        })
        //console.log('event => ', form.elements['g-recaptcha-response'].value)
        UserService.login(userParams.loginParams).then(
            (result) => {
                if (result.hasToSetUserConsent) {
                    this.userConsent.isOpen(false)
                } else if (result.hasToAcceptTC) {
                    this.userTC.isOpen()
                } else {
                    if (!isNull(result.username)) {
                        this.getSessionInfoChange().then((res) => {
                            //if(!window.location.href.includes('v.com')) 
                            this.callApiToSaveUserLoginDetails(res.getSessionInfo.userID);
                            this._renderTrackingLogin(res.getSessionInfo.userID)

                            if (result.loginCount < 1) {
                                let myCookies = getCookie('__limitset_pop', document.cookie)

                                if (isEmpty(myCookies)) {
                                    setCookie('__limitset_pop', "false", 375)
                                }
                            } else {
                                setCookie('__limitset_pop', "true", 375)
                            }
                            this.setBalance()
                            const _merge = res.getSessionInfo

                            const profile = merge(res.getUserProfile, res.getNetDeposit)
                            const decodedCookie = decodeURIComponent(replaceSpecialCharacters(document.cookie));
                            const isPromotion = getCookie('is-promotion-register-login', decodedCookie)
                            const promotionRegister = getCookie('promotion-register', decodedCookie)
                            let active = {
                                userInfo: _merge,
                                isLogin: true
                            }
                            setCookie('isLogin', true, 375)
                            this.onSetUserLocal(res.getSessionInfo, res.getCmsSessionID.cmsSessionID, profile, res.getSessionInfo.currency)
                            this.onSetUserToProps(active, profile, res.getSessionInfo.currency)
                            let roles = res.getSessionInfo.roles
                            let assignRole = '';
                            if (roles && roles.indexOf('loyal_customer') >= 0) {
                                assignRole = '';
                            } else if (roles && roles.indexOf('new_customer_4') >= 0) {
                                assignRole = '';
                            } else if (roles && roles.indexOf('new_customer_3') >= 0) {
                                assignRole = '';
                            } else if (roles && roles.indexOf('new_customer_2') >= 0) {
                                assignRole = '';
                            } else if (roles && roles.indexOf('new_customer_1') >= 0) {
                                assignRole = '';
                            } else if (roles && roles.indexOf('new_customer_0') >= 0) {
                                assignRole = '';
                            } else {
                                assignRole = 'new_customer_0';
                            }
                        
                            if (assignRole) {
                                const params = {
                                    name: 'new_customer_0'
                                }
                                fetchPost('/getUsersRoles', params, this.props.csrfToken).then((resGet) => {
                                    if (resGet.status) {
                                        if (!isUndefined(resGet.data) && resGet.data) {
                                            const params2 = {
                                                roleId: resGet.data.id,
                                                userID: _merge.userID
                                            }
                                            setCookie('role', JSON.stringify([...roles, 'new_customer_0']), 375)
                                            fetchPost('/assignUserRole', params2, this.props.csrfToken)
                                            this.loginTrue(isPromotion, promotionRegister)
                                        }
                                    } else {
                                        this.loginTrue(isPromotion, promotionRegister)
                                    }
                                })
                            } else {
                                setCookie('role', JSON.stringify(res.getSessionInfo.roles), 375)
                                this.loginTrue(isPromotion, promotionRegister)
                            }
                            window.location.reload();
                        }).catch((err) => {
                            this.setState({
                                isLoading: false
                            }, () => {
                                this.message.isOpen(locale.t('error'), err.desc, err.detail, 'error')
                            })
                            window.location.reload();
                        })
                    }
                }
            }).catch((err) => {
                if (includes(err.desc, 'already logged in')) {
                    window.location.reload()
                } else {
                    this.setState({
                        isLoading: false
                    }, () => {

                        const descLGFUP = includes(err.desc.toLowerCase(), 'The login failed. Please check your username and password.'.toLowerCase());
                        if (descLGFUP) {
                            this.message.isOpen('failedLogin', '', '', 'error')
                        } else {
                            this.message.isOpen(locale.t('error'), err.desc, err.detail, 'error')
                        }
                    })
                }
            })
        event.preventDefault();
    }

    clearLocalStorage = async () => {
        await localStorage.setItem('userInfo', '');
        await localStorage.setItem('sessionId', '');
        await localStorage.setItem('profile', '');
        await localStorage.setItem('currency', '');
        await localStorage.setItem('balance', '');
        await setCookie('isLogin', false, 375)
        await setCookie('role', JSON.stringify(['anonymous']), 375)
        let active = {
            userInfo: {},
            isLogin: false
        }
        this.props.onSetUser(active)
        this.props.onSetUserProfile({})
    }

    logout = async () => {
        const { session } = this.props
        this.setState({ openCollapse: false })
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

    loginRegister = () => {
        const { onSetRegisterModal } = this.props
        this.setState({
            isLoginOpen: !this.state.isLoginOpen
        }, () => {
            this.login.isClose()
            onSetRegisterModal(true);
        });
    }

    registerLogin = () => {
        this.register.isClose()
        this.login.isOpen()
    }

    loginChange = (event) => {
        const name = event.target.name;
        this.setState({ [name]: event.target.value });
    }

    verificationCode = () => {
        let key = getQueryString('key')
        let email = getQueryString('email')
        let method = getQueryString('method')
        let verificationParams = {
            verificationCode: key
        };
        if (!isNull(method) && !isEmpty(method) && !isNull(key) && !isEmpty(key) && method === 'register') {
            const isResetPwdKeyAvailableParams = {
                key: key
            }
            UserService.isResetPwdKeyAvailable(isResetPwdKeyAvailableParams).then((res) => {
                if (!isUndefined(res.isAvailable) && res.isAvailable) {
                    this.resetPassword.isOpen(key)
                } else {
                    this.message.isOpen(locale.t('error'), window.location.hostname, locale.t('sessionExpired'), 'error')
                }
            }).catch((err) => {
                this.message.isOpen(locale.t('error'), err.desc, err.detail, 'error')
            })

        } else if (!isNull(method) && !isEmpty(method) && !isNull(key) && !isEmpty(key) && method === 'changeEmail') {
            const paramsVerifyNewEmail = {
                key,
                email
            }
            UserService.verifyNewEmail(paramsVerifyNewEmail).then((res) => {
                this.message.isOpen(locale.t('successfully'), locale.t('emailVerifiedSuccessfully'), '', 'success')
            }).catch((err) => {
                this.message.isOpen(locale.t('error'), err.desc, err.detail, 'error')
            })

        } else if (!isNull(verificationParams.verificationCode) && !isEmpty(verificationParams.verificationCode) && isEmpty(method)) {
            UserService.activate(verificationParams).then(
                (result) => {
                    this.userConsent.isOpen(true)
                    setCookie('is-promotion-register-login', true, 7)
                },
                (err) => {
                    this.message.isOpen(locale.t('error'), err.desc, err.detail, 'error')
                }
            )
        }
    }
    _openCollapse = (status) => {
        this.setState({
            openCollapse: status,
            openTotalBalance: false
        })
    }
    openTotalBalance = (status) => {
        this.setState({
            openCollapse: false,
            openTotalBalance: status
        })
    }
    refreshBalance = () => {
        this.setState({
            reloadDouble: true
        }, () => {
            this.setBalance()
        })
    }

    updateThemeOnHtmlElement = () => {
        const newTheme = this.state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme-html', newTheme);
        this.props.onSetTheme({ theme: newTheme });
        this.setState({ theme: newTheme });
        document.querySelector("html").setAttribute("data-theme", newTheme);
    }

    _renderTrackingRegister = (userID) => {
        const trackingRegister = getCookie('tracking-register', document.cookie)
        if (trackingRegister && !isEmpty(trackingRegister)) {
            window._adftrack = Array.isArray(window._adftrack) ? window._adftrack : (window._adftrack ? [window._adftrack] : []);
            window._adftrack.push({
                HttpHost: 'track.adform.net',
                pm: 2667344,
                divider: encodeURIComponent('|'),
                pagename: encodeURIComponent('Exclusivebet_Registeration'),
                order: {
                    orderid: `${userID}`
                }
            });
            (function () { var s = document.createElement('script'); s.type = 'text/javascript'; s.async = true; s.src = 'https://s2.adform.net/banners/scripts/st/trackpoint-async.js'; var x = document.getElementsByTagName('script')[0]; x.parentNode.insertBefore(s, x); })();
            delCookie('tracking-register')
        }
    }


    _renderTrackingLogin = (userID) => {
        window._adftrack = Array.isArray(window._adftrack) ? window._adftrack : (window._adftrack ? [window._adftrack] : []);
        window._adftrack.push({
            HttpHost: 'track.adform.net',
            pm: 2667344,
            divider: encodeURIComponent('|'),
            pagename: encodeURIComponent('Exclusivebet_Login'),
            order: {
                orderid: `${userID}`
            }
        });
        (function () { var s = document.createElement('script'); s.type = 'text/javascript'; s.async = true; s.src = 'https://s2.adform.net/banners/scripts/st/trackpoint-async.js'; var x = document.getElementsByTagName('script')[0]; x.parentNode.insertBefore(s, x); })();
    }

    renderLogin = () => {
        const { session, isConnected } = this.props
        const { hideNav } = this.state
        
        let classPadding1 = 'ml-3 mr-2'
        let classPadding2 = 'mx-2'
        if(hideNav){
            classPadding1 = 'mx-1'
            classPadding2 = 'mx-1'
        }
        return <React.Fragment>
            <div className={`item-nav ${classPadding1}`} onClick={() => (isConnected ? this.register.isOpen() : {})}>
            { !window.location.href.includes('v.com') &&
                <button className="button buttonRegisterWhite">
                    {locale.t('register')}
                </button>
            }
            </div>
            <div className={`item-nav ${classPadding2}`} onClick={() => (isConnected ? this.login.isOpen() : {})}>
                <button className="button buttonLoginNew">
                    {locale.t('login')}
                </button>
            </div>
        </React.Fragment>

    }

    updateThemeOnHtmlElement = () => {
        const newTheme = this.state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme-html', newTheme);
        this.props.onSetTheme({ theme: newTheme });
        this.setState({ theme: newTheme });
        document.querySelector("html").setAttribute("data-theme", newTheme);
    }

    render() {
        const { session, isConnected, mainMenu, session: { userInfo }, useragent } = this.props

        if (!isConnected) return null;
        const { isOpen, isLoading, isSticky, isloginFade, openCollapse, hideNav, user, countryPopupShow, openTotalBalance, theme } = this.state
        let menuShow = isOpen ? 'show-menu' : '';
        let menuStatus = isOpen ? 'isopen' : '';

        let logo = getLogoHeder(false);
        let mobileLogo = getLogoHeder(false);
        // if(theme){
        //      logo = `/static/images/logo${theme === 'light'?'-light':''}.png`;
        //      mobileLogo = `/static/images/logo${theme === 'light'?'-light':''}.png`;
        // }
        let loginClass = isloginFade ? "isopen" : ""
        const currencyWallets = !isUndefined(session.wallets.realMoneyCurrency) ? session.wallets.realMoneyCurrency : 'EUR'
        const currencyBonusWallets = !isUndefined(session.wallets.bonusMoneyCurrency) ? session.wallets.bonusMoneyCurrency : 'EUR'
        const totalWallets = !isUndefined(session.wallets.realMoney) ? session.wallets.realMoney : 0
        const totalBonusWallets = !isUndefined(session.wallets.bonusMoney) ? session.wallets.bonusMoney : 0
        const total = totalWallets + totalBonusWallets
        return (
            <Fragment>
                <header className="navbar-fixed navbar-headerbar" ref={ref => this.htmlNavber = ref}>
                    <div className="box-headerbar">
                        <div className="menubar w-100" >
                            <div className="container-fluid container-custom">

                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="nav-logo">
                                        <div className='Hamburger' onClick={() => this._menuToggle()}>
                                            <LazyLoadImage src={'/static/images/Hamburger-2.png'} alt="menu" className="img-fluid menu-icon" />
                                        </div>
                                        {
                                            <a className="logo" href="/">
                                                <LazyLoadImage src={logo} alt="logo" className="img-fluid logo-pc" />
                                                <LazyLoadImage src={mobileLogo} alt="logo" className="img-fluid logo-mobile" />
                                            </a>
                                        }

                                    </div>
                                    <div className="row nav-right">
                                        {/*
                                            (window.location.href.includes('v.com')) &&
                                            <div className={`text-switch-web px-1 ${session.isLogin ? 'logged-in' : ''}`}>
                                                <button type="button" className="switch-web btn" onClick={() => this.onModalSwitch.countAndRedirect()}>
                                                    {locale.t('classicSite')}
                                                </button>
                                            </div>
                                        */}
                                        {
                                            <div className="item-nav theme-navbar px-1" onClick={() => this.updateThemeOnHtmlElement()}>
                                                {theme !== 'light' ? <img src={`/static/images/sun-icon.svg`} className="d-block img-fluid" /> : <img src={`/static/images/moon-icon.svg`} className="d-block img-fluid" />}
                                            </div>
                                        }
                                        <div className="item-nav langContainer pl-1">
                                            {<MenusLanguages setLanguages={this.setLanguages} onSetLanguagesActive={this.props.onSetLanguagesActive} {...this.props} />}
                                        </div>
                                        {
                                            !session.isLogin && this.renderLogin()
                                        }
                                        {
                                            !isNull(session.isLogin) ? session.isLogin ?
                                                <div
                                                    className='Balance item-nav px-2'
                                                >
                                                    <img
                                                        className='IconAvatar px-2'
                                                        src="/static/images/Circle-icons-profile.svg.png"
                                                        aria-controls="collapse-profile"
                                                        aria-expanded={openCollapse}
                                                        onClick={() => {
                                                            this._openCollapse(!this.state.openCollapse)
                                                        }
                                                        }
                                                    />
                                                    <div
                                                        className='Amount'
                                                        aria-controls="collapse-totalbalance"
                                                        aria-expanded={openTotalBalance}
                                                        onClick={() => {
                                                            this.openTotalBalance(!this.state.openTotalBalance)
                                                        }
                                                        }
                                                    >
                                                        {/*<div>{locale.t('balance')}</div>*/}
                                                        <div>{`${convertComma(total)} ${getSymbol(currencyWallets)}`}</div>
                                                    </div>
                                                </div>
                                                :
                                                null
                                                :
                                                null
                                        }
                                        {
                                            /*!isNull(session.isLogin) ? (session.isLogin ?  <FFPpoints {...this.props}/> : null) : null*/
                                        }
                                        {
                                            !isNull(session.isLogin) ? session.isLogin ?
                                                <div className="item-nav buttonLogin d-flex align-items-center justify-content-center mx-2"
                                                    onClick={() => window.location.href = '/account/deposit'}
                                                >
                                                    {/* <div className="hide-mobile hide-tablet">
                                                        <p className="m-0 px-2">{locale.t('balance')}</p>
                                                        <p className="m-0 px-2">{`${getSymbol(currencyWallets)} ${convertComma(totalWallets)}`}</p>
                                                    </div>
                                                    <div className="hide-mobile hide-tablet">
                                                        <p className="m-0 px-2">{locale.t('bonus')}</p>
                                                        <p className="m-0 px-2">{`${getSymbol(currencyBonusWallets)} ${convertComma(totalBonusWallets)}`}</p>
                                                    </div> */}
                                                    <div className="btn text-uppercase d-flex align-items-center hide-mobile hide-tablet">
                                                        <p className="m-0 px-2">{locale.t('deposit')}</p>
                                                    </div>
                                                    <div className="hide-pc text-uppercase p-0 btn d-flex align-items-center justify-content-center">
                                                        <p className="m-0 px-2">{locale.t('deposit')}</p>
                                                    </div>
                                                </div>
                                                :
                                                null
                                                :
                                                null
                                        }
                                        {/* <div className="item-nav SwitchTheme">
                                        <a onClick={() => this.updateThemeOnHtmlElement()} className="mode-theme">
                                            {theme === 'dark' ? <img src={`/static/images/sun-icon.svg`} className="d-block" /> : <img src={`/static/images/moon-icon.svg`} className="d-block" />}
                                        </a>
                                        </div> */}
                                    </div>
                                </div>
                                
                                <div className='headerMenu'>
                                        {mainMenu ? (mainMenu.length ? <MainMenuLinks {...this.props} sticky={isSticky} openCollapse={openCollapse} /> : null) : null}
                                    </div>
                            </div>
                        </div>
                        {
                            !isNull(session.isLogin) ?
                                session.isLogin ?
                                    <Fragment>
                                        <Totalbalance useragent={useragent} openCollapse={openTotalBalance} onSetTotalBalanceActived={this.props.onSetTotalBalanceActived} handleClose={this.openTotalBalance} />

                                        <ProfileMenu openCollapse={openCollapse} onSetTotalBalanceActived={this.props.onSetTotalBalanceActived} handleClose={this._openCollapse} logout={this.logout} />
                                        {/* <Collapse in={openCollapse} className="">
                                            <div id="collapse-profile" className='ProfileCollapse  container-fluid'>
                                                <h1 className='Title'>{locale.t('profile')}</h1>
                                                <div className='ProfileName'>
                                                    <img className='IconAvatar' src="/static/images/Circle-icons-profile.svg.png" />
                                                    <div className='Fullname'>
                                                        {`${userInfo.firstname} ${userInfo.surname}`}
                                                    </div>
                                                </div>
                                                <div className='UserVerification'>
                                                    <span className={userInfo.isEmailVerified ? 'Verified' : 'UnVerified'}>{locale.t('accountIsVerify')}</span>
                                                </div>
                                                <a className='btn buttonRegister mt-3' href='/account/my-profile'>{locale.t('goTomyProfile')}</a>
                                            </div>
                                        </Collapse> */}
                                    </Fragment>
                                    :
                                    null
                                :
                                null
                        }
                        {
                            !isNull(session.isLogin) && session.isLogin ?
                                <noscript>
                                    <p style="margin:0;padding:0;border:0;">
                                        <img src="https://track.adform.net/Serving/TrackPoint/?pm=2667344&ADFPageName=Exclusivebet_Login&ADFdivider=|" width="1" height="1" alt="" />
                                    </p>
                                    <p style={{ margin: 0, padding: 0, border: 0 }}>
                                        <img src="https://track.adform.net/Serving/TrackPoint/?pm=2667344&ADFPageName=Exclusivebet_Registeration&ADFdivider=|" width="1" height="1" alt="" />
                                    </p>
                                </noscript>
                                : null
                        }

                        {/* <div className={menuShow} onClick={() => this._menuToggle()} /> */}


                        {isConnected && <Register {...this.props} ref={ref => this.register = ref} goToLogin={() => this.registerLogin()} />}
                        {isConnected && <Deposit {...this.props} ref={ref => this.deposit = ref} />}
                        {isConnected && <Login {...this.props}
                            ref={ref => this.login = ref}
                            register={() => this.loginRegister()}
                            loginSubmit={(event) => this.loginSubmit(event)}
                            isLoading={isLoading} />}
                        {/* {this.props.mainMenu.length ? <MainMenuLinks {...this.props} sticky={isSticky} openCollapse={openCollapse} /> : null} */}
                    </div>
                </header>
                <ModalMessage ref={ref => this.message = ref} />
                <ModalSwitch ref={ref => this.onModalSwitch = ref} />
                <MyModalPopup ref={ref => this.onModalPopup = ref} />
                <UserConsent ref={ref => this.userConsent = ref} isLoading={(e) => this.setState({ isLoading: e })} session={session} />
                <UserTC ref={ref => this.userTC = ref} isLoading={(e) => this.setState({ isLoading: e })} session={session} />
                <ResetPassword ref={ref => this.resetPassword = ref} />
                <CountryPopup countryPopupShow={countryPopupShow} isClose={() => this.setState({ countryPopupShow: false })} />
                <CookieModal />
                {/* {!isNull(session.isLogin) ? session.isLogin ? <SetLimitsModal /> : null : null} */}
                <AllDetail lang={this.props.lang} />
                <Fragment>
                    <div id="bg-login-form" className={`hide ${loginClass}`} onClick={() => this.setState({ isloginFade: false })}></div>
                    <div id="login-fade" className={`hide ${loginClass}`}>
                        <Container>
                            <h1 className="pt-2">{locale.t('login')}</h1>
                            <Form onSubmit={(event) => this.loginSubmit(event)}>
                                <Form.Group>
                                    <Form.Control type="text" name="usernameOrEmail" placeholder={locale.t('yourUserName')} required />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Control type="password" name="password" placeholder={locale.t('yourPassword')} required />
                                    <a onClick={() => (isConnected ? this.login.isOpenForgot() : {})}>
                                        <p className="text-forgot">{locale.t('forgotPassword')}</p>
                                    </a>
                                </Form.Group>
                                <Form.Group>
                                    <Button className="top-button log-in btn-block" type="submit">
                                        {isLoading ? <div className="loading-2" /> : <p className="m-0">{locale.t('login')}</p>}
                                    </Button>
                                    { !window.location.href.includes('v.com') &&
                                    <p className="text-register" onClick={() => (isConnected ? this.register.isOpen() : {})}>
                                        {locale.t('register')}
                                    </p>
                                    }
                                </Form.Group>
                            </Form>
                        </Container>
                    </div>
                </Fragment>
                {this.props.mainMenu.length ? <MenuLinks {...this.props} {...this.state} menuStatus={menuStatus} _menuToggle={this._menuToggle} /> : null}
            </Fragment>
        )
    }
}

class SetLimitsModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isSetLimitOpen: 'hide',
            setLimit: ''
        }
    }
    componentDidMount() {
        let myCookies = getCookie('__limitset_pop', document.cookie)

        if (myCookies.length && myCookies == "false") {
            this.setState({ isSetLimitOpen: 'show' })
        } else {
            this.setState({ isSetLimitOpen: 'hide' })
        }
    }
    handleChange = (target) => {
        this.setState({ setLimit: target.value })
    }
    handleSubmit = () => {
        let { setLimit } = this.state
        switch (setLimit) {
            case 'dont':
                setCookie('__limitset_pop', "true", 375)
                this.setState({ isSetLimitOpen: 'hide' })
                break;
            case 'deposit':
            case 'magering':
                setCookie('__limitset_pop', "true", 375)
                this.setState({ isSetLimitOpen: 'hide' }, () => window.location.href = '/account/responsible-gaming')
                break;
            default:
                break;
        }
    }

    render() {
        let { isSetLimitOpen } = this.state

        return (
            <div className={"limit-overlay " + isSetLimitOpen}>
                <div id="set-limit-popup">
                    <div className="limit-box">
                        <h4 className="title-middle text-center pb-3">{locale.t('setYourLimit')}</h4>
                        <Form.Row>
                            <Form.Group as={Col} xs={12} className="check-card">
                                <Form.Check label={` ${locale.t("dontSetLimit")}`} onChange={(e) => this.handleChange(e.target)} name="setlimit" value="dont" type="radio" id={`radio-1`} />
                                <Form.Check label={` ${locale.t("setDepositLimit")}`} onChange={(e) => this.handleChange(e.target)} name="setlimit" value="deposit" type="radio" id={`radio-2`} />
                                <Form.Check label={` ${locale.t("setMageringLimit")}`} onChange={(e) => this.handleChange(e.target)} name="setlimit" value="magering" type="radio" id={`radio-3`} />
                            </Form.Group>
                        </Form.Row>
                        <Button className="btn-cookie" type="button" onClick={() => this.handleSubmit()}>
                            {locale.t('ok')}
                        </Button>
                    </div>
                </div>
            </div>
        )
    }
}

class CookieModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: 'hide',
            cmAcceptedCookies: "no"
        }
    }
    componentDidMount() {
        let myCookies = getCookie('cmAcceptedCookies', document.cookie)
        if (myCookies.length && myCookies == "yes") {
            this.setState({
                cmAcceptedCookies: myCookies,
                isOpen: 'hide'
            })
        } else {
            this.setState({ isOpen: 'show' })
        }
    }
    allowCookie = () => {
        let { cmAcceptedCookies } = this.state

        if (cmAcceptedCookies == "no") {
            setCookie('cmAcceptedCookies', "yes", 375)
            this.setState({
                isOpen: 'hide',
                cmAcceptedCookies: "yes"
            })
        }
    }

    render() {
        let { isOpen } = this.state

        return (
            <div id="cookie-popup" className={isOpen}>
                <Container>
                    <Row className="justify-content-end mt-3">
                        <Col md={12} xs={12} className="">
                            <h4>{locale.t('siteUsesCookies')}</h4>
                            {locale.t('cookieDetails')}
                        </Col>
                        <Col md={12} xs={12} className="">
                            <Row className="mt-3 mb-3">
                                <Col md={6} xs={12} className="mt-2">
                                    <div>
                                        <Button className="btn-cookie w-100" type="button" onClick={() => this.allowCookie()}>
                                            {locale.t('allowCookie')}
                                        </Button>
                                    </div>
                                </Col>
                                <Col md={6} xs={12} className="mt-2">
                                    <div align="right">
                                        <Button className="btn-cookie w-100" type="button" onClick={() => window.location.href = '/cookie-policy'}>
                                            {locale.t('showDetails')}
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </div>

        )
    }
}

const mapStateToProps = (state) => ({
    isConnected: state.EM.isConnected,
    session: state.sessionState,
    modals: state.modalsState,
});

const mapDispatchToProps = (dispatch) => ({
    onSetLanguagesActive: (active) => dispatch({ type: LANGUAGESACTIVE, active }),
    onSetUser: (active) => dispatch({ type: SETUSERINFO, active }),
    onSetIsLogin: (active) => dispatch({ type: SET_ISLOGIN, active }),
    onSetRegisterModal: (active) => dispatch({ type: REGISTERMODAL, active }),
    onSetLoginModal: (active) => dispatch({ type: LOGINMODAL, active }),
    onSetDepositModal: (active) => dispatch({ type: DEPOSITMODAL, active }),
    onSetUserProfile: (active) => dispatch({ type: SET_USER_PROFILE, userProfile: active }),
    onSetUserCurrency: (currency) => dispatch({ type: CURRENCY, currency }),
    onSetWallets: (active) => dispatch({ type: WALLETS, active }),
    onSetCallbackShow: (active) => dispatch({ type: CALLBACKSHOW, active }),
    onSetMessageModal: (active) => dispatch({ type: MESSAGEMODAL, active }),
    onSetTheme: (active) => dispatch({ type: THEME, active }),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Navber);
