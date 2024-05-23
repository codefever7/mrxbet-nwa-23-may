
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import upperCase from 'lodash/upperCase'
import isUndefined from 'lodash/isUndefined'
import includes from 'lodash/includes'
import find from 'lodash/find'
import WPService from '../../../services'
const locale = require('react-redux-i18n').I18n
const config = require(`../../../config`).config;

class Menu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            menusFooter:[],
            footerColumn1:[],
            footerColumn2:[],
            footerColumn3:[],
            menuActive:{url:''}
        }
    }

    getMenuFooter=()=>{
        let _self = this;
        WPService.getMenus(this.props.lang, 'footer' + config.menuKey).then((res)=>{
            let menuActive = {url:''}
            let foundMenuFooter = find(res, function(o) { return includes(o.url, _self.props.mainMenuActive) });
            if(!isUndefined(foundMenuFooter)){
                menuActive = foundMenuFooter
            }
          _self.setState({menusFooter:res, menuActive})
        })
        WPService.getMenus(this.props.lang, 'footercasino' + config.menuKey).then((res) => {
            let menuActive = {url:''}
            let foundMenuFooter = find(res, function(o) { return includes(o.url, _self.props.mainMenuActive) });
            if(!isUndefined(foundMenuFooter)){
                menuActive = foundMenuFooter
            }
          _self.setState({footerColumn1:res, menuActive})
        })
    }

    componentDidMount() {
        this.getMenuFooter();
    }

    _renderMenusItem = (menus, menuActive) => {
        let data = []

        if (!isUndefined(menus) && menus.length) {
            menus && menus.length ? menus.map((menu, i) => {
                data.push (
                    <a href={menu.url} className={menu.url == menuActive.url?'active':''} key={`footer-${menu.id}`} ref={i + 1}>
                        <span >{menu.title}</span>
                    </a>
                )
            })
            :
            null
        }

        return data;
    }
    render() {
        const { footerColumn1, footerColumn2, footerColumn3, menusFooter, menuActive } = this.state
        
        return (
            <div className="footer-column">
                <Container className="container-custom">
                    <div className='Informations'>
                    { menusFooter.length ? this._renderMenusItem(menusFooter, menuActive) : null }                
                    </div>
                    <div className='CasinosMenu'>
                    { menusFooter.length ? this._renderMenusItem(footerColumn1, menuActive) : null }                
                    </div>
                    
                </Container>
            </div>
        )
    }
}
export default connect(null, null)(Menu);