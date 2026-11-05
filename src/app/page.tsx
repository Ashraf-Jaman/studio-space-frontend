
import Hero from './../components/home/Hero';
import FeaturedStudios from './../components/home/FeaturedStudios';
import BrowseCategories from './../components/home/BrowseCategories';
import HowItWorks from './../components/home/HowItWorks';
import AboutUs from './../components/home/AboutUs';

export default function Home() {
  return (
    <div>
      <Hero />

      <FeaturedStudios />

      <BrowseCategories />

      <div id="HowItWorks" className="scroll-mt-24">
        <HowItWorks />
      </div>

      <div id="AboutUs" className="scroll-mt-24">
        <AboutUs />
      </div>
    </div>
  );
}
