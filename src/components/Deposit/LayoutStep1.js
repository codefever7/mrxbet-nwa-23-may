import React, { Component } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import isUndefined from 'lodash/isUndefined'
// import replace from 'lodash/replace'
import upperCase from 'lodash/upperCase'
// const locale = require('react-redux-i18n').I18n
export default class LayoutStep1 extends Component {
    componentDidMount(){
        let elActive = document.getElementsByClassName('collapse show');
        if(!isUndefined(elActive) && elActive.length){
            window.scrollTo(elActive[0].offsetTop, 0);  
        }
    }
    render() {
        const { _bankCategoryListRender, session } = this.props; 
        let url_external_payment = `https://ext.internationalpaymentsolutions.net/?rnd=${session.userInfo.userID}&lng=${upperCase(session.languagesActive)}&email=${session.userInfo.email}`;
        // console.log(url_external_payment)
        return (
            <Row className="body step-body-1">
                <Col md={12} className="text-content">
                    {_bankCategoryListRender}
                </Col>
            </Row>
        )
    }
}