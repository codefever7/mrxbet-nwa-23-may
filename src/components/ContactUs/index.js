
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Picture from '../Picture'
import WPService from '../../../services'
import LoadBlock from '../Loading/LoadBlock'
import {
    MESSAGEMODAL
} from "../../constants/types";

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import isUndefined from 'lodash/isUndefined'
const config = require(`../../../config`).config;
const locale = require('react-redux-i18n').I18n
class ContactUs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            validated: false,
            isLoading: false,
            pageData: {}
        }
    }
    sentMail = async (event) => {
        try {
            // this.loadBlock.isOpen(true)
            let form = event.target
            let e = form.elements
            this.setState({ isLoading: true })
            if (form.checkValidity()) {
                const params = {
                    name: e['name'].value,
                    email: e['email'].value,
                    subject: e['subject'].value,
                    content: e['content'].value
                }
                event.preventDefault();
                event.stopPropagation();
                await WPService.postContact(params)
                this.inputEmail.value = ''
                this.inputName.value = ''
                this.inputSubject.value = ''
                this.inputContent.value = ''
                this.setState({ validated: false, isLoading: false }, () => {
                    const set = { messageTitle: locale.t('success'), messageDesc: locale.t('textSuccessContact'), messageDetail: '', messageType: 'success' }
                    this.props.onSetMessageModal(set)
                })
                event.preventDefault();
                event.stopPropagation();
            } else {
                this.setState({ validated: 'was-validated', isLoading: false })
                event.preventDefault();
                event.stopPropagation();
            }

        } catch (err) {
            console.log('err sentMail ==> ', err)
            this.setState({ validated: false, isLoading: false }, () => {
                const set = { messageTitle: locale.t('error'), messageDesc: locale.t('textErrorContact'), messageDetail: '', messageType: 'error' }
                this.props.onSetMessageModal(set)
            })
            event.preventDefault();
            event.stopPropagation();
        }
    }
    componentDidMount() {
        WPService.getPageData(this.props.lang, this.props.firstSegment + config.menuKey).then((pageData) => {
            this.setState({
                pageData
            })
        })
    }
    render() {
        const { pageData, isLoading, validated } = this.state
        let image_email = {};
        let image_faq = {};
        let image_live_chat = {};
        if (!isUndefined(pageData.image_email) && !isUndefined(pageData.image_email.sources_email)) {
            image_email.sources = pageData.image_email.sources_email
            image_email.src = pageData.image_email.src_email
            image_email.alt = pageData.title
        } else {
            image_email.src = '/static/images/email.png'
            image_email.alt = pageData.title
        }
        if (!isUndefined(pageData.image_faq) && !isUndefined(pageData.image_faq.sources_faq)) {
            image_faq.sources = pageData.image_faq.sources_faq
            image_faq.src = pageData.image_faq.src_faq
            image_faq.alt = pageData.title
        } else {
            image_faq.src = '/static/images/faq_contact.png'
            image_faq.alt = pageData.title
        }
        if (!isUndefined(pageData.image_live_chat) && !isUndefined(pageData.image_live_chat.sources_live_chat)) {
            image_live_chat.sources = pageData.image_live_chat.sources_live_chat
            image_live_chat.src = pageData.image_live_chat.src_live_chat
            image_live_chat.alt = pageData.title
        } else {
            image_live_chat.src = '/static/images/chat.png'
            image_live_chat.alt = pageData.title
        }
        // console.log('pageData', pageData)

        return (
            <Container className="contact-container container-custom">
                <LoadBlock ref={ref => this.loadBlock = ref} />
                <Row className="justify-content-center">
                    <Col sm={12}>
                        <h2 className="title-middle" dangerouslySetInnerHTML={{ __html: pageData.title }} />
                    </Col>
                    <Col sm={12}>
                        <div className="px-2 text-center">
                            <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col lg={6} md={6} sm={12}>
                        <div className="box">
                            <Col sm={12}>
                                <Row className="align-items-center">
                                    <div className="box-icon-title">
                                        <div className="icon-title">
                                            <Picture item={image_email} />
                                        </div>
                                    </div>
                                    <h4 className="pl-2 m-0">{locale.t('emailSupport')}</h4>
                                </Row>
                            </Col>
                            <Col sm={12} className="pt-2">
                                <div dangerouslySetInnerHTML={{ __html: pageData.emailSupport }} />
                            </Col>
                            <Col sm={12} className="pt-2 ">
                                <Form noValidate validated={validated} onSubmit={(event) => this.sentMail(event)}>
                                    <Form.Group >
                                        <Form.Label>
                                            {locale.t('textContact1')}
                                        </Form.Label>
                                        <Form.Control type="email" name="email" required ref={ref => this.inputEmail = ref} />
                                    </Form.Group>
                                    <Form.Group >
                                        <Form.Label>
                                            {locale.t('textContact2')}
                                        </Form.Label>
                                        <Form.Control type="text" name="name" required ref={ref => this.inputName = ref} />
                                    </Form.Group>
                                    <Form.Group >
                                        <Form.Label>
                                            {locale.t('textContact3')}
                                        </Form.Label>
                                        <Form.Control type="text" name="subject" required ref={ref => this.inputSubject = ref} />
                                    </Form.Group>
                                    <Form.Group >
                                        <Form.Label>
                                            {locale.t('textContact4')}
                                        </Form.Label>
                                        <Form.Control as="textarea" rows="4" name="content" required ref={ref => this.inputContent = ref} />
                                    </Form.Group>
                                    <Form.Group >
                                        <Button className="btn-3 w-100" type="submit">
                                            {
                                                isLoading ?
                                                    <div className="loading-2" /> : <p className="text-uppercase m-0">{locale.t('submit')}</p>

                                            }
                                        </Button>
                                    </Form.Group>
                                </Form>
                            </Col>
                        </div>
                    </Col>
                    <Col lg={6} md={6} sm={12}>
                        <Row>
                            <Col sm={12}>
                                <div className="box">
                                    <Col sm={12}>
                                        <Row className="align-items-center">
                                            <div className="box-icon-title">
                                                <div className="icon-title">
                                                    <Picture item={image_faq} />
                                                </div>
                                            </div>
                                            <h4 className="pl-2 m-0">{locale.t('faq')}</h4>
                                        </Row>
                                    </Col>
                                    <Col sm={12} className="pt-2">
                                        <div dangerouslySetInnerHTML={{ __html: pageData.faq }} />
                                    </Col>
                                </div>
                            </Col>
                            <Col sm={12}>
                                <div className="box">
                                    <Col sm={12}>
                                        <Row className="align-items-center">
                                            <div className="box-icon-title">
                                                <div className="icon-title">
                                                    <Picture item={image_live_chat} />
                                                </div>
                                            </div>
                                            <h4 className="pl-2 m-0">{locale.t('liveChat')}</h4>
                                        </Row>
                                    </Col>
                                    <Col sm={12} className="pt-2">
                                        <div dangerouslySetInnerHTML={{ __html: pageData.liveChatSupport }} />
                                    </Col>
                                </div>
                            </Col>
                        </Row>

                    </Col>
                    {/* <Col lg={4} md={12} sm={12}>
                        <Row>
                            <Col sm={12}>
                                <div className="box">
                                    <div dangerouslySetInnerHTML={{ __html: pageData.emailSupport }} />
                                </div>
                            </Col>
                            <Col sm={12}>
                                <div className="box">
                                    <div dangerouslySetInnerHTML={{ __html: pageData.liveChatSupport }} />
                                </div>
                            </Col>
                        </Row>
                    </Col> */}
                </Row>
            </Container>
        )
    }
}
const mapDispatchToProps = (dispatch) => ({
    onSetMessageModal: (active) => dispatch({ type: MESSAGEMODAL, active })
})
export default connect(null, mapDispatchToProps)(ContactUs);