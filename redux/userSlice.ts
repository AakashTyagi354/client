// userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  user: User | null;
  token: string | null;
}

interface User {
  name: string;
  email: string;
  id: string;
  // Add any other user properties here
}

const initialState: UserState = {
  user: null,
  token: null,
};

const loadState = (): UserState => {
  try {
    const serializedState = localStorage.getItem("userState");
    if (serializedState === null) {
      return initialState;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return initialState;
  }
};

const saveState = (state: UserState) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("userState", serializedState);
  } catch {
    // Ignore write errors
  }
};

export const userSlice = createSlice({
  name: "user",
  initialState: loadState(),
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ user: User | null; token: string | null }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      saveState(state);
    },
    clearUser: (state) => {
      state.user = null;
      state.token = null;
      saveState(state);
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

export const selectUser = (state: { user: UserState }) => state.user.user;
export const selectToken = (state: { user: UserState }) => state.user.token;

export default userSlice.reducer;
