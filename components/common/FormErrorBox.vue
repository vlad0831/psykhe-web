<template>
  <div class="text-danger">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class FormErrorBox extends Vue {}
</script>
