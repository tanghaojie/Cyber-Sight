ALTER TABLE "menus" ADD COLUMN "component" varchar(160) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "menus" ADD COLUMN "external_url" varchar(500) DEFAULT '' NOT NULL;--> statement-breakpoint
INSERT INTO "menus" ("parent_id", "name", "code", "path", "component", "external_url", "icon", "sort_order", "type", "enabled") VALUES
  (0, '工作台', 'WORKBENCH_DIRECTORY', '', '', '', 'grid', 10, 'directory', true),
  (0, '组织与权限', 'ORGANIZATION_DIRECTORY', '', '', '', 'layers', 20, 'directory', true),
  (0, '系统配置', 'SYSTEM_DIRECTORY', '', '', '', 'settings', 30, 'directory', true)
ON CONFLICT ("code") DO NOTHING;--> statement-breakpoint
UPDATE "menus"
SET "parent_id" = (SELECT "id" FROM "menus" WHERE "code" = 'WORKBENCH_DIRECTORY'),
    "component" = 'home',
    "updated_at" = now()
WHERE "code" = 'HOME';--> statement-breakpoint
UPDATE "menus"
SET "parent_id" = (SELECT "id" FROM "menus" WHERE "code" = 'ORGANIZATION_DIRECTORY'),
    "component" = CASE "code"
      WHEN 'USER_MANAGEMENT' THEN 'users'
      WHEN 'ROLE_MANAGEMENT' THEN 'roles'
      WHEN 'MENU_MANAGEMENT' THEN 'menus'
      ELSE "component"
    END,
    "updated_at" = now()
WHERE "code" IN ('USER_MANAGEMENT', 'ROLE_MANAGEMENT', 'MENU_MANAGEMENT');--> statement-breakpoint
UPDATE "menus"
SET "parent_id" = (SELECT "id" FROM "menus" WHERE "code" = 'SYSTEM_DIRECTORY'),
    "component" = 'dictionaries',
    "updated_at" = now()
WHERE "code" = 'DICTIONARY_MANAGEMENT';--> statement-breakpoint
INSERT INTO "role_menus" ("role_id", "menu_id", "created_by", "updated_by")
SELECT r."id", m."id", COALESCE(u."id", 0), COALESCE(u."id", 0)
FROM "roles" r
JOIN "menus" m ON m."code" IN ('WORKBENCH_DIRECTORY', 'ORGANIZATION_DIRECTORY', 'SYSTEM_DIRECTORY')
LEFT JOIN "users" u ON u."username" = 'admin'
WHERE r."code" = 'SUPER_ADMIN'
ON CONFLICT ("role_id", "menu_id", "is_deleted") DO NOTHING;
