import React from 'react';
import SetInnerHtml from './set-inner-html';
import { isClientSide, strHash } from '../../utils/helpers';

const regExps = {
  src: /<script.*?src=["']?([^"'\s]+)["']?\s*/g,
  inline: /<script\b[^>]*>([\s\S]*?)<\/script>/gm,
};

const cachedIsClientSide = isClientSide();
const scriptIdPrefix = 'er_';
const htmlIdPrefix = 'ch_';
const erScripts = [];
const chHtml = {};

if (cachedIsClientSide) {
  const html = document.querySelectorAll(`span[id^="${htmlIdPrefix}"]`);
  for (let i = 0; i < html.length; i++) {
    chHtml[html[i].getAttribute('id')] = html[i].innerHTML;
  }

  const scripts = document.querySelectorAll(`script[id^="${scriptIdPrefix}"]`);
  for (let i = 0; i < scripts.length; i++) {
    erScripts.push(scripts[i].getAttribute('id'));
  }
}

export default class SetInnerScript extends React.Component {

  constructor(props) {
    super(props);

    const htmlId = `${htmlIdPrefix}${strHash(props.html)}`;

    this.state = {
      output: '',
      htmlId,
    };

    if (cachedIsClientSide) {
      if (chHtml[htmlId]) {
        this.state.output = chHtml[htmlId];
        delete chHtml[htmlId];
      }
    } else {
      this.state.output = this.loadScripts();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { html } = this.props;
    const { output } = this.state;
    return html !== nextProps.html || output !== nextState.output;
  }

  componentDidMount() {
    const { output } = this.state;

    if (!output) {
      this.setState({ output: this.loadScripts() });
    }
  }

  componentDidUpdate(oldProps) {
    const { html } = this.props;

    if (html !== oldProps.html) {
      this.scriptContainer.innerHTML = '';
      this.setState({ 
        output: this.loadScripts(),
        htmlId: `${htmlIdPrefix}${strHash(html)}`,
      });
    }
  }

  loadScripts() {
    const { html } = this.props;

    if (typeof html === 'string') {
      let output = this.findScript('src', html);
      output += this.findScript('inline', html);

      return output ? `${html.replace(regExps.inline, '')}${output}` : html;
    }

    return html;
  }

  findScript(type, html) {
    const regExp = regExps[type];
    let match = regExp.exec(html);
    let output = '';

    while (match) {
      const [, str] = match;
      if (str) {
        output += this.createScript(str, type);
      }

      match = regExp.exec(html);
    }

    return output;
  }

  createScript(str, type) {
    let output = '';
    const hashStr = strHash(str);
    const scriptId = `${scriptIdPrefix}${hashStr}`;

    if (cachedIsClientSide) {
      if (erScripts.indexOf(scriptId) === -1) {
        const script = document.createElement('script');
        script.setAttribute('id', scriptId);

        if (type === 'src') {
          script.setAttribute('src', str);
        } else {
          script.innerHTML = str;
        }

        this.scriptContainer.appendChild(script);
        output = ' ';
      }
    } else if (type === 'src') {
      output = `<script id="${scriptId}" src="${str}" async></script>`;
    } else {
      output = `<script id="${scriptId}">${str}</script>`;
    }

    return output;
  }

  getRef = (el) => {
    this.scriptContainer = el;
  };

  render() {
    const { output, htmlId } = this.state;

    return (
      <React.Fragment>
        <SetInnerHtml tagName="span" innerHtml={output} htmlProps={{ id: htmlId }} />
        <span ref={this.getRef} />
      </React.Fragment>
    );
  }
}
