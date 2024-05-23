
import {
  LANGUAGESACTIVE,
  SETUSERINFO,
  SET_USER_PROFILE,
  WALLETS,
  SET_ISLOGIN,
  CURRENT_COUNTRY,
  THEME,
  SET_SESSION_READY,
} from "../constants/types";

const INITIAL_STATE = {
  languagesActive: 'en',
  theme: 'DARK',
  userInfo: {},
  userProfile:{},
  wallets:{},
  isLogin: null,
  isReady: false,
  currentCountry: null
};

const applySetActive = (state, action) => ({
  ...state,
  languagesActive: action.active,
});

const applySetTheme = (state, action) => ({
  ...state,
  theme: action.active.theme
});

const applySetUserProfile = (state, action) => ({
  ...state,
  userProfile: action.userProfile
});

const applySetUser = (state, action) => ({
  ...state,
  userInfo: action.active.userInfo,
  isLogin: action.active.isLogin,
  isReady: true,
});

const applySetWallets = (state, action) =>({
  ...state,
  wallets: action.active
})

const applySetIsLogin = (state, action) =>({
  ...state,
  isLogin: action.active.isLogin,
})

const applySetCurrentCountry = (state, action) => ({
  ...state,
  currentCountry: action.currentCountry
})

const applySetSessionReady = (state, action) => ({
  ...state,
  isReady: action.active.isReady
})

function sessionReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case LANGUAGESACTIVE: {
      return applySetActive(state, action);
    }
    case THEME: {
      return applySetTheme(state, action);
    }
    case SETUSERINFO: {
      return applySetUser(state, action);
    }
    case SET_USER_PROFILE: {
      return applySetUserProfile(state, action);
    }
    case WALLETS: {
      return applySetWallets(state, action);
    }
    case SET_ISLOGIN: {
      return applySetIsLogin(state, action);
    }
    case CURRENT_COUNTRY: {
      return applySetCurrentCountry(state, action);
    }
    case SET_SESSION_READY: {
      return applySetSessionReady(state, action);
    }

    default: return state;
  }
}

export default sessionReducer;