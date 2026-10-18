<script setup lang="ts">
// VxAccountMenu wired to the installed Account (`@vex/ui/account`): the signed-in user, greyed out when sign-in
// is off or still checking, Sign in through vex-auth and Sign out (ending every session). The default slot adds
// menu items, as on VxAccountMenu.
import { useAccount } from '../../account'
import VxAccountMenu from './VxAccountMenu.vue'

defineProps<{ note?: string }>()
const account = useAccount()
</script>

<template>
  <VxAccountMenu
    :user="account.menuUser.value"
    :disabled="!account.enabled || !account.ready.value"
    v-bind="note === undefined ? {} : { note }"
    @sign-in="account.signIn()"
    @sign-out="account.signOut({ everywhere: true })"
  >
    <template v-if="$slots['signin-icon']" #signin-icon><slot name="signin-icon"></slot></template>
    <template #default="{ close }"><slot :close="close"></slot></template>
  </VxAccountMenu>
</template>
