<template>
  <div class="psykhe-account-profile">
    <div v-if="!didNag" class="psykhe-account-profile-banner-nag">
      <h2>We're calculating your results.</h2>
      <span>In the meantime, please complete your profile below</span>
    </div>
    <div class="psykhe-account-profile-inputs">
      <div class="col-md-2"></div>
      <div class="col-md-8">
        <form @submit.stop.prevent="submit">
          <div class="row">
            <div class="col-md-4">
              <avatar-upload v-model="image" />
            </div>

            <div class="psykhe-account-profile-details">
              <form-message-box v-if="message">
                <p>{{ message }}</p>
              </form-message-box>

              <form-error-box v-if="error">
                <p>{{ error }}</p>
              </form-error-box>

              <input
                v-model="$v.firstName.$model"
                type="text"
                autocomplete="given-name"
                placeholder="Your First Name"
                :class="[firstNameError ? 'is-invalid' : '']"
                @input="delayTouch($v.firstName)"
              />

              <span v-if="firstNameError" class="invalid-feedback" role="alert">
                <strong>{{ firstNameError }}</strong>
              </span>

              <input v-model="lastName" type="text" autocomplete="family-name" placeholder="Your Last Name" />
              <date-picker v-model="dob" :placeholder-text="'Your date of birth'"></date-picker>
            </div>
          </div>
        </form>
      </div>
      <div class="col-md-2"></div>
    </div>

    <div class="psykhe-account-profile-actions">
      <div class="psykhe-account-profile-actions-secondary-container">
        <a v-if="!didNag" @click="skipProfile">Skip</a>
        <a v-if="didNag" @click="!isProfileSaving ? logout() : null">Sign Out</a>
      </div>

      <div class="psykhe-account-profile-actions-primary-container">
        <a @click="submit">
          <img v-if="isProfileSaving" src="/media/spinner.svg" alt="" srcset="" />
          {{ isProfileSaving ? 'Saving profile...' : 'Save Profile' }}</a
        >
      </div>
    </div>

    <mutable-questions v-if="didNag" />
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { Validate } from 'vuelidate-property-decorators';
import { required } from 'vuelidate/lib/validators';
import { validationMixin } from 'vuelidate';
import { mixins } from 'nuxt-property-decorator';
import { UserMixin } from '~/mixins/userMixin.ts';

import UserAuth from '~/mixins/userAuth';

import DatePicker from '~/components/common/DatePicker.vue';
import FormErrorBox from '~/components/common/FormErrorBox.vue';
import FormMessageBox from '~/components/common/FormMessageBox.vue';

import AvatarUpload from '~/components/user/AvatarUpload.vue';
import MutableQuestions from '~/components/user/MutableQuestions.vue';
import AssetManager from '~/mixins/assetManager';

const touchMap = new WeakMap();

@Component({
  components: { AvatarUpload, DatePicker, FormMessageBox, FormErrorBox, MutableQuestions },
  mixins: [UserMixin, validationMixin]
})
export default class AccountProfile extends mixins(UserAuth, UserMixin, AssetManager) {
  @Validate({ required })
  firstName: string = '';

  lastName: string = '';
  dob: any = null;
  image: string = '';

  isProfileSaving: boolean = false;

  error: string = '';
  message: string = '';

  created() {
    this.firstName = this.userNameFirst;
    this.lastName = this.userNameLast;
    this.dob = this.userBirthday;
    this.image = this.hasAvatar ? this.getUrl('user', this.userIdentifier, this.avatarUploaded) : '';

    if (!this.userBirthday || this.userBirthday === '') {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 30);

      this.dob = date.toDateString();
    }
  }

  submit() {
    if (this.isProfileSaving) {
      return;
    }
    this.resetMessages();

    this.$v.$touch();
    if (this.$v.$invalid) return;

    const formData = new FormData();
    formData.append('name_first', this.firstName);
    formData.append('name_last', this.lastName);
    if (this.dob) {
      try {
        formData.append('dob', new Date(this.dob + ' UTC').toISOString().split('T')[0]);
      } catch (discard) {
        formData.append('dob', this.dob);
      }
    } else {
      formData.append('dob', this.dob);
    }

    if (this.image) {
      formData.append('image', this.image);
    }

    this.isProfileSaving = true;
    this.$axios
      .$post(process.env.NUXT_ENV_API_ROUTE + '/user/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(async () => {
        await this.$auth.fetchUser();
        this.$router.push('/profile');
      })
      .catch((error) => {
        this.reportError(error, '');
      });
  }

  skipProfile() {
    this.$axios
      .$post(process.env.NUXT_ENV_API_ROUTE + '/user/profile/skip')
      .then(async () => {
        await this.$auth.fetchUser();
        this.$router.push('/profile');
        this.isProfileSaving = false;
      })
      .catch((error) => {
        this.reportError(error, '');
      });
  }

  get firstNameError(): String | undefined {
    if (!this.$v.firstName.$dirty) return;
    if (!this.$v.firstName.required) return 'First name can not be empty';
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
