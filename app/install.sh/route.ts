import { INSTALL_SH } from "./script";

export function GET() {
  return new Response(INSTALL_SH, {
    status: 200,
    headers: {
      "content-type": "text/x-shellscript; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
