import { AppError } from "../utils/AppError";
import {
  PaginationQuery,
  parsePaginationQuery,
} from "../utils/pagination";
import { requirePositiveInt, requireString } from "../utils/validators";
import { BlogType } from "../types/blog";

export type BlogTeamSort =
  | "members_desc"
  | "members_asc"
  | "created_desc"
  | "created_asc";

export type CreateBlogBody = {
  type: BlogType;
  name: string;
  description: string;
};

export type UpdateBlogBody = {
  name?: string;
  description?: string;
};

export type JoinBlogBody = {
  code: string;
};

export type BlogIdParam = {
  blogId: string;
};

export type ListBlogsQuery = PaginationQuery & {
  type?: BlogType;
  sort?: BlogTeamSort;
};

export type CheckTeamNameQuery = {
  name: string;
};

const TEAM_SORTS = new Set<BlogTeamSort>([
  "members_desc",
  "members_asc",
  "created_desc",
  "created_asc",
]);

export function parseListBlogsQuery(value: unknown): ListBlogsQuery {
  const pagination = parsePaginationQuery(value);
  const query =
    value !== null && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  let type: BlogType | undefined;
  if (query.type !== undefined && query.type !== "") {
    const typeRaw = requireString(query.type, "type", { maxLength: 20 });
    if (typeRaw !== "personal" && typeRaw !== "team") {
      throw AppError.validation("type must be personal or team", {
        field: "type",
      });
    }
    type = typeRaw;
  }

  let sort: BlogTeamSort | undefined;
  if (query.sort !== undefined && query.sort !== "") {
    const sortRaw = requireString(query.sort, "sort", { maxLength: 30 });
    if (!TEAM_SORTS.has(sortRaw as BlogTeamSort)) {
      throw AppError.validation(
        "sort must be members_desc, members_asc, created_desc, or created_asc",
        { field: "sort" },
      );
    }
    sort = sortRaw as BlogTeamSort;
  }

  return {
    ...pagination,
    ...(type ? { type } : {}),
    ...(sort ? { sort } : {}),
  };
}

export function parseCreateBlogBody(value: unknown): CreateBlogBody {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw AppError.validation("Request body must be a JSON object", {
      fields: ["type", "name"],
    });
  }
  const body = value as Record<string, unknown>;
  const typeRaw = requireString(body.type, "type", { maxLength: 20 });
  if (typeRaw !== "personal" && typeRaw !== "team") {
    throw AppError.validation("type must be personal or team", { field: "type" });
  }

  const name =
    typeRaw === "personal"
      ? "personal"
      : requireString(body.name, "name", { maxLength: 100 });

  if (typeRaw === "team" && name.trim().length === 0) {
    throw AppError.validation("name is required for team blogs", {
      field: "name",
    });
  }

  const description =
    typeRaw === "team"
      ? requireString(body.description, "description", {
          minLength: 1,
          maxLength: 1000,
        })
      : "";

  return {
    type: typeRaw,
    name: name.trim(),
    description,
  };
}

export function parseUpdateBlogBody(value: unknown): UpdateBlogBody {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw AppError.validation("Request body must be a JSON object", {
      fields: ["name", "description"],
    });
  }
  const body = value as Record<string, unknown>;
  const hasName = body.name !== undefined;
  const hasDescription = body.description !== undefined;

  if (!hasName && !hasDescription) {
    throw AppError.validation("name or description is required", {
      fields: ["name", "description"],
    });
  }

  return {
    ...(hasName
      ? { name: requireString(body.name, "name", { maxLength: 100 }) }
      : {}),
    ...(hasDescription
      ? {
          description: requireString(body.description, "description", {
            minLength: 1,
            maxLength: 1000,
          }),
        }
      : {}),
  };
}

export function parseCheckTeamNameQuery(value: unknown): CheckTeamNameQuery {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw AppError.validation("Invalid query");
  }
  const query = value as Record<string, unknown>;
  return {
    name: requireString(query.name, "name", { maxLength: 100 }),
  };
}

export function parseJoinBlogBody(value: unknown): JoinBlogBody {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw AppError.validation("Request body must be a JSON object", {
      fields: ["code"],
    });
  }
  const body = value as Record<string, unknown>;
  return {
    code: requireString(body.code, "code", { maxLength: 200 }),
  };
}

export function parseBlogIdParam(value: unknown): BlogIdParam {
  if (value === null || typeof value !== "object") {
    throw AppError.validation("Invalid path params");
  }
  const params = value as Record<string, unknown>;
  const blogId = requirePositiveInt(params.blogId, "blogId");
  return { blogId: String(blogId) };
}
