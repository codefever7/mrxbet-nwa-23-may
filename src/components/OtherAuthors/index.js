
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Media from 'react-bootstrap/Media'
import Picture from '../Picture'
import {overrideLink } from '../../../utils'
class OtherAuthor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            relatedPosts: props.relatedPosts
        }
    }

    render() {
        const { relatedPosts } = this.state
        let relatedPostsTmp = JSON.parse(JSON.stringify(relatedPosts))
        let listItem = []

        relatedPostsTmp.map((res, index) => {
            let image = {}
            let goTo = overrideLink(res.link)
            image = res.image
            image.alt = res.alt

            listItem.push(
                <Media as="li" key={"li" + index}>
                    <Picture item={image}/>
                    <Media.Body>
                        <a href={goTo} dangerouslySetInnerHTML={{ __html: res.title }}/>
                    </Media.Body>
                </Media>
            )
        })

        return (
            <div className="ohther-author">
                <ul className="list-unstyled">
                    {listItem}
                </ul>
            </div>
        )
    }
}

export default connect(null, null)(OtherAuthor);