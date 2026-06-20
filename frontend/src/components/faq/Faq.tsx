import { FaPlus, FaMinus } from "react-icons/fa";
import { useState } from "react";

interface FaqItem {
  id?: string;
  question: string;
  answer: string;
}

const Faq = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  //   const { data: faqsData, isLoading } = useGetFaqsQuery({});

  const toggleFaq = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const defaultFaqs: FaqItem[] = [
    {
      question: "Comment signaler un objet perdu ?",
      answer:
        "Rendez-vous simplement sur la page « Signaler un objet perdu », remplissez le formulaire détaillé avec les informations sur votre objet perdu, notamment la description, le lieu et la date. Notre système vous aidera à suivre votre signalement et vous avertira lorsqu'un objet correspondant sera trouvé.",
    },
    {
      question: "Comment rechercher mon objet perdu ?",
      answer:
        "Utilisez notre recherche avancée pour trouver des objets par catégorie, lieu, date ou mots-clés. Vous pouvez filtrer les résultats pour trouver les objets correspondant à vos affaires perdues.",
    },
    {
      question: "Que se passe-t-il si je trouve un objet qui pourrait m'appartenir ?",
      answer:
        "Lorsque vous repérez un objet qui pourrait être le vôtre, vous pouvez soumettre une demande de restitution accompagnée de détails de vérification. Notre système aide à vérifier la propriété avant d'organiser la restitution.",
    },
    {
      question: "Mes informations personnelles sont-elles en sécurité ?",
      answer:
        "Nous accordons la priorité à la sécurité de vos informations personnelles. Nous utilisons un chiffrement avancé et des mesures strictes de protection des données pour garantir que vos données restent sûres et confidentielles.",
    },
  ];

  const faqs: FaqItem[] = defaultFaqs;

  return (
    <div className="py-16 lg:py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">
          <div className="flex flex-col text-left lg:basis-1/2">
            <p className="inline-block font-semibold text-blue-400 mb-4">FAQ</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Questions{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                fréquentes
              </span>
            </h2>
            <p className="text-gray-300 text-lg">
              Trouvez les réponses aux questions courantes sur notre système de
              gestion des objets perdus et trouvés.
            </p>
          </div>

          <ul className="lg:basis-1/2 space-y-2">
            {faqs.map((faq, index) => (
              <li
                key={index}
                className="bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-black/50 rounded-lg border border-gray-700 overflow-hidden"
              >
                <button
                  className="relative flex gap-4 items-center w-full p-6 text-base font-semibold text-left hover:bg-gray-700/30 transition-all duration-200"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={expandedIndex === index}
                >
                  <span className="flex-1 text-white text-left">
                    {faq.question}
                  </span>
                  <div className="text-blue-400">
                    {expandedIndex === index ? <FaMinus /> : <FaPlus />}
                  </div>
                </button>
                <div
                  className={`transition-[max-height] duration-500 ease-in-out overflow-hidden ${
                    expandedIndex === index ? "max-h-[300px]" : "max-h-0"
                  }`}
                >
                  <div
                    className={`px-6 pb-6 leading-relaxed transform transition-transform duration-500 ${
                      expandedIndex === index
                        ? "translate-y-0"
                        : "-translate-y-4"
                    }`}
                  >
                    <div className="text-gray-300 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Faq;
