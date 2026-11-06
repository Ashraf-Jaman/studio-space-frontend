
import { createAuthClient } from "better-auth/react";
import {
  jwtClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  // Same-origin auth: requests go to this app's own /api/auth (src/app/api/auth/[...all]/route.ts).
  // A cross-origin auth base URL (e.g. the backend deployment) makes the session cookie a
  // third-party cookie, which browsers block — sign-up succeeds but sessions (login state,
  // Navbar profile) silently fail. Keep auth on the same origin.
  plugins: [
    jwtClient(),
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          required: false,
        },
      },
    }),
  ],
});


