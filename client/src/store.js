import { configureStore } from '@reduxjs/toolkit';
import stateReducer from './redux/state';

const store = configureStore({
  reducer: {
    state: stateReducer,
  },
});

export default store;