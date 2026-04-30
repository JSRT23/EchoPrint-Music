export default function SoundWave({ active, color = "#00e5ff", bars = 12 }) {
  return (
    <div className={`soundwave ${active ? "soundwave--active" : ""}`}>
      {[...Array(bars)].map((_, i) => (
        <span
          key={i}
          className="soundwave__bar"
          style={{ "--i": i, "--sw-color": color }}
        />
      ))}
    </div>
  );
}
