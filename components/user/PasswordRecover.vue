<template>
  <div class="login">
    <div class="login-header">Password Recovery</div>
    <p>Please provide your account email address to proceed with the account password recovery process.</p>
    <div class="login-body">
      <form @submit.stop.prevent="submit">
        <form-message-box v-if="message">
          <p>{{ message }}</p>
        </form-message-box>

        <form-error-box v-if="error">
          <p>{{ error }}</p>
        </form-error-box>

        <div class="login-form-group">
          <label :for="email">Email</label>

          <div class="login-form-input-group">
            <input
              :id="email"
              ref="email"
              v-model="$v.email.$model"
              type="email"
              autocomplete="email"
              placeholder="Your Email"
              :class="[emailError ? 'is-invalid' : '']"
              @input="delayTouch($v.email)"
            />

            <span v-if="emailError" class="invalid-feedback" role="alert">
              <strong>{{ emailError }}</strong>
            </span>
          </div>
        </div>
        <div class="login-form-group">
          <div class="login-form-button-group">
            <button type="submit">Recover</button>
          </div>
        </div>
      </form>
    </div>
    <div style="padding-top: 30px">
      <p>
        Don't have an account?
        <nuxt-link to="/register">Take the PSYKHE test</nuxt-link>
      </p>
      <p>
        <nuxt-link to="/sign-in">Click here</nuxt-link>
        to sign-in
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { required, email } from 'vuelidate/lib/validators';
import { validationMixin } from 'vuelidate';
import { Validate } from 'vuelidate-property-decorators';
import FormMessageBox from '~/components/common/FormMessageBox.vue';
import FormErrorBox from '~/components/common/FormErrorBox.vue';

const touchMap = new WeakMap();

@Component({
  components: { FormErrorBox, FormMessageBox },
  mixins: [validationMixin]
})
export default class PasswordRecover extends Vue {
  @Prop({ type: String, required: true })
  recoveryEmail!: string;

  @Validate({ required, email })
  email: string = '';

  error: string = '';
  message: string = '';

  created() {
    this.email = this.recoveryEmail;
  }

  submit() {
    this.resetMessages();

    this.$v.$touch();
    if (this.$v.$invalid) return;

    this.$axios
      .$post(process.env.NUXT_ENV_API_ROUTE + '/recover-password', {
        email: this.email
      })
      .then(() => (this.message = 'An email has been sent with instructions on how to restore your password'))
      .catch((error) => this.reportError(error, 'Unknown error with password recovery form'));
  }

  get emailError(): String | undefined {
    if (!this.$v.email.$dirty) return;
    if (!this.$v.email.email) return 'Must provide a valid e-mail address';
    if (!this.$v.email.required) return 'Must provide en e-mail address';
  }

  delayTouch(v: any) {
    v.$reset();
    if (touchMap.has(v)) {
      clearTimeout(touchMap.get(v));
    }
    touchMap.set(v, setTimeout(v.$touch, 1000));
  }

  resetMessages() {
    this.error = '';
    this.message = '';
  }

  reportError(error: any, defaultMessage: string) {
    if (error.response.data.message) {
      this.error = error.response.data.message;
    } else {
      this.error = defaultMessage;
    }
  }

  async forgot() {
    this.resetMessages();

    try {
      const response: any = await this.$axios.$post('/password/email', {
        email: this.email
      });

      if (response.message) {
        this.message = response.message;
      }
    } catch (error) {
      this.reportError(error, 'Unknown error with forgot password form');
    }
  }
}
</script>
