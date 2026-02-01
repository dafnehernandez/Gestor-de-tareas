import { supabase } from '../../lib/supabase'
import { fetchTasks } from '../tasksSlice'

export const supabaseMiddleware = store => next => action => {
  const result = next(action)
  
  // Inicializar suscripción solo una vez cuando se monte la app
  if (action.type === 'tasks/fetchTasks/fulfilled' && !store.getState().tasks.subscription) {
    const channel = supabase
      .channel('tareas')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' }, 
        () => {
          // Refrescar tareas cuando hay cambios en la BD
          store.dispatch(fetchTasks())
        }
      )
      .subscribe()
    
    // Guardar referencia al channel en el estado si se desea
    // O manejarlo internamente
  }
  
  return result
}