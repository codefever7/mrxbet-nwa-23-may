import { constant, forEach } from 'lodash';
import React, { Component, Fragment } from 'react'
import { connect } from "react-redux";
import { SetInnerHtml } from '../set-inner-html';
import ArrowLeft from '../../../static/svg-js/arrow-left';
import ArrowRight from '../../../static/svg-js/arrow-right';
const locale = require('react-redux-i18n').I18n

class Index extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.loadScriptSlider();
        
    }
    componentDidUpdate(prevProps) {
        //if (prevProps.isMobile !== this.props.isMobile) {
            this.loadScriptSlider();
        //}
    }
    loadScriptSlider = () => {
        const { isMobile, id, slideDetected} = this.props;
        const COMPONENT_SELECTOR = `#${id}.carousel__wrapper`;
        const CONTROLS_SELECTOR = '.carousel__controls';
        const CONTENT_SELECTOR = '.carousel__content';
        //const CONTENT_SELECTOR = '#jackpot';

        const components = document.querySelectorAll(COMPONENT_SELECTOR);

        for (let i = 0; i < components.length; i++) {
            const component = components[i];
            if (component) {
                const content = component.querySelector(CONTENT_SELECTOR);
                const controlComponent = component.querySelector(CONTROLS_SELECTOR);

                const nextButton = (controlComponent !== null) ? controlComponent.querySelector('.arrow-next') : null;
                const prevButton = (controlComponent !== null) ? controlComponent.querySelector('.arrow-prev') : null;
                const dots = controlComponent ? controlComponent.querySelectorAll('.dot') : null;

                let x = 0;
                let mx = 0;

                if (content) {

                    const maxScrollWidth = content.scrollWidth - (content.clientWidth / 2) - (content.clientWidth / 2);

                    if (maxScrollWidth !== 0) {
                        component.classList.add('has-arrows');
                    }

                    if (controlComponent !== null) {
                        content.addEventListener('scroll', scrollHandler);
                    }

                    if (dots && dots.length > 0) {
                        const dotsChecked = controlComponent.querySelector('.dot:checked');
                        if (dotsChecked === null) {
                            dots[0].checked = true;
                        }
                        for (let d = 0; d < dots.length; d++) {
                            dots[d].addEventListener('change', function (event) {
                                const target = event.target;
                                event.preventDefault();
                                x = content.clientWidth * target.value;
                                content.scroll({
                                    left: x,
                                    behavior: 'smooth',
                                });
                            });
                        }

                    }

                    /**
                     * Scroll handler.
                     */
                    const scrollHandler = () => {
                        toggleArrows();
                    };

                    /**
                     * Toggle arrow handler.
                     */
                    const toggleArrows = () => {
                        if (content.scrollLeft > maxScrollWidth - 10) {
                            nextButton.classList.add('disabled');
                        } else if (content.scrollLeft < 10) {
                            prevButton.classList.add('disabled');
                        } else {
                            nextButton.classList.remove('disabled');
                            prevButton.classList.remove('disabled');
                        }
                    };

                    if (slideDetected === 'next') {
                        x = content.clientWidth + content.scrollLeft + 0;
                        content.scroll({
                            left: x,
                            behavior: 'smooth',
                        });
                    } else if (slideDetected === 'prev') {
                        x = content.clientWidth - content.scrollLeft + 0;
                        content.scroll({
                            left: -x,
                            behavior: 'smooth',
                        });
                    }

                    if (nextButton) {
                        nextButton.addEventListener('click', function (event) {
                            event.preventDefault();
                            x = content.clientWidth + content.scrollLeft + 0;
                            content.scroll({
                                left: x,
                                behavior: 'smooth',
                            });
                        });
                    }

                    if (prevButton) {
                        prevButton.addEventListener('click', function (event) {
                            event.preventDefault();
                            x = content.clientWidth - content.scrollLeft + 0;
                            content.scroll({
                                left: -x,
                                behavior: 'smooth',
                            });
                        });
                    }

                    /**
                     * Mouse move handler.
                     *
                     * @param {object} e event object.
                     */
                    const mousemoveHandler = (e) => {
                        const mx2 = e.pageX - content.offsetLeft;
                        if (mx && isMobile) {
                            content.scrollLeft = content.sx + mx - mx2;
                        }
                    };

                    /**
                     * Mouse down handler.
                     *
                     * @param {object} e event object.
                     */
                    const mousedownHandler = (e) => {
                        content.sx = content.scrollLeft;
                        mx = e.pageX - content.offsetLeft;
                        content.classList.add('dragging');
                    };

                    /**
                     * Mouse up handler.
                     */
                    const mouseupHandler = () => {
                        mx = 0;
                        content.classList.remove('dragging');
                    };
                    
                    const handlerScroll = (e) => {
                        const countSlides = maxScrollWidth / content.clientWidth;
                        const x = content.scrollLeft;
                        let dotPosition = 1;
                        for(let i = 0; i < countSlides; i++){
                            if((content.clientWidth * (i +1 )) - (content.clientWidth * 0.3) >= x){
                                dotPosition = i + 1;
                                break;
                            }
                        }

                        if (dots && dots.length > 0) {
                            dots[dotPosition-1].checked = true;
                        }
                    }
                    content.addEventListener('scroll', handlerScroll);

                    if (isMobile) {
                        content.addEventListener('mousemove', mousemoveHandler);
                        content.addEventListener('mousedown', mousedownHandler);
                        content.addEventListener('mouseup', mouseupHandler);
                        content.addEventListener('mouseleave', mouseupHandler);
                    }
                }
            }
        }
    }

    renderArrow = () => {
        return (<div className='Arrows'>
            <a className='arrow-prev'>
                <SetInnerHtml tagName="span" htmlProps={{ className: 'icon' }} innerHtml={ArrowLeft} />
            </a>
            <a className='arrow-next'>
                <SetInnerHtml tagName="span" htmlProps={{ className: 'icon' }} innerHtml={ArrowRight} />
            </a>
        </div>)
    }

    renderDots = () => {
        const {
            slideContentCount,
            dotName = 'radioSlide',
        } = this.props;
        let itemDots = [];
        for (let i = 0; i < slideContentCount; i++) {
            itemDots.push(<label key={`dots-${i}`} className="carousel-dot">
                <input type='radio' name={dotName} className='dot' value={i} />
                <span className="checkmark"></span>
            </label>)
        }

        return itemDots;
    }

    render() {
        const {
            children,
            slideContentCount,
            title = '',
            className = '',
            showDot,
            statusGroup = true,
            showButton = false,
            urlLink = '',
            showArrow,
            id = '',
            isMobile,
        } = this.props;
        const titleSplit = title.split(' ');
        const titleFirst = titleSplit[0];
        let titleSeconde = ""
        if (titleSplit.length >= 2) {
            titleSeconde = titleSplit.slice(1).join(" ");
        }

        return (<div className={`carousel ${className}`}>
            <div id={id} className='carousel__wrapper'>
                <div className='Header'>
                    <div className='Title'><span>{titleFirst} </span><span>{titleSeconde}</span></div>
                    <div className='RightSide'>
                        {showButton && <a className='btn-4 btn' href={urlLink}>{locale.t('showAll')}</a>}
                        {showDot && showDot !== undefined && (<div className="carousel__controls" >
                            {this.renderDots()}
                        </div>)}
                        {showArrow && (<div className="carousel__controls" >
                            {this.renderArrow()}
                        </div>)}
                    </div>
                </div>
                {
                    statusGroup ?
                        (<div
                            className={`carousel__content ${Math.ceil(slideContentCount) <= 1 ?'singer':''}`}
                            style={{ gridTemplateColumns: `repeat(${Math.ceil(slideContentCount)}, minmax(100%, 1fr))` }}
                        >
                            {children}
                        </div>)
                        :
                        (<div
                            className='carousel__content'
                            style={{
                                ...{ gridTemplateColumns: `unset` }, 
                                ...(isMobile && id == 'CategoriesSlideSection' ? { gridTemplateRows: `repeat(2,1fr)` } : {})
                            }}
                        >
                            {children}
                        </div>)
                }
            </div>
        </div>)
    }
}

export default connect(null, null)(Index);
