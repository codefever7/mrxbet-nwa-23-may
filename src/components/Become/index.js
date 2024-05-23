
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { REGISTERMODAL, DEPOSITMODAL } from "../../constants/types"
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Picture from '../Picture'
import Container from 'react-bootstrap/Container'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import isUndefined from 'lodash/isUndefined'
import '../../../styles/components/_become.scss'

class Become extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true
        }
    }
    _renderBecome = (become) => {
        let item = []
        become.map((res, index) => {
            let i = index + 1
            item.push(
                <Col className={`become-${i}`} md={4} xs={12} key={index}>
                    <Picture item={{
                        src: res.become_background,
                        alt:res.become_title
                    }} />
                    <div className="content-layout">
                        <div className="content-text">
                            <span>{res.become_number}</span>
                            <h3>{res.become_title}</h3>
                            <p>{res.become_description}</p>
                        </div>
                    </div>
                </Col>
            )
        })

        return item;
    }
    handleToggle = (data)=>{
        const {onSetRegisterModal, onSetDepositModal} = this.props
        if (data.becomeButtonType == 'register' ){
            onSetRegisterModal(true);
        } else if (data.becomeButtonType == 'deposit' ){
            onSetDepositModal(true);
        }
    }
    render() {
        const { become, becomeTitle, becomeIcon, becomeButtonAvailable, becomeButtonType, becomeButtonLink, becomeButtonText, becomeVisible } = this.props.pageData
        let button = ''
        if(becomeButtonAvailable){
            if(becomeButtonType=='custom'){
                button = <a className="button" href={becomeButtonLink}  title={becomeButtonText}><span>{becomeButtonText}</span></a>
            }else{
                button = <a className="button" onClick={()=>this.handleToggle(this.props.pageData)}  title={becomeButtonText}><span>{becomeButtonText}</span></a>
            }
        }
        if(!becomeVisible) return null
        return (
            !isUndefined(become) &&
            <div className="main-become">
                <Container>
                    <Row>
                        <div className="header-become">
                            <LazyLoadImage
                                className="header-img"
                                src={becomeIcon}
                                alt={becomeTitle}
                                effect="blur"
                                visibleByDefault={true}
                            />
                            <Col>
                                <h2>{becomeTitle.toUpperCase()}</h2>
                            </Col>
                        </div>
                    </Row>
                </Container>
                <Row className="content">
                    {this._renderBecome(become)}
                </Row>
                {
                    becomeButtonAvailable &&
                    <Col className="button-end">
                        <Col className="button-layout">
                            {button}
                        </Col>
                    </Col>
                }
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch) => ({
    onSetRegisterModal: (active) => dispatch({ type: REGISTERMODAL, active }),
    onSetDepositModal: (active) => dispatch({ type: DEPOSITMODAL, active })
});
export default connect(null, mapDispatchToProps)(Become);