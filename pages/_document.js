// _document is only rendered on the server side and not on the client side
// Event handlers like onClick can't be added to this file

// ./pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  _renderTrackingAllPage = () =>{
    return (
      `
      <script type="text/javascript">
          window._adftrack = Array.isArray(window._adftrack) ? window._adftrack : (window._adftrack ? [window._adftrack] : []);
          window._adftrack.push({
              HttpHost: 'track.adform.net',
              pm: 2397507,
              divider: encodeURIComponent('|'),
              pagename: encodeURIComponent('retargeting')
          });
          (function () { var s = document.createElement('script'); s.type = 'text/javascript'; s.async = true; s.src = 'https://s2.adform.net/banners/scripts/st/trackpoint-async.js'; var x = document.getElementsByTagName('script')[0]; x.parentNode.insertBefore(s, x); })();

      </script>
      <noscript>
          <p style="margin:0;padding:0;border:0;">
              <img src="https://track.adform.net/Serving/TrackPoint/?pm=2397507&ADFPageName=retargeting&ADFdivider=|" width="1" height="1" alt="" />
          </p>
      </noscript>
      `
    )
  }

  render() {
    const { query } = this.props.__NEXT_DATA__

    return (
      <Html lang={query.lang || 'en'} data-theme="dark">
        <Head />
        <body className="custom-mb">
          <Main />
          <NextScript />
          {<div dangerouslySetInnerHTML={{ __html: this._renderTrackingAllPage() }}></div>}
        </body>
      </Html>
    );
  }
}

export default MyDocument;