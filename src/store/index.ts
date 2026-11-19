import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import listingsReducer from "./slices/listingsSlice";
import myAdsReducer from "./slices/myAdsSlice";
import chatReducer from "./slices/chatSlice";
import notificationsReducer from "./slices/notificationsSlice";
import favouritesReducer from "./slices/favouritesSlice";
import locationReducer from "./slices/locationSlice";
import languageReducer from "./slices/languageSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    listings: listingsReducer,
    myAds: myAdsReducer,
    chat: chatReducer,
    notifications: notificationsReducer,
    favourites: favouritesReducer,
    location: locationReducer,
    language: languageReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
