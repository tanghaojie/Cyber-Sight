CREATE TYPE "public"."authorization_subject_type" AS ENUM('user', 'role', 'department');--> statement-breakpoint
CREATE TYPE "public"."data_scope_type" AS ENUM('self', 'own_department', 'own_department_tree', 'custom_departments', 'all');--> statement-breakpoint
CREATE TYPE "public"."menu_type" AS ENUM('directory', 'menu', 'button');--> statement-breakpoint
CREATE TABLE "sys_roles" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" varchar(80) NOT NULL,
	"description" varchar(200) DEFAULT '' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "sys_department_closure" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"ancestor_id" uuid NOT NULL,
	"descendant_id" uuid NOT NULL,
	"depth" integer NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "sys_departments" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"parent_id" uuid,
	"name" varchar(80) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "sys_user_departments" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"user_id" uuid NOT NULL,
	"department_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "sys_user_roles" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "sys_users" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"username" varchar(50) NOT NULL,
	"display_name" varchar(80) NOT NULL,
	"email" varchar(160) NOT NULL,
	"password_hash" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "sys_positions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"department_id" uuid NOT NULL,
	"name" varchar(80) NOT NULL,
	"description" varchar(200) DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "sys_user_positions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"user_id" uuid NOT NULL,
	"position_id" uuid NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "sys_data_policy_departments" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"rule_id" uuid NOT NULL,
	"department_id" uuid NOT NULL,
	"include_descendants" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "sys_data_policy_rules" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"subject_type" "authorization_subject_type" NOT NULL,
	"subject_id" uuid NOT NULL,
	"resource_key" varchar(100) NOT NULL,
	"action" varchar(50) NOT NULL,
	"scope_type" "data_scope_type" NOT NULL,
	"inherit_to_children" boolean DEFAULT false NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "sys_permissions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"key" varchar(100) NOT NULL,
	"module" varchar(80) NOT NULL,
	"name" varchar(80) NOT NULL,
	"description" varchar(200) DEFAULT '' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	CONSTRAINT "sys_permissions_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "sys_role_permissions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"role_id" uuid NOT NULL,
	"permission_key" varchar(100) NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "sys_menus" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"parent_id" uuid,
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
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "sys_role_menus" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"role_id" uuid NOT NULL,
	"menu_id" uuid NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "sys_auth_sessions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	CONSTRAINT "sys_auth_sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "sys_dictionaries" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"type" varchar(80) NOT NULL,
	"label" varchar(80) NOT NULL,
	"value" varchar(120) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"remark" varchar(200) DEFAULT '' NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "sys_api_request_logs" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone,
	"request_id" varchar(100) NOT NULL,
	"actor_user_id" uuid,
	"actor_username" varchar(50),
	"method" varchar(10) NOT NULL,
	"route_pattern" varchar(160) NOT NULL,
	"http_status" integer NOT NULL,
	"business_status" integer,
	"duration_ms" integer NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
