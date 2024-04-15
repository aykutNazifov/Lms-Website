import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn } from "../auth/authSlice";

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_SERVER_URL!,
    }),
    endpoints: (builder) => ({
        refreshToken: builder.query({
            query: (data) => ({
                url: "auth/update-token",
                method: "GET",
                credentials: "include"
            })
        }),
        getUser: builder.query({
            query: (data) => ({
                url: "auth/get-user",
                method: "GET",
                credentials: "include"
            }),
            onQueryStarted: async (arg, { queryFulfilled, dispatch }) => {
                const result = await queryFulfilled
                dispatch(userLoggedIn({
                    accessToken: result.data.accessToken,
                    user: result.data.user
                }))
            }
        })
    })
})

export const { useRefreshTokenQuery, useGetUserQuery } = apiSlice