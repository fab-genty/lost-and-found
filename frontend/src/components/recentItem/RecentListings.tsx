import { useGetListingsQuery } from "../../redux/api/listingApi";
import { ListingCard } from "../listing/ListingCard";
import { Spinner } from "flowbite-react";

const RecentListings = () => {
  const { data, isLoading } = useGetListingsQuery({});

  if (isLoading) {
    return (
      <div className="min-h-24 text-center bg-gray-900 pt-10">
        <Spinner size="lg" />
      </div>
    );
  }

  const listings = (data?.data ?? []).slice(0, 6);

  return (
    <div className="bg-gray-900 py-10">
      <div className="px-4 mx-auto max-w-screen-2xl sm:py-6 lg:px-6">
        <div className="mx-auto text-center">
          <h2 className="mb-4 text-3xl lg:text-4xl tracking-tight font-extrabold text-white pt-20 md:pt-16">
            Annonces récentes
          </h2>
          <p className="font-light text-gray-400 sm:text-xl mb-8">
            Derniers signalements d'objets, animaux et personnes
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 mb-10">
        {listings.length === 0 ? (
          <p className="text-center text-gray-400">Aucune annonce pour l'instant.</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentListings;
