import React, { Component } from 'react'
import { connect } from 'react-redux'
import { LOGINMODAL, SET_FAVORITES } from "../../constants/types"
import * as casinoParams from '../../constants/casinoParams'
import dynamic from 'next/dynamic'
import CasinoService from '../../services/em/casino'
import CasinoNWA from "../../services/em/casinoNWA";
import CategoryMultiple from '../ItemCategory/categoryMultiple'
import GamePlay from './GamePlay'
import LoadBlock from '../Loading/LoadBlock'
import Category from './Category'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import {
    getQueryString,
    getPlatform
} from '../../../utils'
import { pagesWithoutSlideGames } from '../../../utils/CONSTANTS';
import isUndefined from 'lodash/isUndefined'
import filter from 'lodash/filter'
import cloneDeep from 'lodash/cloneDeep'
import assignIn from 'lodash/assignIn'
import findIndex from 'lodash/findIndex'
import isNull from 'lodash/isNull'
import isEmpty from 'lodash/isEmpty'
import head from 'lodash/head'
import includes from 'lodash/includes'
import find from 'lodash/find'

const cjson = require('compressed-json')
dynamic(import('../../../styles/components/_casinoGames.scss'))
const locale = require('react-redux-i18n').I18n
const config = require(`../../../config`).config
let callbackShow = false
let numCount = 0
class CasinoGames extends Component {
    constructor(props) {
        super(props);
        let { useragent } = props
        let lobbiesData = props.lobbiesData
        if (!useragent.isDesktop && !useragent.isiPad) {
            lobbiesData.pageSize = lobbiesData.pageSizeMobile;
        }
        let categories = []

        const getCat = filter(lobbiesData.categories, (o, i) => o.slug === 'favorites')
        if (getCat.length === 0 && lobbiesData.theme === 2) {
            if (!lobbiesData.hide_popular_new) {
                lobbiesData.categories.unshift({
                    gameCategoriesFilterType: "filterByCategory",
                    gameCategoriesGameCount: 0,
                    gameCategoriesSlug: "new",
                    id: -4,
                    labelTitle: locale.t('newestGames'),
                    slug: "newest-games",
                    fontIconName: "casino-inactive-newestgames",
                })
                lobbiesData.categories.unshift({
                    gameCategoriesFilterType: "filterByCategory",
                    gameCategoriesGameCount: 0,
                    gameCategoriesSlug: 'popular',
                    id: -3,
                    labelTitle: locale.t('popularGames'),
                    slug: "popular-games",
                    fontIconName: "casino-inactive-populargames",
                })
            }
            lobbiesData.categories.unshift({
                gameCategoriesFilterType: "filterByFavorites",
                gameCategoriesGameCount: 0,
                id: -1,
                labelTitle: locale.t('myFavourites'),
                slug: "favorites",
                fontIconName: "casino-inactive-favorite",
            })

            if (this.props.page === 'casino') {
                lobbiesData.categories.unshift({
                    gameCategoriesFilterType: "filterByLastPlaygame",
                    gameCategoriesGameCount: 0,
                    id: -5,
                    labelTitle: locale.t('lastplayed'),
                    slug: "lastplayed",
                    fontIconName: "casino-inactive-favorite",
                })
            }

            lobbiesData.categories.push({
                gameCategoriesFilterType: "filterByAllGames",
                gameCategoriesGameCount: 0,
                id: -2,
                labelTitle: locale.t('all'),
                slug: "all",
                fontIconName: "casino-inactive-allgames",
            })
        }
        filter(lobbiesData.categories, { 'gameCategoriesFilterType': 'filterByCategory' }).map((category, index) => {
            categories.push(category.gameCategoriesSlug)
        })

        const pageWithoutSlide = pagesWithoutSlideGames();
        const foundPage = (pageWithoutSlide.includes(this.props.page) && !this.props.pageHome);
        let filterDefault = { slug: 'popular-games', id: -3 };
        if (!this.props.pageHome) {
            filterDefault = { slug: 'all', id: -2 }
        } else {
            if (!isUndefined(lobbiesData.defaultCategory) && !isUndefined(lobbiesData.defaultCategory.slug)) {
                filterDefault = lobbiesData.defaultCategory
            }
        }

        this.state = {
            isLoading: true,
            pageIndex: casinoParams.getGamesParams.pageIndex,
            pageSize: lobbiesData.pageSize,
            lobbiesData: lobbiesData,
            games: [],
            index: 1,
            loadMore: false,
            modelType: lobbiesData.theme,
            lobbeiesType: lobbiesData.lobbeiesType,
            showCategories: lobbiesData.showCategories,
            filterGames: filterDefault,//!this.props.pageHome ? { slug: 'all', id: -2 } : !isUndefined(lobbiesData.defaultCategory) && !isUndefined(lobbiesData.defaultCategory.slug) ? lobbiesData.defaultCategory : { slug: 'popular-games', id: -3 },
            filterGamesAction: true,
            isPlayGame: false,
            infoGame: {},
            totalPageCount: -1,
            isMobile: false,
            searchText: '',
            categories,
            favoritesList: null,
            isLogin: false,
            realMoney: false,
            typePlayGame: 1,
            defaultIndex: null,
            lastPlayedGames: null,
            numIndex: 0,
            isShowRecommended: true,
            gamesJackpots: [],
            totalGameCountAll: 0,
            vendorsValue: '',
            disPlayAllCategories: foundPage ? false : (getQueryString('category') || getQueryString('vendor')) ? false : true,
        }
        this.popularGames = null
        this.newsGames = null
        this.popularGamesCategories = null
        this.newsGamesCategories = null
        this.gameList = {};
        this.allGames = {};
    }

