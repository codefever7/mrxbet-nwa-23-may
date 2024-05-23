import React, { Component } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Col from 'react-bootstrap/Col';

export class LoadPage extends Component {

    render() {
        const { loading } = this.props   
        let theme = 'dark';
        try {
            theme = localStorage.getItem('theme-html') ||'dark'            
        } catch (error) {
            //console.log('error onLoadTheme ==>', error)
        } 
        
        const Icon = `/static/images/${theme !== 'dark'?'logo-light':'logo'}.png`
        return (
            loading ?
                <div className="load-page">
                    <div>
                        <Col xs={12} className="text-center">
                            <LazyLoadImage src={Icon} alt="logo" className="img-fluid" />
                        </Col>
                        <Col xs={12} className="text-center">
                            <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
                        </Col>
                    </div>
                </div>
                : null
        )
    }
}

export default LoadPage
