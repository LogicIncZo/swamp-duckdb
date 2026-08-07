// Entry point — create a CliRenderer and mount the App.

import { createRoot } from "@opentui/react";
import { createCliRenderer } from "@opentui/core";
import { App } from "./App";

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
  autoFocus: true,
  useMouse: false,
});

const root = createRoot(renderer);
root.render(<App />);
