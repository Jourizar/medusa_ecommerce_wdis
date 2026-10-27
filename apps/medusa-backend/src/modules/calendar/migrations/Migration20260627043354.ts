import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260627043354 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "calendar_event" ("id" text not null, "title" text not null, "description" text null, "type" text check ("type" in ('drop', 'sale', 'event')) not null default 'drop', "starts_at" timestamptz not null, "ends_at" timestamptz null, "product_handle" text null, "image_url" text null, "accent_color" text check ("accent_color" in ('cyan', 'pink', 'purple', 'accent')) not null default 'cyan', "is_published" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "calendar_event_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_calendar_event_deleted_at" ON "calendar_event" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "calendar_event" cascade;`);
  }

}
