import { configureStore } from '@reduxjs/toolkit';
import stateReducer from './redux/state';

const store = configureStore({
  reducer: {
    state: stateReducer,
  },window:window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
});

export default store;