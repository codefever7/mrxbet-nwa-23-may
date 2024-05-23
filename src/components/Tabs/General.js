import React, { Component } from 'react';
import { connect } from 'react-redux';

class General extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div dangerouslySetInnerHTML={{ __html: this.props.pageData.content }} />
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
)(General);
