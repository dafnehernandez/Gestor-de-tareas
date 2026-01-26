import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from './lib/supabase'
import { setTasks, addTask, updateTask, deleteTask } from './store/tasks-slice'
import TaskItem from './components/TaskItem'

function App() {
  const dispatch = useDispatch()
  const tasks = useSelector(state => state.tasks.list)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

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
      setMostrarFormulario(false)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  async function borrarTarea(id) {
    if (!window.confirm('¿Seguro que quieres borrar esta nota?')) return
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
      dispatch(deleteTask(id))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  function empezarEditar(tarea) {
    setEditandoId(tarea.id)
    setTitulo(tarea.title)
    setDescripcion(tarea.content || '')
    setMostrarFormulario(true)
  }

  async function actualizarTarea(e) {
    e.preventDefault()
    if (!titulo.trim()) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          title: titulo,
          content: descripcion,
          updated_at: new Date().toISOString()
        })
        .eq('id', editandoId)
        .select()
        .single()

      if (error) throw error
      
      dispatch(updateTask(data))
      setTitulo('')
      setDescripcion('')
      setEditandoId(null)
      setMostrarFormulario(false)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  function cancelarEdicion() {
    setEditandoId(null)
    setTitulo('')
    setDescripcion('')
    setMostrarFormulario(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      {/* Fondo de corcho */}
      <div className="
        fixed
        inset-0
        bg-[url('https://www.transparenttextures.com/patterns/cork-board.png')]
        opacity-10
        -z-10
      "></div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center py-8 mb-12">
          <h1 className="text-5xl font-bold text-amber-900 mb-4">
            📌 Tablero de Notas
          </h1>
          <p className="text-amber-700 text-xl">
            Tus ideas importantes, como notas en un tablero
          </p>
        </header>

        {/* Botón para nueva nota (flotante) */}
        <button
          onClick={() => {
            setEditandoId(null)
            setTitulo('')
            setDescripcion('')
            setMostrarFormulario(true)
          }}
          className="
            fixed
            bottom-8
            right-8
            z-20
            w-16
            h-16
            bg-amber-500
            text-white
            rounded-full
            shadow-2xl
            hover:bg-amber-600
            hover:scale-110
            transition-all
            duration-300
            flex
            items-center
            justify-center
            text-3xl
          "
          title="Nueva nota"
        >
          +
        </button>

        {/* Modal del formulario */}
        {mostrarFormulario && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-30">
            <div className="
              bg-yellow-100
              border-2
              border-amber-300
              rounded-lg
              shadow-2xl
              max-w-md
              w-full
              p-6
              relative
              transform
              rotate-[-1deg]
            ">
              {/* Chincheta del formulario */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
              </div>

              <h2 className="text-2xl font-bold mb-6 text-amber-900">
                {editandoId ? '✏️ Editar Nota' : '📝 Nueva Nota'}
              </h2>
              
              <form onSubmit={editandoId ? actualizarTarea : crearTarea}>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Título de la nota..."
                    className="
                      w-full
                      p-3
                      bg-transparent
                      border-b-2
                      border-amber-300
                      text-lg
                      focus:outline-none
                      focus:border-amber-500
                      placeholder-amber-600/50
                    "
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                
                <div className="mb-6">
                  <textarea
                    placeholder="Escribe tu contenido aquí..."
                    className="
                      w-full
                      h-48
                      p-3
                      bg-transparent
                      border-2
                      border-dashed
                      border-amber-300
                      rounded
                      focus:outline-none
                      focus:border-amber-500
                      resize-none
                      placeholder-amber-600/50
                    "
                    rows="4"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="
                      flex-1
                      py-3
                      bg-amber-500
                      text-white
                      font-semibold
                      rounded-lg
                      hover:bg-amber-600
                      transition-colors
                    "
                  >
                    {editandoId ? 'Actualizar' : 'Pegar Nota'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={cancelarEdicion}
                    className="
                      px-6
                      py-3
                      bg-gray-200
                      text-gray-700
                      rounded-lg
                      hover:bg-gray-300
                      transition-colors
                    "
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tablero de notas */}
        <div className="
          relative
          min-h-[500px]
          p-8
          rounded-3xl
          bg-amber-100/50
          border-8
          border-amber-900/20
          shadow-inner
        ">
          {/* Grid de notas */}
          <div className="
            grid
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-5
            gap-8
            justify-items-center
          ">
            {tasks.map((tarea, index) => (
              <div 
                key={tarea.id}
                className={`
                  ${index % 3 === 0 ? 'transform rotate-[-3deg]' : ''}
                  ${index % 4 === 0 ? 'transform rotate-[2deg]' : ''}
                  ${index % 5 === 0 ? 'transform rotate-[-1deg]' : ''}
                  hover:z-10
                  transition-transform
                  duration-300
                `}
              >
                <TaskItem
                  task={tarea}
                  onEdit={empezarEditar}
                  onDelete={borrarTarea}
                />
              </div>
            ))}
          </div>

          {/* Mensaje cuando no hay notas */}
          {tasks.length === 0 && (
            <div className="
              text-center
              py-20
              text-amber-800/50
              text-2xl
              font-semibold
            ">
              <div className="inline-block p-8 bg-white/50 rounded-2xl shadow-lg rotate-3">
                📝 ¡No hay notas aún! <br/>
                <span className="text-lg">Crea tu primera nota</span>
              </div>
            </div>
          )}
        </div>

        {/* Contador */}
        <div className="
          mt-8
          text-center
          text-amber-700
          text-lg
          font-semibold
        ">
          {tasks.length === 0 
            ? 'Tablero vacío' 
            : `Tienes ${tasks.length} nota${tasks.length !== 1 ? 's' : ''} en el tablero`
          }
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