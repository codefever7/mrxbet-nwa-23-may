
import React, { Component, forwardRef } from 'react';
import { connect } from 'react-redux';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container'
const locale = require('react-redux-i18n').I18n

class MyModalPopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showMessage: false
        }

        this.urlRedirect = "#";
    }

    componentDidMount() {
        this.isClose();
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        //
    }

    isClose = () => {
        this.setState({
            showMessage: false
        })
    }

    isOpen = () => {
        this.setState({
            showMessage: true
        })

        //localStorage.setItem('PopupToRedirectDomain', 1);
    }

    clickSwitch = async () => {
        try {
            this.isClose()
            if(!this.urlRedirect.includes('http')){
                this.urlRedirect = 'https://' + this.urlRedirect;
            }

            await localStorage.setItem('PopupToRedirectDomain', '');
            window.parent.location.href = this.urlRedirect;
        } catch (error) {
            window.parent.location.href = this.urlRedirect;
            console.log('error', error)
        }
    }

    GetReadyToRedirect = async (url) =>{
        if(!url.includes('http')){
            url = 'https://' + url;
        }

        this.urlRedirect = url;
        let popupRedirect = localStorage.getItem('PopupToRedirectDomain');
        if(popupRedirect == null || popupRedirect != '1')
            this.isOpen();
    }

    render() {
        const { showMessage } = this.state

        return (
            <Modal size="lg" centered show={showMessage} className="switch-popup-detail">
                <Modal.Header className="px-4">
                    <Modal.Title className="ms-auto">{locale.t('popupTitle')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container className="message-popup">
                        <Row className={"message-title"}>
                            <Col className="text-center">
                                <p className="p-md-5">
                                    {locale.t('switchSitePopupInfo')} <a href={ this.urlRedirect }>{ this.urlRedirect.replace('https://', '') }</a>
                                </p>
                            </Col>
                        </Row>

                        <Col className="text-center">
                            <button type="button" className="btn btn-success" onClick={() => this.clickSwitch()} >
                                {locale.t('ok')}
                            </button>
                        </Col>
                    </Container>
                </Modal.Body>
            </Modal>
        )
    }
}

const mapStateToProps = (state) => ({
    modals: state.modalsState
});

export default connect(mapStateToProps, null, null, { forwardRef: true })(MyModalPopup);
