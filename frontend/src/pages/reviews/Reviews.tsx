import { FaUser } from "react-icons/fa";
import StarRatings from "react-star-ratings";
import { useGetTestimonialsQuery } from "../../redux/api/api";
import { Spinner } from "flowbite-react";

interface Testimonial {
  id?: string;
  rating: number;
  feedback: string;
  name: string;
  position: string;
}

// Fallback static data if no data from server
const fallbackTestimonials: Testimonial[] = [
  {
    rating: 5,
    feedback:
      "Le système Retrouver a simplifié notre processus de restitution des objets perdus à leurs propriétaires. Il est incroyablement intuitif et efficace.",
    name: "Michael T.",
    position: "Responsable des opérations",
  },
  {
    rating: 4,
    feedback:
      "J'ai pu signaler rapidement mon objet perdu, et le système m'a aidé à suivre son statut jusqu'à sa restitution. Service excellent !",
    name: "Sarah L.",
    position: "Voyageuse fréquente",
  },
  {
    rating: 3,
    feedback:
      "Ce système a considérablement réduit le temps et les efforts nécessaires pour gérer les objets perdus. C'est une révolution pour notre service.",
    name: "David R.",
    position: "Responsable du service client",
  },
];

const Reviews = () => {
  const { data: testimonialsData, isLoading } = useGetTestimonialsQuery({});

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
  const testimonials: Testimonial[] =
    testimonialsData?.data || fallbackTestimonials;
  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl text-center">
        <div className="space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl tracking-tight font-extrabold leading-tight text-white">
            Ce que disent nos{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              utilisateurs
            </span>
          </h2>
          <p className="mb-6 font-light text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
            Découvrez les témoignages de ceux qui nous font confiance pour leurs
            objets perdus et trouvés
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials?.map((testimonial: Testimonial, i: number) => {
            return (
              <div
                key={`${testimonial.id || testimonial.name}-${i}`}
                className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl border border-gray-700 p-8 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-gray-600 group"
              >
                <div className="flex flex-col items-center space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaUser size="24" className="text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors duration-300">
                      {testimonial.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {testimonial.position}
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <StarRatings
                      rating={testimonial.rating}
                      starDimension="20px"
                      starSpacing="2px"
                      starRatedColor="#3b82f6"
                    />
                  </div>

                  <blockquote className="text-center text-gray-300 leading-relaxed italic">
                    "{testimonial.feedback}"
                  </blockquote>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default Reviews;
