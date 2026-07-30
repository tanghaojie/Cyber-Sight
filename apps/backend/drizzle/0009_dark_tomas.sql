DO $$ BEGIN
 CREATE TYPE "public"."authorization_subject_type" AS ENUM('user', 'role', 'department');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."data_scope_type" AS ENUM('self', 'own_department', 'own_department_tree', 'custom_departments', 'all');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_policy_departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"rule_id" integer NOT NULL,
	"department_id" integer NOT NULL,
	"include_descendants" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_policy_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"subject_type" "authorization_subject_type" NOT NULL,
	"subject_id" integer NOT NULL,
	"resource_key" varchar(100) NOT NULL,
	"action" varchar(50) NOT NULL,
	"scope_type" "data_scope_type" NOT NULL,
	"inherit_to_children" boolean DEFAULT false NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "department_closure" (
	"id" serial PRIMARY KEY NOT NULL,
	"ancestor_id" integer NOT NULL,
	"descendant_id" integer NOT NULL,
	"depth" integer NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer DEFAULT 0 NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(80) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"module" varchar(80) NOT NULL,
	"name" varchar(80) NOT NULL,
	"description" varchar(200) DEFAULT '' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "permissions_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id" integer NOT NULL,
	"permission_key" varchar(100) NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"department_id" integer NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "menus" ADD COLUMN "required_permission_key" varchar(100);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data_policy_departments" ADD CONSTRAINT "data_policy_departments_rule_id_data_policy_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."data_policy_rules"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data_policy_departments" ADD CONSTRAINT "data_policy_departments_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "department_closure" ADD CONSTRAINT "department_closure_ancestor_id_departments_id_fk" FOREIGN KEY ("ancestor_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "department_closure" ADD CONSTRAINT "department_closure_descendant_id_departments_id_fk" FOREIGN KEY ("descendant_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_key_permissions_key_fk" FOREIGN KEY ("permission_key") REFERENCES "public"."permissions"("key") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_departments" ADD CONSTRAINT "user_departments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_departments" ADD CONSTRAINT "user_departments_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "data_policy_departments_rule_department_active_unique" ON "data_policy_departments" USING btree ("rule_id","department_id") WHERE "data_policy_departments"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "data_policy_rules_identity_active_unique" ON "data_policy_rules" USING btree ("subject_type","subject_id","resource_key","action","scope_type") WHERE "data_policy_rules"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "department_closure_path_active_unique" ON "department_closure" USING btree ("ancestor_id","descendant_id") WHERE "department_closure"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "departments_code_active_unique" ON "departments" USING btree ("code") WHERE "departments"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "role_permissions_role_permission_active_unique" ON "role_permissions" USING btree ("role_id","permission_key") WHERE "role_permissions"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_departments_user_department_active_unique" ON "user_departments" USING btree ("user_id","department_id") WHERE "user_departments"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_departments_user_primary_active_unique" ON "user_departments" USING btree ("user_id") WHERE "user_departments"."is_deleted" = false AND "user_departments"."is_primary" = true;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "menus" ADD CONSTRAINT "menus_required_permission_key_permissions_key_fk" FOREIGN KEY ("required_permission_key") REFERENCES "public"."permissions"("key") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
INSERT INTO "permissions" ("key", "module", "name", "description", "enabled") VALUES
	('users.manage', 'users', '用户管理', '管理用户、角色归属、部门归属和用户直接数据策略', true),
	('roles.manage', 'roles', '角色管理', '管理角色、功能权限和角色数据策略', true),
	('departments.manage', 'departments', '部门管理', '管理部门树和部门继承数据策略', true),
	('menus.manage', 'menus', '菜单管理', '管理菜单、路由和菜单权限键', true),
	('dictionaries.manage', 'dictionaries', '字典管理', '管理公共字典数据', true)
ON CONFLICT ("key") DO UPDATE SET
	"module" = EXCLUDED."module",
	"name" = EXCLUDED."name",
	"description" = EXCLUDED."description",
	"enabled" = true,
	"is_deleted" = false,
	"updated_at" = now();
--> statement-breakpoint
INSERT INTO "departments" ("parent_id", "code", "name", "sort_order", "enabled")
SELECT 0, 'DEFAULT', '默认部门', 10, true
WHERE NOT EXISTS (
	SELECT 1 FROM "departments" WHERE "code" = 'DEFAULT' AND "is_deleted" = false
);
--> statement-breakpoint
INSERT INTO "department_closure" ("ancestor_id", "descendant_id", "depth")
SELECT d."id", d."id", 0
FROM "departments" d
WHERE d."code" = 'DEFAULT' AND d."is_deleted" = false
	AND NOT EXISTS (
		SELECT 1 FROM "department_closure" dc
		WHERE dc."ancestor_id" = d."id" AND dc."descendant_id" = d."id" AND dc."is_deleted" = false
	);
--> statement-breakpoint
INSERT INTO "user_departments" ("user_id", "department_id", "is_primary", "created_by", "updated_by")
SELECT u."id", d."id", true, u."id", u."id"
FROM "users" u
JOIN "departments" d ON d."code" = 'DEFAULT' AND d."is_deleted" = false
WHERE u."is_deleted" = false
	AND NOT EXISTS (
		SELECT 1 FROM "user_departments" ud
		WHERE ud."user_id" = u."id" AND ud."is_primary" = true AND ud."is_deleted" = false
	);
--> statement-breakpoint
INSERT INTO "menus" (
	"parent_id", "name", "path", "component", "layout", "external_url", "icon", "sort_order", "type", "enabled", "required_permission_key"
)
SELECT parent."id", '部门管理', 'departments', 'departments', '', '', 'layers', 35, 'menu', true, 'departments.manage'
FROM "menus" parent
WHERE parent."name" = '组织与权限' AND parent."type" = 'directory' AND parent."is_deleted" = false
	AND NOT EXISTS (
		SELECT 1 FROM "menus" existing
		WHERE existing."component" = 'departments' AND existing."is_deleted" = false
	)
LIMIT 1;
--> statement-breakpoint
UPDATE "menus"
SET "required_permission_key" = CASE "component"
	WHEN 'users' THEN 'users.manage'
	WHEN 'roles' THEN 'roles.manage'
	WHEN 'menus' THEN 'menus.manage'
	WHEN 'dictionaries' THEN 'dictionaries.manage'
	WHEN 'departments' THEN 'departments.manage'
	ELSE "required_permission_key"
END,
"updated_at" = now()
WHERE "component" IN ('users', 'roles', 'menus', 'dictionaries', 'departments') AND "is_deleted" = false;
--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id", "permission_key", "created_by", "updated_by")
SELECT DISTINCT rm."role_id", m."required_permission_key", rm."created_by", rm."updated_by"
FROM "role_menus" rm
JOIN "menus" m ON m."id" = rm."menu_id" AND m."is_deleted" = false
WHERE rm."is_deleted" = false AND m."required_permission_key" IS NOT NULL
	AND NOT EXISTS (
		SELECT 1 FROM "role_permissions" rp
		WHERE rp."role_id" = rm."role_id"
			AND rp."permission_key" = m."required_permission_key"
			AND rp."is_deleted" = false
	);
--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id", "permission_key", "created_by", "updated_by")
SELECT r."id", p."key", COALESCE(u."id", 0), COALESCE(u."id", 0)
FROM "roles" r
CROSS JOIN "permissions" p
LEFT JOIN "users" u ON u."username" = 'admin' AND u."is_deleted" = false
WHERE r."code" = 'SUPER_ADMIN' AND r."is_deleted" = false AND p."enabled" = true AND p."is_deleted" = false
	AND NOT EXISTS (
		SELECT 1 FROM "role_permissions" rp
		WHERE rp."role_id" = r."id" AND rp."permission_key" = p."key" AND rp."is_deleted" = false
	);
--> statement-breakpoint
INSERT INTO "data_policy_rules" (
	"subject_type", "subject_id", "resource_key", "action", "scope_type", "enabled", "created_by", "updated_by"
)
SELECT 'role', r."id", 'users', actions."action", 'all', true, COALESCE(u."id", 0), COALESCE(u."id", 0)
FROM "roles" r
CROSS JOIN (VALUES ('read'), ('create'), ('update'), ('delete')) AS actions("action")
LEFT JOIN "users" u ON u."username" = 'admin' AND u."is_deleted" = false
WHERE r."code" = 'SUPER_ADMIN' AND r."is_deleted" = false
	AND NOT EXISTS (
		SELECT 1 FROM "data_policy_rules" rule
		WHERE rule."subject_type" = 'role'
			AND rule."subject_id" = r."id"
			AND rule."resource_key" = 'users'
			AND rule."action" = actions."action"
			AND rule."scope_type" = 'all'
			AND rule."is_deleted" = false
	);
