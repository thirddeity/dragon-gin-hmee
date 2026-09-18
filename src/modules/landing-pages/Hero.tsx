import * as React from "react";

interface IAppProps {}

interface IAppState {}

class HeroSection extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);

    this.state = {};
  }

  private InkMotif() {
    return (
      <svg
        className="ink-motif"
        viewBox="0 0 920 520"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="void" cx="58%" cy="42%" r="42%">
            <stop offset="0%" stopColor="#1c2422" />
            <stop offset="55%" stopColor="#0c1211" />
            <stop offset="100%" stopColor="#070a0a" />
          </radialGradient>
          <radialGradient id="goldCore" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#f6e7b4" />
            <stop offset="45%" stopColor="#d4b56a" />
            <stop offset="100%" stopColor="#9a7a38" />
          </radialGradient>
        </defs>

        <circle
          cx="250"
          cy="188"
          r="188"
          stroke="url(#goldArc)"
          strokeWidth="1.15"
        />
        <circle cx="70" cy="162" r="4.2" fill="#e8d39a" />
        <circle cx="70" cy="162" r="1.5" fill="#fff6d4" />

        <g className="ink-motif-orb">
          <circle cx="790" cy="150" r="108" fill="url(#void)" />
          <circle
            cx="790"
            cy="150"
            r="108"
            stroke="#c9a86a"
            strokeWidth="0.6"
            opacity="0.4"
          />
          <circle cx="790" cy="150" r="11" fill="url(#goldCore)" />
          <circle cx="790" cy="147" r="3.2" fill="#fff4c8" opacity="0.8" />
          <circle cx="742" cy="98" r="2.1" fill="#e8d39a" />
          <circle cx="848" cy="122" r="1.4" fill="#f0e0a8" />
          <circle cx="820" cy="214" r="1.8" fill="#d4b56a" />
          <circle cx="752" cy="220" r="1.1" fill="#e8d39a" />
        </g>
      </svg>
    );
  }

  render() {
    return (
      <section className="hero" id="top">
        <div className="hero-stage">
          {this.InkMotif()}
          <h1>Third</h1>
          <p className="hero-name">Pong-amorn Wongchalermthan</p>
          <p className="hero-role">
            3D interactive artist &amp; creative developer
          </p>
          <p className="lede">
            I craft immersive 3D interactive experiences
            <br />
            that blend art, technology, and storytelling.
          </p>
          <div className="hero-actions">
            <a className="pill pill-ink" href="#work">
              <span>+</span> Explore work <span>+</span>
            </a>
            <a className="pill pill-mist" href="#about">
              <span>◇</span> About me <span>◇</span>
            </a>
          </div>
        </div>
      </section>
    );
  }
}

export default HeroSection;
