import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import storage from "../../services/storage";
import { AdvertisementItem } from "./listingsSlice";

interface FavouritesState {
  favouriteIds: string[];
  favouriteItems: AdvertisementItem[];
  isLoading: boolean;
}

const initialState: FavouritesState = {
  favouriteIds: [],
  favouriteItems: [],
  isLoading: false,
};

// Load saved favourites from storage
export const loadFavourites = createAsyncThunk("favourites/load", async () => {
  try {
    const rawIds = await storage.getItem("serabondhu_favourite_ids");
    const rawItems = await storage.getItem("serabondhu_favourite_items");
    return {
      ids: rawIds ? JSON.parse(rawIds) : [],
      items: rawItems ? JSON.parse(rawItems) : [],
    };
  } catch {
    return { ids: [], items: [] };
  }
});

// Toggle favourite item with persistent storage
export const toggleFavouriteThunk = createAsyncThunk(
  "favourites/toggle",
  async (item: AdvertisementItem, { getState }) => {
    const state = getState() as { favourites: FavouritesState };
    const exists = state.favourites.favouriteIds.includes(item._id);

    let nextIds: string[];
    let nextItems: AdvertisementItem[];

    if (exists) {
      nextIds = state.favourites.favouriteIds.filter((id) => id !== item._id);
      nextItems = state.favourites.favouriteItems.filter((i) => i._id !== item._id);
    } else {
      nextIds = [...state.favourites.favouriteIds, item._id];
      nextItems = [item, ...state.favourites.favouriteItems];
    }

    await storage.setItem("serabondhu_favourite_ids", JSON.stringify(nextIds));
    await storage.setItem("serabondhu_favourite_items", JSON.stringify(nextItems));

    return { ids: nextIds, items: nextItems };
  }
);

const favouritesSlice = createSlice({
  name: "favourites",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadFavourites.fulfilled, (state, action) => {
      state.favouriteIds = action.payload.ids;
      state.favouriteItems = action.payload.items;
    });
    builder.addCase(toggleFavouriteThunk.fulfilled, (state, action) => {
      state.favouriteIds = action.payload.ids;
      state.favouriteItems = action.payload.items;
    });
  },
});

export default favouritesSlice.reducer;
