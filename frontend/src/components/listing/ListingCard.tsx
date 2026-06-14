import { Link } from "react-router-dom";
import type { Listing } from "../../domain/listing.types";
import { listingConfig } from "../../domain/listingConfig";

export function ListingCard({ listing }: { listing: Listing }) {
  const cfg = listingConfig[listing.type];
  return (
    <Link
      to={`${cfg.basePath}/${listing.id}`}
      className="block rounded-xl border border-gray-700 bg-gray-800 overflow-hidden hover:border-cyan-400 transition"
    >
      <div className="h-40 bg-gray-700">
        {listing.photoUrl && (
          <img src={listing.photoUrl} alt={listing.title} className="h-40 w-full object-cover" />
        )}
      </div>
      <div className="p-4">
        <span className="text-xs uppercase text-cyan-400">
          {cfg.directionLabels[listing.direction] ?? ""}
        </span>
        <h3 className="text-white font-semibold">{listing.title}</h3>
        <p className="text-gray-400 text-sm">
          {listing.city}, {listing.region} — {listing.country}
        </p>
      </div>
    </Link>
  );
}
