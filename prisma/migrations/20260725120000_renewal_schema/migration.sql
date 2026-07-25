-- Renewal schema: blog primitives (comments, real upvotes, bookmarks, follows,
-- normalised tags), post lifecycle fields, and Postgres full-text search.
--
-- Hand-edited from `prisma migrate diff` so it applies cleanly to live data:
-- new NOT NULL columns are added nullable, backfilled, then constrained, and
-- the existing `tags` string array is migrated into Tag/PostTag before the
-- column is dropped.

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_postId_fkey";

-- DropTable (never used by the application)
DROP TABLE "Video";

-- AlterTable: User
ALTER TABLE "User" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable: Post — add everything nullable first so existing rows survive.
ALTER TABLE "Post"
    ADD COLUMN "contentJson"  JSONB,
    ADD COLUMN "coverImage"   TEXT,
    ADD COLUMN "coverImageId" TEXT,
    ADD COLUMN "excerpt"      TEXT,
    ADD COLUMN "publishedAt"  TIMESTAMP(3),
    ADD COLUMN "readingTime"  INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN "slug"         TEXT,
    ADD COLUMN "status"       "PostStatus" NOT NULL DEFAULT 'PUBLISHED';

-- Backfill: slug from title, suffixed with a slice of the id to guarantee
-- uniqueness even when two posts share a title.
UPDATE "Post"
SET "slug" = trim(BOTH '-' FROM regexp_replace(lower("title"), '[^a-z0-9]+', '-', 'g'))
             || '-' || substring("id" FROM 1 FOR 6);

-- Backfill: excerpt from the first 200 characters of collapsed content.
UPDATE "Post"
SET "excerpt" = left(regexp_replace(trim("content"), '\s+', ' ', 'g'), 200)
WHERE "excerpt" IS NULL;

-- Backfill: treat everything that already existed as published.
UPDATE "Post" SET "publishedAt" = "createdAt" WHERE "publishedAt" IS NULL;

-- Backfill: reading time at ~200 words per minute, floor of 1.
UPDATE "Post"
SET "readingTime" = GREATEST(
    1,
    CEIL(array_length(regexp_split_to_array(trim("content"), '\s+'), 1) / 200.0)::int
);

-- Now that every row has one, enforce the constraint.
ALTER TABLE "Post" ALTER COLUMN "slug" SET NOT NULL;

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostTag" (
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "PostTag_pkey" PRIMARY KEY ("postId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "PostTag_tagId_idx" ON "PostTag"("tagId");

-- Migrate the existing `tags` text[] into normalised rows. Distinct raw tags
-- collapse onto a shared slug ("Next.js" and "nextjs" become one tag).
INSERT INTO "Tag" ("id", "name", "slug", "createdAt")
SELECT DISTINCT ON (slugged)
    gen_random_uuid()::text,
    raw_tag,
    slugged,
    CURRENT_TIMESTAMP
FROM (
    SELECT
        t.tag AS raw_tag,
        regexp_replace(lower(t.tag), '[^a-z0-9]+', '', 'g') AS slugged
    FROM "Post" p
    CROSS JOIN LATERAL unnest(p."tags") AS t(tag)
    WHERE trim(t.tag) <> ''
) candidates
WHERE slugged <> ''
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "PostTag" ("postId", "tagId")
SELECT DISTINCT p."id", tg."id"
FROM "Post" p
CROSS JOIN LATERAL unnest(p."tags") AS t(tag)
JOIN "Tag" tg
    ON tg."slug" = regexp_replace(lower(t.tag), '[^a-z0-9]+', '', 'g')
WHERE trim(t.tag) <> ''
ON CONFLICT DO NOTHING;

-- The array column and the client-writable counter are now redundant.
ALTER TABLE "Post" DROP COLUMN "tags", DROP COLUMN "upvotes";

-- Full-text search. A generated column keeps the vector in sync automatically,
-- so nothing in application code has to remember to maintain it. Weighted so a
-- title match outranks a body match.
ALTER TABLE "Post" ADD COLUMN "searchVector" tsvector
GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("title", '')), 'A') ||
    setweight(to_tsvector('english', coalesce("excerpt", '')), 'B') ||
    setweight(to_tsvector('english', coalesce("content", '')), 'C')
) STORED;

CREATE INDEX "Post_searchVector_idx" ON "Post" USING GIN ("searchVector");

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Upvote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Upvote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Comment_postId_createdAt_idx" ON "Comment"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");

-- CreateIndex
CREATE INDEX "Upvote_postId_idx" ON "Upvote"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "Upvote_userId_postId_key" ON "Upvote"("userId", "postId");

-- CreateIndex
CREATE INDEX "Bookmark_userId_createdAt_idx" ON "Bookmark"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_postId_key" ON "Bookmark"("userId", "postId");

-- CreateIndex
CREATE INDEX "Follow_followingId_idx" ON "Follow"("followingId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_followingId_key" ON "Follow"("followerId", "followingId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_status_publishedAt_idx" ON "Post"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upvote" ADD CONSTRAINT "Upvote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upvote" ADD CONSTRAINT "Upvote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTag" ADD CONSTRAINT "PostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTag" ADD CONSTRAINT "PostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
