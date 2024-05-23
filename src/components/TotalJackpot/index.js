import React, { Component, Fragment } from 'react'
import { connect } from "react-redux";
import CasinoService from "../../services/em/casino";
import * as casinoParams from '../../constants/casinoParams';
import LayoutGame from '../Layout/LayoutGame';
import findIndex from 'lodash/findIndex';
import find from 'lodash/find';
import CarouselSlider from '../CarouselSlider';

import "./index.scss";

const locale = require("react-redux-i18n").I18n;
let maxJackpotAmount = 38758350;

class TotalJackpot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jackpotGames: null,
      isMobile: false,
      casinoGames: null,
      lobbiesData: null,
    };
  }


  componentDidMount() {
    window.addEventListener("resize", this.resize.bind(this));
    this.resize();
    this.getJackpots();
    this.inTervalJackpots = setInterval(() => {
      this.getJackpots();
    }, 5000);
  }


  resize() {
    let mobile = (window.innerWidth < 768);
    if (mobile !== this.state.isMobile) {
      this.setState({ isMobile: mobile });
    }
  }

  componentWillUnmount() {
    clearInterval(this.inTervalJackpots)
  }

  getJackpots = async () => {
    try {
      const { useragent } = this.props;
      let params = casinoParams.getJackpotsParams;
      params.filterByPlatform = ["PC"]//filterByPlatform(params.filterByPlatform, useragent);
      const res = await CasinoService.getJackpots(params)

      if (res.jackpots !== null && res.jackpots.length !== 0) {
        const data = res.jackpots.sort((a, b) => b.amount.EUR - a.amount.EUR).slice(0, 1);
        //const jackpotGames = data.slice(0, 5);
        if (data[0].amount.EUR > maxJackpotAmount) {
          maxJackpotAmount = data[0].amount.EUR;
        } else {
          maxJackpotAmount += Math.random() * 1;
          data[0].amount.EUR = maxJackpotAmount;
        }

        this.setState({ data }, () => {
          //this.handleSetJackpotData(data);
          this.setState({ jackpotGames: data });
        })
      }
    } catch (err) {
      console.log(err)
    }
  }

  formatAmount = (amount) => {
    // Convert the number to a string
    const amountString = amount.toFixed(2); // Assuming you want to format with 2 decimal places

    // Add commas for thousands separator
    const parts = amountString.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Join the parts back together
    return parts.join('.');
  }

  handleSetJackpotData = (data) => {
    let result = [];

    data.map((item, index) => {
      let items = item;
      //const amount = items.amount.EUR;
      //maxJackpotAmount += Math.random() * 1;
      items.amount.EUR = maxJackpotAmount;
      result.push(items);
    });

    this.setState({ jackpotGames: result });
  }

  renderJackpots = (item, index) => {
    const { game } = item;
    //if (i > 4) return;
    const thumbnail = game.thumbnails && game.thumbnails.length > 0 ? game.thumbnails[0].url : game.thumbnail;
    //if (jackpotAmount != prevAmount) {

    return (
      <div className="GameItem carousel__item" key={index}>
        <a href='/casino?cateName=jackpot-games'><img src={thumbnail} /></a>
      </div>
    );
  }

  renderDesktop = () => {
    const { jackpotGames, isMobile } = this.state;
    const amount = jackpotGames[0].amount.EUR;
    return (
      <div className="total-jackpot-container">
        {/* <img src="/static/images/jacpot_background.png" /> */}
        <h2 className='totalAmount'>Є {this.formatAmount(amount)}</h2>
        <button className='button buttonLogin' onClick={() => (window.location.href = "/casino")} >{locale.t('allJackpots')}</button>
      </div>
    )
  }

  renderGames = (lobbiesDataIndex) => {
    const { lobbiesData } = this.props;
    const { isMobile } = this.state;
    return (
          <LayoutGame
            {...this.props}
            lobbiesData={lobbiesData}
            lobbiesDataIndex={lobbiesDataIndex}
            pageHome={true}
            sectionType={'jackpot'}
            isMobile={isMobile}
            isSlide={true}
          />
    )
  }

  renderItem = () => {
    const { lobbiesData } = this.props;
    const { jackpotGames, isMobile } = this.state;
    const amount = jackpotGames[0].amount.EUR;
    const lobbiesDataIndex = findIndex(lobbiesData, e => e.slug.toLowerCase() === "jackpot-total-mrxbet")
    return (<div className='JackpotItem'>
      <div className='GirlBg'>
      <img src='/static/images/jackpotGirl2.png' />
      </div>
      <div className='Content'>
        <h2 className='Title'>{locale.t('currentJackpots')}</h2>
        <h2 className='totalAmount'>Є {this.formatAmount(amount)}</h2>
        {lobbiesDataIndex > -1 && this.renderGames(lobbiesDataIndex)}
        <button className='button buttonLogin mt-3' onClick={() => (window.location.href = "/casino?category=jackpot-games")} >{locale.t('allJackpots')}</button>
      </div>

    </div>)
  }

  render() {
    const { jackpotGames, isMobile } = this.state;

    if (jackpotGames === null || jackpotGames.length === 0) return null;
    return (
      <section className='TotalJackpot container-custom'>
        <h1 className='HeaderTItle'>{locale.t('jackpots')}</h1>
        {/* {isMobile?this.renderJackpots():this.renderDesktop()} */}
        {this.renderItem()}
      </section>
    );
  }
}

export default connect(null, null)(TotalJackpot);
