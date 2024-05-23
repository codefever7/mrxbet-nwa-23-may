
import {
    SET_FAVORITES
  } from "../constants/types";
  
  const INITIAL_STATE = {
    favoritesList: {},
  };
  
  const applySetFavorites = (state, action) => ({
    ...state,
    favoritesList: action.active
  });

  
  function gameReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
      case SET_FAVORITES: {
        return applySetFavorites(state, action);
      }

      default: return state;
    }
  }
  
  export default gameReducer;