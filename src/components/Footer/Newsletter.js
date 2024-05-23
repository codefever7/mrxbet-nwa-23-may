
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button'
import isEmpty from 'lodash/isEmpty'
import { MESSAGEMODAL } from "../../constants/types"
import WPService from '../../../services'
const locale = require('react-redux-i18n').I18n

class Newsletter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            validated: false
        }        
    }
    handleSubmit = (event) => {
        const e = event.target
        const email = e['newsletter-email'].value

        if(isEmpty(email)){
            this.setState({
                validated: true
            })
        }else{
            this.setState({isLoading:true})
            WPService.addSubscriber(this.props.lang, email).then((res) => {
                if (res) {
                   if(res.success){
                    const set = { messageTitle: locale.t('successfully'), messageDesc: locale.t('thankSubscribing'), messageDetail: '', messageType: 'success' }
                    this.props.onSetMessageModal(set)
                   }else{
                    const set = { messageTitle: locale.t('error'), messageDesc: res.errormessage, messageDetail: '', messageType: 'error' }
                    this.props.onSetMessageModal(set)
                   }
                }
                e['newsletter-email'].value = ''; 
                this.setState({isLoading:false})
            })
        }
        event.preventDefault();
    }
    render() {
        const { footerData } = this.props
        const { validated, isLoading } = this.state

        return (
            <div className="newsletter-container">
                <Container className="container-custom">
                    <Row>
                        <Col>
                            <div className="header-newsletter">
                                <i className="jb-icon newsletter"></i>
                                <h4><strong>{isEmpty(footerData.newsletterTitle) ? locale.t('newsletter') : footerData.newsletterTitle}</strong></h4>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={{ span: 6, offset: 3 }} xs={12}>
                            <div dangerouslySetInnerHTML={{ __html: footerData.newsletterDescription }} />
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={{ span: 6, offset: 3 }} xs={12}>
                            <Form className="form" validated={validated} onSubmit={(e) => this.handleSubmit(e)}>
                                <Form.Group as={Col} md="12" controlId="validationCustom">
                                    <InputGroup>
                                        <Form.Control type="email" aria-label="newsletter-email" name="newsletter-email" placeholder={locale.t('emailAddress')} required />
                                        <InputGroup.Prepend> 
                                            <Button type="submit" className="submit" title="submit-email">
                                                {isLoading?<div className="loading-2" />:<i className="jb-icon icon-default casino-arrow-right" />}
                                            </Button>
                                        </InputGroup.Prepend>
                                    </InputGroup>
                                </Form.Group>
                            </Form>
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
});
const mapDispatchToProps = (dispatch) => ({
    onSetMessageModal: (active) => dispatch({ type: MESSAGEMODAL, active })
})
export default connect(mapStateToProps, mapDispatchToProps)(Newsletter);