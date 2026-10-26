<script setup lang="ts">
import { ref } from 'vue'
import { VxButton, VxCallout, VxEmptyState, VxLoadState, VxProgress, VxSkeleton, VxSpinner } from '../../src'
import StoryFrame from '../StoryFrame.vue'

const states = ['error', 'loading', 'empty', 'loaded', 'stale'] as const
const state = ref<(typeof states)[number]>('error')
const channel = ref<{ name: string; replies: number } | null>(null)
const loadChannel = () => {
  channel.value = null
  setTimeout(() => (channel.value = { name: 'vexouluna', replies: 12 }), 1200)
}
loadChannel()
</script>

<template>
  <Story title="Feedback" group="feedback">
    <Variant title="Callouts">
      <StoryFrame site="dtp">
        <div class="story-col" style="max-width: 640px">
          <VxCallout tone="info" title="Heads up">The bot rejoins automatically after a restart.</VxCallout>
          <VxCallout tone="ok">Saved. Changes apply on the next message.</VxCallout>
          <VxCallout tone="warn" title="Bot is not a moderator">Timeouts and deletions won't work until it is.</VxCallout>
          <VxCallout tone="error" title="Banned from #somechannel">
            The bot was banned 2 hours ago.
            <template #actions><VxButton size="sm">Rejoin</VxButton></template>
          </VxCallout>
          <VxCallout tone="error" title="Parse error at 1:24">
            <pre class="vx-code" style="margin-top: 6px">!so {user} &gt; "check out {user.display_name} at twitch.tv/{user.login} — they were last playing {user.game}"</pre>
          </VxCallout>
        </div>
      </StoryFrame>
    </Variant>
    <Variant title="Progress & loading">
      <StoryFrame>
        <div class="story-col">
          <VxProgress :value="62" label="Watched" />
          <div class="story-row"><VxSpinner /> Loading chat…</div>
          <div class="story-row" style="align-items: flex-start">
            <VxSkeleton w="220px" ratio="16 / 9" />
            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px">
              <VxSkeleton w="80%" />
              <VxSkeleton w="40%" h="0.8em" />
            </div>
          </div>
        </div>
      </StoryFrame>
    </Variant>
    <Variant title="Empty state / 404">
      <StoryFrame>
        <VxEmptyState code="404" title="This page drifted off." text="The link may be old, or the VOD was removed.">
          <template #actions>
            <VxButton variant="primary" href="#">Go home</VxButton>
            <VxButton href="#">Browse VODs</VxButton>
          </template>
        </VxEmptyState>
      </StoryFrame>
    </Variant>
    <Variant title="Load state">
      <!-- One wrapper for error + Try again, skeleton rows while loading, the empty state, then the content.
           stale: a failed refresh keeps the older content, with a warning and Try again above it. -->
      <StoryFrame site="dtp">
        <div class="story-col" style="max-width: 640px">
          <div class="story-row">
            <VxButton v-for="s in states" :key="s" size="sm" :pressed="state === s" @click="state = s">{{ s }}</VxButton>
          </div>
          <VxLoadState
            :error="state === 'error' || state === 'stale' ? new Error('502 from the bot API') : null"
            :stale="state === 'stale'"
            :loading="state === 'loading'"
            :empty="state === 'empty'"
            error-title="Couldn't load the replies"
            empty-title="No replies yet"
            empty-text="Add one with !reply add in chat."
            @retry="state = 'loading'"
          >
            <p style="margin: 0">The content, once there's data.</p>
          </VxLoadState>
        </div>
      </StoryFrame>
    </Variant>
    <Variant title="Load state: data slot, stale and empty, margin">
      <!-- `data` comes back non-null in the default slot: no v-if around the content. `margin` spaces the stand-ins.
           With stale and empty, a failed refresh shows the warning over #empty rather than an empty table. -->
      <StoryFrame site="dtp">
        <div class="story-col" style="max-width: 640px">
          <VxButton size="sm" @click="loadChannel">Reload</VxButton>
          <VxLoadState :data="channel" :loading="!channel" :rows="2" margin="0 0 12px" v-slot="{ data }">
            <p style="margin: 0 0 12px">{{ data.name }} has {{ data.replies }} replies.</p>
          </VxLoadState>
          <p class="story-note">the text after it</p>
          <VxLoadState :error="new Error('502 from the bot API')" stale empty empty-title="Nothing ran here yet">
            <p>never shown: there are no rows</p>
          </VxLoadState>
        </div>
      </StoryFrame>
    </Variant>
  </Story>
</template>
