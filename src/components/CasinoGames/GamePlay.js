import React, { Component, Fragment, PureComponent } from 'react'
import { connect } from 'react-redux'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { MESSAGEMODAL, LOGINMODAL } from "../../constants/types"
import * as casinoParams from '../../constants/casinoParams'
import CasinoService from '../../services/em/casino';
import CasinoNWA from "../../services/em/casinoNWA";
import CategoryMultiple from '../ItemCategory/categoryMultiple'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import { convertComma, getSymbol, getPlatform } from '../../../utils'

import isNull from 'lodash/isNull'
import isUndefined from 'lodash/isUndefined'
import isEmpty from 'lodash/isEmpty'
import filter from 'lodash/filter'
import slice from 'lodash/slice'
import values from 'lodash/values'
import includes from 'lodash/includes'
import clone from 'lodash/clone';
import GameItems from './GameItems'
import find from 'lodash/find'
const locale = require('react-redux-i18n').I18n
const config = require(`../../../config`).config
const cjson = require('compressed-json')
class TimeShow extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            timeShow: '12.00PM',
        }
    }
    componentDidMount() {
        this.setTimeShow = setInterval(() => {
            let t = this.formatAMPM(new Date)
            this.setState({
                timeShow: t
            })
        }, 1000)
    }
    formatAMPM = (date) => {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours < 10 ? '0' + hours : hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + '' + ampm;
        return strTime;
    }
    componentWillUnmount() {
        clearInterval(this.setTimeShow)
    }
    render() {
        const { timeShow } = this.state
        return (
            <span className="time-show">{timeShow}</span>
        )
    }
}
export class GamePlay extends Component {
    constructor(props) {
        super(props)
        this.state = {
            snb: 1,
            imgIcon_1: 'game-1square',
            imgIcon_2: 'game-2square',
            imgIcon_4: 'game-4square',
            imgIconSetting: '//d3vqsibqrkllwl.cloudfront.net/wp-content/uploads/2019/07/30075750/IconGame_Setting.png',
            imgIconPlay: '//d3vqsibqrkllwl.cloudfront.net/wp-content/uploads/2019/07/30075749/IconGame_Play.png',
            imgIconExpand: '//d3vqsibqrkllwl.cloudfront.net/wp-content/uploads/2019/07/30075747/IconGame_Expand.png',
            imgIconFollow: '//d3vqsibqrkllwl.cloudfront.net/wp-content/uploads/2019/07/30075750/IconGame_Star.png',
            imgIconFollow: '//d3vqsibqrkllwl.cloudfront.net/wp-content/uploads/2019/07/30075748/IconGame_Plas.png',
            isPlayGame: false,
            infoGame: {},
            urlGame1: null,
            urlGame2: null,
            urlGame3: null,
            urlGame4: null,
            backgroundImage: '',
            pageIndex: casinoParams.getGamesParams.pageIndex,
            pageSize: props.pageSize,
            games: [],
            isPlayGamePopup: false,
            filterGames: !isUndefined(props.lobbiesData.defaultCategory) && !isUndefined(props.lobbiesData.defaultCategory.slug) ? props.lobbiesData.defaultCategory : { slug: 'popular-games', id: -3 },
            lobbiesData: props.lobbiesData,
            searchText: '',
            totalPageCount: -1,
            loadMore: false,
            typePlayGame: 1,
            renderIndex: 0,
            filterGamesAction: true,
            vendorsValue: ''
        }
        this.gameList = {}
    }
    componentDidMount() {
        this.handleFilterGames(this.props.lobbiesData.defaultCategory)
        this.getGames('all');
        this.getGames('poppular');
        this.getGames('category');
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.filterGames !== this.props.filterGames) {
            this.setState({
                filterGames: nextProps.filterGames
            }, () => {
                this.handleFilterGames(nextProps.filterGames)
            })
        }
    }

    getGames = (slug, filterVendor, filterByInput) => {
        const { useragent, lang, onSetGames, page, onSetGamesAll, lobbiesData, pageHome, casinoGames, allVendors } = this.props;
        const { pageSize, searchText } = this.state;

        const dataSourceName = lobbiesData.datasourceNameCasino;
        if (slug !== 'all' && slug !== 'poppular') {
            let params = {
                expand: "games",
                platform: getPlatform(useragent),
                language: lang,
                fields: `id,games(${casinoParams.BASIC_GAMES_FIELDS})`,
                pagination: `games(offset=0,limit=${pageHome ? 50 : pageSize})`,
            }

            if (filterVendor) {
                params = {
                    ...params,
                    filter: searchText !== '' ? `games(name=${searchText},vendor(name=${filterVendor}))` : `games(vendor(name=${filterVendor}))`
                }
            }

            if (filterByInput && searchText !== '') {
                params = {
                    ...params,
                    filter: filterVendor ? `games(name=${searchText},vendor(name=${filterVendor}))` : `games(name=${searchText})`
                }
            }

            CasinoNWA.getCategoriesGames(dataSourceName, undefined, params).then((result) => {
                if (!result.error) {
                    if (casinoGames && filterVendor) {
                        for (const key in casinoGames) {
                            if (key !== `${dataSourceName}$poppular` && key !== `${dataSourceName}$popular`) {
                                const findCategory = find(result.items, { id: key })
                                if (findCategory) {
                                    const data = {
                                        result: findCategory,
                                        categoryID: findCategory.id
                                    }
                
                                    onSetGames(data);
                                } else {
                                    const data = {
                                        result: {
                                            games: {
                                                count: 0,
                                                items: [],
                                                page: null,
                                                total: 0,
                                            },
                                            id: key
                                        },
                                        categoryID: key
                                    }
                
                                    onSetGames(data);
                                }
                            }
                        }
                    } else {
                        result.items.map((value) => {
                            if (value.id !== `${dataSourceName}$poppular` && value.id !== `${dataSourceName}$popular`) {
                                const findCategory = find(lobbiesData.categories, { gameCategoriesFilterType: "filterByCategory", gameCategoriesSlug: value.id.replace(`${dataSourceName}$`, '') })

                                if (findCategory) {
                                    const data = {
                                        result: value,
                                        categoryID: value.id
                                    }
                
                                    onSetGames(data);
                                }
                            }
                        })
                    }
                }
                if (this.loadBlock) this.loadBlock.isOpen(false);
            }).catch(() => {
                if (casinoGames) {
                    for (const key in casinoGames) {
                        const data = {
                            result: {
                                games: {
                                    count: 0,
                                    items: [],
                                    page: null,
                                    total: 0,
                                },
                                id: key
                            },
                            categoryID: key
                        }
                        onSetGames(data);
                    }
                }
            });
        } else {
            if (filterVendor && slug === 'all') {
                if (allVendors && Object.keys(allVendors).length) {
                    let vendorId = undefined;

                    const findVendor = find(allVendors, (o) => o.name === filterVendor)

                    if (findVendor) {
                        vendorId = findVendor.id
                    }

                    let params = {
                        expand: "games",
                        platform: getPlatform(useragent),
                        language: lang,
                        fields: `games(${casinoParams.BASIC_GAMES_FIELDS})`,
                        pagination: `games(offset=0,limit=${pageHome ? 50 : pageSize})`,
                        datasource: dataSourceName,
                    }

                    if (filterByInput && searchText !== '') {
                        params = {
                            ...params,
                            filter: `games(name=${searchText})`
                        }
                    }

                    CasinoNWA.getGamesByVendor(vendorId, params).then((result) => {
                        if (!result.error) {
                            const data = {
                                result: result.games,
                                page
                            }

                            onSetGamesAll(data);
                        }
                        if (this.loadBlock) this.loadBlock.isOpen(false);
                    }).catch(() => {
                        const data = {
                            result: {
                                count: 0,
                                items: [],
                                page: null,
                                total: 0,
                            },
                            page
                        }

                        onSetGamesAll(data);
                    });
                }
            } else {
                let params = {
                    datasource: dataSourceName,
                    platform: getPlatform(useragent),
                    language: lang,
                    fields: `${casinoParams.BASIC_GAMES_FIELDS},groups,categories`,
                    pagination: `offset=0,limit=${pageHome ? 50 : pageSize}`,
                }

                if (slug === 'all' && filterByInput && searchText !== '') {
                    params = {
                        ...params,
                        filter: `name=${searchText}`
                    }
                }

                if (slug === 'popular-games' || slug === 'poppular') {
                    params.sortedField = 'popularity';
                    params.orderBy = 'DES';
                }

                CasinoNWA.getGamesByDatasource(params).then((result) => {
                    if (slug === 'popular-games' || slug === 'poppular') {
                        
                        if (!result.error) {
                            if (!filterByInput) {
                                const data = {
                                    result: { games: result },
                                    categoryID: `${dataSourceName}$${page == 'live-casino' ? 'popular' : slug}`
                                }
                                onSetGames(data);
                            }
                        }
                    } else {
                        const data = {
                            result,
                            page
                        }
                        onSetGamesAll(data);
                    }
                    if (this.loadBlock) this.loadBlock.isOpen(false);
                });
            }
        }
    }

    isOpen = (evt, type = 1) => {
        let params = {}
        if (evt.type === "live-casino-tables") {
            params = {
                "tableID": evt.id,
                "realMoney": evt.realMoney
            }
        } else {
            params = {
                "slug": evt.slug,
                "realMoney": evt.realMoney
            }
        }
        // console.log('params',params);
        CasinoService.getLaunchUrl(params).then((res) => {
            if (res && res.status == 0) {
                const reHttp = res.url.replace('http://', 'https://');
                evt.url = reHttp + '&casinoLobbyUrl=' + location.origin + '&cashierURL=' + location.origin + '/account/deposit';
                // evt.url = reHttp.replace("&", '&amp;')
                // evt.url = evt.url.replace("&_", '&amp;_')
                if (type === 1) {
                    this.setState({
                        isPlayGame: true,
                        urlGame1: evt,
                        backgroundImage: evt.backgroundImage,
                        isPlayGamePopup: false
                    })
                } else if (type === 2) {
                    this.setState({
                        urlGame2: evt,
                        isPlayGamePopup: false
                    })
                } else if (type === 3) {
                    this.setState({
                        urlGame3: evt,
                        isPlayGamePopup: false
                    })
                } else if (type === 4) {
                    this.setState({
                        urlGame4: evt,
                        isPlayGamePopup: false
                    })
                }
                let filterGame = clone(this.props.filterGames)

                if (filterGame.slug === 'favorites') {
                    filterGame.gameCategoriesFilterType = "filterByCategory"
                    filterGame.gameCategoriesIconActive = "https://d3vqsibqrkllwl.cloudfront.net/wp-content/uploads/2019/07/25082357/Casino_Inactive_PopularGames.png"
                    filterGame.gameCategoriesIconInactive = "https://d3vqsibqrkllwl.cloudfront.net/wp-content/uploads/2019/07/29102706/Grey-Casino_Inactive_PopularGames.png"
                    filterGame.gameCategoriesSlug = 'popular'
                    filterGame.id = -3,
                        filterGame.labelTitle = locale.t('popularGames')
                    filterGame.slug = "popular-games"

                    this.handleFilterGames(filterGame)
                } else {
                    this.handleFilterGames(this.props.filterGames)
                }
            } else {
                const set = { messageTitle: locale.t('error'), messageDesc: res.statusText, messageType: 'error' }
                this.props.onSetMessageModal(set)
            }
        }).catch((err) => {
            //const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }
            //this.props.onSetMessageModal(set)
        })
    }
    isClose = () => {
        this.setState({
            isPlayGame: false
        })
    }
    renderFrame = (e) => {
        if (e === 1) {
            this.setState({
                snb: e,
                urlGame2: null,
                urlGame3: null,
                urlGame4: null,
            })
        } else if (e === 2) {
            this.setState({
                snb: e,
                urlGame3: null,
                urlGame4: null,
            })
        } else if (e === 4) {
            this.setState({
                snb: e,
                urlGame3: null,
                urlGame4: null,
            })
        }
    }
    fullscreen = (evt) => {
        document.getElementById(`gameframe${evt}`).requestFullscreen()
    }
    activeGames = (data) => {
        const newData = values(data)
        if (newData !== this.gameList) {
            this.gameList = newData;
            this.renderGames(casinoParams.getGamesParams.pageIndex, this.state.lobbiesData.pageSize);
        }
    }

    handleChangeVender = (value) => {
        let { searchText } = this.state
        let show = true
        const vendor = (value !== 'all') ? value : '';
        if (vendor !== '' || searchText !== '') {
            show = false
        }

        this.setState({
            vendorsValue: vendor
        }, () => {
            this.handleSearch(searchText, vendor)
        })
    }
    renderGames = (pageIndex, pageSize, searchText = '', vendors = '') => {
        const { allGames } = this.props
        let found = this.gameList;
        if (!isEmpty(searchText) || !isEmpty(vendors)) {
            if (vendors != '' && searchText == '') {
                found = filter(values(allGames), function (o) { return includes(o.vendor.toLowerCase(), vendors.toLowerCase()); });
            } else if (vendors != '' && vendors != '') {
                found = filter(values(allGames), function (o) { return includes(o.name.toLowerCase(), searchText.toLowerCase()) && includes(o.vendor.toLowerCase(), vendors.toLowerCase()); });
            } else if (searchText != '' && vendors == '') {
                found = filter(values(allGames), function (o) { return includes(o.name.toLowerCase(), searchText.toLowerCase()) || includes(o.vendor.toLowerCase(), searchText.toLowerCase()); });
            }

        }

        let totalPageCount = Math.ceil(found.length / pageSize)
        let games = slice(found, this.state.games.length, pageIndex * this.state.lobbiesData.pageSize)
        this.setState({
            pageIndex,
            pageSize,
            games: [...this.state.games, ...games],
            totalPageCount,
            loadMore: false,
        })
    }
    handleFilterGames = (filterGames) => {
        const { isLogin, favoritesList, allGames } = this.props
        const { lobbiesData } = this.state

        if (!isUndefined(filterGames)) {
            this.setState({
                filterGames,
                searchText: '',
                vendorsValue: ''
            })
        }
    }
    playGame = (game, e) => {
        const { onSetLoginModal, isLogin } = this.props
        if (isLogin) {
            game.realMoney = true
            this.isOpen(game, this.state.typePlayGame)
        } else {
            onSetLoginModal(true)
        }
        e.preventDefault();
    }
    playGameFun = (game, e) => {
        game.realMoney = false;
        this.isOpen(game, this.state.typePlayGame);
        e.preventDefault();
    }
    favorites = (fav, games) => {
        const { removeFavorites, addFavorites } = this.props
        const { renderIndex } = this.state
        if (fav) {
            removeFavorites(games)
            this.setState({
                renderIndex: (renderIndex + 1)
            })
        } else {
            addFavorites(games)
            this.setState({
                renderIndex: (renderIndex + 1)
            })
        }
    }
    _renderItem = (games) => {
        const { favoritesList, popularGames, lobbiesData, isMobile, gamesJackpots, currency, removeFavorites, addFavorites, isLogin } = this.props
        const { filterGames } = this.state
        let listItem = []
        if (!isUndefined(games) && !isNull(games) && games.total > 0) {

            listItem = <GameItems
                key={`gamePlayItems${lobbiesData.slug}`}
                {...this.props}
                games={games.items}
                popularGames={popularGames}
                favoritesList={favoritesList}
                addFavorites={addFavorites}
                removeFavorites={removeFavorites}
                playGame={this.playGame}
                playGameFun={this.playGameFun}
                lobbiesData={lobbiesData}
                isLogin={isLogin}
                newsGames={null}
                lastPlayedGames={null}
                currency={currency}
                isMobile={isMobile}
                gamesJackpots={gamesJackpots}
                slugActive={null}
                displaySlide={false}
                sectionType={null}
            />

            return listItem;
        }

        return null;
    }
    handleClose = () => {
        this.setState({
            isPlayGamePopup: false,
            searchText: '',
            vendorsValue: ''
        })
    }
    showListGame = (type) => {
        this.setState({
            isPlayGamePopup: true,
            typePlayGame: type,
            searchText: '',
            vendorsValue: ''
        })
    }

    showMore = () => {
        const {
            casinoGames,
            casinoAllGames,
            lobbiesData,
            onSetGames,
            onSetGamesPending,
            onSetGamesAll,
            onSetGamesAllPending,
            casinoPendingAll,
            casinoPending,
            page,
        } = this.props;
        const datasourceNameCasino = lobbiesData.datasourceNameCasino;
        const { filterGames: { slug }, searchText, vendorsValue } = this.state;

        if (slug !== 'all') {
            let gameCasino = casinoGames[`${datasourceNameCasino}$${slug}`].data
			const { next } = gameCasino.pages;

            if (next !== null && !casinoPending) {
                onSetGamesPending({ categoryID: `${datasourceNameCasino}$${slug}` })
                let nextUrl = '';
                if (next.includes(`groups/${datasourceNameCasino}/${datasourceNameCasino}$${slug}`)) {
                    nextUrl = next
                } else {
                    nextUrl = next.replace(`groups/${datasourceNameCasino}`, `groups/${datasourceNameCasino}/${datasourceNameCasino}$${slug}`)
                }

                CasinoNWA.getAPIByURL(nextUrl).then((result) => {
                    if (result.data) {
                        if (slug === 'popular' || slug === 'poppular') {
                            let { items, pages } = result.data;
                            if(gameCasino.items.length + items.length >= 100){ 
                                const limit = items.length - ((gameCasino.items.length + items.length) - 100)
                                items = items.slice(0, limit)
                                pages.next = null
                            }
                            gameCasino.items = [...gameCasino.items, ...items];
                            gameCasino.pages = pages;
                        } else {
                            const { items, pages } = result.data.games;
                            gameCasino.items = [...gameCasino.items, ...items];
                            gameCasino.pages = pages;
                        }
                    }
                    const data = {
                        result: { games: gameCasino },
                        categoryID: `${datasourceNameCasino}$${slug}`
                    }

                    this.setState({
                        loadMore: true,
                        showAll: false
                    }, () => {
                        onSetGames(data);
                    })
                });
            }
        } else {
            const gameAll = casinoAllGames[page].data
			let next = gameAll.pages.next;

            const isCustomPage = false
            // const isCustomPage = !!(page === 'virtual-sports' || page === 'lottery') || (vendorsValue !== '' && slug === 'all');
            // if (isCustomPage && game.data && game.data.pages) {
            //     next = game.data.pages.next
            // }

            if (next !== null && !casinoPendingAll) {
                onSetGamesAllPending({ page: page })
                CasinoNWA.getAPIByURL(next).then((result) => {
                    if (result) {
                        const { items, pages } = result.data;
                        if (isCustomPage) {
                            if (result.data.games) {
                                gameAll.data.items = [...gameAll.data.items, ...result.data.games.items];
                                gameAll.data.pages = result.data.games.pages;
                            }
                        } else {
                            gameAll.items = [...gameAll.items, ...items];
                            gameAll.pages = pages;
                        }
                    }

                    const data = {
                        result: isCustomPage ? gameAll : gameAll,
                        page: page
                    }
                    this.setState({
                        loadMore: true,
                        showAll: false
                    }, () => {
                        onSetGamesAll(data);
                    })
                });
            }
        }
    }

    getGamesBySearch = (searchByInput) => {
        const { lobbiesData } = this.props;
        const { vendorsValue } = this.state;

        this.getGames('all', vendorsValue, searchByInput);
        this.getGames('poppular', vendorsValue, searchByInput);
        this.getGames('category', vendorsValue, searchByInput);
    }

    handleSearch = (searchText, vendors) => {
        this.setState({
            searchText
        }, () => {
            this.getGamesBySearch(searchText && searchText !== '' ? true : false);
        })
    }

    render() {
        const { favoritesList, removeFavorites, addFavorites, lobbiesData, isMobile, isLogin, casinoGames, casinoGamesSearch, page, casinoAllGames } = this.props
        const { filterGames, snb, imgIcon_1, imgIcon_2, imgIcon_4, backgroundImage, isPlayGame, urlGame1, urlGame2, urlGame3, urlGame4, isPlayGamePopup, loadMore, vendorsValue, searchText } = this.state

        let img_1_Active = imgIcon_2
        let img_2_Active = imgIcon_4
        let btn_1_Active = 2
        let btn_2_Active = 4
        let isFav1 = !isNull(favoritesList) && !isNull(urlGame1) && !isUndefined(favoritesList.games) && !isUndefined(favoritesList.games[urlGame1.slug]) ? true : false
        let isFav2 = !isNull(favoritesList) && !isNull(urlGame2) && !isUndefined(favoritesList.games) && !isUndefined(favoritesList.games[urlGame2.slug]) ? true : false
        let isFav3 = !isNull(favoritesList) && !isNull(urlGame3) && !isUndefined(favoritesList.games) && !isUndefined(favoritesList.games[urlGame3.slug]) ? true : false
        let isFav4 = !isNull(favoritesList) && !isNull(urlGame4) && !isUndefined(favoritesList.games) && !isUndefined(favoritesList.games[urlGame4.slug]) ? true : false
        let styleBackground = !isEmpty(backgroundImage) ? { backgroundImage: `url(${backgroundImage})` } : { backgroundColor: '#000' }
        const isRecommended = !isUndefined(lobbiesData.lobbeiesType) && lobbiesData.lobbeiesType === 'recommended' ? true : false
        switch (snb) {
            case 2:
                btn_1_Active = 1
                btn_2_Active = 4
                img_1_Active = imgIcon_1
                img_2_Active = imgIcon_4
                break;
            case 4:
                btn_1_Active = 1
                btn_2_Active = 2
                img_1_Active = imgIcon_1
                img_2_Active = imgIcon_2
                break;
        }

        let games = null;
        if (filterGames !== '') {
            if (filterGames.slug !== 'all') {
                if (filterGames.slug === "favorites") {
                    games = isLogin && favoritesList !== null ? values(favoritesList.games) : null;
                } else {
                    const keyCategory = `${lobbiesData.datasourceNameCasino}$${filterGames.slug}`;
                    games = !isUndefined(casinoGames[keyCategory]) ? casinoGames[keyCategory].data : null;
                }
            } else {
                games = !isUndefined(casinoAllGames[page]) ? casinoAllGames[page].data : null;
            }
        }

        return (
            <Fragment>
                <Modal show={isPlayGame} onHide={() => { }} style={styleBackground} className="game-play">
                    <div className="game-play-head">
                        <div className="w-100 align-self-center text-center">
                            <TimeShow />
                        </div>
                        <a className="close" onClick={() => this.isClose()}>
                            <i className="jb-icon registerpage-x" aria-hidden="true"></i>
                        </a>
                    </div>
                    <div className="game-ratio"  >
                        <div className={`frame snb-${snb}`}>
                            <div className="frame-1">
                                <div className="game-left">
                                    {isLogin ?
                                        <a className="bottom-frame" onClick={() => isFav1 ? removeFavorites(urlGame1) : addFavorites(urlGame1)}>
                                            <span className={`jb-icon game-star ${isFav1 ? 'active' : ''}`}></span>
                                        </a>
                                        : null
                                    }
                                    <a className="bottom-frame" onClick={() => this.fullscreen(1)}>
                                        <span className="jb-icon  game-expand"></span>
                                    </a>
                                    <a className="bottom-frame" onClick={() => this.showListGame(1)}>
                                        <span className="jb-icon  game-replace"></span>
                                    </a>
                                </div>
                                {!isNull(urlGame1) && <iframe allowFullScreen src={urlGame1.url} id={`gameframe1`} width="100%" height="100%" />}
                            </div>
                            {
                                (snb === 2 || snb === 4) &&
                                <div className="frame-2">
                                    <div className="game-right">
                                        {isLogin ?
                                            <a className="bottom-frame" onClick={() => !isNull(urlGame2) ? isFav2 ? removeFavorites(urlGame2) : addFavorites(urlGame2) : {}}>
                                                <span className={`jb-icon game-star ${isFav2 ? 'active' : ''}`}></span>
                                            </a>
                                            : null
                                        }
                                        <a className="bottom-frame" onClick={() => this.fullscreen(2)}>
                                            <span className="jb-icon game-expand"></span>
                                        </a>
                                        <a className="bottom-frame" onClick={() => this.showListGame(2)}>
                                            <span className="jb-icon game-replace"></span>
                                        </a>
                                    </div>
                                    {
                                        isNull(urlGame2) ?
                                            <div className="add-game-play">
                                                <a className="bottom-frame" onClick={() => this.showListGame(2)}>
                                                    <span className="jb-icon game-plus-2"></span>
                                                </a>
                                                <p className="text-uppercase">{locale.t('addGameText')}</p>
                                            </div>
                                            :
                                            <iframe src={urlGame2.url} id={`gameframe2`} width="100%" height="100%" />
                                    }
                                </div>
                            }
                            {
                                snb === 4 &&
                                <div className="frame-3">
                                    <div className="game-left">
                                        {isLogin ?
                                            <a className="bottom-frame" onClick={() => !isNull(urlGame3) ? isFav3 ? removeFavorites(urlGame3) : addFavorites(urlGame3) : {}}>
                                                <span className={`jb-icon game-star ${isFav3 ? 'active' : ''}`}></span>
                                            </a>
                                            : null
                                        }
                                        <a className="bottom-frame" onClick={() => this.fullscreen(3)}>
                                            <span className="jb-icon  game-expand"></span>
                                        </a>
                                        <a className="bottom-frame" onClick={() => this.showListGame(3)}>
                                            <span className="jb-icon  game-replace"></span>
                                        </a>
                                    </div>
                                    {
                                        isNull(urlGame3) ?
                                            <div className="add-game-play">
                                                <a className="bottom-frame" onClick={() => this.showListGame(3)}>
                                                    <span className="jb-icon game-plus-2"></span>
                                                </a>
                                                <p className="text-uppercase">{locale.t('addGameText')}</p>
                                            </div>
                                            :
                                            <iframe src={urlGame3.url} id={`gameframe3`} width="100%" height="100%" />
                                    }
                                </div>
                            }
                            {
                                snb === 4 &&
                                <div className="frame-4">
                                    <div className="game-right">
                                        {isLogin ?
                                            <a className="bottom-frame" onClick={() => !isNull(urlGame4) ? isFav4 ? removeFavorites(urlGame4) : addFavorites(urlGame4) : {}}>
                                                <span className={`jb-icon game-star ${isFav4 ? 'active' : ''}`}></span>
                                            </a>
                                            : null
                                        }
                                        <a className="bottom-frame" onClick={() => this.fullscreen(4)}>
                                            <span className="jb-icon  game-expand"></span>
                                        </a>
                                        <a className="bottom-frame" onClick={() => this.showListGame(4)}>
                                            <span className="jb-icon game-replace"></span>
                                        </a>
                                    </div>
                                    {
                                        isNull(urlGame4) ?
                                            <div className="add-game-play">
                                                <a className="bottom-frame" onClick={() => this.showListGame(4)}>
                                                    <span className="jb-icon game-plus-2"></span>
                                                </a>
                                                <p className="text-uppercase">{locale.t('addGameText')}</p>
                                            </div>
                                            :
                                            <iframe src={urlGame4.url} id={`gameframe4`} width="100%" height="100%" />
                                    }
                                </div>
                            }

                        </div>
                    </div>
                    <div className="game-bottom">
                        <a className="bottom-frame" onClick={() => this.renderFrame(btn_1_Active)}>
                            <span className={`jb-icon ${img_1_Active}`}></span>
                        </a>
                        <a className="bottom-frame" onClick={() => this.renderFrame(btn_2_Active)}>
                            <span className={`jb-icon ${img_2_Active}`}></span>
                        </a>
                    </div>
                </Modal>
                <Modal show={isPlayGamePopup} onHide={() => this.handleClose()} style={{ backgroundColor: 'rgba(0,0,0,0.8)' }} className="game-play list-show">
                    <div className="position-relative">
                        <div className="header-list-show">
                            <p>{locale.t('chooseGame')}</p>
                            <i className="jb-icon  registerpage-x" onClick={() => this.handleClose()} />
                        </div>
                        {!isRecommended && <section className="category-games">
                            <CategoryMultiple
                                {...this.state}
                                page={page}
                                isLogin={false}
                                pageActive='playList'
                                lobbiesData={lobbiesData}
                                isMobile={isMobile}
                                isPlayGamePopup={isPlayGamePopup}
                                handleFilterGames={this.handleFilterGames}
                                handleSearch={this.handleSearch}
                                handleChangeVender={this.handleChangeVender}
                                vendorsValue={vendorsValue}
                                isModal={true}
                            />
                        </section>}
                        <section className="casino-games">
                            <Container className="container-custom">
                                <Row>
                                    <div className="games">
                                        <div className="games-list container container-custom">
                                            {!isUndefined(games) && games !== null ? this._renderItem(games) : null}
                                        </div>
                                        {
                                            !isUndefined(games) && games !== null && !isUndefined(games.pages) && games.pages.next !== null ?
                                                <Col className="button-end">
                                                    <a className="button buttonLoadmore" onClick={() => this.showMore()}>
                                                        <span>
                                                            {locale.t('buttomShowMore')}
                                                            {loadMore ? <div className="loading" /> : null}
                                                        </span>
                                                    </a>
                                                </Col> : null
                                        }
                                    </div>
                                </Row>
                            </Container>
                        </section>
                    </div>
                </Modal>
            </Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    const {
        sessionState: { isLogin, userInfo },
        casino: {
            casinoGamesSearch,
            allGamesModal,
            casinoGamesModal,
            allVendors,
        }
    } = state;

    return {
        isLogin,
        userInfo,
        casinoAllGames: allGamesModal,
        casinoGames: casinoGamesModal,
        casinoGamesSearch,
        allVendors
    };
}

const mapDispatchToProps = (dispatch) => ({
    onSetMessageModal: (active) => dispatch({ type: MESSAGEMODAL, active }),
    onSetLoginModal: (active) => dispatch({ type: LOGINMODAL, active }),
    onSetGames: (active) => dispatch({ type: casinoParams.SET_CASINOGAMES_MODAL, active }),
    onSetGamesPending: (active) => dispatch({ type: casinoParams.SET_CASINOGAMES_MODAL_PENDING, active }),
    onSetGamesAll: (active) => dispatch({ type: casinoParams.SET_CASINOGAMESALL_MODAL, active }),
    onSetGamesAllPending: (active) => dispatch({ type: casinoParams.SET_CASINOGAMESALL_MODAL_PENDING, active }),
    onSetGamesSearch: (active) => dispatch({ type: casinoParams.SET_CASINOGAME_SEARCH, active }),
    onSetGamesSearchPending: (active) => dispatch({ type: casinoParams.SET_CASINOGAME_SEARCH_PENDING, active }),
})
export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(GamePlay)