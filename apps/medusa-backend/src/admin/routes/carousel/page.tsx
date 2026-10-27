import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Photo } from "@medusajs/icons";
import {
  Container,
  Heading,
  Button,
  Input,
  Switch,
  Label,
  Table,
  Badge,
  toast,
} from "@medusajs/ui";
import { useEffect, useRef, useState } from "react";

type CarouselImage = {
  id: string;
  image_url: string;
  alt_text: string | null;
  href: string | null;
  position: number;
  is_published: boolean;
};

const empty = {
  image_url: "",
  alt_text: "",
  href: "",
  position: 0,
  is_published: true,
};

const CarouselPage = () => {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [form, setForm] = useState<Record<string, any>>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const load = async () => {
    const res = await fetch("/admin/carousel-images", { credentials: "include" });
    const data = await res.json();
    setImages(data.carousel_images ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setForm({ ...empty, position: images.length });
    setEditingId(null);
  };

  const save = async () => {
    if (!form.image_url) {
      toast.error("Image is required");
      return;
    }
    setLoading(true);
    const url = editingId
      ? `/admin/carousel-images/${editingId}`
      : "/admin/carousel-images";
    const payload = {
      image_url: form.image_url,
      alt_text: form.alt_text || null,
      href: form.href || null,
      position: Number(form.position) || 0,
      is_published: form.is_published,
    };
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (res.ok) {
      toast.success(editingId ? "Slide updated" : "Slide added");
      reset();
      load();
    } else {
      toast.error("Failed to save slide");
    }
  };

  const edit = (img: CarouselImage) => {
    setEditingId(img.id);
    setForm({
      image_url: img.image_url,
      alt_text: img.alt_text ?? "",
      href: img.href ?? "",
      position: img.position,
      is_published: img.is_published,
    });
  };

  const onImageFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("File must be an image");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8 MB");
      return;
    }
    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const res = await fetch("/admin/carousel-images/upload-image", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mime: file.type, data: base64 }),
      });
      const data = await res.json();
      if (!res.ok || !data.image_data_url) {
        toast.error(data.error || "Upload failed");
        return;
      }
      setForm((f) => ({ ...f, image_url: data.image_data_url }));
      const saved = Math.max(
        0,
        Math.round(
          ((data.original_bytes - data.compressed_bytes) /
            data.original_bytes) *
            100
        )
      );
      toast.success(
        `Compressed to ${(data.compressed_bytes / 1024).toFixed(1)} KB (${saved}% smaller)`
      );
    } catch (err: any) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const clearImage = () => setForm({ ...form, image_url: "" });

  const remove = async (id: string) => {
    if (!confirm("Delete this slide?")) return;
    const res = await fetch(`/admin/carousel-images/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      toast.success("Deleted");
      load();
    }
  };

  const swapPosition = async (idx: number, dir: -1 | 1) => {
    const other = idx + dir;
    if (other < 0 || other >= images.length) return;
    const a = images[idx];
    const b = images[other];
    await Promise.all([
      fetch(`/admin/carousel-images/${a.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: b.position }),
      }),
      fetch(`/admin/carousel-images/${b.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: a.position }),
      }),
    ]);
    load();
  };

  const togglePublish = async (img: CarouselImage) => {
    await fetch(`/admin/carousel-images/${img.id}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !img.is_published }),
    });
    load();
  };

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading>Hero Carousel</Heading>
      </div>

      <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="lg:col-span-2">
          <Label>Image</Label>
          <div className="flex flex-col gap-3 mt-1">
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onImageFile(f);
                }}
              />
              <Button
                variant="secondary"
                size="small"
                onClick={() => fileInputRef.current?.click()}
                isLoading={uploading}
              >
                {form.image_url ? "Replace image" : "Upload image"}
              </Button>
              {form.image_url && (
                <Button
                  variant="danger"
                  size="small"
                  onClick={clearImage}
                  disabled={uploading}
                >
                  Remove
                </Button>
              )}
              <span className="text-ui-fg-muted text-xs">
                PNG / JPG / WebP, max 8 MB — compressed to WebP.
              </span>
            </div>

            <Input
              value={form.image_url?.startsWith("data:") ? "" : form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="…or paste an external image URL"
            />

            {form.image_url && (
              <div className="border border-ui-border-base rounded-md p-2 bg-ui-bg-subtle flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.image_url}
                  alt="Preview"
                  className="w-40 h-52 object-cover rounded"
                />
                <div className="text-xs text-ui-fg-muted">
                  {form.image_url.startsWith("data:")
                    ? `Stored in DB · ${(
                        (form.image_url.length * 0.75) /
                        1024
                      ).toFixed(1)} KB`
                    : "External URL"}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <Label>Alt text (optional)</Label>
          <Input
            value={form.alt_text}
            onChange={(e) => setForm({ ...form, alt_text: e.target.value })}
            placeholder="Model in oversized hoodie"
          />
        </div>
        <div>
          <Label>Link (optional)</Label>
          <Input
            value={form.href}
            onChange={(e) => setForm({ ...form, href: e.target.value })}
            placeholder="/products/street-hoodie"
          />
        </div>

        <div>
          <Label>Position</Label>
          <Input
            type="number"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            placeholder="0"
          />
        </div>
        <div className="flex items-center gap-3 pt-7">
          <Switch
            checked={form.is_published}
            onCheckedChange={(c) => setForm({ ...form, is_published: c })}
          />
          <Label>Published</Label>
        </div>

        <div className="lg:col-span-2 flex gap-2 pt-2">
          <Button onClick={save} isLoading={loading}>
            {editingId ? "Update slide" : "Add slide"}
          </Button>
          {editingId && (
            <Button variant="secondary" onClick={reset}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="px-6 py-6">
        <Heading level="h2" className="mb-4">
          Slides
        </Heading>
        {images.length === 0 ? (
          <p className="text-ui-fg-muted">No slides yet. Add one above.</p>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Preview</Table.HeaderCell>
                <Table.HeaderCell>Alt / Link</Table.HeaderCell>
                <Table.HeaderCell>Pos</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {images.map((img, i) => (
                <Table.Row key={img.id}>
                  <Table.Cell>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.image_url}
                      alt={img.alt_text ?? ""}
                      className="w-16 h-20 object-cover rounded"
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm">{img.alt_text || "—"}</div>
                    <div className="text-xs text-ui-fg-muted">
                      {img.href || "no link"}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => swapPosition(i, -1)}
                        disabled={i === 0}
                      >
                        ↑
                      </Button>
                      <span className="w-8 text-center">{img.position}</span>
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => swapPosition(i, 1)}
                        disabled={i === images.length - 1}
                      >
                        ↓
                      </Button>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <button
                      type="button"
                      onClick={() => togglePublish(img)}
                      className="cursor-pointer"
                    >
                      <Badge color={img.is_published ? "green" : "grey"}>
                        {img.is_published ? "Published" : "Hidden"}
                      </Badge>
                    </button>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => edit(img)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="danger"
                        onClick={() => remove(img.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Carousel",
  icon: Photo,
});

export default CarouselPage;
