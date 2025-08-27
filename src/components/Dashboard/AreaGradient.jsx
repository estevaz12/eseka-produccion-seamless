export default function AreaGradient({ color, id }) {
  // adjusting y2 because of sparkline overflow
  const y2 = id === 'eff' ? '30%' : '60%';
  return (
    <defs>
      <linearGradient id={`${id}-gradient`} x1='50%' y1='0%' x2='50%' y2={y2}>
        <stop offset='0%' stopColor={color} stopOpacity={0.3} />
        <stop offset='100%' stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}
