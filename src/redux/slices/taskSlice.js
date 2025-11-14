import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    tasks: [],
}

const taskSlice = createSlice({
    name: "taskSlice",
    initialState,
    reducers: {
        addTasks: (state, { payload }) => {
            state.tasks = [...state.tasks, payload]
        },
        addFav: (state, { payload }) => {
            state.tasks = state.tasks.map(item =>
                item.createdAt === payload
                    ? { ...item, favourite: !item.favourite }
                    : item
            );
        }

    }
})

export const { addTasks, addFav } = taskSlice.actions
export default taskSlice.reducer