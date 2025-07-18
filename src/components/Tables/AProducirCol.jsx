import { useEffect, useRef, useState } from 'react';
import { useConfig } from '../../ConfigContext.jsx';
import { Check, Close, Edit } from '@mui/icons-material';
import { Button, Input } from '@mui/joy';

let apiUrl;

// If an articulo has a NULL color distr, docenas will be null.
// This lets the user input the docenas value and update the programada.
export default function AProducirCol({
  row,
  aProducir,
  startDate,
  setProgColor,
  setFilteredProgColor,
  setMachines,
}) {
  apiUrl = useConfig().apiUrl;
  const [editProducir, setEditProducir] = useState(false);
  const [docenas, setDocenas] = useState();
  const inputRef = useRef(null);

  useEffect(() => {
    let timeoutId;
    if (editProducir) {
      timeoutId = setTimeout(() => {
        inputRef.current.focus();
      }, 10);
    }

    return () => clearTimeout(timeoutId);
  }, [editProducir]);

  async function handleProducirEdit(e) {
    e.preventDefault();

    try {
      await fetch(`${apiUrl}/programada/updateDocenas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programadaId: row.Programada,
          colorDistrId: row.ColorDistr,
          docenas,
        }),
      });

      // update programada view
      const params = new URLSearchParams({
        startDate,
      }).toString();
      const res = await fetch(`${apiUrl}/programada?${params}`);
      const data = await res.json();

      setProgColor(data.progColor);
      setFilteredProgColor(data.progColor);
      setMachines(data.machines);
      setEditProducir(false);
    } catch (err) {
      console.error('[CLIENT] Error fetching /programada/updateDocenas:', err);
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleProducirEdit(e);
    }
  };

  return !editProducir ? (
    <span>
      {
        // if docenas is null, show edit icon, otherwise show docenas
        !row.Docenas && row.Docenas !== 0 ? (
          <Edit onClick={() => setEditProducir(true)} />
        ) : row.Tipo === null ? (
          aProducir
        ) : (
          `${aProducir} (${row.Docenas})`
        )
      }
    </span>
  ) : (
    <form onSubmit={handleProducirEdit} className='grid grid-cols-2 gap-1'>
      <Input
        type='number'
        slotProps={{ input: { ref: inputRef, min: 0 } }}
        onChange={(e) => setDocenas(e.target.value)}
        className='col-span-2'
        required
      />
      <Button color='danger' onClick={() => setEditProducir(false)}>
        <Close />
      </Button>
      <Button type='submit' onKeyDown={(e) => handleKeyDown(e)}>
        <Check />
      </Button>
    </form>
  );
}
