import { DatabaseError } from "pg";
import { blogRepository } from "../repositories/blog.repository";
import { userRepository } from "../repositories/user.repository";
import {
  BlogMemberRole,
  BlogRow,
  BlogType,
  PublicBlog,
  TeamCreateStatus,
  toPublicBlog,
} from "../types/blog";
import { AppError } from "../utils/AppError";
import {
  buildPaginationMeta,
  PaginationMeta,
  PaginationQuery,
} from "../utils/pagination";
import { slugifyName } from "../utils/slug";
import {
  generateVerificationToken,
  hashVerificationToken,
} from "../utils/token";
import {
  CreateBlogBody,
  JoinBlogBody,
  UpdateBlogBody,
} from "../validators/blog.validators";

const TEAM_CREATE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const PERSONAL_BLOG_SLUG = "blog";

export type PaginatedBlogs = {
  blogs: PublicBlog[];
  pagination: PaginationMeta;
};

export type CreateInviteResult = {
  code: string;
  blogId: string;
  expiresAt: Date;
};

const INVITE_TTL_MS = 24 * 60 * 60 * 1000;

export type CheckTeamNameResult = {
  name: string;
  available: boolean;
};

function personalBlogName(nickname: string): string {
  return `${nickname}의 블로그`;
}

export class BlogService {
  private async toEnrichedBlog(
    row: BlogRow,
    membership?: {
      isMember: boolean;
      role: BlogMemberRole | null;
      memberCount?: number;
    },
  ): Promise<PublicBlog> {
    const owner = await userRepository.findById(row.owner_id);
    return toPublicBlog(row, {
      isMember: membership?.isMember ?? false,
      role: membership?.role ?? null,
      memberCount: membership?.memberCount,
      ownerNickname: owner?.nickname ?? null,
      ownerUrlSlug: owner?.url_slug ?? null,
    });
  }

  private async uniqueTeamSlug(base: string): Promise<string> {
    let candidate = base;
    let n = 0;
    while (await blogRepository.isTeamSlugTaken(candidate)) {
      n += 1;
      candidate = `${base}-${n}`;
      if (n > 50) {
        candidate = `team-${Date.now()}`;
        break;
      }
    }
    return candidate;
  }

  /** 개인 블로그가 없으면 생성 (idempotent) */
  async ensurePersonalBlog(userId: string, email: string): Promise<PublicBlog> {
    const user = await userRepository.findById(userId);
    const nickname = user?.nickname ?? email.split("@")[0] ?? "user";

    const existing = await blogRepository.findPersonalByOwnerId(userId);
    if (existing) {
      const member = await blogRepository.findMember(existing.id, userId);
      return this.toEnrichedBlog(existing, {
        isMember: Boolean(member),
        role: member?.role ?? null,
      });
    }

    try {
      const created = await blogRepository.create({
        ownerId: userId,
        type: "personal",
        name: personalBlogName(nickname),
        slug: PERSONAL_BLOG_SLUG,
        description: "",
      });
      await blogRepository.addMember({
        blogId: created.id,
        userId,
        role: "owner",
      });
      return this.toEnrichedBlog(created, { isMember: true, role: "owner" });
    } catch (error) {
      if (error instanceof DatabaseError && error.code === "23505") {
        const again = await blogRepository.findPersonalByOwnerId(userId);
        if (again) {
          return this.toEnrichedBlog(again, {
            isMember: true,
            role: "owner",
          });
        }
      }
      throw error;
    }
  }

  async getTeamCreateStatus(userId: string): Promise<TeamCreateStatus> {
    const latest = await blogRepository.findLatestTeamByOwner(userId);
    if (!latest) {
      return {
        hasCreated: false,
        lastCreatedAt: null,
        canCreate: true,
        nextAvailableAt: null,
      };
    }

    const elapsed = Date.now() - new Date(latest.created_at).getTime();
    const canCreate = elapsed >= TEAM_CREATE_WINDOW_MS;
    const nextAvailableAt = canCreate
      ? null
      : new Date(new Date(latest.created_at).getTime() + TEAM_CREATE_WINDOW_MS);

    return {
      hasCreated: true,
      lastCreatedAt: latest.created_at,
      canCreate,
      nextAvailableAt,
    };
  }

