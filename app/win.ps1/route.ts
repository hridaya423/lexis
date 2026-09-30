export const runtime = "nodejs";

import { INSTALL_PS1 } from "./script";

export async function GET() {
  return new Response(INSTALL_PS1, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
