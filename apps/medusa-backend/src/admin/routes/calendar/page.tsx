import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Calendar } from "@medusajs/icons";
import {
  Container,
  Heading,
  Button,
  Input,
  Textarea,
  Select,
  Switch,
  Label,
  Table,
  Badge,
  toast,
} from "@medusajs/ui";
import { useEffect, useRef, useState } from "react";

type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  type: "drop" | "sale" | "event";
  starts_at: string;
  ends_at: string | null;
  product_handle: string | null;
  image_url: string | null;
  accent_color: "cyan" | "pink" | "purple" | "accent";
  is_published: boolean;
};

const empty = {
  title: "",
  description: "",
  type: "drop",
  starts_at: "",
  ends_at: "",
  product_handle: "",
  image_url: "",
  accent_color: "cyan",
  is_published: true,
};

const CalendarPage = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [form, setForm] = useState<Record<string, any>>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const load = async () => {
    const res = await fetch("/admin/calendar-events", { credentials: "include" });
    const data = await res.json();
    setEvents(data.calendar_events ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setForm(empty);
    setEditingId(null);
  };

  const save = async () => {
    setLoading(true);
    const url = editingId
      ? `/admin/calendar-events/${editingId}`
      : "/admin/calendar-events";
    const payload = {
      ...form,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      description: form.description || null,
      product_handle: form.product_handle || null,
      image_url: form.image_url || null,
    };
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (res.ok) {
      toast.success(editingId ? "Event updated" : "Event created");
      reset();
      load();
    } else {
      toast.error("Failed to save event");
    }
  };

  const edit = (e: CalendarEvent) => {
    setEditingId(e.id);
    setForm({
      title: e.title,
      description: e.description ?? "",
      type: e.type,
      starts_at: e.starts_at ? new Date(e.starts_at).toISOString().slice(0, 16) : "",
      ends_at: e.ends_at ? new Date(e.ends_at).toISOString().slice(0, 16) : "",
      product_handle: e.product_handle ?? "",
      image_url: e.image_url ?? "",
      accent_color: e.accent_color,
      is_published: e.is_published,
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

      const res = await fetch("/admin/calendar-events/upload-image", {
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
    if (!confirm("Delete this event?")) return;
    const res = await fetch(`/admin/calendar-events/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      toast.success("Deleted");
      load();
    }
  };

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading>Drops & Sales Calendar</Heading>
      </div>

      <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <Label>Title</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Summer Drop"
          />
        </div>
        <div>
          <Label>Type</Label>
          <Select
            value={form.type}
            onValueChange={(v) => setForm({ ...form, type: v })}
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="drop">Drop</Select.Item>
              <Select.Item value="sale">Sale</Select.Item>
              <Select.Item value="event">Event</Select.Item>
            </Select.Content>
          </Select>
        </div>

        <div>
          <Label>Starts at</Label>
          <Input
            type="datetime-local"
            value={form.starts_at}
            onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
          />
        </div>
        <div>
          <Label>Ends at (optional)</Label>
          <Input
            type="datetime-local"
            value={form.ends_at}
            onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
          />
        </div>

        <div className="lg:col-span-2">
          <Label>Description</Label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Short teaser…"
          />
        </div>

        <div>
          <Label>Product handle (optional)</Label>
          <Input
            value={form.product_handle}
            onChange={(e) => setForm({ ...form, product_handle: e.target.value })}
            placeholder="urban-classic-tee"
          />
        </div>
        <div className="lg:col-span-2">
          <Label>Image (optional)</Label>
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
              onChange={(e) =>
                setForm({ ...form, image_url: e.target.value })
              }
              placeholder="…or paste an external image URL"
            />

            {form.image_url && (
              <div className="border border-ui-border-base rounded-md p-2 bg-ui-bg-subtle flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.image_url}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded"
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
          <Label>Accent color</Label>
          <Select
            value={form.accent_color}
            onValueChange={(v) => setForm({ ...form, accent_color: v })}
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="cyan">Cyan</Select.Item>
              <Select.Item value="pink">Pink</Select.Item>
              <Select.Item value="purple">Purple</Select.Item>
              <Select.Item value="accent">Accent</Select.Item>
            </Select.Content>
          </Select>
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
            {editingId ? "Update event" : "Create event"}
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
          Events
        </Heading>
        {events.length === 0 ? (
          <p className="text-ui-fg-muted">No events yet. Create one above.</p>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Title</Table.HeaderCell>
                <Table.HeaderCell>Type</Table.HeaderCell>
                <Table.HeaderCell>Starts</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {events.map((e) => (
                <Table.Row key={e.id}>
                  <Table.Cell>{e.title}</Table.Cell>
                  <Table.Cell>
                    <Badge>{e.type}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(e.starts_at).toLocaleString()}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={e.is_published ? "green" : "grey"}>
                      {e.is_published ? "Published" : "Hidden"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2 justify-end">
                      <Button size="small" variant="secondary" onClick={() => edit(e)}>
                        Edit
                      </Button>
                      <Button size="small" variant="danger" onClick={() => remove(e.id)}>
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
  label: "Calendar",
  icon: Calendar,
});

export default CalendarPage;
