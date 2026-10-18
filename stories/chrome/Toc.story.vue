<script setup lang="ts">
import { VxToc } from '../../src'
</script>

<template>
  <Story title="Table of contents" group="chrome" :layout="{ type: 'single', iframe: true }">
    <Variant title="Beside the content">
      <div class="vx-main vx-toc-layout" style="max-width: 900px">
        <VxToc />
        <article>
          <template v-for="n in 6" :key="n">
            <h2 class="vx-display">Section {{ n }}</h2>
            <p v-for="m in 6" :key="m">Text under section {{ n }} so there is something to scroll past.</p>
            <h3 v-if="n % 2">A part of section {{ n }}</h3>
            <p v-if="n % 2" style="height: 200px">More text.</p>
          </template>
        </article>
      </div>
    </Variant>
  </Story>
</template>
