import { createSlice, createAsyncThunk } from '@reduxjs/toolkit' //createslice: crea estado y funciones para modificarlo
import { supabase } from '../lib/supabase'

// Thunks para operaciones asíncronas
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateTaskAsync = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteTaskAsync = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
      return id
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// const tasksSlice = createSlice({  //se crea un módulo llamado tasks, porque slice es una parte del estado global
//   name: 'tasks', //nombre del slice
//   initialState: {  //no existen tareas
//     list: [], //arreglo donde se guardaran las tareas
//     loading: false,
//     error: null,
//     currentTaskId: null
//   },
//   //list = [{ id: 1, title: 'Estudiar Redux', done: false }]

//   //tipo CRUD
//   reducers: { //cosas que el usuario puede hacer con las tareas // para cargar tareas desde una API o leer desde localStorage
//     setTasks: (state, action) => {
//       state.list = action.payload;
//     }, //aqui se reemplazan todas las tareas por las nuevas
    
//     //agregar nueva tarea al inicio de la lista
//     addTask: (state, action) => {
//       state.list.unshift(action.payload); //unshift: inserta al princpio recordar
//     },

//     //actualizar tarea, se emplea al editar tarea y al marcar una tarea como completada
//     updateTask: (state, action) => {
//         const index = state.list.findIndex(
//             task => task.id === action.payload.id
//         ) //guarda el index
//           //findIndex es una función que recorre array uno por uno aplica condición y retorna la posición del primer elemento que cumpla la condición o -1
//           //Se busca en lista de tareas el index de la tarea cuyo id sea igual al id enviado

//         // function(task) {
//         //     return task.id === action.payload.id
//         // } reemplazado con la funcion flecha de arriba
      
//         if (index !== -1) { //si existe la tarea entonces la reemplaza con la versión actualizada
//             state.list[index] = action.payload;
//         }
//     },

//     //borrar tareas
//     deleteTask: (state, action) => {
//       state.list = state.list.filter(task => task.id !== action.payload) //se borra la tarea cuyo id coincida
//       // filter crea una nueva lista sin esa tarea
//     }
//   }
// })


const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    list: [],
    loading: false,
    error: null,
    currentTaskId: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentTaskId: (state, action) => {
      state.currentTaskId = action.payload
    }
  },
  extraReducers: (builder) => {
    // Fetch tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Create task
    builder
      .addCase(createTask.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false
        state.list.unshift(action.payload)
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Update task
    builder
      .addCase(updateTaskAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateTaskAsync.fulfilled, (state, action) => {
        state.loading = false
        const index = state.list.findIndex(task => task.id === action.payload.id)
        if (index !== -1) {
          state.list[index] = action.payload
        }
        state.currentTaskId = null
      })
      .addCase(updateTaskAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Delete task
    builder
      .addCase(deleteTaskAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteTaskAsync.fulfilled, (state, action) => {
        state.loading = false
        state.list = state.list.filter(task => task.id !== action.payload)
      })
      .addCase(deleteTaskAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

// export const { setTasks, addTask, updateTask, deleteTask } = tasksSlice.actions
// export default tasksSlice.reducer //también se exporta a reducer

// Exportamos las acciones del slice y los thunks
export const { clearError, setCurrentTaskId } = tasksSlice.actions

// Exportamos los thunks para que puedan ser usados en el middleware
// Estos ya están exportados arriba

// Exportamos el reducer
export default tasksSlice.reducer