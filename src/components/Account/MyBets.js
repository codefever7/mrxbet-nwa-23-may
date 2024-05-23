import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import DatePicker from "react-datepicker"

import LoadBlock from '../Loading/LoadBlock'
import SportsService from '../../services/em/sports'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'

import {
    convertComma,
    getSymbol
} from '../../../utils'
import moment from 'moment'
import isUndefined from 'lodash/isUndefined';
import isNull from 'lodash/isNull';
import "../../../styles/datepicker/datepicker.scss"
import "../../../styles/components/_mybets.scss"
const locale = require('react-redux-i18n').I18n
export class MyBets extends Component {
    constructor(props) {
        super(props)
        var ourDate = new Date();
        //Change it so that it is 7 days in the past.
        var pastDate = ourDate.getDate() - 7;
        ourDate.setDate(pastDate);
        this.state = {
            betList: [],
            totalRecords: 0,
            tabActive: 1,
            startDate: ourDate,
            endDate: new Date(),
            betStatuses: ["OPEN", "WON", "HALF_WON", "LOST", "HALF_LOST", "DRAW", "CASHED_OUT", "VOID", "CANCELLED"],
            isMobile: false,
        }
    }
    componentDidMount() {
        const { startDate, endDate, betStatuses, tabActive } = this.state
        this.loadBlock.isOpen(true)
        this.getBetHistoryV2(999, startDate, endDate, betStatuses, tabActive)
        window.addEventListener("resize", this.resize.bind(this));
        this.resize();
    }

    resize() {
        let mobile = window.innerWidth < 768;

        if (mobile !== this.state.isMobile) {
            this.setState({
                isMobile: mobile,
            });
        }
    }

    getBetHistoryV2 = (totalGet, startDate, endDate, betStatuses, tabActive) => {
        const parameters = {
            // "lang": "en",
            // "betIds": [],
            betStatuses,
            startDate: moment(startDate).format('YYYY-MM-DD'),
            nrOfRecords: totalGet,
            page: 0,
            endDate: moment(endDate).format('YYYY-MM-DD')
        }
        SportsService.getBetHistoryV2(parameters).then((res) => {
            if (res && !isUndefined(res.success) && res.success) {
                if (res.totalRecords > res.responseRecords) {
                    this.getBetHistoryV2(res.totalRecords, startDate, endDate, betStatuses, tabActive)
                } else {
                    this.setState({ betList: res.betList, totalRecords: res.totalRecords, startDate, endDate, tabActive, betStatuses }, () => {
                        this.loadBlock.isOpen(false)
                    })
                }
            } else {
                this.setState({ betList: [], totalRecords: 0, startDate, endDate, tabActive, betStatuses }, () => {
                    this.loadBlock.isOpen(false)
                })
            }

        }).catch((err) => {
            // console.log('err', err)
            this.setState({ betList: [], totalRecords: 0, startDate, endDate, tabActive, betStatuses }, () => {
                this.loadBlock.isOpen(false)
            })
        })
    }
    _renderItem = () => {
        const { betList, isMobile } = this.state
        let item = []
        let renderItem = null
        if (betList.length) {
            betList.map((res, index) => {
                switch (res.type) {
                    case "SINGLE":
                        renderItem = this._renderItemSingle(res, index)
                        break;
                    case "MULTIPLE":
                        renderItem = this._renderItemMultiple(res, index)
                        break;
                    case "SYSTEM":
                        renderItem = this._renderItemSystem(res, index)
                        break;
                }

                item.push(renderItem)
            })

        } else {
            item.push(
                <Col className="pt-3" key="1">
                    <p className={!isMobile ? "text-center" : ''}>{locale.t('textNotBets')}</p>
                </Col>
            )
        }
        return item
    }

