CREATE TABLE IF NOT EXISTS "sys_api_request_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone,
	"request_id" varchar(100) NOT NULL,
	"actor_user_id" integer,
	"actor_username" varchar(50),
	"method" varchar(10) NOT NULL,
	"route_pattern" varchar(160) NOT NULL,
	"http_status" integer NOT NULL,
	"business_status" integer,
	"duration_ms" integer NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sys_api_request_logs_occurred_at_index" ON "sys_api_request_logs" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sys_api_request_logs_expires_at_index" ON "sys_api_request_logs" USING btree ("expires_at") WHERE "sys_api_request_logs"."expires_at" IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sys_api_request_logs_actor_occurred_at_index" ON "sys_api_request_logs" USING btree ("actor_user_id","occurred_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sys_api_request_logs_route_occurred_at_index" ON "sys_api_request_logs" USING btree ("route_pattern","occurred_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sys_api_request_logs_status_occurred_at_index" ON "sys_api_request_logs" USING btree ("http_status","occurred_at");--> statement-breakpoint
INSERT INTO "sys_permissions" ("key", "module", "name", "description", "enabled")
VALUES ('api_logs.read', 'api-logs', '接口日志查看', '查看持久化的业务接口日志', true)
ON CONFLICT ("key") DO NOTHING;--> statement-breakpoint
INSERT INTO "sys_role_permissions" ("role_id", "permission_key", "created_by", "updated_by")
SELECT r."id", p."key", u."id", u."id"
FROM "sys_roles" r
CROSS JOIN "sys_permissions" p
CROSS JOIN "sys_users" u
WHERE r."name" = '超级管理员'
	AND r."is_deleted" = false
	AND p."key" = 'api_logs.read'
	AND p."is_deleted" = false
	AND u."username" = 'admin'
	AND u."is_deleted" = false
ON CONFLICT DO NOTHING;
