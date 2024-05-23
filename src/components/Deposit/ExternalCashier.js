import React, { Component, Fragment } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import replace from 'lodash/replace'
import isUndefined from 'lodash/isUndefined'
const locale = require('react-redux-i18n').I18n

export default class ExternalCashier extends Component {
    constructor(props) {
        super(props);
        this.state = {
          loading: true,
          iFrameHeight: 600,
          src: 'https://wp.api-helper-2.com/external-cashier/',
          isLoadData: false
        }
      }
    componentDidMount(){
        let elActive = document.getElementsByClassName('collapse show');
        if(!isUndefined(elActive) && elActive.length){
            window.scrollTo(elActive[0].offsetTop, 0);  
        }
        let sessionID = replace(localStorage.getItem(`sessionId`), /"/g, '')
        this.setState({
            src:`https://wp.api-helper-2.com/external-cashier/?session_id=${sessionID}`
        })
    }
    render() {
        const {
            depositStatus,
            handleClick,
        } = this.props

        const { src, iFrameHeight, isLoadData } = this.state

        return (
            <Fragment>
                <iframe
              name="externalCashier"
              id="externalCashier"
              src={src}
              height={`${iFrameHeight}px`}
              frameBorder="0"
              scrolling="yes" allowtransparency="true"
              style={{ marginBottom: '-6px'}}
            ></iframe>
            </Fragment>
        )
    }
}