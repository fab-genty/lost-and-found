import type { Listing } from "../../domain/listing.types";
import { ListingCard } from "../../components/listing/ListingCard";
import { useGetMyListingsQuery } from "../../redux/api/listingApi";

export function MesAnnoncesView({ items, isLoading }: { items: Listing[]; isLoading: boolean }) {
  if (isLoading) return <p className="text-gray-400 p-6">Chargement…</p>;
  if (items.length === 0) return <p className="text-gray-400 p-6">Aucune annonce pour l'instant.</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-6">
      {items.map((l) => (
        <ListingCard key={l.id} listing={l} />
      ))}
    </div>
  );
}

export function MesAnnonces() {
  const { data, isLoading } = useGetMyListingsQuery();
  return <MesAnnoncesView items={data?.data ?? []} isLoading={isLoading} />;
}
