export default {
  // Disable server-side rendering (https://go.nuxtjs.dev/ssr-mode)
  build: {
    loaders: {
      scss: {
        additionalData: `$PSYKHE_CSS_CDN_URL_PREFIX: '${process.env.PSYKHE_CSS_CDN_URL_PREFIX}';`
      }
    }
  },
  ssr: false,
  loadingIndicator: '~/components/common/Loading.html',
  // Target (https://go.nuxtjs.dev/config-target)
  target: 'static',

  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: "PSYKHE Fashion | Personalized Women's Luxury Fashion",
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content:
          'PSYKHE is a psychology-based shopping platform that recommends fashion from your favorite platforms, stores and brands, personalized by your personality and mood.'
      }
    ],
    script: [{ src: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js' }],
    link: [
      { rel: 'apple-touch-icon', href: '/media/icon/favicon/favicon-120x120.png' },
      { rel: 'apple-touch-icon', sizes: '167x167', href: '/media/icon/favicon/favicon-167x167.png' },
      { rel: 'apple-touch-icon', sizes: '152x152', href: '/media/icon/favicon/favicon-152x152.png' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/media/icon/favicon/favicon-180x180.png' },

      { rel: 'icon', type: 'image/png', href: '/media/icon/favicon/favicon-16x16.png', sizes: '16x16' },
      { rel: 'icon', type: 'image/png', href: '/media/icon/favicon/favicon-32x32.png', sizes: '16x16' },
      { rel: 'icon', type: 'image/png', href: '/media/icon/favicon/favicon-64x64.png', sizes: '64x64' },
      { rel: 'icon', type: 'image/png', href: '/media/icon/favicon/favicon-96x96.png', sizes: '96x96' },
      { rel: 'icon', type: 'image/png', href: '/media/icon/favicon/favicon-128x128.png', sizes: '128x128' },
      { rel: 'icon', type: 'image/png', href: '/media/icon/favicon/favicon-196x196.png', sizes: '196x196' },
      { rel: 'icon', type: 'image/png', href: '/media/icon/favicon/favicon-512x512.png', sizes: '512x512' }
    ]
  },

  pageTransition: 'page',

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: ['@/assets/sass/app.scss'],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
    '@/plugins/eventBus.ts',
    '@/plugins/analytics.ts',
    '@/plugins/axios-accessor.ts',
    '@/plugins/service-injector.ts',
    '@/plugins/vue-observe-visibility.ts',
    '@/plugins/vue-filter-number-format.js',
    { src: '~/plugins/vue-touch', ssr: false },
    { src: '~/plugins/vuex-persisted-state.client.ts' },
    { src: '~/plugins/vue-functional-calendar.js', ssr: false }
  ],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build'
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    // https://auth.nuxtjs.org/
    '@nuxtjs/auth',
    // https://github.com/nuxt-community/robots-module
    '@nuxtjs/robots',
    // Google Tag Manager
    '@nuxtjs/gtm',
    // Facebook pixel module
    'nuxt-facebook-pixel-module'
  ],

  pwa: {
    manifest: {
      name: 'PSYKHE',
      short_name: 'PSYKHE',
      description: 'PSYKHE'
    },
    icons: {
      fileName: 'icon.png'
    }
  },

  // Google Tag Manager ID
  gtm: {
    debug: ['true', '1'].includes(process.env.ANALYTICS_DEBUG_ENABLED),
    enabled: !!process.env.GOOGLE_TAG_MANAGER_ID,

    id: process.env.GOOGLE_TAG_MANAGER_ID,
    layer: 'dataLayer',
    variables: {},

    pageTracking: false,
    pageViewEventName: 'nuxtRoute',

    autoInit: false,
    respectDoNotTrack: true,

    scriptId: 'gtm-script',
    scriptDefer: false,
    scriptURL: 'https://www.googletagmanager.com/gtm.js',
    crossOrigin: false,

    noscript: true,
    noscriptId: 'gtm-noscript',
    noscriptURL: 'https://www.googletagmanager.com/ns.html'
  },

  // Google Tag Manager Runtime Config for dynamic environment variables in production.
  publicRuntimeConfig: {
    BASE_URL: process.env.BASE_URL,
    NUXT_ENV_API_ROUTE: process.env.NUXT_ENV_API_ROUTE,

    gtm: {
      id: process.env.GOOGLE_TAG_MANAGER_ID
    }
  },

  // Facebook pixel option
  facebook: {
    disabled: true,
    track: 'PageView',
    autoPageView: false,
    pixelId: process.env.FACEBOOK_PIXEL_ID ? process.env.FACEBOOK_PIXEL_ID : 'disabled',
    debug: ['true', '1'].includes(process.env.ANALYTICS_DEBUG_ENABLED)
  },

  // Remove automatically included Bootstrap CSS files
  // https://medium.com/javascript-in-plain-english/customize-bootstrap-in-nuxt-3da863703b35
  bootstrapVue: {
    bootstrapCSS: false,
    bootstrapVueCSS: false
  },

  // Axios module configuration (https://go.nuxtjs.dev/config-axios)
  axios: {
    baseURL: process.env.BASE_URL,
    credentials: true,
    maxBodyLength: 100 * 1024 * 1024,
    maxContentLength: 100 * 1024 * 1024,
    timeout: 10000
  },

  // Auth module config
  auth: {
    redirect: {
      login: '/sign-in',
      logout: '/',
      callback: '/',
      home: '/profile'
    },
    strategies: {
      local: {
        endpoints: {
          login: {
            url: process.env.NUXT_ENV_API_ROUTE + '/login',
            method: 'post',
            propertyName: 'token'
          },
          logout: {
            url: process.env.NUXT_ENV_API_ROUTE + '/logout',
            method: 'post',
            propertyName: 'logout'
          },
          user: {
            url: process.env.NUXT_ENV_API_ROUTE + '/user',
            method: 'get',
            propertyName: false
          }
        }
      }
    },
    tokenType: '',
    localStorage: false,
    tokenRequired: false
  },

  // Rules for Sass preprocessors
  // https://medium.com/javascript-in-plain-english/customize-bootstrap-in-nuxt-3da863703b35
  rules: [
    {
      test: /\.s[ac]ss$/i,
      use: ['style-loader', 'css-loader', 'sass-loader']
    }
  ],

  env: {
    BASE_URL: process.env.BASE_URL,
    MEDIA_CDN_URL: process.env.MEDIA_CDN_URL,
    AVATAR_CDN_URL: process.env.AVATAR_CDN_URL,
    FACEBOOK_PIXEL_ID: process.env.FACEBOOK_PIXEL_ID,
    GOOGLE_TAG_MANAGER_ID: process.env.GOOGLE_TAG_MANAGER_ID,
    ANALYTICS_DEBUG_ENABLED: process.env.ANALYTICS_DEBUG_ENABLED,
    PAGINATION_DEBUG_ENABLED: process.env.PAGINATION_DEBUG_ENABLED,
    PSYKHE_SRC_ID: process.env.PSYKHE_SRC_ID
  },

  router: {
    extendRoutes(routes, resolve) {
      routes.push({
        name: 'lists-slug',
        path: '/lists/:slug?',
        component: resolve(__dirname, 'pages/lists/index.vue')
      });
      routes.push({
        name: 'browse-brands-slugs',
        path: '/browse/brands/:brandslugs?',
        component: resolve(__dirname, 'pages/browse/index.vue')
      });
      routes.push({
        name: 'browse-category-subcategory-slug',
        path: '/browse/:category/:subcategory?/:subsubcategory?',
        component: resolve(__dirname, 'pages/browse/index.vue')
      });
      routes.push({
        name: 'browse-merchant-brand-slug-id',
        path: '/browse/:merchant/:brand?/:slug?/:id?',
        component: resolve(__dirname, 'pages/browse/product.vue')
      });
    }
  },

  // Disable the loading bar at the top of the page
  loading: false,

  robots: [
    {
      UserAgent: '*',
      Disallow: '/'
    }
  ],

  serverMiddleware: [
    {
      handler: (_, res, next) => {
        res.setHeader('X-Robots-Tag', 'noindex, nofollow');
        next();
      }
    }
  ]
};
