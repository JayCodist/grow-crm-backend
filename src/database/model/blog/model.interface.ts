export const blogProjection = [
  "id",
  "title",
  "featuredImage",
  "createdAt",
  "lastUpdatedAt",
  "readMinutes",
  "slug",
  "active",
  "excerpt",
  "author"
];

export interface Blog {
  id: string;
  title: string;
  featuredImage: string;
  body: string;
  category: string[];
  createdAt: string;
  lastUpdatedAt: string | null;
  readMinutes: number;
  slug: string;
  active: boolean;
  excerpt: string;
  author: string;
}

export interface BlogCreate extends Omit<Blog, "id"> {
  _blogSearch: string[];
}
