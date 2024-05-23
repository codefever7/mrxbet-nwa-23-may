import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import UserService from '../../services/em/user';
import * as sportsParams from '../../constants/sportsParams'
import find from 'lodash/find';
import { DEFAULT_LIMIT_LIVESPORT_SLIDE } from '../../../utils/CONSTANTS';
import CarouselSlider from '../CarouselSlider';
import Moment from 'react-moment'
import moment from 'moment'
const locale = require("react-redux-i18n").I18n;

const ItemPerSlide = 10;

class LastestBet extends Component {
    constructor(props) {
        super(props);
        this.state = {
            transactions: [],
            fomatDevice: "pc",
        }
    }


    componentDidMount() {
        const { isLogin } = this.props;
        if (isLogin) {
            this.getTransactionGamblig();
        }
        window.addEventListener("resize", this.resize.bind(this));
        this.resize();
    }

    componentDidUpdate(prevProps){
        const { isLogin } = this.props;
        if(prevProps.isLogin !== isLogin && isLogin){
            this.getTransactionGamblig();
        }
    }

    resize() {
        let mobile = (innerWidth < 768);
        if (mobile !== this.state.isMobile) {
            this.setState({ isMobile: mobile });
        }
    }

    getTransactionGamblig = async () => {
        try {
            let params = {
                type: "Gambling",
                startTime: moment.utc(new Date()).subtract(7, "days").startOf('day').toISOString(),
                endTime: moment.utc(new Date()).endOf('day').toISOString(),
                pageIndex: 1,
                pageSize: 40
            };

            //Must change to NWA: v1/player/{playerId}/transactions/wagering
            const transactions = await UserService.getTransactionHistory(params);
            if (transactions.totalRecordCount > 0) {
                this.setState({ transactions: transactions.transactions });
            }
        } catch (error) {
        }

    }

    renderItems = (item, index) => {
        const { userInfo } = this.props;

        return <div className='TransactionItems'>
            <div className='GameName'>{item.description}</div>
            <div className='PlayerName'>{userInfo.username}</div>
            <div className='Time'><Moment format="DD-MM-YYYY HH:mm" >{new Date(item.time + 'Z')}</Moment></div>
            <div className='Bet'>
                {(item.credit !== undefined) && (
                    <Fragment>
                        <span className='Credit'>{(item.credit.currency === "EUR") ? '€' : item.credit.currency}</span> <span>{item.credit.amount}</span>
                    </Fragment>
                )}
                {
                    (item.debit !== undefined) && (
                        <Fragment>
                            <span className='Debit'>{(item.debit.currency === "EUR") ? '€' : item.debit.currency}</span> <span>{item.debit.amount}</span>
                        </Fragment>
                    )
                }
            </div>
            <div className='Status'>
                {(item.credit !== undefined) && <span className='Credit'>{locale.t('win')}</span>}
                {(item.debit !== undefined) && <span className='Debit'>{locale.t('lose')}</span>}
            </div>
        </div>;
    }

    renderGroupTransactions = () => {
        const { transactions } = this.state;
        const countGroup = transactions.length / ItemPerSlide;

        let item = [];
        for (let i = 0; i < countGroup; i++) {
            const start = i * ItemPerSlide;
            const end = start + ItemPerSlide;
            item.push(
                <div key={`LastestBetG${i}`} className={`TransactionLists`}>
                    <div className='TransactionItems'>
                        <div className='GameName'>Game</div>
                        <div className='PlayerName'>Player</div>
                        <div className='Time'>Time</div>
                        <div className='Bet'>Bet</div>
                        <div className='Status'>Status</div>
                    </div>
                    {transactions.slice(start, end).map(this.renderItems)}
                </div>
            )
        }

        return (
            <CarouselSlider
                id='LastestSection'
                children={item}
                limitGamesPerSlide={ItemPerSlide}
                slideContentCount={countGroup}
                showArrow={true}
                dotName='LestestBetDots'
                title={locale.t('lastestbet').toUpperCase()} />
        );
    }

    renderMobileTransaction = () => {
        const { transactions } = this.state;
        const { userInfo } = this.props;
        const title = locale.t('lastestbet').toUpperCase();
        const titleSplit = title.split(' ');
        const titleFirst = titleSplit[0];
        let titleSeconde = ""
        if (titleSplit.length >= 2) {
            titleSeconde = titleSplit.slice(1).join(" ");
        }

        let item = [];
        transactions.map((res, index) => {
            item.push(
                <div className='TransactionItems'>
                    <div className='ContentName'>
                        <span>{userInfo.username}</span>
                        <span><Moment format="DD-MM-YYYY HH:mm" >{new Date(res.time + 'Z')}</Moment></span>
                    </div>
                    <div className='ContentGameName'>
                        <span>{res.description}</span>
                        {(res.credit !== undefined) && (
                            <Fragment>
                                <span className='Credit'>{(res.credit.currency === "EUR") ? '€' : res.credit.currency} {res.credit.amount}</span>
                            </Fragment>
                        )}
                        {
                            (res.debit !== undefined) && (
                                <Fragment>
                                    <span className='Debit'>{(res.debit.currency === "EUR") ? '€' : res.debit.currency} {res.debit.amount}</span>
                                </Fragment>
                            )
                        }
                    </div>
                </div>
            );
        })

        return (
            <Fragment>
                <div className='MobileTitle'><span>{titleFirst} </span><span>{titleSeconde}</span></div>
                <div key={`LastestBetGMobile`} className={`TransactionLists`}>
                    {item}
                </div>
            </Fragment>
        );
    }

    render() {
        const { isLogin } = this.props;
        const { transactions, isMobile } = this.state;
        
        if (!isLogin || transactions.length === 0) return null;

        return (
            <section className={`LastestBets container-custom`} >
                {isMobile ? this.renderMobileTransaction() : this.renderGroupTransactions()}
            </section>
        )
    }
}
const mapStateToProps = (state) => {
    const {
        sessionState: { isLogin, userInfo }
    } = state;

    return {
        isLogin,
        userInfo,
    };
};
export default connect(mapStateToProps, null)(LastestBet);