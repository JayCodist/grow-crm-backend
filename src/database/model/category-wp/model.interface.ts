export default interface CategoryWP {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  shortDescription: string;
  altImage: string;
  title: string;
  key: string;
  topHeading: string;
  bottomHeading: string;
}

export interface CategoryWPCreate extends Omit<CategoryWP, "id"> {
  _nameSearch: string[];
}

export const categoryWPProjection = [
  "key",
  "createdAt",
  "name",
  "slug",
  "description",
  "image",
  "shortDescription",
  "altImage",
  "title",
  "topHeading",
  "bottomHeading"
];
