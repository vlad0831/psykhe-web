import { QueryParameters } from '~/types/query/query';

export class QueryLinkService {
  static getInstance() {
    return new QueryLinkService();
  }

  createLinkFromQuery(query: QueryParameters, page: number | null) {
    const link = { name: 'browse', query: {} } as any;

    if (query.brands?.length && query.brands[0]) {
      if (query.categories?.length) {
        link.query.brands = [...query.brands].sort().join(',');
      } else {
        link.name = 'browse-brands-slugs';
        link.params = {
          brandslugs: [...query.brands].sort().join(',')
        };
      }
    }

    if (query.categories?.length) {
      link.name = 'browse-category-subcategory-slug';
      const parts = query.categories[0].split('/');

      link.params = {
        category: parts[0],
        subcategory: parts[1],
        subsubcategory: parts[2]
      };
    }

    if (query.colors?.length) {
      link.query.colors = [...query.colors].sort().join(',');
    }

    if (query.modes && query.modes.length) {
      link.query.modes = [...query.modes].sort().join(',');
    }

    if (query.mood && query.mood !== 'baseline') {
      link.query.mood = query.mood;
    }

    if (query.occasions && query.occasions.length) {
      link.query.occasions = [...query.occasions].sort().join(',');
    }

    if (query.options && query.options.length) {
      link.query.options = [...query.options].sort().join(',');
    }

    if (query.partners && query.partners.length) {
      link.query.partners = [...query.partners].sort().join(',');
    }

    if (query.price) {
      if (query.price.length >= 0 && (query.price[0] || query.price[1])) {
        link.query.price = [query.price[0], query.price[1]].join(',');
      }
    }

    if (query.recommendation) {
      link.query.recommendation = query.recommendation;
    }

    if (typeof page !== null && (page as number) > 1) {
      link.query.page = page;
    }

    return link;
  }
}
