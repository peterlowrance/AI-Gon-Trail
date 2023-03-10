import { createSlice, configureStore, PayloadAction } from '@reduxjs/toolkit'
import { gameApi } from './api';

export type GameState = 'NOT_STARTED' | 'CHOOSING_ITEMS' | 'FACING_SCENARIOS';

// Slice
const gameSlice = createSlice({
  name: 'game',
  initialState: {
    gameState: 'NOT_STARTED' as GameState,
    itemsToBuy: {} as {[item: string]: number},
    session: null as null | string
  },
  reducers: {
    setGameState: (state, action: PayloadAction<GameState>) => {
      state.gameState = action.payload;
    },
    setItemsToBuy: (state, action: PayloadAction<{[item: string]: number}>) => {
      state.itemsToBuy = action.payload;
    },
    setSession: (state, action: PayloadAction<string>) => {
      state.session = action.payload;
    }
  }
})

export const { setGameState, setItemsToBuy, setSession } = gameSlice.actions;


// Store
const store = configureStore({
  reducer: {
    game: gameSlice.reducer,
    [gameApi.reducerPath]: gameApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(gameApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export default store;