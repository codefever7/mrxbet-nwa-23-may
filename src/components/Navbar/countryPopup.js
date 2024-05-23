import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import '../../../styles/components/_login.scss'
import {
    setCookie
} from '../../../utils'
const locale = require('react-redux-i18n').I18n
export class CountryPopup extends PureComponent {
    state = {
        isShow: false,
        isLoading: false,
    }
    save = () =>{
        setCookie('acceptCountry', true, 375)
        this.props.isClose()
    }
    render() {
        const { countryPopupShow, isClose } = this.props
        const { isLoading } = this.state
        return (
            <Modal centered show={countryPopupShow} onHide={() => isClose()} className="login" >
                <Modal.Body>
                    <Container>
                        <Row className="justify-content-center mb-3 mt-3">
                            <Col md={10} xs={10} className="text-center">
                                <h1>{locale.t('notice')}</h1>
                            </Col>
                            <Col md={10} xs={10} >
                                <p>{locale.t('noticeText1')}</p>
                                <p>{locale.t('noticeText2')}</p>
                                <p>{locale.t('noticeText3')}</p>
                            </Col>
                            <Col md={10} xs={10} className="d-flex">
                                <Button className="btn-1 w-100 mr-2" type="button" onClick={() => isClose()}>
                                    {
                                        isLoading ?
                                            <div className="loading-2" /> : <p className="text-uppercase m-0">{locale.t('cancel')}</p>
                                    }
                                </Button>
                                <Button className="btn-3 w-100 ml-2" type="button" onClick={() => this.save()}>
                                    {
                                        isLoading ?
                                            <div className="loading-2" /> : <p className="text-uppercase m-0">{locale.t('ok')}</p>
                                    }
                                </Button>
                            </Col>
                        </Row>
                    </Container>
                </Modal.Body>
            </Modal>
        )
    }
}

const mapStateToProps = (state) => ({

})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(CountryPopup)
