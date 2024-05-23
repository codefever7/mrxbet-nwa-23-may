import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import SportsService from '../../services/em/sports';
import "./index.scss";
import { isUndefined } from 'lodash';
import { SetInnerHtml } from '../set-inner-html';
import ArrowLeft from '../../../static/svg-js/arrow-left';
import ArrowRight from '../../../static/svg-js/arrow-right';

class LiveMatchList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			oddsOfMatch: [],
		}
	}

	findOddsOfMatch = (odds) => {
		let result = [];
		const foundMarketOutCome = odds.filter(o => o._type === "OUTCOME");
		if (foundMarketOutCome) {
			foundMarketOutCome.map((outcome) => {
				const foundBettingOffer = odds.find((o) => o._type == "BETTING_OFFER" && o.outcomeId == outcome.id)
				if(!isUndefined(foundBettingOffer)){
					const data = {
						type: outcome.headerNameKey,
						odds: (foundBettingOffer) ? foundBettingOffer.odds : null,
						eventId: outcome.eventId,
						bettingOfferId: (foundBettingOffer) ? foundBettingOffer.id : null,
					}
					
					result.push(data);
				}
			});

		}
		return result;
	}

	handleClickEvent = (match) => {
		const {
				shortSportName,
				shortVenueName,
				shortParentName,
				shortName,
				id,
				sportId
		} = match;
		const pathOfMatch = `${shortSportName}/${shortVenueName}/${shortParentName}/${shortName}/${id}/main`;
		let replacedString = pathOfMatch.replace(/[-(),]+/g, '');
		replacedString = replacedString.replace(/ +/g, '-');
		const linkSport = `/sports/live-sports/event/${sportId}/${replacedString.toLowerCase()}`;
		
		window.location.href = linkSport;
	}

	shortMonthName = (month) => {
		let name = '';
		switch (month) {
			case 1: name = 'Jan'; break;
			case 2: name = 'Feb'; break;
			case 3: name = 'Mar'; break;
			case 4: name = 'Apr'; break;
			case 5: name = 'May'; break;
			case 6: name = 'Jun'; break;
			case 7: name = 'Jul'; break;
			case 8: name = 'Aug'; break;
			case 9: name = 'Sep'; break;
			case 10: name = 'Oct'; break;
			case 11: name = 'Nov'; break;
			case 12: name = 'Dec'; break;
			default: break;
		}
		return name;
	}

	shortDate = (date) => {
		let name = '';
		switch (date) {
			case 1: name = `${date}st`; break;
			case 2: name = `${date}nd`; break;
			case 3: name = `${date}rd`; break;
			default: name = `${date}th`; break;
		}
		return name;
	}

	convertDateTimes = (datetime) => {
		const newDate = new Date(datetime);
		const Day = this.shortDate(newDate.getDate());
		const Month = this.shortMonthName(newDate.getMonth() + 1);
		const hour = (newDate.getHours() < 10) ? `0${newDate.getHours()}` : newDate.getHours();
		const minute = (newDate.getMinutes() < 10) ? `0${newDate.getMinutes()}` : newDate.getMinutes();
		const result = {
			time: `${hour}:${minute}`,
			date: `${Day} ${Month}`,
		}
		return result;
	}

	renderMatchTime = (startTime) => {
		const { time, date } = this.convertDateTimes(startTime);
		return <Fragment>
			<span className="score">{time}</span>
			<span className="LiveTime">{date}</span>
		</Fragment>;
	}

	renderScore = (odds, startTime) => {
		const { match: { shortCurrentPartName = undefined } } = this.props;
		const dateNow = Date.now();
		const minuteLive = Math.floor((dateNow - startTime) / 60000);
		const foundEVENTINFO = odds.filter(o => o._type === "EVENT_INFO" && o.typeId === "1" && o.shortEventPartName === "Whole Match");
		let PartName = (!isUndefined(shortCurrentPartName))?shortCurrentPartName.replace(/[()]+/g, ''):null;
		const PartNameSplit = (PartName !== null)?PartName.split(' '):null;
		if(PartNameSplit !== null && PartNameSplit.length > 1){
			PartName = `${PartNameSplit[0]} ${PartNameSplit[1]}`;
		}

		return <Fragment>
			<span className="score">{foundEVENTINFO && foundEVENTINFO.length > 0? `${foundEVENTINFO[0].paramFloat2}-${foundEVENTINFO[0].paramFloat1}`:'0-0'}</span>
			<span className="LiveTime">{PartName}</span>
			<span className="LiveTime">{minuteLive <= 0 ? '0' : minuteLive}"</span>
		</Fragment>;
	}

	renderOddsButton = (oddsData) => {
		const {
			match: {
				shortSportName,
				shortVenueName,
				shortParentName,
				shortName,
				id,
				sportId,
			}
		} = this.props;
		const pathOfMatch = `${shortSportName}/${shortVenueName}/${shortParentName}/${shortName}/${id}/main`;
		let replacedString = pathOfMatch.replace(/[-(),]+/g, '');
		replacedString = replacedString.replace(/ +/g, '-');
		const linkSport = `/sports/live-sports/event/${sportId}/${replacedString.toLowerCase()}`;
		
		const foundHome = oddsData.find((o) => o.type === 'home');
		const foundDraw = oddsData.find((o) => o.type === 'draw');
		const foundAway = oddsData.find((o) => o.type === 'away');
		//if (!foundHome.odds && !foundDraw.odds && !foundAway.odds) return null;
		
		return (
			<React.Fragment>
				<a className='OddsLink' href={!isUndefined(foundHome)?`${linkSport}?eventId=${foundHome.eventId}&bettingOfferId=${foundHome.bettingOfferId}&odd=${foundHome.odds}`:''}>
					<div className="index">1</div>
					{foundHome && !isUndefined(foundHome.odds) && foundHome.odds !== null ? foundHome.odds.toFixed(2) : '-'}
				</a>
				<a className='OddsLink' href={!isUndefined(foundDraw)?`${linkSport}?eventId=${foundDraw.eventId}&bettingOfferId=${foundDraw.bettingOfferId}&odd=${foundDraw.odds}`:''}>
					<div className="index">X</div>
					{foundDraw && !isUndefined(foundDraw.odds) && foundDraw.odds !== null ? foundDraw.odds.toFixed(2) : '-'}
				</a>
				<a className='OddsLink' href={!isUndefined(foundAway)?`${linkSport}?eventId=${foundAway.eventId}&bettingOfferId=${foundAway.bettingOfferId}&odd=${foundAway.odds}`:''}>
					<div className="index">2</div>
					{foundAway && !isUndefined(foundAway.odds) && foundAway.odds  !== null ? foundAway.odds.toFixed(2) : '-'}
				</a>
			</React.Fragment>
		);
	}

	handleImageError = (event) => {
		const { match: { sportId } } = this.props;
		const target = event.target;
		target.src = `/static/images/ErrorSport${sportId}.png`;
	}

	handleClickNext = () => {
		this.props.emitArrowClick('next')
	}

	handleClickPrev = () => {
		this.props.emitArrowClick('prev')
	}

	render() {
		const { match, typeEvents } = this.props;
		if (!match) return null;
		const {
			id,
			shortTranslatedName,
			shortParentName,
			homeShortParticipantName,
			homeParticipantLogoUrl,
			awayShortParticipantName,
			awayParticipantLogoUrl,
			startTime,
			_type,
			odds,
			sportId
		} = match;
		const tournamentName = (_type === "TOURNAMENT") ? shortTranslatedName : shortParentName;

		const oddsData = (odds.length) ? this.findOddsOfMatch(odds) : null;
		const displayOdds = oddsData && oddsData.length ? this.renderOddsButton(oddsData) : null;

		const logoHome = !isUndefined(homeParticipantLogoUrl)?homeParticipantLogoUrl:`/static/images/ErrorSport${sportId}.png`;
		const logoAway = !isUndefined(awayParticipantLogoUrl)?awayParticipantLogoUrl:`/static/images/ErrorSport${sportId}.png`;
	

		return (
			<>
				{/*<span className='arrow-prev' onClick={this.handleClickPrev}>
					<SetInnerHtml tagName="span" htmlProps={{ className: 'icon' }} innerHtml={ArrowLeft} />
				</span>*/}
				<div className={`LiveMatchesContainer ${typeEvents === 'events'?'TopEvent':`Sport${sportId}`}`} key={id} onClick={() => this.handleClickEvent(match)}>
					<div className='d-flex mb-1 mb-md-3 justify-content-center'>
						<div className="LeagueTitle">{tournamentName}</div>
					</div>
					<div className='MatchEvent'>
						<div className="TeamName">
							<div className="home-team">
								<img src={logoHome} onError={this.handleImageError} />
								<span className="name">{homeShortParticipantName}</span>
							</div>
							<div className="score-team">
								{typeEvents === 'live' ? this.renderScore(odds, startTime) : this.renderMatchTime(startTime)}
							</div>
							<div className="away-team">
								<img src={logoAway} onError={this.handleImageError} />
								<span className="name">{awayShortParticipantName}</span>
							</div>
						</div>
					</div>
					<div className="OddsButton">
						{displayOdds}
					</div>
				</div>
				{/*<span className='arrow-next'  onClick={this.handleClickNext}>
					<SetInnerHtml tagName="span" htmlProps={{ className: 'icon' }} innerHtml={ArrowRight} />
				</span>*/}
			</>
		);
	}
}

export default connect(null)(LiveMatchList);