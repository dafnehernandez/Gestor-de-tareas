import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from './lib/supabase'
import { setTasks, addTask, updateTask, deleteTask } from './store/tasks-slice'
import TaskItem from './components/TaskItem'
import { Palette, User, AlertCircle, Clock, TrendingDown } from 'lucide-react'

function App() {
  const dispatch = useDispatch()
  const tasks = useSelector(state => state.tasks.list)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    priority: 'media',
    note_color: 'yellow'
  })
  const [editandoId, setEditandoId] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  // Opciones disponibles
  const priorities = [
    { value: 'urgente', label: 'Urgente', icon: <AlertCircle size={18} />, color: 'bg-red-500' },
    { value: 'media', label: 'Media', icon: <Clock size={18} />, color: 'bg-yellow-500' },
    { value: 'baja', label: 'Baja', icon: <TrendingDown size={18} />, color: 'bg-green-500' },
  ]

  const colors = [
    { value: 'yellow', label: 'Amarillo', bg: 'bg-yellow-100', border: 'border-yellow-300' },
    { value: 'blue', label: 'Azul', bg: 'bg-blue-100', border: 'border-blue-300' },
    { value: 'green', label: 'Verde', bg: 'bg-green-100', border: 'border-green-300' },
    { value: 'pink', label: 'Rosa', bg: 'bg-pink-100', border: 'border-pink-300' },
    { value: 'purple', label: 'Morado', bg: 'bg-purple-100', border: 'border-purple-300' },
    { value: 'orange', label: 'Naranja', bg: 'bg-orange-100', border: 'border-orange-300' },
    { value: 'red', label: 'Rojo', bg: 'bg-red-100', border: 'border-red-300' },
    { value: 'teal', label: 'Turquesa', bg: 'bg-teal-100', border: 'border-teal-300' },
  ]

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
    if (!formData.title.trim()) return

    try {
      const nuevaTarea = {
        title: formData.title,
        content: formData.content,
        author: formData.author,
        priority: formData.priority,
        note_color: formData.note_color,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([nuevaTarea])
        .select()
        .single()

      if (error) throw error
      
      dispatch(addTask(data))
      resetForm()
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
    setFormData({
      title: tarea.title || '',
      content: tarea.content || '',
      author: tarea.author || '',
      priority: tarea.priority || 'media',
      note_color: tarea.note_color || 'yellow'
    })
    setMostrarFormulario(true)
  }

  async function actualizarTarea(e) {
    e.preventDefault()
    if (!formData.title.trim()) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          title: formData.title,
          content: formData.content,
          author: formData.author,
          priority: formData.priority,
          note_color: formData.note_color,
          updated_at: new Date().toISOString()
        })
        .eq('id', editandoId)
        .select()
        .single()

      if (error) throw error
      
      dispatch(updateTask(data))
      resetForm()
      setEditandoId(null)
      setMostrarFormulario(false)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      content: '',
      author: '',
      priority: 'media',
      note_color: 'yellow'
    })
  }

  function cancelarEdicion() {
    setEditandoId(null)
    resetForm()
    setMostrarFormulario(false)
  }

  function handleInputChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Filtrar tareas por prioridad
  const [filtroPrioridad, setFiltroPrioridad] = useState('todas')
  
  const tareasFiltradas = filtroPrioridad === 'todas' 
    ? tasks 
    : tasks.filter(tarea => tarea.priority === filtroPrioridad)

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
        <header className="text-center py-8 mb-6">
          <h1 className="text-5xl font-bold text-amber-900 mb-2">
            📌 Tablero de Notas Desvelados ☕
          </h1>
          <p className="text-amber-700 text-xl">
            Agrega tu nombre, prioridad y elige el color de cada nota
          </p>
        </header>

        {/* Filtros y estadísticas */}
        <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <div className="flex flex-wrap justify-between items-center gap-4">
            {/* Filtros de prioridad */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFiltroPrioridad('todas')}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  filtroPrioridad === 'todas' 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Todas ({tasks.length})
              </button>
              {priorities.map(pri => (
                <button
                  key={pri.value}
                  onClick={() => setFiltroPrioridad(pri.value)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${
                    filtroPrioridad === pri.value 
                      ? `${pri.color} text-white` 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {pri.icon}
                  {pri.label} ({tasks.filter(t => t.priority === pri.value).length})
                </button>
              ))}
            </div>

            {/* Botón nueva nota */}
            <button
              onClick={() => {
                setEditandoId(null)
                resetForm()
                setMostrarFormulario(true)
              }}
              className="
                px-6
                py-3
                bg-amber-500
                text-white
                font-semibold
                rounded-full
                shadow-lg
                hover:bg-amber-600
                hover:scale-105
                transition-all
                duration-300
                flex
                items-center
                gap-2
              "
            >
              <span className="text-xl">+</span>
              Nueva Nota
            </button>
          </div>
        </div>

        {/* Modal del formulario */}
        {mostrarFormulario && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-30">
            <div className="
              bg-yellow-100
              border-2
              border-amber-300
              rounded-xl
              shadow-2xl
              max-w-2xl
              w-full
              p-8
              relative
              transform
              rotate-[-0.5deg]
            ">
              {/* Chincheta */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="w-8 h-8 bg-gray-500 rounded-full"></div>
              </div>

              <h2 className="text-3xl font-bold mb-6 text-amber-900 text-center">
                {editandoId ? '✏️ Editar Nota' : '📝 Crear Nueva Nota'}
              </h2>
              
              <form onSubmit={editandoId ? actualizarTarea : crearTarea}>
                {/* Nombre del autor */}
                <div className="mb-6">
                  <label className="block text-amber-800 font-medium mb-2 flex items-center gap-2">
                    <User size={18} />
                    Tu nombre (opcional)
                  </label>
                  <input
                    type="text"
                    name="author"
                    placeholder="¿Quién crea esta nota?"
                    className="
                      w-full
                      p-4
                      bg-white/80
                      border-2
                      border-amber-300
                      rounded-lg
                      focus:outline-none
                      focus:border-amber-500
                      focus:ring-2
                      focus:ring-amber-200
                      placeholder-amber-600/50
                    "
                    value={formData.author}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Título */}
                <div className="mb-6">
                  <label className="block text-amber-800 font-medium mb-2">
                    Título de la nota *
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="¿De qué se trata esta nota?"
                    className="
                      w-full
                      p-4
                      bg-white/80
                      border-2
                      border-amber-300
                      rounded-lg
                      focus:outline-none
                      focus:border-amber-500
                      focus:ring-2
                      focus:ring-amber-200
                      placeholder-amber-600/50
                    "
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Contenido */}
                <div className="mb-6">
                  <label className="block text-amber-800 font-medium mb-2">
                    Contenido
                  </label>
                  <textarea
                    name="content"
                    placeholder="Escribe los detalles de tu nota..."
                    className="
                      w-full
                      h-48
                      p-4
                      bg-white/80
                      border-2
                      border-amber-300
                      rounded-lg
                      focus:outline-none
                      focus:border-amber-500
                      focus:ring-2
                      focus:ring-amber-200
                      placeholder-amber-600/50
                      resize-none
                    "
                    rows="4"
                    value={formData.content}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Prioridad y Color en misma fila */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Prioridad */}
                  <div>
                    <label className="block text-amber-800 font-medium mb-3">
                      Prioridad
                    </label>
                    <div className="flex gap-2">
                      {priorities.map(pri => (
                        <button
                          key={pri.value}
                          type="button"
                          onClick={() => setFormData({...formData, priority: pri.value})}
                          className={`
                            flex-1
                            py-3
                            rounded-lg
                            font-medium
                            transition-all
                            flex flex-col items-center gap-1
                            ${formData.priority === pri.value 
                              ? `${pri.color} text-white border-2 border-${pri.color.split('-')[1]}-600` 
                              : 'bg-white border-2 border-amber-300 text-gray-700 hover:bg-amber-50'
                            }
                          `}
                        >
                          {pri.icon}
                          <span>{pri.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color de nota */}
                  <div>
                    <label className="block text-amber-800 font-medium mb-3 flex items-center gap-2">
                      <Palette size={18} />
                      Color de la nota
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {colors.map(color => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setFormData({...formData, note_color: color.value})}
                          className={`
                            h-12
                            rounded-lg
                            border-2
                            transition-all
                            flex items-center justify-center
                            ${color.bg}
                            ${formData.note_color === color.value 
                              ? 'border-amber-700 scale-105 shadow-lg' 
                              : 'border-transparent hover:scale-105'
                            }
                          `}
                          title={color.label}
                        >
                          {formData.note_color === color.value && (
                            <div className="w-6 h-6 bg-white/30 rounded-full"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="
                      flex-1
                      py-4
                      bg-amber-500
                      text-white
                      font-bold
                      text-lg
                      rounded-lg
                      hover:bg-amber-600
                      transition-colors
                      shadow-lg
                    "
                  >
                    {editandoId ? '📌 Actualizar Nota' : '📌 Crear Nota'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={cancelarEdicion}
                    className="
                      px-8
                      py-4
                      bg-gray-200
                      text-gray-700
                      font-medium
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
          min-h-[600px]
          p-8
          rounded-3xl
          bg-amber-100/50
          border-8
          border-amber-900/20
          shadow-inner
        ">
          {/* Grid de notas */}
          {tareasFiltradas.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-block p-8 bg-white/80 rounded-2xl shadow-lg">
                <p className="text-2xl text-amber-800 mb-2">
                  {filtroPrioridad === 'todas' 
                    ? '📝 ¡No hay notas aún!' 
                    : `📭 No hay notas con prioridad ${filtroPrioridad}`
                  }
                </p>
                <p className="text-amber-600">
                  {filtroPrioridad === 'todas' 
                    ? 'Crea tu primera nota personalizada' 
                    : 'Cambia el filtro o crea una nueva nota'
                  }
                </p>
              </div>
            </div>
          ) : (
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
              {tareasFiltradas.map((tarea, index) => (
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
          )}
        </div>

        {/* Estadísticas */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-3xl font-bold text-amber-700">{tasks.length}</div>
              <div className="text-amber-600">Total notas</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-700">
                {tasks.filter(t => t.priority === 'urgente').length}
              </div>
              <div className="text-red-600">Urgentes</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-700">
                {tasks.filter(t => t.priority === 'media').length}
              </div>
              <div className="text-yellow-600">Medias</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-700">
                {tasks.filter(t => t.priority === 'baja').length}
              </div>
              <div className="text-green-600">Bajas</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-amber-600/70 text-sm">
          <p className="mt-1">Hecho con amor para devsvelados ♥ by: Daffy </p>
        </footer>
      </div>
    </div>
  )
}

export default App