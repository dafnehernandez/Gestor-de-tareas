import { createSlice } from '@reduxjs/toolkit' //createslice: crea estado y funciones para modificarlo

const tasksSlice = createSlice({  //se crea un módulo llamado tasks, porque slice es una parte del estado global
  name: 'tasks', //nombre del slice
  initialState: {  //no existen tareas
    list: [] //arreglo donde se guardaran las tareas
  },
  //list = [{ id: 1, title: 'Estudiar Redux', done: false }]

  //tipo CRUD
  reducers: { //cosas que el usuario puede hacer con las tareas // para cargar tareas desde una API o leer desde localStorage
    setTasks: (state, action) => {
      state.list = action.payload
    }, //aqui se reemplazan todas las tareas por las nuevas
    
    //agregar nueva tarea al inicio de la lista
    addTask: (state, action) => {
      state.list.unshift(action.payload) //unshift: inserta al princpio recordar
    },
  }
})

export const { setTasks, addTask, updateTask, deleteTask } = tasksSlice.actions
export default tasksSlice.reducer