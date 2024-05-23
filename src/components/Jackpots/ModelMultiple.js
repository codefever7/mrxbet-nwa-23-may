
import React, { Component } from 'react';
const config = require(`../../../config`).config;
import { connect } from 'react-redux';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import { Carousel } from 'react-responsive-carousel';
import Picture from '../Picture'
import CasinoService from '../../services/em/casino'
import { convertComma, getSymbol } from '../../../utils'
import LoadBlock from '../Loading/LoadBlock'
import forEach from 'lodash/forEach';
import isUndefined from 'lodash/isUndefined';
import { jackpots } from "../../constants/routes";
import * as routes from '../../constants/routes'
import * as casinoParams from '../../constants/casinoParams'
import "../../../styles/components/_carousel.scss";
import '../../../styles/components/_sliders.scss'

const locale = require('react-redux-i18n').I18n
let desktopShow = 7
let mobileShow = 2

class ModelMultiple extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            index: 0,
            data: [],
            isMobile: false,
            num: 1
        }
    }
    filterByPlatform = (filterByPlatform) => {
        let { useragent } = this.props
        if (useragent) {
            if (useragent.isDesktop) {
                filterByPlatform = [casinoParams.casinoPlatform.PC]
            } else if (useragent.isMobile) {
                if (useragent.isAndroid) {
                    filterByPlatform = [casinoParams.casinoPlatform.android]
                } else if (useragent.isiPad) {
                    filterByPlatform = [casinoParams.casinoPlatform.iPad]
                } else if (useragent.isiPhone) {
                    filterByPlatform = [casinoParams.casinoPlatform.iPhone]
                } else {
                    if (useragent.os == 'Windows Phone 8.0') {
                        filterByPlatform = [casinoParams.casinoPlatform.WP8]
                    } else if (useragent.os == 'Windows Phone 8.1') {
                        filterByPlatform = [casinoParams.casinoPlatform.WP81]
                    } else {
                        filterByPlatform = [casinoParams.casinoPlatform.WM7]
                    }
                }
            }
        }
        return filterByPlatform
    }
    componentDidMount() {
        window.addEventListener("resize", this.resize.bind(this));
        this.resize();
        this.loadBlock.isOpen(true)
        let params = casinoParams.getJackpotsParams
        params.filterByPlatform = this.filterByPlatform(params.filterByPlatform)
        CasinoService.getJackpots().then((res) => {
            if (res) {
                let nums = res.jackpots.length
                let n = Math.ceil(nums / desktopShow)
                let sh = desktopShow
                let keyData = []
                let i = 0
                if (this.props.isMobile) {
                    n = Math.ceil(nums / mobileShow)
                    sh = mobileShow
                }
                for (let ii = 0; ii < n; ii++) {
                    let nn = []
                    for (let ix = 0; ix < sh; ix++) {
                        if (nums === i) {
                            i = 0
                        }
                        nn[ix] = i
                        i++
                    }
                    keyData[ii] = nn
                }
                this.setState({
                    data: res.jackpots,
                    num: keyData
                }, () => { 
                    if (this.loadBlock) this.loadBlock.isOpen(false) 
                    }
                )
            }

        })
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
        const { isMobile, data, name } = this.state
        if (nextProps.isMobile !== isMobile) {
            this.mainPC(nextProps.isMobile)
        }
    }
    mainPC = (isMobile = false) => {
        const { data } = this.state
        let nums = data.length
        let n = Math.ceil(nums / desktopShow)
        let sh = desktopShow
        let keyData = []
        let i = 0

        if (isMobile) {
            n = Math.ceil(nums / mobileShow)
            sh = mobileShow
        }
        for (let ii = 0; ii < n; ii++) {
            let nn = []
            for (let ix = 0; ix < sh; ix++) {
                if (nums === i) {
                    i = 0
                }
                nn[ix] = i
                i++
            }
            keyData[ii] = nn
        }
        this.setState({
            num: keyData,
            isMobile: isMobile
        })
    }
    resize() {
        let mobile = (window.innerWidth <= 812);
        
        if (mobile) {
            if(window.innerWidth < 768){
                desktopShow = 2
            }else{
                desktopShow = 5
            }
            
        }else {
            desktopShow = 7
        }
        this.mainPC()
    }
    listItem = (res) => {
        const { data } = this.state
        const dataWithEUR = []
        const dataWithoutEUR = []
        data.forEach(jackpot => {
            if(jackpot.amount.EUR) {
                dataWithEUR.push(jackpot)
            } else {
                dataWithoutEUR.push(jackpot)
            }
        });
        const dataSorted = dataWithEUR.sort(function(a, b) {
            return b.amount.EUR - a.amount.EUR;
        })
        dataWithoutEUR.forEach(jackpot => {
            dataSorted.push(jackpot)
        });
        let listItem = []
        forEach(res, (res, index) => {
            let images = {};
            images.src = dataSorted[res].game.logo
            images.alt = dataSorted[res].game.shortName
            let amount = 0;
            let currency = this.props.currency;
            if(!isUndefined(dataSorted[res].amount[this.props.currency])){
                amount = dataSorted[res].amount[this.props.currency]
            }else{
                if(!isUndefined(dataSorted[res].amount[config.currency])){
                    amount = dataSorted[res].amount[config.currency]
                    currency = config.currency
                }else{
                    amount = dataSorted[res].amount[Object.keys(dataSorted[res].amount)[0]]
                    currency = Object.keys(dataSorted[res].amount)[0]
                }
            }
            listItem.push(
                <div className="item" key={`index-${index}`}>
                        <a className="content-img" href={`${routes.casinoGamePlay}${dataSorted[res].game.slug}`}>
                            <Picture item={images} />
                        </a>
                    <div className="content-text">
                            <a href={`${routes.casinoGamePlay}${dataSorted[res].game.slug}`}>
                                <p className="title">{dataSorted[res].game.shortName}</p>
                                <p className="price" >{`${getSymbol(currency)} ${convertComma(amount)}`}</p>
                            </a>
                    </div>
                </div>
            )
        })
        return listItem
    }
    _renderItem = () => {
        const { num } = this.state
        let listItemAll = []
        forEach(num, (res, index) => {
            listItemAll.push(
                <div key={index}>
                    <div className="group-item">
                        {this.listItem(res)}
                    </div>
                </div>
            )
        })

        return listItemAll;
    }
    handleSelect = (selectedIndex) => {
        this.setState({
            index: selectedIndex
        });
    }
    render() {
        return (
            <div className="jackpots position-relative">
                <Container>
                    <Row>
                        <Col md={6} xs={12}>
                            <h2 className="title-middle">{locale.t('checkCurrentJackpots')}</h2>
                        </Col>
                        <Col md={6} xs={12} className="align-right">
                            <a href={jackpots}>
                                <button type="button" className="btn-all">
                                    {locale.t('allJackpots')}
                                </button>
                            </a>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="mt-2">
                            <Carousel
                                showArrows={true}
                                showStatus={false}
                                showThumbs={false}
                                infiniteLoop={false}
                                autoPlay={false}
                                stopOnHover={true}
                                interval={4000}
                            >
                                {this._renderItem()}
                            </Carousel>
                        </Col>
                    </Row>
                </Container>
                <LoadBlock ref={ref => this.loadBlock = ref} />
            </div>
        )
    }
}

export default connect(null, null)(ModelMultiple);
