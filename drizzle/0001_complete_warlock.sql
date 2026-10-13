CREATE TYPE "public"."product_audience" AS ENUM('women', 'men', 'unisex');--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "audience" "product_audience" DEFAULT 'unisex' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "search_vector" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('english', "products"."name"), 'A') || setweight(to_tsvector('english', "products"."tag"), 'B') || setweight(to_tsvector('english', "products"."summary"), 'C') || setweight(to_tsvector('english', "products"."description"), 'D')) STORED;--> statement-breakpoint
CREATE INDEX "products_audience_idx" ON "products" USING btree ("audience");--> statement-breakpoint
CREATE INDEX "products_search_idx" ON "products" USING gin ("search_vector");--> statement-breakpoint
-- Backfill audience from the existing free-text tags ("Men's ..." / "Women's ...").
UPDATE "products" SET "audience" = 'men' WHERE "tag" ILIKE 'men''s%';--> statement-breakpoint
UPDATE "products" SET "audience" = 'women' WHERE "tag" ILIKE 'women''s%';
