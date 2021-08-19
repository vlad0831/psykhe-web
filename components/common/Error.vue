<template>
  <div class="psykhe-error">
    <h1 class="psykhe-large-heading">{{ title }}</h1>

    <div class="psykhe-error-message">
      <p>
        {{ description }}

        <nuxt-link v-if="linkText" to="/browse">{{ linkText }}</nuxt-link
        ><span v-if="linkText">.</span>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Prop, Component } from 'vue-property-decorator';

@Component
export default class ErrorComponent extends Vue {
  @Prop({ type: String, required: true })
  readonly title!: string;

  @Prop({ type: String, required: true })
  readonly description!: string;

  @Prop({ type: String, required: false })
  readonly linkText!: string;
}
</script>
