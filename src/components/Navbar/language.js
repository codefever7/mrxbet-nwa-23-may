
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import '../../../styles/components/_bottomBar.scss';
import Router from 'next/router';
import UserService from '../../services/em/user'
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';
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
const locale = require('react-redux-i18n').I18n
const config = require(`../../../config`).config;


class MenusLanguages extends Component {
    constructor(props) {
        super(props);
        this.state = {
            menusLanguages: [],
            languagesAction: '',
            activeModal: '',
            showModal: false
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

            this.setState({ menusLanguages: item, languagesAction: active, activeModal: active })
            this.props.onSetLanguagesActive(active)
        })
    }

    componentDidMount() {
        this.getMenusLanguages();
    }

    languageENTitle = (code) => {
        switch (code) {
            case "en": return "English";
            case "fr": return "Français";
            case "it": return "Italiano";
            case "es": return "Español";
            case "pt-pt": return "Português";
            case "sv": return "Svenska";
            case "tr": return "Türkçe";
            default: return "English";
        }
    }

    isClose = () => {
        this.setState({
            showModal: false,
            activeModal: this.state.languagesAction
        })
    }

    isOpen = () => {
        this.setState({
            showModal: true
        })
    }

    onSetLanguages = (e) => {
        let { menusLanguages, languagesAction, showModal, activeModal } = this.state
        const a = filter(menusLanguages, (res) => res.id === e)
        this.props.setLanguages(a[0])
    }

    render() {
        let { menusLanguages, languagesAction, showModal, activeModal } = this.state
        let { setLanguages } = this.props
        let renderItem = []
        let active = []
        if (!isUndefined(menusLanguages)) {
            const a = filter(menusLanguages, (res) => res.id === languagesAction)
            active = !isUndefined(a[0]) ? a : menusLanguages
        }
        //   if (!isUndefined(menusLanguages)) {
        //       let item = []
        //       const a = filter(menusLanguages, (res) => res.id === languagesAction)
        //       let active = !isUndefined(a[0]) ? a : menusLanguages
        //       let activeLG = languagesAction
        //       if (!isUndefined(active[0])) {
        //           if (isNull(languagesAction) || languagesAction === '') {
        //               activeLG = active[0].id
        //           }
        //           forEach(menusLanguages, (res, index) => {
        //               let imgLang = res.id.indexOf("-") > 0 ? getLangSplit(res.id) : res.id

        //               if (activeLG !== res.id) {
        //                   item.push(
        //                       <Dropdown.Item eventKey={res.id} key={index} onClick={() => setLanguages(res)}>
        //                           <img src={`/static/images/country/${upperCase(imgLang)}.jpg`} className="d-block img-fluid" alt={res.id} title={res.attrTitle} />
        //                       </Dropdown.Item>
        //                   )
        //               }
        //           })
        //           let img = active[0].id.indexOf("-") > 0 ? getLangSplit(active[0].id) : active[0].id

        //           renderItem.push(
        //               <div className="menus-languages" key={0}>
        //                   <Dropdown>
        //                       <Dropdown.Toggle id="dropdown-custom-1" className="languageActiveButton">
        //                           {this.languageENTitle(active[0].id)}
        //                       </Dropdown.Toggle>
        //                       <Dropdown.Menu className="super-colors">
        //                           {item}
        //                       </Dropdown.Menu>
        //                   </Dropdown>
        //               </div>
        //           )
        //       }
        //   }
        return (
            <>
                {/* {renderItem} */}
                <div className="menus-languages">
                    <div className="dropdown">
                        <button aria-haspopup="true" aria-expanded="false" id="dropdown-custom-1" type="button" className="languageActiveButton dropdown-toggle btn btn-primary" onClick={() => this.isOpen()}>
                            {active.length > 0 ? this.languageENTitle(active[0].id) : null}
                        </button>
                    </div>
                </div>
                <Modal centered show={showModal} onHide={() => this.isClose()} className="all-popup-detail menus-languages-modal" size="lg" >
                    <Modal.Body>
                        <Container className="message-popup">
                            <Row className={`message-title`}>
                                <Col xs={10}>
                                    <p>{locale.t('selectYourLanguage')}</p>
                                </Col>
                            </Row>
                            <Col xs={12} className={`content-body`}>
                                <div className="d-flex py-3">
                                    {
                                        !isUndefined(menusLanguages) && menusLanguages.length > 0 ? menusLanguages.map((res, index) => {
                                            let imgLang = res.id.indexOf("-") > 0 ? getLangSplit(res.id) : res.id
                                            let cssActive = activeModal === res.id ? 'active' : ''
                                            return (
                                                <Col className={`${cssActive}`} key={index}>
                                                    <img src={`/static/images/country/${upperCase(imgLang)}.jpg`} className="d-block img-fluid" onClick={() => this.onSetLanguages(res.id)} alt={res.id} title={res.attrTitle} />
                                                    <p className="m-0 pt-2">{this.languageENTitle(res.id)}</p>
                                                </Col>
                                            )
                                        })
                                        :
                                        null
                                    }
                                </div>
                            </Col>
                            {/* <Col className="text-center pt-3">
                                <button type="button" className="btn btn-n1" onClick={() => this.onSetLanguages(activeModal)}>
                                    {locale.t('done')}
                                </button>
                            </Col> */}
                        </Container>
                    </Modal.Body>
                </Modal>
            </>
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
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MenusLanguages);