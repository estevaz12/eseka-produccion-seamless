import { localizedNum } from '../../utils/numFormat';
import DataTable from '../Tables/DataTable.jsx';

export default function NewTargetsTable({ newTargets }) {
  return (
    <DataTable
      cols={[
        'Máquina',
        'StyleCode',
        'MachTarget',
        'ProgTarget Previo',
        'ProgTarget Nuevo',
        'Producción Mes',
        'MachPieces',
        'Enviar Target',
      ]}
    >
      {newTargets.map((row, i) => (
        <tr key={i}>
          <td>{row.machCode}</td>
          <td>{row.styleCode}</td>
          <td>{localizedNum(row.machTarget)}</td>
          <td>{localizedNum(row.prevProgTarget)}</td>
          <td>{localizedNum(row.newProgTarget)}</td>
          <td>{localizedNum(row.monthProduction)}</td>
          <td>{localizedNum(row.machPieces)}</td>
          <td>{localizedNum(row.sendTarget)}</td>
        </tr>
      ))}
    </DataTable>
  );
}
