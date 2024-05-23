
import React, { Component } from 'react';
import { connect } from 'react-redux';
import isUndefined from 'lodash/isUndefined';
import Container from 'react-bootstrap/Container'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import { LazyLoadImage } from 'react-lazy-load-image-component';
import '../../../styles/components/_sportsCasino.scss'
import {
    REGISTERMODAL,
    DEPOSITMODAL
  } from "../../constants/types";
class SportsCasino extends Component {
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
        if (data.scoButtonType == 'register'){
            onSetRegisterModal(true);
        } else if (data.scoButtonType == 'deposit'){
            onSetDepositModal(true);
        }
    }

    render() {
        const { scoItems, scoIcon, scoDescription, scoButtonText, scoButtonLink, scoTitle, scoButtonAvailable, scoButtonType,scoVisible } = this.props.pageData
        let button = ''
        if(scoButtonAvailable){
            if(scoButtonType=='custom'){
                button = <a className="button" href={scoButtonLink}  title={scoButtonText}><span>{scoButtonText}</span></a>
            }else{
                button = <a className="button" onClick={()=>this.handleToggle(this.props.pageData)}  title={scoButtonText}><span>{scoButtonText}</span></a>
            }
        }
        if(!scoVisible) return null
        return (
            <section className="sports-casino">
                <Container>
                <Row>
                {
                    !isUndefined(scoItems) &&
                    <div className="sports">
                        <Col lg={5} xs={12}>
                            <div className="header-sports">
                                <LazyLoadImage
                                    className="header-img"
                                    src={scoIcon}
                                    alt={scoTitle}
                                />
                                <Col>
                                    <h2>{scoTitle}</h2>
                                </Col>
                            </div>
                            <Col>
                                <div dangerouslySetInnerHTML={{ __html: scoDescription }} />
                            </Col>
    
                        </Col>
                        <Col lg={7} xs={12} className="sports-list">
                            <ul>
                                {
                                    this._renderItem(scoItems)
                                }
    
                            </ul>
                        </Col>
                        
                    </div>
                }
                </Row>
                {scoButtonAvailable &&
                            <Row>
                                <Col className="sports">
                                    <Col className="button-end text-lg-left text-md-center text-center">
                                        {button}
                                    </Col>
                                </Col>
                            </Row>}
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
  )(SportsCasino);
