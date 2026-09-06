import { AppError } from "../utils/AppError";
import { requirePositiveInt, requireString } from "../utils/validators";

export type CreatePostBody = {
  title: string;
  content: string;
  trendingVisible: boolean;
};

export type UpdatePostBody = {
  title: string;
  content: string;
  trendingVisible: boolean;
};

export type CreateCommentBody = {
  content: string;
};

export type UpdateCommentBody = {
  content: string;
};

export type IdParam = {
  id: string;
};

export type PostIdParam = {
  postId: string;
};

export type CommentIdParam = {
  commentId: string;
};

function parseOptionalBoolean(
  value: unknown,
  field: string,
  defaultValue: boolean,
): boolean {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }
  if (typeof value === "boolean") return value;
  if (value === "true" || value === 1 || value === "1") return true;
  if (value === "false" || value === 0 || value === "0") return false;
  throw AppError.validation(`${field} must be a boolean`, { field });
}

export function parseCreatePostBody(value: unknown): CreatePostBody {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw AppError.validation("Request body must be a JSON object", {
      fields: ["title", "content"],
    });
  }
  const body = value as Record<string, unknown>;
  return {
    title: requireString(body.title, "title", { maxLength: 200 }),
    content: requireString(body.content, "content", { maxLength: 20000 }),
    trendingVisible: parseOptionalBoolean(
      body.trendingVisible,
      "trendingVisible",
      false,
    ),
  };
}

export function parseUpdatePostBody(value: unknown): UpdatePostBody {
  return parseCreatePostBody(value);
}

export function parseCreateCommentBody(value: unknown): CreateCommentBody {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw AppError.validation("Request body must be a JSON object", {
      fields: ["content"],
    });
  }
  const body = value as Record<string, unknown>;
  return {
    content: requireString(body.content, "content", { maxLength: 5000 }),
  };
}

export function parseUpdateCommentBody(value: unknown): UpdateCommentBody {
  return parseCreateCommentBody(value);
}

export function parseIdParam(value: unknown): IdParam {
  if (value === null || typeof value !== "object") {
    throw AppError.validation("Invalid path params");
  }
  const params = value as Record<string, unknown>;
  const id = requirePositiveInt(params.id, "id");
  return { id: String(id) };
}

export function parsePostIdParam(value: unknown): PostIdParam {
  if (value === null || typeof value !== "object") {
    throw AppError.validation("Invalid path params");
  }
  const params = value as Record<string, unknown>;
  const postId = requirePositiveInt(params.postId, "postId");
  return { postId: String(postId) };
}

export function parseCommentIdParam(value: unknown): CommentIdParam {
  if (value === null || typeof value !== "object") {
    throw AppError.validation("Invalid path params");
  }
  const params = value as Record<string, unknown>;
  const commentId = requirePositiveInt(params.commentId, "commentId");
  return { commentId: String(commentId) };
}
