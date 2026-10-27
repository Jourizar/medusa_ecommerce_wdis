import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Sparkles } from "@medusajs/icons";
import {
  Badge,
  Button,
  Checkbox,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Switch,
  Text,
  toast,
} from "@medusajs/ui";
import { useEffect, useState } from "react";

type Intensity = "light" | "medium" | "heavy";

type Season = {
  id: string;
  theme: string;
  is_enabled: boolean;
  starts_at: string | null;
  ends_at: string | null;
  particles: boolean;
  decorations: boolean;
  pages: string[] | null;
  intensity: Intensity;
};

// Mirrors the storefront's theme visuals (apps/storefront/src/components/season).
const THEMES: Record<string, { label: string; emoji: string; particles: string; decorations: string }> = {
  christmas: { label: "Christmas", emoji: "🎄", particles: "Falling snow", decorations: "Ornament garland" },
  halloween: { label: "Halloween", emoji: "🎃", particles: "Falling autumn leaves", decorations: "Orange & black bunting" },
  valentines: { label: "Valentine's Day", emoji: "💘", particles: "Floating hearts", decorations: "Heart garland" },
  new_year: { label: "New Year", emoji: "🎆", particles: "Confetti", decorations: "Gold & silver stars" },
  easter: { label: "Easter", emoji: "🐣", particles: "Pastel petals", decorations: "Pastel egg garland" },
  independence_day: { label: "Independence Day", emoji: "🎇", particles: "Red, white & blue confetti", decorations: "Flag bunting" },
};

const PAGES = [
  { key: "all", label: "All pages" },
  { key: "home", label: "Home" },
  { key: "shop", label: "Shop" },
  { key: "product", label: "Product pages" },
  { key: "art", label: "Art" },
  { key: "checkout", label: "Cart & checkout" },
];

// <input type="date"> speaks local YYYY-MM-DD; the API stores instants.
const toDateInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const fromDateInput = (value: string, endOfDay: boolean) =>
  value ? new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00"}`).toISOString() : null;

function status(s: Season, activeId: string | null) {
  const now = Date.now();
  if (s.id === activeId) return { label: "Live now", color: "green" as const };
  if (!s.is_enabled) return { label: "Off", color: "grey" as const };
  if (s.ends_at && new Date(s.ends_at).getTime() < now) return { label: "Ended", color: "orange" as const };
  if (s.starts_at && new Date(s.starts_at).getTime() > now) {
    return { label: `Starts ${new Date(s.starts_at).toLocaleDateString()}`, color: "blue" as const };
  }
  // Enabled and in window, but another live season outranks it.
  return { label: "Waiting (another season is live)", color: "orange" as const };
}

