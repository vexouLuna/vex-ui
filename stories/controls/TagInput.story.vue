<script setup lang="ts">
import { reactive } from 'vue'
import { VxField, VxTagInput } from '../../src'
import StoryFrame from '../StoryFrame.vue'

const f = reactive({ tags: ['doom', 'speedrun'], words: ['spoiler', 'bitly.com'], ids: [] as string[], off: ['doom'] })
const tags = [
  { value: 'doom', label: 'Doom', color: '#e5484d', hint: '48 VODs' },
  { value: 'doom-2', label: 'Doom II', color: '#e5484d', hint: '12 VODs' },
  { value: 'speedrun', label: 'Speedrun', color: '#f5a524', hint: '31 VODs' },
  { value: 'randomizer', label: 'Randomizer', color: '#7c66dc' },
  { value: 'irl', label: 'IRL', color: '#30a46c' },
  { value: 'just-chatting', label: 'Just Chatting' },
  { value: 'collab', label: 'Collab', hint: 'with guests' },
]
const locked = [
  { value: 'game:doom-eternal', label: 'Doom Eternal', tone: 'accent' as const, title: 'From the Twitch category; change it there' },
  { value: 'year:2026', label: '2026', title: 'Set from the stream date' },
]
const numeric = (v: string) => (/^\d+$/.test(v) ? null : 'A Twitch user id is digits only.')
</script>

<template>
  <Story title="Tag input" group="controls">
    <Variant title="Tags">
      <StoryFrame height="420px">
        <div class="story-col">
          <VxField v-slot="{ id }" label="Tags" help="Type to filter; ↑/↓ and Enter to pick; Backspace twice removes the last.">
            <VxTagInput :id="id" v-model="f.tags" :options="tags" :locked="locked" placeholder="Add a tag" />
          </VxField>
          <code class="story-note">{{ f.tags }}</code>
        </div>
      </StoryFrame>
    </Variant>
    <Variant title="List of values">
      <StoryFrame height="420px">
        <div class="story-col">
          <VxField v-slot="{ id }" label="Blocked words" help="Comma or Enter adds one; pasting a comma list adds them all.">
            <VxTagInput :id="id" v-model="f.words" allow-new placeholder="Add a word" />
          </VxField>
          <VxField v-slot="{ id }" label="Trusted user ids" help="Digits only, at most 3.">
            <VxTagInput :id="id" v-model="f.ids" allow-new :validate="numeric" :max="3" placeholder="Add an id" />
          </VxField>
          <code class="story-note">{{ f.words }} {{ f.ids }}</code>
        </div>
      </StoryFrame>
    </Variant>
    <Variant title="States">
      <StoryFrame height="320px">
        <div class="story-col">
          <VxField v-slot="{ id }" label="Disabled">
            <VxTagInput :id="id" v-model="f.off" :options="tags" :locked="locked.slice(1)" disabled />
          </VxField>
          <VxField v-slot="{ id }" label="Invalid" error="Pick at least one tag.">
            <VxTagInput :id="id" :model-value="[]" :options="tags" invalid placeholder="Add a tag" />
          </VxField>
        </div>
      </StoryFrame>
    </Variant>
  </Story>
</template>
