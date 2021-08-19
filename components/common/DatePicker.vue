<template>
  <div>
    <input v-model="componentData" type="text" readonly :placeholder="placeholderText" @click="openSelector" />
    <div style="position: absolute; z-index: 10; width: 300px">
      <functional-calendar
        v-if="displayCalendar"
        ref="calendar"
        v-model="dateObject"
        style="position: relative"
        :change-month-function="true"
        :change-year-function="true"
        :change-year-step="12"
        :date-format="'dd/mm/yyyy'"
        :is-date-picker="true"
        :is-typeable="true"
        :new-current-date="dateObject"
        @choseDay="setDate"
      ></functional-calendar>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  model: { event: 'change' }
})
export default class DatePicker extends Vue {
  @Prop({ required: false, type: String, default: 'Select a date' })
  readonly placeholderText!: string;

  displayCalendar: boolean = false;
  componentData: any = null;
  dateObject: any = null;

  created() {
    this.componentData = this.$attrs.value === null ? null : new Date(this.$attrs.value).toDateString();
    this.dateObject = this.$attrs.value === null ? new Date('1 Oct 1985') : new Date(this.$attrs.value);
  }

  openSelector() {
    if (!this.displayCalendar) {
      this.displayCalendar = true;
    }
  }

  setDate() {
    this.$emit('change', this.formatDate(this.dateObject.selectedDate));

    this.displayCalendar = false;
    this.componentData = this.convertToDateObject(this.dateObject.selectedDate).toDateString();
    this.dateObject = new Date(this.convertToDateObject(this.dateObject.selectedDate));
  }

  convertToDateObject(date: String) {
    const dateArr: String[] = date.split('/');
    return new Date(dateArr.reverse().join('/'));
  }

  formatDate(date: String) {
    const dateArr: String[] = date.split('/');
    return dateArr.reverse().join('-');
  }
}
</script>
