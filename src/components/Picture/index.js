import React, { Component } from 'react';
import isUndefined from 'lodash/isUndefined'
import isArray from 'lodash/isArray'
import { LazyLoadImage, LazyLoadComponent } from 'react-lazy-load-image-component';

export default class Picture extends Component {
    constructor(props) {
		super(props);
		this.state = {
			imageSrc: '/static/images/country/world.jpg',
			imageError: false,
			isMobile: false
		};
	}

	componentDidMount() {
        window.addEventListener("resize", this.resize.bind(this));
	}

	resize() {
        let mobile = (window.innerWidth <= 812);
        if (mobile !== this.state.isMobile) {
            this.setState({ isMobile: mobile });
        }
    }

	handleImageError = () => {
		this.setState({
			imageError: true
		});
	};

	getSourceProps = (source) => {
		const { item: { src } } = this.props;
		const { imageError, imageSrc } = this.state;
		const {
			width, height, pictureSource, media, type
		} = source;
		
		let sourceProps = { srcSet: encodeURI(pictureSource) || `${src}?width=${width}&height=${height}` };
		if(imageError){
			sourceProps = { srcSet: `${imageSrc}?width=${width}&height=${height}`};
		}

		if (media) {
			sourceProps.media = `${media}`;
		}else{ 
            let customMedia = 'all';
            switch (type) {
                case 'desktop':
                    customMedia = '(min-width: 1200px)';
                    break;
                case 'large':
                    customMedia = '(min-width: 1024px)';
                    break;
                case 'medium':
                    customMedia = '(min-width: 768px)';
                    break;
                case 'thumbnail':
                    customMedia = '(min-width: 450px)';
                    break;
                case 'thumbnail_small':
                    customMedia = '(min-width: 170px)';
                    break;
                // Add more cases as needed
                default:
                    break;
            }
            sourceProps.media = `${customMedia}`;
        }

		return sourceProps;
	};

	renderSource = (source, index) => {
		return <source key={`source-${index}`} {...this.getSourceProps(source)} />;
	};

    render() {
		const { item: { alt, src, sources } } = this.props;
		const { imageError, imageSrc, isMobile } = this.state;
        const style =  isMobile ? { width: '100%' } : null;
		
		const img = <img style={style} className='d-block img-fluid' src={(imageError) ? imageSrc : src} alt={alt} onError={this.handleImageError} />;
		return (
			<LazyLoadComponent effect="blur" >
				{!!sources && sources.length ? (
					<picture style={style}>
						{sources.map(this.renderSource)}
						{img}
					</picture>
				) : img}
			</LazyLoadComponent>
		)
	}
}