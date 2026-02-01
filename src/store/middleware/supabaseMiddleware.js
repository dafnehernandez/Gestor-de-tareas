import { supabase } from '../../lib/supabase'
import { fetchTasks } from '../tasksSlice'

let channelInitialized = false

export const supabaseMiddleware = store => next => action => {
  const result = next(action)

  // Inicializar realtime SOLO UNA VEZ
  if (!channelInitialized) {
    channelInitialized = true

    console.log('[Realtime] Initializing channel')

    supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasksAdvanced',
        },
        (payload) => {
          console.log('[Realtime] Event received:', payload)
          store.dispatch(fetchTasks())
        }
      )
      .subscribe()
  }

  return result
}

//LEGACY//
// import { supabase } from '../../lib/supabase'
// import { fetchTasks } from '../tasksSlice'

// export const supabaseMiddleware = store => next => action => {
//   const result = next(action)
  
//   // Inicializar suscripción solo una vez cuando se monte la app
//   if (action.type === 'tasks/fetchTasks/fulfilled' && !store.getState().tasks.subscription) {
//     const channel = supabase
//       .channel('tareas')
//       .on('postgres_changes', 
//         { event: '*', schema: 'public', table: 'tasksAdvanced' }, 
//         () => {
//           // Refrescar tareas cuando hay cambios en la BD
//           store.dispatch(fetchTasks())
//         }
//       )
//       .subscribe()
    
//     // Guardar referencia al channel en el estado si se desea
//     // O manejarlo internamente
//   }
  
//   return result
// }