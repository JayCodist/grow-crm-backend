export const blogProjection = [
  "id",
  "title",
  "featuredImage",
  "createdAt",
  "lastUpdatedAt",
  "readMinutes",
  "slug"
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
}

export interface BlogCreate extends Omit<Blog, "id"> {
  _bodySearch: string[];
  _titleSearch: string[];
}
