import { createSlice} from "@reduxjs/toolkit"

const initialState = {
  user: null,
  token: null,
  listings: [],
  selectedCategory: 'All',
  sortOrder: 'lowToHigh',
  minPrice: 0,
  maxPrice: 100000,
  loading: false,
}

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLogin: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
    },
    setLogout: (state) => {
      state.user = null
      state.token = null
    },
    setListings: (state, action) => {
      state.listings = action.payload.listings
    },
    setCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setTripList: (state, action) => {
      state.user.tripList = action.payload
    },
    setWishList: (state, action) => {
      state.user.wishList = action.payload
    },
    setPropertyList: (state, action) => {
      state.user.propertyList = action.payload
    },
    setReservationList: (state, action) => {
      state.user.reservationList = action.payload
    },
    setSortOrder:(state,action)=>{
      state.sortOrder = action.payload
    },
    setMinPrice:(state,action)=>{
      state.minPrice = action.payload
    },
    setMaxPrice:(state,action)=>{
      state.maxPrice = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
})


export const { setLogin, setLogout, setListings, setTripList, setWishList, setPropertyList, setReservationList , setSortOrder, setMaxPrice, setMinPrice , setCategory ,setLoading} = userSlice.actions
export default userSlice.reducer