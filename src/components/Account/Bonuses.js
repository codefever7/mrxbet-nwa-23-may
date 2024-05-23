import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { MESSAGEMODAL } from "../../constants/types"
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { getCookie, setCookie, replaceSpecialCharacters } from '../../../utils'
import UserService from '../../services/em/user'
import CasinoService from '../../services/em/casino'
import Moment from 'react-moment'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import LoadBlock from '../Loading/LoadBlock'
import map from 'lodash/map'
const locale = require('react-redux-i18n').I18n

export class Bonuses extends Component {
    constructor(props) {
        super(props)
        this.state = {
            validated_code: '',
            validated_fpp: '',
            code: '',
            bonuses: [],
            bonusesTitle: {
                name: "Bonus name",
                type: "Bonus type",
                amount: "Bonus amount",
                initialWagerRequirement: "Separate initial wager requirement",
                remainingWagerRequirement: "Remaining wager requirement",
                grantedDate: "Granted date",
                expiryDate: "Expiry date",
                status: "Status"
            },
            isMobile: false,
        }
    }
    componentDidMount() {
        const { isConnected } = this.props
        const decodedCookie = decodeURIComponent(replaceSpecialCharacters(document.cookie));
        const promotionRegister = getCookie('promotion-register', decodedCookie)
        window.addEventListener("resize", this.resize.bind(this));
        this.resize();
        this.loadBlock.isOpen(true)
        this.getBonuses()
        if (promotionRegister) {
            try {
                this.setState({ code: JSON.parse(promotionRegister).bonusCode })
            } catch (err) {
                setCookie('promotion-register', '', 7)
            }
        }
        if (isConnected) {
            this.getFPP()
        }
    }
    resize() {
        let mobile = (window.innerWidth <= 760);
        if (mobile !== this.state.isMobile) {
            this.setState({ isMobile: mobile});
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.isConnected !== this.props.isConnected) {
            if (nextProps.isConnected) {
                this.getFPP()
            }
        }
    }
    getFPP = () => {
        if (!this.props.isShowFPP) {
            CasinoService.getFrequentPlayerPoints().then((res) => {
                let totalClaim = 0

                if (res.points >= res.convertionMinClaimPoints) {
                    totalClaim = parseInt(res.points / res.convertionPoints)
                }
                let params = {
                    minimal: res.convertionMinClaimPoints,
                    total: `${totalClaim} ${res.convertionCurrency}`,
                    currentPoints: res.points,
                    currency: res.convertionCurrency,
                    amount: res.convertionAmount,
                    convert: res.convertionPoints
                }
                this.props.setShowFPP(params)
            })
        }
        this.loadBlock.isOpen(false)
    }
    getBonuses = () => {
        UserService.getGrantedBonuses({ skipRecords: 0, maxRecords: 999, type: '' }).then((res) => {
            if (Object.keys(res).length > 0 && res.totalRecords > 0) {
                let bonuses = []

                map(res.bonuses, (bonus, index) => {
                    if (bonus.status == 'active') {
                        bonuses.push({
                            bonusID: bonus.id,
                            name: bonus.name,
                            type: bonus.type,
                            amount: bonus.currency + " " + bonus.amount,
                            initialWagerRequirement: bonus.initialWagerRequirementCurrency + " " + bonus.initialWagerRequirementAmount,
                            remainingWagerRequirement: bonus.remainingWagerRequirementCurrency + " " + bonus.remainingWagerRequirementAmount,
                            grantedDate: bonus.grantedDate,
                            expiryDate: bonus.expiryDate,
                            status: bonus.status,
                        })
                    }
                })

                this.setState({
                    bonuses,
                    bonusesTitle: {
                        name: locale.t('name'),
                        type: locale.t('type'),
                        amount: locale.t('amount'),
                        initialWagerRequirement: locale.t('initialWagerRequirement'),
                        remainingWagerRequirement: locale.t('remainingWagerRequirement'),
                        grantedDate: locale.t('grantedDate'),
                        expiryDate: locale.t('expiryDate'),
                        status: locale.t('status'),
                    }
                })
            }
        }).catch((err) => {
            console.log("bonuses err", err);
        })
    }
    handleSubmitCode = (event) => {
        let form = event.target
        let e = form.elements

        if (form.checkValidity() === false) {
            this.setState({ validated_code: 'was-validated' })
            event.preventDefault();
            event.stopPropagation();
        } else {
            setCookie('promotion-register', '', 7)
            UserService.applyBonus({ bonusCode: e['code'].value }).then((res) => {
                const set = { messageTitle: locale.t('success'), messageDesc: '', messageDetail: '', messageType: 'success' }
                this.getBonuses()
                this.props.onSetMessageModal(set)
            }, (err) => {
                const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }

                this.props.onSetMessageModal(set)
            })

            event.preventDefault();
        }
    }
    handleSubmitFPP = (event) => {
        let form = event.target
        let e = form.elements

        CasinoService.claimFrequentPlayerPoints().then((res) => {
            let totalClaim = 0

            if (res.points >= res.convertionMinClaimPoints) {
                totalClaim = parseInt(res.points / res.convertionPoints)
            }

            let params = {
                minimal: res.convertionMinClaimPoints,
                total: `${totalClaim} ${res.convertionCurrency}`,
                currentPoints: res.points,
                currency: res.convertionCurrency,
                amount: res.convertionAmount,
                convert: res.convertionPoints
            }
            this.props.setShowFPP(params)
            this.getBonuses()

            const set = { messageTitle: locale.t('success'), messageDesc: locale.t('textClaimSuccess'), messageDetail: '', messageType: 'success' }

            this.props.onSetMessageModal(set)
        }).catch((err) => {
            const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }

            this.props.onSetMessageModal(set)
        })
        event.preventDefault();
    }
    handleValue = (e) => {
        this.setState({ [`${e.target.name}`]: e.target.value })
    }
    handleForfeit = (bonusID) => {
        UserService.forfeitBonus({ bonusID }).then((res) => {
            const set = { messageTitle: locale.t('success'), messageDesc: '', messageDetail: '', messageType: 'success' }
            this.getBonuses()
            this.props.onSetMessageModal(set)
        }).catch((err) => {
            const set = { messageTitle: locale.t('error'), messageDesc: err.desc, messageDetail: err.detail, messageType: 'error' }

            this.props.onSetMessageModal(set)
        })
    }
    _renderGrantedBonuses() {
        let { bonuses, bonusesTitle, isMobile } = this.state
        let listBonuses = []

        map(bonuses, (bonus, index) => {
            let i = 0
            listBonuses.push(

                <Col md={12} xs={12} className="layout" key={'col-' + index}>
                    <div className="bonus-box">
                        {/* <h2 className="bonus-title text-center pb-2">{locale.t('bonus')}</h2> */}
                        <Row>
                            {
                                map(bonus, (item, index) => {
                                    if (index == 'bonusID') {
                                        return null
                                    }else {
                                        let nameClass = 'item-right'
                                        if(i%2 == 0){
                                            nameClass = 'item-left'
                                        }
                                        i++;
                                        return (
                                            <Col xs={12} sm={6} key={'col' + index} className={`${nameClass}`}>
                                                <Row>
                                                    <Col xs={6} className=""><p>{bonusesTitle[index]}</p></Col>
                                                    <Col xs={6} className="text-right">
                                                        {
                                                            index != 'status' && index != 'expiryDate' && index != 'grantedDate' &&
                                                            <p>{item}</p>
                                                        }
                                                        {
                                                            (index == 'expiryDate' || index == 'grantedDate') &&
                                                            <Moment format="DD/MM/YYYY">{item}</Moment>
                                                        }
                                                        {
                                                            index == 'status' &&
                                                            <p className="bonus-status">{item}</p>
                                                        }
                                                    </Col>
                                                </Row>
                                            </Col>
                                        )
                                    }
                                    
                                })
                            }
                        </Row>
                        <Row>
                            <Col>
                                <Button className="btn-1 " type="button" onClick={() => this.handleForfeit(bonus.bonusID)}>
                                    <p className="pl-2 text-uppercase m-0 pr-2">{locale.t('forfeit')}</p>
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </Col>

            )
        })

        return listBonuses
    }
    render() {
        const { validated_code, validated_fpp, code, bonuses } = this.state
        const { currentPoints, minimal, currency, amount, convert, total } = this.props.fpp
        const { isShowFPP } = this.props

        return (
            <div className="bonuses">
                <div className="layout">
                    <Col md={12} xs={12} className="mb-2">
                        <p className="title-menu">{locale.t('activeBonus')}</p>
                    </Col>
                    {Object.keys(bonuses).length > 0 && this._renderGrantedBonuses()}
                </div>
                <Col md={12} xs={12} className="layout mt-2">
                    {Object.keys(bonuses).length < 1 && <div className="d-flex col-md-10 col-12 block">
                        <LazyLoadImage
                            src={'/static/images/i-yellow.png'}
                            alt={'Bonuses'}
                            className="img-fluid"
                            effect="blur"
                            visibleByDefault={true}
                        />
                        <p>{locale.t('activeBonusDesc')}</p>
                    </div>}
                    <p className="text-detail">{locale.t('activeBonusCode')}</p>
                    <Form noValidate validated={validated_code} onSubmit={(e) => this.handleSubmitCode(e)}>
                        <Form.Group as={Col} md={6} xs={12} className="p-0 mb-0">
                            <Form.Label>{`${locale.t('bonusCode')} :`}</Form.Label>
                        </Form.Group>
                        <Form.Row>
                            <Form.Group as={Col} md={6} xs={12}>
                                <Form.Control className="input-custom" required type="text" name="code" value={code} onChange={(e) => this.handleValue(e)} />
                            </Form.Group>
                            <Form.Group as={Col} md={6} xs={12}>
                                <Button className="btn-4" type="submit">
                                    <p className="pl-2 text-uppercase m-0 pr-2">{locale.t('submit')}</p>
                                </Button>
                            </Form.Group>
                        </Form.Row>
                    </Form>
                </Col>
                <Col md={12} xs={12} className="layout mt-2">
                    <LoadBlock ref={ref => this.loadBlock = ref} />
                    <p className="text-title">{locale.t('casinoWalletFPP')}</p>
                    {isShowFPP && <Fragment>
                        <div className="d-flex col-md-10 col-12 block">
                            <LazyLoadImage
                                src={'/static/images/i-yellow.png'}
                                alt={'Bonuses'}
                                className="img-fluid"
                                effect="blur"
                                visibleByDefault={true}
                            />
                            <p className="text-active-fpp">{locale.t('activeBonusFPP', { minimal, currency, amount, convert })}</p>
                        </div>
                        <Form noValidate validated={validated_fpp} className="mt-2" onSubmit={(e) => this.handleSubmitFPP(e)}>
                            <Form.Group as={Col} md={6} xs={12} className="p-0">
                                <Form.Label>{`${locale.t('currentpoints')} :`}</Form.Label>
                                <Form.Control className="input-custom" required type="text" name="currentPoints" value={currentPoints} disabled />
                            </Form.Group>
                            <Form.Group as={Col} md={6} xs={12} className="p-0">
                                <Form.Label>{`${locale.t('minimalPointsToClaim')} :`}</Form.Label>
                                <Form.Control className="input-custom" required type="text" name="minimal" value={minimal} disabled />
                            </Form.Group>
                            <Form.Group as={Col} md={6} xs={12} className="p-0">
                                <Form.Label>{`${locale.t('totalCasinoFPPpoints')} :`}</Form.Label>
                                <Form.Control className="input-custom" required type="text" name="total" value={total} disabled />
                            </Form.Group>
                            <Form.Group as={Col} md={6} xs={12} className="p-0">
                                <Button className="btn-4" type="submit">
                                    <p className="pl-2 text-uppercase m-0 pr-2">{locale.t('submit')}</p>
                                </Button>
                            </Form.Group>
                            {/* <Form.Group as={Col} md={6} xs={12} className="p-0">
                                    { currentPoints >= minimal ?
                                        <Button className="btn-3" type="submit">
                                            <p className="pl-2 text-uppercase m-0 pr-2">{locale.t('submit')}</p>
                                        </Button>
                                        :
                                        <Button className="btn-3" disabled>
                                            <p className="pl-2 text-uppercase m-0 pr-2">{locale.t('submit')}</p>
                                        </Button>
                                    }
                                </Form.Group> */}
                        </Form>
                    </Fragment>
                    }
                </Col>
            </div>
        )
    }
}
const mapStateToProps = (state) => ({
    isConnected: state.EM.isConnected,
    session: state.sessionState,
})
const mapDispatchToProps = (dispatch) => ({
    onSetMessageModal: (active) => dispatch({ type: MESSAGEMODAL, active })
})
export default connect(mapStateToProps, mapDispatchToProps)(Bonuses)