const AboutUs = () => {
  return (
    <section
      id="aboutUs"
      className="py-16 lg:py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black"
    >
      <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center mb-12">
          <h2 className="mb-6 text-4xl md:text-5xl tracking-tight font-extrabold leading-tight text-white">
            À propos de{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              nous
            </span>
          </h2>
          <p className="mb-8 font-light text-gray-300 text-lg md:text-xl">
            Ne laissez pas vos objets perdus le rester. Retrouver comble le
            fossé entre les objets perdus et trouvés, et vous réunit avec ce qui
            compte le plus.
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl border border-gray-700 p-8 md:p-12">
            <p className="font-light text-gray-300 text-lg md:text-xl leading-relaxed text-center">
              Nous mettons l'accent sur notre engagement à réunir les objets
              perdus et leurs propriétaires tout en assurant un processus
              fluide. Nous agissons avec honnêteté, transparence et empathie.
              Notre volonté de bien faire guide nos actions. Nous comprenons
              l'impact émotionnel de la perte d'un objet. Notre équipe traite
              chaque cas avec compassion et attention. Nous adoptons la
              technologie et des solutions créatives pour améliorer continuellement
              nos services.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-blue-400 text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Rechercher et trouver
                </h3>
                <p className="text-gray-400 text-sm">
                  Des fonctions de recherche avancées pour localiser rapidement
                  les objets perdus
                </p>
              </div>
              <div className="text-center">
                <div className="text-green-400 text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Communauté
                </h3>
                <p className="text-gray-400 text-sm">
                  Relier les personnes grâce à notre plateforme communautaire
                </p>
              </div>
              <div className="text-center">
                <div className="text-cyan-400 text-4xl mb-4">🛡️</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Sécurisé
                </h3>
                <p className="text-gray-400 text-sm">
                  Une gestion des objets sûre et sécurisée, avec protection de la
                  vie privée
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default AboutUs;
