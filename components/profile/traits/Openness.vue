<template>
  <div>
    <template v-if="range === 'low'">
      <p>
        Not a big fan of abstract ideas and new theories, you find people who are always flaunting intellectualism a bit
        pretentious. You're more analytical than imaginative, prefer real, tangible solutions, and opt for the
        tried-and-tested. You value traditions and tend to keep a social circle that you've cultivated over time.
      </p>
      <p>
        Your style is similarly conservative and traditional, and you like to look to classic style icons of the past.
      </p>
      <p>
        Remember, your personal style is arrived at from how your five scores work together, and not from low openness
        alone, for an aesthetic that's uniquely yours. And you can always tune your feed or shop by mood to get closer
        to what you feel like in real time.
      </p>
    </template>
    <template v-else-if="range === 'moderate-low'">
      <p>
        You tend to value traditions and keep a social circle that you've cultivated over time. Leaning towards being
        practical, you're not such a fan of crazy abstract ideas and new theories, and you find people who are always
        flaunting intellectualism a bit pretentious. You're more analytical than imaginative, and tend to prefer
        tried-and-tested, tangible solutions.
      </p>
      <p>
        Your style leans a bit towards the conservative and traditional, and you like to look to classic style icons of
        the past.
      </p>
      <p>
        Remember, your personal style is arrived at from how your five scores work together, and not from moderate-low
        openness alone, for an aesthetic that's uniquely yours. And, you can always tune your feed or shop by mood to
        get closer to what you're feeling like.
      </p>
    </template>
    <template v-else-if="range === 'moderate'">
      <p>
        At times, you can feel highly creative, curious, and adventurous. At other times, you prefer routine, structure,
        and tradition. You are able to find a good balance between new ideas and simply being practical. When you are
        faced with a problem, you are able to consider tried-and true methods, but can also think outside the box.
      </p>
      <p>
        As such, your style has a good balance of both classic staples and more directional, trendier pieces. You like
        to mix it up.
      </p>
      <p>
        Remember, your personal style is arrived at from how your five scores work together, and not from moderate
        openness alone, for an aesthetic that's uniquely yours. And you can always tune your feed or shop by mood to get
        closer to what you're feeling like.
      </p>
    </template>
    <template v-else-if="range === 'moderate-high'">
      <p>
        You're forward-thinking, not big on traditional theories, prefer to challenge the status quo, and are more
        liberal in your values. You're worldly, intellectually curious, and are generally receptive to abstract ideas
        and new cultures. Well-read and well-travelled, you're keen to know everything about everything.
      </p>

      <p>
        You're creative and sensitive to aesthetics, and your style reflects this with unique silhouettes and bold
        detailing.
      </p>
      <p>
        Remember, your personal style is arrived at from how your five scores work together, and not from moderate-high
        openness alone, for an aesthetic that's uniquely yours. And you can always tune your feed or shop by mood to get
        closer to what you feel like.
      </p>
    </template>
    <template v-else-if="range === 'high'">
      <p>
        You have a strong disdain for convention, are liberal in your values, and tend to be avant-garde in the way you
        live, work and think. You're worldly, intellectually curious, and love exploring abstract ideas and immersing
        yourself in new cultures. Super well-read and well-travelled, you tend to know everything about everything.
      </p>
      <p>
        As you're creative and sensitive to aesthetics, your style reflects this with bold, unique silhouettes and
        unusual detailing.
      </p>
      <p>
        Remember, your personal style is arrived at from how your five scores work together, and not from high openness
        alone, for an aesthetic that's uniquely yours. And you can always tune your feed or shop by mood to get closer
        to what you're feeling like.
      </p>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Openness extends Vue {
  @Prop({ required: true, type: String })
  range!: string;
}
</script>
