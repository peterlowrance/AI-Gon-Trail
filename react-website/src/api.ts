import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

type GameStatus = {
    vehicle: string,
    items: string[],
    characters: string[],
}

export type ChangesType = {
    added: string[],
    removed: string[],
    changed?: {[key: string]: {added: string[], removed: string[]}}
}

const baseQuery = fetchBaseQuery({
    baseUrl: window.location.origin + '/api/',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        // Get the authentication key from the store state
        const openaiKey = getState().game.key;
        // If we have a key, add it to the headers
        if (openaiKey) {
          headers.set('openai_key', openaiKey);
        }
        return headers;
      }
})

export const gameApi = createApi({
    reducerPath: 'gameApi',
    baseQuery: baseQuery,
    tagTypes: ['GAME'],
    endpoints: (builder) => ({
        getGameStart: builder.query<{session: string, items: {[item: string]: number}, description: string}, {theme: string, key: string}>({
            query: ({theme, key}) => ({
                url: 'game-start-items',
                method: 'POST',
                params: {
                    theme: theme,
                    key: key
                }
            })
        }),
        chooseItems: builder.mutation<void, {session: string, items: string[]}>({
            query: ({session, items}) => ({
                url: 'choose-items',
                method: 'POST',
                body: {
                    session: session,
                    items: items
                }
            }),
            invalidatesTags: ['GAME']
        }),
        // Gets the status for the current game
        getStatus: builder.query<GameStatus, string>({
            query: (session) => ({
                url: 'game-status',
                params: {
                    session: session
                }
            }),
            providesTags: ['GAME']
        }),
        getScenario: builder.query<{scenario: string, suggestions: string[]}, {session: string, key: string}>({
            query: ({session, key}) => ({
                url: 'game-scenario',
                params: {
                    session: session,
                    key: key
                }
            })
        }),
        takeAction: builder.mutation<{valid: boolean, text: string, win: boolean, item_changes?: ChangesType, character_changes?: ChangesType}, {session: string, scenario: string, action: string, key: string}>({
            query: ({ session, scenario, action, key }) => ({
                url: 'take-action',
                method: 'POST',
                params: {key: key},
                body: {
                    session: session,
                    scenario: scenario,
                    action: action
                }
            }),
            invalidatesTags: ['GAME']
        })
    }),
})

export const { useLazyGetGameStartQuery, useLazyGetScenarioQuery, useChooseItemsMutation, useGetStatusQuery, useTakeActionMutation } = gameApi;