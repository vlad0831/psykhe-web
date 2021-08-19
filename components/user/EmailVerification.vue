<template>
  <div class="login">
    <div class="login-header">Account Email Verification</div>
    <div class="login-body">
      <form-message-box v-if="message">
        <p>{{ message }}</p>
      </form-message-box>

      <form-error-box v-if="error">
        <p>{{ error }}</p>
        <p>
          If you believe this may be an error, please
          <a href="#" @click="requestLink">click here</a> to request a new email verification link
        </p>
        <p><nuxt-link to="/sign-in">Click here</nuxt-link> to sign-in</p>
      </form-error-box>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import FormMessageBox from '~/components/common/FormMessageBox.vue';
import FormErrorBox from '~/components/common/FormErrorBox.vue';
@Component({
  components: { FormErrorBox, FormMessageBox }
})
export default class EmailVerification extends Vue {
  @Prop({ type: String, required: true })
  email!: string;

  @Prop({ type: String, required: true })
  id!: string;

  @Prop({ type: String, required: true })
  timestamp!: string;

  message: string = 'Please wait while we activate your user account...';
  error: string = '';

  mounted() {
    this.validateAccount();
  }

  validateAccount() {
    this.$axios
      .post(process.env.NUXT_ENV_API_ROUTE + '/email/verify/', {
        timestamp: this.timestamp,
        id: this.id,
        email: this.email
      })
      .then(() => this.$router.push({ name: 'sign-in', params: { emailValidated: '1' } }))
      .catch((error) => {
        this.message = '';
        this.error = error.response.data.message;
      });
  }

  requestLink() {
    this.$axios
      .post(process.env.NUXT_ENV_API_ROUTE + '/email/resend/', {
        email_token: this.email
      })
      .then(() => this.$router.push('/profile'))
      .catch((error) => {
        this.error = error.response.data.message;
      });
  }
}
</script>
