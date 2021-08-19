<template>
  <div>
    <template v-if="range === 'low'">
      <p>
        You probably knew this already, but you're introverted. You tend to be quiet and keep to yourself, and can
        easily feel over-stimulated if forced to spend too much time in social situations. On the shy side, having too
        much attention on you makes you feel uncomfortable, so you're happiest behind-the-scenes, or home with a good
        book. If you must socialize, you prefer one-on-ones with a good longtime friend.
      </p>
      <p>
        You like contemplative music that you can enjoy alone, and your sophisticated style is also on the quieter side.
      </p>
      <p>
        Remember, your personal style is arrived at from how your five scores work together, and not from low
        extroversion alone, for an aesthetic that's uniquely yours. And you can always tune your feed or shop by mood to
        get closer to what you're feeling like.
      </p>
    </template>
    <template v-else-if="range === 'moderate-low'">
      <p>
        You're on the quiet side, tend to keep to yourself, and can feel over-stimulated after spending too much time
        with others. A bit reserved, having too much attention on you can make you feel uncomfortable, so you feel best
        behind-the-scenes, or at home with a good book. When catching up with people, you generally prefer small groups
        or a one-on-one with a good friend.
      </p>
      <p>
        You enjoy chill, contemplative music that makes you think, and your sophisticated, non-flashy style is also on
        the quieter, cerebral side.
      </p>
      <p>
        Remember, your personal style is arrived at from how your five scores work together, and not from moderate-low
        extroversion alone, for an aesthetic that's uniquely yours. And, you can always tune your feed or shop by mood
        to get closer to what you feel like.
      </p>
    </template>
    <template v-else-if="range === 'moderate'">
      <p>
        You love a good party as much as the next girl, but can also feel easily depleted if you don't have quality
        alone time to recharge: it's a careful balance you've mastered over the years. Sometimes you feel excited about
        life and are eager to pencil-in plans, but often you have periods of lying low. It comes in waves.
      </p>
      <p>
        Because you're somewhere in the middle between extroversion and introversion, your style in respect to this
        trait is also balanced and varied. You like pieces that aren't too loud or flashy nor too boring.
      </p>
      <p>
        Remember, your personal style is arrived at from how your five scores work together, and not from moderate
        extroversion alone, for an aesthetic that's uniquely yours. And you can always tune your feed or shop by mood to
        get closer to what you feel like.
      </p>
    </template>
    <template v-else-if="range === 'moderate-high'">
      <p>
        Seldom shy, you're usually the first to get up and dance and often the last woman standing. You like to make
        plans and organize social events, and often have many chats and conversations on the go. You can still enjoy a
        little bit of alone time, but socializing generally makes you feel even more energized than you already are.
        Most of the time, you like to talk through your problems with others.
      </p>
      <p>As such, you tend to like statement styles and exuberant colors and details, as well as energetic music.</p>
      <p>
        Remember, your personal style is arrived at from how your five scores work together, and not from moderate-high
        extroversion alone, for an aesthetic that's uniquely yours. And you can always tune your feed or shop by mood to
        get closer to what you feel like.
      </p>
    </template>
    <template v-else-if="range === 'high'">
      <p>
        Never shy, you're always the first to get up and dance as well as the last woman standing. With your explosive
        energy, you live to make plans and organize social events, and thrive off having many chats and conversations on
        the go. Socializing makes you feel energized, you're assertive, and you like to talking through issues with
        several different people.
      </p>
      <p>
        As such, you tend to like statement styles and exuberant colors and punchy details, as well as energetic music.
      </p>
      <p>
        Remember, your personal style is arrived at from how your five scores work together, and not from high
        extroversion alone, for an aesthetic that's uniquely yours. And you can always tune your feed or shop by mood to
        get closer to what you're feeling like.
      </p>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Extroversion extends Vue {
  @Prop({ required: true, type: String })
  range!: string;
}
</script>
