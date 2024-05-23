import React, { Component } from 'react';
import classNames from 'classnames';
import isEqual from "lodash/isEqual";

export default class SetInnerHtml extends Component {

  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props, nextProps);
  }

  render() {
    const { tagName, htmlProps, innerHtml } = this.props;
    const TagName = tagName || 'div';
    const newHtmlProps = Object.assign({}, htmlProps);
    newHtmlProps.className = classNames(newHtmlProps.className, {
      // CustomHtml: true,
    });

    return (
      <TagName
        {...newHtmlProps}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: innerHtml }}
      />
    );
  }
}
