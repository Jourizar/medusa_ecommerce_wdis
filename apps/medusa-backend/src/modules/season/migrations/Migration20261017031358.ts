import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261017031358 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "season" drop constraint if exists "season_theme_unique";`);
    this.addSql(`create table if not exists "season" ("id" text not null, "theme" text not null, "is_enabled" boolean not null default false, "starts_at" timestamptz null, "ends_at" timestamptz null, "particles" boolean not null default true, "decorations" boolean not null default true, "pages" text[] null, "intensity" text check ("intensity" in ('light', 'medium', 'heavy')) not null default 'medium', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "season_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_season_theme_unique" ON "season" ("theme") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_season_deleted_at" ON "season" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "season" cascade;`);
  }

}
