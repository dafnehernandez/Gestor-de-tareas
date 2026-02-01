import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTasks, createTask, updateTaskAsync, deleteTaskAsync, toggleTaskStatus, setCurrentTaskId, clearError, setFilter, selectFilteredTasks } from './store/tasksSlice'

function App() {
  const dispatch = useDispatch();
  const { loading, error, currentTaskId, filter } = useSelector(state => state.tasks);
  const tasks = useSelector(selectFilteredTasks); // Usamos el selector filtrado
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [localError, setLocalError] = useState('');
  const editandoId = currentTaskId;

  // Cargar tareas al iniciar
  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  // Sincronizar error de Redux con estado local
  useEffect(() => {
    if (error) {
      setLocalError(error)
      const timer = setTimeout(() => {
        setLocalError('')
        dispatch(clearError());
      }, 5000)
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Limpiar formulario cuando se completa una operación
  useEffect(() => {
    // Si no está cargando y no hay currentTaskId, significa que se completó la edición
    if (!loading && !currentTaskId && editandoId) {
      setTitulo('');
      setDescripcion('');
    }
  }, [loading, currentTaskId, editandoId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!titulo.trim()) {
      setLocalError('El título es requerido');
      setTimeout(() => setLocalError(''), 3000);
      return;
    }

    if (editandoId) {
      // Para editar, solo enviar los campos que cambian
      dispatch(updateTaskAsync({
        id: editandoId,
        updates: {
          title: titulo,
          content: descripcion,
          updated_at: new Date().toISOString()
        }
      }));
    } else {
      // Para crear, enviar todos los campos
      dispatch(createTask({
        title: titulo,
        content: descripcion,
        created_at: new Date().toISOString()
      }));
    }
    // No limpiar aquí, se maneja en el useEffect
  }

  function empezarEditar(tarea) {
    dispatch(setCurrentTaskId(tarea.id));
    setTitulo(tarea.title);
    setDescripcion(tarea.content || '');
  }

  function cancelarEdicion() {
    dispatch(setCurrentTaskId(null));
    setTitulo('');
    setDescripcion('');
  }

  function handleBorrar(id) {
    if (window.confirm('¿Seguro que quieres borrar?')) {
      dispatch(deleteTaskAsync(id));
    }
  }

  function handleToggleStatus(id) {
    dispatch(toggleTaskStatus(id));
  }

  function handleFilterChange(newFilter) {
    dispatch(setFilter(newFilter));
  }

  // Calcular estadísticas
  const totalTareas = useSelector(state => state.tasks.list).length;
  const tareasPendientes = useSelector(state => 
    state.tasks.list.filter(t => t.status === 'pendiente').length);
  const tareasCompletadas = useSelector(state => 
    state.tasks.list.filter(t => t.status === 'completada').length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📝 Gestor de Tareas</h1>
          <p className="text-gray-600">Con estados y filtros - React + Redux + Supabase</p>
        </header>

        {/* Mensaje de error */}
        {localError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
            <p className="font-medium">Error: {localError}</p>
          </div>
        )}

        {/* Indicador de carga */}
        {loading && (
          <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-xl text-center">
            <p>{editandoId ? 'Actualizando tarea...' : 'Cargando...'}</p>
          </div>
        )}

        {/* Estadísticas */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">📊 Estadísticas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-xl text-center">
              <p className="text-3xl font-bold text-blue-600">{totalTareas}</p>
              <p className="text-gray-600">Total de tareas</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-xl text-center">
              <p className="text-3xl font-bold text-yellow-600">{tareasPendientes}</p>
              <p className="text-gray-600">Pendientes</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl text-center">
              <p className="text-3xl font-bold text-green-600">{tareasCompletadas}</p>
              <p className="text-gray-600">Completadas</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">🔍 Filtros</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleFilterChange('todas')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'todas' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              disabled={loading}
            >
              Todas ({totalTareas})
            </button>
            <button
              onClick={() => handleFilterChange('pendientes')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'pendientes' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              disabled={loading}
            >
              Pendientes ({tareasPendientes})
            </button>
            <button
              onClick={() => handleFilterChange('completadas')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'completadas' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              disabled={loading}
            >
              Completadas ({tareasCompletadas})
            </button>
          </div>
        </div>

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
                    : editandoId 
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
                disabled={loading}
              >
                {editandoId ? 'Actualizar Tarea' : 'Crear Tarea'}
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              📋 {filter === 'todas' ? 'Todas las Tareas' : 
                 filter === 'pendientes' ? 'Tareas Pendientes' : 
                 'Tareas Completadas'} ({tasks.length})
            </h2>
          </div>
          
          {loading && tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Cargando tareas...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {filter === 'todas' 
                  ? 'No hay tareas todavía' 
                  : filter === 'pendientes'
                  ? 'No hay tareas pendientes'
                  : 'No hay tareas completadas'}
              </p>
              <p className="text-gray-400 mt-2">
                {filter === 'todas' 
                  ? '¡Empieza creando tu primera tarea!' 
                  : '¡Crea una nueva tarea o cambia el filtro!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map(tarea => (
                <div 
                  key={tarea.id} 
                  className={`border-2 rounded-xl p-5 transition-all ${
                    tarea.id === editandoId
                      ? 'border-yellow-300 bg-yellow-50'
                      : tarea.status === 'completada'
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-100 hover:border-blue-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleStatus(tarea.id)}
                          className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            tarea.status === 'completada'
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          disabled={loading}
                        >
                          {tarea.status === 'completada' && (
                            <span className="text-white text-sm">✓</span>
                          )}
                        </button>
                        <div>
                          <h3 className={`font-bold text-xl ${
                            tarea.status === 'completada'
                              ? 'text-gray-500 line-through'
                              : 'text-gray-800'
                          }`}>
                            {tarea.title}
                          </h3>
                          {tarea.content && (
                            <p className={`mt-2 ${
                              tarea.status === 'completada'
                                ? 'text-gray-400 line-through'
                                : 'text-gray-600'
                            }`}>
                              {tarea.content}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <span>📅 {new Date(tarea.created_at).toLocaleDateString()}</span>
                            {tarea.updated_at && tarea.updated_at !== tarea.created_at && (
                              <span>✏️ {new Date(tarea.updated_at).toLocaleDateString()}</span>
                            )}
                            <span className={`px-3 py-1 rounded-full ${
                              tarea.status === 'completada' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {tarea.status === 'completada' ? '✅ Completada' : '⏳ Pendiente'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => empezarEditar(tarea)}
                        className={`px-4 py-2 rounded-lg text-white ${
                          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'
                        }`}
                        disabled={loading || tarea.id === editandoId}
                      >
                        {tarea.id === editandoId ? 'Editando...' : 'Editar'}
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