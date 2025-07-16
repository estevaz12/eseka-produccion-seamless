import { Add, Check, Close } from '@mui/icons-material';
import {
  Button,
  FormControl,
  Input,
  ListDivider,
  ListItem,
  Option,
} from '@mui/joy';
import { useEffect, useRef, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';

export default function AddColorBtn({
  setSelectVal,
  setSelectOpen,
  setFormData,
}) {
  const apiUrl = useConfig().apiUrl;
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const [newColor, setNewColor] = useState();
  const prevColor = useRef();

  useEffect(() => {
    if (newColor && newColor.Id !== prevColor.current?.Id) {
      setSelectOpen(false); // don't show popup
      setSelectVal(newColor.Id); // show value on select
      setFormData(newColor.Id); // set value for form
      prevColor.current = newColor; // to avoid infinite loop
    }
  }, [newColor, setSelectVal, setSelectOpen, setFormData]);

  function handleSubmit() {
    fetch(`${apiUrl}/colors/insert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ color: value }),
    })
      .then((res) => res.json())
      .then((data) => setNewColor(data[0])) // single-record object
      .catch((err) => {
        console.error('[CLIENT] Error fetching /colors/insert:', err);
      });

    setEditing(false);
  }

  return (
    <>
      <ListDivider />
      {newColor && !editing && (
        <Option value={newColor.Id} label={newColor.Color}>
          {newColor.Color}
        </Option>
      )}
      <ListItem>
        {!editing ? (
          <Button
            onClick={() => setEditing(true)}
            onMouseDown={(e) => e.stopPropagation()}
            className='w-44'
            disabled={!editing && value !== ''}
          >
            <Add />
            &nbsp;Agregar color
          </Button>
        ) : (
          <form className='grid grid-cols-2 gap-1 max-w-44'>
            <FormControl className='col-span-2'>
              <Input
                type='text'
                placeholder='COLOR COLOR'
                required
                value={value}
                onChange={(e) => setValue(e.target.value.toUpperCase())}
              />
            </FormControl>
            <Button
              color='danger'
              onClick={() => {
                setEditing(false);
                setValue('');
              }}
            >
              <Close />
            </Button>

            <Button onClick={handleSubmit}>
              <Check />
            </Button>
          </form>
        )}
      </ListItem>
      {!editing && <ListItem></ListItem>}
    </>
  );
}
