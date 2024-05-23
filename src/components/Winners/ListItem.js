
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Carousel from 'react-bootstrap/Carousel';
import { convertComma, getSymbol } from '../../../utils'
import CasinoService from '../../services/em/casino'
import * as routes from '../../constants/routes'
import * as casinoParams from '../../constants/casinoParams'
import forEach from 'lodash/forEach'

let desktopShow = 5
let mobileShow = 2

class ListItem extends Component {
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
    UNSAFE_componentWillMount() {
        window.addEventListener("resize", this.resize.bind(this));
        this.resize();
        let params = casinoParams.getRecentWinnersParams
        params.filterByPlatform = this.filterByPlatform(params.filterByPlatform)
        CasinoService.getRecentWinners(params).then((res) => {
            if (res) {
                let nums = res.winners.length
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
                    data: res.winners,
                    num: keyData
                })

            }
        })
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
        const { isMobile } = this.state
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
                desktopShow = 3
            }
        }
        else {
            desktopShow = 5
        }
        this.mainPC()
    }
    addDefaultSrc = (ev) => {
        ev.target.src = '/static/images/country/world.jpg'
    }
    listItem = (res) => {
        const { data } = this.state
        let listItem = []
        forEach(res, (res, index) => {
            listItem.push(
                <div className="item" key={index}>
                    <a className="content-img" href={`${routes.casinoGamePlay}${data[res].game.slug}`}>
                        <img src={`/static/images/country/${data[res].country}.jpg`} className="d-block img-fluid" alt={data[res].game.country} onError={this.addDefaultSrc} />
                    </a>
                    <div className="content-text">
                        <a href={`${routes.casinoGamePlay}${data[res].game.slug}`}>
                            <p className="title">{data[res].winner}</p>
                            <p className="price" >{`${getSymbol(data[res].currency)} ${convertComma(data[res].amount)}`}</p>
                            <p className="gameName">{data[res].game.shortName}</p>
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
                <Carousel.Item key={index}>
                    <div className="group-item">
                        {this.listItem(res)}
                    </div>
                </Carousel.Item>
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
        const { index } = this.state
        return (
            <div className="content">
                <Container>
                    <Row>
                        <Col className="my-2">
                            <Carousel
                                activeIndex={index}
                                onSelect={(e) => this.handleSelect(e)}
                                controls={false}
                                indicators={false}
                            >
                                {this._renderItem()}
                            </Carousel>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default connect(null, null)(ListItem);
