import { createStore, combineReducers } from "redux";
import { Provider } from "react-redux";

const initialState = {
    isAuthenticated: false,
};

const themeInitState = {
    isDarkMode: false,
};

function authReducer(state = initialState, action){
    switch(action.type) {
        case "LOGIN":
            return {...state, isAuthenticated:true};
        case "LOGOUT":
            return {...state, isAuthenticated:false};
        default:
            return state;
    }
}

function themeReducer(state = themeInitState, action) {
    switch(action.type) {
        case "Dark":
            return {...state, isDarkMode: true};
        case "Dawn":
            return {...state, isDarkMode: false};
        default:
            return state;
    }
}

const rootReducer = combineReducers({
    auth: authReducer,
    theme: themeReducer,
});

const store = createStore(rootReducer);

export default store;