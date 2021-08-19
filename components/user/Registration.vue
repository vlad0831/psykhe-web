<template>
  <div class="login">
    <template>
      <div class="login-header">Discover Your Fashion Personality</div>
      <p>
        Receive the results of your unique personality profile in under 3 minutes. You’ll also subscribe to email
        updates and personalized fashion recommendations from your favorite brands and stores when PSYKHE launches.
      </p>
    </template>

    <div class="login-body">
      <form @submit.stop.prevent="submit">
        <form-message-box v-if="message">
          <p>{{ message }}</p>
        </form-message-box>

        <form-error-box v-if="error">
          <p>{{ error }}</p>
        </form-error-box>

        <template>
          <div class="login-form-group">
            <label :for="nameFirst">First Name</label>

            <div class="login-form-input-group">
              <input
                :id="nameFirst"
                ref="nameFirst"
                v-model="$v.nameFirst.$model"
                type="text"
                autocomplete="given-name"
                placeholder="Your First Name"
                :class="[nameFirstError ? 'is-invalid' : '']"
                @input="$v.nameFirst.$touch()"
              />

              <span v-show="nameFirstError" class="invalid-feedback" role="alert">
                <strong>{{ nameFirstError }}</strong>
              </span>
            </div>
          </div>
        </template>

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

            <span v-show="emailError" class="invalid-feedback" role="alert">
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

            <span v-show="passwordError" class="invalid-feedback" role="alert">
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
                @input="delayTouch($v.passwordConfirmation)"
              />

              <span v-show="passwordConfirmationError" class="invalid-feedback" role="alert">
                <strong>{{ passwordConfirmationError }}</strong>
              </span>
            </div>
          </div>
        </template>

        <div class="login-form-group">
          <div class="login-form-button-group">
            <button type="submit">Start the Test</button>
          </div>
        </div>
        <div class="login-form-group">
          <div class="privacy-link">
            To find out more, please visit our <nuxt-link to="privacy-policy">Privacy Policy</nuxt-link>.
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from 'nuxt-property-decorator';
import { Validate } from 'vuelidate-property-decorators';
import { required, email, minLength, sameAs } from 'vuelidate/lib/validators';
import { validationMixin } from 'vuelidate';
import UserAuth from '~/mixins/userAuth';
import FormMessageBox from '~/components/common/FormMessageBox.vue';
import FormErrorBox from '~/components/common/FormErrorBox.vue';
import { AnalyticsService } from '~/services/analytics/manager';
import { AnalyticsEvent, HomeAction } from '~/types/analytics/events';

const touchMap = new WeakMap();

@Component({
  components: { FormErrorBox, FormMessageBox },
  mixins: [validationMixin]
})
export default class Registration extends UserAuth {
  @Validate({ required })
  nameFirst: string = '';

  @Validate({ required, email })
  email: string = '';

  @Validate({ required, minLength: minLength(8) })
  password: string = '';

  @Validate({ required, sameAs: sameAs('password') })
  passwordConfirmation: string = '';

  error: string = '';
  message: string = '';

  async submit() {
    this.resetMessages();

    this.$v.$touch();
    if (this.$v.$invalid) return;

    try {
      await this.register({
        name_first: this.nameFirst,
        email: this.email,
        password: this.password,
        password_confirmation: this.passwordConfirmation
      });

      AnalyticsService.publish({
        type: AnalyticsEvent.HOME_EVENT,
        data: {
          action: HomeAction.REGISTRATION_STARTED,
          context: {
            page: 'Home'
          }
        }
      });

      await this.login(this.email, this.password);
    } catch (error) {
      this.reportError(error, 'Unknown error with registration form');
    }
  }

  get nameFirstError(): String | undefined {
    if (!this.$v.nameFirst.$dirty) return;
    if (!this.$v.nameFirst.required) return 'Must provide your first name';
  }

  get emailError(): String | undefined {
    if (!this.$v.email.$dirty) return;
    if (!this.$v.email.email) return 'Must provide a valid e-mail address';
    if (!this.$v.email.required) return 'Must provide en e-mail address';
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
}
</script>
