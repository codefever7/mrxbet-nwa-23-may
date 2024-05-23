import React from 'react';
import { connect } from 'react-redux';
import SportsService from '../../services/em/sports';
import * as sportsParams from '../../constants/sportsParams'
import find from 'lodash/find';
import {
    DEFAULT_LIMIT_LIVESPORT_SLIDE,
    DEFAULT_LIMIT_EVENTSPORT_SLIDE
} from '../../../utils/CONSTANTS';
import LiveMatchList from './matches';
import CarouselSlider from '../CarouselSlider';
import "./index.scss"; 

const locale = require("react-redux-i18n").I18n;

const sportsIdArr = [1, 3, 8, 20, 96, 63];

class LiveMatches extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            matches: [],
            fomatDevice: "pc",
            isMobile: false,
            slideDetected: ""
        }
    }


    componentDidMount() {
        const { typeEvents } = this.props;
        window.addEventListener("resize", this.resize.bind(this));
        this.resize();
        this.getPopularEvent();
        if (typeEvents === 'live') {
            this.inTervaLiveSport = setInterval(() => {
                this.getPopularEvent();
            }, 60000);
        }
    }
    componentWillUnmount() {
        const { typeEvents } = this.props;
        if (typeEvents === 'live') {
            clearInterval(this.inTervaLiveSport)
        }
    }

    resize() {
        const { fomatDevice } = this.state;
        let innerWidth = window.innerWidth;
        if (innerWidth >= 1000 && fomatDevice !== "pc") {
            this.setState({ fomatDevice: "pc" });
        } else if (innerWidth >= 564 && innerWidth < 1000 && fomatDevice !== "ipad") {
            this.setState({ fomatDevice: "ipad" });
        } else if (innerWidth < 564 && fomatDevice !== "mobile") {
            this.setState({ fomatDevice: "mobile" });
        }
        let mobile = (innerWidth < 768);
        if (mobile !== this.state.isMobile) {
            this.setState({ isMobile: mobile });
        }
    }

    getPopularEvent = async () => {
        try {
            const { locale, typeEvents } = this.props
            let match = [];
            let myData = [];
            if (typeEvents === "live") {
                let matchParam = sportsParams.matchesParams;
                matchParam.lang = locale;
                matchParam.maxResult = "30";
                matchParam.dataWithoutOdds = false;
                matchParam.liveStatus = "LIVE";
                for (let m = 0; m < sportsIdArr.length; m++) {
                    matchParam.sportId = sportsIdArr[m];
                    if (match.length >= 12) break;
                    const matches = await SportsService.getMatches(matchParam);
                    if (matches.records && matches.records.length) {
                        let { records } = matches;
                        for (let i = 0; i < records.length; i++) {
                            if (match.length >= 12) break;
                            if (records[i].statusId === '2') {
                                const params = {
                                    lang: locale,
                                    matchId: records[i].id,
                                    //bettingTypeId: 69,
                                    //eventPartId: 3,
                                    onlyValidBettingOffers: false
                                }

                                const odds = await SportsService.getOdds(params);
                                if (odds.records.length === 0) continue;
                                records[i].odds = odds.records;
                                match.push(records[i]);
                            }
                        }
                    }

                }

                myData = [].concat(match)
                    .sort((a, b) => a.sportId < b.sportId ? 1 : -1)
                    .sort((a, b) => a.startTime < b.startTime ? 1 : -1);

            } else {
                let matchParam = sportsParams.popularMatchesParams;
                matchParam.lang = locale;
                matchParam.dataWithoutOdds = false;
                matchParam.maxResult = "12";
                const matches = await SportsService.getPopularMatches(matchParam);
                if (matches.records && matches.records.length) {
                    let { records } = matches;
                    for (let i = 0; i < records.length; i++) {
                        if (match.length >= 12) break;
                        if (records[i].statusId === '1') {

                            const params = {
                                lang: locale,
                                matchId: records[i].id,
                                bettingTypeId: 69,
                                eventPartId: 3,
                            }

                            const odds = await SportsService.getOdds(params);
                            if (odds.records.length === 0) continue;
                            records[i].odds = odds.records;
                            match.push(records[i]);
                        }
                    }
                }

                myData = [].concat(match)
                    .sort((a, b) => a.startTime > b.startTime ? 1 : -1);
            }

            this.setState({ matches: myData });

        } catch (error) {
        }

    }

    handleDataEmission = (emittedData) => {
        this.setState({
            slideDetected: emittedData
        });
    }

    renderMatches = (match, index) => {
        const { typeEvents } = this.props;

        return (
            <LiveMatchList key={index} match={match} typeEvents={typeEvents} emitArrowClick={this.handleDataEmission} />
        );
    }

    renderGroupMatches = (matches) => {
        const { fomatDevice, isMobile } = this.state;
        const { typeEvents } = this.props;
        const LIMIT = typeEvents !== 'live' ? DEFAULT_LIMIT_EVENTSPORT_SLIDE[fomatDevice] : DEFAULT_LIMIT_LIVESPORT_SLIDE[fomatDevice];
        const countGroup = matches.length / LIMIT;

        let item = [];
        for (let i = 0; i < countGroup; i++) {
            const start = i * LIMIT;
            const end = start + LIMIT;
            item.push(
                <div key={`liveSportG${i}`} className={`Matches`}>
                    {matches.slice(start, end).map(this.renderMatches)}
                </div>
            )
        }

        const Title = typeEvents === 'live' ? locale.t('toplive').toUpperCase() : locale.t('topevents').toUpperCase();
        const Link = typeEvents === 'live' ? '/sports/betting/live-sports' : '/sports/live-sports/popular-events';
        return (
            <CarouselSlider
                id='LiveSportSection'
                children={item}
                limitGamesPerSlide={LIMIT}
                slideContentCount={countGroup}
                dotName='LiveSportDots'
                //showArrow={isMobile ? false : true}
                showArrow={true}
                isMobile={isMobile}
                showButton={true}
                statusGroup={isMobile ? false : true}
                slideDetected={this.state.slideDetected}
                urlLink={Link}
                typeEvents={typeEvents}
                title={Title} />
        );
    }

    render() {
        let { matches } = this.state;
        const { typeEvents } = this.props;

        if (!matches || matches.length === 0) return null;
        return (
            <section className={`LiveMatches ${typeEvents} mb-3 container-custom`} >
                {this.renderGroupMatches(matches.slice(0, 12))}
            </section>
        )
    }
}
const mapStateToProps = (state) => ({
    session: state.sessionState,
});
export default connect(mapStateToProps)(LiveMatches);