    _renderItemSingle = (res, index) => {
        let nameStatus = ''
        switch (res.status) {
            case 'WON':
                nameStatus = locale.t('won')
                break;
            case 'OPEN':
                nameStatus = locale.t('pending')
                break;
            case 'LOST':
                nameStatus = locale.t('lost')
                break;
            case 'HALF_WON':
                nameStatus = locale.t('halfWon')
                break;
            case 'HALF_LOST':
                nameStatus = locale.t('halfLost')
                break;
            case 'DRAW':
                nameStatus = locale.t('draw')
                break;
            case 'CASHED_OUT':
                nameStatus = locale.t('cashedOut')
                break;
            case 'VOID':
                nameStatus = locale.t('void')
                break;
            case 'CANCELLED':
                nameStatus = locale.t('cancelled')
                break;
        }

        let itemTeamName = []
        res.selections.map((resSelections, indexSelections) => {
            itemTeamName.push(
                <Row key={`team-name-${indexSelections}`} className="team-name">
                    <Col xs={12} className="">
                        <p className="m-0">{resSelections.eventName}</p>
                    </Col>
                </Row>
            )
        })
        let layout = (
            <Col key={index} xs={12} className={`betting-history-bet-single ${res.status}`}>
                <Row className="pt-3">
                    <Col xs={6}>
                        <p className="m-0 t-detail">{moment(res.placedDate).format('DD/MM/YY HH:mm')}</p>
                    </Col>
                    <Col xs={6} className="text-right">
                        {res.status === 'WON' ? <p className={`m-0 text-${res.status}`}>{`${locale.t('won')}`}</p> : <p className={`m-0 text-${res.status}`}>{nameStatus}</p>}
                    </Col>
                </Row>
                <Row className="py-3">
                    <Col xs={6} className="align-self-center border-right">
                        <p className="m-0 t-detail">
                            {`${locale.t('usedStake')}: `}
                            <span>{`${getSymbol(res.currency)}${convertComma(res.totalBetAmount)}`}</span>
                        </p>
                        <p className="m-0 t-detail">
                            {`${locale.t('totalOdds')}: `}
                            <span>{`${!isUndefined(res.totalPriceValue) ? convertComma(res.totalPriceValue) : '-'}`}</span>
                        </p>
                    </Col>
                    <Col xs={6} className="align-self-center">
                        <p className={`m-0 text-right`}>{`${locale.t('toReturn')}: ${getSymbol(res.currency)}${res.currentPossibleWinning}`}</p>
                        {itemTeamName}
                    </Col>
                </Row>
            </Col>
        )


        return layout
    }

