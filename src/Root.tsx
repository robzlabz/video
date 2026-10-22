import React from "react";
import { Composition, staticFile } from "remotion";
import { Data, FPS, W, H } from "./common/time";
import { Whiteboard } from "./templates/Whiteboard";
import { Infographic } from "./templates/Infographic";
import { Flow } from "./templates/Flow";
import { Versus } from "./templates/Versus";
import { Kinetic } from "./templates/Kinetic";
import { Orbit3D } from "./templates/Orbit3D";

type Props = { name: string; data: Data | null };

/** Every template = one composition. `name` selects public/<name>/data.json (written by scripts/build_audio.py). */
const TEMPLATES: Record<string, React.FC<{ data: Data; name: string }>> = {
  Whiteboard, Infographic, Flow, Versus, Kinetic, Orbit3D,
};

export const Root: React.FC = () => (
  <>
    {Object.entries(TEMPLATES).map(([id, C]) => (
      <Composition<any, Props>
        key={id}
        id={id}
        component={(p: Props) => <C data={p.data!} name={p.name} />}
        width={W}
        height={H}
        fps={FPS}
        durationInFrames={FPS * 10}
        defaultProps={{ name: `sample-${id.toLowerCase()}`, data: null }}
        calculateMetadata={async ({ props }) => {
          const data: Data = await (await fetch(staticFile(`${props.name}/data.json`))).json();
          return { durationInFrames: Math.ceil(data.timeline.duration * FPS), props: { ...props, data } };
        }}
      />
    ))}
  </>
);
