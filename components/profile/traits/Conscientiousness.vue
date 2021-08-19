<template>
  <div>
    <template v-if="range === 'low'">
      <p>
        You value experiences much more than worldly success, and as such tend to be very laid-back. Instead of being
        goal-oriented, you prefer to bask in the moment. A free-spirit, you like to live life on the edge and defy
        society's conventions. Time, rules, all these things are just mental constructs, right?
      </p>
      <p>
        Your fun-loving nature translates into a look that could lean into streetwear, party staples, a bohemian
        aesthetic or a rock 'n' roll, sensibility.
      </p>
      <p>
        Remember, your personal style is arrived at from how your five scores work together, and not from low
        conscientiousness alone, for an aesthetic that's yours alone. And you can always tune your feed or shop by mood
        to get closer to what you're feeling like.
      </p>
    </template>
    <template v-else-if="range === 'moderate-low'">
      <p>
        You're laid-back, like to live a bit on the edge, and tend to value experiences more than worldly success.
        Instead of always obsessing about long-term goals, you often prefer to bask in the moment. A free-spirit, you
        don't feel the need to always conform society's conventions. Time, rules, all these things are just mental
        constructs right?
      </p>
      <p>
        Your fun-loving nature translates into a look that could lean into streetwear, party staples, a bohemian
        aesthetic or a rock 'n' roll, sensibility.
      </p>
      <p>
        Remember, your personal style is arrived at from how your five scores work together, and not from moderate-low
        conscientiousness alone, for an aesthetic that's uniquely yours. And you can always tune your feed or shop by
        mood to get closer to what you feel like.
      </p>
    </template>
    <template v-else-if="range === 'moderate'">
      <p>
        You're a hybrid of free-spirit and goal-getter, knowing when to shift from responsible mode to fun mode and back
        again. Sometimes you feel confused about what you value more: in-the-moment experiences or worldly success, but
        ultimately you've learned to embrace both sides of who you are. It's a good balance to have: hard-working, neat,
        and health-focused, but not obsessively so.
      </p>
      <p>
        As such, your style tends to have plenty of contrasts, and you usually like to offset grown-up looks with
        youthful touches, such as sneakers.
      </p>
      <p>
        Remember, your personal style is arrived at from how your five scores work together, and not from moderate-high
        conscientiousness alone, for an aesthetic that's uniquely yours. And you can always tune your feed or shop by
        mood to get closer to what you feel like.
      </p>
    </template>
    <template v-else-if="range === 'moderate-high'">
      <p>
        A natural go-getter, you enjoy planning out long-term goals, and working hard to achieve them. Generally
        organized and responsible, you tend to have a place for everything, and are mostly on top of all your paperwork
        and duties, from pension scheme to teeth cleaning. You tend to have a cautious streak, and prefer to think
        things through, but still know how to have fun.
      </p>
      <p>
        Naturally, your style leans towards an adult-like aesthetic—tailored, crisp and neat—and you like clean lines in
        design.
      </p>
      <p>
        Remember, your personal style is arrived at from how your five scores work together, and not from moderate-high
        conscientiousness alone, for an aesthetic that's uniquely yours. And you can always tune your feed or shop by
        mood to get closer to what you feel like.
      </p>
    </template>
    <template v-else-if="range === 'high'">
      <p>
        You excel at formulating long-term goals, then organizing, planning, and working consistently to achieve them.
        Meticulously organized and responsible, you have a place for everything, and are fully on top of all your
        paperwork, healthcare and duties, from pension scheme to teeth cleaning. You have a cautious streak, and like to
        think things through.
      </p>
      <p>
        Naturally, your style is properly adult-like, tailored, crisp and neat. You like clean lines in design, and keep
        your clothes in immaculate condition.
      </p>
      <p>
        Remember, your personal style is arrived at from how your five scores work together, and not from high
        conscientiousness alone, for an aesthetic that's uniquely yours. And, you can always tune your feed or shop by
        mood to get closer to what you feel like.
      </p>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Conscientiousness extends Vue {
  @Prop({ required: true, type: String })
  range!: string;
}
</script>
