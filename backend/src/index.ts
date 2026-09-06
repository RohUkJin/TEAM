import { createApp } from "./app";
import { getAccessTokenCookieSecuritySummary } from "./config/authCookie";
import { env } from "./config/env";

const app = createApp();

app.listen(env.port, "0.0.0.0", () => {
  const cookie = getAccessTokenCookieSecuritySummary();
  console.log(`Backend listening on http://0.0.0.0:${env.port}`);
  console.log(
    `Auth cookies: secure=${cookie.secure} sameSite=${cookie.sameSite} accessTTL=${cookie.maxAgeSeconds}s refreshTTL=${cookie.refreshMaxAgeSeconds}s`,
  );
  console.log(
    `Email: transport=${env.emailTransport} from=${env.emailFrom}`,
  );
});
