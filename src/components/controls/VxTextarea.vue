<script setup lang="ts">
// Multi-line text, styled like VxInput. Attributes and listeners go to the <textarea> (id, aria-*, maxlength, @blur);
// class and style too, since there's no wrapper. Grows by hand (resize: vertical) from `rows`.
withDefaults(
  defineProps<{ rows?: number; placeholder?: string; invalid?: boolean; disabled?: boolean; mono?: boolean }>(),
  { rows: 4, invalid: false, disabled: false, mono: false },
)
const model = defineModel<string>({ default: '' })
</script>

<template>
  <textarea
    v-model="model"
    class="vx-input vx-textarea"
    :class="{ 'is-invalid': invalid, 'vx-mono': mono }"
    :rows="rows"
    :placeholder="placeholder"
    :disabled="disabled"
    :aria-invalid="invalid || undefined"
  ></textarea>
</template>
