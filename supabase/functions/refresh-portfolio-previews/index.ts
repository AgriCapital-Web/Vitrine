import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BUCKET = "portfolio-previews";
const PREVIEW_REFRESH_COOLDOWN_MS = 6 * 60 * 60 * 1000;

const headers = {
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  apikey: SERVICE_ROLE_KEY,
  "Content-Type": "application/json",
};

const normalizeUrl = (value: string) => {
  const raw = value.trim();
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
};

const isHealthyStatus = (status: number) => status >= 200 && status < 400;

const checkOfficialSite = async (url: string) => {
  try {
    const head = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(7000),
    });
    if (isHealthyStatus(head.status)) return head.status;
  } catch {}

  const response = await fetch(url, {
    method: "GET",
    redirect: "follow",
    headers: { Range: "bytes=0-2047", "User-Agent": "Inocent-KOFFI-Portfolio-Monitor/1.0" },
    signal: AbortSignal.timeout(9000),
  });
  return response.status;
};

const updateProject = async (id: string, patch: Record<string, unknown>) => {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/portfolio_projects?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify(patch),
    },
  );
  if (!response.ok) throw new Error(`DB update failed: ${response.status}`);
};

const refreshOne = async (project: any) => {
  const lastPreviewAt = project.last_live_preview_at
    ? Date.parse(project.last_live_preview_at)
    : Number.NaN;
  if (
    project.live_preview_status === "live" &&
    Number.isFinite(lastPreviewAt) &&
    Date.now() - lastPreviewAt < PREVIEW_REFRESH_COOLDOWN_MS
  ) {
    return { slug: project.slug, status: "skipped", reason: "preview_fresh" };
  }

  const source = normalizeUrl(project.official_domain || project.url || "");
  if (!source) return { slug: project.slug, status: "skipped" };

  try {
    const status = await checkOfficialSite(source);
    if (!isHealthyStatus(status)) {
      await updateProject(project.id, {
        live_preview_status: "unavailable",
        live_preview_error: `Official domain returned HTTP ${status}`,
        live_preview_checked_at: new Date().toISOString(),
      });
      return { slug: project.slug, status: "unavailable", http_status: status };
    }

    const screenshotUrl =
      `https://image.thum.io/get/width/1200/crop/700/noanimate/refresh/1/${source}`;
    const screenshot = await fetch(screenshotUrl, {
      redirect: "follow",
      headers: { "User-Agent": "Inocent-KOFFI-Portfolio-Preview/1.0" },
      signal: AbortSignal.timeout(25000),
    });

    if (!screenshot.ok) throw new Error(`Preview provider returned HTTP ${screenshot.status}`);

    const bytes = new Uint8Array(await screenshot.arrayBuffer());
    if (bytes.byteLength < 1000) throw new Error("Preview provider returned an unexpectedly small image");

    const path = `${project.slug}.png`;
    const upload = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURIComponent(path)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          apikey: SERVICE_ROLE_KEY,
          "Content-Type": "image/png",
          "x-upsert": "true",
        },
        body: bytes,
      },
    );
    if (!upload.ok) throw new Error(`Preview storage upload failed: ${upload.status}`);

    const now = new Date().toISOString();
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(path)}?v=${Date.now()}`;

    await updateProject(project.id, {
      last_live_preview_url: publicUrl,
      last_live_preview_at: now,
      live_preview_status: "live",
      live_preview_error: null,
      live_preview_checked_at: now,
    });

    return { slug: project.slug, status: "live", url: publicUrl };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await updateProject(project.id, {
      live_preview_status: "error",
      live_preview_error: message.slice(0, 1000),
      live_preview_checked_at: new Date().toISOString(),
    }).catch(() => {});
    return { slug: project.slug, status: "error", error: message };
  }
};

Deno.serve(async (req) => {
  if (req.method !== "POST" && req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const listResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/portfolio_projects?is_published=eq.true&live_preview_enabled=eq.true&select=id,slug,url,official_domain,last_live_preview_at,live_preview_status`,
      { headers },
    );
    if (!listResponse.ok) throw new Error(`Could not load portfolio projects: ${listResponse.status}`);

    const projects = await listResponse.json();
    const results = await Promise.all(projects.map(refreshOne));

    return Response.json({ ok: true, count: projects.length, results });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
});
