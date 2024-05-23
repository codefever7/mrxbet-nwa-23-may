import React, { Component, Fragment } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import isUndefined from 'lodash/isUndefined'
const locale = require('react-redux-i18n').I18n

export default class LayoutStep5 extends Component {
    componentDidMount(){
        let elActive = document.getElementsByClassName('collapse show');
        if(!isUndefined(elActive) && elActive.length){
            window.scrollTo(elActive[0].offsetTop, 0);  
        }
    }
    render() {
        const {
            depositStatus,
            handleClick,
        } = this.props

        return (
            <Fragment>
                <Alert variant={depositStatus.status}>
                    <Alert.Heading>{depositStatus.text.split('[')[0]}</Alert.Heading>
                    <p>{depositStatus.detail}</p>
                </Alert>
                <Row>
                    <Col className="text-center">
                        <Button  name="close" className="btn-1" type="button" onClick={(e) => handleClick(e)}>{locale.t('close')}</Button>
                    </Col>
                </Row>
            </Fragment>
        )
    }
}