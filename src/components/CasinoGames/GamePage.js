import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { MESSAGEMODAL, LOGINMODAL } from "../../constants/types"
import { convertComma, getSymbol, getCookie } from '../../../utils'
import * as casinoParams from '../../constants/casinoParams'
import * as routes from '../../constants/routes'
import CasinoService from '../../services/em/casino'
import Picture from '../Picture'
import LoadBlock from '../Loading/LoadBlock'
import Carousel from 'react-bootstrap/Carousel'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import cloneDeep from 'lodash/cloneDeep'
import isNull from 'lodash/isNull'
import values from 'lodash/values'
import forEach from 'lodash/forEach'
import isUndefined from 'lodash/isUndefined'
const locale = require('react-redux-i18n').I18n
const desktopShow = 7
const mobileShow = 3

export class GamePage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: props.dataGame,
            dataListJackport: [],
            dataListWinner: [],
            index: 0,
            num: 1,
            isMobile: false,
            isLoadData: false
        }
    }
    getDataService = async () => {
        const { dataGame } = this.props
        try {
            this.loadBlockList.isOpen(true)
            let getGamesParams = {}
            let getGames = {}
            let dataListJackport = {}
            if (!isUndefined(dataGame.tableID)) {
                getGamesParams = cloneDeep(casinoParams.getLiveCasinoTablesParams);
                getGamesParams.filterByCategory = dataGame.categories
                getGamesParams.filterByPlatform = this.filterByPlatform(getGamesParams.filterByPlatform)
                getGames = await CasinoService.getLiveCasinoTables(getGamesParams)
                dataListJackport = values(getGames.tables)
            } else {
                getGamesParams = cloneDeep(casinoParams.getGamesParams);
                getGamesParams.filterByCategory = dataGame.categories
                getGamesParams.filterByPlatform = this.filterByPlatform(getGamesParams.filterByPlatform)
                getGames = await CasinoService.getGames(getGamesParams)
                dataListJackport = values(getGames.games)
            }
            const getRecentWinners = await CasinoService.getRecentWinners();
            this.setState({
                dataListJackport,
                dataListWinner: values(getRecentWinners.winners),
                num: this.getKeyLength(dataListJackport)
            },
                () => this.loadBlockList.isOpen(false))
        } catch (err) {
            const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
            this.loadBlockList.isOpen(false)
            this.props.onSetMessageModal(set)
        }
    }
    getGamePlayUrl = (status) => {
        const { dataGame, onSetLoginModal } = this.props
        let params = {}
        if(!isUndefined(dataGame)){
            
            if (!isUndefined(dataGame.tableID)) {
                params = {
                    "tableID": dataGame.tableID,
                    "realMoney": status
                }
            } else {
                params = {
                    "slug": dataGame.slug,
                    "realMoney": status
                }
            }
        }
        if (status === false && dataGame.anonymousFunMode === false) {
            if (this.loadBlock) this.loadBlock.isOpen(false)
            onSetLoginModal(true)
        } else {
            CasinoService.getLaunchUrl(params).then((res) => {
                if (res) {
                    let dataItem = dataGame
                    dataItem.url = res.url.replace('http://', 'https://');
                    dataItem.url = dataItem.url + '&casinoLobbyUrl=' + location.origin;
                    this.setState({
                        data: dataItem,
                        isLoadData: true
                    }, () => { if (this.loadBlock) this.loadBlock.isOpen(false) })
                }
            }).catch((err) => {
                //const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
                //if (this.loadBlock) this.loadBlock.isOpen(false)
                //this.props.onSetMessageModal(set)
            })
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
        const { isLogin, funMode } = this.props
        this.loadBlock.isOpen(true)
        if (!funMode) {
            this.getGamePlayUrl(true)
        } else {
            this.getGamePlayUrl(false)
        }
        this.getDataService()
        const win = this._weinnerList.children
        this.inTervalWinner = setInterval(() => {
            if (win.length > 0 && !isUndefined(this._weinnerList) && !isNull(this._weinnerList) && this._weinnerList) {
                win[0].style = 'margin-top: -92px;'
                setTimeout(() => {
                    if (isNull(this._weinnerList) || isUndefined(this._weinnerList)) {
                        clearInterval(this.inTervalWinner)
                        clearTimeout()
                    } else {
                        this._weinnerList.appendChild(win[0])
                        win[win.length - 1].style = 'margin-top: 0px;'
                    }
                }, 1000)
            } else {
                clearInterval(this.inTervalWinner)
                clearTimeout()
            }
        }, 3000)
    }
    componentWillUnmount() {
        clearInterval(this.inTervalWinner)
    }
    getKeyLength = (data) => {
        let nums = data.length
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
        return keyData;
    }
    listItem = (evt) => {
        const { dataListJackport } = this.state
        let listItem = []
        forEach(evt, (res, index) => {
            let images = {};
            let link = ''
            if (!isUndefined(dataListJackport[res].tableID)) {
                link = !this.props.funMode ? `${routes.liveCasinoGamePlay}${dataListJackport[res].tableID}` : `${routes.liveCasinoGameFun}${dataListJackport[res].tableID}`
            } else {
                link = !this.props.funMode ? `${routes.casinoGamePlay}${dataListJackport[res].slug}` : `${routes.casinoGameFun}${dataListJackport[res].slug}`
            }
            images.src = dataListJackport[res].thumbnail
            images.alt = dataListJackport[res].name
            listItem.push(
                <div className="item" key={`index-${index}`}>
                    <a href={link} className="content-img">
                        <Picture item={images} />
                    </a>
                    <div className="content-text">
                        <a href={link}>
                            <p className="title">{dataListJackport[res].name}</p>
                        </a>
                    </div>
                </div>
            )
        })
        return listItem
    }
    setGameOnList = (evt) => {
        const { isLogin, onSetLoginModal } = this.props
        if (isLogin) {
            this.setState({
                data: evt
            })
        } else {
            if (evt.anonymousFunMode) {
                this.setState({
                    data: evt
                })
            } else {
                onSetLoginModal(true)
            }
        }
    }
    addDefaultSrc = (ev) => {
        ev.target.src = '/static/images/country/world.jpg'
    }
    _renderItemWinner = () => {
        const { dataListWinner } = this.state
        let listItemAll = []
        forEach(dataListWinner, (res, index) => {
            listItemAll.push(
                <li key={index}>
                    <div className="group-win-item">
                        <a className="content-img" href={`${routes.casinoGamePlay}${res.game.slug}`}>
                            <img src={`/static/images/country/${res.country}.jpg`} className="d-block img-fluid" alt={res.game.country} onError={this.addDefaultSrc} />
                        </a>
                        <div className="content-text">
                            <a href={`${routes.casinoGamePlay}${res.game.slug}`}>
                                <p className="title">{res.winner}</p>
                                <p className="price" >{`${getSymbol(res.currency)} ${convertComma(res.amount)}`}</p>
                                <p className="gameName">{res.game.shortName}</p>
                            </a>
                        </div>
                    </div>
                </li>
            )
        })
        return listItemAll;
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
        const { data, isLoadData, index } = this.state
        return (
            <Fragment>
                <Container>
                    <Row>
                        <Col md={8}>
                            <h2 className="py-3">{!isUndefined(data) ? data.name : ''}</h2>
                            {isLoadData && <iframe src={!isUndefined(data) ?data.url:''} width="100%" height="450px" />}
                            <LoadBlock ref={ref => this.loadBlock = ref} />
                        </Col>
                        <Col md={4} className="align-self-start">
                            <h2 className="py-3">{locale.t('welcome')}</h2>
                            <ul ref={ref => this._weinnerList = ref} className="winner-list m-0 p-3">
                                {this._renderItemWinner()}
                            </ul>
                        </Col>
                    </Row>
                </Container>
                <div className="game-list-show position-relative">
                    <Container>
                        <Row>
                            <Col md={12}>
                                <Carousel activeIndex={index} onSelect={(e) => this.handleSelect(e)}>
                                    {this._renderItem()}
                                </Carousel>
                            </Col>
                        </Row>
                    </Container>
                    <LoadBlock ref={ref => this.loadBlockList = ref} />
                </div>
            </Fragment>
        )
    }
}
const mapStateToProps = (state) => ({
    isLogin: state.sessionState.isLogin
})
const mapDispatchToProps = (dispatch) => ({
    onSetMessageModal: (active) => dispatch({ type: MESSAGEMODAL, active }),
    onSetLoginModal: (active) => dispatch({ type: LOGINMODAL, active })
})
export default connect(mapStateToProps, mapDispatchToProps)(GamePage)