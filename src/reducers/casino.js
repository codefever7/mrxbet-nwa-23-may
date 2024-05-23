import update from 'immutability-helper';
import {
  SET_CASINOGAMES,
  SET_CASINOGAMES_PENDING,
  SET_CASINOGAMESALL,
  SET_CASINOGAMESALL_PENDING,
  SET_CASINOCATEGORY_ACTIVED,
  SET_CASINOGAME_SEARCH,
  SET_CASINOGAME_SEARCH_PENDING,
  SET_CASINOGAMES_MODAL,
  SET_CASINOGAMES_MODAL_PENDING,
  SET_CASINOGAMESALL_MODAL,
  SET_CASINOGAMESALL_MODAL_PENDING,
  SET_LASTPLAYED,
  SET_LASTPLAYED_PENDING,
  SET_ALL_VENDOR,
} from "../constants/casinoParams";

const defaultState = {
  casinoGames: {},
  allGames: [],
  filterCategory: {},
  casinoGamesSearch: {},
  casinoGamesModal: {},
  allGamesModal: [],
  lastPlayedGames: [],
  allVendors: [],
};

// const setGames = (state, action) => ({
//   ...state,
//   casinoGames: action.active
// });


function sessionReducer(state = defaultState, action) {
  switch (action.type) {
    case SET_CASINOGAMES: {
      const { categoryID, result } = action.active;
      return update(state, {
        casinoGames: {
          [`${categoryID}`]: {
            $set: {
              data: result.games,
              pending: false
            },
          },
        },
      });
    }
    case SET_CASINOGAMES_PENDING: {
      const { categoryID } = action.active;
      return update(state, {
        casinoGames: {
          [`${categoryID}`]: {
            $merge: {
              pending: true
            },
          },
        },
      });
    }
    case SET_CASINOGAMES_MODAL: {
      const { categoryID, result } = action.active;
      return update(state, {
        casinoGamesModal: {
          [`${categoryID}`]: {
            $set: {
              data: result.games,
              pending: false
            },
          },
        },
      });
    }
    case SET_CASINOGAMES_MODAL_PENDING: {
      const { categoryID } = action.active;
      return update(state, {
        casinoGamesModal: {
          [`${categoryID}`]: {
            $merge: {
              pending: true
            },
          },
        },
      });
    }
    case SET_CASINOGAMESALL: {
      const { result, page } = action.active;
      return update(state, {
        allGames: {
          [`${page}`]: {
            $set: {
              data: result,
              pending: false
            },
          },
        },
      });
    }
    case SET_CASINOGAMESALL_PENDING: {
      const { page } = action.active;
      return update(state, {
        allGames: {
          [`${page}`]: {
            $merge: {
              pending: true
            },
          },
        },
      });
    }
    case SET_CASINOGAMESALL_MODAL: {
      const { result, page } = action.active;
      return update(state, {
        allGamesModal: {
          [`${page}`]: {
            $set: {
              data: result,
              pending: false
            },
          },
        },
      });
    }
    case SET_CASINOGAMESALL_MODAL_PENDING: {
      const { page } = action.active;
      return update(state, {
        allGamesModal: {
          [`${page}`]: {
            $merge: {
              pending: true
            },
          },
        },
      });
    }
    case SET_CASINOCATEGORY_ACTIVED: {
      const { result } = action.active;
      return update(state, {
        filterCategory: {
          $set: {
            actived: result
          },
        },
      });
    }
    case SET_CASINOGAME_SEARCH: {
      const { result } = action.active;
      return update(state, {
        casinoGamesSearch: {
          $set: {
            data: result,
            pending: false
          },
        },
      });
    }    
    case SET_CASINOGAME_SEARCH_PENDING: {
      return update(state, {
        casinoGamesSearch: {
          $merge: {
            pending: true
          },
        },
      });
    }
    case SET_LASTPLAYED: {
      const { result } = action.active;
      return update(state, {
        lastPlayedGames: {
          $set: {
            data: result,
            pending: false
          },
        },
      });
    }    
    case SET_LASTPLAYED_PENDING: {
      return update(state, {
        lastPlayedGames: {
          $merge: {
            pending: true
          },
        },
      });
    }
    case SET_ALL_VENDOR: {

      return update(state, {
        allVendors: {
          $set: action.active,
        }
      })
    }
    default: return state;
  }
}

export default sessionReducer;