import { useNavigate, useSearchParams } from "react-router-dom";
import type { ListingType, ListingDirection } from "../../domain/listing.types";
import { directionsForType } from "../../domain/listing.types";
import { listingConfig } from "../../domain/listingConfig";
import { ListingForm } from "./ListingForm";
import { useCreateListingMutation } from "../../redux/api/listingApi";

export function SignalerPage({ type }: { type: ListingType }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const cfg = listingConfig[type];
  const allowed = directionsForType(type);
  const urlDir = params.get("direction") as ListingDirection | null;
  const direction: ListingDirection =
    urlDir && allowed.includes(urlDir) ? urlDir : allowed[0];
  const [createListing] = useCreateListingMutation();
  return (
    <section>
      <h1 className="text-2xl font-bold text-white text-center pt-6">
        {cfg.directionLabels[direction]}
      </h1>
      <ListingForm
        type={type}
        direction={direction}
        onSubmit={async (data) => {
          await createListing(data).unwrap().catch(() => {});
          navigate(cfg.basePath);
        }}
      />
    </section>
  );
}
