<template>
  <ul class="list-manager-lists">
    <li>
      <nuxt-link to="/lists">All</nuxt-link>
    </li>

    <li v-for="savelist in visibleSavelists" :key="savelist.slug">
      <input
        v-if="savelist.slug in savelistValues"
        :ref="savelist.slug"
        v-model="savelistValues[savelist.slug]"
        type="text"
        class="savelist-input"
        @keyup.enter="toggleEdit(savelist)"
      />

      <nuxt-link v-else :to="`/lists/${savelist.slug}`">
        {{ savelist.name }}
      </nuxt-link>

      <div class="list-actions">
        <a class="list-action list-delete" @click="confirmDelete(savelist)" />
        <a
          class="list-action list-edit"
          :class="{ editing: savelist.slug in savelistValues }"
          @click="toggleEdit(savelist)"
        />
      </div>
    </li>
  </ul>
</template>
<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import { Savelist } from '../../types/savelist/savelist';
import { savelistsStore } from '~/store';

@Component
export default class ListManager extends Vue {
  savelistValues: { [key: string]: string } = {};

  get visibleSavelists() {
    return savelistsStore.visibleSavelists.sort((a, b) => (a.slug && b.slug && a.slug > b.slug ? 1 : -1));
  }

  async toggleEdit(savelist: Savelist) {
    if (!savelist.slug) {
      return;
    }

    if (savelist.slug in this.savelistValues) {
      await savelistsStore.renameSavelist({ slug: savelist.slug, name: this.savelistValues[savelist.slug] });
      Vue.delete(this.savelistValues, savelist.slug);
    } else {
      Vue.set(this.savelistValues, savelist.slug, savelist.name);

      this.$nextTick(() => {
        if (!savelist.slug) {
          return;
        }

        (this.$refs[savelist.slug] as any)[0].focus();
      });
    }
  }

  confirmDelete(savelist: Savelist) {
    (this as any).$bvModal
      .msgBoxConfirm('Delete list ' + savelist.name + '?')
      .then((confirmed: any) => {
        if (confirmed) {
          savelistsStore.deleteSavelist(savelist);
        }
      })
      .then(() => {
        this.$router.push('/lists');
      })
      .catch(() => {});
  }
}
</script>
