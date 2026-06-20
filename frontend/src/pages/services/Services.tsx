import { BiSupport } from "react-icons/bi";
import { TbReport } from "react-icons/tb";
import { FaSearch } from "react-icons/fa";
import { IoLocationSharp, IoShieldCheckmark } from "react-icons/io5";
import { FaGift } from "react-icons/fa6";
import { useGetServicesQuery } from "../../redux/api/api";
import { Spinner } from "flowbite-react";
import React from "react";

interface Service {
  id?: string;
  title: string;
  description: string;
  icon?: string;
}

// Icon mapping for fallback services
const getServiceIcon = (title: string): React.ReactElement => {
  const iconMapping: { [key: string]: React.ReactElement } = {
    "Signalement d'objets perdus": <TbReport size="30" />,
    "Recherche d'objets perdus": <FaSearch size="30" />,
    "Services géolocalisés": <IoLocationSharp size="33" />,
    "Assistance et support": <BiSupport size="30" />,
    "Chiffrement et confidentialité des données": <IoShieldCheckmark size="30" />,
    "Réclamation d'objets": <FaGift size="27" />,
  };

  return iconMapping[title] || <FaSearch size="30" />;
};

const defaultServices: Service[] = [
  {
    title: "Signalement d'objets perdus",
    description:
      "Signalez facilement vos objets perdus en fournissant des descriptions détaillées, des lieux et des images, pour aider à retrouver vos affaires manquantes.",
  },
  {
    title: "Recherche d'objets perdus",
    description:
      "Recherchez rapidement vos objets perdus dans la base de données à l'aide de mots-clés, de catégories ou de lieux pour trouver des correspondances.",
  },
  {
    title: "Services géolocalisés",
    description:
      "Consultez et suivez les objets perdus et trouvés dans des zones géographiques précises, en ciblant votre recherche sur les lieux les plus pertinents.",
  },
  {
    title: "Assistance et support",
    description:
      "Obtenez de l'aide pour vos signalements d'objets perdus ou trouvés, vos réclamations ou toute autre question grâce à notre service d'assistance dédié.",
  },
  {
    title: "Chiffrement et confidentialité des données",
    description:
      "Protégez vos informations grâce à un chiffrement aux normes du secteur, garantissant que vos données personnelles restent sûres et confidentielles.",
  },
  {
    title: "Réclamation d'objets",
    description:
      "Vérifiez et réclamez les objets trouvés en toute sécurité grâce à un processus simplifié, garantissant que seul le propriétaire légitime puisse récupérer l'objet.",
  },
];

const Services = () => {
  const { data: servicesData, isLoading } = useGetServicesQuery({});

  if (isLoading) {
    return (
      <section className="py-16 lg:py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="flex items-center justify-center">
          <Spinner size="xl" />
        </div>
      </section>
    );
  }

  // Use server data if available, otherwise fallback to static data
  const services: Service[] = servicesData?.data || defaultServices;
  return (
    <section
      id="features"
      className="py-16 lg:py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black"
    >
      <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="mx-auto flex max-w-4xl flex-col items-center space-y-4 text-center mb-16">
          <h2 className="text-4xl md:text-5xl tracking-tight font-extrabold leading-tight text-white">
            Nos{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              services
            </span>
          </h2>
          <p className="mb-6 font-light text-gray-300 text-lg md:text-xl max-w-2xl">
            Des solutions complètes de gestion des objets perdus et trouvés,
            conçues pour vous aider à récupérer ce qui compte le plus
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service: Service, index: number) => (
            <div
              key={service.id || index}
              className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl border border-gray-700 p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-gray-600 group"
            >
              <div className="flex flex-col space-y-4">
                <div className="text-blue-400 group-hover:text-cyan-400 transition-colors duration-300">
                  {getServiceIcon(service.title)}
                </div>
                <div className="space-y-3">
                  <h3 className="font-bold text-xl text-white group-hover:text-blue-400 transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
