<template>
  <div class="login">
    <div class="login-header">Password Reset</div>
    <p>Please provided us with a new password.</p>
    <div class="login-body">
      <form @submit.stop.prevent="submit">
        <form-message-box v-if="message">
          <p>{{ message }}</p>
        </form-message-box>
        <form-error-box v-if="error">
          <p>{{ error }}</p>
          <p>
            If you believe this may be an error, please
            <nuxt-link to="/password-recovery"> click here</nuxt-link>
            to request a new password recovery link.
          </p>
        </form-error-box>

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
            />

            <span v-if="passwordError" class="invalid-feedback" role="alert">
              <strong>{{ passwordError }}</strong>
            </span>
          </div>
        </div>

        <template>
          <div class="login-form-group">
            <label :for="passwordConfirmation"> Confirm Password </label>

            <div class="login-form-input-group">
              <input
                :id="passwordConfirmation"
                ref="password_confirmation"
                v-model="$v.passwordConfirmation.$model"
                type="password"
                autocomplete="new-password"
                placeholder="Confirm Password"
                :class="[passwordConfirmationError ? 'is-invalid' : '']"
              />

              <span v-if="passwordConfirmationError" class="invalid-feedback" role="alert">
                <strong>{{ passwordConfirmationError }}</strong>
              </span>
            </div>
          </div>
        </template>

        <div class="login-form-group">
          <div class="login-form-button-group">
            <button type="submit">Reset password</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Validate } from 'vuelidate-property-decorators';
import { minLength, required, sameAs } from 'vuelidate/lib/validators';
import { validationMixin } from 'vuelidate';
import FormMessageBox from '~/components/common/FormMessageBox.vue';
import FormErrorBox from '~/components/common/FormErrorBox.vue';

@Component({
  components: { FormErrorBox, FormMessageBox },
  mixins: [validationMixin]
})
export default class ResetPassword extends Vue {
  @Prop({ type: String, required: true })
  email!: string;

  @Prop({ type: String, required: true })
  timestamp!: string;

  @Validate({ required, minLength: minLength(8) })
  password: string = '';

  @Validate({ required, sameAs: sameAs('password') })
  passwordConfirmation: string = '';

  error: string = '';
  message: string = '';

  submit() {
    this.resetMessages();

    this.$v.$touch();
    if (this.$v.$invalid) return;

    this.$axios
      .$post(process.env.NUXT_ENV_API_ROUTE + '/password-reset', {
        timestamp: this.timestamp,
        email: this.email,
        password: this.password,
        password_confirmation: this.passwordConfirmation
      })
      .then(() => this.$router.push('/sign-in'))
      .catch((error) => this.reportError(error, 'Unknown error with password reset procedure'));
  }

  get passwordError(): String | undefined {
    if (!this.$v.password.$dirty) return;

    if (!this.$v.password.required) return 'Must provide a password.';
    if (!this.$v.password.minLength) return 'Password length must be 8 character or more.';
  }

  get passwordConfirmationError(): String | undefined {
    if (!this.$v.passwordConfirmation.$dirty) return;

    if (!this.$v.passwordConfirmation.required) return 'Must repeat provided password above.';
    if (!this.$v.passwordConfirmation.sameAs) return 'Password confirmation and password do not match.';
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
}
</script>