ALTER TABLE "sys_department_closure" ADD CONSTRAINT "sys_department_closure_ancestor_id_sys_departments_id_fk" FOREIGN KEY ("ancestor_id") REFERENCES "public"."sys_departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_department_closure" ADD CONSTRAINT "sys_department_closure_descendant_id_sys_departments_id_fk" FOREIGN KEY ("descendant_id") REFERENCES "public"."sys_departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_user_departments" ADD CONSTRAINT "sys_user_departments_user_id_sys_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."sys_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_user_departments" ADD CONSTRAINT "sys_user_departments_department_id_sys_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."sys_departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_user_roles" ADD CONSTRAINT "sys_user_roles_user_id_sys_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."sys_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_user_roles" ADD CONSTRAINT "sys_user_roles_role_id_sys_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."sys_roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_positions" ADD CONSTRAINT "sys_positions_department_id_sys_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."sys_departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_user_positions" ADD CONSTRAINT "sys_user_positions_user_id_sys_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."sys_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_user_positions" ADD CONSTRAINT "sys_user_positions_position_id_sys_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."sys_positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_data_policy_departments" ADD CONSTRAINT "sys_data_policy_departments_rule_id_sys_data_policy_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."sys_data_policy_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_data_policy_departments" ADD CONSTRAINT "sys_data_policy_departments_department_id_sys_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."sys_departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_role_permissions" ADD CONSTRAINT "sys_role_permissions_role_id_sys_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."sys_roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_role_permissions" ADD CONSTRAINT "sys_role_permissions_permission_key_sys_permissions_key_fk" FOREIGN KEY ("permission_key") REFERENCES "public"."sys_permissions"("key") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_menus" ADD CONSTRAINT "sys_menus_required_permission_key_sys_permissions_key_fk" FOREIGN KEY ("required_permission_key") REFERENCES "public"."sys_permissions"("key") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_role_menus" ADD CONSTRAINT "sys_role_menus_role_id_sys_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."sys_roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_role_menus" ADD CONSTRAINT "sys_role_menus_menu_id_sys_menus_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."sys_menus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_auth_sessions" ADD CONSTRAINT "sys_auth_sessions_user_id_sys_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."sys_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "sys_department_closure_path_active_unique" ON "sys_department_closure" USING btree ("ancestor_id","descendant_id") WHERE "sys_department_closure"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX "sys_user_departments_user_department_active_unique" ON "sys_user_departments" USING btree ("user_id","department_id") WHERE "sys_user_departments"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX "sys_user_departments_user_primary_active_unique" ON "sys_user_departments" USING btree ("user_id") WHERE "sys_user_departments"."is_deleted" = false AND "sys_user_departments"."is_primary" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "sys_user_roles_user_role_active_unique" ON "sys_user_roles" USING btree ("user_id","role_id") WHERE "sys_user_roles"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX "sys_users_username_active_unique" ON "sys_users" USING btree ("username") WHERE "sys_users"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX "sys_users_email_active_unique" ON "sys_users" USING btree ("email") WHERE "sys_users"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX "sys_positions_department_name_active_unique" ON "sys_positions" USING btree ("department_id","name") WHERE "sys_positions"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX "sys_user_positions_user_position_active_unique" ON "sys_user_positions" USING btree ("user_id","position_id") WHERE "sys_user_positions"."is_deleted" = false;--> statement-breakpoint
CREATE INDEX "sys_user_positions_user_active_index" ON "sys_user_positions" USING btree ("user_id") WHERE "sys_user_positions"."is_deleted" = false;--> statement-breakpoint
CREATE INDEX "sys_user_positions_position_active_index" ON "sys_user_positions" USING btree ("position_id") WHERE "sys_user_positions"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX "sys_data_policy_departments_rule_department_active_unique" ON "sys_data_policy_departments" USING btree ("rule_id","department_id") WHERE "sys_data_policy_departments"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX "sys_data_policy_rules_identity_active_unique" ON "sys_data_policy_rules" USING btree ("subject_type","subject_id","resource_key","action","scope_type") WHERE "sys_data_policy_rules"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX "sys_role_permissions_role_permission_active_unique" ON "sys_role_permissions" USING btree ("role_id","permission_key") WHERE "sys_role_permissions"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX "sys_role_menus_role_menu_active_unique" ON "sys_role_menus" USING btree ("role_id","menu_id") WHERE "sys_role_menus"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX "sys_dictionaries_type_value_active_unique" ON "sys_dictionaries" USING btree ("type","value") WHERE "sys_dictionaries"."is_deleted" = false;--> statement-breakpoint
CREATE INDEX "sys_api_request_logs_occurred_at_index" ON "sys_api_request_logs" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "sys_api_request_logs_expires_at_index" ON "sys_api_request_logs" USING btree ("expires_at") WHERE "sys_api_request_logs"."expires_at" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "sys_api_request_logs_actor_occurred_at_index" ON "sys_api_request_logs" USING btree ("actor_user_id","occurred_at");--> statement-breakpoint
CREATE INDEX "sys_api_request_logs_route_occurred_at_index" ON "sys_api_request_logs" USING btree ("route_pattern","occurred_at");--> statement-breakpoint
CREATE INDEX "sys_api_request_logs_status_occurred_at_index" ON "sys_api_request_logs" USING btree ("http_status","occurred_at");--> statement-breakpoint
INSERT INTO "sys_roles" ("name", "description", "enabled")
VALUES ('超级管理员', '系统内置最高权限角色', true);--> statement-breakpoint
INSERT INTO "sys_users" ("username", "display_name", "email", "password_hash", "enabled")
VALUES ('admin', '系统管理员', 'admin@example.com', 'scrypt:a1b2c3d4e5f60718293a4b5c6d7e8f90:5e6d7168e2eba05ebfb78dd0543e3149a699cbfcf24b454deb8b5ef077758e537f864af23485148138854b2638dd5af33a0c2398da1a8510940739ed6c0cd9e8', true);--> statement-breakpoint
INSERT INTO "sys_permissions" ("key", "module", "name", "description", "enabled") VALUES
	('users.manage', 'users', '用户管理', '管理用户、角色归属、部门归属和用户直接数据策略', true),
	('roles.manage', 'roles', '角色管理', '管理角色、功能权限和角色数据策略', true),
	('departments.manage', 'departments', '部门管理', '管理部门树和部门继承数据策略', true),
	('positions.manage', 'positions', '岗位管理', '管理岗位及其部门归属', true),
	('menus.manage', 'menus', '菜单管理', '管理菜单、路由和菜单权限键', true),
	('dictionaries.manage', 'dictionaries', '字典管理', '管理公共字典数据', true),
	('api_logs.read', 'api-logs', '接口日志查看', '查看持久化的业务接口日志', true),
	('home.read', 'home', '首页访问', '查看动态工作台首页', true);--> statement-breakpoint
