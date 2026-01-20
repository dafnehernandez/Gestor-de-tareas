import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from './lib/supabase'
import { setTasks, addTask, updateTask, deleteTask } from './store/tasks-slice'

function App() {
  const dispatch = useDispatch()
  const tasks = useSelector(state => state.tasks.list)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [editandoId, setEditandoId] = useState(null)

  // Cargar tareas al iniciar
  useEffect(() => {
    cargarTareas()
    escucharCambios()
  }, [])

  async function cargarTareas() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      dispatch(setTasks(data || []))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  function escucharCambios() {
    supabase
      .channel('tareas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, 
        () => {
          cargarTareas()
        }
      )
      .subscribe()
  }

  async function crearTarea(e) {
    e.preventDefault()
    if (!titulo.trim()) return

    try {
      const nuevaTarea = {
        title: titulo,
        content: descripcion,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([nuevaTarea])
        .select()
        .single()

      if (error) throw error
      
      dispatch(addTask(data))
      setTitulo('')
      setDescripcion('')
    } catch (error) {
      console.error('Error:', error)
    }
  }

  function empezarEditar(tarea) {
    setEditandoId(tarea.id)
    setTitulo(tarea.title)
    setDescripcion(tarea.content || '')
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📝 Mis Tareas</h1>
          <p className="text-gray-600">Gestor simple con React + Redux + Supabase</p>
        </header>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            {editandoId ? '✏️ Editar Tarea' : '➕ Nueva Tarea'}
          </h2>
          
          <form onSubmit={editandoId ? actualizarTarea : crearTarea}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="¿Qué necesitas hacer?"
                className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-6">
              <textarea
                placeholder="Detalles (opcional)"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                rows="3"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-lg"
              >
                {editandoId ? 'Actualizar' : 'Crear Tarea'}
              </button>
              
              {editandoId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditandoId(null)
                    setTitulo('')
                    setDescripcion('')
                  }}
                  className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 font-medium"
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
          
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No hay tareas todavía</p>
              <p className="text-gray-400 mt-2">¡Empieza creando tu primera tarea!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map(tarea => (
                <div 
                  key={tarea.id} 
                  className="border-2 border-gray-100 rounded-xl p-5 hover:border-blue-200 hover:shadow-md transition-all"
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
                        onClick={() => borrarTarea(tarea.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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
          <p className="mt-1">Hecho con React, Redux, Tailwind y Supabase</p>
        </footer>
      </div>
    </div>
  )
}

export default App