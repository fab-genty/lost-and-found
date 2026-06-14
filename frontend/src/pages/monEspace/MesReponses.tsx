import type { ListingResponse } from "../../domain/listing.types";
import { useGetMyResponsesQuery } from "../../redux/api/listingApi";

export function MesReponsesView({ items }: { items: ListingResponse[] }) {
  if (items.length === 0) return <p className="text-gray-400 p-6">Aucune réponse.</p>;
  return (
    <ul className="p-6 space-y-2">
      {items.map((r) => (
        <li key={r.id} className="rounded border border-gray-700 bg-gray-800 p-3 text-gray-200">
          <span className="text-xs uppercase text-cyan-400">{r.kind}</span> — {r.message}{" "}
          <span className="text-gray-500">[{r.status}]</span>
        </li>
      ))}
    </ul>
  );
}

export function MesReponses() {
  const { data } = useGetMyResponsesQuery();
  return <MesReponsesView items={data?.data ?? []} />;
}
