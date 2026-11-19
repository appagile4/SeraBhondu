import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import storage from "../../services/storage";

interface LocationState {
  selectedCity: string;
  locationModalVisible: boolean;
}

const initialState: LocationState = {
  selectedCity: "All Bangladesh",
  locationModalVisible: false,
};

// Load saved city
export const loadSavedCity = createAsyncThunk("location/loadSaved", async () => {
  try {
    const saved =
      (await storage.getItem("serabondhu_selected_city")) ||
      (await storage.getItem("serabondhu_city"));
    return saved || "All Bangladesh";
  } catch {
    return "All Bangladesh";
  }
});

// Set and persist city
export const setCityAndPersist = createAsyncThunk(
  "location/setCityAndPersist",
  async (city: string) => {
    await storage.setItem("serabondhu_selected_city", city);
    return city;
  }
);

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setLocationModalVisible(state, action: PayloadAction<boolean>) {
      state.locationModalVisible = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadSavedCity.fulfilled, (state, action) => {
      state.selectedCity = action.payload;
    });
    builder.addCase(setCityAndPersist.fulfilled, (state, action) => {
      state.selectedCity = action.payload;
      state.locationModalVisible = false;
    });
  },
});

export const { setLocationModalVisible } = locationSlice.actions;
export default locationSlice.reducer;
