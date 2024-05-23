import React, { Component } from 'react';
import { connect } from 'react-redux';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import '../../../styles/components/_itemCategory.scss'

import findIndex from 'lodash/findIndex';
import forEach from 'lodash/forEach';
import isUndefined from 'lodash/isUndefined'
import isNull from 'lodash/isNull'

const locale = require('react-redux-i18n').I18n
const desktop = 76
const mobile = 115
let desktopShow = 12
let mobileShow = 3
let category = 1

class ItemCategory extends Component {
    constructor(props) {
        super(props);
        let w = props.isMobile ? mobile : desktop
        let widthWin = (window.innerWidth <= 812);
        let showCategory = widthWin ? 7 : desktopShow
        if (props.isMobile) {
            showCategory = mobileShow
        }
        this.state = {
            isLoading: true,
            addClassLeft: 'over',
            addClassRight: '',
            itemWidth: w,
            transform: 0,
            shContent: showCategory,
            isMobile: false,
            styleInner: {
                transform: 'translateX(0px)',
                width: (w * (props.isLogin ? props.lobbiesData.categories.length : props.lobbiesData.categories.length - 1))
            },
            filterGames: !isUndefined(props.lobbiesData.defaultCategory) && !isUndefined(props.lobbiesData.defaultCategory.slug) ? props.lobbiesData.defaultCategory : { slug: 'popular-games', id: -3 },
            lobbiesData: props.lobbiesData,
            isPlayGame: props.isPlayGame,
            typePlayGame: props.typePlayGame,
        }
        this.multiCarousel = React.createRef()
        this.timeout = 0;
    }

