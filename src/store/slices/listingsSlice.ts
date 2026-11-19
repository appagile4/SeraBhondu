import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { listingsApi } from "../../services/api";

export interface AdvertisementItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  subCategory?: string;
  condition: "New" | "Used";
  images: Array<{ url: string; publicId?: string }>;
  location: {
    state?: string;
    city: string;
    area?: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
  };
  seller: {
    _id: string;
    name: string;
    avatar?: string;
    city?: string;
    phone?: string;
    email?: string;
    isVerified?: boolean;
    createdAt?: string;
    about?: string;
  };
  sellerContact?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  status: "pending" | "approved" | "rejected" | "sold";
  isFeatured: boolean;
  viewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface ListingsState {
  approvedAds: AdvertisementItem[];
  featuredAds: AdvertisementItem[];
  searchResults: AdvertisementItem[];
  currentAd: AdvertisementItem | null;
  relatedAds: AdvertisementItem[];

  // Filters
  selectedCategory: string;
  selectedCity: string;
  selectedCondition: string;
  sortBy: string;
  minPrice?: number;
  maxPrice?: number;

  // Pagination & Loading
  page: number;
  totalPages: number;
  totalCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  isSearching: boolean;
  error: string | null;
}

const initialState: ListingsState = {
  approvedAds: [],
  featuredAds: [],
  searchResults: [],
  currentAd: null,
  relatedAds: [],

  selectedCategory: "all",
  selectedCity: "All Bangladesh",
  selectedCondition: "All",
  sortBy: "newest",

  page: 1,
  totalPages: 1,
  totalCount: 0,
  isLoading: false,
  isRefreshing: false,
  isSearching: false,
  error: null,
};

// Fetch Approved Listings (Paginated)
export const fetchApprovedListings = createAsyncThunk(
  "listings/fetchApproved",
  async (
    params: {
      category?: string;
      city?: string;
      minPrice?: number;
      maxPrice?: number;
      condition?: string;
      sortBy?: string;
      page?: number;
      limit?: number;
      refresh?: boolean;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const queryParams: any = {
        page: params.page || 1,
        limit: params.limit || 12,
      };

      if (params.category && params.category !== "all") {
        queryParams.category = params.category;
      }
      if (params.city && params.city !== "All Bangladesh" && params.city !== "all") {
        queryParams.city = params.city;
      }
      if (params.condition && params.condition !== "All") {
        queryParams.condition = params.condition;
      }
      if (params.minPrice) {
        queryParams.minPrice = params.minPrice;
      }
      if (params.maxPrice) {
        queryParams.maxPrice = params.maxPrice;
      }
      if (params.sortBy) {
        queryParams.sortBy = params.sortBy;
      }

      const res = await listingsApi.getApproved(queryParams);
      return {
        data: res.data,
        refresh: params.refresh || false,
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to load advertisements");
    }
  }
);

// Fetch Featured Listings
export const fetchFeaturedListings = createAsyncThunk(
  "listings/fetchFeatured",
  async (limit: number = 8, { rejectWithValue }) => {
    try {
      const res = await listingsApi.getFeatured(limit);
      return res.data.advertisements || [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to load featured ads");
    }
  }
);

// Fetch Single Listing by Slug
export const fetchListingBySlug = createAsyncThunk(
  "listings/fetchBySlug",
  async (slug: string, { rejectWithValue }) => {
    try {
      const res = await listingsApi.getBySlug(slug);
      return res.data.advertisement;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Advertisement not found");
    }
  }
);

// Fetch Related Listings
export const fetchRelatedListings = createAsyncThunk(
  "listings/fetchRelated",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await listingsApi.getRelated(id);
      return res.data.related || [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to load related ads");
    }
  }
);

// Full-Text Search Listings
export const searchListingsThunk = createAsyncThunk(
  "listings/search",
  async (
    params: {
      q?: string;
      city?: string;
      category?: string;
      page?: number;
      limit?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const queryParams: any = {
        page: params.page || 1,
        limit: params.limit || 20,
      };
      if (params.q) queryParams.q = params.q;
      if (params.city && params.city !== "All Bangladesh" && params.city !== "all") {
        queryParams.city = params.city;
      }
      if (params.category && params.category !== "all") {
        queryParams.category = params.category;
      }

      const res = await listingsApi.search(queryParams);
      return res.data.advertisements || [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Search failed");
    }
  }
);

const listingsSlice = createSlice({
  name: "listings",
  initialState,
  reducers: {
    setSelectedCategory(state, action: PayloadAction<string>) {
      state.selectedCategory = action.payload;
    },
    setSelectedCity(state, action: PayloadAction<string>) {
      state.selectedCity = action.payload;
    },
    setSelectedCondition(state, action: PayloadAction<string>) {
      state.selectedCondition = action.payload;
    },
    setSortBy(state, action: PayloadAction<string>) {
      state.sortBy = action.payload;
    },
    setPriceRange(state, action: PayloadAction<{ min?: number; max?: number }>) {
      state.minPrice = action.payload.min;
      state.maxPrice = action.payload.max;
    },
    clearSearchResults(state) {
      state.searchResults = [];
    },
    clearCurrentAd(state) {
      state.currentAd = null;
      state.relatedAds = [];
    },
  },
  extraReducers: (builder) => {
    // Approved Listings
    builder.addCase(fetchApprovedListings.pending, (state, action) => {
      if (action.meta.arg?.refresh) {
        state.isRefreshing = true;
      } else {
        state.isLoading = true;
      }
      state.error = null;
    });
    builder.addCase(fetchApprovedListings.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isRefreshing = false;
      const { data, refresh } = action.payload;

      const newAds = data.advertisements || [];
      if (refresh || state.page === 1) {
        state.approvedAds = newAds;
      } else {
        state.approvedAds = [...state.approvedAds, ...newAds];
      }

      state.page = data.page || 1;
      state.totalPages = data.pages || 1;
      state.totalCount = data.total || newAds.length;
    });
    builder.addCase(fetchApprovedListings.rejected, (state, action) => {
      state.isLoading = false;
      state.isRefreshing = false;
      state.error = action.payload as string;
    });

    // Featured Listings
    builder.addCase(fetchFeaturedListings.fulfilled, (state, action) => {
      state.featuredAds = action.payload;
    });

    // Detail & Related
    builder.addCase(fetchListingBySlug.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchListingBySlug.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentAd = action.payload;
    });
    builder.addCase(fetchListingBySlug.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchRelatedListings.fulfilled, (state, action) => {
      state.relatedAds = action.payload;
    });

    // Search
    builder.addCase(searchListingsThunk.pending, (state) => {
      state.isSearching = true;
    });
    builder.addCase(searchListingsThunk.fulfilled, (state, action) => {
      state.isSearching = false;
      state.searchResults = action.payload;
    });
    builder.addCase(searchListingsThunk.rejected, (state) => {
      state.isSearching = false;
      state.searchResults = [];
    });
  },
});

export const {
  setSelectedCategory,
  setSelectedCity,
  setSelectedCondition,
  setSortBy,
  setPriceRange,
  clearSearchResults,
  clearCurrentAd,
} = listingsSlice.actions;

export default listingsSlice.reducer;
