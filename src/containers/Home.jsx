import { useState, useEffect } from 'react';

export default function Home() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/produccion')
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.log('[CLIENT] Error fetching data:', err));
  }, []);

  return (
    <div>
      {JSON.stringify(data)}
      {/* <ul>
        {data.map((item) => (
          <li key={item.StyleCode}>
            {item.StyleCode} | {item.Unidades} | {item.Produciendo}
          </li>
        ))}
      </ul> */}
    </div>
  );
}
