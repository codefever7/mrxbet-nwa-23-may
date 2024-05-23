import React, { Component, Fragment } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
const locale = require('react-redux-i18n').I18n

export default class LayoutStep5 extends Component {
    render() {
        const {
            depositStatus,
            handleClick
        } = this.props
        
        return (
            <Fragment>
                <Alert  variant={depositStatus.status}>
                    <Alert.Heading>{depositStatus.text}</Alert.Heading>
                    <p>
                        {depositStatus.detail}
                    </p>
                </Alert>
                <Row>
                  <Col className="text-center">
                    <Button name="close" className="btn-1" type="button" onClick={(e) => handleClick(e)}>{locale.t('close')}</Button>
                  </Col>
                </Row>
            </Fragment>
        )
    }
}
