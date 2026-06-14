import Banner from "../../components/banner/Banner";
import Services from "../services/Services";
import RecentListings from "../../components/recentItem/RecentListings";
import Reviews from "../reviews/Reviews";
import AboutUs from "../../components/aboutUs/aboutUs";
import Faq from "../../components/faq/Faq";
import SuccessStats from "../../components/successStats/SuccessStats";

const Home = () => {
  return (
    <>
      <Banner />
      <Services />
      <SuccessStats />
      <RecentListings />
      <Reviews />
      <AboutUs />
      <Faq />
    </>
  );
};

export default Home;
