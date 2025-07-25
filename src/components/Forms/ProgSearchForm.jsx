import { useEffect, useState } from 'react';
import ArtTalleColorInputs from '../Inputs/ArtTalleColorInputs.jsx';
import { FormControl, FormLabel, Input } from '@mui/joy';

export default function ProgSearchForm({
  progColor,
  filteredProgColor,
  setFilteredProgColor,
  live,
}) {
  const [formData, setFormData] = useState({});
  const [key, setKey] = useState(0);

  useEffect(() => {
    setFilteredProgColor(
      // if fileds are empty, it shows all rows
      progColor.filter((row) => {
        // if the fields are undefined, they are set as empty strings
        const {
          articulo = '',
          talle = '',
          colorId = '',
          machine = '',
        } = formData;
        if (articulo !== '' && row.Articulo !== Number(articulo)) return false;
        if (talle !== '' && row.Talle !== Number(talle)) return false;
        if (colorId !== '' && row.ColorId !== colorId) return false;
        if (machine !== '') {
          if (row.Machines.length === 0) return false;
          return row.Machines.some((m) => m.MachCode === Number(machine));
        }
        return true;
      })
    );
  }, [formData, progColor, setFilteredProgColor]);
  // having progColor in the dep array ensures live data

  return (
    <form
      key={key}
      onReset={() => {
        setFormData({});
        setKey((prev) => prev + 1); // force re-render for ColorSelect
      }}
    >
      <ArtTalleColorInputs
        formData={formData}
        setFormData={setFormData}
        btnType='reset'
        btnText='Limpiar'
        inheritedColors={Array.from(
          new Map(
            filteredProgColor.map((row) => [
              row.ColorId,
              { Color: row.Color, Id: row.ColorId },
            ])
          ).values()
        )}
      >
        {live && (
          <FormControl>
            <FormLabel>Máquina</FormLabel>
            <Input
              type='number'
              placeholder='...'
              className='w-20'
              slotProps={{
                input: { min: 1001, max: 1037 },
              }}
              onChange={(e) =>
                setFormData({ ...formData, machine: e.target.value })
              }
            />
          </FormControl>
        )}
      </ArtTalleColorInputs>
    </form>
  );
}
