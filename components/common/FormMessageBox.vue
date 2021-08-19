<template>
  <div class="alert alert-success" role="alert">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class FormMessageBox extends Vue {}
</script>
