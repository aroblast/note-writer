import { LOG_IN } from '../actions/_types';

let state = {
    isLoggedIn: false,
};

export default (state, action) => {
    switch (action.type) {
        case LOG_IN:
            break;
        default:
            console.warn('The action %s cannot being dispatched in this reducer.');
            break;
    }

    return state;
};