    componentDidMount() {
        window.addEventListener("resize", this.resize.bind(this));
        this.resize();
        let { lobbiesData } = this.state
        this.loadBlock.isOpen(true)
        let category = getQueryString('category')
        if (!isEmpty(category)) {
            const cate = filter(lobbiesData.categories, (o) => o.slug === category)
            if (cate.length) {
                this.setState({
                    filterGames: { slug: head(cate).slug, id: head(cate).id },
                    filterGamesAction: true
                })
            }
        }

        if (this.props.isConnected && this.props.isLogin) {
            this.setState({
                isLogin: true,
            }, () => {
                this.getLastPlayedGames(this.props.isLogin)
                numCount = 0
                this.onCustomLoadGames()
                this.onFavorites(this.props.userProfile)
            })
        } else {
            this.setState({
                isLogin: this.props.isLogin,
            }, () => {
                numCount = 0
                this.onCustomLoadGames()
            })
        }
    }

    getLastPlayedGames = async (isLogin) => {
        if (isLogin) {
            const { session, useragent, onSetLastPlayed  } = this.props;
            if(!isUndefined(session.userInfo) && !isUndefined(session.userInfo.userID)){
                var d1 = new Date();
                var today = d1.getFullYear()+'-'+("0"+(d1.getMonth()+1)).slice(-2)+'-'+("0"+d1.getDate()).slice(-2);
                var d2 = new Date();
                d2.setMonth(d2.getMonth()-1);
                var lastMont = d2.getFullYear()+'-'+("0"+(d2.getMonth()+1)).slice(-2)+'-'+("0"+d2.getDate()).slice(-2);

                const params = {
                    offset: 0,
                    limit: 10,
                    period: 'Last30Days',
                    hasGameModel: true,
                    startDate: today, //format is 2020-08-20T00:00:00.000Z
                    endDate: lastMont, //format is 2020-08-20T00:00:00.000Z
                    platform: getPlatform(useragent),
                }

                CasinoNWA.getLastPlayedGames(session.userInfo.userID, params).then((result) => {
                    if (!result.error) {
                        const data = {
                            result: result
                        }
                        //console.log('getLastPlay NWA:', data)
                        onSetLastPlayed(data);
                    }
                });
            }
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.isLogin !== this.props.isLogin) {
            if (nextProps.isLogin) {
                this.setState({
                    isLogin: true
                }, () => {
                    this.getLastPlayedGames(nextProps.isLogin)
                    numCount = 0
                    this.onCustomLoadGames()
                })
            } else {
                this.setState({
                    isLogin: nextProps.isLogin
                }, () => {
                    numCount = 0
                    this.onCustomLoadGames()
                })
            }
        }

        if (nextProps.userProfile.fields !== this.props.userProfile.fields) {
            if (nextProps.userProfile.fields) {
                this.onFavorites(nextProps.userProfile)
            }
        }

        if (nextProps.favoritesListProps !== this.props.favoritesListProps) {
            let defaultIndex = findIndex(this.state.lobbiesData.categories, (o) => o.slug === 'favorites')
            let item = {}
            if (defaultIndex >= 0 && !isNull(nextProps.favoritesListProps)) {
                this.state.lobbiesData.categories[defaultIndex].gameCategoriesGameCount = nextProps.favoritesListProps.totalGameCount
            }
            if (!isNull(nextProps.favoritesListProps)) {
                item['favorites'] = nextProps.favoritesListProps.games
            }
            this.setState({
                favoritesList: nextProps.favoritesListProps,
                games: assignIn(this.state.games, item),
                numIndex: (this.state.numIndex + 1)
            })
        }
        if (nextProps.modals.callbackShow !== this.props.modals.callbackShow) {
            if (nextProps.modals.callbackShow && nextProps.modals.callback == 'callbackPlayGame' && !callbackShow) {
                callbackShow = true
                this.callbackPlayGame(nextProps.modals.callbackData)
            }
        }
    }

