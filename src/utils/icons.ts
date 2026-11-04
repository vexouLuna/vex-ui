// Line icons for control buttons, drawn on a 24×24 grid in the text colour. `.fill` shapes are solid.
// Started from vods-core's watch-page set; add a name here and VxIcon draws it.
export const VX_ICONS = {
  play: '<path class="fill" d="M7 4.5v15l12-7.5z"/>',
  pause: '<rect class="fill" x="6" y="5" width="4" height="14" rx="1"/><rect class="fill" x="14" y="5" width="4" height="14" rx="1"/>',
  volume: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  mute: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
  copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"/>',
  list: '<path d="M8 6.5h12M8 12h12M8 17.5h12M4 6.5h.01M4 12h.01M4 17.5h.01"/>',
  download: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14"/>',
  theater: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10v4M17 10v4"/>',
  'theater-off': '<rect x="3" y="6" width="18" height="12" rx="2"/><rect x="7" y="9" width="10" height="6" rx="1"/>',
  fullscreen: '<path d="M4 9V5h4M16 5h4v4M20 15v4h-4M8 19H4v-4"/>',
  settings: '<path d="M18.7 10.1L21.2 9.8L21.2 14.2L18.7 13.9L18.1 15.4L20.1 17L17 20.1L15.4 18.1L13.9 18.7L14.2 21.2L9.8 21.2L10.1 18.7L8.6 18.1L7 20.1L3.9 17L5.9 15.4L5.3 13.9L2.8 14.2L2.8 9.8L5.3 10.1L5.9 8.6L3.9 7L7 3.9L8.6 5.9L10.1 5.3L9.8 2.8L14.2 2.8L13.9 5.3L15.4 5.9L17 3.9L20.1 7L18.1 8.6z"/><circle cx="12" cy="12" r="2.8"/>',
  keyboard: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/>',
  chat: '<path d="M4 5.5h16v10H10l-4 3.5v-3.5H4z"/>',
  external: '<path d="M14 4.5h5.5V10M19.5 4.5L11 13M17 14v4.5a1 1 0 0 1-1 1H5.5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1H10"/>',
  up: '<path d="M6 15l6-6 6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  back: '<path d="M15 5.5L8.5 12l6.5 6.5"/>',
} as const

export type VxIconName = keyof typeof VX_ICONS