  async checkTeamName(name: string): Promise<CheckTeamNameResult> {
    const trimmed = name.trim();
    const available =
      trimmed.length > 0 && !(await blogRepository.isTeamNameTaken(trimmed));
    return { name: trimmed, available };
  }

  async list(
    pagination: PaginationQuery & {
      type?: BlogType;
      sort?:
        | "members_desc"
        | "members_asc"
        | "created_desc"
        | "created_asc";
    },
    viewerUserId?: string,
  ): Promise<PaginatedBlogs> {
    // 개인 블로그는 타인 디렉터리가 아니라 본인 공간만
    if (pagination.type === "personal") {
      if (!viewerUserId) {
        throw AppError.unauthorized("Login required for personal blog");
      }
      const user = await userRepository.findById(viewerUserId);
      if (!user) throw AppError.unauthorized();
      const blog = await this.ensurePersonalBlog(viewerUserId, user.email);
      const memberCount = await blogRepository.countMembers(blog.id);
      return {
        blogs: [{ ...blog, memberCount }],
        pagination: buildPaginationMeta(1, pagination.limit, 1),
      };
    }

    const sort =
      pagination.type === "team"
        ? (pagination.sort ?? "members_desc")
        : pagination.sort;

    const [rows, total] = await Promise.all([
      blogRepository.findMany({
        limit: pagination.limit,
        offset: pagination.offset,
        type: pagination.type,
        sort,
        prioritizeMemberUserId:
          pagination.type === "team" ? viewerUserId : undefined,
      }),
      blogRepository.countAll(pagination.type),
    ]);

    let memberships = new Map<string, { role: BlogMemberRole }>();
    if (viewerUserId && rows.length > 0) {
      const map = await blogRepository.findMembersByBlogIds(
        rows.map((r) => r.id),
        viewerUserId,
      );
      memberships = new Map(
        [...map.entries()].map(([id, m]) => [id, { role: m.role }]),
      );
    }

    const memberCounts = await blogRepository.countMembersByBlogIds(
      rows.map((r) => r.id),
    );
    const owners = await userRepository.findOwnerMetaByIds(
      rows.map((r) => r.owner_id),
    );

    return {
      blogs: rows.map((row) => {
        const m = memberships.get(row.id);
        const owner = owners.get(row.owner_id);
        return toPublicBlog(row, {
          isMember: Boolean(m),
          role: m?.role ?? null,
          memberCount: memberCounts.get(row.id) ?? 0,
          ownerNickname: owner?.nickname ?? null,
          ownerUrlSlug: owner?.urlSlug ?? null,
        });
      }),
      pagination: buildPaginationMeta(pagination.page, pagination.limit, total),
    };
  }

  async getMine(userId: string): Promise<PublicBlog> {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.unauthorized();
    const blog = await this.ensurePersonalBlog(userId, user.email);
    const memberCount = await blogRepository.countMembers(blog.id);
    return {
      ...blog,
      memberCount,
      ownerNickname: user.nickname,
      ownerUrlSlug: user.url_slug,
    };
  }

  async create(userId: string, input: CreateBlogBody): Promise<PublicBlog> {
    if (input.type === "personal") {
      const user = await userRepository.findById(userId);
      if (!user) throw AppError.unauthorized();
      return this.ensurePersonalBlog(userId, user.email);
    }

    const status = await this.getTeamCreateStatus(userId);
    if (!status.canCreate) {
      throw AppError.forbidden(
        "Team blogs can be created only once per week",
        "TEAM_BLOG_WEEKLY_LIMIT",
      );
    }

    if (await blogRepository.isTeamNameTaken(input.name)) {
      throw AppError.conflict(
        "Team blog name is already taken",
        "TEAM_NAME_TAKEN",
      );
    }

    const slug = await this.uniqueTeamSlug(slugifyName(input.name));
    try {
      const created = await blogRepository.create({
        ownerId: userId,
        type: "team",
        name: input.name,
        slug,
        description: input.description,
      });
      await blogRepository.addMember({
        blogId: created.id,
        userId,
        role: "owner",
      });

      return this.toEnrichedBlog(created, { isMember: true, role: "owner" });
    } catch (error) {
      if (error instanceof DatabaseError && error.code === "23505") {
        throw AppError.conflict(
          "Team blog name is already taken",
          "TEAM_NAME_TAKEN",
        );
      }
      throw error;
    }
  }

