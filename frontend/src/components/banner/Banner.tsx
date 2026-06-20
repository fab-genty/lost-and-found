import { useState, useEffect } from "react";

const Banner = () => {
  const bgImg = "/bgimg.png";
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      badge: "Perdu quelque chose ? Signalez-le !",
      title: "Bienvenue sur Retrouver",
      description:
        "Retrouver est votre partenaire de confiance pour la gestion des objets perdus. Que vous ayez égaré vos affaires ou trouvé un objet abandonné, nous sommes là pour vous aider grâce à notre système moderne et efficace.",
      primaryButton: {
        text: "Signaler un objet perdu",
        href: "/objets/signaler",
        icon: "📋",
      },
      secondaryButton: {
        text: "Parcourir les objets",
        href: "/objets",
        icon: "🔍",
      },
    },
    {
      badge: "Trouvé quelque chose ? Aidez les autres !",
      title: "Aidez à réunir les objets et leurs propriétaires",
      description:
        "Rejoignez notre communauté de citoyens solidaires. En signalant les objets trouvés, vous changez la journée de quelqu'un. Chaque objet signalé nous rapproche d'une communauté plus solidaire.",
      primaryButton: {
        text: "Signaler un animal",
        href: "/animaux/signaler",
        icon: "🤝",
      },
      secondaryButton: {
        text: "Voir les animaux",
        href: "/animaux",
        icon: "🔍",
      },
    },
    {
      badge: "Besoin d'aide ? Nous sommes là !",
      title: "Suivez vos objets et vos demandes",
      description:
        "Restez informé de vos signalements d'objets perdus et de vos demandes de restitution. Notre système de suivi avancé vous garantit de ne jamais manquer une mise à jour lorsque vos affaires sont retrouvées.",
      primaryButton: {
        text: "Mes annonces",
        href: "/mon-espace/annonces",
        icon: "📱",
      },
      secondaryButton: {
        text: "Personnes disparues",
        href: "/personnes",
        icon: "👀",
      },
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [slides.length]);

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <section className="relative flex items-center min-h-[70vh] bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
      <div
        className="absolute inset-0 bg-black/60"
        style={{
          backgroundImage: `url('${bgImg}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 z-5"></div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 mx-auto max-w-7xl text-center">
        <div className="animate-fade-in" key={currentSlide}>
          <div className="inline-flex justify-between items-center py-2 px-4 mb-8 text-sm bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-sm border border-blue-500/30 rounded-full text-white hover:from-blue-600/30 hover:to-cyan-600/30 transition-all duration-300 cursor-pointer group">
            <span className="text-sm font-medium">
              {currentSlideData.badge}
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200 inline-block">
                →
              </span>
            </span>
          </div>

          <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-white transition-all duration-500">
            {currentSlideData.title.includes("Retrouver") ? (
              <>
                Bienvenue sur{" "}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
                  Retrouver
                </span>
              </>
            ) : (
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
                {currentSlideData.title}
              </span>
            )}
          </h1>

          <p className="mb-10 text-lg lg:text-xl font-normal text-gray-300 max-w-4xl mx-auto transition-all duration-500">
            {currentSlideData.description}
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6 mb-8">
            <a
              href={currentSlideData.primaryButton.href}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 group"
            >
              <span>{currentSlideData.primaryButton.text}</span>
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">
                {currentSlideData.primaryButton.icon}
              </span>
            </a>
            <a
              href={currentSlideData.secondaryButton.href}
              className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 group"
            >
              <span>{currentSlideData.secondaryButton.text}</span>
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">
                {currentSlideData.secondaryButton.icon}
              </span>
            </a>
          </div>

          {/* Carousel Dots */}
          <div className="flex justify-center space-x-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-white scale-125"
                    : "bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Aller à la diapositive ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