INSERT INTO "sys_departments" ("parent_id", "name", "sort_order", "enabled")
VALUES (NULL, '默认部门', 10, true);--> statement-breakpoint
INSERT INTO "sys_user_roles" ("user_id", "role_id", "created_by", "updated_by")
SELECT u."id", r."id", u."id", u."id"
FROM "sys_users" u
CROSS JOIN "sys_roles" r
WHERE u."username" = 'admin' AND r."name" = '超级管理员';--> statement-breakpoint
INSERT INTO "sys_department_closure" ("ancestor_id", "descendant_id", "depth")
SELECT d."id", d."id", 0
FROM "sys_departments" d
WHERE d."name" = '默认部门';--> statement-breakpoint
INSERT INTO "sys_user_departments" ("user_id", "department_id", "is_primary", "created_by", "updated_by")
SELECT u."id", d."id", true, u."id", u."id"
FROM "sys_users" u
CROSS JOIN "sys_departments" d
WHERE u."username" = 'admin' AND d."name" = '默认部门';--> statement-breakpoint
INSERT INTO "sys_menus" (
	"parent_id", "name", "path", "component", "layout", "external_url", "icon", "sort_order", "type", "enabled", "required_permission_key"
) VALUES
	(NULL, '首页', '/', 'home', 'AdminLayout', '', 'home', 0, 'menu', true, 'home.read'),
	(NULL, '组织与权限', '/sys', '', 'AdminLayout', '', 'layers', 20, 'directory', true, NULL),
	(NULL, '系统配置', '/config', '', 'AdminLayout', '', 'settings', 30, 'directory', true, NULL),
	(NULL, '运维监控', '/ops', '', 'AdminLayout', '', 'monitor', 40, 'directory', true, NULL),
	(NULL, '关于项目', '/about', 'about', 'AdminLayout', '', 'book', 999, 'menu', true, NULL);--> statement-breakpoint
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
	('组织与权限', '用户管理', 'users', 'users', 'users', 20, 'users.manage'),
	('组织与权限', '角色管理', 'roles', 'roles', 'shield', 30, 'roles.manage'),
	('组织与权限', '部门管理', 'departments', 'departments', 'layers', 35, 'departments.manage'),
	('组织与权限', '岗位管理', 'positions', 'positions', 'briefcase', 37, 'positions.manage'),
	('组织与权限', '菜单管理', 'menus', 'menus', 'menu', 40, 'menus.manage'),
	('系统配置', '字典管理', 'dictionaries', 'dictionaries', 'book', 50, 'dictionaries.manage'),
	('运维监控', '接口日志', 'api-logs', 'api-logs', 'activity', 10, 'api_logs.read')
) AS seed("parent_name", "name", "path", "component", "icon", "sort_order", "required_permission_key")
JOIN "sys_menus" parent
	ON parent."name" = seed."parent_name"
	AND parent."type" = 'directory';--> statement-breakpoint
INSERT INTO "sys_role_menus" ("role_id", "menu_id", "created_by", "updated_by")
SELECT r."id", m."id", u."id", u."id"
FROM "sys_roles" r
CROSS JOIN "sys_menus" m
CROSS JOIN "sys_users" u
WHERE r."name" = '超级管理员' AND u."username" = 'admin';--> statement-breakpoint
INSERT INTO "sys_dictionaries" ("type", "label", "value", "sort_order", "enabled", "remark") VALUES
	('common_status', '启用', 'enabled', 10, true, '通用启用状态'),
	('common_status', '停用', 'disabled', 20, true, '通用停用状态');--> statement-breakpoint
INSERT INTO "sys_role_permissions" ("role_id", "permission_key", "created_by", "updated_by")
SELECT r."id", p."key", u."id", u."id"
FROM "sys_roles" r
CROSS JOIN "sys_permissions" p
CROSS JOIN "sys_users" u
WHERE r."name" = '超级管理员' AND u."username" = 'admin';--> statement-breakpoint
INSERT INTO "sys_data_policy_rules" (
	"subject_type", "subject_id", "resource_key", "action", "scope_type", "enabled", "created_by", "updated_by"
)
SELECT 'role', r."id", 'users', actions."action", 'all', true, u."id", u."id"
FROM "sys_roles" r
CROSS JOIN (VALUES ('read'), ('create'), ('update'), ('delete')) AS actions("action")
CROSS JOIN "sys_users" u
WHERE r."name" = '超级管理员' AND u."username" = 'admin';
