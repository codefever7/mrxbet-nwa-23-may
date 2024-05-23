import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import CasinoGames from '../CasinoGames'
import {
    MESSAGEMODAL
} from "../../constants/types";

import isUndefined from 'lodash/isUndefined'
import includes from 'lodash/includes'
import findIndex from 'lodash/findIndex'

export class LayoutGame extends Component {
    constructor(props) {
        super(props)
        this.state = {
            lobbiesData: []
        }
    }

    render() {
        const { lobbiesTypeName,lobbiesData,lobbiesDataIndex, sectionType, urlLink } = this.props
        let layoutRender = null
        if (!isUndefined(lobbiesTypeName) && lobbiesTypeName === 'custom') {
            let mostPopularIndex = findIndex(lobbiesData, o=> includes(o.datasourceNameCasino,'recommended'))
            let gameIndex = findIndex(lobbiesData, o=> !includes(o.datasourceNameCasino,'recommended'))
            layoutRender = !isUndefined(lobbiesData[gameIndex]) ? <CasinoGames {...this.props} lobbiesData={lobbiesData[gameIndex]} typeHide={true} >{!isUndefined(lobbiesData[mostPopularIndex]) ? <CasinoGames {...this.props} lobbiesData={lobbiesData[mostPopularIndex]} /> : null}</CasinoGames> :null
        } else {
            if (!isUndefined(lobbiesData[lobbiesDataIndex])) {
                layoutRender = <CasinoGames {...this.props} lobbiesData={lobbiesData[lobbiesDataIndex]} sectionType={sectionType} urlLink={urlLink} />
            }else{
                layoutRender = lobbiesData.length ? lobbiesData.map(item => <CasinoGames key={item.slug} {...this.props} lobbiesData={item} sectionType={sectionType} urlLink={urlLink} />) : null
            }
        }
        return (
            <Fragment>
                {
                    layoutRender
                }
            </Fragment>
        )
    }
}

const mapDispatchToProps = (dispatch) => ({
    onSetMessageModal: (active) => dispatch({ type: MESSAGEMODAL, active })
})

export default connect(null, mapDispatchToProps)(LayoutGame)
