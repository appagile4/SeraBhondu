import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { listingsApi } from "../../services/api";
import { AdvertisementItem } from "./listingsSlice";

interface MyAdsState {
  ads: AdvertisementItem[];
  activeStatusFilter: "all" | "approved" | "pending" | "rejected" | "sold";
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

const initialState: MyAdsState = {
  ads: [],
  activeStatusFilter: "all",
  isLoading: false,
  isRefreshing: false,
  error: null,
};

// Fetch customer's own ads
export const fetchMyAds = createAsyncThunk(
  "myAds/fetchMyAds",
  async (refresh: boolean | undefined = false, { rejectWithValue }) => {
    try {
      const res = await listingsApi.getMyAds();
      return res.data.advertisements || [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to load your advertisements");
    }
  }
);

// Delete customer's own ad
export const deleteMyAd = createAsyncThunk(
  "myAds/deleteMyAd",
  async (id: string, { rejectWithValue }) => {
    try {
      await listingsApi.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete advertisement");
    }
  }
);

const myAdsSlice = createSlice({
  name: "myAds",
  initialState,
  reducers: {
    setStatusFilter(
      state,
      action: PayloadAction<"all" | "approved" | "pending" | "rejected" | "sold">
    ) {
      state.activeStatusFilter = action.payload;
    },
    removeAdFromState(state, action: PayloadAction<string>) {
      state.ads = state.ads.filter((a) => a._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMyAds.pending, (state, action) => {
      if (action.meta.arg) {
        state.isRefreshing = true;
      } else {
        state.isLoading = true;
      }
      state.error = null;
    });
    builder.addCase(fetchMyAds.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isRefreshing = false;
      state.ads = action.payload;
    });
    builder.addCase(fetchMyAds.rejected, (state, action) => {
      state.isLoading = false;
      state.isRefreshing = false;
      state.error = action.payload as string;
    });

    builder.addCase(deleteMyAd.fulfilled, (state, action) => {
      state.ads = state.ads.filter((ad) => ad._id !== action.payload);
    });
  },
});

export const { setStatusFilter, removeAdFromState } = myAdsSlice.actions;
export default myAdsSlice.reducer;
