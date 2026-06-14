import { Navigate, useParams } from "react-router-dom";
export function PersonneVu() {
  const { id } = useParams();
  return <Navigate to={`/personnes/${id}`} replace />;
}
