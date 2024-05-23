import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

import WPService from '../../../services'
import {
    ALLMODAL
} from "../../constants/types";
import '../../../styles/components/_modalAll.scss'
import Picture from '../Picture'
import LoadBlock from '../Loading/LoadBlock'

import isNull from 'lodash/isNull'
import isUndefined from 'lodash/isUndefined'
const locale = require('react-redux-i18n').I18n

export class AllDetail extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isOpen: false,
            data: {},
            id: null,
            type: ''
        }
    }
    static getDerivedStateFromProps(props, state) {

        if (props.modals.allModal.isOpen !== state.isOpen) {
            return {
                isOpen: props.modals.allModal.isOpen,
                id: props.modals.allModal.id,
                type: props.modals.allModal.type,
            }
        }
        return null
    }


    componentDidUpdate(prevProps, prevState) {
        const { id, type } = this.state
        if (id !== prevState.id && !isNull(id)) {
            if (this.LoadBlock) {
                this.LoadBlock.isOpen(true)
            }
            if (type === 'bonus') {
                WPService.getPromotionPopup(this.props.lang, id).then((res) => {
                    this.setState({ data: res }, () => {
                        if (this.LoadBlock) {
                            this.LoadBlock.isOpen(false)
                        }
                    })
                })
            } else if (type === 'page') {
                WPService.getPagePopup(this.props.lang, id).then((res) => {
              
                    this.setState({ data: res }, () => {
                        if (this.LoadBlock) {
                            this.LoadBlock.isOpen(false)
                        }
                    })
                })
            }
        }
    }
    isClose = () => {
        const data = {
            isOpen: false,
            id: null,
            type: ''
        }
        this.setState({
            isOpen: false,
            data: {},
            id: null,
            type: ''
        }, () => {
            this.props.onSetAllModal(data)
        })
    }

    _renderItem = () => {
        const { data, type } = this.state
        if (!isUndefined(data.id) && type === 'bonus') {
            let image = {}
            image = data.image
            image.alt = data.alt;
            return (
                <div className="container container-detail">
                    <Row>
                        <Picture item={image} />
                    </Row>
                    <Row>
                        <Col md={12} sm={12} className="main-promotions">
                            <Row className="row-detail pt-2">
                                <Col>
                                    <h4 dangerouslySetInnerHTML={{ __html: data.title }}/>
                                    <div className="detail-content" dangerouslySetInnerHTML={{ __html: data.description }} />
                                </Col>
                            </Row>
                            <Row className="row-terms">
                                <Col>
                                    <div className="terms-content" dangerouslySetInnerHTML={{ __html: data.termsAndConditions }} />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
            )
        } else if (!isUndefined(data.content) && type === 'page') {
            return (
                <div className="container container-detail">
                    <Col className="">
                        <h4 dangerouslySetInnerHTML={{ __html: data.title }}/>
                        <div className="detail-content" dangerouslySetInnerHTML={{ __html: data.content }} />
                    </Col>
                </div>
            )
        }
        return null
    }
    render() {
        const { isOpen } = this.state
        return (
            <Modal centered show={isOpen} onHide={() => this.isClose()} className="all-popup-detail" >
                <Modal.Body>
                    <Container>
                        <Row className="justify-content-end">
                            <Col md={2} xs={2} className="text-center">
                                <a className="close" onClick={() => this.isClose()}>
                                    <i className="jb-icon registerpage-x" />
                                </a>
                            </Col>
                        </Row>
                        <LoadBlock ref={ref => this.LoadBlock = ref} />
                        {this._renderItem()}
                    </Container>
                </Modal.Body>
            </Modal>
        )
    }
}
const mapStateToProps = (state) => ({
    modals: state.modalsState
})

const mapDispatchToProps = (dispatch) => ({
    onSetAllModal: (active) => dispatch({ type: ALLMODAL, active })
})

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(AllDetail)