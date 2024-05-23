
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import find from 'lodash/find'
import isUndefined from 'lodash/isUndefined'
import map from 'lodash/map'
import filter from 'lodash/filter'
import slice from 'lodash/slice'
import orderBy from 'lodash/orderBy'
import includes from 'lodash/includes'
import Container from 'react-bootstrap/Container'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import { LazyLoadImage } from 'react-lazy-load-image-component';
import moment from 'moment'
import '../../../styles/components/_sportsMini.scss'
import SportsService from '../../services/em/sports'
import * as sportsParams from '../../constants/sportsParams'
import * as utils from "../../../utils";
class SportsMini extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: {},
      popular_today: {},
      loading:{
        popular_today: {},
      },
      isPlaceBet:false,
      bet:{
        name:'',
        priceValue:'',
        desc:'',
        linkTo:''
      },
      errMSG:'',
      isError:false,
      isLoading: false
    }
  }
  getOdds=(match, m, sportType)=>{
    const {locale} = this.props
    let params = {
      lang: locale,
      matchId: match.id,
      bettingTypeId: 69,
      eventPartId:3,
    }
    SportsService.getOdds(params).then((res) => {
      if(res){
        if(res.records.length){
          let foundMATCH = find(res.records, o=> o._type== "MATCH")
          let foundMARKET = find(res.records, o=> o._type== "MARKET" && o.bettingTypeId==69)
          if(foundMARKET){
            foundMARKET.outcomes = []
            let found = filter(res.records, o=> o._type== "MARKET_OUTCOME_RELATION" && o.marketId== foundMARKET.id)
            if(found){
              found.map((outcomeRelation)=>{
                let foundOutcome = find(res.records, o=> o._type== "OUTCOME" && o.id==outcomeRelation.outcomeId)
                let foundBettingOffer = find(res.records, o=> o._type== "BETTING_OFFER" && o.outcomeId==outcomeRelation.outcomeId)
                if(foundOutcome){
                  foundOutcome.bettingOffer = foundBettingOffer
                }
                foundMARKET.outcomes.push(foundOutcome)
              })
            }
          }
          foundMATCH.market = foundMARKET
          this.state[`${m}`][sportType].push(foundMATCH)
          if(this.state[`${m}`][sportType].length){
            this.state[`loading`][`${m}`][sportType]= false
            this.setState({[`${m}`] : this.state[`${m}`], loading: this.state[`loading`] })
          }
        }
      }
    })
  }
  getPopularMatches=(disciplines, sportType)=>{
    let popularMatchesParams = sportsParams.popularMatchesParams;
    popularMatchesParams.sportId = Number(disciplines.id)
    SportsService.getPopularMatches(popularMatchesParams).then((res) => {
      if(res){
        let matchs = filter(res.records,o=>o.numberOfMarkets>0)
        if(matchs.length){
          matchs = orderBy(matchs, ['startTime'], ['asc']);
          matchs = slice(matchs, 0, 5)
          matchs.map(match=>this.getOdds(match, 'popular_today', sportType))
        }else{
          this.state[`popular_today`][sportType]=[]
          this.state[`loading`][`popular_today`][sportType]= false
          this.setState({popular_today: this.state[`popular_today`], loading: this.state[`loading`] })
        }
      }
    })
  }

  callbackMatches=(matchs)=>{
    console.log('callbackMatches',matchs);
  }

  fetchOdds=(match, m, sportType, res)=>{
    if(res){
      if(res.records.length){
        let foundMARKET = find(res.records, o=> o._type== "MARKET" && o.bettingTypeId==69 && includes(o.displayKey, match.id))
        if(foundMARKET){
          foundMARKET.outcomes = []
          let found = filter(res.records, o=> o._type== "MARKET_OUTCOME_RELATION" && o.marketId== foundMARKET.id)
          if(found){
            found.map((outcomeRelation)=>{
              let foundOutcome = find(res.records, o=> o._type== "OUTCOME" && o.id==outcomeRelation.outcomeId)
              let foundBettingOffer = find(res.records, o=> o._type== "BETTING_OFFER" && o.outcomeId==outcomeRelation.outcomeId)
              if(foundOutcome){
                foundOutcome.bettingOffer = foundBettingOffer
              }
              foundMARKET.outcomes.push(foundOutcome)
            })
          }
        }
        match.market = foundMARKET
        this.state[`${m}`][sportType].push(match)
        if(this.state[`${m}`][sportType].length){
          this.state[`loading`][`${m}`][sportType]= false
          this.setState({[`${m}`] : this.state[`${m}`], loading: this.state[`loading`] })
        }
      }
    }
  }

  fetchMatches = ()=>{
    const { boxMostPopular } = this.props.pageData
    if(boxMostPopular){
      const sportType = boxMostPopular.sportType
      SportsService.getTopics().then((res)=>{
        if(res){
          this.state.popular_today[sportType] = []
          this.state[`loading`][`popular_today`][sportType]= true
          let matchs = filter(res.records,o=>o.numberOfMarkets>0 && o._type=='MATCH' && o.sportId=='1')
          matchs = slice(matchs, 0, 2)
          matchs.map(match=>this.getOdds(match, 'popular_today', sportType, res))
          
        }else{
          this.state[`popular_today`][sportType]=[]
          this.state[`loading`][`popular_today`][sportType]= false
          this.setState({popular_today: this.state[`popular_today`], loading: this.state[`loading`] })
        }
      })
    }
  }
  componentDidMount() {
    let _self = this;
    this.fetchMatches()
    setInterval(function() {
      _self.fetchMatches()
    }, 3 * 60 * 1000); // 60 * 1000 milsec
  }
  setTime = (data) => {
    return moment.utc(data).local().format('HH:mm')
  }
  setDate = (data) => {
    return moment.utc(data).local().format('DD.MM.YY')
  }
  _header = (data) => {
    return (
      <Row>
        <Col className="p-sm0">
          <div className="header">
            <LazyLoadImage
              className="header-img"
              src={data.icon}
              alt={data.alt}
              effect="blur"
              visibleByDefault={true}
            />
            <Col>
              <h2 className="text-uppercase">{data.title}</h2>
            </Col>
          </div>
        </Col>
      </Row>
    )
  }
  _renderTournament = (dataArr) => {
    let item = []
    if (!isUndefined(dataArr)) {
      if(dataArr.length){
        map(dataArr, (res) => {
          if (res) {
            let tournamentName = res.parentName
            let sportName = utils.convertSlug(res.shortSportName)
            let sportID = res.sportId
            let countryName = utils.convertSlug(res.shortVenueName)
            let countryID = res.venueId
            let shortTournamentName = utils.convertSlug(res.shortParentName)
            let tournamentID = res.parentId
            let tournamentLink = `/tournament/${sportName}/${sportID}/${countryName}/${countryID}/${shortTournamentName}/${tournamentID}`
            item.push(
                this._renderItemList(res)
            )
          }
        })
      }
    }
    return item
  }
  _renderContent = () => {
    let { popular_today } = this.state
    let { boxMostPopular } = this.props.pageData
    let sportType = boxMostPopular.sportType
    let item = []
    if (!isUndefined(popular_today[sportType])) {
        let popularOrderByTime = orderBy(popular_today[sportType], ['startTime'], ['asc']);
        popularOrderByTime = slice(popularOrderByTime, 0, 2)
        let layout = (
          <div className="content-matchs" key={sportType}>
              {this._renderTournament(popularOrderByTime, 'popular_today')}
          </div>
        )
        item.push(layout)
    }
    return item
  }
  renameToSlug = (text) => {
    let newText = text
      .replace(/,/g, "-")
      .replace(/'/g, "-")
      .replace(/&/g, "-")
      .split('.')
      .join("")
      .replace(/\//g, "-")
      .replace(/:/g, "-")
      .replace(/\(/g, "-")
      .replace(/\)/g, "-")
      .replace(/ - /g, "-")
      .trim()
      .replace(/ /g, "-")
      .replace(/--/g, "-")
      .replace(/\-$/, "")
      .toLowerCase();
    return newText
  }
  urlPattern = (sportPath, sportId, shortSportName, shortVenueName, shortParentName, shortName, id, prematch) => {
    return `/${sportPath}/${sportId}/${shortSportName}/${shortVenueName}/${shortParentName}/${shortName}/${id}/${prematch}/`
  }

  _customLink = (href, outcome) =>{
    if(outcome && outcome.bettingOffer){
      const { eventId, bettingOffer } = outcome
      const {id, odds} = bettingOffer
      href += `?bettingOfferId=${id}&eventId=${eventId}&odd=${odds}`
    }
    return href
  }
  _renderItemList = (res) => {
    let item = []
    let outcome1 = !isUndefined(res.market) ? find(res.market.outcomes,o=>o.headerNameKey=='home') : false
      let outcomeX = !isUndefined(res.market) ? find(res.market.outcomes,o=>o.headerNameKey=='draw') : false
      let outcome2 = !isUndefined(res.market) ? find(res.market.outcomes,o=>o.headerNameKey=='away') : false
      let sportPath = 'sports/betting/event';
      let href = this.urlPattern(sportPath, res.sportId, this.renameToSlug(res.shortSportName), this.renameToSlug(res.shortVenueName), this.renameToSlug(res.shortParentName), this.renameToSlug(res.shortName), res.id, 'main')
      item.push(
        <div className="matchs-list" key={`matchs-${res.name}`}>
          <Row className="">
            <Col xs={6} lg={6} className="participantName">
              <div className="">
                <p className="m-0">{res.homeParticipantName}</p>
                <p className="m-0">{res.awayParticipantName}</p>
              </div>
            </Col>
            <Col xs={6} lg={6} className="datetime">
              <div className="text-right">
                <p className="m-0">{this.setDate(res.startTime)}</p>
                <p className="m-0">{this.setTime(res.startTime)}</p>
              </div>
            </Col>
          </Row>
          <Row className="odds">
            <Col>
              <Row className="h-100 pt-1 pb-1 ">
                <Col xs={4} className="px-1">
                  {
                    outcome1 && outcome1.bettingOffer ?
                    <a href={this._customLink(href, outcome1)}>
                      <button type="button" className="odds-button">
                          <div className="row m-1">
                            <div className="col text-left px-0">1</div>
                            <div className="col text-right px-0">{outcome1.bettingOffer.odds.toFixed(2)}</div>
                          </div>
                      </button>
                    </a>
                    :
                     <button type="button" className="odds-button noOdds">
                        <div className="row m-1">
                          <div className="col text-left px-0">1</div>
                          <div className="col text-right px-0"><i className="jb-icon lock" /></div>
                        </div>
                      </button>
                  }
                </Col>
                <Col xs={4} className="px-1">
                    {
                      outcomeX && outcomeX.bettingOffer ?
                        <a href={this._customLink(href, outcomeX)}>
                          <button type="button" className="odds-button">
                            <div className="row m-1">
                              <div className="col text-left px-0">X</div>
                              <div className="col text-right px-0">{outcomeX.bettingOffer.odds.toFixed(2)}</div>
                            </div>
                          </button>
                        </a>
                        :
                        <button type="button" className="odds-button noOdds">
                          <div className="row m-1">
                            <div className="col text-left px-0">X</div>
                            <div className="col text-right px-0"><i className="jb-icon lock" /></div>
                          </div>
                        </button>
                    }
                    
                </Col>
                <Col xs={4} className="px-1 ">
                  {
                    outcome2 && outcome2.bettingOffer ?
                      <a href={this._customLink(href, outcome2)}>
                        <button type="button" className="odds-button">
                          <div className="row m-1">
                            <div className="col text-left px-0">2</div>
                            <div className="col text-right px-0">{outcome2.bettingOffer.odds.toFixed(2)}</div>
                          </div>
                        </button>
                      </a>
                      :
                      <button type="button" className="odds-button noOdds">
                        <div className="row m-1">
                          <div className="col text-left px-0">2</div>
                          <div className="col text-right px-0"><i className="jb-icon lock" /></div>
                        </div>
                    </button>
                  }
                   
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      )
    return item;
  }
  _renderWidget = () => {
    const {boxMostPopular, boxLiveBetting, boxNextEvents, boxFootball, boxTennis, boxESport, boxBasketball, boxAllSports} = this.props.pageData
     return (
      boxMostPopular?
      <Fragment>
        <Row className="pb-md-3">
          <Col md={12} xs={12}>
            <div className="box-sports-lg">
              <a href={utils.overrideLink(boxMostPopular.buttonLink)}>
              <LazyLoadImage src={boxMostPopular.image} alt="top_banner" className="img-fluid position-absolute cover" />
              <div className="d-flex justify-content-center align-items-center flex-column content text-align-center">
                <h1>{boxMostPopular.title && boxMostPopular.title.toUpperCase()}</h1>
                {!isUndefined(this.state[`loading`][`popular_today`][boxMostPopular.sportType]) && !this.state[`loading`][`popular_today`][boxMostPopular.sportType] && this._renderContent()}
                <button type="button" className="btn btn-success">{boxMostPopular.buttonText && boxMostPopular.buttonText.toUpperCase()}</button>
              </div>
              </a>
            </div>
          </Col>
        </Row>
        <Row className="pb-3 pb-md-0">
          <Col className="mr-0 pb-3 pr-md-2 col-12 col-md-6">
            <div className="box-sports-md">
            <a href={utils.overrideLink(boxLiveBetting.buttonLink)}>
              <LazyLoadImage src={boxLiveBetting.image} alt="live betting" className="img-fluid position-absolute cover" />
              <div className="d-flex justify-content-between align-items-center flex-column content text-center">
                <h3>{boxLiveBetting.title && boxLiveBetting.title.toUpperCase()}</h3>
                <button type="button" className="btn btn-success">{boxLiveBetting.buttonText && boxLiveBetting.buttonText.toUpperCase()}</button>
              </div>
              </a>
            </div>
          </Col>
          <Col className="ml-0 pl-md-2 col-12 col-md-6">
            <div className="box-sports-md">
            <a href={utils.overrideLink(boxNextEvents.buttonLink)}>
              <LazyLoadImage src={boxNextEvents.image} alt="next events" className="img-fluid position-absolute cover" />
              <div className="d-flex justify-content-between align-items-center flex-column content text-center">
                <h3>{boxNextEvents.title && boxNextEvents.title.toUpperCase()}</h3>
                <button type="button" className="btn btn-success">{boxNextEvents.buttonText && boxNextEvents.buttonText.toUpperCase()}</button>
              </div>
              </a>
            </div>
          </Col>
        </Row>
        <Row>
          <Col className="mr-0 pr-1 pr-md-2">
            <div className="box-sports-sm">
            <a href={utils.overrideLink(boxFootball.buttonLink)}>
             <LazyLoadImage src={boxFootball.image} alt="football" className="img-fluid position-absolute cover" />
             <div className="d-flex justify-content-between align-items-center flex-column content text-center">
                <h3>{boxFootball.title && boxFootball.title.toUpperCase()}</h3>
                <button type="button" className="btn btn-success">{boxFootball.buttonText && boxFootball.buttonText.toUpperCase()}</button>
              </div>
              </a>
            </div>
          </Col>
          <Col className="mx-0 px-1 px-md-2">
            <div className="box-sports-sm">
            <a href={utils.overrideLink(boxTennis.buttonLink)}>
              <LazyLoadImage src={boxTennis.image} alt="tennis" className="img-fluid position-absolute cover" />
              <div className="d-flex justify-content-between align-items-center flex-column content text-center">
                <h3>{boxTennis.title && boxTennis.title.toUpperCase()}</h3>
                <button type="button" className="btn btn-success">{boxTennis.buttonText && boxTennis.buttonText.toUpperCase()}</button>
              </div>
              </a>
            </div>
          </Col>
          <Col className="mx-0 px-1 px-md-2">
            <div className="box-sports-sm">
            <a href={utils.overrideLink(boxESport.buttonLink)}>
              <LazyLoadImage src={boxESport.image} alt="e-sport" className="img-fluid position-absolute cover" />
              <div className="d-flex justify-content-between align-items-center flex-column content text-center">
                <h3>{boxESport.title && boxESport.title.toUpperCase()}</h3>
                <button type="button" className="btn btn-success">{boxESport.buttonText && boxESport.buttonText.toUpperCase()}</button>
              </div>
              </a>
            </div>
          </Col>
          <Col className="mx-0 px-1 px-md-2">
            <div className="box-sports-sm">
            <a href={utils.overrideLink(boxBasketball.buttonLink)}>
              <LazyLoadImage src={boxBasketball.image} alt="basketball" className="img-fluid position-absolute cover" />
              <div className="d-flex justify-content-between align-items-center flex-column content text-center">
                <h3>{boxBasketball.title && boxBasketball.title.toUpperCase()}</h3>
                <button type="button" className="btn btn-success">{boxBasketball.buttonText && boxBasketball.buttonText.toUpperCase()}</button>
              </div>
              </a>
            </div>
          </Col>
          <Col className="ml-0 pl-1 pl-md-2">
            <div className="box-sports-sm">
            <a href={utils.overrideLink(boxAllSports.buttonLink)}>
              <LazyLoadImage src={boxAllSports.image} alt="all sports" className="img-fluid position-absolute cover" />
              <div className="d-flex justify-content-between align-items-center flex-column content text-center">
                <h3><strong>{boxAllSports.title && boxAllSports.title.toUpperCase()}</strong></h3>
                <button type="button" className="btn btn-success">{boxAllSports.buttonText && boxAllSports.buttonText.toUpperCase()}</button>
              </div>
              </a>
            </div>
          </Col>
        </Row>
      </Fragment>:null
    )
  }

  render() {
    const {sportsTitle} = this.props.pageData
    return (
      <section className="sport-mini position-relative">
         <div className="main">
            <Container className="container-custom">
            {sportsTitle &&
                    <div className="box-header">
                        <div className="header-games">
                            <LazyLoadImage
                                className="header-img"
                                src={`/static/images/Football-50px.png`}
                                alt={sportsTitle}
                                effect="blur"
                                visibleByDefault={true}
                            />
                            <Col>
                                <h2 className="text-uppercase">{sportsTitle}</h2>
                            </Col>
                        </div>
                    </div>
                }
              {this._renderWidget()}
            </Container>
          </div>
      </section>
    )
  }
}

export default connect(null, null)(SportsMini);