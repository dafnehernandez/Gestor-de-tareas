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
      state.list = action.payload;
    }, //aqui se reemplazan todas las tareas por las nuevas
    
    //agregar nueva tarea al inicio de la lista
    addTask: (state, action) => {
      state.list.unshift(action.payload); //unshift: inserta al princpio recordar
    },

    //actualizar tarea, se emplea al editar tarea y al marcar una tarea como completada
    updateTask: (state, action) => {
        const index = state.list.findIndex(
            task => task.id === action.payload.id
        ) //guarda el index
          //findIndex es una función que recorre array uno por uno aplica condición y retorna la posición del primer elemento que cumpla la condición o -1
          //Se busca en lista de tareas el index de la tarea cuyo id sea igual al id enviado

        // function(task) {
        //     return task.id === action.payload.id
        // } reemplazado con la funcion flecha de arriba
      
        if (index !== -1) { //si existe la tarea entonces la reemplaza con la versión actualizada
            state.list[index] = action.payload;
        }
    },

    //borrar tareas
    deleteTask: (state, action) => {
      state.list = state.list.filter(task => task.id !== action.payload) //se borra la tarea cuyo id coincida
      // filter crea una nueva lista sin esa tarea
    }
  }
})

export const { setTasks, addTask, updateTask, deleteTask } = tasksSlice.actions
export default tasksSlice.reducer //también se exporta a reducer