const SeasonsPage = () => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/admin/seasons", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setSeasons(data.seasons ?? []);
        setActiveId(data.active_id ?? null);
      })
      .catch(() => toast.error("Could not load seasons"))
      .finally(() => setLoading(false));
  }, []);

  const save = async (id: string, update: Partial<Season>) => {
    const res = await fetch(`/admin/seasons/${id}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.message ?? "Could not save");
      return false;
    }
    setSeasons((list) => list.map((s) => (s.id === id ? data.season : s)));
    setActiveId(data.active_id ?? null);
    return true;
  };

  const active = seasons.find((s) => s.id === activeId);

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Heading level="h1">Seasons</Heading>
            <Text size="small" className="text-ui-fg-subtle mt-1 max-w-2xl">
              Dress the storefront up for the holidays — falling snow, confetti, garlands and more.
              Turn a theme on now, or give it dates and it switches itself on and off. If several
              are live at once, the one with the latest start date wins.
            </Text>
          </div>
          <Badge color={active ? "green" : "grey"} size="large">
            {active ? `Live: ${THEMES[active.theme]?.emoji ?? ""} ${THEMES[active.theme]?.label ?? active.theme}` : "No season live"}
          </Badge>
        </div>
        <Text size="small" className="text-ui-fg-muted mt-4">
          Preview any theme without turning it on: add <code>?season=christmas</code> (or halloween,
          valentines, new_year, easter, independence_day) to any storefront URL.
        </Text>
      </Container>

      {loading ? (
        <Container className="p-6">
          <Text>Loading…</Text>
        </Container>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {seasons.map((s) => (
            <SeasonCard key={s.id} season={s} activeId={activeId} onSave={save} />
          ))}
        </div>
      )}
    </div>
  );
};

function SeasonCard({
  season,
  activeId,
  onSave,
}: {
  season: Season;
  activeId: string | null;
  onSave: (id: string, update: Partial<Season>) => Promise<boolean>;
}) {
  const meta = THEMES[season.theme] ?? { label: season.theme, emoji: "✨", particles: "Particles", decorations: "Decorations" };
  const [draft, setDraft] = useState(season);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(season), [season]);

  const pages = draft.pages?.length ? draft.pages : ["all"];
  const dirty =
    draft.particles !== season.particles ||
    draft.decorations !== season.decorations ||
    draft.intensity !== season.intensity ||
    toDateInput(draft.starts_at) !== toDateInput(season.starts_at) ||
    toDateInput(draft.ends_at) !== toDateInput(season.ends_at) ||
    pages.join() !== (season.pages?.length ? season.pages : ["all"]).join();
  const st = status(season, activeId);

  const togglePage = (key: string, checked: boolean) => {
    let next: string[];
    if (key === "all") next = checked ? ["all"] : [];
    else next = checked ? [...pages.filter((p) => p !== "all"), key] : pages.filter((p) => p !== key);
    setDraft({ ...draft, pages: next.length ? next : ["all"] });
  };

  const saveDraft = async () => {
    setSaving(true);
    const ok = await onSave(season.id, {
      particles: draft.particles,
      decorations: draft.decorations,
      intensity: draft.intensity,
      starts_at: draft.starts_at,
      ends_at: draft.ends_at,
      pages,
    });
    setSaving(false);
    if (ok) toast.success(`${meta.label} saved`);
  };

  const id = (field: string) => `${season.id}-${field}`;

  return (
    <Container className="p-6 flex flex-col gap-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden>
            {meta.emoji}
          </span>
          <div>
            <Heading level="h2">{meta.label}</Heading>
            <Badge size="2xsmall" color={st.color} className="mt-1">
              {st.label}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor={id("enabled")} size="small">
            {season.is_enabled ? "On" : "Off"}
          </Label>
          <Switch
            id={id("enabled")}
            checked={season.is_enabled}
            onCheckedChange={async (checked) => {
              if (await onSave(season.id, { is_enabled: checked })) {
                toast.success(`${meta.label} turned ${checked ? "on" : "off"}`);
              }
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={id("start")} size="small" weight="plus">
            Start date (optional)
          </Label>
          <Input
            id={id("start")}
            type="date"
            className="mt-1"
            value={toDateInput(draft.starts_at)}
            onChange={(e) => setDraft({ ...draft, starts_at: fromDateInput(e.target.value, false) })}
          />
        </div>
        <div>
          <Label htmlFor={id("end")} size="small" weight="plus">
            End date (optional)
          </Label>
          <Input
            id={id("end")}
            type="date"
            className="mt-1"
            value={toDateInput(draft.ends_at)}
            onChange={(e) => setDraft({ ...draft, ends_at: fromDateInput(e.target.value, true) })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor={id("particles")} size="small" weight="plus">
              {meta.particles}
            </Label>
          </div>
          <Switch
            id={id("particles")}
            checked={draft.particles}
            onCheckedChange={(checked) => setDraft({ ...draft, particles: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor={id("decorations")} size="small" weight="plus">
            {meta.decorations} under the navbar
          </Label>
          <Switch
            id={id("decorations")}
            checked={draft.decorations}
            onCheckedChange={(checked) => setDraft({ ...draft, decorations: checked })}
          />
        </div>
      </div>

      <div className={draft.particles ? "" : "opacity-50 pointer-events-none"}>
        <Label size="small" weight="plus">
          Show {meta.particles.toLowerCase()} on
        </Label>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PAGES.map((p) => (
            <div key={p.key} className="flex items-center gap-2">
              <Checkbox
                id={id(`page-${p.key}`)}
                checked={pages.includes(p.key)}
                onCheckedChange={(checked) => togglePage(p.key, checked === true)}
              />
              <Label htmlFor={id(`page-${p.key}`)} size="small">
                {p.label}
              </Label>
            </div>
          ))}
        </div>
        <div className="mt-3 max-w-[200px]">
          <Label size="small" weight="plus">
            Intensity
          </Label>
          <Select value={draft.intensity} onValueChange={(v) => setDraft({ ...draft, intensity: v as Intensity })}>
            <Select.Trigger className="mt-1">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="light">Light</Select.Item>
              <Select.Item value="medium">Medium</Select.Item>
              <Select.Item value="heavy">Heavy</Select.Item>
            </Select.Content>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-ui-border-base pt-4">
        <Button variant="secondary" size="small" disabled={!dirty || saving} onClick={() => setDraft(season)}>
          Reset
        </Button>
        <Button size="small" disabled={!dirty} isLoading={saving} onClick={saveDraft}>
          Save
        </Button>
      </div>
    </Container>
  );
}

export const config = defineRouteConfig({
  label: "Seasons",
  icon: Sparkles,
});

export default SeasonsPage;
