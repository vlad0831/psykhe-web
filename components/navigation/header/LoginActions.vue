<template>
  <ul v-if="onBoardingCompleted" class="navbar-nav ml-md-auto">
    <search-box />

    <li v-if="hasAvatar" class="nav-item nav-item-avatar">
      <nuxt-link class="nav-link" to="/profile">
        <deferred-figure
          class="nav-item-avatar-img is-desktop"
          :pool="'user'"
          :asset-key="userIdentifier"
          :constraints="{ width: 100, height: 100 }"
          :cache-refresh="avatarUploaded"
        />
      </nuxt-link>
    </li>

    <li class="nav-item dropdown nav-logged-in-item nav-link-logout-li">
      <nuxt-link class="nav-link nav-link-logout" to="/profile"> {{ userNameFirst }}'s stuff </nuxt-link>

      <ul class="dropdown-menu dropdown-menu-light">
        <li class="nav-item">
          <nuxt-link class="nav-link" to="/profile">My Profile</nuxt-link>
        </li>

        <li class="nav-item">
          <nuxt-link class="nav-link" to="/lists">My Lists</nuxt-link>
        </li>
      </ul>
    </li>

    <li v-if="!hasAvatar" class="nav-item nav-item-icon nav-logged-in-item nav-link-profile-li">
      <nuxt-link class="nav-link nav-link-profile" to="/profile"> </nuxt-link>
    </li>
  </ul>
</template>

<script>
import { Component } from 'nuxt-property-decorator';
import { UserMixin } from '@/mixins/userMixin';
import DeferredFigure from '@/components/common/DeferredFigure';
import SearchBox from '@/components/common/SearchBox';
@Component({
  components: { DeferredFigure, SearchBox }
})
export default class LoginActions extends UserMixin {}
</script>
