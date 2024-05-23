import { createStore , applyMiddleware} from 'redux'
import thunkMiddleware from 'redux-thunk'
import rootReducer from '../reducers'
import en from "../../locales/en.json"
import de from "../../locales/de.json"
import es from "../../locales/es.json"
import fr from "../../locales/fr.json"
import it from "../../locales/it.json"
import ru from "../../locales/ru.json"
import sv from "../../locales/sv.json"
import pt from "../../locales/pt-pt.json"
import tr from "../../locales/tr.json"
import br from "../../locales/pt-br.json"
import { loadTranslations, setLocale, syncTranslationWithStore } from 'react-redux-i18n'
const translationsObject = {
  en,
  de,
  es,
  fr,
  it,
  ru,
  sv,
  pt,
  tr,
  br
};
const initStore = () => {
  const store = createStore(rootReducer,
    applyMiddleware(
    thunkMiddleware
  ));

  syncTranslationWithStore(store)
  store.dispatch(loadTranslations(translationsObject));
  store.dispatch(setLocale('en'));
  return store;
};

export default initStore;