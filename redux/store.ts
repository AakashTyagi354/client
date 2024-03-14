import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import cartReducer from './cartSlice'; // Import the cart reducer

export const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer, // Include the cart reducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;