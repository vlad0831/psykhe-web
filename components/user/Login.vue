<template>
  <div class="login">
    <div class="login-header">Sign in</div>

    <div class="login-body">
      <form @submit.stop.prevent="submit">
        <form-message-box v-if="emailValidated">
          <p>Your email has been validated successfully. Please sign in to access your account.</p>
        </form-message-box>

        <form-message-box v-if="message">
          <p>{{ message }}</p>
        </form-message-box>

        <form-error-box v-if="error">
          <p>{{ error }}</p>
        </form-error-box>

        <form-error-box v-if="emailValidationPending">
          <p><a href="#" @click="requestLink">Click here</a> to request a new verification email.</p>
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

        <div class="login-form-group last">
          <label :for="password">Password</label>

          <div class="login-form-input-group">
            <input
              :id="password"
              ref="password"
              v-model="$v.password.$model"
              type="password"
              autocomplete="new-password"
              placeholder="Password"
              :class="[passwordError ? 'is-invalid' : '']"
              @input="delayTouch($v.password)"
            />

            <span v-if="passwordError" class="invalid-feedback" role="alert">
              <strong>{{ passwordError }}</strong>
            </span>
          </div>
        </div>

        <template>
          <nuxt-link
            v-if="email"
            :to="{ name: 'password-recovery-email', params: { email: email } }"
            class="login-forgot-link"
          >
            Forgot Your Password?
          </nuxt-link>
          <nuxt-link v-else to="/password-recovery" class="login-forgot-link"> Forgot your password? </nuxt-link>
        </template>

        <div class="login-form-group">
          <div class="login-form-button-group">
            <button type="submit">Sign in</button>
          </div>
        </div>
      </form>
    </div>

    <div style="padding-top: 30px">
      Don't have an account?
      <nuxt-link to="/register">Take the PSYKHE test</nuxt-link>
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from 'nuxt-property-decorator';
import { Validate } from 'vuelidate-property-decorators';
import { required, email, minLength } from 'vuelidate/lib/validators';
import { validationMixin } from 'vuelidate';
import UserAuth from '~/mixins/userAuth';
import FormMessageBox from '~/components/common/FormMessageBox.vue';
import FormErrorBox from '~/components/common/FormErrorBox.vue';

enum ErrorType {
  None = '',
  VerificationPending = 'verification_pending'
}

const touchMap = new WeakMap();

@Component({
  components: { FormErrorBox, FormMessageBox },
  mixins: [validationMixin]
})
export default class Login extends UserAuth {
  @Validate({ required, email })
  email: string = '';

  @Validate({ required, minLength: minLength(8) })
  password: string = '';

  error: string = '';
  message: string = '';
  errorType: ErrorType = ErrorType.None;
  showPasswordError: boolean = false;

  mounted() {
    this.$nextTick(function () {
      this.$emit('psykhe-rendered', this);
    });
  }

  updated() {
    this.$nextTick(function () {
      this.$emit('psykhe-rendered', this);
    });
  }

  async submit() {
    this.resetMessages();
    this.showPasswordError = false;

    if (this.email === '') {
      this.$v.$touch();
      if (this.$v.$invalid) return;
    }
    await this.login(this.email, this.password)
      .then(() => this.$router.push('/browse'))
      .catch((error: any) => {
        this.resetMessages();
        this.reportError(error, 'Unknown error with log-in form');
        this.showPasswordError = true;
      });
  }

  get emailValidated(): boolean {
    return 'emailValidated' in this.$route.params.hasOwnProperty;
  }

  get emailValidationPending(): boolean {
    return this.errorType === ErrorType.VerificationPending;
  }

  get emailError(): String | undefined {
    if (!this.$v.email.$dirty) return;
    if (!this.$v.email.email) return 'Must provide a valid e-mail address';
    if (!this.$v.email.required) return 'Must provide an e-mail address';
  }

  get passwordError(): String | undefined {
    if (!this.$v.password.$dirty || !this.showPasswordError) return;

    if (!this.$v.password.required) return 'Must provide a password';
    if (!this.$v.password.minLength) return 'Password length must be at least 8 character or more';
  }

  delayTouch(v: any) {
    v.$reset();
    if (touchMap.has(v)) {
      clearTimeout(touchMap.get(v));
    }
    touchMap.set(v, setTimeout(v.$touch, 1000));
  }

  requestLink() {
    this.$axios
      .post(process.env.NUXT_ENV_API_ROUTE + '/email/resend', {
        email_address: this.email
      })
      .then(() => {
        this.resetMessages();
        this.message = 'A new verification email has been sent to your inbox';
      })
      .catch((error) => {
        this.error = error.response.data.message;
      });
  }

  resetMessages() {
    this.error = '';
    this.message = '';
    this.errorType = ErrorType.None;

    this.$router.replace({ query: {} });
  }

  reportError(error: any, defaultMessage: string) {
    if (error.response.data.type) {
      this.errorType = error.response.data.type as ErrorType;
    }

    if (error.response.data.message) {
      this.error = error.response.data.message;
    } else {
      this.error = defaultMessage;
    }
  }
}
</script>
