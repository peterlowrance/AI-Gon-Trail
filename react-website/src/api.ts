import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

type GameStatus = {
    vehicle: string,
    items: string[],
    characters: string[],
    //current_step/total_steps ?
}

export const gameApi = createApi({
    reducerPath: 'gameApi',
    baseQuery: fetchBaseQuery({ baseUrl: window.location.origin + '/api/' }),
    tagTypes: ['GAME'],
    endpoints: (builder) => ({
        getGameStart: builder.query<{session: string, items: {[item: string]: number}}, string>({
            query: (theme) => ({
                url: 'game-start-items',
                method: 'POST',
                params: {
                    theme: theme
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
        getScenario: builder.query<{scenario: string, suggestions: string[]}, string>({
            query: (session) => ({
                url: 'game-scenario',
                params: {
                    session: session
                }
            })
        }),
        takeAction: builder.mutation<string, {session: string, scenario: string, action: string}>({
            query: ({ session, scenario, action }) => ({
                url: 'take-action',
                method: 'POST',
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