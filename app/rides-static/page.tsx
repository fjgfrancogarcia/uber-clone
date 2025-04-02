export default function RidesStaticPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mis Viajes</h1>
        <a 
          href="/"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Inicio
        </a>
      </div>
      
      <div className="bg-white shadow overflow-hidden rounded-lg p-6">
        <div className="text-center text-gray-700 mb-4">
          <p>Página simplificada para resolver errores de compatibilidad</p>
        </div>
        
        <div className="bg-yellow-100 p-4 rounded mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">Nota:</h3>
          <p className="text-yellow-700">
            Esta es una versión estática para demostración. La funcionalidad completa 
            no está disponible debido a problemas con la autenticación y dependencias.
          </p>
        </div>
        
        <div className="border rounded-md p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-900 truncate">
                De: Centro de Buenos Aires
              </p>
              <p className="text-sm text-gray-500 truncate">
                A: Puerto Madero
              </p>
            </div>
            <div className="ml-2 flex-shrink-0 flex">
              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                Completado
              </p>
            </div>
          </div>
          <div className="mt-2 sm:flex sm:justify-between">
            <div className="sm:flex">
              <p className="flex items-center text-sm text-gray-500">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                </svg>
                Conductor: Juan Pérez
              </p>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <p>
                {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="mt-2 flex items-center text-sm font-medium text-green-600 sm:mt-0">
              $550.00
            </div>
          </div>
        </div>
        
        <div className="border rounded-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-900 truncate">
                De: Palermo
              </p>
              <p className="text-sm text-gray-500 truncate">
                A: San Telmo
              </p>
            </div>
            <div className="ml-2 flex-shrink-0 flex">
              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                Pendiente
              </p>
            </div>
          </div>
          <div className="mt-2 sm:flex sm:justify-between">
            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <p>
                {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="mt-2 flex items-center text-sm font-medium text-green-600 sm:mt-0">
              $420.00
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 