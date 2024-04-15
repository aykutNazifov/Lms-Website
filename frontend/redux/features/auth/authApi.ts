import { apiSlice } from "../api/apiSlice";
import { userLoggedIn, userLoggedOut, userRegistration } from "./authSlice";

export const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        register: builder.mutation({
            query: (data) => ({
                url: "auth/registration",
                method: "POST",
                body: data,
                credentials: "include"
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    const result = await queryFulfilled
                    dispatch(userRegistration({
                        token: result.data.activationToken
                    }))
                } catch (error: any) {
                    console.log(error)
                }
            }
        }),
        activation: builder.mutation({
            query: ({ activationToken, activationCode }) => ({
                url: "auth/activate-user",
                method: "POST",
                body: {
                    activationToken,
                    activationCode
                }
            })
        }),
        login: builder.mutation({
            query: (data) => ({
                url: "auth/login",
                method: "POST",
                body: data,
                credentials: "include"
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    const result = await queryFulfilled
                    dispatch(userLoggedIn({
                        accessToken: result.data.accessToken,
                        user: result.data.user
                    }))
                } catch (error: any) {
                    console.log(error)
                }
            }
        }),
        socialAuth: builder.mutation({
            query: (data) => ({
                url: "auth/social-auth",
                method: "POST",
                body: data,
                credentials: "include"
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    const result = await queryFulfilled
                    dispatch(userLoggedIn({
                        accessToken: result.data.accessToken,
                        user: result.data.user
                    }))
                } catch (error: any) {
                    console.log(error)
                }
            }
        }),
        logout: builder.query({
            query: () => ({
                url: "auth/logout",
                method: "GET",
                credentials: "include"
            }),
            onQueryStarted: async (arg, { dispatch }) => {
                dispatch(userLoggedOut())
            }
        }),
    })
})

export const { useRegisterMutation, useActivationMutation, useLoginMutation, useSocialAuthMutation, useLogoutQuery } = authApi;
