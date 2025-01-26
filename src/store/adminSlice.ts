import { createSlice } from "@reduxjs/toolkit";
const initialState = null;

const adminSlice = createSlice(
    {
        name: 'admin',
        initialState,
        reducers: {
            addAdmin(_state, action) {
                return action.payload;
            },
            removeAdmin() {
                return null;
            }
        }
    }
);

export const { addAdmin, removeAdmin } = adminSlice.actions;

export default adminSlice.reducer;