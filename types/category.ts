export interface CategoryMap {
  [key: string]: ICategory;
}

export interface ICategory {
  label: string;
  in_parent?: boolean;
  children: CategoryMap;
  description_no_login: string;
  description_with_login: string;
  heading_no_login: string;
  heading_with_login: string;
}
