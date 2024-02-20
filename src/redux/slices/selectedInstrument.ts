import { createSlice } from "@reduxjs/toolkit";
import { Instrument } from "../../constants/Enums";

const initialState = {
  selectedInstrument: Instrument.eur_usd,
};

const selectedInstrumentSlice = createSlice({
  name: "selectedInstrument",
  initialState,
  reducers: {
    setSelectedInstrument(state, action) {
      state.selectedInstrument = action.payload;
    },
  },
});

export const { setSelectedInstrument } = selectedInstrumentSlice.actions;

export default selectedInstrumentSlice.reducer;