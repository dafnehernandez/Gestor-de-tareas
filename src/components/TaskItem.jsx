import React from 'react'
import { Pencil, Trash2, User, AlertCircle, Clock, TrendingDown } from 'lucide-react'

const TaskItem = ({ task, onEdit, onDelete }) => {
  // Mapeo de colores según note_color
  const colorMap = {
    yellow: 'bg-yellow-100 border-yellow-300 shadow-yellow-200',
    blue: 'bg-blue-100 border-blue-300 shadow-blue-200',
    green: 'bg-green-100 border-green-300 shadow-green-200',
    pink: 'bg-pink-100 border-pink-300 shadow-pink-200',
    purple: 'bg-purple-100 border-purple-300 shadow-purple-200',
    orange: 'bg-orange-100 border-orange-300 shadow-orange-200',
    red: 'bg-red-100 border-red-300 shadow-red-200',
    teal: 'bg-teal-100 border-teal-300 shadow-teal-200',
  }

  // Mapeo de prioridades
  const priorityConfig = {
    urgente: {
      icon: <AlertCircle size={16} />,
      text: 'Urgente',
      color: 'bg-red-500 text-white',
      border: 'border-red-400',
    },
    media: {
      icon: <Clock size={16} />,
      text: 'Media',
      color: 'bg-yellow-500 text-white',
      border: 'border-yellow-400',
    },
    baja: {
      icon: <TrendingDown size={16} />,
      text: 'Baja',
      color: 'bg-green-500 text-white',
      border: 'border-green-400',
    },
  }

  const noteClass = colorMap[task.note_color] || colorMap.yellow
  const priority = priorityConfig[task.priority] || priorityConfig.media

  return (
    <div className="relative group">
      {/* La nota adhesiva */}
      <div className={`
        ${noteClass}
        ${priority.border}
        relative
        p-6
        rounded-lg
        border-2
        shadow-lg
        min-h-[280px]
        max-w-[320px]
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
          <div className="w-6 h-8 bg-gray-500 rounded-t-full relative">
            <div className="absolute w-4 h-4 bg-gray-700 rounded-full top-1 left-1"></div>
          </div>
        </div>

        {/* Encabezado con prioridad y autor */}
        <div className="mb-4">
          {/* Prioridad */}
          <div className="flex items-center gap-2 mb-3">
            <div className={`${priority.color} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
              {priority.icon}
              <span>{priority.text}</span>
            </div>
          </div>

          {/* Autor */}
          {task.author && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <User size={14} />
              <span className="font-medium">{task.author}</span>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div>
          {/* Título */}
          <h3 className="
            text-xl
            font-bold
            mb-3
            text-gray-800
            pb-2
            border-b
            border-gray-300/50
            line-clamp-2
          ">
            {task.title}
          </h3>

          {/* Descripción */}
          <div className="mb-6">
            <p className="
              text-gray-700
              line-clamp-4
              whitespace-pre-wrap
              min-h-[80px]
            ">
              {task.content || 'Sin descripción...'}
            </p>
          </div>

          {/* Footer con fecha */}
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-300/50">
            <div className="text-xs text-gray-500 italic">
              Creada: {new Date(task.created_at).toLocaleDateString('es-ES')}
            </div>
            
            {/* Color de nota */}
            <div className="flex items-center gap-1">
              <div className={`w-4 h-4 rounded-full ${colorMap[task.note_color]?.split(' ')[0] || 'bg-yellow-100'}`}></div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
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
              p-2
              bg-white/90
              backdrop-blur-sm
              rounded-full
              shadow-lg
              hover:bg-white
              transition-colors
              hover:scale-110
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
              p-2
              bg-white/90
              backdrop-blur-sm
              rounded-full
              shadow-lg
              hover:bg-red-100
              transition-colors
              hover:scale-110
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