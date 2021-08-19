const prefixes: any = {};
export default function (prefix: string) {
  if (prefixes[prefix]) {
    return prefixes[prefix];
  }

  let id = 0;
  prefixes[prefix] = {
    data: () => {
      return {
        prefix: prefix + '-' + id++ + '-'
      };
    },
    methods: {
      prefixed(id: number): any {
        return prefix + id;
      }
    }
  };

  return prefixes[prefix];
}
