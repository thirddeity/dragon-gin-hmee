import { Component } from "react";
import "./App.css";
import HeroSection from "./modules/landing-pages/Hero";
import BodySection from "./modules/landing-pages/Body";
import FooterSection from "./modules/landing-pages/Footer";
import ScrollFrameCanvas from "./components/ScrollCanvas";

class App extends Component {
  render() {
    return (
      <main className="dreamframe">
        <ScrollFrameCanvas />
        <div className="ui-layer">
          <HeroSection />

          <div className="journey" aria-hidden="true" />

          <BodySection />

          <FooterSection />
        </div>
      </main>
    );
  }
}

export default App;
