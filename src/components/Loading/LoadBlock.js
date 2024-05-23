import React, { Component } from 'react'
import isUndefined from 'lodash/isUndefined'
export class LoadBlock extends Component {
    state = {
        isOpen: false
    }
    isOpen = (evt) => {
        this.setState({ isOpen: evt })
    }
    componentWillUnmount(){
        this.setState({ isOpen: false })
    }
    render() {
        const { loadTrue } = this.props
        const { isOpen } = this.state
        const onOpen = !isUndefined(loadTrue) && loadTrue ? true : isOpen
        return (
            onOpen ?
                <div className="load-block">
                    <div className="page-load">
                        <i className="jb-icon sidemenu-pendingwithdrawals"/>
                    </div>
                </div>
                : null
        )
    }
}

export default LoadBlock
