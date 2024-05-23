
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import isUndefined from 'lodash/isUndefined';
import isArray from 'lodash/isArray';
import isNull from 'lodash/isNull';
import isEmpty from 'lodash/isEmpty';
import includes from 'lodash/includes';
import find from 'lodash/find';
import Picture from '../Picture'
import '../../../styles/components/_sliders.scss'
import { promotion, sportsBetting } from "../../constants/routes";
import { REGISTERMODAL, DEPOSITMODAL, SET_SESSION_READY } from "../../constants/types";
import WPService from '../../../services'
import { Carousel } from 'react-responsive-carousel';
import {
    overrideLink,
    getCookie
} from '../../../utils'
import "../../../styles/components/_carousel.scss";

const PROMOTION = promotion

class Sliders extends Component {
    constructor(props) {
        super(props);
        this.state = {
            index: 0,
            direction: null,
            isLoading: true,
            sliders: [],
            isLogin: props.isLogin,
            percentSliders: 60,
            isMobile: false
        }
    }

    componentDidMount() {
        window.addEventListener("resize", this.resize.bind(this));
        this.resize();

        this.props.onSetIsReady({
            isReady: true,
        })

        if (this.props.firstSegment !== 'faq' && this.props.actualPage !== '/page-game-play') {
            this.getSliers(this.props, this.props.isLogin)
        }
    }

