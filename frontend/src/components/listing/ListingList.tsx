import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Listing, ListingType, ListingDirection } from "../../domain/listing.types";
import { useGetListingsQuery } from "../../redux/api/listingApi";
import { ListingCard } from "./ListingCard";

export function ListingListView({
  items,
  isLoading,
}: {
  items: Listing[];
  isLoading: boolean;
}) {
  if (isLoading) return <p className="text-gray-400 p-6">Chargement…</p>;
  if (items.length === 0)
    return <p className="text-gray-400 p-6">Aucun résultat.</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-6">
      {items.map((l) => (
        <ListingCard key={l.id} listing={l} />
      ))}
    </div>
  );
}

export function ListingList({ type }: { type: ListingType }) {
  const [params] = useSearchParams();
  const direction = (params.get("direction") || undefined) as
    | ListingDirection
    | undefined;
  const [filters, setFilters] = useState({ country: "", region: "", city: "" });
  const { data, isLoading } = useGetListingsQuery({
    type,
    direction,
    country: filters.country || undefined,
    region: filters.region || undefined,
    city: filters.city || undefined,
  });
  return (
    <section>
      <div className="flex flex-wrap gap-3 p-6">
        {(["country", "region", "city"] as const).map((f) => (
          <input
            key={f}
            className="rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white"
            placeholder={f === "country" ? "Pays" : f === "region" ? "Région" : "Ville"}
            value={filters[f]}
            onChange={(e) => setFilters((s) => ({ ...s, [f]: e.target.value }))}
          />
        ))}
      </div>
      <ListingListView items={data?.data ?? []} isLoading={isLoading} />
    </section>
  );
}
