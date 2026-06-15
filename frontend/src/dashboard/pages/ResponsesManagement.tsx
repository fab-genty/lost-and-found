import { toast } from "react-toastify";
import {
  useGetAllResponsesQuery,
  useUpdateResponseStatusMutation,
} from "../../redux/api/listingApi";
import type { ListingResponse, ResponseStatus } from "../../domain/listing.types";

const STATUSES: ResponseStatus[] = ["PENDING", "APPROVED", "REJECTED"];

const ResponsesManagement = () => {
  const { data, isLoading, refetch } = useGetAllResponsesQuery();
  const [updateStatus] = useUpdateResponseStatusMutation();

  const handleStatus = async (id: string, status: ResponseStatus) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Statut mis à jour : ${status}`);
      refetch();
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (isLoading) return <p className="text-gray-400 p-6">Chargement…</p>;

  const responses: ListingResponse[] = data?.data ?? [];

  return (
    <div className="p-6">
      <h2 className="text-white text-2xl font-bold mb-6">Gestion des réponses</h2>
      {responses.length === 0 ? (
        <p className="text-gray-400">Aucune réponse.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs uppercase text-gray-400 bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((r) => (
                <tr key={r.id} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="px-4 py-3 text-cyan-400 text-xs uppercase">{r.kind}</td>
                  <td className="px-4 py-3 text-gray-200 max-w-xs truncate">{r.message}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold ${
                        r.status === "APPROVED"
                          ? "text-green-400"
                          : r.status === "REJECTED"
                          ? "text-red-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={r.status}
                      onChange={(e) => handleStatus(r.id, e.target.value as ResponseStatus)}
                      className="bg-gray-700 text-gray-200 text-xs rounded px-2 py-1 border border-gray-600"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResponsesManagement;