    componentDidMount() {
        window.addEventListener("resize", this.resize.bind(this));
        this.resize();
        let { lobbiesData, isMobile } = this.state
        // category = lobbiesData.categories.length
        category = this.props.isLogin ? lobbiesData.categories.length : lobbiesData.categories.length - 1
        const showCategory = isMobile ? mobileShow : desktopShow

        if (category < showCategory) {
            this.setState({
                addClassLeft: 'over',
                addClassRight: 'over',
            })
        }
    }
    resize() {
        let mobile = (window.innerWidth <= 812);
        if (mobile) {
            if (window.innerWidth < 768) {
                desktopShow = 5
            } else {
                desktopShow = 7
            }
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const { isMobile } = this.state
        if (nextProps.isMobile !== isMobile || nextProps.isLogin !== this.props.isLogin) {
            this.resize();
            let w = nextProps.isMobile ? mobile : desktop
            let widthWin = (window.innerWidth <= 812);
            let showCategory = widthWin ? 7 : desktopShow
            if (nextProps.isMobile) {
                showCategory = mobileShow
            }
            let setAddClass = ''
            if (category < showCategory) {
                setAddClass = 'over'
            }
            let data = {
                itemWidth: w,
                shContent: showCategory,
                isMobile: nextProps.isMobile,
                styleInner: {
                    transform: 'translateX(0px)',
                    width: (w * (nextProps.isLogin ? nextProps.lobbiesData.categories.length : nextProps.lobbiesData.categories.length - 1))
                },
                addClassLeft: setAddClass,
                addClassRight: setAddClass
            }
            this.setState(data)
        }
    }

    handleFilterGames = (filterGames) => {
        const { isPlayGame, typePlayGame } = this.state

        this.props.handleFilterGames(filterGames, true, isPlayGame, typePlayGame)

    }

    _renderItem = () => {
        const { lobbiesData, itemWidth } = this.state
        const { filterGames, filterGamesAction, isLogin } = this.props
        let data = []
        let categoryList = lobbiesData.categories
        let defaultCategory = filterGamesAction ? filterGames.id : ''
        if (categoryList.length > 0) {
            categoryList.map((res, index) => {
                const active = defaultCategory === res.id ? 'active' : ''
                if (res.id === -1) {
                    if (isLogin) {
                        data.push(
                            <div className="item" key={index} style={{ width: itemWidth }}>
                                <div className={`pad15 ${active}`}>
                                    <a onClick={_ => this.handleFilterGames(res)}>
                                        <i className={`jb-icon icon-default ${res.fontIconName}`}></i>
                                        <p dangerouslySetInnerHTML={{ __html: res.labelTitle }} />
                                    </a>
                                    {
                                        res.gameCategoriesGameCount > 0 &&
                                        <span className="sum-game" >{`${res.gameCategoriesGameCount}+`}</span>
                                    }
                                </div>
                            </div>
                        )
                    }
                } else {
                    data.push(
                        <div className="item" key={index} style={{ width: itemWidth }}>
                            <div className={`pad15 ${active}`}>
                                <a onClick={_ => this.handleFilterGames(res)}>
                                <i className={`jb-icon icon-default ${res.fontIconName}`}></i>
                                    <p dangerouslySetInnerHTML={{ __html: res.labelTitle }} />
                                </a>
                                {
                                    res.gameCategoriesGameCount > 0 &&
                                    <span className="sum-game" >{`${res.gameCategoriesGameCount}+`}</span>
                                }
                            </div>
                        </div>
                    )
                }
            })
        }

        return data
    }

    click = (e) => {
        const { transform, itemWidth, styleInner, shContent, isMobile } = this.state
        let trans = 0
        let classLeft = ''
        let classRight = ''
        const showCategory = isMobile ? mobileShow : desktopShow

        if (category > showCategory) {
            if (e === 0) {
                trans = parseInt(transform) - parseInt(itemWidth)
                if (trans <= 0) {
                    classLeft = 'over'
                }
            } else if (e === 1) {
                trans = parseInt(transform) + parseInt(itemWidth)

                if (trans >= styleInner.width - (itemWidth * shContent)) {
                    classRight = 'over'
                }
            }
            this.setState({
                styleInner: {
                    ...this.state.styleInner,
                    transform: `translateX(-${trans}px)`,
                },
                transform: trans,
                addClassLeft: classLeft,
                addClassRight: classRight,
            })
        }
    }

    handleSubmit = (event) => {
        let form = event.target
        this.props.handleSearch(form.elements.gameSearch.value)
        event.preventDefault();
    }

    handleSearch = (event) => {
        let _self = this;
        let searchText = event.target.value;
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            _self.props.handleSearch(searchText)
        }, 475);
    }

    render() {
        const { styleInner, addClassLeft, addClassRight } = this.state
        const { lobbiesData, isPlayGamePopup } = this.props
        let gamesCount = 0
        let allGamesIndex = findIndex(lobbiesData.categories, function (o) { return o.gameCategoriesFilterType == 'filterByAllGames'; });
        const isCategories = !isUndefined(lobbiesData.categories) && lobbiesData.categories.length > 1 ? true : false
        const showCategories = !isUndefined(lobbiesData.showCategories) ? lobbiesData.showCategories : false
        const showSearch = !isUndefined(lobbiesData.showSearch) ? lobbiesData.showSearch : false
        if (allGamesIndex > -1) {
            gamesCount = lobbiesData.categories[allGamesIndex].gameCategoriesGameCount
        } else {
            forEach(lobbiesData.categories, (res) => {
                gamesCount = parseInt(gamesCount) + parseInt(res.gameCategoriesGameCount)
            })
        }
        let styleInline = {}
        let isHide = ''
        if (addClassLeft === 'over' && addClassRight === 'over') {
            styleInline = {
                'display': 'flex',
                'justifyContent': 'center'
            }
            isHide = 'd-none'
        }
        return (
            <div className="category">
                <Container>
                    {
                        (showSearch || isPlayGamePopup) &&
                        <Row>
                            <Col md={{ span: 6, offset: 3 }} xs={12}>
                                <Form onSubmit={(event) => this.handleSubmit(event)}>
                                    <Form.Group as={Col} md="12">
                                        <InputGroup>
                                            <Form.Control type="text" name="gameSearch" placeholder={locale.t('searchEGStarburstLiveNetent')} onChange={this.handleSearch} />
                                            <InputGroup.Prepend>
                                                <Button type="submit" className="submit">
                                                    <i className="jb-icon icon-default search" aria-hidden="true"></i>
                                                </Button>
                                            </InputGroup.Prepend>
                                        </InputGroup>
                                    </Form.Group>
                                </Form>
                            </Col>
                            <Col md={3} xs={12} className="text-sum">
                                <p>{`${gamesCount + locale.t('plusGames')}`}</p>
                            </Col>
                        </Row>
                    }

                    {(isCategories || isPlayGamePopup) && showCategories && <Row className="justify-content-center">
                        <Col md={10} xs={12}>
                            <div className="multi-carousel" style={styleInline}>
                                <div className="multi-carousel-inner" style={styleInner}>
                                    {this._renderItem()}
                                </div>
                                <Button className={`btn btn-primary leftLst ${addClassLeft} ${isHide}`} onClick={() => this.click(0)}>
                                    <i className="jb-icon icon-default casino-arrow-left" />
                                </Button>
                                <Button className={`btn btn-primary rightLst ${addClassRight} ${isHide}`} onClick={() => this.click(1)}>
                                    <i className="jb-icon icon-default casino-arrow-right" />
                                </Button>
                            </div>
                        </Col>
                    </Row>
                    }
                </Container>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    isConnected: state.EM.isConnected,
    session: state.sessionState,
    modals: state.modalsState,
    favoritesListProps: state.gameState.favoritesList
});

export default connect(
    mapStateToProps,
    null
)(ItemCategory);