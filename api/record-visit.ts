export default function handler(_req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(410).json({
    ok: false,
    deprecated: true,
    message: "Le suivi détaillé individuel a été désactivé. Le compteur public de pages vues est utilisé.",
  });
}
