import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTasks, createTask, updateTaskAsync, deleteTaskAsync, setCurrentTaskId, clearError } from './store/tasksSlice'

function App() {
  const dispatch = useDispatch();
  const { list: tasks, loading, error, currentTaskId } = useSelector(state => state.tasks);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [localError, setLocalError] = useState('');
  const editandoId = currentTaskId;

  // Cargar tareas al iniciar
  useEffect(() => {
    dispatch(fetchTasks())
  }, [dispatch])

  // Sincronizar error de Redux con estado local
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError())
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, dispatch])

  // Limpiar formulario cuando se completa una operación
  useEffect(() => {
    if (!loading && !error) {
      // Si no hay error y no está cargando, limpiar formulario
      if (currentTaskId && !loading) {
        setTitulo('')
        setDescripcion('')
        dispatch(setCurrentTaskId(null))
      }
    }
  }, [loading, error, currentTaskId, dispatch])

  // async function cargarTareas() {
  //   try {
  //     const { data, error } = await supabase
  //       .from('tasks')
  //       .select('*')
  //       .order('created_at', { ascending: false })
      
  //     if (error) throw error
  //     dispatch(setTasks(data || []))
  //   } catch (error) {
  //     console.error('Error:', error)
  //   }
  // }

  // function escucharCambios() {
  //   supabase
  //     .channel('tareas')
  //     .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, 
  //       () => {
  //         cargarTareas()
  //       }
  //     )
  //     .subscribe()
  // }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!titulo.trim()) return

    const taskData = {
      title: titulo,
      content: descripcion,
      created_at: new Date().toISOString()
    }

    if (editandoId) {
      dispatch(updateTaskAsync({
        id: editandoId,
        updates: {
          ...taskData,
          updated_at: new Date().toISOString()
        }
      }))
    } else {
      dispatch(createTask(taskData))
    }

    // No limpiar aquí, se maneja en el useEffect
  }

  function empezarEditar(tarea) {
    dispatch(setCurrentTaskId(tarea.id))
    setTitulo(tarea.title)
    setDescripcion(tarea.content || '')
  }

  function cancelarEdicion() {
    dispatch(setCurrentTaskId(null))
    setTitulo('')
    setDescripcion('')
  }

  function handleBorrar(id) {
    if (window.confirm('¿Seguro que quieres borrar?')) {
      dispatch(deleteTaskAsync(id))
    }
  }

  // async function crearTarea(e) {
  //   e.preventDefault()
  //   if (!titulo.trim()) return

  //   try {
  //     const nuevaTarea = {
  //       title: titulo,
  //       content: descripcion,
  //       created_at: new Date().toISOString()
  //     }

  //     const { data, error } = await supabase
  //       .from('tasks')
  //       .insert([nuevaTarea])
  //       .select()
  //       .single()

  //     if (error) throw error
      
  //     dispatch(addTask(data))
  //     setTitulo('')
  //     setDescripcion('')
  //   } catch (error) {
  //     console.error('Error:', error)
  //   }
  // }

  // async function borrarTarea(id) {
  //   if (!window.confirm('¿Seguro que quieres borrar?')) return
    
  //   try {
  //     const { error } = await supabase
  //       .from('tasks')
  //       .delete()
  //       .eq('id', id)

  //     if (error) throw error
  //     dispatch(deleteTask(id))
  //   } catch (error) {
  //     console.error('Error:', error)
  //   }
  // }

  // function empezarEditar(tarea) {
  //   setEditandoId(tarea.id)
  //   setTitulo(tarea.title)
  //   setDescripcion(tarea.content || '')
  // }

  // async function actualizarTarea(e) {
  //   e.preventDefault()
  //   if (!titulo.trim()) return

  //   try {
  //     const { data, error } = await supabase
  //       .from('tasks')
  //       .update({
  //         title: titulo,
  //         content: descripcion,
  //         updated_at: new Date().toISOString()
  //       })
  //       .eq('id', editandoId)
  //       .select()
  //       .single()

  //     if (error) throw error
      
  //     dispatch(updateTask(data))
  //     setTitulo('')
  //     setDescripcion('')
  //     setEditandoId(null)
  //   } catch (error) {
  //     console.error('Error:', error)
  //   }
  // }

   return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📝 Mis Tareas</h1>
          <p className="text-gray-600">Gestor simple con React + Redux + Supabase</p>
        </header>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
            <p className="font-medium">Error: {error}</p>
          </div>
        )}

        {/* Indicador de carga */}
        {loading && (
          <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-xl text-center">
            <p>Cargando...</p>
          </div>
        )}

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            {editandoId ? '✏️ Editar Tarea' : '➕ Nueva Tarea'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="¿Qué necesitas hacer?"
                className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="mb-6">
              <textarea
                placeholder="Detalles (opcional)"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                rows="3"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                className={`px-6 py-3 rounded-xl font-medium text-lg ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
                disabled={loading}
              >
                {editandoId ? 'Actualizar' : 'Crear Tarea'}
                {loading && '...'}
              </button>
              
              {editandoId && (
                <button
                  type="button"
                  onClick={cancelarEdicion}
                  className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 font-medium"
                  disabled={loading}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Lista de tareas */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            📋 Tus Tareas ({tasks.length})
          </h2>
          
          {loading && tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Cargando tareas...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No hay tareas todavía</p>
              <p className="text-gray-400 mt-2">¡Empieza creando tu primera tarea!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map(tarea => (
                <div 
                  key={tarea.id} 
                  className={`border-2 rounded-xl p-5 transition-all ${
                    tarea.id === editandoId
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-100 hover:border-blue-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-800">{tarea.title}</h3>
                      {tarea.content && (
                        <p className="text-gray-600 mt-2">{tarea.content}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span>📅 {new Date(tarea.created_at).toLocaleDateString()}</span>
                        <span className={`px-3 py-1 rounded-full ${tarea.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {tarea.status === 'completed' ? 'Completada' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => empezarEditar(tarea)}
                        className={`px-4 py-2 rounded-lg text-white ${
                          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'
                        }`}
                        disabled={loading}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleBorrar(tarea.id)}
                        className={`px-4 py-2 rounded-lg text-white ${
                          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
                        }`}
                        disabled={loading}
                      >
                        Borrar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Usando patrón FLUX con Redux Toolkit</p>
          <p className="mt-1">Hecho con React, Redux, Tailwind y Supabase</p>
        </footer>
      </div>
    </div>
  )
}

export default App