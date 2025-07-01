
export const PersonTableHeader = () => {
  return (
    <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
      <div className="grid grid-cols-6 gap-4">
        <div className="font-semibold text-gray-900 text-sm">Persona</div>
        <div className="font-semibold text-gray-900 text-sm">Tipo</div>
        <div className="font-semibold text-gray-900 text-sm">Contacto</div>
        <div className="font-semibold text-gray-900 text-sm">Empresa</div>
        <div className="font-semibold text-gray-900 text-sm">Estado</div>
        <div className="font-semibold text-gray-900 text-sm text-right">Acciones</div>
      </div>
    </div>
  )
}