    _renderItemMultiple = (res, index) => {

        let nameStatus = ''
        switch (res.status) {
            case 'WON':
                nameStatus = locale.t('won')
                break;
            case 'OPEN':
                nameStatus = locale.t('pending')
                break;
            case 'LOST':
                nameStatus = locale.t('lost')
                break;
            case 'HALF_WON':
                nameStatus = locale.t('halfWon')
                break;
            case 'HALF_LOST':
                nameStatus = locale.t('halfLost')
                break;
            case 'DRAW':
                nameStatus = locale.t('draw')
                break;
            case 'CASHED_OUT':
                nameStatus = locale.t('cashedOut')
                break;
            case 'VOID':
                nameStatus = locale.t('void')
                break;
            case 'CANCELLED':
                nameStatus = locale.t('cancelled')
                break;
        }

        let itemTeamName = []
        res.selections.map((resSelections, indexSelections) => {
            let nameStatusSelections = ''
            switch (resSelections.status) {
                case 'WON':
                    nameStatusSelections = locale.t('won')
                    break;
                case 'OPEN':
                    nameStatusSelections = locale.t('pending')
                    break;
                case 'LOST':
                    nameStatusSelections = locale.t('lost')
                    break;
                case 'HALF_WON':
                    nameStatusSelections = locale.t('halfWon')
                    break;
                case 'HALF_LOST':
                    nameStatusSelections = locale.t('halfLost')
                    break;
                case 'DRAW':
                    nameStatusSelections = locale.t('draw')
                    break;
                case 'CASHED_OUT':
                    nameStatusSelections = locale.t('cashedOut')
                    break;
                case 'VOID':
                    nameStatusSelections = locale.t('void')
                    break;
                case 'CANCELLED':
                    nameStatusSelections = locale.t('cancelled')
                    break;
            }
            itemTeamName.push(
                <Row key={`team-name-${indexSelections}`} className="team-list border-top">
                    <div className={`tab-index ${resSelections.status}`}>
                        <p className="m-0">{indexSelections + 1}</p>
                    </div>
                    <Col className="py-2">
                        <Row>
                            <Col>
                                <p className="m-0 fw-bold">{resSelections.eventName}</p>
                            </Col>
                            <Col className="text-right">
                                <p className={`m-0 fw-bold`}>{nameStatusSelections}</p>
                            </Col>
                        </Row>
                        <p className="m-0 t-detail">{resSelections.tournamentName}</p>
                        <p className="m-0 t-detail">{moment(resSelections.eventDate).format('DD/MM/YY HH:mm')}</p>
                        <p className="m-0">{resSelections.bettingTypeEventPartName}</p>
                        <Row>
                            <Col>
                                <p className="m-0 fw-bold">{resSelections.betName}</p>
                            </Col>
                            <Col className="text-right">
                                <p className={`m-0 fw-bold`}>{convertComma(resSelections.priceValue)}</p>
                            </Col>
                        </Row>
                        <p className="m-0">{resSelections.eventScoreAtPlaceBet}</p>
                    </Col>

                </Row>
            )
        })
        let layout = (
            <Col key={index} xs={12} className={`betting-history-bet-multiple ${res.status}`}>
                <Row className="pt-3">
                    <Col xs={6}>
                        <p className="m-0 t-detail">{moment(res.placedDate).format('DD/MM/YY HH:mm')}</p>
                    </Col>
                    <Col xs={6} className="text-right">
                        {res.status === 'WON' ? <p className={`m-0 text-${res.status}`}>{`${locale.t('won')}`}</p> : <p className={`m-0 text-${res.status}`}>{nameStatus}</p>}
                    </Col>
                </Row>
                <Row className="py-3">
                    <Col xs={6} className="align-self-center">
                        <p className="m-0 t-detail">
                            {`${locale.t('usedStake')}: `}
                            <span>{`${getSymbol(res.currency)}${convertComma(res.totalBetAmount)}`}</span>
                        </p>
                        <p className="m-0 t-detail">
                            {`${locale.t('totalOdds')}: `}
                            <span>{`${!isUndefined(res.totalPriceValue) ? convertComma(res.totalPriceValue) : '-'}`}</span>
                        </p>
                        <p className={`m-0 t-detail`}>{`${locale.t('toReturn')}: `}
                            <span>{`${getSymbol(res.currency)}${res.currentPossibleWinning}`}</span>
                        </p>
                    </Col>
                </Row>
                {itemTeamName}
            </Col>
        )
        return layout
    }
    _renderItemSystem = (res, index) => {

        let nameStatus = ''
        switch (res.status) {
            case 'WON':
                nameStatus = locale.t('won')
                break;
            case 'OPEN':
                nameStatus = locale.t('pending')
                break;
            case 'LOST':
                nameStatus = locale.t('lost')
                break;
            case 'HALF_WON':
                nameStatus = locale.t('halfWon')
                break;
            case 'HALF_LOST':
                nameStatus = locale.t('halfLost')
                break;
            case 'DRAW':
                nameStatus = locale.t('draw')
                break;
            case 'CASHED_OUT':
                nameStatus = locale.t('cashedOut')
                break;
            case 'VOID':
                nameStatus = locale.t('void')
                break;
            case 'CANCELLED':
                nameStatus = locale.t('cancelled')
                break;
        }
        let itemTeamName = []
        res.selections.map((resSelections, indexSelections) => {
            let nameStatusSelections = ''
            switch (resSelections.status) {
                case 'WON':
                    nameStatusSelections = locale.t('won')
                    break;
                case 'OPEN':
                    nameStatusSelections = locale.t('pending')
                    break;
                case 'LOST':
                    nameStatusSelections = locale.t('lost')
                    break;
                case 'HALF_WON':
                    nameStatusSelections = locale.t('halfWon')
                    break;
                case 'HALF_LOST':
                    nameStatusSelections = locale.t('halfLost')
                    break;
                case 'DRAW':
                    nameStatusSelections = locale.t('draw')
                    break;
                case 'CASHED_OUT':
                    nameStatusSelections = locale.t('cashedOut')
                    break;
                case 'VOID':
                    nameStatusSelections = locale.t('void')
                    break;
                case 'CANCELLED':
                    nameStatusSelections = locale.t('cancelled')
                    break;
            }
            itemTeamName.push(
                <Row key={`team-name-${indexSelections}`} className="team-list border-top">
                    <div className={`tab-index ${resSelections.status}`}>
                        <p className="m-0">{indexSelections + 1}</p>
                    </div>
                    <Col className="py-2">
                        <Row>
                            <Col>
                                <p className="m-0 fw-bold">{resSelections.eventName}</p>
                            </Col>
                            <Col className="text-right">
                                <p className={`m-0 fw-bold`}>{nameStatusSelections}</p>
                            </Col>
                        </Row>
                        <p className="m-0 t-detail">{resSelections.tournamentName}</p>
                        <p className="m-0 t-detail">{moment(resSelections.eventDate).format('DD/MM/YY HH:mm')}</p>
                        <p className="m-0">{resSelections.bettingTypeEventPartName}</p>
                        <Row>
                            <Col>
                                <p className="m-0 fw-bold">{resSelections.betName}</p>
                            </Col>
                            <Col className="text-right">
                                <p className={`m-0 fw-bold`}>{convertComma(resSelections.priceValue)}</p>
                            </Col>
                        </Row>
                        <p className="m-0">{resSelections.eventScoreAtPlaceBet}</p>
                    </Col>

                </Row>
            )
        })
        let layout = (
            <Col key={index} xs={12} className={`betting-history-bet-system ${res.status}`}>
                <Row className="pt-3">
                    <Col xs={6}>
                        <p className="m-0 t-detail">{moment(res.placedDate).format('DD/MM/YY HH:mm')}</p>
                    </Col>
                    <Col xs={6} className="text-right">
                        {res.status === 'WON' ? <p className={`m-0 text-${res.status}`}>{`${locale.t('won')}`}</p> : <p className={`m-0 text-${res.status}`}>{nameStatus}</p>}
                    </Col>
                </Row>
                <Row className="py-3">
                    <Col xs={6} className="align-self-center">
                        <p className="m-0 t-detail">
                            {`${locale.t('usedStake')}: `}
                            <span>{`${getSymbol(res.currency)}${convertComma(res.totalBetAmount)}`}</span>
                        </p>
                        <p className="m-0 t-detail">
                            {`${locale.t('totalOdds')}: `}
                            <span>{`${!isUndefined(res.totalPriceValue) ? convertComma(res.totalPriceValue) : '-'}`}</span>
                        </p>
                        <p className="m-0 t-detail">
                            {`${locale.t('betType')}: `}
                            <span>{`${res.systemBetType}`}</span>
                        </p>
                        <p className={`m-0 t-detail`}>{`${locale.t('toReturn')}: `}
                            <span>{`${getSymbol(res.currency)}${res.currentPossibleWinning}`}</span>
                        </p>

                    </Col>
                </Row>
                {itemTeamName}
            </Col>
        )
        return layout
    }
    filterStartDate = (startDate) => {
        const { betStatuses, tabActive, endDate, isMobile } = this.state
        if (!isUndefined(startDate) && !isNull(startDate)) {
            if (isMobile) {
                this.setState({ startDate })
            } else {
                this.loadBlock.isOpen(true)
                this.getBetHistoryV2(999, startDate, endDate, betStatuses, tabActive)
            }
        }
    }
    filterEndDate = (endDate) => {
        const { betStatuses, tabActive, startDate, isMobile } = this.state
        if (!isUndefined(endDate) && !isNull(endDate)) {
            if (isMobile) {
                this.setState({ endDate })
            } else {
                this.loadBlock.isOpen(true)
                this.getBetHistoryV2(999, startDate, endDate, betStatuses, tabActive)
            }
        }
    }
    tabSetActive = (event) => {
        const e = event.target
        const { startDate, endDate, isMobile } = this.state

        let renderItem = null
        switch (e.value) {
            case '1':
                renderItem = ["OPEN", "WON", "HALF_WON", "LOST", "HALF_LOST", "DRAW", "CASHED_OUT", "VOID", "CANCELLED"]
                break;
            case '2':
                renderItem = ["OPEN"]
                break;
            case '3':
                renderItem = ["WON", "HALF_WON", "LOST", "HALF_LOST", "DRAW", "CASHED_OUT", "VOID", "CANCELLED"]
                break;
        }
        if (isMobile) {
            this.setState({ tabActive: e.value, betStatuses: renderItem })
        } else {
            this.loadBlock.isOpen(true)
            this.getBetHistoryV2(999, startDate, endDate, renderItem, e.value)
        }
    }

