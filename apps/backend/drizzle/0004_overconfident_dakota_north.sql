ALTER TABLE "roles" DROP CONSTRAINT "roles_code_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_username_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "dictionaries_type_value_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "role_menus_role_menu_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "user_roles_user_role_unique";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "dictionaries_type_value_active_unique" ON "dictionaries" USING btree ("type","value") WHERE "dictionaries"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "role_menus_role_menu_active_unique" ON "role_menus" USING btree ("role_id","menu_id") WHERE "role_menus"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "roles_code_active_unique" ON "roles" USING btree ("code") WHERE "roles"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_roles_user_role_active_unique" ON "user_roles" USING btree ("user_id","role_id") WHERE "user_roles"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_active_unique" ON "users" USING btree ("username") WHERE "users"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_active_unique" ON "users" USING btree ("email") WHERE "users"."is_deleted" = false;