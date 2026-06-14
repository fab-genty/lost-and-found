import { useForm } from "react-hook-form";
import type { ListingType, ListingDirection } from "../../domain/listing.types";
import { listingConfig } from "../../domain/listingConfig";

type Props = {
  type: ListingType;
  direction: ListingDirection;
  onSubmit: (data: Record<string, unknown>) => void;
  defaultValues?: Record<string, unknown>;
};

const field =
  "w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white";

export function ListingForm({ type, direction, onSubmit, defaultValues }: Props) {
  const { register, handleSubmit } = useForm({ defaultValues });
  const cfg = listingConfig[type];
  return (
    <form
      onSubmit={handleSubmit((d) => onSubmit({ ...d, type, direction }))}
      className="max-w-xl mx-auto p-6 space-y-4"
    >
      <div>
        <label htmlFor="title" className="block text-gray-300 mb-1">Titre</label>
        <input id="title" className={field} {...register("title", { required: true })} />
      </div>
      <div>
        <label htmlFor="description" className="block text-gray-300 mb-1">Description</label>
        <textarea id="description" className={field} {...register("description")} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="country" className="block text-gray-300 mb-1">Pays</label>
          <input id="country" className={field} {...register("country", { required: true })} />
        </div>
        <div>
          <label htmlFor="region" className="block text-gray-300 mb-1">Région</label>
          <input id="region" className={field} {...register("region")} />
        </div>
        <div>
          <label htmlFor="city" className="block text-gray-300 mb-1">Ville</label>
          <input id="city" className={field} {...register("city")} />
        </div>
      </div>
      <div>
        <label htmlFor="date" className="block text-gray-300 mb-1">Date</label>
        <input id="date" type="date" className={field} {...register("date")} />
      </div>

      {cfg.fields.includes("category") && (
        <div>
          <label htmlFor="category" className="block text-gray-300 mb-1">Catégorie</label>
          <input id="category" className={field} {...register("categoryId")} />
        </div>
      )}
      {cfg.fields.includes("species") && (
        <div>
          <label htmlFor="species" className="block text-gray-300 mb-1">Espèce</label>
          <input id="species" className={field} {...register("species", { required: true })} />
        </div>
      )}
      {cfg.fields.includes("breed") && (
        <div>
          <label htmlFor="breed" className="block text-gray-300 mb-1">Race</label>
          <input id="breed" className={field} {...register("breed")} />
        </div>
      )}
      {cfg.fields.includes("color") && (
        <div>
          <label htmlFor="color" className="block text-gray-300 mb-1">Couleur</label>
          <input id="color" className={field} {...register("color")} />
        </div>
      )}
      {cfg.fields.includes("age") && (
        <div>
          <label htmlFor="age" className="block text-gray-300 mb-1">Âge</label>
          <input id="age" type="number" className={field} {...register("age", { required: true, valueAsNumber: true })} />
        </div>
      )}
      {cfg.fields.includes("gender") && (
        <div>
          <label htmlFor="gender" className="block text-gray-300 mb-1">Genre</label>
          <select id="gender" className={field} {...register("gender", { required: true })}>
            <option value="">—</option>
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </select>
        </div>
      )}
      {cfg.fields.includes("lastSeenDetails") && (
        <div>
          <label htmlFor="lastSeenDetails" className="block text-gray-300 mb-1">Vu pour la dernière fois</label>
          <textarea id="lastSeenDetails" className={field} {...register("lastSeenDetails")} />
        </div>
      )}

      <div>
        <label htmlFor="contactPhone" className="block text-gray-300 mb-1">Téléphone</label>
        <input id="contactPhone" className={field} {...register("contactPhone", { required: true })} />
      </div>
      <div>
        <label htmlFor="contactWhatsapp" className="block text-gray-300 mb-1">WhatsApp (optionnel)</label>
        <input id="contactWhatsapp" className={field} {...register("contactWhatsapp")} />
      </div>

      <button type="submit" className="rounded bg-cyan-600 px-5 py-2.5 text-white font-semibold">
        Publier
      </button>
    </form>
  );
}
