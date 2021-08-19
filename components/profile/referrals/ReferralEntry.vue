<template>
  <form ref="form" :class="[disableComponent ? 'used' : '']">
    <form-message-box v-if="message">
      <p>{{ message }}</p>
    </form-message-box>

    <form-error-box v-if="error">
      <p>{{ error }}</p>
    </form-error-box>
    <fieldset>
      <input
        ref="name"
        v-model="$v.name.$model"
        placeholder="Their name"
        :class="[nameError ? 'is-invalid' : '']"
        :disabled="disableComponent"
        @input="$v.name.$touch()"
      />
      <span v-if="nameError" class="invalid-feedback" role="alert">
        <strong>{{ nameError }}</strong>
      </span>
      <input
        ref="email"
        v-model="$v.email.$model"
        placeholder="Their email"
        type="email"
        :class="[emailError ? 'is-invalid' : '']"
        :disabled="disableComponent"
        @input="$v.email.$touch()"
      />
      <span v-if="emailError" class="invalid-feedback" role="alert">
        <strong>{{ emailError }}</strong>
      </span>
    </fieldset>
    <button type="button" @click="submit">Invite</button>
  </form>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { Validate } from 'vuelidate-property-decorators';
import { required, email } from 'vuelidate/lib/validators';
import { validationMixin } from 'vuelidate';
import { Referral } from '~/types/user/referral';
import FormMessageBox from '~/components/common/FormMessageBox.vue';
import FormErrorBox from '~/components/common/FormErrorBox.vue';
import { UserMixin } from '~/mixins/userMixin';
import { AnalyticsService } from '~/services/analytics/manager';
import { AnalyticsEvent, ProfileAction } from '~/types/analytics/events';

@Component({
  components: { FormErrorBox, FormMessageBox },
  mixins: [validationMixin]
})
export default class ReferralEntry extends UserMixin {
  @Prop({ required: false, default: {} })
  readonly referral!: Referral;

  @Prop({ required: false, default: false })
  readonly disabledField!: boolean;

  @Validate({ required })
  name: string = '';

  @Validate({ required, email })
  email: string = '';

  disableComponent: boolean = false;

  error: string = '';
  message: string = '';

  created() {
    this.name = this.referral.name;
    this.email = this.referral.email;
    this.disableComponent = this.disabledField;
  }

  async submit() {
    this.resetMessages();

    this.$v.$touch();
    if (this.$v.$invalid) return;

    try {
      await this.$axios.$post(process.env.NUXT_ENV_API_ROUTE + '/user/referral', {
        to_email: this.email,
        to_name: this.name
      });

      await this.$auth.fetchUser();

      AnalyticsService.publish({
        type: AnalyticsEvent.PROFILE_EVENT,
        data: {
          user: this.userIdentifier,
          action: ProfileAction.REFERRED,

          context: {
            page: 'profile/insights'
          }
        }
      });

      this.disableComponent = true;
    } catch (error) {
      this.reportError(error, 'Unknown error with registration form');
    }
  }

  get nameError(): String | undefined {
    if (!this.$v.name.$dirty) return;
    if (!this.$v.name.required) return 'The to name field is required';
  }

  get emailError(): String | undefined {
    if (!this.$v.email.$dirty) return;
    if (!this.$v.email.required) return 'The to email field is required';
    if (!this.$v.email.email) return 'The email format in invalid ';
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
