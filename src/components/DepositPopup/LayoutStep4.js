import React, { Component } from 'react'
import Row from 'react-bootstrap/Row'
import Frame from 'react-frame-component'

export default class LayoutStep4 extends Component {
    render() {
        const {
            frameData,
            redirectionForm,
        } = this.props

        return (
            <Row className="body step-body-4">
                 <Frame id="frame_deposit" contentDidMount={frameData}  width="100%" height="550px">
                    {redirectionForm ? <div dangerouslySetInnerHTML={{ __html: redirectionForm }}></div> : ''}
                </Frame>
            </Row>
        )
    }
}