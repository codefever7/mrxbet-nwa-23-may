
import {
  REGISTERMODAL,
  DEPOSITMODAL,
  MESSAGEMODAL,
  LOGINMODAL,
  FORGOTPASSWORDMODAL,
  ALLMODAL,
  CALLBACKSHOW
} from "../constants/types";
import isUndefined from 'lodash/isUndefined'
const INITIAL_STATE = {
  registerModal: false,
  registerId: null,
  depositId: null,
  loginModal: false,
  forgotPasswordModal: false,
  depositModal: false,
  messageModal: false,
  allModal: {
    isOpen: false,
    id: null,
    type:''
  },
  callback:null,
  callbackData:null,
  callbackShow:false
};

const applySetRegisterModal = (state, action) => ({
  ...state,
  registerModal: action.active,
  registerId: null
});
const applySetRegisterIsIdModal = (state, action) => ({
  ...state,
  registerModal: action.active.status,
  registerId: action.active.id
});
const applySetDepositIsIdModal = (state, action) => ({
  ...state,
  depositModal: action.active.status,
  depositId: action.active.id
});

const applySetDepositModal = (state, action) => ({
  ...state,
  depositModal: action.active,
  depositId: null,
});
const applySetMessageModal = (state, action) => ({
  ...state,
  messageModal: action.active
});
const applySetLoginModal = (state, action) => ({
  ...state,
  loginModal: action.active
});
const applySetLoginModalCallback = (state, action) => ({
  ...state,
  loginModal: action.active.show,
  callback: action.active.callback,
  callbackData: action.active.callbackData
});
const forgotPasswordModal = (state, action) => ({
  ...state,
  forgotPasswordModal: action.active
});
const applySetForgotPasswordModalCallback = (state, action) => ({
  ...state,
  forgotPasswordModal: action.active.show,
  callback: action.active.callback,
  callbackData: action.active.callbackData
});
const applySetBonusModal = (state, action) => ({
  ...state,
  allModal: action.active
});
const applySetCallbackShow = (state, action) => ({
  ...state,
  callbackShow: action.active
});

function modalsReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case REGISTERMODAL: {
      if (!isUndefined(action.active.id)) {
        return applySetRegisterIsIdModal(state, action);
      }
      return applySetRegisterModal(state, action);
    }
    case DEPOSITMODAL: {
      if (!isUndefined(action.active.id)) {
        return applySetDepositIsIdModal(state, action);
      }
      return applySetDepositModal(state, action);
    }
    case MESSAGEMODAL: {
      return applySetMessageModal(state, action);
    }
    case ALLMODAL: {
      return applySetBonusModal(state, action);
    }
    case LOGINMODAL: {
      if (!isUndefined(action.active.callback)) {
        return applySetLoginModalCallback(state, action);
      }
      return applySetLoginModal(state, action);
    }
    case FORGOTPASSWORDMODAL: {
      if (!isUndefined(action.active.callback)) {
        return applySetForgotPasswordModalCallback(state, action);
      }
      return forgotPasswordModal(state, action);
    }
    case CALLBACKSHOW: {
      return applySetCallbackShow(state, action);
    }
    default: return state;
  }
}

export default modalsReducer;