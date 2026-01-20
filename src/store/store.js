import { configureStore } from '@reduxjs/toolkit' 
import tasksReducer from './tasksSlice' 

export const store = configureStore({ //libreta central-> store aqui se guardan datos globales
  reducer: {
    tasks: tasksReducer //reglas para manejar las tareas, definirá cómo agregar, eliminar o editar
    //tasks: aqui se guardan todas las tareas
  }
})

//Existe una store que es global de Redux
//dentro de lo global existe una sección slice llamada tasks
//todo se gestiona por un taskreducer