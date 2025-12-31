import { configureStore } from "@reduxjs/toolkit";
import { appSlice } from "@reducers/app";
import { createAppListenerMiddleware } from "./listeners";

const listener = createAppListenerMiddleware();

export const redux = configureStore({
	reducer: {
		app: appSlice.reducer
	},
	middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listener.middleware)
});

export type RootState = ReturnType<typeof redux.getState>;
export type AppDispatch = typeof redux.dispatch;
