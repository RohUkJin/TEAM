import type { Blog, Post } from "@/lib/api";

/** 개인: /{urlSlug}/{blogSlug} , 팀: /{teamSlug} */
export function blogHref(
  blog: Pick<Blog, "type" | "slug" | "ownerUrlSlug" | "ownerNickname" | "id">,
): string {
  const owner = blog.ownerUrlSlug || blog.ownerNickname;
  if (blog.type === "personal" && owner) {
    return `/${owner}/${blog.slug}`;
  }
  if (blog.type === "team" && blog.slug) {
    return `/${blog.slug}`;
  }
  return `/blogs/${blog.id}`;
}

/** 개인: /{urlSlug}/{blogSlug}/{postId} , 팀: /{teamSlug}/{postId} */
export function postHref(
  post: Pick<
    Post,
    | "id"
    | "blogId"
    | "blogSlug"
    | "blogType"
    | "ownerUrlSlug"
    | "ownerNickname"
  >,
): string {
  const owner = post.ownerUrlSlug || post.ownerNickname;
  if (post.blogType === "personal" && owner && post.blogSlug) {
    return `/${owner}/${post.blogSlug}/${post.id}`;
  }
  if (post.blogType === "team" && post.blogSlug) {
    return `/${post.blogSlug}/${post.id}`;
  }
  return `/posts/${post.id}`;
}

export function blogWriteHref(blog: Pick<Blog, "id">): string {
  return `/blogs/${blog.id}/write`;
}
