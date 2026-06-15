import { Link } from "react-router-dom";

type Props = {
  phone: string;
  whatsapp?: string;
  isAuthenticated: boolean;
};

export function ContactBlock({ phone, whatsapp, isAuthenticated }: Props) {
  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 text-gray-300">
        <Link to="/login" className="text-cyan-400 underline">
          Connectez-vous
        </Link>{" "}
        pour voir les coordonnées de contact.
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 space-y-2">
      <a href={`tel:${phone}`} className="block text-white font-medium">
        {phone}
      </a>
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="inline-block rounded bg-green-600 px-3 py-1.5 text-white"
        >
          WhatsApp
        </a>
      )}
    </div>
  );
}