    paramsGame = (gameCategoriesSlug) => {
        let { lobbiesData } = this.state
        let getCustomGamesParams = cloneDeep(casinoParams.getCustomGamesParams);
        getCustomGamesParams.categoryID = lobbiesData.datasourceNameCasino + '$' + gameCategoriesSlug;
        getCustomGamesParams.dataSourceName = lobbiesData.datasourceNameCasino;
        getCustomGamesParams.filterByPlatform = this.filterByPlatform(getCustomGamesParams.filterByPlatform)
        return getCustomGamesParams
    }

    setPopularFilter = async (games) => {
        try {
            const { lobbiesData } = this.state
            let item = {}
            let itemSet = {}
            let resList = {}
            const indexPopular = findIndex(lobbiesData.categories, (o) => o.slug === 'popular-games')

            let gameListPopular = await localStorage.getItem(`${lobbiesData.casinoType}-popular-games-store`);
            if (includes(lobbiesData.datasourceNameCasino.toLowerCase(), 'live')) {

                if (isNull(gameListPopular)) {
                    let getGamesParamsLive = cloneDeep(casinoParams.getLiveCasinoTablesParams);
                    getGamesParamsLive.pageSize = 100
                    getGamesParamsLive.sortFields = [{
                        "field": 1024,
                        "order": "DESC"
                    }]
                    getGamesParamsLive.filterByPlatform = this.filterByPlatform(getGamesParamsLive.filterByPlatform)
                    const dataPopular = await CasinoService.getLiveCasinoTables(getGamesParamsLive)
                    resList = dataPopular.tables

                } else {
                    const dataPopular = cjson.decompress.fromString(gameListPopular);
                    resList = dataPopular.games
                }



            } else {

                if (isNull(gameListPopular)) {
                    let getGamesParamsPopular = cloneDeep(casinoParams.getGamesParams);
                    getGamesParamsPopular.pageSize = 100
                    getGamesParamsPopular.sortFields = [{
                        "field": 1024,
                        "order": "DESC"
                    }]
                    getGamesParamsPopular.filterByPlatform = this.filterByPlatform(getGamesParamsPopular.filterByPlatform)
                    const dataPopular = await CasinoService.getGames(getGamesParamsPopular)
                    resList = dataPopular.games
                } else {
                    const dataPopular = cjson.decompress.fromString(gameListPopular);
                    resList = dataPopular.games
                }

            }
            const keyGames = Object.keys(resList)
            for (let i = 0; i < keyGames.length; i++) {
                if (!isUndefined(games[keyGames[i]])) {
                    item[keyGames[i]] = games[keyGames[i]]
                }
            }
            this.popularGamesCategories = assignIn(this.popularGamesCategories, item)
            let gamesDataPopular = {
                currentPageIndex: 1,
                games: this.popularGamesCategories,
                totalGameCount: Object.keys(this.popularGamesCategories).length
            }
            if (indexPopular >= 0) {
                lobbiesData.categories[indexPopular].gameCategoriesGameCount = gamesDataPopular.totalGameCount
            }
            // this.setGameAll(gamesDataPopular)
            localStorage.setItem(`${lobbiesData.datasourceNameCasino}-popular-games`, cjson.compress.toString(gamesDataPopular));
            this.popularGames = this.popularGamesCategories
            itemSet['popular-games'] = this.popularGamesCategories
            this.setState({ games: assignIn(this.state.games, itemSet), numIndex: (this.state.numIndex + 1) })
            this.setGameAll(this.popularGames)
            // return this.popularGamesCategories
        } catch (err) {
            console.log('err setPopularFilter', err)
        }
    }

    setGameAll = (gamesData) => {
        let { lobbiesData } = this.state
        let allGamesIndex = findIndex(lobbiesData.categories, function (o) { return o.gameCategoriesFilterType === 'filterByAllGames'; });
        this.allGames = assignIn(this.allGames, gamesData.games)
        try {
            if (allGamesIndex >= 0) {
                let allGamesData = {
                    currentPageIndex: 1,
                    games: [],
                    totalGameCount: Object.keys(this.allGames).length
                }
                localStorage.setItem(`${lobbiesData.datasourceNameCasino}-all`, cjson.compress.toString(allGamesData));
                lobbiesData.categories[allGamesIndex].gameCategoriesGameCount = allGamesData.totalGameCount
            }
        } catch (e) {
            console.log("Local Storage is full, Please empty data", e);
        }
    }

    onCustomLoadGames = () => {
        let { lobbiesData } = this.state

        try {
            if (!isUndefined(lobbiesData.categories)) {
                this.getGames(lobbiesData.datasourceNameCasino, 'all');
                this.getGames(lobbiesData.datasourceNameCasino, 'poppular');
                this.getGames(lobbiesData.datasourceNameCasino, 'category');
            }
        } catch (e) {
            console.log("error=>", e);
        }
    }