  async update(
    blogId: string,
    userId: string,
    input: UpdateBlogBody,
  ): Promise<PublicBlog> {
    const blog = await blogRepository.findById(blogId);
    if (!blog) throw AppError.notFound("Blog not found");
    if (blog.type !== "team") {
      throw AppError.badRequest(
        "Only team blogs support updates",
        undefined,
        "UPDATE_NOT_ALLOWED",
      );
    }

    const member = await blogRepository.findMember(blogId, userId);
    if (!member || member.role !== "owner") {
      throw AppError.forbidden(
        "Only the blog owner can update this blog",
        "NOT_BLOG_OWNER",
      );
    }

    if (input.name !== undefined) {
      if (await blogRepository.isTeamNameTaken(input.name, blogId)) {
        throw AppError.conflict(
          "Team blog name is already taken",
          "TEAM_NAME_TAKEN",
        );
      }
    }

    const updated = await blogRepository.updateTeam(blogId, {
      name: input.name,
      description: input.description,
    });
    if (!updated) throw AppError.notFound("Blog not found");

    return this.toEnrichedBlog(updated, {
      isMember: true,
      role: "owner",
      memberCount: await blogRepository.countMembers(blogId),
    });
  }

  async resolvePersonal(
    urlSlug: string,
    blogSlug: string,
    viewerUserId?: string,
  ): Promise<PublicBlog> {
    const row = await blogRepository.findPersonalByUrlSlugAndSlug(
      urlSlug,
      blogSlug,
    );
    if (!row) throw AppError.notFound("Blog not found");
    return this.getPublicMeta(row.id, viewerUserId);
  }

  async resolveTeam(slug: string, viewerUserId?: string): Promise<PublicBlog> {
    const row = await blogRepository.findTeamBySlug(slug);
    if (!row) throw AppError.notFound("Blog not found");
    return this.getPublicMeta(row.id, viewerUserId);
  }

  async getById(blogId: string, viewerUserId?: string): Promise<PublicBlog> {
    const blog = await blogRepository.findById(blogId);
    if (!blog) throw AppError.notFound("Blog not found");

    const member = viewerUserId
      ? await blogRepository.findMember(blogId, viewerUserId)
      : null;

    if (blog.type === "team" && !member) {
      throw AppError.forbidden(
        "Invite code required to enter this team blog",
        "TEAM_BLOG_LOCKED",
      );
    }

    const memberCount = await blogRepository.countMembers(blogId);
    return this.toEnrichedBlog(blog, {
      isMember: Boolean(member),
      role: member?.role ?? null,
      memberCount,
    });
  }

  /** 목록용 메타 — 팀도 잠금 없이 반환 */
  async getPublicMeta(
    blogId: string,
    viewerUserId?: string,
  ): Promise<PublicBlog> {
    const blog = await blogRepository.findById(blogId);
    if (!blog) throw AppError.notFound("Blog not found");

    const member = viewerUserId
      ? await blogRepository.findMember(blogId, viewerUserId)
      : null;

    return this.toEnrichedBlog(blog, {
      isMember: Boolean(member),
      role: member?.role ?? null,
      memberCount: await blogRepository.countMembers(blogId),
    });
  }

  async canReadContent(
    blogId: string,
    viewerUserId?: string,
  ): Promise<boolean> {
    const blog = await blogRepository.findById(blogId);
    if (!blog) throw AppError.notFound("Blog not found");
    if (blog.type === "personal") return true;
    if (!viewerUserId) return false;
    const member = await blogRepository.findMember(blogId, viewerUserId);
    return Boolean(member);
  }

