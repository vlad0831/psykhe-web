<template>
  <div>
    <b-sidebar id="editorial-nav" class="mobile-nav" width="440px" sidebar-class="mobile-nav" no-header shadow>
      <div class="mob-nav-sub mob-bkg-light">
        <span v-b-toggle="'editorial-nav'"></span>

        <a class="nav-head-sub">EDITORIAL</a>
      </div>

      <ul>
        <li class="nav-item">
          <nuxt-link class="nav-link" to="/editorial/carmen-busquets"> Carmen Busquets </nuxt-link>
        </li>

        <li class="nav-item">
          <nuxt-link class="nav-link" to="/editorial/ume-romaan"> Ume Romaan </nuxt-link>
        </li>

        <li class="nav-item">
          <nuxt-link class="nav-link" to="/editorial/anabel-maldonado"> Anabel Maldonado </nuxt-link>
        </li>
      </ul>
    </b-sidebar>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';

@Component
export default class EditorialSidebar extends Vue {}
</script>
