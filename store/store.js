import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/index';

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export default store;
