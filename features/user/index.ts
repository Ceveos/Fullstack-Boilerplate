import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState } from 'app/store';

interface UserState {
  loaded: boolean
  authenticated: boolean
}

// Define the initial state using that type
const initialState: UserState = {
  loaded: false,
  authenticated: false
};

export const userSlice = createSlice({
  name: 'user',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState: (initialState as UserState),
  reducers: {
    setLoaded: (state, action: PayloadAction<boolean>) => {
      state.loaded = action.payload;
    },
    setUser: (state, action: PayloadAction<boolean>) => {
      state.loaded = action.payload;
    },
  },
});

export const userActions = userSlice.actions;

export const userSelector = (state: RootState) => state.user;

export default userSlice.reducer;