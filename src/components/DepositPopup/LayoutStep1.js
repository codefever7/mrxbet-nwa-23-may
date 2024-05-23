import React, { Component } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
const locale = require('react-redux-i18n').I18n

export default class LayoutStep1 extends Component {
    render() {
        const {
            cpt,
            handleSetChecked,
            _promotionsRender,
            _bankCategoryListRender,

        } = this.props

        return (
            <Row className="body step-body-1">
                <Col md={6} className="text-content">
                    {_bankCategoryListRender}
                </Col>
                <Col md={6} className="text-content">
                    {_promotionsRender}
                </Col>
                <Col xd={12}>
                  <Row className="w-100 m-0 pt-2">
                      <Col md={6}>

                      </Col>
                      <Col md={6}>
                          <Row className="px-2 align-items-center h-100 cpt">
                              <Form.Check checked={cpt} onChange={(evt) => handleSetChecked(evt)} name="cpt" className="" type="checkbox" />
                              <p className="mx-2 my-0">{locale.t('formRegisterTextConPromotion')}</p>
                          </Row>
                      </Col>
                  </Row>
                </Col>
            </Row>
        )
    }
}