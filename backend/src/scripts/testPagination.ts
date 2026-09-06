import { env } from "../config/env";

const base = `http://localhost:${env.port}/api`;

async function get(path: string) {
  const res = await fetch(`${base}${path}`);
  const data = await res.json();
  return { status: res.status, data };
}

async function main() {
  const ok = await get("/posts?page=1&limit=2");
  console.log("PAGE1", ok.status, JSON.stringify(ok.data));

  const defaults = await get("/posts");
  console.log(
    "DEFAULTS",
    defaults.status,
    defaults.data.pagination?.page,
    defaults.data.pagination?.limit,
  );

  const badPage = await get("/posts?page=0");
  console.log("BAD_PAGE", badPage.status, badPage.data?.error?.code);

  const badLimit = await get("/posts?limit=1000");
  console.log("BAD_LIMIT", badLimit.status, badLimit.data?.error?.details);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
