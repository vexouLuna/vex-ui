<script setup lang="ts">
import { ref } from 'vue'
import { VxButton, VxConfirm, VxDialog, VxKbd, VxMenuItem, VxMenuLabel, VxMenuSeparator, VxPopover, VxTooltip, useToast } from '../../src'
import StoryFrame from '../StoryFrame.vue'

const dialog = ref(false)
const confirm = ref(false)
const typed = ref(false)
const forget = ref(false)
const busy = ref(false)
function slowDelete() {
  busy.value = true
  setTimeout(() => {
    busy.value = false
    typed.value = false
    show('VOD deleted')
  }, 1200)
}
const { show } = useToast()
const chapters = Array.from({ length: 24 }, (_, i) => ({ name: `Chapter ${i + 1}`, at: `${Math.floor(i / 2)}:${i % 2 ? '30' : '00'}:00` }))
</script>

<template>
  <Story title="Popover, dialog, toast, tooltip" group="overlays">
    <Variant title="Popover menu">
      <StoryFrame height="520px">
        <main style="height: 100%; display: flex; flex-direction: column; justify-content: space-between">
          <VxPopover>
            <template #trigger="{ toggle, open }">
              <VxButton :pressed="open" @click="toggle">Chapters ▾</VxButton>
            </template>
            <template #default="{ close }">
              <VxMenuLabel>24 chapters</VxMenuLabel>
              <VxMenuItem v-for="(c, i) in chapters" :key="i" :sub="c.at" :current="i === 3" @click="close">{{ c.name }}</VxMenuItem>
            </template>
          </VxPopover>
          <VxPopover>
            <template #trigger="{ toggle }">
              <VxButton @click="toggle">Near the bottom: opens up ▴</VxButton>
            </template>
            <template #default="{ close }">
              <VxMenuItem @click="close">Copy link</VxMenuItem>
              <VxMenuItem @click="close">Copy link at current time</VxMenuItem>
              <VxMenuSeparator />
              <VxMenuItem danger @click="close">Report</VxMenuItem>
            </template>
          </VxPopover>
        </main>
      </StoryFrame>
    </Variant>
    <Variant title="Dialog">
      <StoryFrame>
        <VxButton variant="danger" @click="dialog = true">Delete trigger…</VxButton>
        <VxDialog v-model:open="dialog" title="Delete this trigger?">
          It stops replying straight away. This can't be undone.
          <template #actions="{ close }">
            <VxButton @click="close">Cancel</VxButton>
            <VxButton variant="danger-solid" @click="dialog = false; show('Trigger deleted')">Delete</VxButton>
          </template>
        </VxDialog>
      </StoryFrame>
    </Variant>
    <Variant title="Confirm">
      <!-- VxConfirm: Cancel + the confirming button; stays open while loading; confirm-text asks to type first. -->
      <StoryFrame>
        <div class="story-row">
          <VxButton @click="confirm = true">Rejoin channel…</VxButton>
          <VxButton variant="danger" @click="typed = true">Delete VOD…</VxButton>
          <VxButton variant="danger" @click="forget = true">Forget me…</VxButton>
        </div>
        <VxConfirm v-model:open="confirm" title="Rejoin #somechannel?" confirm-label="Rejoin" @confirm="confirm = false; show('Rejoined')">
          The bot joins the chat again and replies straight away.
        </VxConfirm>
        <VxConfirm
          v-model:open="typed"
          title="Delete this VOD from the archive?"
          confirm-label="Delete"
          tone="danger"
          confirm-text="2581446712"
          :loading="busy"
          @confirm="slowDelete"
        >Removes the VOD with its chat and emotes. The YouTube videos stay. This can't be undone.</VxConfirm>
        <!-- confirm-ignore-case: the login is accepted in any case. -->
        <VxConfirm
          v-model:open="forget"
          title="Forget me?"
          confirm-label="Forget me"
          tone="danger"
          confirm-text="SomeViewer"
          confirm-ignore-case
          @confirm="forget = false; show('Forgotten')"
        >This deletes your account here for good. It can't be undone.</VxConfirm>
      </StoryFrame>
    </Variant>
    <Variant title="Toast">
      <StoryFrame>
        <div class="story-row">
          <VxButton @click="show('Link copied')">ok</VxButton>
          <VxButton @click="show('Loaded newer messages', { kind: 'info' })">info</VxButton>
          <VxButton @click="show('Could not reach the API', { kind: 'error' })">error</VxButton>
        </div>
      </StoryFrame>
    </Variant>
    <Variant title="Tooltip & kbd">
      <StoryFrame>
        <div class="story-row" style="padding-top: 40px">
          <VxTooltip text="Short, one line, never needed to use the page"><VxButton>hover me</VxButton></VxTooltip>
          <span>Press <VxKbd>y</VxKbd> to copy, <VxKbd>shift</VxKbd>+<VxKbd>click</VxKbd> for ±1s</span>
        </div>
      </StoryFrame>
    </Variant>
  </Story>
</template>