  async assertCanReadContent(
    blogId: string,
    viewerUserId?: string,
  ): Promise<void> {
    const blog = await blogRepository.findById(blogId);
    if (!blog) throw AppError.notFound("Blog not found");

    if (blog.type === "personal") return;

    if (!viewerUserId) {
      throw AppError.forbidden(
        "Invite code required to enter this team blog",
        "TEAM_BLOG_LOCKED",
      );
    }

    const member = await blogRepository.findMember(blogId, viewerUserId);
    if (!member) {
      throw AppError.forbidden(
        "Invite code required to enter this team blog",
        "TEAM_BLOG_LOCKED",
      );
    }
  }

  async assertCanWrite(blogId: string, userId: string): Promise<void> {
    const blog = await blogRepository.findById(blogId);
    if (!blog) throw AppError.notFound("Blog not found");

    const member = await blogRepository.findMember(blogId, userId);
    if (!member) {
      throw AppError.forbidden("Only blog members can write", "NOT_BLOG_MEMBER");
    }
  }

  async createInvite(
    blogId: string,
    userId: string,
  ): Promise<CreateInviteResult> {
    const blog = await blogRepository.findById(blogId);
    if (!blog) throw AppError.notFound("Blog not found");
    if (blog.type !== "team") {
      throw AppError.badRequest(
        "Invite codes are only for team blogs",
        undefined,
        "INVITE_NOT_ALLOWED",
      );
    }

    const member = await blogRepository.findMember(blogId, userId);
    if (!member || member.role !== "owner") {
      throw AppError.forbidden(
        "Only the blog owner can create invites",
        "NOT_BLOG_OWNER",
      );
    }

    await blogRepository.deleteExpiredInvites(blogId);

    const raw = generateVerificationToken();
    const tokenHash = hashVerificationToken(raw);
    const expiresAt = new Date(Date.now() + INVITE_TTL_MS);

    try {
      await blogRepository.createInvite({
        blogId,
        tokenHash,
        createdBy: userId,
        expiresAt,
      });
    } catch (error) {
      if (error instanceof DatabaseError && error.code === "23505") {
        throw AppError.conflict(
          "Failed to create invite code, please try again",
          "INVITE_CREATE_FAILED",
        );
      }
      throw error;
    }

    return { code: raw, blogId, expiresAt };
  }

  async join(
    blogId: string,
    userId: string,
    input: JoinBlogBody,
  ): Promise<PublicBlog> {
    const blog = await blogRepository.findById(blogId);
    if (!blog) throw AppError.notFound("Blog not found");
    if (blog.type !== "team") {
      throw AppError.badRequest(
        "Only team blogs require an invite code",
        undefined,
        "JOIN_NOT_ALLOWED",
      );
    }

    const existing = await blogRepository.findMember(blogId, userId);
    if (existing) {
      return this.toEnrichedBlog(blog, {
        isMember: true,
        role: existing.role,
      });
    }

    await blogRepository.deleteExpiredInvites(blogId);

    const tokenHash = hashVerificationToken(input.code);
    const invite = await blogRepository.findInviteByTokenHash(tokenHash);
    if (!invite || invite.blog_id !== blogId) {
      throw AppError.badRequest(
        "Invite code is invalid",
        undefined,
        "INVITE_INVALID",
      );
    }
    if (invite.used_at) {
      throw AppError.badRequest(
        "Invite code has already been used",
        undefined,
        "INVITE_ALREADY_USED",
      );
    }
    if (new Date(invite.expires_at).getTime() <= Date.now()) {
      await blogRepository.deleteInviteById(invite.id);
      throw AppError.badRequest(
        "Invite code has expired",
        undefined,
        "INVITE_EXPIRED",
      );
    }

    const used = await blogRepository.markInviteUsed({
      inviteId: invite.id,
      usedByUserId: userId,
    });
    if (!used) {
      throw AppError.badRequest(
        "Invite code has already been used",
        undefined,
        "INVITE_ALREADY_USED",
      );
    }

    await blogRepository.addMember({
      blogId,
      userId,
      role: "member",
    });

    return this.toEnrichedBlog(blog, { isMember: true, role: "member" });
  }
}

export const blogService = new BlogService();

export type { BlogType };
