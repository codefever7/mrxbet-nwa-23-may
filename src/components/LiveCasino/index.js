
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { REGISTERMODAL, DEPOSITMODAL } from "../../constants/types"
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import isUndefined from 'lodash/isUndefined'
import '../../../styles/components/_liveCasino.scss'

class LiveCasino extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true
        }
    }
    _renderItem = (list) => {
        let data = []
        list.forEach((res, index) => {
            data.push(
                <li key={index}>
                    <Col>
                        <a href={res.href}>
                            <LazyLoadImage
                                className="header-img"
                                src={res.icon}
                                alt={res.alt}
                            />
                            <p dangerouslySetInnerHTML={{ __html: res.title.toUpperCase() }}/>
                        </a>
                    </Col>
                </li>
            )
        })
        return data
    }
    handleToggle = (data)=>{
        const {onSetRegisterModal, onSetDepositModal} = this.props
        if (data.lceButtonType == 'register'){
            onSetRegisterModal(true);
        } else if (data.lceButtonType == 'deposit'){
            onSetDepositModal(true);
        }
    }
    render() {
        const { lceTitle, lceButtonLink, lceButtonText, lceDescription, lceIcon, lceItems, lceButtonAvailable, lceButtonType,lceVisible } = this.props.pageData
        let button = ''
        if(lceButtonAvailable){
            if(lceButtonType=='custom'){
                button = <a className="button" href={lceButtonLink}  title={lceButtonText}><span>{lceButtonText}</span></a>
            }else{
                button = <a className="button" onClick={()=>this.handleToggle(this.props.pageData)}  title={lceButtonText}><span>{lceButtonText}</span></a>
            }
        }
        if(!lceVisible) return null

        return (
            <section className="live-casino">
                <Container>
                    <Row>
                    {
                        !isUndefined(lceItems) &&
                        <div className="live">
                            <Col lg={4} xs={12}>
                                <div className="header-live">
                                    <LazyLoadImage
                                        className="header-img"
                                        src={lceIcon}
                                        alt={lceTitle}
                                    />
                                    <Col>
                                        <h2>{lceTitle}</h2>
                                    </Col>
                                </div>
                                <Col>
                                    <div dangerouslySetInnerHTML={{ __html: lceDescription }} />
                                </Col>
                            </Col>
                            <Col lg={8} xs={12} className="live-list">
                                <ul>{ this._renderItem(lceItems) }</ul>
                            </Col>
                        </div>
                    }
                    </Row>
                    {lceButtonAvailable &&
                        <Row>
                            <Col className="live">
                                <Col className="button-end text-lg-left text-md-center text-center">
                                    {button}
                                </Col>
                            </Col>
                        </Row>
                    }
                </Container>
            </section>
        )
    }
}
const mapDispatchToProps = (dispatch) => ({
    onSetRegisterModal: (active) => dispatch({ type: REGISTERMODAL, active }),
    onSetDepositModal: (active) => dispatch({ type: DEPOSITMODAL, active })
});
export default connect(
null,
mapDispatchToProps
)(LiveCasino);