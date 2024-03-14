import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
  productId: string;
  quantity: number;
  description: string;
  price: number;
  name: string;
  category: string;
  photo: object;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const loadCartState = (): CartState => {
  try {
    const serializedState = localStorage.getItem("cartState");
    if (serializedState === null) {
      return initialState;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return initialState;
  }
};

const saveCartState = (state: CartState) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("cartState", serializedState);
  } catch {
    // Ignore write errors
  }
};

export const cartSlice = createSlice({
  name: "cart",
  initialState: loadCartState(),
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const { productId, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) => item.productId === productId
      );
      if (existingItemIndex !== -1) {
        state.items[existingItemIndex].quantity += quantity;
      } else {
        state.items.push(action.payload);
      }
      saveCartState(state);
    },
    incrementQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find(
        (item) => item.productId === action.payload
      );
      if (item) {
        item.quantity++;
        saveCartState(state);
      }
    },
    decrementQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find(
        (item) => item.productId === action.payload
      );
      if (item && item.quantity > 1) {
        item.quantity--;
        saveCartState(state);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload
      );
      saveCartState(state);
    },
    clearCart: (state) => {
      state.items = [];
      saveCartState(state);
    },
  },
});

export const { addToCart, removeFromCart, clearCart,incrementQuantity,decrementQuantity } = cartSlice.actions;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;

export default cartSlice.reducer;