    filterItem = () => {
        const { startDate, endDate, betStatuses, tabActive } = this.state
        this.loadBlock.isOpen(true)
        this.getBetHistoryV2(999, startDate, endDate, betStatuses, tabActive)
    }

    render() {
        const { tabActive, startDate, endDate, isMobile } = this.state

        return (
            <Container className={`my-bets ${isMobile ? 'my-bets-mobile' : ''}`}>
                <div className="my-bets-tab">
                    <Col md={5} xs={12} className="d-flex h-100 p-0 tab-css">
                        {/* <div className={`tab ${tabActive === 1 ? 'active' : ''}`} onClick={() => this.tabSetActive(1)}>
                            <p className={`m-0 text-uppercase`}>{locale.t('openBets')}</p>
                        </div>
                        <div className={`tab ${tabActive === 2 ? 'active' : ''}`} onClick={() => this.tabSetActive(2)}>
                            <p className={`m-0 text-uppercase`}>{locale.t('settledBets')}</p>
                        </div> */}
                        <Form.Group className="w-100 pr-0 pr-md-5">
                            <div className="selectdiv">
                                <Form.Control componentclass="select" as="select" name="type" defaultValue={tabActive} onChange={(e) => this.tabSetActive(e)}>
                                    <option value="1">{locale.t('all')}</option>
                                    <option value="2">{locale.t('openBets')}</option>
                                    <option value="3">{locale.t('settledBets')}</option>
                                </Form.Control>
                            </div>
                        </Form.Group>
                    </Col>
                    <Col md={7} xs={12} className="tab-date">
                        <div className="text-time">
                            <span>{`${locale.t('period')} : `}</span>
                        </div>
                        <div className="date-time">
                            <DatePicker
                                className="form-contro start-date"
                                name="startDate"
                                dateFormat="yyyy-MM-dd"
                                selected={startDate}
                                startDate={startDate}
                                endDate={endDate}
                                maxDate={endDate}
                                onChange={date => this.filterStartDate(date)} />
                            <DatePicker
                                className="form-control end-date"
                                name="dateRecords"
                                dateFormat="yyyy-MM-dd"
                                selected={endDate}
                                startDate={startDate}
                                endDate={endDate}
                                minDate={startDate}
                                onChange={date => this.filterEndDate(date)} />
                        </div>
                    </Col>
                    {
                        isMobile ? (
                            <Col className="px-0 pt-3">
                                <Button className="button btn-3 btn-n1 w-100" onClick={() => this.filterItem()}>
                                    <p className="pl-2 text-uppercase m-0">{locale.t('filter')}</p>
                                </Button>
                            </Col>
                        ) : null
                    }
                    
                </div>
                {this._renderItem()}

                <LoadBlock ref={ref => this.loadBlock = ref} />
            </Container>
        )
    }
}

const mapStateToProps = (state) => ({

})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(MyBets)
