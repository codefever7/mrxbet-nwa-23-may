import withRedux from "next-redux-wrapper";
import initStore from "../src/store";
import { Provider } from "react-redux";
import App from "next/app";
import "../styles/core/_main.scss";
import "../styles/components/_winners.scss";
import "../styles/components/_jackpots.scss";
const config = require(`../config`).config;
import EMService from "../src/services/em";
import UserService from "../src/services/em/user";
import { ISCONNECTED, CURRENCY, CURRENT_COUNTRY } from "../src/constants/types";
import WPService from "../services";
import { loadTranslations, setLocale } from "react-redux-i18n";
import { setCookie, getCookie } from "../utils";
import isEmpty from "lodash/isEmpty";
import find from "lodash/find";
import includes from "lodash/includes";
import isUndefined from "lodash/isUndefined";

class index extends App {
  constructor(props) {
    super(props);
  }
  // Create a connection
  onConnect() {
    const { store } = this.props;
    const cid = localStorage.getItem("cid");
    const queryString = !isEmpty(cid) ? `?cid=${encodeURIComponent(cid)}` : "";
    let endpointURL = `wss://api.${window.location.hostname
      .replace("www.", "")
      .replace("preprod.", "")}/v2`;
    if (config.em.url.includes("stage")) {
      endpointURL = config.em.url;
    }
    const connection = new autobahn.Connection({
      transports: [
        {
          type: "websocket",
          url: `${endpointURL}${queryString}`,
          max_retries: 3,
        },
      ],
      realm: config.em.realm,
    });
    connection.onopen = (session) => {
      EMService.setSession(session, true);
      store.dispatch({
        type: ISCONNECTED,
        isConnected: true,
      });

      UserService.getClientIdentity().then((res) => {
        localStorage.setItem("cid", res.cid);
      });

      /** getCountries*/
      UserService.getCountries({
        expectRegions: true,
        excludeDenyRegistrationCountry: true,
      }).then((result) => {
        let currency = config.currency;
        if (result) {
          let found = find(
            result.countries,
            (o) => o.code == result.currentIPCountry
          );
          if (found) {
            currency = found.currency;
          }
        }
        store.dispatch({
          type: CURRENCY,
          currency,
        });
        store.dispatch({
          type: CURRENT_COUNTRY,
          currentCountry: result.currentIPCountry,
        });
      });
    };
    connection.onclose = (reason, details) => {
      EMService.setSession(null, false);
      store.dispatch({
        type: ISCONNECTED,
        isConnected: false,
      });
    };
    connection.open();
  }

  async onLoadTheme() {
    try {
      const theme = localStorage.getItem("theme-html");
      if (theme) {
        document.querySelector("html").setAttribute("data-theme", theme);
        // window.matchMedia("(prefers-color-scheme: dark)");
      } else {
        localStorage.setItem("theme-html", "dark");
      }
    } catch (error) {
      console.log("error onLoadTheme ==>", error);
    }
  }

  loadScript() {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "/static/libs/autobahn.min.js";
      script.onload = () => resolve();
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });
  }

  componentDidMount() {
    const { store, pageProps } = this.props;

    this.loadScript()
      .then(() => {
        this.onConnect();
        // const sentryScript = document.createElement("script");
        // sentryScript.src =
        //   "https://js.sentry-cdn.com/4e0903946519cda90f6cf75845d45caf.min.js";
        // sentryScript.crossOrigin = "anonymous";
        // sentryScript.async = true;
        // document.body.appendChild(sentryScript);
      })
      .catch((err) => {
        console.log("err ", err);
      });

    WPService.setStoreData(pageProps);
    let lang = pageProps.lang;
    if (!isUndefined(lang) && lang !== "undefined") {
      setCookie("lang", lang, 375);
    } else {
      lang = "en";
      setCookie("lang", lang, 375);
    }
    WPService.setLang(lang);
    WPService.fetchBlockCountries(lang);
    if (lang.indexOf("-") > -1) {
      lang = lang.split("-").pop();
    }
    store.dispatch(setLocale(lang));
    const scriptGA = document.createElement("script");
    const scriptGACode = document.createElement("script");
    scriptGA.async = true;
    scriptGA.src = `https://www.googletagmanager.com/gtag/js?id=${config.gtag}`;
    scriptGACode.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${config.gtag}');
      `;
    document.body.appendChild(scriptGA);
    document.body.appendChild(scriptGACode);
    setTimeout(() => {
      this.onLoadTheme();
    }, 1000);
  }
  render() {
    const { Component, pageProps, store } = this.props;
    return (
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    );
  }
}

export default withRedux(initStore)(index);
