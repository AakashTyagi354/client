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
  isAdmin: boolean;
  isDoctor: boolean;

  // Add any other user properties here
}

const initialState: UserState = {
  user: null,
  token: null,
};

const loadState = (): UserState => {
  try {
    const serializedState = localStorage.getItem("userState");
    if (!serializedState) {
      return initialState;
    }
    const parsed = JSON.parse(serializedState);
    
    return {
      user: parsed.user ?? null,  // only take what we need
      token: null,                // token ALWAYS starts null
    };

  } catch{
    return initialState;
  }
};

const saveState = (state: UserState) => {
  try {
    const {token, ...rest} = state;
    const serializedState = JSON.stringify(rest);
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
