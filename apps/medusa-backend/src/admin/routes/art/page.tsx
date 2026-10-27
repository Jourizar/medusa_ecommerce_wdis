import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Palette } from "@medusajs/icons";
import {
  Container,
  Heading,
  Button,
  Select,
  Switch,
  Label,
  toast,
} from "@medusajs/ui";
import { useEffect, useMemo, useState } from "react";

type AdminProduct = {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  categories?: { id: string; handle: string; name: string }[];
};

type ArtMeta = {
  col: number;
  row: number;
  featured: boolean;
};

const ART_HANDLE = "art";

function readArtMeta(p: AdminProduct): ArtMeta {
  const m = (p.metadata ?? {}) as Record<string, any>;
  return {
    col: Number(m.art_col) || 1,
    row: Number(m.art_row) || 1,
    featured: Boolean(m.art_featured),
  };
}

function isInArt(p: AdminProduct, artCatId: string | null) {
  if (!artCatId) return false;
  return (p.categories ?? []).some((c) => c.id === artCatId);
}

const ArtPage = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [artCatId, setArtCatId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, ArtMeta>>({});

  const ensureArtCategory = async () => {
    const res = await fetch(
      `/admin/product-categories?handle=${ART_HANDLE}`,
      { credentials: "include" }
    );
    const data = await res.json();
    if (data.product_categories?.length) {
      setArtCatId(data.product_categories[0].id);
      return data.product_categories[0].id as string;
    }
    const created = await fetch(`/admin/product-categories`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Art",
        handle: ART_HANDLE,
        is_active: true,
        is_internal: false,
      }),
    }).then((r) => r.json());
    setArtCatId(created.product_category.id);
    return created.product_category.id as string;
  };

  const loadProducts = async () => {
    const res = await fetch(
      `/admin/products?limit=100&fields=id,title,handle,thumbnail,description,metadata,*categories`,
      { credentials: "include" }
    );
    const data = await res.json();
    const list: AdminProduct[] = data.products ?? [];
    setProducts(list);
    const d: Record<string, ArtMeta> = {};
    for (const p of list) d[p.id] = readArtMeta(p);
    setDrafts(d);
  };

  useEffect(() => {
    (async () => {
      await ensureArtCategory();
      await loadProducts();
    })();
  }, []);

  const saveProduct = async (p: AdminProduct, includeInArt: boolean) => {
    if (!artCatId) return;
    setSaving(p.id);
    const draft = drafts[p.id] ?? readArtMeta(p);
    const inArtNow = isInArt(p, artCatId);

    const updated_metadata = {
      ...(p.metadata ?? {}),
      art_col: draft.col,
      art_row: draft.row,
      art_featured: draft.featured,
    };

    const body: any = { metadata: updated_metadata };

    // Diff category membership
    const currentCatIds = (p.categories ?? []).map((c) => c.id);
    let nextCatIds: string[] | null = null;
    if (includeInArt && !inArtNow) {
      nextCatIds = [...currentCatIds, artCatId];
    } else if (!includeInArt && inArtNow) {
      nextCatIds = currentCatIds.filter((id) => id !== artCatId);
    }
    if (nextCatIds) {
      body.categories = nextCatIds.map((id) => ({ id }));
    }

    const res = await fetch(`/admin/products/${p.id}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(null);
    if (res.ok) {
      toast.success(`Saved "${p.title}"`);
      await loadProducts();
    } else {
      toast.error("Save failed");
    }
  };

  const setDraft = (id: string, patch: Partial<ArtMeta>) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? { col: 1, row: 1, featured: false }), ...patch },
    }));
  };

  const artProducts = useMemo(
    () => products.filter((p) => isInArt(p, artCatId)),
    [products, artCatId]
  );

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>Art Gallery</Heading>
          <p className="text-ui-fg-muted text-sm mt-1">
            Toggle products into the Art category and set bento grid span.
            Storefront /art renders this layout.
          </p>
        </div>
      </div>

      {/* Live preview */}
      <div className="px-6 py-6">
        <Heading level="h2" className="mb-4">
          Bento Preview ({artProducts.length} piece{artProducts.length !== 1 ? "s" : ""})
        </Heading>
        {artProducts.length === 0 ? (
          <div className="border-2 border-dashed border-ui-border-base p-10 text-center text-ui-fg-muted">
            Toggle products below to populate the gallery.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gridAutoRows: "120px",
              gap: "12px",
            }}
          >
            {artProducts.map((p) => {
              const m = drafts[p.id] ?? readArtMeta(p);
              return (
                <div
                  key={p.id}
                  style={{
                    gridColumn: `span ${Math.min(m.col, 4)}`,
                    gridRow: `span ${Math.min(m.row, 3)}`,
                    border: "3px solid #000",
                    background: m.featured ? "#EC69D4" : "#fff",
                    boxShadow: "5px 5px 0 0 #000",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {p.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: "#000",
                      color: "#fff",
                      padding: "4px 8px",
                      fontWeight: 900,
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {p.title} · {m.col}×{m.row}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Editor table */}
      <div className="px-6 py-6">
        <Heading level="h2" className="mb-4">
          Products
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-ui-border-base">
                <th className="py-2 pr-4">Product</th>
                <th className="py-2 pr-4">In Art</th>
                <th className="py-2 pr-4">Cols</th>
                <th className="py-2 pr-4">Rows</th>
                <th className="py-2 pr-4">Featured</th>
                <th className="py-2 pr-4" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const draft = drafts[p.id] ?? readArtMeta(p);
                const inArt = isInArt(p, artCatId);
                return (
                  <tr key={p.id} className="border-b border-ui-border-base">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        {p.thumbnail && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.thumbnail}
                            alt={p.title}
                            className="w-12 h-12 object-cover border border-ui-border-base"
                          />
                        )}
                        <div>
                          <div className="font-medium">{p.title}</div>
                          <div className="text-ui-fg-muted text-xs">{p.handle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <Switch
                        checked={inArt}
                        onCheckedChange={(checked) =>
                          saveProduct(p, Boolean(checked))
                        }
                      />
                    </td>
                    <td className="py-3 pr-4">
                      <Select
                        value={String(draft.col)}
                        onValueChange={(v) => setDraft(p.id, { col: Number(v) })}
                      >
                        <Select.Trigger className="w-20">
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                          {[1, 2, 3, 4].map((n) => (
                            <Select.Item key={n} value={String(n)}>
                              {n}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </td>
                    <td className="py-3 pr-4">
                      <Select
                        value={String(draft.row)}
                        onValueChange={(v) => setDraft(p.id, { row: Number(v) })}
                      >
                        <Select.Trigger className="w-20">
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                          {[1, 2, 3].map((n) => (
                            <Select.Item key={n} value={String(n)}>
                              {n}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </td>
                    <td className="py-3 pr-4">
                      <Switch
                        checked={draft.featured}
                        onCheckedChange={(c) =>
                          setDraft(p.id, { featured: Boolean(c) })
                        }
                      />
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => saveProduct(p, inArt)}
                        isLoading={saving === p.id}
                      >
                        Save layout
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Art",
  icon: Palette,
});

export default ArtPage;
