import { useEffect, useState } from 'react';
import ArtTalleColorInputs from './ArtTalleColorInputs.jsx';
import { Button } from '@mui/joy';

export default function ProgSearchForm({ progColor, setFilteredProgColor }) {
  const [formData, setFormData] = useState({});
  const [key, setKey] = useState(0);

  useEffect(() => {
    setFilteredProgColor(
      // if fileds are empty, it shows all rows
      progColor.filter((row) => {
        // if the fields are undefined, they are set as empty strings
        const { articulo = '', talle = '', colorId = '' } = formData;
        if (articulo !== '' && row.Articulo !== Number(articulo)) return false;
        if (talle !== '' && row.Talle !== talle) return false;
        if (colorId !== '' && row.ColorId !== colorId) return false;
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
      <ArtTalleColorInputs formData={formData} setFormData={setFormData} />
      <Button type='reset'>Limpiar</Button>
    </form>
  );
}
