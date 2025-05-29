import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    origin: null,
    destination: null,
    travelTimeInformation: null

}

export const navSlice = createSlice ({
    name: 'nav',
    initialState,
    reducers: {
        setOrigin: (state, action) => {
            state.origin = action.payload;
        },
        setDestination: (state, action) => {
            state.destination = action.payload;
        },
        setTravelTimeInformation: (state, action) => {
            state.travelTimeInformation = action.payload;
        },
                resetNavState: (state) => {
            state.origin = null;
            state.destination = null;
            state.travelTimeInformation = null;
        },
    },
});

export const { setDestination, setOrigin, setTravelTimeInformation, resetNavState } = navSlice.actions;


//Selectors

export const selectOrigin = (state) => state.nav.origin;

export const selectDestination = (state) => state.nav.destination;

export const selectTravelTimeInformation = (state) => state.nav.TravelTimeInformation;

export default navSlice.reducer;