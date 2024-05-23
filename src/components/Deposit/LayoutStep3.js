import React, { Component } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import isUndefined from 'lodash/isUndefined'
const locale = require('react-redux-i18n').I18n

export default class LayoutStep3 extends Component {
  componentDidMount(){
    let elActive = document.getElementsByClassName('collapse show');
    if(!isUndefined(elActive) && elActive.length){
        window.scrollTo(elActive[0].offsetTop, 0);  
    }
}
  render() {
    const {
      prepareData,
      handleSubmitStep2,
      handleClick,
    } = this.props

    return (
      <Row className="body step-body-3">
        <Col xs={12} className="text-content">
          <Form noValidate onSubmit={(e) => handleSubmitStep2(e)}>
            <Row className="bank-list">
              <Col>
                {locale.t('depositText2')} {prepareData.credit.name} {prepareData.credit.currency} {prepareData.credit.amount}
              </Col>
            </Row>
            <Row className="bank-list">
              <Col lg="2" xs="3" className="p-r-0">
                <div className="deposit-categories-logo" dangerouslySetInnerHTML={{ __html: prepareData.icon }}>
                </div>
              </Col>
              <Col lg="10" xs="9" className="p-l-10">
                <h3 className="black">{prepareData.debit.name}</h3>
              </Col>
            </Row>
            <Row className="bank-list">
              <Col>
                <h3 className="black" >{prepareData.debit.currency} <span >{prepareData.debit.amount}</span></h3>
              </Col>
            </Row>
            <Form.Group as={Col} md={9} className="bank-list">
              <Form.Control type="hidden" name="pid" value={prepareData.pid} />
            </Form.Group>
            <Row>
              <Col className="">
                <Button name="back" type="button" block className="btn-1" onClick={(e) => handleClick(e)}>{locale.t('back')}</Button>
              </Col>
              <Col className="">
                <Button className="btn-3" type="submit" block>{locale.t('deposit')}</Button>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    )
  }
}