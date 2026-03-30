import { withEnvlock } from "envlock-next";

export default withEnvlock(
  {
    // your existing Next.js config
  },
  {
    onePasswordEnvId: "your-1password-environment-id", // your 1Password Environment ID
  },
);
