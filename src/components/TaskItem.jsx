import React from 'react'
import { Pencil, Trash2 } from 'lucide-react'

const TaskItem = ({ task, onEdit, onDelete }) => {
  // Colores para las notas adhesivas
  const noteColors = [
    'bg-yellow-100 border-yellow-300 shadow-yellow-200', // Amarillo
    'bg-blue-100 border-blue-300 shadow-blue-200',       // Azul
    'bg-green-100 border-green-300 shadow-green-200',    // Verde
    'bg-pink-100 border-pink-300 shadow-pink-200',       // Rosa
    'bg-purple-100 border-purple-300 shadow-purple-200', // Morado
  ]
  
  // Selecciona color basado en el ID
  const colorIndex = task.id ? 
    (task.id.charCodeAt(0) % noteColors.length) : 0
  const noteClass = noteColors[colorIndex]

  return (
    <div className="relative group">
      {/* La nota adhesiva */}
      <div className={`
        ${noteClass}
        relative
        p-6
        rounded-lg
        border-2
        shadow-lg
        min-h-[250px]
        max-w-[300px]
        w-full
        transform 
        rotate-[-2deg]
        group-hover:rotate-0
        transition-all 
        duration-300
        hover:scale-105
        hover:shadow-xl
        cursor-pointer
      `}>
        
        {/* Chincheta/Clip superior */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-8 bg-gray-400 rounded-t-full relative">
            <div className="absolute w-4 h-4 bg-gray-500 rounded-full top-1 left-1"></div>
          </div>
        </div>

        {/* Contenido */}
        <div className="mt-2">
          {/* Título */}
          <h3 className="
            text-xl
            font-bold
            mb-3
            text-gray-800
            pb-2
            border-b
            border-gray-300
          ">
            {task.title}
          </h3>

          {/* Descripción */}
          <div className="mb-6">
            <p className="
              text-gray-700
              line-clamp-4
              whitespace-pre-wrap
              min-h-[100px]
            ">
              {task.content || 'Sin descripción...'}
            </p>
          </div>

          {/* Fecha */}
          <div className="
            absolute
            bottom-4
            right-4
            text-sm
            text-gray-500
            italic
          ">
            {new Date(task.created_at).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'short'
            })}
          </div>
        </div>

        {/* Botones de acción (aparecen al pasar el mouse) */}
        <div className="
          absolute
          top-3
          right-3
          opacity-0
          group-hover:opacity-100
          transition-opacity
          duration-200
          flex gap-2
        ">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(task)
            }}
            className="
              p-1.5
              bg-white/80
              backdrop-blur-sm
              rounded-full
              shadow
              hover:bg-white
              transition-colors
            "
            title="Editar"
          >
            <Pencil size={16} className="text-gray-700" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (window.confirm('¿Borrar esta nota?')) {
                onDelete(task.id)
              }
            }}
            className="
              p-1.5
              bg-white/80
              backdrop-blur-sm
              rounded-full
              shadow
              hover:bg-red-100
              transition-colors
            "
            title="Eliminar"
          >
            <Trash2 size={16} className="text-red-500" />
          </button>
        </div>
      </div>

      {/* Sombra de la nota */}
      <div className="
        absolute
        inset-0
        bg-gray-400
        rounded-lg
        transform
        translate-y-2
        rotate-[-3deg]
        -z-10
        blur-sm
        opacity-30
      "></div>
    </div>
  )
}

export default TaskItem