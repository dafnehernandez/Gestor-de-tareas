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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📝 Mis Tareas</h1>
          <p className="text-gray-600">Gestor simple con React + Redux + Supabase</p>
        </header>

        {/* Lista de tareas */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            📋 Tus Tareas ({tasks.length})
          </h2>
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