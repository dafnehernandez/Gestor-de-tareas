import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from './lib/supabase'
import { setTasks, addTask, updateTask, deleteTask } from './store/tasks-slice'
import TaskItem from './components/TaskItem'
import { Palette, User, AlertCircle, Clock, TrendingDown, X, ChevronDown } from 'lucide-react'

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
  const [filtroPrioridad, setFiltroPrioridad] = useState('todas')
  const [mostrarListaNombres, setMostrarListaNombres] = useState(false)

  // Opciones disponibles
  const priorities = [
    { value: 'urgente', label: 'Urgente', icon: <AlertCircle size={16} />, color: 'bg-red-500' },
    { value: 'media', label: 'Media', icon: <Clock size={16} />, color: 'bg-yellow-500' },
    { value: 'baja', label: 'Baja', icon: <TrendingDown size={16} />, color: 'bg-green-500' },
  ]

  // Lista de nombres del equipo
  const nombresEquipo = [
    'Misa', 'Ro', 'Uri', 'Daf', 'Sandra', 'Antonio', 'Fancy', 'Dani'
  ]

  // PALETA DE COLORES ORIGINAL (la que te gustaba) - MÁS ANCHA
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
    setMostrarListaNombres(false)
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

  function seleccionarNombre(nombre) {
    setFormData(prev => ({
      ...prev,
      author: nombre
    }))
    setMostrarListaNombres(false)
  }

  const tareasFiltradas = filtroPrioridad === 'todas' 
    ? tasks 
    : tasks.filter(tarea => tarea.priority === filtroPrioridad)

  // Obtener todos los autores únicos para mostrar
  const autoresUnicos = [...new Set(tasks.map(tarea => tarea.author).filter(Boolean))]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-3 sm:p-4">
      {/* Fondo de corcho */}
      <div className="
        fixed
        inset-0
        bg-[url('https://www.transparenttextures.com/patterns/cork-board.png')]
        opacity-10
        -z-10
      "></div>

      <div className="max-w-7xl mx-auto">
        {/* Header más compacto */}
        <header className="text-center py-4 sm:py-6 mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-amber-900 mb-1">
            📌 Tablero de Notas Desvelados ☕
          </h1>
          <p className="text-amber-700 text-sm sm:text-base">
            Agrega tu nombre, prioridad y elige el color de cada nota
          </p>
        </header>

        {/* Botón flotante para nueva nota */}
        <button
          onClick={() => {
            setEditandoId(null)
            resetForm()
            setMostrarFormulario(true)
          }}
          className="
            fixed
            bottom-6
            right-6
            z-20
            w-14
            h-14
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
            text-2xl
            sm:w-16
            sm:h-16
          "
          title="Nueva nota"
        >
          +
        </button>

        {/* Modal del formulario con paleta original - MÁS ANCHO */}
        {mostrarFormulario && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-2 sm:p-4 z-30 backdrop-blur-sm">
            <div className="
              bg-gradient-to-br from-yellow-50 to-amber-100
              border-2
              border-amber-300
              rounded-xl
              shadow-2xl
              max-w-3xl  /* ANCHO AUMENTADO de max-w-lg a max-w-3xl */
              w-full
              max-h-[90vh]
              overflow-y-auto
              relative
            ">
              {/* Header del modal */}
              <div className="sticky top-0 bg-yellow-100 border-b border-amber-300 p-4 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold text-amber-900">
                  {editandoId ? '✏️ Editar Nota' : '📝 Nueva Nota'}
                </h2>
                <button
                  onClick={cancelarEdicion}
                  className="p-1.5 hover:bg-amber-200 rounded-full transition-colors"
                >
                  <X size={20} className="text-amber-700" />
                </button>
              </div>

              {/* Contenido del formulario */}
              <div className="p-4 sm:p-6">
                <form onSubmit={editandoId ? actualizarTarea : crearTarea}>
                  {/* Campos en grid compacto */}
                  <div className="space-y-4">
                    {/* Nombre y Prioridad en misma fila */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Nombre con selector */}
                      <div className="relative">
                        <label className="block text-amber-800 font-medium mb-1.5 text-sm flex items-center gap-1.5">
                          <User size={14} />
                          Tu nombre (opcional)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="author"
                            placeholder="Selecciona o escribe tu nombre"
                            className="
                              w-full
                              p-3
                              pr-10
                              bg-white
                              border
                              border-amber-300
                              rounded-lg
                              focus:outline-none
                              focus:border-amber-500
                              focus:ring-2
                              focus:ring-amber-200
                              text-sm
                              placeholder-amber-600/50
                              cursor-pointer
                            "
                            value={formData.author}
                            onChange={handleInputChange}
                            onClick={() => setMostrarListaNombres(!mostrarListaNombres)}
                          />
                          <ChevronDown 
                            size={16} 
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-500 cursor-pointer"
                            onClick={() => setMostrarListaNombres(!mostrarListaNombres)}
                          />
                          
                          {/* Lista desplegable de nombres */}
                          {mostrarListaNombres && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-amber-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {/* Nombres del equipo */}
                              <div className="p-2 border-b border-amber-100">
                                <div className="text-xs font-medium text-amber-600 mb-1">Equipo Desvelados</div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                                  {nombresEquipo.map((nombre) => (
                                    <button
                                      key={nombre}
                                      type="button"
                                      onClick={() => seleccionarNombre(nombre)}
                                      className="
                                        text-xs
                                        px-2
                                        py-1.5
                                        bg-amber-50
                                        hover:bg-amber-100
                                        rounded
                                        transition-colors
                                        text-amber-800
                                        truncate
                                      "
                                    >
                                      {nombre}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Autores existentes */}
                              {autoresUnicos.length > 0 && (
                                <div className="p-2">
                                  <div className="text-xs font-medium text-amber-600 mb-1">Autores en notas</div>
                                  <div className="flex flex-wrap gap-1">
                                    {autoresUnicos.map((autor) => (
                                      <button
                                        key={autor}
                                        type="button"
                                        onClick={() => seleccionarNombre(autor)}
                                        className="
                                          text-xs
                                          px-2
                                          py-1.5
                                          bg-blue-50
                                          hover:bg-blue-100
                                          rounded
                                          transition-colors
                                          text-blue-800
                                          truncate
                                        "
                                      >
                                        {autor}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Opción personalizada */}
                              <div className="p-2 border-t border-amber-100">
                                <div className="text-xs text-gray-500">
                                  O escribe un nombre personalizado arriba
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Prioridad */}
                      <div>
                        <label className="block text-amber-800 font-medium mb-1.5 text-sm">
                          Prioridad
                        </label>
                        <div className="flex gap-1">
                          {priorities.map(pri => (
                            <button
                              key={pri.value}
                              type="button"
                              onClick={() => setFormData({...formData, priority: pri.value})}
                              className={`
                                flex-1
                                py-2
                                rounded-lg
                                text-xs
                                font-medium
                                transition-all
                                flex items-center justify-center gap-1
                                ${formData.priority === pri.value 
                                  ? `${pri.color} text-white border border-${pri.color.split('-')[1]}-600 shadow-inner` 
                                  : 'bg-white border border-amber-300 text-gray-700 hover:bg-amber-50'
                                }
                              `}
                            >
                              {pri.icon}
                              <span className="hidden sm:inline">{pri.label}</span>
                              <span className="sm:hidden">{pri.label.charAt(0)}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Título */}
                    <div>
                      <label className="block text-amber-800 font-medium mb-1.5 text-sm">
                        Título *
                      </label>
                      <input
                        type="text"
                        name="title"
                        placeholder="¿De qué se trata esta nota?"
                        className="
                          w-full
                          p-3
                          bg-white
                          border
                          border-amber-300
                          rounded-lg
                          focus:outline-none
                          focus:border-amber-500
                          focus:ring-2
                          focus:ring-amber-200
                          text-sm
                          placeholder-amber-600/50
                        "
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        autoFocus
                      />
                    </div>

                    {/* Contenido - MÁS ANCHO */}
                    <div>
                      <label className="block text-amber-800 font-medium mb-1.5 text-sm">
                        Contenido
                      </label>
                      <textarea
                        name="content"
                        placeholder="Escribe los detalles de tu nota aquí..."
                        className="
                          w-full
                          h-40  /* ALTURA AUMENTADA */
                          p-3
                          bg-white
                          border
                          border-amber-300
                          rounded-lg
                          focus:outline-none
                          focus:border-amber-500
                          focus:ring-2
                          focus:ring-amber-200
                          text-sm
                          placeholder-amber-600/50
                          resize-none
                        "
                        value={formData.content}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* PALETA DE COLORES ORIGINAL - MEJORADA */}
                    <div>
                      <label className="block text-amber-800 font-medium mb-3 text-sm flex items-center gap-1.5">
                        <Palette size={14} />
                        Color de la nota
                      </label>
                      
                      {/* Indicador del color seleccionado */}
                      <div className="mb-4 p-3 bg-white/80 rounded-lg border border-amber-200">
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-10 h-10
                            rounded-lg
                            ${colors.find(c => c.value === formData.note_color)?.bg || 'bg-yellow-100'}
                            ${colors.find(c => c.value === formData.note_color)?.border || 'border-yellow-300'}
                            border-2
                            shadow-inner
                          `}></div>
                          <div>
                            <div className="text-sm font-medium text-amber-800">
                              Color seleccionado
                            </div>
                            <div className="text-xs text-amber-600">
                              {colors.find(c => c.value === formData.note_color)?.label || 'Amarillo'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Grid de colores - ESTILO ORIGINAL MEJORADO */}
                      <div className="grid grid-cols-4 gap-3">
                        {colors.map(color => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setFormData({...formData, note_color: color.value})}
                            className={`
                              ${color.bg}
                              ${color.border}
                              h-12
                              rounded-lg
                              border-2
                              transition-all
                              duration-200
                              flex items-center justify-center
                              relative
                              ${formData.note_color === color.value 
                                ? 'scale-105 shadow-lg ring-2 ring-amber-500 ring-offset-1' 
                                : 'hover:scale-105 hover:shadow-md'
                              }
                              group
                            `}
                            title={color.label}
                          >
                            {/* Indicador de selección */}
                            {formData.note_color === color.value && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center shadow-lg">
                                <div className="text-white text-xs">✓</div>
                              </div>
                            )}
                            
                           
                          </button>
                        ))}
                      </div>
                      
                      
                    </div>

                    {/* Botones - MÁS SEPARADOS */}
                    <div className="flex gap-4 pt-6">
                      <button
                        type="submit"
                        className="
                          flex-1
                          py-4  /* MÁS ALTO */
                          bg-gradient-to-r from-amber-500 to-orange-500
                          text-white
                          font-bold
                          text-lg  /* TEXTO MÁS GRANDE */
                          rounded-xl
                          hover:from-amber-600 hover:to-orange-600
                          transition-all
                          shadow-xl
                          hover:shadow-2xl
                          hover:scale-[1.02]
                          active:scale-95
                        "
                      >
                        {editandoId ? '📌 Actualizar Nota' : '📌 Crear Nueva Nota'}
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
                          rounded-xl
                          hover:bg-gray-300
                          transition-colors
                          hover:shadow-lg
                          text-base
                        "
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Tablero de notas - más compacto */}
        <div className="
          relative
          p-4 sm:p-6
          rounded-2xl
          bg-amber-100/40
          border-4
          border-amber-900/10
        ">
          {/* Grid de notas más compacto */}
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-white/90 rounded-xl shadow-lg">
                <p className="text-xl text-amber-800 mb-2">
                  📝 ¡Crea tu primera nota!
                </p>
                <p className="text-amber-600 text-sm">
                  Haz clic en el botón + para comenzar
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
              gap-4 sm:gap-6
              justify-items-center
            ">
              {tareasFiltradas.map((tarea, index) => (
                <div 
                  key={tarea.id}
                  className={`
                    ${index % 3 === 0 ? 'transform rotate-[-1.5deg]' : ''}
                    ${index % 4 === 0 ? 'transform rotate-[1deg]' : ''}
                    ${index % 5 === 0 ? 'transform rotate-[-0.5deg]' : ''}
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

        {/* Filtros y estadísticas - versión compacta */}
        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            <button
              onClick={() => setFiltroPrioridad('todas')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
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
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
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

          {/* Estadísticas compactas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <div className="text-xl font-bold text-amber-700">{tasks.length}</div>
              <div className="text-xs text-amber-600">Total</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-xl font-bold text-red-700">
                {tasks.filter(t => t.priority === 'urgente').length}
              </div>
              <div className="text-xs text-red-600">Urgentes</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-xl font-bold text-yellow-700">
                {tasks.filter(t => t.priority === 'media').length}
              </div>
              <div className="text-xs text-yellow-600">Medias</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-700">
                {tasks.filter(t => t.priority === 'baja').length}
              </div>
              <div className="text-xs text-green-600">Bajas</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-6 text-center text-amber-600/70 text-sm">
          <p>Hecho con amor para Devsvelados ♥ by: Daffy</p>
          <p className="mt-1 text-xs">Notas se actualizan en tiempo real</p>
        </footer>
      </div>
    </div>
  )
}

export default App