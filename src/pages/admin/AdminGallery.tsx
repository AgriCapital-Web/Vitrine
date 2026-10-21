import { useCallback, useEffect, useRef, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Archive, ArchiveRestore, Eye, EyeOff, Image, Loader2, RefreshCw, Star, Trash2, Upload, Images, PanelsTopLeft, ArrowLeftRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  alt_text_fr: string | null;
  alt_text_en: string | null;
  type: string;
  category: string | null;
  is_active: boolean;
  is_archived: boolean;
  storage_path: string | null;
  created_at: string;
}

type ViewFilter = "active" | "hidden" | "archived" | "all";
type MediaScope = "hero-terrain" | "gallery" | "all";

const categoryLabel = (category: string | null) => {
  if (category === "hero-terrain") return "Diaporama Héro";
  if (category === "gallery-featured") return "Galerie — à la une";
  return "Galerie photo";
};

const AdminGallery = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [uploadCategory, setUploadCategory] = useState<Exclude<MediaScope, "all">>("hero-terrain");
  const [scope, setScope] = useState<MediaScope>("hero-terrain");
  const [filter, setFilter] = useState<ViewFilter>("active");
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replaceTarget, setReplaceTarget] = useState<MediaItem | null>(null);

  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("site_media")
      .select("*")
      .in("category", ["hero-terrain", "gallery", "gallery-featured"])
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Impossible de charger les médias. Vérifiez les droits Supabase.");
      console.error("[AdminGallery] fetchMedia:", error);
    } else {
      setMedia((data || []) as MediaItem[]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { void fetchMedia(); }, [fetchMedia]);

  const uploadToStorage = async (file: File, category: Exclude<MediaScope, "all">) => {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const folder = category === "hero-terrain" ? "hero" : "gallery";
    const path = `${folder}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from("media").upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type,
    });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    return { path, url: data.publicUrl };
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const invalid = files.find((file) => !file.type.startsWith("image/"));
    if (invalid) {
      toast.error("Tous les fichiers doivent être des images.");
      event.target.value = "";
      return;
    }
    if (files.some((file) => file.size > 15 * 1024 * 1024)) {
      toast.error("Chaque image doit peser au maximum 15 Mo.");
      event.target.value = "";
      return;
    }

    setIsUploading(true);
    const uploadedPaths: string[] = [];
    try {
      const uploaded = [];
      for (const file of files) {
        const { path, url } = await uploadToStorage(file, uploadCategory);
        uploadedPaths.push(path);
        const fallbackName = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
        uploaded.push({
          name: files.length === 1 && title.trim() ? title.trim() : fallbackName,
          url,
          storage_path: path,
          alt_text_fr: comment.trim() || (files.length === 1 ? title.trim() : fallbackName),
          alt_text_en: comment.trim() || (files.length === 1 ? title.trim() : fallbackName),
          type: "image",
          category: uploadCategory,
          is_active: true,
          is_archived: false,
        });
      }

      const { error } = await supabase.from("site_media").insert(uploaded);
      if (error) throw error;
      toast.success(uploadCategory === "hero-terrain"
        ? `${uploaded.length} image(s) ajoutée(s) au diaporama Héro.`
        : `${uploaded.length} image(s) ajoutée(s) à la galerie photo.`);
      setTitle("");
      setComment("");
      setScope(uploadCategory);
      await fetchMedia();
    } catch (error) {
      // Avoid orphaned storage objects if the database insert failed.
      if (uploadedPaths.length) {
        const { error: cleanupError } = await supabase.storage.from("media").remove(uploadedPaths);
        if (cleanupError) console.error("[AdminGallery] storage cleanup failed:", cleanupError);
      }
      toast.error("L’ajout a échoué. Vérifiez le stockage et les autorisations Supabase.");
      console.error("[AdminGallery] handleUpload:", error);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const startReplace = (item: MediaItem) => {
    setReplaceTarget(item);
    replaceInputRef.current?.click();
  };

  const handleReplace = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const target = replaceTarget;
    event.target.value = "";
    setReplaceTarget(null);
    if (!file || !target) return;
    if (!file.type.startsWith("image/") || file.size > 15 * 1024 * 1024) {
      toast.error("Choisissez une image de 15 Mo maximum.");
      return;
    }

    setIsUploading(true);
    let newPath: string | null = null;
    try {
      const category = target.category === "hero-terrain" ? "hero-terrain" : "gallery";
      const { path, url } = await uploadToStorage(file, category);
      newPath = path;
      const { error } = await supabase
        .from("site_media")
        .update({ url, storage_path: path })
        .eq("id", target.id);
      if (error) throw error;

      if (target.storage_path) {
        const { error: removeError } = await supabase.storage.from("media").remove([target.storage_path]);
        if (removeError) console.error("[AdminGallery] ancien fichier non supprimé:", removeError);
      }
      toast.success("Image remplacée avec succès.");
      await fetchMedia();
    } catch (error) {
      if (newPath) await supabase.storage.from("media").remove([newPath]);
      toast.error("Le remplacement a échoué. L’ancienne image est conservée si la mise à jour n’a pas abouti.");
      console.error("[AdminGallery] handleReplace:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const moveCategory = async (item: MediaItem, nextCategory: "hero-terrain" | "gallery") => {
    const { error } = await supabase.from("site_media").update({ category: nextCategory }).eq("id", item.id);
    if (error) {
      toast.error("Impossible de déplacer cette image.");
      console.error("[AdminGallery] moveCategory:", error);
      return;
    }
    toast.success(nextCategory === "hero-terrain" ? "Image publiée dans le diaporama Héro." : "Image déplacée vers la galerie photo.");
    await fetchMedia();
  };

  const toggleFeatured = async (item: MediaItem) => {
    if (item.category === "hero-terrain") return;
    const { error } = await supabase
      .from("site_media")
      .update({ category: item.category === "gallery-featured" ? "gallery" : "gallery-featured" })
      .eq("id", item.id);
    if (error) toast.error("Erreur lors de la mise à la une");
    else { toast.success("Galerie mise à jour"); await fetchMedia(); }
  };

  const toggleVisibility = async (item: MediaItem) => {
    const { error } = await supabase.from("site_media").update({ is_active: !item.is_active }).eq("id", item.id);
    if (error) {
      toast.error("Erreur lors du changement de visibilité");
      console.error("[AdminGallery] toggleVisibility:", error);
    } else {
      toast.success(item.is_active ? "Image masquée du site" : "Image de nouveau visible");
      await fetchMedia();
    }
  };

  const toggleArchive = async (item: MediaItem) => {
    const archiving = !item.is_archived;
    const { error } = await supabase
      .from("site_media")
      .update({ is_archived: archiving, is_active: archiving ? false : item.is_active })
      .eq("id", item.id);
    if (error) {
      toast.error("Erreur lors de l’archivage");
      console.error("[AdminGallery] toggleArchive:", error);
    } else {
      toast.success(archiving ? "Image archivée" : "Image restaurée");
      await fetchMedia();
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm("Supprimer définitivement cette image ? Cette action est irréversible.")) return;
    const { error } = await supabase.from("site_media").delete().eq("id", item.id);
    if (error) {
      toast.error("Erreur lors de la suppression de la fiche média.");
      console.error("[AdminGallery] handleDelete:", error);
      return;
    }
    if (item.storage_path) {
      const { error: removeError } = await supabase.storage.from("media").remove([item.storage_path]);
      if (removeError) {
        console.error("[AdminGallery] fichier de stockage non supprimé:", removeError);
        toast.warning("La référence a été supprimée, mais le fichier de stockage doit être vérifié.");
      } else {
        toast.success("Image supprimée.");
      }
    } else {
      toast.success("Image supprimée.");
    }
    await fetchMedia();
  };

  const inScope = media.filter((item) => {
    if (scope === "all") return true;
    if (scope === "hero-terrain") return item.category === "hero-terrain";
    return item.category === "gallery" || item.category === "gallery-featured";
  });

  const visible = inScope.filter((item) => {
    if (filter === "all") return true;
    if (filter === "archived") return item.is_archived;
    if (filter === "hidden") return !item.is_archived && !item.is_active;
    return !item.is_archived && item.is_active;
  });

  const heroCount = media.filter((item) => item.category === "hero-terrain" && item.is_active && !item.is_archived).length;
  const galleryCount = media.filter((item) => (item.category === "gallery" || item.category === "gallery-featured") && item.is_active && !item.is_archived).length;

  return (
    <AdminLayout title="Photos du site">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <button type="button" onClick={() => { setScope("hero-terrain"); setUploadCategory("hero-terrain"); }} className={`rounded-xl border p-4 text-left transition-colors ${scope === "hero-terrain" ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/50"}`}>
            <div className="flex items-center gap-3"><PanelsTopLeft className="h-5 w-5 text-primary" /><span className="font-semibold">Diaporama Héro</span><Badge variant="secondary">{heroCount} active(s)</Badge></div>
            <p className="mt-2 text-sm text-muted-foreground">Images du grand diaporama en haut de la page d’accueil.</p>
          </button>
          <button type="button" onClick={() => { setScope("gallery"); setUploadCategory("gallery"); }} className={`rounded-xl border p-4 text-left transition-colors ${scope === "gallery" ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/50"}`}>
            <div className="flex items-center gap-3"><Images className="h-5 w-5 text-primary" /><span className="font-semibold">Galerie photo</span><Badge variant="secondary">{galleryCount} active(s)</Badge></div>
            <p className="mt-2 text-sm text-muted-foreground">Images gérées indépendamment du diaporama Héro.</p>
          </button>
        </div>

        <input ref={replaceInputRef} type="file" accept="image/*" className="hidden" onChange={handleReplace} />

        <Card>
          <CardContent className="p-5 space-y-4">
            <div>
              <Label>Destination des nouvelles images</Label>
              <Tabs value={uploadCategory} onValueChange={(value) => { const next = value as Exclude<MediaScope, "all">; setUploadCategory(next); setScope(next); }}>
                <TabsList className="mt-2">
                  <TabsTrigger value="hero-terrain">Diaporama Héro</TabsTrigger>
                  <TabsTrigger value="gallery">Galerie photo</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <div><Label>Titre de l’image</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Pépinière de Daloa" /></div>
              <div><Label>Description / texte alternatif</Label><Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Décrivez l’image pour l’accessibilité et le référencement." className="min-h-10" /></div>
              <Button asChild disabled={isUploading} className="gap-2"><label className="cursor-pointer"><Upload className="h-4 w-4" />{isUploading ? "Téléversement…" : "Ajouter des images"}<input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} /></label></Button>
            </div>
            <p className="text-xs text-muted-foreground">Formats image uniquement, 15 Mo maximum par fichier. Les modifications sont enregistrées dans Supabase et publiées selon la destination choisie.</p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={scope} onValueChange={(value) => { const next = value as MediaScope; setScope(next); if (next !== "all") setUploadCategory(next); }}>
            <TabsList>
              <TabsTrigger value="hero-terrain">Héro</TabsTrigger>
              <TabsTrigger value="gallery">Galerie</TabsTrigger>
              <TabsTrigger value="all">Tous les médias</TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs value={filter} onValueChange={(value) => setFilter(value as ViewFilter)}>
            <TabsList>
              <TabsTrigger value="active">Visibles</TabsTrigger>
              <TabsTrigger value="hidden">Masqués</TabsTrigger>
              <TabsTrigger value="archived">Archivés</TabsTrigger>
              <TabsTrigger value="all">Tous états</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : visible.length === 0 ? (
          <Card><CardContent className="py-12 text-center">
            <Image className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-2 font-semibold">Aucune image dans cette sélection</p>
            <p className="text-sm text-muted-foreground">Choisissez la destination ci-dessus puis ajoutez les images. Vous pouvez aussi afficher les images masquées ou archivées.</p>
          </CardContent></Card>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {visible.map((item) => (
              <Card key={item.id} className="group overflow-hidden">
                <div className="relative aspect-[4/3] bg-muted">
                  <img src={item.url} alt={item.alt_text_fr || item.name} className="h-full w-full object-cover" onError={(event) => { (event.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }} />
                  <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-2 bg-black/65 p-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    {item.category !== "hero-terrain" && <Button size="icon" variant="secondary" onClick={() => void toggleFeatured(item)} title="Mettre à la une"><Star className="h-4 w-4" /></Button>}
                    <Button size="icon" variant="secondary" onClick={() => startReplace(item)} title="Remplacer le fichier"><RefreshCw className="h-4 w-4" /></Button>
                    {scope === "all" && <Button size="icon" variant="secondary" onClick={() => void moveCategory(item, item.category === "hero-terrain" ? "gallery" : "hero-terrain")} title="Déplacer entre Héro et galerie"><ArrowLeftRight className="h-4 w-4" /></Button>}
                    <Button size="icon" variant="secondary" onClick={() => void toggleVisibility(item)} title={item.is_active ? "Masquer" : "Publier"}>{item.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                    <Button size="icon" variant="secondary" onClick={() => void toggleArchive(item)} title={item.is_archived ? "Restaurer" : "Archiver"}>{item.is_archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}</Button>
                    <Button size="icon" variant="destructive" onClick={() => void handleDelete(item)} title="Supprimer"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <CardContent className="space-y-1 p-3">
                  <p className="truncate text-xs font-semibold">{item.name}</p>
                  {item.alt_text_fr && <p className="line-clamp-2 text-[11px] text-muted-foreground">{item.alt_text_fr}</p>}
                  <Badge variant="outline" className="text-[10px]">{categoryLabel(item.category)}</Badge>
                  {!item.is_active && !item.is_archived && <Badge variant="secondary" className="ml-1 text-[10px]">Masquée</Badge>}
                  {item.is_archived && <Badge variant="outline" className="ml-1 text-[10px]">Archivée</Badge>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminGallery;
