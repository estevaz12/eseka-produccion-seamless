import { useState, useEffect } from 'react';

export default function Home() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/hello')
      .then((res) => res.json())
      .then((data) => setData(data.data))
      .catch((err) => console.log('[CLIENT] Error fetching data:', err));
  }, []);

  return (
    <div>
      <h1>{data}</h1>
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
