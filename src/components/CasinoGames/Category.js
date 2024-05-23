import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { convertComma, getSymbol } from '../../../utils'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import dynamic from 'next/dynamic'
import * as casinoParams from '../../constants/casinoParams'
import CasinoNWA from "../../services/em/casinoNWA";
import * as routes from '../../constants/routes'
import Col from 'react-bootstrap/Col'
import { Carousel } from 'react-responsive-carousel';
import isUndefined from 'lodash/isUndefined'
import filter from 'lodash/filter'
import isEmpty from 'lodash/isEmpty'
import includes from 'lodash/includes'
import slice from 'lodash/slice'
import values from 'lodash/values'
import isNull from 'lodash/isNull'
import head from 'lodash/head'
import find from 'lodash/find';
import GameItems from './GameItems';
import GameSlider from '../CarouselSlider/GameSlider'
import {
    DEFAULT_LIMIT_GAMESLIDE,
    DEFAULT_LIMIT_CASINOHOMEPAGE,
    LIVECASINOHOMEGAMES,
    sortGames,
} from '../../../utils/CONSTANTS';
import { getQueryString, getPlatform } from '../../../utils';
const cjson = require('compressed-json')
const locale = require('react-redux-i18n').I18n
const config = require(`../../../config`).config
dynamic(import('../../../styles/components/_casinoGames.scss'))

let desktopShow = 4
let mobileShow = 2
const EXCEPT_INGROUP = ['casino-new-games', 'webapi-bonusbuy', 'webapi-mini', 'webapi-casino-live'];

export class Category extends Component {
    constructor(props) {
        super(props)
        this.state = {
            games: [],
            pageIndex: casinoParams.getGamesParams.pageIndex,
            totalPageCount: -1,
            loadMore: false,
            searchText: '',
            vendors: getQueryString('vendor') || '',
            fomatDevice: 'pc',
            showAll: true,
        }
        this.gameList = {}
        this.allGames = {}
        this.handleScroll = this.handleScroll.bind(this);
    }
    async componentDidMount() {
        window.addEventListener("resize", this.resize.bind(this));
        this.resize();
        const { game, allGames, pageSize, lobbiesData, filterGames } = this.props;
        if (lobbiesData.theme === 1 || lobbiesData.theme === 4) {
            this.gameList = values(allGames);
        } else {
            if (filterGames.id === -2) {
                this.gameList = values(allGames);
            } else {
                this.gameList = values(game);
            }
        }
        this.allGames = allGames
        this.renderGames(casinoParams.getGamesParams.pageIndex, pageSize);
        window.addEventListener('scroll', this.handleScroll);
    }

    resize() {
        const { useragent } = this.props;
        const { fomatDevice } = this.state;
        
        //const platform = getPlatform(useragent);
        const currentViewportScale = 1;//(platform === 'PC')?1:0.75;

        let innerWidth = window.innerWidth;
        if (innerWidth >= 1000 / currentViewportScale && fomatDevice !== "pc") {
            this.setState({ fomatDevice: "pc" });
        } else if (innerWidth >= 768 / currentViewportScale && innerWidth < 1000 / currentViewportScale && fomatDevice !== "ipad") {
            this.setState({ fomatDevice: "ipad" });
        } else if (innerWidth >= 564 / currentViewportScale && innerWidth < 768 / currentViewportScale && fomatDevice !== "mobileLandscap") {
            this.setState({ fomatDevice: "mobileLandscap" });
        } else if (innerWidth < 564 / currentViewportScale && fomatDevice !== "mobile") {
            this.setState({ fomatDevice: "mobile" });
        }
    }

    handleScroll() {
        const { isMobile, game } = this.props;
		if (!isUndefined(game) && !isNull(game) && !isUndefined(game.data) && !isNull(game.data) && !isUndefined(game.data.pages)) {
			const number = isMobile ? 500 : 300;
			const { next } = game.data.pages;

			if ((window.innerHeight + document.documentElement.scrollTop) <= (document.documentElement.offsetHeight - number)) {
				return;
			}
			if (next !== null && !this.state.showAll) {
				this.showMoreList()
			}
		}
    }

    showAllList = () => {
        const { pageIndex, pageSize, searchText, vendors, totalPageCount } = this.state
        let setPageIndex = parseInt(pageIndex) + 1
        // let setPageIndex = totalPageCount
        this.setState({
            loadMore: true
        }, () => {
            this.renderGames(setPageIndex, pageSize, searchText, vendors)
        })
    }

