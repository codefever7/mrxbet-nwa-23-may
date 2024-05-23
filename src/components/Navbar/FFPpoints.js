import React, { useEffect, useState } from 'react'

import CasinoService from '../../services/em/casino'

const locale = require('react-redux-i18n').I18n

const FFPpoints = (props) => {

    const { isConnected } = props

    const [pointsFFP, setPointsFFP] = useState(0)

    useEffect(() => {
        if(isConnected){
            getFPP()
        }
    }, [isConnected])

    const getFPP = async () => {
        try {
            const fpp = await  CasinoService.getFrequentPlayerPoints()
            if(fpp && fpp.points){
                setPointsFFP(fpp.points)
            }
        } catch (error) {
            console.log(error)
        }

    }

    return (
        <div className="FFPpoints">
            <div className="point">
                <div>{locale.t('FFPpoints')}</div>
                <div>{pointsFFP}</div>
            </div>
        </div>
    )
}

export default FFPpoints