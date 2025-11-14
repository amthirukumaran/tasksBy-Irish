import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    tasks: [],
}

const taskSlice = createSlice({
    name: "taskSlice",
    initialState,
    reducers: {
        addTasks: (state, { payload }) => {
            state.tasks.push(payload);
        },
        addFav: (state, { payload }) => {
            const index = state.tasks.findIndex(
                (item) => item.createdAt === payload
            );

            if (index !== -1) {
                state.tasks[index].favourite = !state.tasks[index].favourite;
            }
        },
        editTasks: (state, { payload }) => {
            const index = state.tasks.findIndex(
                (item) => item.createdAt === payload.createdAt
            );
            if (index !== -1) {
                state.tasks[index] = payload; // direct mutation allowed (Immer)
            }
        },
        deleteTask: (state, { payload }) => {
            state.tasks = state.tasks.filter(task => task.createdAt !== payload);
        }

    }
})

export const { addTasks, addFav, editTasks, deleteTask } = taskSlice.actions
export default taskSlice.reducer