    showMoreList = () => {
		const {
			casinoGames,
			casinoGameAll,
			filterGames,
			lobbiesData: { datasourceNameCasino },
			onSetGames,
			onSetGamesPending,
			onSetGamesAll,
			onSetGamesAllPending,
			casinoPending,
			casinoPendingAll,
			page,
            game,
            vendorsValue,
		} = this.props;
		const slug = !isUndefined(filterGames.gameCategoriesSlug)?filterGames.gameCategoriesSlug:filterGames.slug;
        
        if (slug !== 'all') {
            const { next } = casinoGames.pages;
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
                            if(casinoGames.items.length + items.length >= 100){ 
                                const limit = items.length - ((casinoGames.items.length + items.length) - 100)
                                items = items.slice(0, limit)
                                pages.next = null
                            }
                            casinoGames.items = [...casinoGames.items, ...items];
                            casinoGames.pages = pages;
                        } else {
                            const { items, pages } = result.data.games;
                            casinoGames.items = [...casinoGames.items, ...items];
                            casinoGames.pages = pages;
                        }
                    }
                    const data = {
                        result: { games: casinoGames },
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
            let next = casinoGameAll.pages.next;

            const isCustomPage = !!(page === 'virtual-sports' || page === 'lottery') || (vendorsValue !== '' && slug === 'all');
            if (isCustomPage && game.data && game.data.pages) {
                next = game.data.pages.next
            }

            if (next !== null && !casinoPendingAll) {
                onSetGamesAllPending({ page: page })
                CasinoNWA.getAPIByURL(next).then((result) => {
                    if (result) {
                        const { items, pages } = result.data;
                        if (isCustomPage) {
                            if (result.data.games) {
                                game.data.items = [...game.data.items, ...result.data.games.items];
                                game.data.pages = result.data.games.pages;
                            }
                        } else {
                            casinoGameAll.items = [...casinoGameAll.items, ...items];
                            casinoGameAll.pages = pages;
                        }
                    }

                    const data = {
                        result: isCustomPage ? game.data : casinoGameAll,
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

    UNSAFE_componentWillReceiveProps(newProps) {
        if (newProps.numIndex !== this.props.numIndex) {
            const { searchText, vendors } = this.state;
            if (this.props.lobbiesData.theme === 1 || this.props.lobbiesData.theme === 4) {
                this.gameList = values(newProps.allGames);
            } else {
                if (newProps.filterGames.id === -2) {
                    this.gameList = values(newProps.allGames);
                } else {
                    this.gameList = values(newProps.game);
                }
            }
            this.state.games = []
            this.renderGames(this.state.pageIndex, newProps.pageSize, searchText, vendors);
        }

        if ((newProps.searchText !== this.props.searchText) || (newProps.vendorsValue !== this.props.vendorsValue)) {
            this.setState({
                showAll: true
            })
        }

        this.allGames = newProps.allGames
    }
    renderGames = async (pageIndex, pageSize, searchText = '', vendors = '') => {
        const { pageHome, lobbiesData, sectionType, filterGames, disPlayAllCategories } = this.props;

        let found = this.gameList;
        if (!isEmpty(searchText) || !isEmpty(vendors)) {
            let itemGame = this.allGames
            // if (filterGamesAction && filterGames.slug !== 'all') {
            //     let getGameByCat = await localStorage.getItem(`${lobbiesData.datasourceNameCasino}-${filterGames.slug}`);
            //     if (!isNull(getGameByCat)) {
            //         let responseJson = cjson.decompress.fromString(getGameByCat);
            //         itemGame = responseJson.games
            //     } else {
            //         itemGame = []
            //     }
            // }
            if (vendors !== '' && searchText === '') {
                found = filter(values(itemGame), function (o) { return includes(o.vendor.replace(/\s/g, '').toLowerCase(), vendors.replace(/\s/g, '').toLowerCase()); });
            } else if (searchText !== '' && vendors !== '') {
                found = filter(values(itemGame), function (o) { return includes(o.name.replace(/\s/g, '').toLowerCase(), searchText.replace(/\s/g, '').toLowerCase()) && includes(o.vendor.replace(/\s/g, '').toLowerCase(), vendors.replace(/\s/g, '').toLowerCase()); });
            } else if (searchText !== '' && vendors === '') {
                found = filter(values(itemGame), function (o) { return includes(o.name.replace(/\s/g, '').toLowerCase(), searchText.replace(/\s/g, '').toLowerCase()) || includes(o.vendor.replace(/\s/g, '').toLowerCase(), searchText.replace(/\s/g, '').toLowerCase()); });
            }
        }

        const keyCategory = `${window.location.pathname}-${filterGames.slug}`;
        const order = sortGames(keyCategory);
        if (order !== null) {
            const dataGames = found.sort((a, b) => {
                const indexA = lobbiesData.casinoType === "live_casino_tables" ? order.indexOf(a.tableID) : order.indexOf(a.slug);
                const indexB = lobbiesData.casinoType === "live_casino_tables" ? order.indexOf(b.tableID) : order.indexOf(b.slug);

                if (indexA === -1 && indexB === -1) {
                    return 0;
                } else if (indexA === -1) {
                    return 1;
                } else if (indexB === -1) {
                    return -1;
                } else {
                    return indexA - indexB;
                }
            });
            found = dataGames;
        }

        let totalPageCount = Math.ceil(found.length / pageSize)
        let limitGame = lobbiesData.casinoType === "live_casino_tables" ? DEFAULT_LIMIT_CASINOHOMEPAGE.liveCasino : DEFAULT_LIMIT_CASINOHOMEPAGE.casino;
        if (sectionType === 'sports') { limitGame = DEFAULT_LIMIT_CASINOHOMEPAGE.sports }
        let games = (pageHome) ? found.slice(0, limitGame) : slice(found, this.state.games.length, pageIndex * pageSize)

        this.setState({
            pageIndex,
            pageSize,
            games: [...this.state.games, ...games],
            totalPageCount,
            loadMore: false,
            searchText,
            vendors
        })
    }
    showMore = () => {
        const { pageIndex, pageSize, searchText, vendors } = this.state
        let setPageIndex = parseInt(pageIndex) + 1
        this.setState({
            loadMore: true
        }, () => {
            this.renderGames(setPageIndex, pageSize, searchText, vendors)
        })
    }
    handleSearch = (searchText, vendors) => {
        const { pageIndex, pageSize } = this.state
        this.state.games = []
        this.renderGames(casinoParams.getGamesParams.pageIndex, pageSize || this.props.pageSize, searchText, vendors)
    }
    _renderItem = () => {
        const {
            popularGames,
            favoritesList,
            addFavorites,
            removeFavorites,
            playGame,
            playGameFun,
            lobbiesData,
            isLogin,
            newsGames,
            lastPlayedGames,
            currency,
            isMobile,
            gamesJackpots,
            slugActive,
            sectionType,
            game,
            casinoGamesSearch,
            searchText,
            vendorsValue,
        } = this.props
        const { games } = this.state
        let listItem = []
        let listGames = null;

        if (slugActive === 'favorites' && !isNull(favoritesList)){
			listGames = !isUndefined(favoritesList) && !isUndefined(favoritesList.games) && isLogin ? values(favoritesList.games) : [];
		}else if (slugActive === 'lastplayed'){
			listGames = isLogin && !isUndefined(lastPlayedGames) ? lastPlayedGames.items : [];
        }else {
            listGames = game && Object.keys(game).length ? game.data.items : [];

            if ((searchText !== "" || vendorsValue !== "") && casinoGamesSearch) {
                listGames = !isUndefined(casinoGamesSearch) && !isUndefined(casinoGamesSearch.items) ? casinoGamesSearch.items : null;
            }
        }

        // let listGames = values(this.allGames)
        let renderListGamesLogin = false

        if (!isUndefined(listGames) && !isNull(listGames) && listGames.length > 0) {
            listItem = <GameItems
                key={`gameItems${lobbiesData.slug}`}
                {...this.props}
                games={(sectionType !== 'jackpot') ? listGames : listGames.slice(0, 8)}
                popularGames={popularGames}
                favoritesList={favoritesList}
                addFavorites={addFavorites}
                removeFavorites={removeFavorites}
                playGame={playGame}
                playGameFun={playGameFun}
                lobbiesData={lobbiesData}
                isLogin={isLogin}
                newsGames={newsGames}
                lastPlayedGames={lastPlayedGames}
                currency={currency}
                isMobile={isMobile}
                gamesJackpots={gamesJackpots}
                slugActive={slugActive}
                displaySlide={false}
                sectionType={sectionType}
            />
        }
        if (listItem.length === 0) {
            return (
                <div className="p-3 w-100"><p className="text-center">{locale.t('noGame')}</p></div>
            )
        }
        return listItem

    }

    _renderItemSlider = () => {
        const {
            popularGames,
            favoritesList,
            addFavorites,
            removeFavorites,
            playGame,
            playGameFun,
            lobbiesData,
            isLogin,
            newsGames,
            lastPlayedGames,
            currency,
            isMobile,
            gamesJackpots,
            slugActive,
            sectionType = null,
            urlLink = null,
            pageHome,
            disPlayAllCategories,
            handleFilterGames,
            filterGames,
            typeSlide,
            useragent,
            game
        } = this.props

        const { fomatDevice } = this.state
        let listItem = []
        let games = null;

        let listGames = null;
        if (slugActive === 'favorites' && !isNull(favoritesList)){
			games = !isUndefined(favoritesList) && !isUndefined(favoritesList.games) && isLogin ? values(favoritesList.games) : [];
		}else if (slugActive === 'lastplayed'){
			games = isLogin && !isUndefined(lastPlayedGames) ? lastPlayedGames.items : [];
        }else {
            games = game && Object.keys(game).length ? game.data.items : [];
        }
        listGames = games;
        
        if (pageHome && lobbiesData.slug === "top-slot-games-home") {
            listGames = games.slice(0, DEFAULT_LIMIT_CASINOHOMEPAGE.topslot[fomatDevice]);
        }
        if (isLogin && lastPlayedGames && lastPlayedGames.length > 0 && filterGames.id === -5) {
            listGames = lastPlayedGames;
        }

        if (pageHome && lobbiesData.slug === "webapi-bonusbuy") {
            listGames = games;
        }

        if (pageHome && lobbiesData.slug === "webapi-mini") {
            listGames = games;
        }

        if (pageHome && lobbiesData.slug === "webapi-casino-live") {
            listGames = games;
        }

        if (sectionType === 'liveCasino-hardcodeGame') {
            listGames = LIVECASINOHOMEGAMES;
        }

        let limitGamesPerSlide = (lobbiesData.casinoType !== "live_casino_tables") ? DEFAULT_LIMIT_GAMESLIDE.homecasino : DEFAULT_LIMIT_GAMESLIDE.homeliveCasino;
        if (!pageHome) {
            limitGamesPerSlide = (lobbiesData.casinoType !== "live_casino_tables") ? DEFAULT_LIMIT_GAMESLIDE.casino : DEFAULT_LIMIT_GAMESLIDE.liveCasino;
        }
        if (lobbiesData.slug == 'casino-new-games' && pageHome) {
            listGames = games;
        }

        if (pageHome && typeSlide === 'vertical-1-row') {
            limitGamesPerSlide = DEFAULT_LIMIT_GAMESLIDE.homerow1;
        }

        if (sectionType === 'jackpot') {
            listGames = games.slice(0, 20);
            if (!isMobile) {
                limitGamesPerSlide = DEFAULT_LIMIT_GAMESLIDE.jackpots;
            }
        }

        if (sectionType === 'sports') { limitGamesPerSlide = DEFAULT_LIMIT_GAMESLIDE.sports }
        let slideContentCount = (listGames.length > 0) ? listGames.length / limitGamesPerSlide[fomatDevice] : 0;
        if (!isUndefined(listGames) && !isNull(listGames) && listGames.length > 0) {
            listItem = <GameItems
                key={`gameItems${lobbiesData.slug}`}
                {...this.props}
                games={listGames}
                popularGames={popularGames}
                favoritesList={favoritesList}
                addFavorites={addFavorites}
                removeFavorites={removeFavorites}
                playGame={playGame}
                playGameFun={playGameFun}
                lobbiesData={lobbiesData}
                isLogin={isLogin}
                newsGames={newsGames}
                lastPlayedGames={lastPlayedGames}
                currency={currency}
                isMobile={isMobile}
                gamesJackpots={gamesJackpots}
                slugActive={slugActive}
                slugID={lobbiesData.slug}
                displaySlide={true}
                limitGamesPerSlide={limitGamesPerSlide[fomatDevice]}
                slideContentCount={slideContentCount}
                fomatDevice={fomatDevice}
                sectionType={sectionType}
                filterGames={filterGames}
                inGroup={(disPlayAllCategories && (isUndefined(pageHome) || sectionType === "sports")) ? false : true}
                useragent={useragent}
            />
        }

        if (listItem.length === 0) {

            return null;
            return (
                <Fragment>
                    {filterGames.id !== -1 || filterGames.id !== -5 ?
                        (<div className="p-3 w-100"><p className="text-center">{locale.t('noGame')}</p></div>)
                        : null
                    }
                </Fragment>
            )
        }

        let showDot = isMobile ? false : true;
        let Title = lobbiesData.title;
        let category = null
        if (slugActive !== undefined && !pageHome) {
            const found = lobbiesData.categories.find((o) => o.slug === slugActive);
            category = found;
            Title = (found) ? found.labelTitle : lobbiesData.title;
        }
        if (sectionType === 'liveCasino-hardcodeGame') {
            Title = locale.t('top-live-casino');
            showDot = false;
        }
        if (filterGames && filterGames.slug == 'newest-games' && listItem) {
            if (listItem.props.games.length < 6) {
                return null;
            }

        }
        return <GameSlider
            id={`${pageHome ? 'homePage' : 'casino'}${filterGames ? filterGames.slug : lobbiesData.slug}`}
            children={listItem}
            lobbiesData={lobbiesData}
            limitGamesPerSlide={limitGamesPerSlide[fomatDevice]}
            slideContentCount={slideContentCount}
            className={sectionType}
            title={Title}
            isMobile={isMobile}
            showArrow={showDot}
            showButton={sectionType === 'liveCasino-hardcodeGame' ? false : true}
            urlLink={urlLink}
            dotName={`${pageHome ? 'homePage' : 'casino'}${filterGames ? filterGames.slug : lobbiesData.slug}`}
            handleFilterGames={handleFilterGames}
            pageHome={pageHome}
            category={category}
            slugID={lobbiesData.slug}
            sectionType={sectionType}
            statusGroup={(disPlayAllCategories && (isUndefined(pageHome) || sectionType === "sports") && isMobile) ? false : true}
            useragent={useragent}
        />

    }
    _renderRecommeded = () => {
        const { popularGames, isLogin, favoritesList } = this.props
        const { games } = this.state
        let listGames = games
        let renderListGamesLogin = false
        let listItem = []
        // if (!isLogin) {
        if (!isUndefined(listGames) && !isNull(listGames) && listGames.length > 0) {
            listGames.map((res, index) => {
                let fav = false
                let ppl = false
                let newGame = res.newGame
                let gameID = ''
                if (!isUndefined(res.tableID)) {
                    // isLive = true
                    // isLiveOpen = res.isOpen ? '' : 'live-off'
                    newGame = false
                    gameID = res.tableID
                } else {
                    gameID = res.slug
                }
                if (!isUndefined(favoritesList) && !isNull(favoritesList) && !isEmpty(favoritesList) && favoritesList !== 'null' && Object.keys(favoritesList).length > 0) {
                    if (!isUndefined(favoritesList.games)) {
                        fav = !isUndefined(favoritesList.games[gameID]) ? true : false
                    }
                }
                if (!isNull(popularGames) && !isEmpty(popularGames) && !isUndefined(popularGames) && popularGames !== 'null' && Object.keys(popularGames).length > 0) {
                    ppl = !isUndefined(popularGames[gameID]) ? true : false
                }

                listItem.push(this._layoutRecommeded(res, index, newGame, ppl, fav, renderListGamesLogin))

            })
        }
        // }
        return listItem
    }
    checkFavoritesList = (gameID) => {
        const { favoritesList } = this.props
        let fav = false
        if (!isUndefined(favoritesList) && !isNull(favoritesList) && !isEmpty(favoritesList) && favoritesList !== 'null' && Object.keys(favoritesList).length > 0) {
            if (!isUndefined(favoritesList.games)) {
                fav = !isUndefined(favoritesList.games[gameID]) ? true : false
            }
        }
        return fav
    }
    checkPopularGames = (gameID) => {
        const { popularGames } = this.props
        let ppl = false
        if (!isNull(popularGames) && !isEmpty(popularGames) && !isUndefined(popularGames) && popularGames !== 'null' && Object.keys(popularGames).length > 0) {
            ppl = !isUndefined(popularGames[gameID]) ? true : false
        }
        return ppl
    }
    setDataRecommeded = (game, key) => {
        let gameID = ''
        if (!isUndefined(game.tableID)) {
            gameID = game.tableID
        } else {
            gameID = game.slug
        }
        const fav = this.checkFavoritesList(gameID)
        const ppl = this.checkPopularGames(gameID)
        return this._layoutRecommeded(game, key, game.newGame, ppl, fav, true)
    }
    _layoutRecommededLogin = () => {
        const { isMobile, newsGames, favoritesList, lastPlayedGames } = this.props
        const games = this.gameList
        let listGames = []
        let listItem = []
        let indexRec = 0
        let showContent = desktopShow
        let showCarousel = 1
        if (isMobile) {
            showContent = mobileShow
            showCarousel = 2
        }
        // recommended games #################################
        if (!isUndefined(games) && !isNull(games) && Object.keys(games).length) {
            let lastPlay = []
            const n = games.length >= 8 ? 8 : games.length
            showCarousel = Math.ceil(n / desktopShow)
            if (isMobile) {
                showCarousel = Math.ceil(n / mobileShow)
            }
            for (let i = 0; i < showCarousel; i++) {
                let loopIndex = []
                for (let i2 = 0; i2 < showContent; i2++) {
                    if (!isUndefined(games[indexRec])) {
                        loopIndex[i2] = {}
                        games[indexRec].title = locale.t('recommend')
                        loopIndex[i2].layout = this.setDataRecommeded(games[indexRec], `recommend-${indexRec}-${i2}`)
                        indexRec++
                    }
                }
                lastPlay[i] = loopIndex
            }
            listGames[0] = lastPlay
        }
        // new games #################################
        if (!isUndefined(newsGames) && !isNull(newsGames) && Object.keys(newsGames).length) {
            let dataNew = values(newsGames)
            let newsGamesData = []
            if (dataNew.length > 4) {
                const n = dataNew.length >= 8 ? 8 : dataNew.length
                let lIn = 0
                showCarousel = Math.ceil(n / desktopShow)
                if (isMobile) {
                    showCarousel = Math.ceil(n / mobileShow)
                }
                for (let i = 0; i < showCarousel; i++) {
                    let loopIndex = []
                    for (let i2 = 0; i2 < showContent; i2++) {
                        if (!isUndefined(dataNew[lIn])) {
                            loopIndex[i2] = {}
                            let game = dataNew[lIn]
                            game.title = locale.t('newGame')
                            loopIndex[i2].layout = this.setDataRecommeded(game, `newGame-${lIn}-${i2}`)
                            loopIndex[i2].title = locale.t('newGame')
                            lIn++
                        }
                    }
                    newsGamesData[i] = loopIndex
                }
            } else {
                let lIn = 0
                for (let i = 0; i < showCarousel; i++) {
                    let loopIndex = []
                    for (let i2 = 0; i2 < showContent; i2++) {
                        loopIndex[i2] = {}
                        if (lIn < dataNew.length) {
                            if (!isUndefined(dataNew[lIn])) {
                                let game = dataNew[lIn]
                                game.title = locale.t('newGame')
                                loopIndex[i2].layout = this.setDataRecommeded(game, `newGame-${lIn}-${i2}`)
                            }
                        } else {
                            if (!isUndefined(games[indexRec])) {
                                games[indexRec].title = locale.t('recommend')
                                loopIndex[i2].layout = this.setDataRecommeded(games[indexRec], `recommend-${lIn}-${i2}`)
                                indexRec++
                            }
                        }
                        lIn++
                    }
                    newsGamesData[i] = loopIndex
                }
            }
            listGames[1] = newsGamesData
        }
        if (!isUndefined(games) && !isNull(games) && Object.keys(games).length) {
            // favorite games #################################         
            if (!isUndefined(favoritesList) && !isNull(favoritesList)) {
                let favoritesListData = []
                let dataFavorites = values(favoritesList.games)
                if (dataFavorites.length > 4) {
                    let lIn = 0
                    const n = dataFavorites.length >= 8 ? 8 : dataFavorites.length
                    showCarousel = Math.ceil(n / desktopShow)
                    if (isMobile) {
                        showCarousel = Math.ceil(n / mobileShow)
                    }
                    for (let i = 0; i < showCarousel; i++) {
                        let loopIndex = []
                        for (let i2 = 0; i2 < showContent; i2++) {
                            if (!isUndefined(dataFavorites[lIn])) {
                                loopIndex[i2] = {}
                                let game = dataFavorites[lIn]
                                game.title = locale.t('favorite')
                                loopIndex[i2].layout = this.setDataRecommeded(game, `favorite-${lIn}-${i2}`)
                                lIn++
                            }
                        }
                        favoritesListData[i] = loopIndex
                    }
                } else {
                    let lIn = 0
                    for (let i = 0; i < 1; i++) {
                        let loopIndex = []
                        for (let i2 = 0; i2 < showContent; i2++) {
                            loopIndex[i2] = {}
                            if (lIn < dataFavorites.length) {
                                if (!isUndefined(dataFavorites[lIn])) {
                                    let game = dataFavorites[lIn]
                                    game.title = locale.t('favorite')
                                    loopIndex[i2].layout = this.setDataRecommeded(game, `favorite-${lIn}-${i2}`)
                                }
                            } else {
                                if (!isUndefined(games[indexRec])) {
                                    games[indexRec].title = locale.t('recommend')
                                    loopIndex[i2].layout = this.setDataRecommeded(games[indexRec], `recommend-${lIn}-${i2}`)
                                    indexRec++
                                }
                            }
                            lIn++
                        }
                        favoritesListData[i] = loopIndex
                    }
                }
                listGames[2] = favoritesListData
            }
            
            // last games #################################
            if (!isUndefined(lastPlayedGames) && !isNull(lastPlayedGames) && Object.keys(lastPlayedGames).length) {
                let lastPlayedGamesData = []
                if (lastPlayedGames.length > 0) {
                    if (lastPlayedGames.length > 4) {
                        let lIn = 0
                        const n = lastPlayedGames.length >= 8 ? 8 : lastPlayedGames.length
                        showCarousel = Math.ceil(n / desktopShow)
                        if (isMobile) {
                            showCarousel = Math.ceil(n / mobileShow)
                        }
                        for (let i = 0; i < showCarousel; i++) {
                            let loopIndex = []
                            for (let i2 = 0; i2 < showContent; i2++) {
                                if (!isUndefined(lastPlayedGames[lIn])) {
                                    loopIndex[i2] = {}
                                    let game = lastPlayedGames[lIn].game
                                    game.title = locale.t('latestGame')
                                    loopIndex[i2].layout = this.setDataRecommeded(game, `last-${lIn}-${i2}`)
                                    lIn++
                                }
                            }
                            lastPlayedGamesData[i] = loopIndex
                        }
                    } else {
                        let lIn = 0
                        for (let i = 0; i < 1; i++) {
                            let loopIndex = []
                            for (let i2 = 0; i2 < showContent; i2++) {
                                loopIndex[i2] = {}
                                if (lIn < lastPlayedGames.length) {
                                    if (!isUndefined(lastPlayedGames[lIn])) {
                                        let game = lastPlayedGames[lIn].game
                                        game.title = locale.t('latestGame')
                                        loopIndex[i2].layout = this.setDataRecommeded(game, `last-${lIn}-${i2}`)
                                        loopIndex[i2].title = locale.t('latestGame')
                                    }
                                } else {
                                    if (!isUndefined(games[indexRec])) {
                                        games[indexRec].title = locale.t('recommend')
                                        loopIndex[i2].layout = this.setDataRecommeded(games[indexRec], `recommend-${lIn}-${i2}`)
                                        indexRec++
                                    }
                                }
                                lIn++
                            }
                            lastPlayedGamesData[i] = loopIndex
                        }
                    }
                    listGames[3] = lastPlayedGamesData
                }
            }
        }
        for (let i = 0; i < 4; i++) {
            let layout1 = []
            if (!isUndefined(listGames[i])) {
                listGames[i].map((res, index) => {
                    if (res.length) {
                        let layout2 = []
                        res.map((ress) => {
                            layout2.push(ress.layout)
                        })
                        layout1.push(
                            <div key={index}>
                                <div className="group-item">
                                    <ul className="games-list container mb-0 container-custom-games" >
                                        {layout2}
                                    </ul>
                                </div>
                            </div>
                        )
                    }
                })
            }

            listItem.push(
                <Carousel
                    showArrows={true}
                    showStatus={false}
                    showThumbs={false}
                    infiniteLoop={true}
                    autoPlay={false}
                    key={i}
                    className="layout-games-recommended"
                >
                    {layout1}
                </Carousel>
            )
        }
        return listItem
    }

    _layoutRecommeded = (res, index, newGame, ppl, fav, isGamesLogin) => {
        const { addFavorites, removeFavorites, playGame, playGameFun, currency, isLogin, isMobile } = this.props
        let showMinMax = null
        let isShowMinMax = 'my-2'
        let isAnonymousFunMode = res.anonymousFunMode
        let gameID = ''
        let link = ''
        let linkFun = ''
        let isLive = false
        let isLiveOpen = ''
        if (!isUndefined(res.tableID)) {
            isLive = true
            isLiveOpen = res.isOpen ? '' : 'live-off'
            newGame = false
            gameID = res.tableID
            link = `${routes.liveCasinoGamePlay}${gameID}`;
            linkFun = `${routes.liveCasinoGameFun}${gameID}`;
        } else {
            gameID = res.slug
            link = `${routes.casinoGamePlay}${gameID}`;
            linkFun = `${routes.casinoGameFun}${gameID}`;
        }
        if (!isUndefined(res.tableID) && !isUndefined(res.limit)) {
            let min = 0
            let max = 0
            if (!isUndefined(res.limit[currency])) {
                min = !isUndefined(res.limit[currency].min) ? res.limit[currency].min : 0
                max = !isUndefined(res.limit[currency].max) ? res.limit[currency].max : 0
                // isShowMinMax = 'm-0'
                showMinMax = <p className="text-center font-weight-normal">{`${getSymbol(currency)}${convertComma(min)} - ${getSymbol(currency)}${convertComma(max)}`}</p>
            } else {
                if (!isUndefined(res.limit[config.currency])) {
                    min = !isUndefined(res.limit[config.currency].min) ? res.limit[config.currency].min : 0
                    max = !isUndefined(res.limit[config.currency].max) ? res.limit[config.currency].max : 0
                    // isShowMinMax = 'm-0'
                    showMinMax = <p className="text-center font-weight-normal">{`${getSymbol(config.currency)}${convertComma(min)} - ${getSymbol(config.currency)}${convertComma(max)}`}</p>
                }
            }
        }
        if (res.anonymousFunMode === false) {
            if (isLogin) {
                isAnonymousFunMode = true
            }
        }
        // const cssIsMobile = isMobile ? 'mobile' : 'pc'
        const cssIsMobile = 'mobile'
        return (
            <li className={`games-list-item recommeded`} key={index}>
                {isGamesLogin && <h5 className="title-game text-uppercase text-left">{res.title}</h5>}
                <div className={`game-item ${isLiveOpen}`}>
                    <div className="text-row-block-recommeded">
                        {!isLive && newGame && <LazyLoadImage
                            className="d-block img-recommeded"
                            src={'/static/images/icon-new.png'}
                            alt={res.name}
                            effect="blur"
                            visibleByDefault={false}
                        />}
                        {!isLive && ppl && <LazyLoadImage
                            className="d-block img-recommeded"
                            src={'/static/images/icon-hot.png'}
                            alt={res.name}
                            effect="blur"
                            visibleByDefault={false}
                        />}
                    </div>
                    <a title={res.name} className="game-thumb" onClick={(e) => playGame(res, e)}>
                        <div className="ComponentPicture">
                            <LazyLoadImage
                                className="d-block w-100 game-img game-im-gt"
                                src={!isEmpty(res.thumbnail) ? res.thumbnail : '/static/images/No_Image_Available.jpg'}
                                alt={res.name}
                                effect="blur"
                                visibleByDefault={false}
                            />
                            {isLive && <span className="live"></span>}
                        </div>
                    </a>
                    <div className="game-popup casino-game-popup">

                        <div className={`popup-content ${cssIsMobile}`}>
                            <div className="block d-flex">
                                {isAnonymousFunMode && res.funMode &&
                                    <Col className="align-self-center block-ismobile align-items-end">
                                        <div className={`casino-play-fun-${cssIsMobile}`}>
                                            <a title={res.name} className={`fun-${cssIsMobile}`} href={linkFun} onClick={(e) => playGameFun(res, e)}>

                                                <span className="button-text text-uppercase">{locale.t('forFun')}</span>
                                            </a>
                                        </div>
                                    </Col>
                                }
                                <Col className={`align-self-center block-ismobile ${isAnonymousFunMode && res.funMode ? 'align-items-start' : 'align-items-center'}`}>
                                    <div className={`casino-play-real-${cssIsMobile}`}>
                                        <a title={res.name} className={`real-${cssIsMobile}`} href={link} onClick={(e) => playGame(res, e)}>

                                            <span className="button-text">{locale.t('forReal')}</span>
                                        </a>
                                    </div>
                                </Col>

                                <div className={`align-self-center vendor-games`}>
                                    <div>
                                        <span className="button-text">{res.vendor}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="game-title d-flex justify-content-center">
                    <Col md={isLogin ? 10 : 12} xs={isLogin ? 9 : 12}>
                        <a className="text-left" title={res.name} onClick={(e) => playGame(res, e)}>
                            <p className={isShowMinMax}>{res.name}</p>
                        </a>
                    </Col>
                    {isLogin &&
                        <Col md={2} xs={3}>

                            <a className="favorites" onClick={() => fav ? removeFavorites(res) : addFavorites(res)}>
                                <span className={fav ? "jb-icon casino-active-favorite text-red" : "jb-icon casino-active-favorite text-gray"} ></span>
                            </a>

                        </Col>
                    }
                </div>
                {showMinMax}
            </li>
        )
    }
    render() {
        const { modelType, lobbiesData, slugActive, isLogin, pageHome, isSlide = false, disPlayAllCategories, sectionType, game, casinoGamesSearch } = this.props
        const { pageIndex, totalPageCount, loadMore, showAll } = this.state
        let img = lobbiesData.lobbiesIcon
        let titleAlt = lobbiesData.title
        let title = lobbiesData.title
        let lobbiesTextContent = lobbiesData.lobbiesTextContent
        let isShowMoreRecommend = true
        if (modelType === 3 && !isUndefined(slugActive)) {
            let cat = filter(lobbiesData.categories, (o) => o.slug === slugActive);
            if (!isUndefined(cat[0])) {
                img = cat[0].fontIconName
                titleAlt = cat[0].labelTitle
                title = cat[0].labelTitle
            }
        }
        const isRecommended = includes(lobbiesData.datasourceNameCasino.toLowerCase(), 'recommended')
        if (isRecommended) {
            isShowMoreRecommend = false
        }
        const displaySlide = ((pageHome && isSlide) || (disPlayAllCategories && !pageHome)) ? true : false;
        const casinoSlide = ((disPlayAllCategories && !pageHome) || (pageHome && sectionType === 'sports') || (pageHome && sectionType === 'jackpot')) ? 'casinoSlide' : ''
        const exceptGroup = (EXCEPT_INGROUP.includes(lobbiesData.slug))?'exceptGroup':'';

        return (
            <Fragment>

                {/* {isRecommended && isLogin && this._layoutRecommededLogin()} */}
                <div
                    className={`games-list container container-custom ${displaySlide ? 'containerSlide' : ''} ${exceptGroup} ${casinoSlide}`}>
                    {modelType === 4 ? this._renderRecommeded() : (displaySlide) ? this._renderItemSlider() : this._renderItem()}
                </div>
                {
                    !pageHome && isShowMoreRecommend && !isUndefined(game) && !isNull(game) && !isUndefined(game.data) && game.data.pages && game.data.pages.next !== null && showAll && !disPlayAllCategories ?
                        <Col className="button-end">
                            <a className="button buttonLoadmore" onClick={() => this.showMoreList()}>
                                <span>
                                    {locale.t('buttomShowMore')}
                                    {loadMore &&
                                        <div className="loading" />
                                    }
                                </span>
                            </a>
                        </Col>
                    : null
                }
            </Fragment>
        )
    }
}

const mapStateToProps = (state, props) => {
	const { lobbiesData: { datasourceNameCasino }, filterGames, page } = props;
	const slug = !isUndefined(filterGames.gameCategoriesSlug)?filterGames.gameCategoriesSlug:filterGames.slug;
	const {
		sessionState,
		casino: {
			casinoGames: { [`${datasourceNameCasino}$${slug}`]: { data: casinoGames = undefined, pending: casinoPending } = {} },
			allGames: { [`${page}`]: { data: casinoGameAll = undefined, pending: casinoPendingAll } = {} },
			casinoGamesSearch: { data: casinoGamesSearch = undefined, pending: casinoGamesSearchPending } = {},
			lastPlayedGames: { data: lastPlayedGames = undefined, pending: lastPlayedGamesPending } = {}
		}
	} = state;

	return {
		casinoGames,
		casinoPending,
		casinoGameAll,
		casinoPendingAll,
		session: sessionState,
		casinoGamesSearch,
		casinoGamesSearchPending,
        lastPlayedGames,
        lastPlayedGamesPending
	};
};

const mapDispatchToProps = (dispatch) => ({
	onSetGames: (active) => dispatch({ type: casinoParams.SET_CASINOGAMES, active }),
	onSetGamesPending: (active) => dispatch({ type: casinoParams.SET_CASINOGAMES_PENDING, active }),
	onSetGamesAll: (active) => dispatch({ type: casinoParams.SET_CASINOGAMESALL, active }),
	onSetGamesAllPending: (active) => dispatch({ type: casinoParams.SET_CASINOGAMESALL_PENDING, active }),
	onSetGamesSearch: (active) => dispatch({ type: casinoParams.SET_CASINOGAME_SEARCH, active }),
	onSetGamesSearchPending: (active) => dispatch({ type: casinoParams.SET_CASINOGAME_SEARCH_PENDING, active }),
});
export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(Category);