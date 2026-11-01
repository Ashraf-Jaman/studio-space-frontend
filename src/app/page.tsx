
import HowItWorks from './../components/home/HowItWorks';
import AboutUs from './../components/home/AboutUs';

export default function Home() {
  return (
    <div>
      <div id="HowItWorks" className="scroll-mt-24">
        <HowItWorks />
      </div>

      <div id="AboutUs" className="scroll-mt-24">
        <AboutUs />
      </div>
    </div>
  );
}
