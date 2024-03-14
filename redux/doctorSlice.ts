// userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DoctorState {
  doctor: Doctor | null;
  token: string | null;
}

interface Doctor {
  name: string;
  email: string;
  id: string;
  // Add any other user properties here
}

const initialState: DoctorState = {
  doctor: null,
  token: null,
};

const loadState = (): DoctorState => {
  try {
    const serializedState = localStorage.getItem("doctorState");
    if (serializedState === null) {
      return initialState;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return initialState;
  }
};

const saveState = (state: DoctorState) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("doctorState", serializedState);
  } catch {
    // Ignore write errors
  }
};

export const doctorSlice = createSlice({
  name: "doctor",
  initialState: loadState(),
  reducers: {
    setDoctor: (
      state,
      action: PayloadAction<{ doctor: Doctor | null; token: string | null }>
    ) => {
      state.doctor = action.payload.doctor;
      state.token = action.payload.token;
      saveState(state);
    },
    clearDoctor: (state) => {
      state.doctor = null;
      state.token = null;
      saveState(state);
    },
  },
});

export const { setDoctor, clearDoctor } = doctorSlice.actions;

// Fixed selectors
export const selectDoctor = (state: { doctor: DoctorState }) =>
  state.doctor.doctor;
export const selectToken = (state: { doctor: DoctorState }) =>
  state.doctor.token;

export default doctorSlice.reducer;
