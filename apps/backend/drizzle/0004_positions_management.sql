CREATE TABLE IF NOT EXISTS "sys_positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"department_id" integer NOT NULL,
	"name" varchar(80) NOT NULL,
	"description" varchar(200) DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sys_user_positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"position_id" integer NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sys_positions" ADD CONSTRAINT "sys_positions_department_id_sys_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."sys_departments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sys_user_positions" ADD CONSTRAINT "sys_user_positions_user_id_sys_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."sys_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sys_user_positions" ADD CONSTRAINT "sys_user_positions_position_id_sys_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."sys_positions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sys_positions_department_name_active_unique" ON "sys_positions" USING btree ("department_id","name") WHERE "sys_positions"."is_deleted" = false;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sys_user_positions_user_position_active_unique" ON "sys_user_positions" USING btree ("user_id","position_id") WHERE "sys_user_positions"."is_deleted" = false;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sys_user_positions_user_active_index" ON "sys_user_positions" USING btree ("user_id") WHERE "sys_user_positions"."is_deleted" = false;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sys_user_positions_position_active_index" ON "sys_user_positions" USING btree ("position_id") WHERE "sys_user_positions"."is_deleted" = false;
--> statement-breakpoint
INSERT INTO "sys_permissions" ("key", "module", "name", "description", "enabled")
VALUES ('positions.manage', 'positions', '岗位管理', '管理岗位及其部门归属', true)
ON CONFLICT ("key") DO UPDATE SET
	"module" = EXCLUDED."module",
	"name" = EXCLUDED."name",
	"description" = EXCLUDED."description",
	"enabled" = true,
	"is_deleted" = false,
	"updated_at" = now();
--> statement-breakpoint
INSERT INTO "sys_menus" (
	"parent_id", "name", "path", "component", "layout", "external_url", "icon", "sort_order", "type", "enabled", "required_permission_key"
)
SELECT
	parent."id", '岗位管理', 'positions', 'positions', '', '', 'briefcase', 37, 'menu', true, 'positions.manage'
FROM "sys_menus" parent
WHERE parent."name" = '组织与权限'
	AND parent."type" = 'directory'
	AND parent."is_deleted" = false
	AND NOT EXISTS (
		SELECT 1
		FROM "sys_menus" existing
		WHERE existing."path" = 'positions'
			AND existing."component" = 'positions'
			AND existing."is_deleted" = false
	);
--> statement-breakpoint
INSERT INTO "sys_role_permissions" ("role_id", "permission_key", "created_by", "updated_by")
SELECT r."id", 'positions.manage', u."id", u."id"
FROM "sys_roles" r
CROSS JOIN "sys_users" u
WHERE r."name" = '超级管理员'
	AND r."is_deleted" = false
	AND u."username" = 'admin'
	AND u."is_deleted" = false
	AND NOT EXISTS (
		SELECT 1
		FROM "sys_role_permissions" existing
		WHERE existing."role_id" = r."id"
			AND existing."permission_key" = 'positions.manage'
			AND existing."is_deleted" = false
	);
--> statement-breakpoint
INSERT INTO "sys_role_menus" ("role_id", "menu_id", "created_by", "updated_by")
SELECT r."id", m."id", u."id", u."id"
FROM "sys_roles" r
CROSS JOIN "sys_menus" m
CROSS JOIN "sys_users" u
WHERE r."name" = '超级管理员'
	AND r."is_deleted" = false
	AND m."path" = 'positions'
	AND m."component" = 'positions'
	AND m."is_deleted" = false
	AND u."username" = 'admin'
	AND u."is_deleted" = false
	AND NOT EXISTS (
		SELECT 1
		FROM "sys_role_menus" existing
		WHERE existing."role_id" = r."id"
			AND existing."menu_id" = m."id"
			AND existing."is_deleted" = false
	);
