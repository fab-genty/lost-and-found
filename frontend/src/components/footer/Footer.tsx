
const Footers = () => {
  return (
    <footer className="relative bottom-0 pt-16 pb-8 bg-gradient-to-br from-gray-900 via-gray-800 to-black border-t border-gray-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:justify-between">
          <div className="mb-8 md:mb-0">
            <a href="/" className="flex items-center">
              <span className="self-center text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Retrouver
              </span>
            </a>
            <p className="mt-4 text-gray-300 max-w-md">
              Nous reconnectons les personnes avec leurs affaires perdues, un
              objet à la fois.
              <br />
              Nous sommes là pour vous aider à retrouver ce que vous avez perdu.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-6">
            <div>
              <h2 className="mb-6 text-sm font-semibold text-white uppercase">
                Liens rapides
              </h2>
              <ul className="text-gray-400 space-y-3">
                <li>
                  <a
                    href="/objets"
                    className="hover:text-white transition-colors duration-200"
                  >
                    Objets trouvés
                  </a>
                </li>
                <li>
                  <a
                    href="/objets/signaler"
                    className="hover:text-white transition-colors duration-200"
                  >
                    Signaler un objet
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold text-white uppercase">
                Mentions légales
              </h2>
              <ul className="text-gray-400 space-y-3">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200"
                  >
                    Politique de confidentialité
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200"
                  >
                    Conditions générales
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="my-8 border-gray-700" />

        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-400 sm:text-center">
            © 2026 Retrouver. Tous droits réservés.
          </span>
        </div>
      </div>
    </footer>
  );
};
export default Footers;
