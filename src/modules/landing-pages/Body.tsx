import * as React from "react";

class BodySection extends React.Component<{}> {
  public render() {
    const works = [
      {
        medium: "Scroll installation",
        title: "Hanging Ink",
        detail:
          "A shan-shui room that redraws itself as the visitor walks. Fog, pine, and gold dust stay in the same breath as the hand.",
      },
      {
        medium: "Room-scale 3D",
        title: "Orbit Garden",
        detail:
          "A circular path through mist. Each step opens a new ridge; the last step closes the circle into a single gold point.",
      },
      {
        medium: "Realtime portrait",
        title: "Third Breath",
        detail:
          "A live figure that inhales proximity. Stand still and the ink settles. Lean in and the landscape splits.",
      },
    ];

    return (
      <section className="panel" id="work">
        <header className="panel-head">
          <p>Selected work</p>
          <h2>Pieces you can walk through</h2>
        </header>
        <ul className="work-list">
          {works.map((work) => (
            <li key={work.title}>
              <p className="work-medium">{work.medium}</p>
              <h3>{work.title}</h3>
              <p>{work.detail}</p>
            </li>
          ))}
        </ul>
      </section>
    );
  }
}

export default BodySection;
