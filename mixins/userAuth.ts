import { Vue, Component } from 'vue-property-decorator';

@Component
export default class UserAuth extends Vue {
  async login(email: String, password: String) {
    await this.requestCookie();
    await this.$auth.loginWith('local', {
      data: {
        email,
        password
      }
    });
  }

  async logout() {
    const services = [
      this.$queryService,
      this.$optionsService,
      this.$filtersService,
      this.$savelistsService,
      this.$surveyQuestionsService,
      this.$surveyResponsesService,
      this.$visualResponsesService,
      this.$savelistProductsService,
      this.$visualQuestionSetsService
    ];

    services.forEach((service) => service.cancelAll());

    await this.$auth.logout();
  }

  async requestCookie() {
    await this.$axios.$get('/sanctum/csrf-cookie', {
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      },
      withCredentials: true
    });
  }

  async recoverPassword(email: String) {
    await this.requestCookie();
    await this.$axios.$post(process.env.NUXT_ENV_API_ROUTE + '/recover-password', {
      email
    });
  }

  async resetPassword(token: String, email: String, password: String) {
    await this.$axios.$post(process.env.NUXT_ENV_API_ROUTE + '/reset-password', {
      token,
      email,
      password,
      password_confirmation: password
    });
  }

  async register(obj: Object) {
    await this.$axios.$post(process.env.NUXT_ENV_API_ROUTE + '/register', obj);
  }
}
