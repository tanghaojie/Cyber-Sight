INSERT INTO "sys_permissions" ("key", "module", "name", "description", "enabled")
VALUES ('home.read', 'home', '首页访问', '查看动态工作台首页', true)
ON CONFLICT ("key") DO NOTHING;
--> statement-breakpoint
INSERT INTO "sys_menus" (
	"parent_id", "name", "path", "component", "layout", "external_url", "icon", "sort_order", "type", "enabled", "required_permission_key"
)
SELECT 0, '首页', '/', 'home', 'AdminLayout', '', 'home', 0, 'menu', true, 'home.read'
WHERE NOT EXISTS (
	SELECT 1
	FROM "sys_menus"
	WHERE "component" = 'home'
		AND "type" = 'menu'
		AND "is_deleted" = false
)
	AND NOT EXISTS (
		SELECT 1
		FROM "sys_menus"
		WHERE "path" = '/'
			AND "type" = 'menu'
			AND "is_deleted" = false
	);
--> statement-breakpoint
INSERT INTO "sys_role_permissions" ("role_id", "permission_key", "created_by", "updated_by")
SELECT r."id", 'home.read', u."id", u."id"
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
			AND existing."permission_key" = 'home.read'
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
	AND m."component" = 'home'
	AND m."type" = 'menu'
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
