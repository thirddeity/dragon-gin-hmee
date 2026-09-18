import * as React from "react";

class FooterSection extends React.Component<{}> {
  public render() {
    return (
      <section className="panel panel-about" id="about">
        <header className="panel-head">
          <p>About</p>
          <h2>A third path between brush and engine</h2>
        </header>
        <div className="about-grid">
          <p>
            Pong-amorn Wongchalermthan works as Third — a 3D interactive artist
            and creative developer who treats landscape painting as a live
            system, not a still image.
          </p>
          <p>
            The work sits where ink, spatial computing, and story share a single
            surface. Visitors do not look at a scene. They enter the stroke and
            leave a trace.
          </p>
        </div>
      </section>
    );
  }
}

export default FooterSection;
