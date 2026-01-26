import React from 'react'
import { Pencil, Trash2, User, AlertCircle, Clock, TrendingDown } from 'lucide-react'

const TaskItem = ({ task, onEdit, onDelete }) => {
  // Mapeo de colores según note_color - versión más compacta
  const colorMap = {
    yellow: 'bg-yellow-100 border-yellow-300 shadow-yellow-300/50',
    blue: 'bg-blue-100 border-blue-300 shadow-blue-300/50',
    green: 'bg-green-100 border-green-300 shadow-green-300/50',
    pink: 'bg-pink-100 border-pink-300 shadow-pink-300/50',
    purple: 'bg-purple-100 border-purple-300 shadow-purple-300/50',
    orange: 'bg-orange-100 border-orange-300 shadow-orange-300/50',
    red: 'bg-red-100 border-red-300 shadow-red-300/50',
    teal: 'bg-teal-100 border-teal-300 shadow-teal-300/50',
  }

  // Mapeo de prioridades
  const priorityConfig = {
    urgente: {
      icon: <AlertCircle size={14} />,
      text: 'Urgente',
      color: 'bg-red-500 text-white',
      border: 'border-red-400',
    },
    media: {
      icon: <Clock size={14} />,
      text: 'Media',
      color: 'bg-yellow-500 text-white',
      border: 'border-yellow-400',
    },
    baja: {
      icon: <TrendingDown size={14} />,
      text: 'Baja',
      color: 'bg-green-500 text-white',
      border: 'border-green-400',
    },
  }

  const noteClass = colorMap[task.note_color] || colorMap.yellow
  const priority = priorityConfig[task.priority] || priorityConfig.media

  return (
    <div className="relative group">
      {/* La nota adhesiva - MÁS COMPACTA */}
      <div className={`
        ${noteClass}
        ${priority.border}
        relative
        p-5
        rounded-md
        border-2
        shadow-lg
        min-h-[220px]  /* Reducido de 280px */
        max-w-[260px]  /* Reducido de 320px */
        w-full
        transform 
        rotate-[-2deg]
        group-hover:rotate-0
        transition-all 
        duration-300
        hover:scale-105
        hover:shadow-xl
        cursor-pointer
        backdrop-blur-sm
      `}>
        
        {/* Chincheta/Clip superior - más pequeña */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          <div className="w-5 h-6 bg-gray-500 rounded-t-full relative">
            <div className="absolute w-3 h-3 bg-gray-700 rounded-full top-0.5 left-1"></div>
          </div>
        </div>

        {/* Encabezado compacto */}
        <div className="mb-3">
          {/* Prioridad y Autor en misma línea */}
          <div className="flex justify-between items-start mb-2">
            {/* Prioridad */}
            <div className={`${priority.color} px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
              {priority.icon}
              <span className="hidden sm:inline">{priority.text}</span>
            </div>

            {/* Color actual */}
            <div className={`w-5 h-5 rounded-full ${colorMap[task.note_color]?.split(' ')[0] || 'bg-yellow-100'} border border-gray-300`}></div>
          </div>

          {/* Autor debajo */}
          {task.author && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <User size={12} />
              <span className="font-medium truncate">{task.author}</span>
            </div>
          )}
        </div>

        {/* Contenido compacto */}
        <div>
          {/* Título más compacto */}
          <h3 className="
            text-lg
            font-bold
            mb-2
            text-gray-800
            pb-1.5
            border-b
            border-gray-300/50
            line-clamp-2
            leading-tight
          ">
            {task.title}
          </h3>

          {/* Descripción más compacta */}
          <div className="mb-4 min-h-[70px]">
            <p className="
              text-sm
              text-gray-700
              line-clamp-3
              whitespace-pre-wrap
              leading-relaxed
            ">
              {task.content || 'Sin descripción...'}
            </p>
          </div>

          {/* Footer más compacto */}
          <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-300/30">
            <span className="italic">
              {new Date(task.created_at).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short'
              })}
            </span>
            
            {/* Etiqueta de prioridad mobile */}
            <span className="sm:hidden font-medium">
              {priority.text.charAt(0)}
            </span>
          </div>
        </div>

        {/* Botones de acción - MÁS GRANDES */}
        <div className="
          absolute
          top-2
          right-2
          opacity-0
          group-hover:opacity-100
          transition-opacity
          duration-200
          flex gap-1.5
        ">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(task)
            }}
            className="
              p-2.5
              bg-white/95
              backdrop-blur-sm
              rounded-full
              shadow-lg
              hover:bg-white
              transition-all
              hover:scale-110
              hover:shadow-xl
              active:scale-95
            "
            title="Editar"
          >
            <Pencil size={20} className="text-gray-700" /> {/* Aumentado de 16 a 20 */}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (window.confirm('¿Borrar esta nota?')) {
                onDelete(task.id)
              }
            }}
            className="
              p-2.5
              bg-white/95
              backdrop-blur-sm
              rounded-full
              shadow-lg
              hover:bg-red-100
              transition-all
              hover:scale-110
              hover:shadow-xl
              active:scale-95
            "
            title="Eliminar"
          >
            <Trash2 size={20} className="text-red-500" /> {/* Aumentado de 16 a 20 */}
          </button>
        </div>
      </div>

      {/* Sombra de la nota - más sutil */}
      <div className="
        absolute
        inset-0
        bg-gray-400
        rounded-md
        transform
        translate-y-1.5
        rotate-[-3deg]
        -z-10
        blur
        opacity-20
      "></div>
    </div>
  )
}

export default TaskItem