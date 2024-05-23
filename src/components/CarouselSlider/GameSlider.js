import { forEach } from 'lodash';
import React, { Component, Fragment } from 'react'
import { connect } from "react-redux";
import { SetInnerHtml } from '../set-inner-html';
import ArrowLeft from '../../../static/svg-js/arrow-left';
import ArrowRight from '../../../static/svg-js/arrow-right';
import {
    DEFAULT_LIMIT_GAMESLIDE,
} from '../../../utils/CONSTANTS';
import { getPlatform } from '../../../utils';
import isUndefined from 'lodash/isUndefined';
const locale = require('react-redux-i18n').I18n

const EXCEPT_INGROUP = ['casino-new-games', 'webapi-bonusbuy', 'webapi-mini', 'webapi-casino-live'];

class GamesSlider extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.loadScriptSlider();
		window.addEventListener('resize', this.resize.bind(this));
    }
    componentDidUpdate() {
        this.loadScriptSlider();
    }

    resize = () => {
		this.loadScriptSlider();
	}

    loadScriptSlider = () => {
        const { isMobile, id, slugID, useragent, pageHome } = this.props;
        const COMPONENT_SELECTOR = `#${id}.carousel__wrapper`;
        const CONTROLS_SELECTOR = '.carousel__controls';
        const CONTENT_SELECTOR = '.carousel__content';
        //const CONTENT_SELECTOR = '#jackpot';

        const platform = getPlatform(useragent);
        const currentViewportScale = (platform === 'PC')?1:0.75;

        let fomatDevice = "PC";
        let innerWidth = window.innerWidth;
        if (innerWidth >= 1000 / currentViewportScale && fomatDevice !== "pc") {
            fomatDevice = "pc";
        } else if (innerWidth >= 768 / currentViewportScale && innerWidth < 1000 / currentViewportScale && fomatDevice !== "ipad") {
            fomatDevice = "ipad";
        } else if (innerWidth >= 564 / currentViewportScale && innerWidth < 768 / currentViewportScale && fomatDevice !== "mobileLandscap") {
            fomatDevice = "mobileLandscap";
        } else if (innerWidth < 564 / currentViewportScale && fomatDevice !== "mobile") {
            fomatDevice = "mobile";
        }

        const gridGap = EXCEPT_INGROUP.includes(slugID)?13:0;

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

                    if (EXCEPT_INGROUP.includes(slugID)) {
						const layoutGame = content.querySelectorAll('.games-list-item');
						const gridCol = 13;

						const newWidthItem = content.clientWidth / DEFAULT_LIMIT_GAMESLIDE.homerow1[fomatDevice];
						const scale = 1.5;
						const desiredHeight = (scale * (newWidthItem - gridCol));
						layoutGame.forEach(function (element) {
							element.style.width = ((newWidthItem - gridCol)+ (gridCol / DEFAULT_LIMIT_GAMESLIDE.homerow1[fomatDevice])) + 'px';
							element.style.height = (desiredHeight) + 'px';

						});
					}
                    if ((!pageHome || isUndefined(pageHome)) && !isMobile){
                        let limitItem = 4;
                        if(innerWidth >= 1200 / currentViewportScale){
                            limitItem = 6;
                        }else if (innerWidth >= 1000 / currentViewportScale && innerWidth < 1200 / currentViewportScale){
                            limitItem = 5;
                        } 

                        const layoutGame = content.querySelectorAll('.games-list-item');
						const gridCol = 5;

						const newWidthItem = content.clientWidth / limitItem;
						const scale = 3/4;
						const desiredHeight = (scale * (newWidthItem - gridCol));
						layoutGame.forEach(function (element) {
							element.style.width = (newWidthItem - 10) + 'px';
							element.style.height = (desiredHeight) + 'px';
                            element.style.marginRight = `${gridCol}px`;
						});
                    }else if((!pageHome || isUndefined(pageHome)) && isMobile){
                        const layoutGame = content.querySelectorAll('.games-list-item');
						layoutGame.forEach(function (element) {
							element.style.width = '180px';
							element.style.height = 'auto';
						});
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

                    if (nextButton) {
                        nextButton.addEventListener('click', function (event) {
                            event.preventDefault();
                            x = content.clientWidth + content.scrollLeft + gridGap;
                            content.scroll({
                                left: x,
                                behavior: 'smooth',
                            });
                        });
                    }

                    if (prevButton) {
                        prevButton.addEventListener('click', function (event) {
                            event.preventDefault();
                            x = content.clientWidth - content.scrollLeft + gridGap;
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
                        for (let i = 0; i < countSlides; i++) {
                            if ((content.clientWidth * (i + 1)) - 1 >= x) {
                                dotPosition = i + 1;
                                break;
                            }
                        }

                        if (dots && dots.length > 0) {
                            dots[dotPosition - 1].checked = true;
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
        const { lobbiesData, slideContentCount, dotName = null, } = this.props;
        let itemDots = [];
        for (let i = 0; i < slideContentCount; i++) {
            itemDots.push(<label className="carousel-dot">
                <input type='radio' name={dotName || lobbiesData.slug} className='dot' value={i} />
                <span className="checkmark"></span>
            </label>)
        }

        return itemDots;
    }

    renderButton = () => {
        const { urlLink, handleFilterGames, category, pageHome } = this.props;
        let button = <a className='btn-4 btn' href={urlLink}>{locale.t('showAll')}</a>
        if (!pageHome && category !== null) {
            button = <button className='btn btn-4' onClick={() => handleFilterGames(category)}>{locale.t('showAll')}</button>
        }

        return button
    }

    render() {
        const {
            children,
            slideContentCount,
            title = '',
            className = '',
            showDot,
            showButton = false,
            statusGroup = true,
            showArrow,
            id = '',
            slugID,
            pageHome,
            sectionType,
            isMobile
        } = this.props;
        const titleSplit = title.split(' ');
        const titleFirst = titleSplit[0];
        let titleSeconde = ""
        if (titleSplit.length >= 2) {
            titleSeconde = titleSplit.slice(1).join(" ");
        }

        let setGroup = EXCEPT_INGROUP.includes(slugID) || !pageHome?false:statusGroup;
        if(sectionType === 'jackpot' && isMobile){
            setGroup = false;
        }

        if(id === 'casinofavorites' || id.includes('lastplay')) return null;

        return (<div className={`carousel ${className}`}>            
            <div id={id} className='carousel__wrapper'>
                <div className='Header'>
                    <div className='Title'><span>{titleFirst ? titleFirst.toLocaleUpperCase() : ''} </span><span>{titleSeconde ? titleSeconde.toLocaleUpperCase() : ''}</span></div>
                    <div className='RightSide'>
                        {showButton && this.renderButton()}
                        {showDot && showDot !== undefined && (<div className="carousel__controls" >
                            {this.renderDots()}
                        </div>)}
                        {showArrow && (<div className="carousel__controls" >
                            {this.renderArrow()}
                        </div>)}
                    </div>
                </div>
                {
                    setGroup ?
                        (<div
                            className='carousel__content'
                            style={{ gridTemplateColumns: `repeat(${Math.ceil(slideContentCount)}, minmax(100%, 1fr))` }}
                        >
                            {children}
                        </div>)
                        :
                        (<div
                            className='carousel__content'
                            style={{ gridTemplateColumns: `unset` }}
                        >
                            {children}
                        </div>)
                }
            </div>
        </div>)
    }
}

export default connect(null, null)(GamesSlider);
