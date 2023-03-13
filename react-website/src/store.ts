import { createSlice, configureStore, PayloadAction } from '@reduxjs/toolkit'
import { gameApi } from './api';

export type GameState = 'NOT_STARTED' | 'CHOOSING_ITEMS' | 'FACING_SCENARIOS';
export type StoryType = 'SCENARIO' | 'ACTION' | 'OUTCOME';

// Slice
const gameSlice = createSlice({
  name: 'game',
  initialState: {
    gameState: 'NOT_STARTED' as GameState,
    itemsToBuy: {} as {[item: string]: number},
    session: null as null | string,
    story: [] as {text: string, type: StoryType}[],
    suggestions: [] as string[]
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
    },
    addStory: (state, action: PayloadAction<{text: string, type: StoryType}>) => {
      state.story.push(action.payload);
    },
    setSuggestions: (state, action: PayloadAction<string[]>) => {
      state.suggestions = action.payload;
    }
  }
})

export const { setGameState, setItemsToBuy, setSession, addStory, setSuggestions } = gameSlice.actions;


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