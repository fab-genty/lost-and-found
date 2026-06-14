import { useState } from "react";
import { useParams } from "react-router-dom";
import type { Listing } from "../../domain/listing.types";
import { responseKindForDirection } from "../../domain/listing.types";
import { listingConfig } from "../../domain/listingConfig";
import { ContactBlock } from "./ContactBlock";
import { ResponseForm } from "./ResponseForm";
import {
  useGetListingQuery,
  useCreateResponseMutation,
} from "../../redux/api/listingApi";
import { useUserVerification } from "../../auth/auth";

export function ListingDetailView({
  listing,
  isAuthenticated,
  onRespond,
}: {
  listing: Listing;
  isAuthenticated: boolean;
  onRespond?: (d: Record<string, unknown>) => void;
}) {
  const [open, setOpen] = useState(false);
  const kind = responseKindForDirection(listing.direction);
  const cfg = listingConfig[listing.type];
  const ctaLabel = kind === "SIGHTING" ? "Je l'ai vu" : "Revendiquer";
  return (
    <article className="max-w-3xl mx-auto p-6 space-y-4">
      <span className="text-xs uppercase text-cyan-400">
        {cfg.directionLabels[listing.direction]}
      </span>
      <h1 className="text-2xl font-bold text-white">{listing.title}</h1>
      {listing.photoUrl && (
        <img src={listing.photoUrl} alt={listing.title} className="rounded-lg max-h-80" />
      )}
      <p className="text-gray-300">{listing.description}</p>
      <p className="text-gray-400">
        {listing.city}, {listing.region} — {listing.country}
      </p>
      <ContactBlock
        phone={listing.contactPhone}
        whatsapp={listing.contactWhatsapp}
        isAuthenticated={isAuthenticated}
      />
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded bg-cyan-600 px-5 py-2.5 text-white font-semibold"
      >
        {ctaLabel}
      </button>
      {open && onRespond && <ResponseForm kind={kind} onSubmit={onRespond} />}
    </article>
  );
}

export function ListingDetail() {
  const { id = "" } = useParams();
  const { data } = useGetListingQuery(id);
  const user: any = useUserVerification();
  const [createResponse] = useCreateResponseMutation();
  if (!data?.data) return <p className="text-gray-400 p-6">Chargement…</p>;
  return (
    <ListingDetailView
      listing={data.data}
      isAuthenticated={Boolean(user?.email)}
      onRespond={(body) => createResponse({ listingId: id, body })}
    />
  );
}
