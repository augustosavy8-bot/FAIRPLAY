export default function Ticker({ items }) {
  if (!items?.length) return null;
  return (
    <div className="s-ticker" aria-hidden="true">
      <div className="s-ticker-in">
        {[...Array(8)].flatMap((_, i) => items.map((it) => (
          <span key={`${i}-${it.id}`}>{it.texto}<b>·</b></span>
        )))}
      </div>
    </div>
  );
}
