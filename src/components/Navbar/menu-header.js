
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import '../../../styles/components/_bottomBar.scss';
import {
    LANGUAGESACTIVE,
} from "../../constants/types";
import isUndefined from 'lodash/isUndefined';
import find from 'lodash/find';
import includes from 'lodash/includes';
const locale = require('react-redux-i18n').I18n
const config = require(`../../../config`).config;


let isOpenColl = true
class MainMenuLinks extends Component {
    constructor(props) {
        super(props);
        this.state = {
            menus: [],
            subMenu: [],
            menuActive: { url: '' },
            subMenuActive: { url: '' },
        }
    }

    /** Fetch menu from CMS */
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
        this.setState({ menus: res, subMenu, menuActive, subMenuActive })
    }

    componentDidMount() {
        this.getMenu();
        window.addEventListener("resize", this.resize.bind(this));
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.mainMenu !== this.props.mainMenu) {
            this.getMenu();
        }
    }
    componentDidUpdate() {

        if (this.props.openCollapse) {
            isOpenColl = false
        }
        let padtop = (window.innerWidth <= 1217)?82:84;
        if (!this.props.openCollapse && isOpenColl) {
            let navbarHeaderbar = document.getElementsByClassName('navbar-headerbar')
            document.getElementsByClassName('body-custom')[0].style.paddingTop = `${padtop}px`;//`${navbarHeaderbar[0].clientHeight}px`
        }
    }

    
    resize() {
        let padtop = (window.innerWidth <= 1217)?82:84;
        
        if (!this.props.openCollapse && isOpenColl) {
            let navbarHeaderbar = document.getElementsByClassName('navbar-headerbar')
            document.getElementsByClassName('body-custom')[0].style.paddingTop = `${padtop}px`;//`${navbarHeaderbar[0].clientHeight}px`
        }
    }

    renderItem = (item,index) => {
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

        return (
            <div className="menuItem" key={`menu-${index}`}>
                <a href={item.url} className={`d-flex align-items-center ${(isActived) ? 'actived' : ''} ${item.classes}`}>{item.title}</a>
            </div>
        )
    }

    render() {
        let { menus } = this.state;

        return <div className='d-flex main-menu align-items-center'>
            {menus.map(this.renderItem)}
        </div>
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
)(MainMenuLinks);