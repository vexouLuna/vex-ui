<script setup lang="ts">
import { computed, reactive } from 'vue'
import { VxButton, VxCheckbox, VxDateInput, VxDateRange, VxSaveBar, VxTextarea, VxField, VxInput, VxRadioGroup, VxSelect, VxSlider, VxStepper, VxSwitch } from '../../src'
import StoryFrame from '../StoryFrame.vue'

const f = reactive({
  name: 'vexouluna', search: '', delay: 1.5, sort: 'new', check: true, radio: 'all', sw: true, sw2: false, vol: 40,
  from: '2026-09-01', to: '2026-09-24', note: 'Live most weeknights from 8pm.', saved: 'Live most weeknights from 8pm.', day: '2026-10-23', at: '2026-10-23T14:05', atSec: '2026-10-23T20:00:00', due: '',
})
const nameErr = computed(() => (f.name.length < 3 ? 'At least 3 characters.' : ''))
const sorts = [
  { value: 'new', label: 'Newest' },
  { value: 'old', label: 'Oldest' },
  { value: 'long', label: 'Longest', sub: 'duration' },
  { value: 'watched', label: 'Most watched', disabled: true },
]
</script>

<template>
  <Story title="Form controls" group="controls">
    <Variant title="Inputs">
      <StoryFrame height="480px">
        <div class="story-col">
          <VxField v-slot="{ id }" label="Display name" :error="nameErr" help="Shown in chat replays.">
            <VxInput :id="id" v-model="f.name" :invalid="!!nameErr" />
          </VxField>
          <VxField v-slot="{ id }" label="Search">
            <VxInput :id="id" v-model="f.search" type="search" placeholder="Search titles" clearable>
              <template #icon>⌕</template>
            </VxInput>
          </VxField>
          <VxField v-slot="{ id }" label="Sort">
            <VxSelect :id="id" v-model="f.sort" :options="sorts" />
          </VxField>
          <VxField v-slot="{ id }" label="Chat delay" help="0.1s steps; shift-click for 1s.">
            <VxStepper :id="id" v-model="f.delay" :step="0.1" :min="-30" :max="30" unit="s" label="Chat delay" />
          </VxField>
        </div>
      </StoryFrame>
    </Variant>
    <Variant title="Choices">
      <StoryFrame>
        <div class="story-col">
          <VxCheckbox v-model="f.check" label="Show timestamps" />
          <VxRadioGroup v-model="f.radio" label="Show" :options="[{ value: 'all', label: 'All' }, { value: 'vod', label: 'VODs' }, { value: 'live', label: 'Live' }]" />
          <VxSwitch v-model="f.sw" label="7TV emotes" />
          <VxSwitch v-model="f.sw2" label="Disabled" disabled />
          <div class="story-row"><span>Volume</span><VxSlider v-model="f.vol" label="Volume" style="max-width: 200px" /><code class="story-note">{{ f.vol }}</code></div>
        </div>
      </StoryFrame>
    </Variant>
    <Variant title="Form row">
      <StoryFrame>
        <div class="vx-form-row">
          <VxField v-slot="{ id }" label="Name" :error="nameErr" help="Shown in chat replays.">
            <VxInput :id="id" v-model="f.name" :invalid="!!nameErr" />
          </VxField>
          <VxField v-slot="{ id }" label="Sort">
            <VxSelect :id="id" v-model="f.sort" :options="sorts" />
          </VxField>
          <VxCheckbox v-model="f.check" label="Timestamps" />
          <VxButton variant="primary">Save</VxButton>
        </div>
      </StoryFrame>
    </Variant>
    <Variant title="Input width">
      <!-- `width` for a short value, `grow` to share a row with buttons (from `width`, capped by `max-width`). -->
      <StoryFrame>
        <div class="story-col">
          <div class="story-row">
            <span>Cooldown</span><VxInput v-model="f.delay" type="number" :width="96" mono /><span class="story-note">s</span>
          </div>
          <div class="story-row">
            <VxInput v-model="f.search" grow width="14rem" max-width="20rem" placeholder="Add a command" clearable />
            <VxButton variant="primary">Add</VxButton>
            <VxButton>Import</VxButton>
          </div>
        </div>
      </StoryFrame>
    </Variant>
    <Variant title="Date range">
      <StoryFrame height="420px">
        <div class="story-col">
          <VxDateRange v-model:from="f.from" v-model:to="f.to" />
          <code class="story-note">{{ f.from || '…' }} → {{ f.to || '…' }}</code>
        </div>
      </StoryFrame>
    </Variant>
    <Variant title="Textarea and save bar">
      <!-- VxSaveBar sticks to the bottom of the screen under a long form and lights up with unsaved changes. -->
      <StoryFrame>
        <form class="story-col" style="max-width: 560px" @submit.prevent="f.saved = f.note">
          <VxField v-slot="{ id }" label="About" help="Shown on the channel page.">
            <VxTextarea :id="id" v-model="f.note" :invalid="f.note.length > 200" maxlength="240" />
          </VxField>
          <VxField v-slot="{ id }" label="Command (mono)"><VxTextarea :id="id" model-value="!so {user}" mono :rows="2" /></VxField>
          <VxSaveBar
            :count="f.note === f.saved ? 0 : 1"
            :blocked="f.note.length > 200"
            submit
            @undo="f.note = f.saved"
          />
          <VxSaveBar :count="3" error="The bot API answered 502." />
          <VxSaveBar
            :count="2"
            undo-label="Reset"
            error-title="Couldn't save"
            :status-text="(n: number) => (n ? 'Unsaved changes' : '')"
          />
          <p class="story-note">wording props: undo-label, error-title, status-text</p>
        </form>
      </StoryFrame>
    </Variant>
    <Variant title="Date and date-time input">
      <!-- Type, paste (a pasted 2026-10-23T12:05:00Z becomes local time) or pick from the calendar. -->
      <StoryFrame height="540px">
        <div class="story-col" style="max-width: 320px">
          <VxField v-slot="{ id }" label="Day"><VxDateInput :id="id" v-model="f.day" /></VxField>
          <code class="story-note">{{ f.day || '…' }}</code>
          <VxField v-slot="{ id }" label="Starts at" help="24-hour time"><VxDateInput :id="id" v-model="f.at" time /></VxField>
          <code class="story-note">{{ f.at || '…' }}</code>
          <VxField v-slot="{ id }" label="Streamed at" help="To the second"><VxDateInput :id="id" v-model="f.atSec" time seconds /></VxField>
          <code class="story-note">{{ f.atSec || '…' }}</code>
          <VxField v-slot="{ id }" label="Due (this year only)"><VxDateInput :id="id" v-model="f.due" min="2026-01-01" max="2026-12-31" /></VxField>
          <VxField v-slot="{ id }" label="Disabled"><VxDateInput :id="id" model-value="2026-10-23" disabled /></VxField>
        </div>
      </StoryFrame>
    </Variant>
  </Story>
</template>
