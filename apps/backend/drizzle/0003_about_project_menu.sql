INSERT INTO "sys_menus" (
	"parent_id", "name", "path", "component", "layout", "external_url", "icon", "sort_order", "type", "enabled"
)
SELECT 0, '关于项目', '/about', 'about', 'AdminLayout', '', 'book', 999, 'menu', true
WHERE NOT EXISTS (
	SELECT 1
	FROM "sys_menus"
	WHERE "parent_id" = 0
		AND "path" = '/about'
		AND "component" = 'about'
		AND "type" = 'menu'
		AND "is_deleted" = false
);
