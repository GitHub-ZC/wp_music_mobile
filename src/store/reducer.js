import { combineReducers } from 'redux';

import AudioState from './reducer/audio';
import CommonState from './reducer/common';


const reducer = combineReducers({
    AudioState,
    CommonState
})

// const reducer = (state = defaultState, action) => {
//     switch (action.type) {
//         case 'setName': return {
//             ...state,
//             name: action.data
//         };
//         case 'setSex': return {
//             ...state,
//             sex: action.data
//         };
//         case 'setList': return {
//             ...state,
//             list: [...state.list, ...action.data]
//         };
//         default: return state;
//     }
// };

export default reducer;