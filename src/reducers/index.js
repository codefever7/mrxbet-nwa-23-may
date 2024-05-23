import { combineReducers } from 'redux'
import { i18nReducer } from 'react-redux-i18n'
import emReducer from './em'
import sessionReducer from './session'
import modalsReducer from './modals'
import gameReducer from './game'
import casino from './casino'
const rootReducer = combineReducers({
  i18n: i18nReducer,
  EM: emReducer,
  sessionState: sessionReducer,
  modalsState: modalsReducer,
  gameState: gameReducer,
  casino,
});

export default rootReducer;