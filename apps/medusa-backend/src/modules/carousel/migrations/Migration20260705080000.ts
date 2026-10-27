import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260705080000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table if not exists "carousel_image" (
        "id" text not null,
        "image_url" text not null,
        "alt_text" text null,
        "href" text null,
        "position" integer not null default 0,
        "is_published" boolean not null default true,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "carousel_image_pkey" primary key ("id")
      );`
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_carousel_image_deleted_at" ON "carousel_image" ("deleted_at") WHERE deleted_at IS NULL;`
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_carousel_image_position" ON "carousel_image" ("position") WHERE deleted_at IS NULL;`
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "carousel_image" cascade;`);
  }
}
