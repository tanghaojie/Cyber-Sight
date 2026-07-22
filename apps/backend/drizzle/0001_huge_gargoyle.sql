ALTER TABLE "users" RENAME COLUMN "name" TO "username";--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."menu_type" AS ENUM('directory', 'menu', 'button');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "auth_sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dictionaries" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(80) NOT NULL,
	"label" varchar(80) NOT NULL,
	"value" varchar(120) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"remark" varchar(200) DEFAULT '' NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "menus" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer DEFAULT 0 NOT NULL,
	"name" varchar(80) NOT NULL,
	"code" varchar(80) NOT NULL,
	"path" varchar(160) DEFAULT '' NOT NULL,
	"icon" varchar(50) DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"type" "menu_type" DEFAULT 'menu' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "menus_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role_menus" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id" integer NOT NULL,
	"menu_id" integer NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(80) NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" varchar(200) DEFAULT '' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "roles_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "username" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE varchar(160);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "display_name" varchar(80) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "display_name" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" text DEFAULT 'disabled' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_by" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_by" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_menus" ADD CONSTRAINT "role_menus_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_menus" ADD CONSTRAINT "role_menus_menu_id_menus_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "dictionaries_type_value_unique" ON "dictionaries" USING btree ("type","value","is_deleted");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "role_menus_role_menu_unique" ON "role_menus" USING btree ("role_id","menu_id","is_deleted");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_roles_user_role_unique" ON "user_roles" USING btree ("user_id","role_id","is_deleted");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");--> statement-breakpoint
INSERT INTO "roles" ("name", "code", "description", "enabled")
VALUES ('超级管理员', 'SUPER_ADMIN', '系统内置最高权限角色', true)
ON CONFLICT ("code") DO NOTHING;--> statement-breakpoint
INSERT INTO "menus" ("parent_id", "name", "code", "path", "icon", "sort_order", "type", "enabled") VALUES
  (0, '首页', 'HOME', '/', 'home', 10, 'menu', true),
  (0, '用户管理', 'USER_MANAGEMENT', '/users', 'users', 20, 'menu', true),
  (0, '角色管理', 'ROLE_MANAGEMENT', '/roles', 'shield', 30, 'menu', true),
  (0, '菜单管理', 'MENU_MANAGEMENT', '/menus', 'menu', 40, 'menu', true),
  (0, '字典管理', 'DICTIONARY_MANAGEMENT', '/dictionaries', 'book', 50, 'menu', true)
ON CONFLICT ("code") DO NOTHING;--> statement-breakpoint
INSERT INTO "users" ("username", "display_name", "email", "password_hash", "enabled")
VALUES ('admin', '系统管理员', 'admin@example.com', 'scrypt:a1b2c3d4e5f60718293a4b5c6d7e8f90:5e6d7168e2eba05ebfb78dd0543e3149a699cbfcf24b454deb8b5ef077758e537f864af23485148138854b2638dd5af33a0c2398da1a8510940739ed6c0cd9e8', true)
ON CONFLICT ("username") DO UPDATE SET
  "display_name" = EXCLUDED."display_name",
  "email" = EXCLUDED."email",
  "password_hash" = EXCLUDED."password_hash",
  "enabled" = true,
  "is_deleted" = false,
  "updated_at" = now();--> statement-breakpoint
INSERT INTO "user_roles" ("user_id", "role_id", "created_by", "updated_by")
SELECT u."id", r."id", u."id", u."id"
FROM "users" u, "roles" r
WHERE u."username" = 'admin' AND r."code" = 'SUPER_ADMIN'
ON CONFLICT ("user_id", "role_id", "is_deleted") DO NOTHING;--> statement-breakpoint
INSERT INTO "role_menus" ("role_id", "menu_id", "created_by", "updated_by")
SELECT r."id", m."id", u."id", u."id"
FROM "roles" r, "menus" m, "users" u
WHERE r."code" = 'SUPER_ADMIN' AND u."username" = 'admin'
ON CONFLICT ("role_id", "menu_id", "is_deleted") DO NOTHING;--> statement-breakpoint
INSERT INTO "dictionaries" ("type", "label", "value", "sort_order", "enabled", "remark") VALUES
  ('common_status', '启用', 'enabled', 10, true, '通用启用状态'),
  ('common_status', '停用', 'disabled', 20, true, '通用停用状态')
ON CONFLICT ("type", "value", "is_deleted") DO NOTHING;
