const config = require(`../../config`).config;
import {
  GETGAMECATEGORIES,
  SESSION,
  ISCONNECTED,
  CURRENCY
} from "../constants/types";

const INITIAL_STATE = {
  isConnected : false,
  session: null,
  categories : [],
  currency : config.currency,
};

const applySetCategories = (state, action) => ({
  ...state,
  categories: action.categories
});

const applySetSession = (state, action) => ({
  ...state,
  session: action.session
});

const applySetConnected = (state, action) => ({
  ...state,
  isConnected: action.isConnected
});

const applySetCurrency = (state, action) => ({
  ...state,
  currency: action.currency
});

function emReducer(state = INITIAL_STATE, action) {
  switch(action.type) {
    case SESSION : {
      return applySetSession(state, action);
    }
    case ISCONNECTED : {
      return applySetConnected(state, action);
    }
    case GETGAMECATEGORIES : {
      return applySetCategories(state, action);
    }
    case CURRENCY : {
      return applySetCurrency(state, action);
    }
    default : return state;
  }
}

export default emReducer;