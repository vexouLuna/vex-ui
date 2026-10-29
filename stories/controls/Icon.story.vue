<script setup lang="ts">
import { VX_ICONS, VxButton, VxIcon, type VxIconName } from '../../src'
import StoryFrame from '../StoryFrame.vue'

const names = Object.keys(VX_ICONS) as VxIconName[]
</script>

<template>
  <Story title="Icon" group="controls">
    <Variant title="Every name">
      <StoryFrame>
        <div class="story-row" style="align-items: flex-start">
          <div v-for="n in names" :key="n" style="width: 96px; display: grid; justify-items: center; gap: 6px">
            <VxIcon :name="n" :size="24" />
            <code class="story-note">{{ n }}</code>
          </div>
        </div>
      </StoryFrame>
    </Variant>
    <Variant title="In buttons">
      <StoryFrame>
        <div class="story-row">
          <VxButton icon label="Play"><VxIcon name="play" /></VxButton>
          <VxButton icon label="Copy link"><VxIcon name="copy" /></VxButton>
          <VxButton icon size="sm" label="Settings"><VxIcon name="settings" :size="16" /></VxButton>
          <VxButton><VxIcon name="download" />Download</VxButton>
          <VxButton variant="primary" size="sm"><VxIcon name="external" :size="16" />Open on Twitch</VxButton>
          <span class="story-note">18px fits a 32px button; 16px a 26px one. The button carries the label, so the icon is aria-hidden</span>
        </div>
        <div class="story-row" style="margin-top: 12px">
          <VxIcon name="chat" title="Chat replay available" style="color: var(--vx-accent)" />
          <span class="story-note">a lone icon that means something gets a <code>title</code> (role="img", aria-label)</span>
        </div>
      </StoryFrame>
    </Variant>
  </Story>
</template>
