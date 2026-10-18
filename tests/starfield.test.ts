import { describe, expect, it } from 'vitest'
import { createNoise } from '../src/utils/perlin'
import { hashString, mulberry32 } from '../src/utils/random'
import { generateStars, STARFIELD_DEFAULTS } from '../src/utils/starfield'

describe('starfield', () => {
  it('is deterministic per seed', () => {
    const a = generateStars('vods.vexoul.net', 800, 600, STARFIELD_DEFAULTS).stars
    const b = generateStars('vods.vexoul.net', 800, 600, STARFIELD_DEFAULTS).stars
    const c = generateStars('dtp.vexoul.net', 800, 600, STARFIELD_DEFAULTS).stars
    expect(a).toEqual(b)
    expect(a).not.toEqual(c)
  })

  it('stays near the density target inside the area', () => {
    const { stars } = generateStars('vexoul.net', 1000, 1000, STARFIELD_DEFAULTS)
    const target = (STARFIELD_DEFAULTS.density * 1000 * 1000) / 10000
    expect(stars.length).toBeGreaterThan(target * 0.9)
    expect(stars.length).toBeLessThan(target * 1.1)
    for (const s of stars) {
      expect(s.x).toBeGreaterThanOrEqual(0)
      expect(s.x).toBeLessThan(1000)
      expect(s.size).toBeGreaterThanOrEqual(1)
    }
  })

  it('does not move a star when the page height changes', () => {
    const short = generateStars('vexoul.net', 900, 700, STARFIELD_DEFAULTS).stars
    const tall = generateStars('vexoul.net', 900, 3000, STARFIELD_DEFAULTS).stars
    const key = (s: { x: number; y: number }) => `${s.x},${s.y}`
    const inTall = new Set(tall.map(key))
    expect(short.length).toBeGreaterThan(0)
    for (const s of short) expect(inTall.has(key(s))).toBe(true)
  })

  it('perlin noise is seeded, bounded and zero on grid points', () => {
    const n = createNoise(mulberry32(hashString('x'))())
    expect(n.perlin2(3, 7)).toBe(0)
    for (let i = 0; i < 200; i++) expect(Math.abs(n.perlin2(i * 0.37, i * 0.91))).toBeLessThanOrEqual(1)
    expect(createNoise(0.5).perlin2(1.3, 2.7)).toBe(createNoise(0.5).perlin2(1.3, 2.7))
    expect(createNoise(0.5).perlin2(1.3, 2.7)).not.toBe(createNoise(0.25).perlin2(1.3, 2.7))
  })
})