    resize() {
        const { percentSliders } = this.state;
        let w = (window.innerWidth <= 1600);

        if (percentSliders !== 80 && w && window.innerWidth > 768){
            this.setState({ percentSliders: 80 });
        }else if (percentSliders !== 60 && !w && window.innerWidth > 768){
            this.setState({ percentSliders: 60 });
        }else if (percentSliders !== 100 && window.innerWidth <= 768) {
            this.setState({ percentSliders: 100 });
        }

        let mobile = (window.innerWidth <= 768);
        if (mobile !== this.state.isMobile) {
            this.setState({ isMobile: mobile });
        }
      }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.session.isLogin && nextProps.session.isLogin !== this.props.session.isLogin && !this.state.isLogin) {
            this.getSliers(nextProps, nextProps.session.isLogin)
        } else {
            if (nextProps.session.isReady !== this.props.session.isReady) {
                this.getSliers(nextProps, nextProps.session.isLogin)
            }
        }
    }

    getSliers = (props, isLogin) => {
        let role = 'anonymous'
        let roleCookie = getCookie('role', document.cookie)

        if (!isEmpty(roleCookie)) {
            if (JSON.parse(roleCookie).length) {
                if (isLogin) {
                    let userRole = JSON.parse(roleCookie).join()

                    if (includes(userRole, 'undefined')) {
                        role = 'logged_in,new_customer_0'
                    } else {
                        role = `logged_in,${userRole}`
                    }
                }
            }
        }

        if (props.session.isReady) {
            WPService.getSliders(this.props.lang, role, props.pageData.slug, props.type).then((res) => {
                WPService.getSlidersDefault(this.props.lang, role, props.pageData.slug, props.type).then((resDefault) => {
                    if (!isUndefined(resDefault.data)) {
                        res.data = res.data.concat(resDefault.data)
                    }
                    this.setState({
                        sliders: res,
                        isLogin
                    })
                })
            })
        }
    }

    handleSelect = (selectedIndex, e) => {
        this.setState({
            index: selectedIndex,
            direction: e
        });
    }

    handleToggle = (data) => {
        const { onSetRegisterModal, onSetDepositModal } = this.props
        if (data.promotionButtonType == 'register') {
            if (!data.isSliderPostType) {
                const params = {
                    status: true,
                    id: data.id,
                }
                onSetRegisterModal(params);
            } else {
                onSetRegisterModal(true);
            }

        } else if (data.promotionButtonType == 'deposit') {
            if (!data.isSliderPostType) {
                const params = {
                    status: true,
                    id: data.id,
                }
                onSetDepositModal(params);
            } else {
                onSetDepositModal(true);
            }
        }
    }

    handleClickSlide = (item) => {
        if (!isUndefined(item.promotionButtonAvailable)) {
            if (item.promotionButtonType == 'custom') {
                if (item.promotionButtonLink != null && item.promotionButtonLink != undefined && item.promotionButtonLink != '') {
                    window.location.href = `${item.promotionButtonLink}`;
                }
            } else if (item.promotionButtonType === 'register' || item.promotionButtonType === 'deposit') {
                this.handleToggle(item)
            } else if (item.promotionButtonType == 'bet') {
                const goTo = `${sportsBetting}?basePath=${overrideLink(item.promotionButtonLink)}`
                window.location.href = `${goTo}`;
            } else {
                const goTo = PROMOTION + item.categories + '/' + item.slug;
                window.location.href = `${goTo}`;
            }
        }
    }

    _renderItem = (sliders) => {
        const { page, type } = this.props
        const { isMobile } = this.state

        let layout = []
        // sliders = [...sliders, ...sliders]
        sliders.map((res, index) => {
            const imageMobile = find(res.image.sources, (o) => o.type === 'mobile');
            const imageSrc = isMobile && imageMobile ? imageMobile.pictureSource : res.image.src;

            let image = {};
            let button = ''

            image = res.image
            image.alt = res.alt;
            if (!isUndefined(res.promotionButtonAvailable)) {
                if (res.promotionButtonType == 'custom') {
                    if (res.promotionButtonLink != null && res.promotionButtonLink != undefined && res.promotionButtonLink != '') {
                        button = <a className={'button btn-4'} href={(res.promotionButtonLink)} title={res.promotionButtonText}>
                            {res.promotionButtonText}
                            <i className="jb-icon icon-default registerpage-arrow-right" />
                        </a>
                    }
                } else if (res.promotionButtonType == 'register') {
                    button = <button className={'button btn-4'} onClick={() => { this.handleToggle(res) }} title={res.promotionButtonText}>
                        {res.promotionButtonText}
                    </button>
                } else if (res.promotionButtonType == 'deposit') {
                    button = <button className={'button btn-4'} onClick={() => { this.handleToggle(res) }} title={res.promotionButtonText}>
                        {res.promotionButtonText}
                    </button>
                } else if (res.promotionButtonType == 'bet') {
                    let goTo = `${sportsBetting}?basePath=${overrideLink(res.promotionButtonLink)}`
                    button = <a className={'button btn-4'} href={goTo} title={res.promotionButtonText}>
                        {res.promotionButtonText}
                    </a>
                } else {
                    let goTo = PROMOTION + res.categories + '/' + res.slug

                    button = <a className={'button btn-4'} href={goTo} title={res.promotionButtonText}>
                        {res.promotionButtonText}
                    </a>
                }
            }

            const titleSplit = res.title.split(' ');
            let titleFirst = res.title;
            let titleSeconde = ""
            if (titleSplit.length >= 3) {
                titleFirst = `${titleSplit[0]} ${titleSplit[1]}`;
                titleSeconde = titleSplit.slice(2).join(" ");
            }

            if(page == 'home' && type == 'bottom'){
                layout.push(
                    <div key={`slide${index}`} className={`sliderItems ${button !== ''?'HasClick':''}`} onClick={()=> this.handleClickSlide(res)} >
                        <img src={imageSrc} />
                        <div className="carousel-caption">
                            <Row className="justify-content-start h-100" >
                                <div className={`sliders-layout-text sliderStyle_1`}>
                                    <div className="content-text">
                                        <div>
                                            <h1 dangerouslySetInnerHTML={{ __html: titleFirst }} />
                                            {titleSeconde !== "" && <h1 dangerouslySetInnerHTML={{ __html: titleSeconde }} />}
                                            <div className="description"  >
                                                <p dangerouslySetInnerHTML={{ __html: res.shortDescription }}></p>
                                            </div>
                                        </div>
                                        <div className="buttonSlider d-flex">
                                            {button}
                                        </div>
                                    </div>
                                </div>
                            </Row>
                        </div>
                    </div>
                )
            }else{
                layout.push(
                    <div key={`slide${index}`} className={`sliderItems ${button !== ''?'HasClick':''}`} onClick={()=> this.handleClickSlide(res)} >
                        {/* <Picture item={image} visibleByDefault={true} /> */}
                        <img src={imageSrc} />
                        <div className="carousel-caption">
                            <Row className="justify-content-start h-100" >
                                <div className={`sliders-layout-text sliderStyle_1`}>
                                    <div className="content-text">
                                        <div>
                                            <h1 dangerouslySetInnerHTML={{ __html: titleFirst }} />
                                            {titleSeconde !== "" && <h1 dangerouslySetInnerHTML={{ __html: titleSeconde }} />}
                                            <div className="description"  >
                                                <p dangerouslySetInnerHTML={{ __html: res.shortDescription }}></p>
                                            </div>
                                        </div>
                                        <div className="buttonSlider d-flex">
                                            {button}
                                        </div>
                                    </div>
                                </div>
                            </Row>
                        </div>
                    </div>
                )
            }

        })
            return layout;
    }

    render() {
        const { useragent, page, type, firstSegment } = this.props
        const { sliders, percentSliders, isMobile } = this.state;
        const specificPage = [
            'responsible-gaming'
        ]
        if(firstSegment === 'account') return null;
        //let isMobile = false
        let isCenterMode = !isUndefined(sliders) && !isUndefined(sliders.data) && !isNull(sliders.data) && isArray(sliders.data) && sliders.data.length > 1 ? true : false
        // if (!isUndefined(useragent.isMobile) && useragent.isMobile) {
        //     isCenterMode = false
        //     isMobile = true
        // }
        isCenterMode = (isMobile) ? false : true;   
        let specificShowSliderMobile = true;
        if (page.includes(specificPage) && isMobile) {
            specificShowSliderMobile = false;
        }
        let classNameContainer = ''
        if(page == 'home' && type == 'bottom'){
            classNameContainer  = 'container-sliders'
        }
        return (
            !isUndefined(sliders) && !isUndefined(sliders.data) && !isNull(sliders.data) && isArray(sliders.data) && sliders.data.length > 0 && specificShowSliderMobile ?
                <section className={`sliders ${classNameContainer}`}>

                    <div className={`${isCenterMode ? "sliders-container muti-carousel" : "sliders-container"} `}>
                        <Carousel
                            showArrows={true}
                            showStatus={false}
                            showThumbs={false}
                            showIndicators={isMobile}
                            infiniteLoop={true}
                            autoPlay={true}
                            stopOnHover={true}
                            interval={6000}
                            emulateTouch={true}
                            thumbWidth={100}
                            centerMode={true}
                            centerSlidePercentage={100}
                        >
                            {this._renderItem(sliders.data)}
                        </Carousel>
                    </div>
                </section >
                : null
        )
    }
}

const mapStateToProps = (state) => ({
    isConnected: state.EM.isConnected,
    session: state.sessionState
});

const mapDispatchToProps = (dispatch) => ({
    onSetRegisterModal: (active) => dispatch({ type: REGISTERMODAL, active }),
    onSetDepositModal: (active) => dispatch({ type: DEPOSITMODAL, active }),
    onSetIsReady: (active) => dispatch({ type: SET_SESSION_READY, active }),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Sliders);