    getGames = (datasourceNameCasino, slug, filterVendor, filterByInput) => {
        let { useragent, lang, onSetGames, onSetAllGames, pageHome, page, allVendors, lobbiesData, casinoGamesProps } = this.props;
        const { pageSize, searchText } = this.state;

        const dataSourceName = datasourceNameCasino;
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
                    if (casinoGamesProps && filterVendor) {
                        for (const key in casinoGamesProps) {
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
                if (casinoGamesProps) {
                    for (const key in casinoGamesProps) {
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

                            onSetAllGames(data);
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

                        onSetAllGames(data);
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
                        onSetAllGames(data);
                    }
                    if (this.loadBlock) this.loadBlock.isOpen(false);
                });
            }
        }
    };

    getNestedChildren = async (arr, data) => {
        if (!isUndefined(data.children)) {
            data.children.forEach(async (list) => {
                if (list.type == 'group') {
                    arr = await this.getNestedChildren(arr, list);
                } else if (list.type == 'table') {
                    arr[list.id] = list.table;
                } else {
                    arr[list.id] = list.game;
                }
            });
        }
        return arr
    }
    resize() {
        let mobile = (window.innerWidth < 768);
        if (mobile !== this.state.isMobile) {
            const pageWithoutSlide = pagesWithoutSlideGames();
            const foundPage = (pageWithoutSlide.includes(this.props.page) && !this.props.pageHome);
            const category = getQueryString('category') || null;
            const vendor = getQueryString('vendor') || null;
            this.setState({
                isMobile: mobile,
                pageSize: mobile ? this.state.lobbiesData.pageSizeMobile : this.state.lobbiesData.pageSize,
                disPlayAllCategories: foundPage ? false : (category === null && vendor === null) ? true : false,
            });
        }
    }

    handleShowAllCategories = () => {
        try{
        this.setState({ disPlayAllCategories: true, searchText: '', vendorsValue: '' });
        }catch{}
    }
    onFavorites = async (userProfile) => {
        try {
            const { isLogin, lobbiesData } = this.state
            let favorites = {}

            let favoritesList = null
            let defaultIndex = findIndex(lobbiesData.categories, (o) => o.slug === 'favorites')
            favorites = localStorage.getItem(`favorites-games`);
            let getGamesFavoritesParams = cloneDeep(casinoParams.getGamesFavorites);
            getGamesFavoritesParams.filterByPlatform = this.filterByPlatform(getGamesFavoritesParams.filterByPlatform)
            if (isLogin) {
                if (!isUndefined(userProfile.fields)) {
                    favorites = localStorage.getItem(`favorites-games-${userProfile.fields.userID}`);
                    if (!isNull(favorites) && favorites !== 'null') {
                        const data = cjson.decompress.fromString(favorites);
                        favoritesList = data
                        if (!isUndefined(data.games) && !isNull(data.games)) {
                            CasinoNWA.getGamesFavorites(userProfile.fields.userID).then((res) => {
                                let fav = data
                                if (!isUndefined(res) && !isUndefined(res.items) && res.items.length) {
                                    res.items.map((data) => {
                                        fav.games = { 
                                            ...fav.games, 
                                            [`${data.gameModel.slug}`]: {
                                            ...data.gameModel,
                                            vendor: data.gameModel.vendor.name
                                        }}
                                    })
                                    fav.totalGameCount = res.count
                                    if (defaultIndex >= 0) {
                                        lobbiesData.categories[defaultIndex].gameCategoriesGameCount = fav.totalGameCount
                                    }
                                    favoritesList = fav
                                    localStorage.setItem(`favorites-games-${userProfile.fields.userID}`, cjson.compress.toString(favoritesList));
                                    this.props.onSetFavorites(favoritesList)
                                }
                            }).catch((err) => { console.log('err ',err) })
                        }
                    } else {
                        CasinoNWA.getGamesFavorites(userProfile.fields.userID).then((res) => {
                            let fav = {}
                            if (!isUndefined(res) && !isUndefined(res.items) && res.items.length) {
                                res.items.map((data) => {
                                    fav.games = { 
                                        ...fav.games, 
                                        [`${data.gameModel.slug}`]: {
                                            ...data.gameModel,
                                            vendor: data.gameModel.vendor.name
                                        }
                                    }
                                })
                                fav.totalGameCount = res.count
                                if (defaultIndex >= 0) {
                                    lobbiesData.categories[defaultIndex].gameCategoriesGameCount = fav.totalGameCount
                                }
                                favoritesList = fav
                                localStorage.setItem(`favorites-games-${userProfile.fields.userID}`, cjson.compress.toString(favoritesList));
                                this.props.onSetFavorites(favoritesList)
                            }
                        }).catch((err) => { console.log(err) })
                    }

                }
            } else {
                if (!isNull(favorites)) {
                    const data = cjson.decompress.fromString(favorites);
                    if (defaultIndex >= 0) {
                        lobbiesData.categories[defaultIndex].gameCategoriesGameCount = data.totalGameCount
                    }
                    favoritesList = data
                    localStorage.setItem(`favorites-games`, cjson.compress.toString(favoritesList));
                    this.props.onSetFavorites(favoritesList)
                }
            }
            
            // this.setState({
            //     favoritesList
            // })
        } catch (err) {
            console.log('err onFavorites', err)
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

    addFavorites = (data) => {
        const { userProfile } = this.props
        const { favoritesList, lobbiesData, isLogin } = this.state
        let favorites = {}
        let defaultIndex = findIndex(lobbiesData.categories, (o) => o.slug === 'favorites')
        let gameID = ''
        let parameters = {}

        if (!isUndefined(data.tableID)) {
            gameID = data.tableID
            parameters = {
                anonymousUserIdentity: "",
                type: "table",
                id: gameID
            }
        } else {
            gameID = data.slug
            parameters = {
                anonymousUserIdentity: "",
                type: "game",
                id: gameID
            }
        }
        if (isNull(favoritesList)) {
            favorites.games = { [`${gameID}`]: data }
            favorites.totalGameCount = 1
        } else {
            favorites.games = { ...favoritesList.games, [`${gameID}`]: data }
            favorites.totalGameCount = Object.keys(favorites.games).length
        }
        if (defaultIndex >= 0) {
            lobbiesData.categories[defaultIndex].gameCategoriesGameCount = favorites.totalGameCount
        }
        try {
            if (isLogin) {
                if (!isUndefined(userProfile.fields)) {
                    CasinoNWA.addToFavorites(userProfile.fields.userID, data.gameId).then(() => {}).catch(() => {})
                    localStorage.setItem(`favorites-games-${userProfile.fields.userID}`, cjson.compress.toString(favorites));
                }
            } else {
                localStorage.setItem(`favorites-games`, cjson.compress.toString(favorites));
            }
        } catch (e) {
            console.log("Local Storage is full, Please empty data", e);
        }
        this.props.onSetFavorites(favorites)
        // this.setState({
        //     favoritesList: favorites
        // })
    }
    removeFavorites = (data) => {
        const { userProfile } = this.props
        const { favoritesList, lobbiesData, isLogin } = this.state
        let favorites = {}
        let defaultIndex = findIndex(lobbiesData.categories, (o) => o.slug === 'favorites')
        let gameID = ''
        let parameters = {}
        if (!isUndefined(data.tableID)) {
            gameID = data.tableID
            parameters = {
                anonymousUserIdentity: "",
                type: "table",
                id: gameID
            }
        } else {
            gameID = data.slug
            parameters = {
                anonymousUserIdentity: "",
                type: "game",
                id: gameID
            }
        }
        delete favoritesList.games[`${gameID}`]
        favorites.games = favoritesList.games
        favorites.totalGameCount = Object.keys(favoritesList.games).length
        if (defaultIndex >= 0) {
            lobbiesData.categories[defaultIndex].gameCategoriesGameCount = favorites.totalGameCount
        }
        try {
            if (isLogin) {
                if (!isUndefined(userProfile.fields)) {
                    CasinoNWA.removeFromFavorites(userProfile.fields.userID, data.gameId).then(() => {}).catch(() => {})
                    localStorage.setItem(`favorites-games-${userProfile.fields.userID}`, cjson.compress.toString(favorites));
                }
            } else {
                localStorage.setItem(`favorites-games`, cjson.compress.toString(favorites));
            }
        } catch (e) {
            console.log("Local Storage is full, Please empty data", e);
        }
        this.props.onSetFavorites(favorites)
        // this.setState({
        //     favoritesList: favorites
        // })
    }
    handleFilterGames = (onFilterGames) => {
        const { games, favoritesList, filterGamesAction, filterGames, searchText, vendorsValue, lastPlayedGames } = this.state

        let action = true;//filterGamesAction
        // if (onFilterGames.id === filterGames.id) {
        //     action = !filterGamesAction
        // } else {
        //     action = true
        // }
        if (onFilterGames.slug === 'favorites') {
            games[onFilterGames.slug] = isNull(favoritesList) ? [] : favoritesList.games
            this.setState({
                filterGames: onFilterGames,
                games,
                filterGamesAction: action,
                disPlayAllCategories: false
            }, () => {
                if (!isEmpty(searchText)) {
                    if (this.categoryFn) {
                        // this.handleSearch(searchText)
                    }
                }
            })
        } else if (onFilterGames.gameCategoriesFilterType == 'filterByAllGames') {

            games[onFilterGames.slug] = this.allGames
            this.setState({
                filterGames: onFilterGames,
                games,
                filterGamesAction: action,
                disPlayAllCategories: false
            }, () => {
                if (!isEmpty(searchText)) {
                    if (this.categoryFn) {
                        // this.handleSearch(searchText)
                    }
                }
            })
        } else if (onFilterGames.slug == 'lastplayed') {

            games[onFilterGames.slug] = lastPlayedGames;
            this.setState({
                filterGames: onFilterGames,
                games,
                filterGamesAction: action,
                disPlayAllCategories: false
            }, () => {
                if (!isEmpty(searchText)) {
                    if (this.categoryFn) {
                        // this.handleSearch(searchText)
                    }
                }
            })
        } else {
            this.setState({
                filterGames: onFilterGames,
                filterGamesAction: action,
                disPlayAllCategories: false
            }, () => {
                if (!isEmpty(searchText)) {
                    if (this.categoryFn) {
                        // this.handleSearch(searchText)
                    }
                }
            })
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
            isShowRecommended: show,
            vendorsValue: vendor,
            disPlayAllCategories: false
        }, () => {
            this.getGamesBySearch(searchText && searchText !== '' ? true : false);
            if (this.categoryFn) this.categoryFn.handleSearch(searchText, vendor)
        })
    }

    playGameFun = (game, e) => {
        game.realMoney = false
        this.gamePlay.isOpen(game, this.state.typePlayGame)
        e.preventDefault();
    }

    callbackPlayGame = (game) => {
        this.gamePlay.isOpen(game, this.state.typePlayGame)
    }

    playGame = (game, e) => {
        game.realMoney = true
        const { onSetLoginModal, isLogin } = this.props
        if (isLogin) {
            this.gamePlay.isOpen(game, this.state.typePlayGame)
        } else {
            onSetLoginModal({ show: true, callback: 'callbackPlayGame', callbackData: game })
        }
        e.preventDefault();
    }

    getGamesBySearch = (searchByInput) => {
        const { vendorsValue, lobbiesData } = this.state;

        this.getGames(lobbiesData.datasourceNameCasino, 'all', vendorsValue, searchByInput);
        this.getGames(lobbiesData.datasourceNameCasino, 'poppular', vendorsValue, searchByInput);
        this.getGames(lobbiesData.datasourceNameCasino, 'category', vendorsValue, searchByInput);
    }

    handleSearch = (evt) => {
        let { vendorsValue, lobbiesData, filterGames } = this.state
        const gameFilter = (filterGames) ? filterGames : lobbiesData.categories.find((o) => o.id === -2);
        let show = true
        if (evt !== '' || vendorsValue !== '') {
            show = false
        }

        this.setState({
            isShowRecommended: show,
            searchText: evt,
            disPlayAllCategories: show
        }, () => {
            if (!filterGames) this.handleFilterGames(gameFilter);
            this.getGamesBySearch(true);
            if (this.categoryFn) this.categoryFn.handleSearch(evt, vendorsValue)
        })
    }

    _rendrCategory = (pageSize, games, lobbiesData, favoritesList, modelType, slug, filterGames) => {
        const { filterGamesAction, lastPlayedGames, isMobile, numIndex, gamesJackpots, searchText, vendorsValue, disPlayAllCategories } = this.state
        const { pageHome, sectionType, urlLink, isSlide, typeSlide, useragent, page } = this.props;
        if (!pageHome && slug === "table-games") return;
        if (isUndefined(games)) return null;
        return (
            <Category
                ref={ref => this.categoryFn = ref}
                filterGames={filterGames}
                filterGamesAction={filterGamesAction}
                numIndex={numIndex}
                isMobile={isMobile}
                key={slug}
                pageSize={pageSize}
                gamesJackpots={gamesJackpots}
                game={games}
                lobbiesData={lobbiesData}
                modelType={modelType}
                favoritesList={favoritesList}
                slugActive={slug}
                isLogin={this.props.isLogin}
                lastPlayedGames={lastPlayedGames}
                currency={this.props.currency}
                popularGames={this.popularGames}
                newsGames={this.newsGames}
                allGames={this.allGames}
                addFavorites={(evt) => this.addFavorites(evt)}
                removeFavorites={(evt) => this.removeFavorites(evt)}
                playGame={(evt, e) => this.playGame(evt, e)}
                playGameFun={(evt, e) => this.playGameFun(evt, e)}
                vendorsValue={vendorsValue}
                searchText={searchText}
                pageHome={pageHome}
                isSlide={isSlide}
                sectionType={sectionType}
                urlLink={urlLink}
                disPlayAllCategories={disPlayAllCategories}
                handleFilterGames={this.handleFilterGames}
                typeSlide={typeSlide}
                useragent={useragent}
                page={page}
            />
        )
    }

    renderAllCategories = () => {
        const { favoritesList, lobbiesData, games, filterGames, modelType, pageSize } = this.state;
        const { isLogin, casinoGamesProps: casinoGames, page, casinoAllGames, lastPlayedGames } = this.props;
        let item = [];
        if (!isUndefined(lobbiesData.categories)) {
            const dataSourceName = lobbiesData.datasourceNameCasino;
            lobbiesData.categories.map((res, index) => {
                const groupName = `${dataSourceName}$${!isUndefined(res.gameCategoriesSlug) ? res.gameCategoriesSlug : res.slug}`;
            
                if (res.id === -1) {
                    if (isLogin) {
                        item.push(this._rendrCategory(pageSize, games[res.slug], lobbiesData, favoritesList, modelType, res.slug, res))
                    }
                } else if(res.id === -5 ){
                    if (isLogin) {
                        item.push(this._rendrCategory(pageSize, lastPlayedGames, lobbiesData, favoritesList, modelType, res.slug, res))
                    }
                } else {
                    if (res.id === -2) {
                        if(page !== 'lottery' && page !== 'virtual-sports'){
                            item.push(this._rendrCategory(pageSize, casinoAllGames[page], lobbiesData, favoritesList, modelType, res.slug, res))
                        }
                    } else {
                        if(page === 'lottery'){
                            res.labelTitle = locale.t('menu-lottery') //"Lottery All"
                        } else if(page === 'virtual-sports'){
                            res.labelTitle = locale.t('menu-virtual-sport') //"Virtual Sports All"
                        }
                        item.push(this._rendrCategory(pageSize, casinoGames[groupName], lobbiesData, favoritesList, modelType, res.slug, res))
                    }
                }
            })
        }

        return item;
    }

    _renderTheme = () => {
        const { favoritesList, lobbiesData, games, filterGames, modelType, pageSize, isMobile } = this.state;
        const { page, casinoGamesProps: casinoGames, casinoAllGames, lastPlayedGames } = this.props;
        let item = []

        if (modelType === 1 || modelType === 2 || modelType === 4) {
            if (!isUndefined(filterGames.slug)) {
                if (filterGames.id === -1) {
                    item = this._rendrCategory(pageSize, games[filterGames.slug], lobbiesData, favoritesList, modelType, filterGames.slug, filterGames)
                }else if(filterGames.id === -5) {
                    // console.log('lastPlayedGames => ', lastPlayedGames)
                    item = this._rendrCategory(pageSize, lastPlayedGames, lobbiesData, favoritesList, modelType, filterGames.slug, filterGames)
                }else {
             
                    if (filterGames.slug === 'all') {
                        if((page === 'lottery' || page === 'virtual-sports')){
                            const foundGames = casinoGames[`${lobbiesData.datasourceNameCasino}$${page}`] || undefined;
                            if(foundGames){
                                const game =  casinoGames[`${lobbiesData.datasourceNameCasino}$${page}`];
                                if (!isUndefined(game) && !isUndefined(game.data) && game.data.total > 0) {
                                    item = this._rendrCategory(pageSize, game, lobbiesData, favoritesList, modelType, filterGames.slug, filterGames)
                                    //renderAllCategories _rendrCategory
                                }
                            }
                        } else {
                            const game = casinoAllGames[page]
                            if (!isUndefined(game) && !isUndefined(game.data) && game.data.total > 0) {
                                item = this._rendrCategory(pageSize, game, lobbiesData, favoritesList, modelType, filterGames.slug, filterGames)
                            }
                        }
                    } else {
                        const groupName = `${lobbiesData.datasourceNameCasino}$${!isUndefined(filterGames.gameCategoriesSlug) ? filterGames.gameCategoriesSlug : filterGames.slug}`;
                        const game = casinoGames[groupName];
                        if (!isUndefined(game) && !isUndefined(game.data) && game.data.total > 0) {
                            item = this._rendrCategory(pageSize, game, lobbiesData, favoritesList, modelType, filterGames.slug, filterGames)
                        }
                    }
                }
            }
        } else if (modelType === 3) {
            if (!isUndefined(lobbiesData.categories)) {
                lobbiesData.categories.map((res, index) => {
                    item.push(this._rendrCategory(pageSize, games[res.slug], lobbiesData, favoritesList, modelType, res.slug, res))
                })
            }
        }
        return item
    }

    render() {
        const { typeHide, page, casinoGamesProps: casinoGames, casinoAllGames, lastPlayedGames, onSetAllVendors } = this.props
        const {
            games,
            modelType,
            isMobile,
            favoritesList,
            lobbiesData,
            isLogin,
            pageSize,
            isShowRecommended,
            filterGamesAction,
            filterGames,
            gamesJackpots,
            vendorsValue,
            disPlayAllCategories,
            pageHome,
            searchText,
        } = this.state
        const classRecommended = modelType == 4 ? 'recommended' : ''
        let isShow = true
        if (lobbiesData.lobbeiesType === 'recommended' && !isLogin) {
            isShow = false
        }
        let isHide = 'd-block'
        if (!isUndefined(typeHide) && typeHide) {
            if (!filterGamesAction && isShowRecommended) {
                isHide = 'd-none'
            }
        }
        let noGame = false
        if (!isUndefined(filterGames) && !isUndefined(filterGames.slug)) {
            if(filterGames.id === -1){

            }else if(filterGames.id === -5){
                //noGame = isUndefined(lastPlayedGames) || isUndefined(lastPlayedGames.data.count) || lastPlayedGames.data.count === 0? true: false
            }else{
                if (filterGames.slug === 'all') {
                    const game = casinoAllGames[page]
                    noGame = isUndefined(game) || game.data.total === 0 ? true : false
                } else {
                    const groupName = `${lobbiesData.datasourceNameCasino}$${!isUndefined(filterGames.gameCategoriesSlug) ? filterGames.gameCategoriesSlug : filterGames.slug}`;
                    const game = casinoGames[groupName]
                    noGame = isUndefined(game) || game.data.total === 0 ? true : false
                }
            }
        }
        return (
            <div className="position-relative" key={0}>
                {
                    !isUndefined(lobbiesData) && Object.keys(lobbiesData).length > 0 && lobbiesData.showCategories && isShow &&
                    <section className="category-games">
                        <CategoryMultiple
                            {...this.state}
                            page={page}
                            isLogin={isLogin}
                            disPlayAllCategories={disPlayAllCategories}
                            lobbiesData={lobbiesData}
                            isMobile={isMobile}
                            handleFilterGames={this.handleFilterGames}
                            handleSearch={this.handleSearch}
                            handleChangeVender={this.handleChangeVender}
                            vendorsValue={vendorsValue}
                            lastPlayedGames={lastPlayedGames}
                            onSetAllVendors={onSetAllVendors}
                        />
                    </section>
                }

                {
                    !isNull(isLogin) && !isUndefined(lobbiesData) && Object.keys(lobbiesData).length && isShow ?
                        <section className={`casino-games ${classRecommended} ${isHide}`}>
                            <Container className="container-custom">
                                <Row>
                                    <div className="games">
                                        {/* {noGame && <div className="p-3 noGame"><p className="text-center">{locale.t('noGame')}</p></div>} */}
                                        {!disPlayAllCategories && !pageHome && (
                                            <button className='btn-4 btn my-3 BackButton' onClick={() => this.handleShowAllCategories()}>{locale.t('back')}</button>
                                        )}
                                        {disPlayAllCategories && searchText === '' && vendorsValue === '' ? this.renderAllCategories() : this._renderTheme()}
                                        {casinoGames && casinoAllGames && Object.keys(casinoGames).length && Object.keys(casinoAllGames).length && (<GamePlay ref={ref => this.gamePlay = ref}
                                            filterGames={filterGames}
                                            currency={this.props.currency}
                                            favoritesList={favoritesList}
                                            gamesJackpots={gamesJackpots}
                                            games={games}
                                            page={page}
                                            pageSize={pageSize}
                                            lobbiesData={lobbiesData}
                                            isMobile={isMobile}
                                            isLogin={isLogin}
                                            allGames={this.allGames}
                                            popularGames={this.popularGames}
                                            removeFavorites={(evt) => this.removeFavorites(evt)}
                                            addFavorites={(evt) => this.addFavorites(evt)}
                                        />)}
                                    </div>
                                </Row>
                            </Container>
                        </section>
                        : null
                }

                {!isUndefined(typeHide) && typeHide && this.props.children}

                <LoadBlock ref={ref => this.loadBlock = ref} />
            </div>
        )
    }
}
const mapStateToProps = (state) => ({
    currency: state.EM.currency,
    isLogin: state.sessionState.isLogin,
    session: state.sessionState,
    modals: state.modalsState,
    userProfile: state.sessionState.userProfile,
    favoritesListProps: state.gameState.favoritesList,
    casinoGamesProps: state.casino.casinoGames,
    casinoAllGames: state.casino.allGames,
    lastPlayedGames: state.casino.lastPlayedGames,
    allVendors: state.casino.allVendors,
});
const mapDispatchToProps = (dispatch) => ({
    onSetLoginModal: (active) => dispatch({ type: LOGINMODAL, active }),
    onSetFavorites: (active) => dispatch({ type: SET_FAVORITES, active }),
    onSetGames: (active) => dispatch({ type: casinoParams.SET_CASINOGAMES, active }),
    onSetAllGames: (active) => dispatch({ type: casinoParams.SET_CASINOGAMESALL, active }),
    onSetGamesSearch: (active) => dispatch({ type: casinoParams.SET_CASINOGAME_SEARCH, active }),
    onSetLastPlayed: (active) => dispatch({ type: casinoParams.SET_LASTPLAYED, active }),
    onSetAllVendors: (active) => dispatch({ type: casinoParams.SET_ALL_VENDOR, active }),
})
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CasinoGames);