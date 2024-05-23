import React, { Component } from 'react'
import { connect } from 'react-redux'
import UserService from '../../services/em/user'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Container from 'react-bootstrap/Container'
import map from 'lodash/map'
import LoadBlock from '../Loading/LoadBlock'
const locale = require('react-redux-i18n').I18n

class RealityCheck extends Component {
    constructor(props) {
        super(props);
        this.state = {
            availableValues: ["0", "30", "60", "90", "120", "180", "240", "300", "360"],
            availableChecked: ""
        }
    }
    componentDidMount () {
        Promise.all([
            UserService.getRealityCheckList(),
            UserService.getRealityCheck()
        ]).then(([list, item]) => {
            this.setState({
                availableValues: list.availableValues,
                availableChecked: item.value
            })
        }).catch((err) => console.log('err', err))
    }
    handleSubmit(e) {
        e.preventDefault();
        this.loadBlock.isOpen(true)
        
        let parameters = { value: this.state.availableChecked}
        
        UserService.setRealityCheck(parameters).then(
            (result) => {
                this.loadBlock.isOpen(false)
            }
            , (err) => {
                this.loadBlock.isOpen(false)
                console.log('err', err)
            }
        );
        
    }
    _renderCheckBox = () => {
        let { availableValues, availableChecked } = this.state
        let listItem = []

        map(availableValues, (item, index) => {
            listItem.push(
                <div className="reality-radio radio" key={`reality-${item}`}>
                    <Form.Check
                        className="radio-custom"
                        checked={availableChecked == item ? true : false} 
                        value={item}
                        label={`${item} minutes`}
                        onChange={(evt) => this.setState({ availableChecked: evt.target.value })} 
                        type="radio"
                    />
                </div>
            )
        })

        return (
            <div className="reality-list">
                {listItem}
            </div>
        )
    }
    render() {        
        return (
            <Container className="reality-check-container">
                <Row>
                    <Col md={12} xs={12}>
                        <h2 className="title-middle">{locale.t('realityCheck')}</h2>
                    </Col>
                </Row>
                <Row>
                    <Form onSubmit={(e) => this.handleSubmit(e)}>
                    <div className="jumbotron jumbotron-fluid">
                        <div className="reality-note">
                            <p>{locale.t('realityCheckDesc')}</p>
                        </div>
                        <div className="reality-check">
                            {this._renderCheckBox()}
                            <Button className="btn-3" type="submit">
                                <p className="pl-2 text-uppercase m-0 pr-2">{locale.t('submit')}</p>
                            </Button>
                        </div>
                    </div>
                    </Form>
                </Row>
                <LoadBlock ref={ref => this.loadBlock = ref} />
            </Container>
        )
    }
}
export default connect(null, null)(RealityCheck);