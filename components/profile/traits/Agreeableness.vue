<template>
  <div>
    <template v-if="range === 'low'">
      <p>
        With a very strong sense of self, and a keen competitive streak, you generally like to focus on you, work best
        alone, believe modesty is overrated, and aren't into the whole group thing. Never afraid to voice an opinion,
        you love a good debate, whether on Twitter or at dinner.
      </p>
      <p>
        Your every-woman-for-herself superhero style - think leather and studded items or power blazers - also trickles
        down to a bold taste in music and films with strong leading characters.
      </p>
      <p>
        Remember, your personal style is arrived at from how your five scores work together, and not from low
        agreeableness alone, for an aesthetic that's all your own. And you can always tune your feed or shop by mood to
        get closer to what you're feel like.
      </p>
    </template>
    <template v-else-if="range === 'moderate-low'">
      <p>
        With a strong sense of self and a slight competitive streak, you mostly like to focus on you, prefer to work
        alone, and aren't super into the whole group thing. It's easy for you to voice an opinion, and you love a good
        debate on topics you care about, whether on Twitter or at dinner.
      </p>
      <p>
        Your somewhat guarded style - think leather and studded items or power blazers - also trickles down to strong
        tastes in music and a preference for films with strong characters.
      </p>
      <p>
        Remember, your personal style is arrived at from how your five scores work together, and not from moderate-low
        agreeableness alone, for an aesthetic that's uniquely yours. And you can always tune your feed or shop by mood
        to get closer to what you feel like.
      </p>
    </template>

    <template v-else-if="range === 'moderate'">
      <p>
        Lucky you, you're a good team player and not overly competitive, but also happy to work alone and know how to
        stand up for yourself. You know when to lead, but are always happy to let others shine. You can argue your point
        when necessary, but also know which battles are worth picking. As such you're well-liked and respected.
      </p>
      <p>
        Your style expressed through this trait is neither too friendly nor too guarded, meaning you can mix florals
        with tougher pieces, and it feels right.
      </p>
      <p>
        Remember, your personal style is arrived at from how your five scores work together, and not from moderate
        agreeableness alone, for an aesthetic that's uniquely yours. And you can always tune your feed or shop by mood
        to get closer to what you feel like.
      </p>
    </template>
    <template v-else-if="range === 'moderate-high'">
      <p>
        Friendly and sociable, you know how to be a good team player, like to help others in need, and are able to
        consider the needs of a group. You don't enjoy competing so much as you generally believe it's better to be
        happy than to be right.
      </p>
      <p>
        As a result, you tend to prefer cheerful fashion that draws people in, non-aggressive music and feel-good films.
      </p>
      <p>
        Remember, your personal style is arrived at from how your five scores work together, and not from moderate-high
        agreeableness alone, for an aesthetic that's uniquely yours. And you can always tune your feed or shop by mood
        to get closer to what you're feeling like.
      </p>
    </template>
    <template v-else-if="range === 'high'">
      <p>
        Warm and sociable, tactful and polite, you're great at empathizing with the needs of other people. A team
        player, who is modest, and always willing to help someone in need, you're easily able to trust other people and
        don't get competitive. Better to be happy then be right, right?
      </p>
      <p>
        As a result, you like cheerful, friendly fashion that draws people in, such as florals or pastel colors,
        non-aggressive music, and feel-good films.
      </p>
      <p>
        Remember, your personal style is arrived at from how your five scores work together, and not from high
        agreeableness alone, for an aesthetic that's uniquely yours. And, you can always tune your feed or shop by mood
        to get closer to what you feel like day-to-day.
      </p>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Agreeableness extends Vue {
  @Prop({ required: true, type: String })
  range!: string;
}
</script>
