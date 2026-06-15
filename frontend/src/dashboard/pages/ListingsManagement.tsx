import { toast } from "react-toastify";
import {
  useGetListingsQuery,
  useDeleteListingMutation,
  useResolveListingMutation,
} from "../../redux/api/listingApi";
import type { Listing } from "../../domain/listing.types";

const ListingsManagement = () => {
  const { data, isLoading, refetch } = useGetListingsQuery({});
  const [deleteListing] = useDeleteListingMutation();
  const [resolveListing] = useResolveListingMutation();

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette annonce ?")) return;
    try {
      await deleteListing(id).unwrap();
      toast.success("Annonce supprimée");
      refetch();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await resolveListing(id).unwrap();
      toast.success("Annonce résolue");
      refetch();
    } catch {
      toast.error("Erreur lors de la résolution");
    }
  };

  if (isLoading) return <p className="text-gray-400 p-6">Chargement…</p>;

  const listings: Listing[] = data?.data ?? [];

  return (
    <div className="p-6">
      <h2 className="text-white text-2xl font-bold mb-6">Gestion des annonces</h2>
      {listings.length === 0 ? (
        <p className="text-gray-400">Aucune annonce.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs uppercase text-gray-400 bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Direction</th>
                <th className="px-4 py-3">Titre</th>
                <th className="px-4 py-3">Lieu</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="px-4 py-3 text-cyan-400 text-xs uppercase">{l.type}</td>
                  <td className="px-4 py-3 text-xs uppercase">{l.direction}</td>
                  <td className="px-4 py-3 font-medium text-white">{l.title}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {l.city}, {l.region}
                  </td>
                  <td className="px-4 py-3">
                    {l.isResolved ? (
                      <span className="text-green-400 text-xs">Résolu</span>
                    ) : (
                      <span className="text-yellow-400 text-xs">{l.status}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 flex gap-2 flex-wrap">
                    {!l.isResolved && (
                      <button
                        onClick={() => handleResolve(l.id)}
                        className="px-2 py-1 text-xs bg-green-700 hover:bg-green-600 text-white rounded"
                      >
                        Résoudre
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(l.id)}
                      className="px-2 py-1 text-xs bg-red-700 hover:bg-red-600 text-white rounded"
                    >
                      Supprimer
                    </button>
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

export default ListingsManagement;
