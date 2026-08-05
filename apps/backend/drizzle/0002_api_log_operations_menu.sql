INSERT INTO "sys_permissions" ("key", "module", "name", "description", "enabled")
VALUES ('api_logs.read', 'api-logs', '接口日志查看', '查看持久化的业务接口日志', true)
ON CONFLICT ("key") DO UPDATE SET
	"module" = EXCLUDED."module",
	"name" = EXCLUDED."name",
	"description" = EXCLUDED."description",
	"enabled" = true,
	"is_deleted" = false,
	"updated_at" = now();--> statement-breakpoint
INSERT INTO "sys_menus" (
	"parent_id", "name", "path", "component", "layout", "external_url", "icon", "sort_order", "type", "enabled"
)
SELECT 0, '运维监控', '/ops', '', 'AdminLayout', '', 'monitor', 40, 'directory', true
WHERE NOT EXISTS (
	SELECT 1
	FROM "sys_menus"
	WHERE "parent_id" = 0
		AND "name" = '运维监控'
		AND "type" = 'directory'
		AND "is_deleted" = false
);--> statement-breakpoint
INSERT INTO "sys_menus" (
	"parent_id", "name", "path", "component", "layout", "external_url", "icon", "sort_order", "type", "enabled", "required_permission_key"
)
SELECT parent."id", '接口日志', 'api-logs', 'api-logs', '', '', 'activity', 10, 'menu', true, 'api_logs.read'
FROM "sys_menus" parent
WHERE parent."parent_id" = 0
	AND parent."name" = '运维监控'
	AND parent."type" = 'directory'
	AND parent."is_deleted" = false
	AND NOT EXISTS (
		SELECT 1
		FROM "sys_menus" child
		WHERE child."parent_id" = parent."id"
			AND child."name" = '接口日志'
			AND child."type" = 'menu'
			AND child."is_deleted" = false
	);--> statement-breakpoint
INSERT INTO "sys_role_menus" ("role_id", "menu_id", "created_by", "updated_by")
SELECT r."id", m."id", u."id", u."id"
FROM "sys_roles" r
CROSS JOIN "sys_users" u
JOIN "sys_menus" parent
	ON parent."parent_id" = 0
	AND parent."name" = '运维监控'
	AND parent."type" = 'directory'
	AND parent."is_deleted" = false
JOIN "sys_menus" m
	ON m."parent_id" = parent."id"
	AND m."name" = '接口日志'
	AND m."type" = 'menu'
	AND m."is_deleted" = false
WHERE r."name" = '超级管理员'
	AND r."is_deleted" = false
	AND u."username" = 'admin'
	AND u."is_deleted" = false
ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO "sys_role_permissions" ("role_id", "permission_key", "created_by", "updated_by")
SELECT r."id", 'api_logs.read', u."id", u."id"
FROM "sys_roles" r
CROSS JOIN "sys_users" u
WHERE r."name" = '超级管理员'
	AND r."is_deleted" = false
	AND u."username" = 'admin'
	AND u."is_deleted" = false
ON CONFLICT DO NOTHING;
