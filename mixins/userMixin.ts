import { Component, Vue } from 'nuxt-property-decorator';

@Component
export class UserMixin extends Vue {
  // $auth: Auth

  get isLoggedIn(): Boolean {
    return this.$auth.loggedIn;
  }

  get currentUser() {
    return this.$auth.user;
  }

  get onBoardingCompleted() {
    return this.$auth.user.pt_transmitted;
  }

  get hasAvatar() {
    return this.$auth.user.profile.has_avatar;
  }

  get avatarUploaded() {
    return this.$auth.user.profile.avatar_uploded || 0;
  }

  get userIdentifier() {
    return this.$auth.user?.identifier;
  }

  get userNameFirst() {
    return this.$auth.user.name.name_first;
  }

  get userNameLast() {
    return this.$auth.user.name.name_last;
  }

  get userNameFull() {
    return this.$auth.user.name.name_full;
  }

  get userBirthday() {
    return this.$auth.user.profile.dob;
  }

  get didNag() {
    if (this.$auth.loggedIn) {
      return this.$auth.user.nags.profile;
    }
  }

  get oceanPercentage() {
    if (this.$auth.loggedIn) {
      return this.$auth.user.traits.ocean.percentage;
    } else {
      return 100;
    }
  }

  get oceanRounded() {
    return this.$auth.user.traits.ocean.rounded;
  }

  get oceanHuman() {
    return this.$auth.user.traits.ocean.human;
  }

  get userSaveLists() {
    return this.$auth.user.saveLists;
  }

  get userReferrals() {
    return this.$auth.user.referrals;
  }

  get userPopulationDistancePercentage() {
    return this.$auth.user.population_distance_percentage;
  }
}
