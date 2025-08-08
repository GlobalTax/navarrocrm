import React from 'react'

// Placeholder task components
export const TasksList = ({ onTaskSelect, selectedTasks }: any) => (
  React.createElement('div', { className: 'border-0.5 border-black rounded-[10px] p-6 bg-white shadow-sm animate-fade-in' }, 
    React.createElement('div', { className: 'text-center py-8 text-gray-500' },
      React.createElement('h3', { className: 'text-lg font-medium mb-2' }, 'No hay tareas disponibles'),
      React.createElement('p', null, 'Las tareas aparecerán aquí cuando se creen')
    )
  )
)

export const TaskFilters = () => (
  React.createElement('div', { className: 'bg-white border-0.5 border-black rounded-[10px] p-4 shadow-sm animate-fade-in' },
    React.createElement('h3', { className: 'font-medium mb-3' }, 'Filtros de Tareas'),
    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
      React.createElement('input', { placeholder: 'Buscar tareas...', className: 'border-0.5 border-black rounded-[10px] px-3 py-2 bg-white' }),
      React.createElement('select', { className: 'border-0.5 border-black rounded-[10px] px-3 py-2 bg-white' },
        React.createElement('option', null, 'Todos los estados'),
        React.createElement('option', null, 'Pendiente'),
        React.createElement('option', null, 'En progreso'),
        React.createElement('option', null, 'Completada')
      ),
      React.createElement('select', { className: 'border-0.5 border-black rounded-[10px] px-3 py-2 bg-white' },
        React.createElement('option', null, 'Todos los asignados')
      )
    )
  )
)

export const BulkTaskAssignmentModal = ({ isOpen, onClose, selectedTaskIds, taskTitles }: any) => (
  isOpen ? React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' },
    React.createElement('div', { className: 'bg-white border-0.5 border-black rounded-[10px] p-6 max-w-md w-full mx-4 shadow-sm animate-scale-in' },
      React.createElement('h2', { className: 'text-xl font-semibold mb-4' }, 'Asignación Masiva'),
      React.createElement('p', { className: 'text-gray-600 mb-4' }, `Asignar ${selectedTaskIds.length} tareas seleccionadas`),
      React.createElement('div', { className: 'flex gap-2' },
        React.createElement('button', { onClick: onClose, className: 'px-4 py-2 border-0.5 border-black rounded-[10px] hover-lift' }, 'Cancelar'),
        React.createElement('button', { onClick: onClose, className: 'px-4 py-2 border-0.5 border-black rounded-[10px] bg-white hover-lift' }, 'Asignar')
      )
    )
  ) : null
)