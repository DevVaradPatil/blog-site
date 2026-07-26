import { UserRole } from "@prisma/client";
import * as z from "zod";

export const SettingsSchema = z
  .object({
    name: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    role: z.enum([UserRole.ADMIN, UserRole.USER]),
    email: z.optional(z.string().email()),
    password: z.optional(z.string().min(6)),
    newPassword: z.optional(z.string().min(6)),
    bio: z.optional(z.string()),
    linkedin: z.optional(z.string()),
    github: z.optional(z.string()),
  })
  .refine(
    (data) => {
      if (data.password && !data.newPassword) {
        return false;
      }

      return true;
    },
    {
      message: "New password is required!",
      path: ["newPassword"],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && !data.password) {
        return false;
      }

      return true;
    },
    {
      message: "Password is required!",
      path: ["newPassword"],
    }
  );

export const NewPasswordSchema = z.object({
  password: z.string().min(6, {
    message: "Minimum of 6 characters required",
  }),
});

export const ResetSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
});

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
  code: z.optional(z.string()),
});

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(6, {
    message: "Miniumum 6 characters required",
  }),
  name: z.string().min(1, {
    message: "Name is required",
  }),
});

/**
 * The editor's payload. Covers both create and update — the presence of `id`
 * decides which. `authorId` is deliberately absent: the server takes it from
 * the session.
 */
export const PostEditorSchema = z.object({
  id: z.optional(z.string()),
  title: z.string().min(1, { message: "Give it a title" }).max(160, {
    message: "Titles cap at 160 characters",
  }),
  /** Tiptap document. Validated structurally on the server, not here. */
  contentJson: z.any(),
  coverImage: z.optional(z.string().nullable()),
  coverImageId: z.optional(z.string().nullable()),
  tags: z.array(z.string()).max(6, { message: "Six tags maximum" }).default([]),
  link: z.optional(
    z.union([z.string().url({ message: "That isn't a valid URL" }), z.literal("")]),
  ),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

