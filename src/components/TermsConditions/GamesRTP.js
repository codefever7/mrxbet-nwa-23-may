import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import CasinoService from '../../services/em/casino'
import * as casinoParams from '../../constants/casinoParams'
import values from 'lodash/values';
import orderBy from 'lodash/orderBy';
import * as routes from '../../constants/routes'

const locale = require('react-redux-i18n').I18n

class GamesRTP extends Component {

    constructor(props) {
        super(props);
        this.state= {
            pageIndex:1,
            pageSize:100,
            gamesFirst: [],
            gamesSecond: [],
            order:'desc',
            orderByField: 'theoreticalPayOut',
            totalPageCount:0
        }
    }

    componentDidMount(){
        if(this.props.isConnected){
            this.getGames(this.state.pageIndex, this.state.pageSize)
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const { isConnected } = this.props
        if (nextProps.isConnected !== isConnected) {
          if(!isConnected){
            this.getGames(this.state.pageIndex, this.state.pageSize)
          }
        }
      }

    getGames = (pageIndex, pageSize) => {
        let {gamesFirst, gamesSecond} = this.state;
        let params =  casinoParams.getGamesParams
        params.pageIndex = pageIndex
        params.pageSize = pageSize
        params.specificExportFields = ["vendorLogo"]
        params.expectedFields = casinoParams.FIELDS.TheoreticalPayOut + casinoParams.FIELDS.Slug + casinoParams.FIELDS.Vendor + casinoParams.FIELDS.Name 
        params.sortFields = [
            {
                "field": casinoParams.FIELDS.TheoreticalPayOut,
                "order": "DESC"
            }
        ]
        CasinoService.getGames(params).then((res) => {
            if(res){
                const games = values(res.games)
                let half_length = Math.floor(games.length / 2);  
                let firstHalf = values(res.games).splice(0,half_length);
                let secondHalf = values(res.games).splice(half_length, games.length);
                this.setState({
                    gamesFirst : [...gamesFirst, ...firstHalf],
                    gamesSecond : [...gamesSecond, ...secondHalf],
                    totalPageCount: res.totalPageCount,
                    pageIndex: pageIndex+1
                },()=>{
                    let nextPageIndex = pageIndex + 1
                    this.getGames(nextPageIndex, pageSize)
                })
            }
        })
    }

    filterChange =(orderByField)=>{
        this.setState({
            orderByField,
            order: this.state.order=='desc'?'asc':'desc'
        })
    }

    render() {
        const {gamesFirst, gamesSecond, order, orderByField, totalPageCount, pageIndex} = this.state;
        let dataFirst = orderBy(gamesFirst, [orderByField], [order]);
        let dataLeft = orderBy(gamesSecond, [orderByField], [order]);
        let boxFirst = dataFirst.length ? dataFirst.map((item,index)=>{
            return(
                <tr key={index}>
                    <td className="first">
                        {item.vendorLogo.length ? <img className="jp-image" src={item.vendorLogo} alt={item.vendor}/> : null}
                    </td>
                    <td><a href={`${routes.casinoGamePlay}${item.slug}`}>{item.name}</a></td>
                    <td className="last">{parseFloat(item.theoreticalPayOut * 100).toFixed(2)}%</td>
                </tr>
            )
          }) : ''

          let boxSecond = dataLeft.length ? dataLeft.map((item,index)=>{
            return(
                <tr key={index}>
                    <td className="first">
                        {item.vendorLogo.length ? <img className="jp-image" src={item.vendorLogo} alt={item.vendor}/> : null}
                    </td>
                    <td><a href={`${routes.casinoGamePlay}${item.slug}`}>{item.name}</a></td>
                    <td className="last">{parseFloat(item.theoreticalPayOut * 100).toFixed(2)}%</td>
                </tr>
            )
          }) : ''
          let percentage = (100 / totalPageCount) * pageIndex
        return (
            <Fragment>
                {
                percentage<100?
                <div className="progress" style={{marginBottom:10}}>
                    <div className="progress-bar progress-bar-striped bg-success" role="progressbar" style={{width: `${percentage}%`}} aria-valuenow={percentage} aria-valuemin="0" aria-valuemax="100">{`${parseInt(percentage)}%`}</div>
                </div>
                :null
                }
            <Row>
                <Col lg={6} md={6} sm={12} className="table-first">
                    <Table className="table-bordered fixed_header">
                        <thead className="fixedHeader">
                            <tr>
                                <th className={`first ${(orderByField=='vendor'?`active ${order=='desc'?'asc':'desc'}`:'')}`} onClick={()=>this.filterChange('vendor')}></th>
                                <th className={`${(orderByField=='name'?`active ${order=='desc'?'asc':'desc'}`:'')}`} onClick={()=>this.filterChange('name')}>{locale.t('gameName')}</th>
                                <th className={`last ${(orderByField=='theoreticalPayOut'?`active ${order=='desc'?'asc':'desc'}`:'')}`} onClick={()=>this.filterChange('theoreticalPayOut')}>{locale.t('theoreticalPayOut')}</th>
                            </tr>
                        </thead>
                        {
                        boxFirst !='' ?<tbody>
                            {boxFirst}
                        </tbody>
                        :null
                        }
                    </Table>
                </Col>
                <Col lg={6} md={6} sm={12} className="table-second">
                    <Table className="table-bordered fixed_header">
                        <thead className="fixedHeader">
                            <tr>
                                <th className={`first ${(orderByField=='vendor'?`active ${order=='desc'?'asc':'desc'}`:'')}`} onClick={()=>this.filterChange('vendor')}></th>
                                <th className={`${(orderByField=='name'?`active ${order=='desc'?'asc':'desc'}`:'')}`} onClick={()=>this.filterChange('name')}>{locale.t('gameName')}</th>
                                <th className={`last ${(orderByField=='theoreticalPayOut'?`active ${order=='desc'?'asc':'desc'}`:'')}`} onClick={()=>this.filterChange('theoreticalPayOut')}>{locale.t('theoreticalPayOut')}</th>
                            </tr>
                        </thead>
                        {
                        boxSecond !='' ?<tbody>
                            {boxSecond}
                        </tbody>
                        :null
                        }
                    </Table>
                </Col>
            </Row>
            </Fragment>
        )
    }
}

const mapStateToProps = (state) => ({
    isConnected: state.EM.isConnected,
    languagesActive: state.sessionState.languagesActive
});

export default connect(
    mapStateToProps,
    null
)(GamesRTP);
