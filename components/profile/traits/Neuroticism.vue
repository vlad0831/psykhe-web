<template>
  <div>
    <template v-if="range === 'low'">
      <p>
        Wow, nothing gets you down. Using a rational approach to life, you're able to keep you emotions in check way
        better than most people, allowing you to focus on things that really matter.
      </p>
      <p>
        Since you're calm, happy and worry-free most of the time, you prefer cheerful, straightforward looks, much like
        with films, and music. To you, fashion is about fun and self-expression, so you likely prefer happy hues and
        classic or vibrant prints.
      </p>
      <p>
        Remember, your personal style is arrived at from how your five scores work together, and not from low
        neuroticism alone, for a style code that's uniquely yours. And, you can always tune your feed or shop by mood to
        get closer to what you're feeling like in real time.
      </p>
    </template>
    <template v-else-if="range === 'moderate-low'">
      <p>
        You're a pretty happy soul, slow to anger, and able to keep calm in emotional situations much better than most
        people, allowing you to focus on practical matters. Your friends envy your stable nature.
      </p>
      <p>
        Since you're happy and worry-free most of the time, you prefer upbeat looks, films, and music. To you, fashion
        is more about fun and self-expression, so you likely prefer happy hues, casual staples, and vibrant prints.
      </p>
      <p>
        Remember, your personal style is arrived at from how your five scores work together, and not from moderate-low
        neuroticism alone, for an aesthetic that's uniquely yours. And, you can always tune your feed or shop by mood to
        get closer to what you feel like in real time.
      </p>
    </template>
    <template v-else-if="range === 'moderate'">
      <p>
        Everything in moderation, including emotions, right? You're a balanced personality in terms of neuroticism, the
        trait responsible for making us feel sensitive and prone to the odd bad mood. This means that you benefit from
        some of its gifts, like being caring towards others, and being creative, but you're able to keep your emotions
        in check when it matters.
      </p>
      <p>
        Since you're moderate, you can swing towards darker hues or more cheerful colors, depending on your mood, but
        you also quite like mixing up your style for a contrast of both.
      </p>
      <p>
        Remember, your personal style is arrived at from how your five scores work together, and not from moderate
        neuroticism alone, for an aesthetic that's uniquely yours. And, you can always tune your feed or shop by mood to
        get closer to what you feel like that day.
      </p>
    </template>
    <template v-else-if="range === 'moderate-high'">
      <p>
        You're on the sensitive side and probably worry a little bit more than most, but hey, you're also caring towards
        your friends and family, and have a strong creative streak.
      </p>
      <p>
        Led by feelings and intuition, you love emotional, meaningful music, film, and art. Your vulnerable nature also
        makes you love strong design and bold details when it comes to aesthetic. Fashion really is your armor, so you
        love darker looks and statement features.
      </p>
      <p>
        Remember, your personal style is arrived at from how your five scores work together, and not from moderate
        neuroticism alone, for an aesthetic that's uniquely yours. And you can always tune your feed or shop by mood to
        get closer to what you're feeling like.
      </p>
    </template>
    <template v-else-if="range === 'high'">
      <p>
        OK, you're sensitive and probably worry more than necessary, but hey, you're also extremely caring towards your
        nearest and dearest. You're also powerfully creative. You can't be sensitive to detail, if you're not sensitive,
        period.
      </p>
      <p>
        You love emotional music, film, and art that moves you, and your vulnerable nature also makes you love strong
        design when it comes to your personal style. Fashion really is your armor, so you love dark, bolder looks and
        statement features.
      </p>
      <p>
        Remember, your personal style is arrived at from how your five scores work together, and not from high
        neuroticism alone, for an aesthetic that's uniquely yours. And you can always tune your feed or shop by mood to
        get closer to what you're feeling like.
      </p>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Neuroticism extends Vue {
  @Prop({ required: true, type: String })
  range!: string;
}
</script>
