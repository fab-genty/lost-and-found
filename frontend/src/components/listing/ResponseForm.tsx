import { useForm } from "react-hook-form";
import { ResponseKind } from "../../domain/listing.types";

const field =
  "w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white";

export function ResponseForm({
  kind,
  onSubmit,
}: {
  kind: ResponseKind;
  onSubmit: (d: Record<string, unknown>) => void;
}) {
  const { register, handleSubmit } = useForm();
  return (
    <form
      onSubmit={handleSubmit((d) => onSubmit({ ...d, kind }))}
      className="space-y-3"
    >
      <div>
        <label htmlFor="message" className="block text-gray-300 mb-1">Message</label>
        <textarea id="message" className={field} {...register("message", { required: true })} />
      </div>
      {kind === "CLAIM" && (
        <div>
          <label htmlFor="features" className="block text-gray-300 mb-1">Signes distinctifs</label>
          <textarea id="features" className={field} {...register("distinguishingFeatures")} />
        </div>
      )}
      {kind === "SIGHTING" && (
        <>
          <div>
            <label htmlFor="loc" className="block text-gray-300 mb-1">Lieu d'observation</label>
            <input id="loc" className={field} {...register("sightingLocation")} />
          </div>
          <div>
            <label htmlFor="sdate" className="block text-gray-300 mb-1">Date d'observation</label>
            <input id="sdate" type="date" className={field} {...register("sightingDate")} />
          </div>
        </>
      )}
      <button type="submit" className="rounded bg-cyan-600 px-5 py-2.5 text-white font-semibold">
        Envoyer
      </button>
    </form>
  );
}
