import { createSlice, configureStore, PayloadAction } from '@reduxjs/toolkit'
import { ChangesType, gameApi } from './api';

export type GameState = 'NOT_STARTED' | 'CHOOSING_ITEMS' | 'FACING_SCENARIOS';
export type StoryType = 'SCENARIO' | 'ACTION' | 'OUTCOME' | 'LAST_OUTCOME' | 'GAME_END';

// Slice
const gameSlice = createSlice({
  name: 'game',
  initialState: {
    gameState: 'NOT_STARTED' as GameState,
    itemsToBuy: {} as { [item: string]: number },
    session: null as null | string,
    story: [] as { text: string, type: StoryType, invalid?: boolean, invalidMsg?: string, itemChanges?: ChangesType, characterChanges?: ChangesType, vehicleChanges?: ChangesType['changed'], quote?: string }[],
    suggestions: [] as string[],
    gameOver: undefined as undefined | 'WIN' | 'LOSE',
    key: '',
    theme: 'Oregon Trail'
  },
  reducers: {
    setGameState: (state, action: PayloadAction<GameState>) => {
      state.gameState = action.payload;
    },
    setItemsToBuy: (state, action: PayloadAction<{ [item: string]: number }>) => {
      state.itemsToBuy = action.payload;
    },
    setSession: (state, action: PayloadAction<string>) => {
      state.session = action.payload;
    },
    addStory: (state, action: PayloadAction<{ text: string, type: StoryType, itemChanges?: ChangesType, characterChanges?: ChangesType, vehicleChanges?: ChangesType['changed'], gameOver?: 'WIN' | 'LOSE', quote?: string }>) => {
      // If this is an action and the last story is invalid, overwrite it
      if (action.payload.type === 'ACTION' && state.story.length > 0 && state.story[state.story.length - 1].invalid) {
        state.story[state.story.length - 1] = action.payload;
      }
      else {
        state.story.push(action.payload);
      }
      if (action.payload.gameOver)
        state.gameOver = action.payload.gameOver;
      // Scroll to bottom
      setTimeout(() => {
        const el = document.getElementById('scrolling-div');
        if (el) {
          el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
        }
      }, 50);
    },
    invalidateStoryAction: (state, action: PayloadAction<string>) => {
      const lastStory = state.story[state.story.length - 1];
      lastStory.invalid = true;
      lastStory.invalidMsg = action.payload;
      // Scroll to bottom
      setTimeout(() => {
        const el = document.getElementById('scrolling-div');
        if (el)
          el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }, 50);
    },
    setSuggestions: (state, action: PayloadAction<string[]>) => {
      state.suggestions = action.payload;
    },
    setKey: (state, action: PayloadAction<string>) => {
      state.key = action.payload;
    },
    setTheme: (state, action: PayloadAction<string>) => {
      state.theme = action.payload;
    },
    restart: (state) => {
      state.gameOver = undefined;
      state.gameState = 'NOT_STARTED';
      state.itemsToBuy = {};
      state.story = [];
      state.session = null;
      state.suggestions = [];
    }
  }
})

export const { setGameState, setItemsToBuy, setSession, addStory, setSuggestions, invalidateStoryAction, setKey, setTheme, restart } = gameSlice.actions;


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
