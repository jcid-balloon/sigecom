type CommunityPerson = {
  id: number;
  rut: string;
  nombre: string;
  territorio: string;
  tipo: string;
  programa: string;
  email: string;
  telefono: string;
  fecha_registro: string;
};

interface CommunityPreviewTableProps {
  filteredData: CommunityPerson[];
}

const CommunityPreviewTable = ({
  filteredData,
}: CommunityPreviewTableProps) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Comunidad</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                RUT
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Territorio
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Programa
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.slice(0, 5).map((person) => (
              <tr key={person.id}>
                <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {person.nombre}
                </td>
                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                  {person.rut}
                </td>
                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                  {person.territorio}
                </td>
                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {person.tipo}
                  </span>
                </td>
                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                  {person.programa}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredData.length > 5 && (
        <p className="text-sm text-gray-600 mt-4 text-center">
          ...y {filteredData.length - 5} más. Ve a la sección 'Comunidad' para
          ver todos los registros.
        </p>
      )}
    </div>
  );
};

export default CommunityPreviewTable;
