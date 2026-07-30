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
DO $$ BEGIN
 CREATE TYPE "public"."menu_type" AS ENUM('directory', 'menu', 'button');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sys_auth_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "sys_auth_sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sys_data_policy_departments" (
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
CREATE TABLE IF NOT EXISTS "sys_data_policy_rules" (
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
CREATE TABLE IF NOT EXISTS "sys_department_closure" (
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
CREATE TABLE IF NOT EXISTS "sys_departments" (
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
CREATE TABLE IF NOT EXISTS "sys_dictionaries" (
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
CREATE TABLE IF NOT EXISTS "sys_menus" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer DEFAULT 0 NOT NULL,
	"name" varchar(80) NOT NULL,
	"path" varchar(160) DEFAULT '' NOT NULL,
	"component" varchar(160) DEFAULT '' NOT NULL,
	"layout" varchar(160) DEFAULT '' NOT NULL,
	"external_url" varchar(500) DEFAULT '' NOT NULL,
	"icon" varchar(50) DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"type" "menu_type" DEFAULT 'menu' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"required_permission_key" varchar(100),
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sys_permissions" (
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
	CONSTRAINT "sys_permissions_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sys_role_menus" (
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
CREATE TABLE IF NOT EXISTS "sys_role_permissions" (
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
CREATE TABLE IF NOT EXISTS "sys_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(80) NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" varchar(200) DEFAULT '' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sys_user_departments" (
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
CREATE TABLE IF NOT EXISTS "sys_user_roles" (
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
CREATE TABLE IF NOT EXISTS "sys_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"display_name" varchar(80) NOT NULL,
	"email" varchar(160) NOT NULL,
	"password_hash" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sys_auth_sessions" ADD CONSTRAINT "sys_auth_sessions_user_id_sys_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."sys_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sys_data_policy_departments" ADD CONSTRAINT "sys_data_policy_departments_rule_id_sys_data_policy_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."sys_data_policy_rules"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sys_data_policy_departments" ADD CONSTRAINT "sys_data_policy_departments_department_id_sys_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."sys_departments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sys_department_closure" ADD CONSTRAINT "sys_department_closure_ancestor_id_sys_departments_id_fk" FOREIGN KEY ("ancestor_id") REFERENCES "public"."sys_departments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sys_department_closure" ADD CONSTRAINT "sys_department_closure_descendant_id_sys_departments_id_fk" FOREIGN KEY ("descendant_id") REFERENCES "public"."sys_departments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sys_menus" ADD CONSTRAINT "sys_menus_required_permission_key_sys_permissions_key_fk" FOREIGN KEY ("required_permission_key") REFERENCES "public"."sys_permissions"("key") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sys_role_menus" ADD CONSTRAINT "sys_role_menus_role_id_sys_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."sys_roles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sys_role_menus" ADD CONSTRAINT "sys_role_menus_menu_id_sys_menus_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."sys_menus"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sys_role_permissions" ADD CONSTRAINT "sys_role_permissions_role_id_sys_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."sys_roles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sys_role_permissions" ADD CONSTRAINT "sys_role_permissions_permission_key_sys_permissions_key_fk" FOREIGN KEY ("permission_key") REFERENCES "public"."sys_permissions"("key") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sys_user_departments" ADD CONSTRAINT "sys_user_departments_user_id_sys_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."sys_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sys_user_departments" ADD CONSTRAINT "sys_user_departments_department_id_sys_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."sys_departments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sys_user_roles" ADD CONSTRAINT "sys_user_roles_user_id_sys_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."sys_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sys_user_roles" ADD CONSTRAINT "sys_user_roles_role_id_sys_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."sys_roles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sys_data_policy_departments_rule_department_active_unique" ON "sys_data_policy_departments" USING btree ("rule_id","department_id") WHERE "sys_data_policy_departments"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sys_data_policy_rules_identity_active_unique" ON "sys_data_policy_rules" USING btree ("subject_type","subject_id","resource_key","action","scope_type") WHERE "sys_data_policy_rules"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sys_department_closure_path_active_unique" ON "sys_department_closure" USING btree ("ancestor_id","descendant_id") WHERE "sys_department_closure"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sys_departments_code_active_unique" ON "sys_departments" USING btree ("code") WHERE "sys_departments"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sys_dictionaries_type_value_active_unique" ON "sys_dictionaries" USING btree ("type","value") WHERE "sys_dictionaries"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sys_role_menus_role_menu_active_unique" ON "sys_role_menus" USING btree ("role_id","menu_id") WHERE "sys_role_menus"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sys_role_permissions_role_permission_active_unique" ON "sys_role_permissions" USING btree ("role_id","permission_key") WHERE "sys_role_permissions"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sys_roles_code_active_unique" ON "sys_roles" USING btree ("code") WHERE "sys_roles"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sys_user_departments_user_department_active_unique" ON "sys_user_departments" USING btree ("user_id","department_id") WHERE "sys_user_departments"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sys_user_departments_user_primary_active_unique" ON "sys_user_departments" USING btree ("user_id") WHERE "sys_user_departments"."is_deleted" = false AND "sys_user_departments"."is_primary" = true;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sys_user_roles_user_role_active_unique" ON "sys_user_roles" USING btree ("user_id","role_id") WHERE "sys_user_roles"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sys_users_username_active_unique" ON "sys_users" USING btree ("username") WHERE "sys_users"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sys_users_email_active_unique" ON "sys_users" USING btree ("email") WHERE "sys_users"."is_deleted" = false;--> statement-breakpoint
INSERT INTO "sys_roles" ("name", "code", "description", "enabled")
VALUES ('超级管理员', 'SUPER_ADMIN', '系统内置最高权限角色', true)
ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO "sys_users" ("username", "display_name", "email", "password_hash", "enabled")
VALUES ('admin', '系统管理员', 'admin@example.com', 'scrypt:a1b2c3d4e5f60718293a4b5c6d7e8f90:5e6d7168e2eba05ebfb78dd0543e3149a699cbfcf24b454deb8b5ef077758e537f864af23485148138854b2638dd5af33a0c2398da1a8510940739ed6c0cd9e8', true)
ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO "sys_user_roles" ("user_id", "role_id", "created_by", "updated_by")
SELECT u."id", r."id", u."id", u."id"
FROM "sys_users" u
CROSS JOIN "sys_roles" r
WHERE u."username" = 'admin'
	AND u."is_deleted" = false
	AND r."code" = 'SUPER_ADMIN'
	AND r."is_deleted" = false
ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO "sys_permissions" ("key", "module", "name", "description", "enabled") VALUES
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
	"updated_at" = now();--> statement-breakpoint
INSERT INTO "sys_departments" ("parent_id", "code", "name", "sort_order", "enabled")
VALUES (0, 'DEFAULT', '默认部门', 10, true)
ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO "sys_department_closure" ("ancestor_id", "descendant_id", "depth")
SELECT d."id", d."id", 0
FROM "sys_departments" d
WHERE d."code" = 'DEFAULT' AND d."is_deleted" = false
ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO "sys_user_departments" ("user_id", "department_id", "is_primary", "created_by", "updated_by")
SELECT u."id", d."id", true, u."id", u."id"
FROM "sys_users" u
CROSS JOIN "sys_departments" d
WHERE u."username" = 'admin'
	AND u."is_deleted" = false
	AND d."code" = 'DEFAULT'
	AND d."is_deleted" = false
ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO "sys_menus" (
	"parent_id", "name", "path", "component", "layout", "external_url", "icon", "sort_order", "type", "enabled"
) VALUES
	(0, '工作台', '', '', '', '', 'grid', 10, 'directory', true),
	(0, '组织与权限', '', '', '', '', 'layers', 20, 'directory', true),
	(0, '系统配置', '', '', '', '', 'settings', 30, 'directory', true);--> statement-breakpoint
INSERT INTO "sys_menus" (
	"parent_id", "name", "path", "component", "layout", "external_url", "icon", "sort_order", "type", "enabled", "required_permission_key"
)
SELECT
	parent."id",
	seed."name",
	seed."path",
	seed."component",
	'',
	'',
	seed."icon",
	seed."sort_order",
	'menu',
	true,
	seed."required_permission_key"
FROM (VALUES
	('工作台', '首页', '/', 'home', 'home', 10, NULL),
	('组织与权限', '用户管理', '/users', 'users', 'users', 20, 'users.manage'),
	('组织与权限', '角色管理', '/roles', 'roles', 'shield', 30, 'roles.manage'),
	('组织与权限', '部门管理', 'departments', 'departments', 'layers', 35, 'departments.manage'),
	('组织与权限', '菜单管理', '/menus', 'menus', 'menu', 40, 'menus.manage'),
	('系统配置', '字典管理', '/dictionaries', 'dictionaries', 'book', 50, 'dictionaries.manage')
) AS seed("parent_name", "name", "path", "component", "icon", "sort_order", "required_permission_key")
JOIN "sys_menus" parent
	ON parent."name" = seed."parent_name"
	AND parent."type" = 'directory'
	AND parent."is_deleted" = false;--> statement-breakpoint
INSERT INTO "sys_role_menus" ("role_id", "menu_id", "created_by", "updated_by")
SELECT r."id", m."id", u."id", u."id"
FROM "sys_roles" r
CROSS JOIN "sys_menus" m
CROSS JOIN "sys_users" u
WHERE r."code" = 'SUPER_ADMIN'
	AND r."is_deleted" = false
	AND m."is_deleted" = false
	AND u."username" = 'admin'
	AND u."is_deleted" = false
ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO "sys_dictionaries" ("type", "label", "value", "sort_order", "enabled", "remark") VALUES
	('common_status', '启用', 'enabled', 10, true, '通用启用状态'),
	('common_status', '停用', 'disabled', 20, true, '通用停用状态')
ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO "sys_role_permissions" ("role_id", "permission_key", "created_by", "updated_by")
SELECT r."id", p."key", u."id", u."id"
FROM "sys_roles" r
CROSS JOIN "sys_permissions" p
CROSS JOIN "sys_users" u
WHERE r."code" = 'SUPER_ADMIN'
	AND r."is_deleted" = false
	AND p."enabled" = true
	AND p."is_deleted" = false
	AND u."username" = 'admin'
	AND u."is_deleted" = false
ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO "sys_data_policy_rules" (
	"subject_type", "subject_id", "resource_key", "action", "scope_type", "enabled", "created_by", "updated_by"
)
SELECT 'role', r."id", 'users', actions."action", 'all', true, u."id", u."id"
FROM "sys_roles" r
CROSS JOIN (VALUES ('read'), ('create'), ('update'), ('delete')) AS actions("action")
CROSS JOIN "sys_users" u
WHERE r."code" = 'SUPER_ADMIN'
	AND r."is_deleted" = false
	AND u."username" = 'admin'
	AND u."is_deleted" = false
ON CONFLICT DO NOTHING;
