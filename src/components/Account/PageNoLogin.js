import React, { Component } from 'react'
import Col from 'react-bootstrap/Col'
import isUndefined  from 'lodash/isUndefined'
const locale = require('react-redux-i18n').I18n

export default class PageNoLogin extends Component {
    render() {
        const { title } = this.props
        return (
            <Col md={12} xs={12} className="no-login">
                {!isUndefined(title) && <h2>{title}</h2>}
                <p>{locale.t('textNoLogin')}</p>
            </Col>
        )
    }
}