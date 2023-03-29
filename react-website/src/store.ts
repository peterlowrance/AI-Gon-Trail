import { createSlice, configureStore, PayloadAction } from '@reduxjs/toolkit'
import { gameApi } from './api';

export type GameState = 'NO_KEY' | 'NOT_STARTED' | 'CHOOSING_ITEMS' | 'FACING_SCENARIOS';
export type StoryType = 'SCENARIO' | 'ACTION' | 'OUTCOME';

// Slice
const gameSlice = createSlice({
  name: 'game',
  initialState: {
    gameState: 'NO_KEY' as GameState,
    itemsToBuy: {} as {[item: string]: number},
    session: null as null | string,
    story: [] as {text: string, type: StoryType, invalid?: boolean, invalidMsg?: string}[],
    suggestions: [] as string[],
    toasts: [] as any[]
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
      // If this is an action and the last story is invalid, overwrite it
      if (action.payload.type === 'ACTION' && state.story.length > 0 && state.story[state.story.length - 1].invalid) {
        state.story[state.story.length - 1] = action.payload;
      }
      else {
        state.story.push(action.payload);
      }
    },
    invalidateStoryAction: (state, action: PayloadAction<string>) => {
      const lastStory = state.story[state.story.length - 1];
      lastStory.invalid = true;
      lastStory.invalidMsg = action.payload;
    },
    setSuggestions: (state, action: PayloadAction<string[]>) => {
      state.suggestions = action.payload;
    },
    addToast: (state, action: PayloadAction<any>) => {
      state.toasts.push({id: Math.random().toString(), ...action.payload});
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    }
  }
})

export const { setGameState, setItemsToBuy, setSession, addStory, setSuggestions, invalidateStoryAction, addToast, removeToast } = gameSlice.actions;


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