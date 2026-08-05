<template>
  <section class="login-presentation" :aria-label="t('auth.brand.ariaLabel')">
    <div class="presentation-scene" aria-hidden="true">
      <div class="scanline-texture" />
      <div class="perspective-grid" />
      <div class="signal-rail signal-rail--horizontal" />
      <div class="signal-rail signal-rail--vertical" />
      <div class="hologram-stage">
        <div class="hologram-stage__halo" />
        <div class="wireframe-sphere">
          <span class="sphere-shell sphere-shell--outer" />
          <span class="sphere-shell sphere-shell--inner" />
          <span class="sphere-ring sphere-ring--one"><i class="orbit-node orbit-node--one" /></span>
          <span class="sphere-ring sphere-ring--two"><i class="orbit-node orbit-node--two" /></span>
          <span class="sphere-ring sphere-ring--three"
            ><i class="orbit-node orbit-node--three"
          /></span>
          <span class="sphere-core" />
        </div>
        <div class="hologram-prism hologram-prism--primary">
          <span class="prism-face prism-face--front" />
          <span class="prism-face prism-face--back" />
          <span class="prism-face prism-face--right" />
          <span class="prism-face prism-face--left" />
          <span class="prism-face prism-face--top" />
          <span class="prism-face prism-face--bottom" />
        </div>
        <div class="hologram-prism hologram-prism--secondary">
          <span class="prism-face prism-face--front" />
          <span class="prism-face prism-face--back" />
          <span class="prism-face prism-face--right" />
          <span class="prism-face prism-face--left" />
          <span class="prism-face prism-face--top" />
          <span class="prism-face prism-face--bottom" />
        </div>
        <span class="scene-particle scene-particle--one" />
        <span class="scene-particle scene-particle--two" />
        <span class="scene-particle scene-particle--three" />
        <span class="scene-particle scene-particle--four" />
      </div>
      <span class="data-node data-node--upper" />
      <span class="data-node data-node--lower" />
    </div>

    <div class="presentation-content">
      <CyberLogo class="login-logo" tone="light" />
      <div class="manifesto">
        <p>{{ t('auth.manifesto.kicker') }}</p>
        <h1>
          {{ t('auth.manifesto.lineOne') }}<br /><em>{{ t('auth.manifesto.lineTwo') }}</em>
        </h1>
        <span>{{ t('auth.manifesto.description') }}</span>
        <ol>
          <li><b>01</b>{{ t('auth.manifesto.moduleBoundary') }}</li>
          <li><b>02</b>{{ t('auth.manifesto.runtimeContract') }}</li>
          <li><b>03</b>{{ t('auth.manifesto.controlledEvolution') }}</li>
        </ol>
      </div>
      <footer class="presentation-footer">
        <small class="signature">{{ appConfig.tagline }}</small>
        <CreatorCredit tone="light" />
      </footer>
    </div>
  </section>
</template>

<script setup lang="ts">
import CreatorCredit from '@/components/brand/CreatorCredit.vue'
import CyberLogo from '@/components/brand/CyberLogo.vue'
import { appConfig } from '@/config/app.config'
import { useLocalization } from '@/modules/system/localization/localization'

const { t } = useLocalization()
</script>

<style scoped>
.login-presentation {
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  overflow: hidden;
  color: var(--hero-foreground);
  background:
    radial-gradient(
      circle at 72% 45%,
      color-mix(in srgb, var(--brand-node), transparent 78%),
      transparent 19%
    ),
    radial-gradient(
      ellipse at 22% 0%,
      color-mix(in srgb, var(--brand-accent), transparent 83%),
      transparent 34%
    ),
    linear-gradient(139deg, var(--brand-surface-start), var(--brand-surface-end) 72%);
}

.login-presentation::before,
.login-presentation::after {
  position: absolute;
  z-index: -1;
  pointer-events: none;
  content: '';
}

.login-presentation::before {
  inset: 0;
  opacity: 0.48;
  background:
    linear-gradient(90deg, transparent 49.88%, rgba(255, 255, 255, 0.045) 50%, transparent 50.12%),
    linear-gradient(rgba(255, 255, 255, 0.026) 1px, transparent 1px);
  background-size:
    104px 100%,
    100% 9px;
  mask-image: linear-gradient(90deg, #000, transparent 88%);
}

.login-presentation::after {
  top: -20%;
  right: -18%;
  width: min(52vw, 710px);
  aspect-ratio: 1;
  border: 1px solid color-mix(in srgb, var(--brand-accent), transparent 74%);
  border-radius: 50%;
  box-shadow:
    0 0 0 58px color-mix(in srgb, var(--brand-node), transparent 96%),
    0 0 0 132px color-mix(in srgb, var(--brand-accent), transparent 97%);
  opacity: 0.72;
  transform: rotate(-20deg);
}

.presentation-scene {
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

.scanline-texture {
  position: absolute;
  inset: 0;
  opacity: 0.18;
  background: repeating-linear-gradient(
    0deg,
    transparent 0,
    transparent 5px,
    rgba(255, 255, 255, 0.022) 6px
  );
  mask-image: linear-gradient(90deg, transparent, #000 40%, transparent);
}

.perspective-grid {
  position: absolute;
  right: -34%;
  bottom: -58%;
  left: -28%;
  height: 86%;
  opacity: 0.58;
  background-image:
    linear-gradient(color-mix(in srgb, var(--brand-accent), transparent 76%) 1px, transparent 1px),
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--brand-accent), transparent 76%) 1px,
      transparent 1px
    );
  background-position: 0 0;
  background-size: 46px 46px;
  transform: perspective(940px) rotateX(67deg) translateY(8%);
  transform-origin: center bottom;
  mask-image: linear-gradient(to bottom, transparent 0, #000 28%, transparent 96%);
  animation: grid-flow 14s linear infinite;
}

.signal-rail {
  position: absolute;
  opacity: 0.46;
}

.signal-rail--horizontal {
  top: 31%;
  right: 0;
  width: 66%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--brand-accent) 38%, transparent 86%);
  box-shadow: 0 0 18px color-mix(in srgb, var(--brand-accent), transparent 55%);
  animation: rail-glow 5s ease-in-out infinite;
}

.signal-rail--vertical {
  top: 31%;
  right: 19%;
  width: 1px;
  height: 52%;
  background: linear-gradient(transparent, var(--brand-node) 24%, transparent 88%);
  box-shadow: 0 0 16px color-mix(in srgb, var(--brand-node), transparent 54%);
}

.data-node {
  position: absolute;
  width: 10px;
  height: 10px;
  border: 2px solid var(--brand-surface-start);
  border-radius: 2px;
  background: var(--brand-node);
  box-shadow: 0 0 24px color-mix(in srgb, var(--brand-node), transparent 32%);
}

.data-node--upper {
  top: calc(31% - 4px);
  right: calc(19% - 4px);
  animation: node-flash 3.2s ease-in-out infinite;
}

.data-node--lower {
  right: calc(19% - 4px);
  bottom: 16.5%;
  width: 7px;
  height: 7px;
  background: var(--brand-accent);
  box-shadow: 0 0 20px color-mix(in srgb, var(--brand-accent), transparent 38%);
  animation: node-flash 3.2s ease-in-out -1.6s infinite;
}

.hologram-stage {
  position: absolute;
  top: 13%;
  right: -7%;
  width: min(53vw, 690px);
  height: min(61vh, 620px);
  min-height: 480px;
  perspective: 1000px;
  transform-style: preserve-3d;
  animation: stage-float 11s ease-in-out infinite;
}

.hologram-stage__halo {
  position: absolute;
  top: 15%;
  right: 16%;
  width: 56%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--brand-accent), transparent 88%),
    color-mix(in srgb, var(--brand-node), transparent 96%) 58%,
    transparent 72%
  );
  filter: blur(6px);
  transform: translateZ(-80px);
  animation: halo-breathe 7s ease-in-out infinite;
}

.wireframe-sphere {
  position: absolute;
  top: 15%;
  right: 17%;
  width: clamp(224px, 25vw, 330px);
  aspect-ratio: 1;
  transform-style: preserve-3d;
  filter: drop-shadow(0 0 24px color-mix(in srgb, var(--brand-accent), transparent 68%));
  animation: sphere-drift 14s ease-in-out infinite;
}

.sphere-shell,
.sphere-ring {
  position: absolute;
  inset: 0;
  display: block;
  border: 1px solid color-mix(in srgb, var(--brand-accent), transparent 56%);
  border-radius: 50%;
  transform-style: preserve-3d;
}

.sphere-shell--outer {
  opacity: 0.84;
  transform: rotateX(68deg) rotateZ(-28deg);
}

.sphere-shell--inner {
  inset: 17%;
  border-color: color-mix(in srgb, var(--brand-node), transparent 42%);
  box-shadow: inset 0 0 22px color-mix(in srgb, var(--brand-node), transparent 86%);
  transform: rotateY(73deg) rotateZ(18deg);
}

.sphere-ring {
  inset: 4%;
}

.sphere-ring--one {
  border-color: color-mix(in srgb, var(--brand-accent), transparent 38%);
  transform: rotateX(74deg) rotateZ(25deg);
  animation: orbit-one 8s linear infinite;
}

.sphere-ring--two {
  inset: 12%;
  border-color: color-mix(in srgb, var(--brand-node), transparent 31%);
  transform: rotateY(67deg) rotateZ(-16deg);
  animation: orbit-two 12s linear infinite;
}

.sphere-ring--three {
  inset: 24%;
  border-color: rgba(255, 255, 255, 0.25);
  transform: rotateX(48deg) rotateY(42deg);
  animation: orbit-three 10s linear infinite;
}

.orbit-node {
  position: absolute;
  top: 50%;
  left: -4px;
  width: 8px;
  height: 8px;
  border: 1px solid var(--hero-foreground);
  border-radius: 2px;
  background: var(--brand-accent);
  box-shadow: 0 0 14px var(--brand-accent);
  transform: translateY(-50%);
}

.orbit-node--two {
  left: auto;
  right: -4px;
  background: var(--brand-node);
  box-shadow: 0 0 14px var(--brand-node);
}

.orbit-node--three {
  top: auto;
  bottom: -4px;
  left: 50%;
  width: 6px;
  height: 6px;
  background: var(--hero-foreground);
  box-shadow: 0 0 14px var(--hero-foreground);
  transform: translateX(-50%);
}

.sphere-core {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 17%;
  aspect-ratio: 1;
  border: 1px solid color-mix(in srgb, var(--hero-foreground), transparent 25%);
  border-radius: 50%;
  background: radial-gradient(
    circle at 38% 34%,
    var(--hero-foreground),
    var(--brand-accent) 26%,
    var(--brand-node) 58%,
    transparent 72%
  );
  box-shadow:
    0 0 22px var(--brand-accent),
    0 0 62px color-mix(in srgb, var(--brand-node), transparent 42%);
  transform: translate(-50%, -50%) translateZ(32px);
  animation: core-pulse 4s ease-in-out infinite;
}

.hologram-prism {
  --prism-size: 114px;
  --prism-half: calc(var(--prism-size) / 2);
  position: absolute;
  width: var(--prism-size);
  height: var(--prism-size);
  transform-style: preserve-3d;
}

.hologram-prism--primary {
  right: 1%;
  bottom: 11%;
  animation: prism-turn-primary 16s ease-in-out infinite;
}

.hologram-prism--secondary {
  --prism-size: 62px;
  top: 8%;
  right: 66%;
  opacity: 0.72;
  animation: prism-turn-secondary 11s ease-in-out infinite;
}

.prism-face {
  position: absolute;
  inset: 0;
  display: block;
  border: 1px solid color-mix(in srgb, var(--brand-accent), transparent 30%);
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--brand-accent), transparent 68%),
      color-mix(in srgb, var(--brand-node), transparent 88%)
    ),
    repeating-linear-gradient(
      0deg,
      transparent 0,
      transparent 11px,
      color-mix(in srgb, var(--hero-foreground), transparent 89%) 12px
    );
  box-shadow: inset 0 0 24px color-mix(in srgb, var(--brand-accent), transparent 72%);
  backface-visibility: visible;
}

.prism-face--front {
  transform: translateZ(var(--prism-half));
}

.prism-face--back {
  transform: rotateY(180deg) translateZ(var(--prism-half));
}

.prism-face--right {
  transform: rotateY(90deg) translateZ(var(--prism-half));
}

.prism-face--left {
  transform: rotateY(-90deg) translateZ(var(--prism-half));
}

.prism-face--top {
  transform: rotateX(90deg) translateZ(var(--prism-half));
}

.prism-face--bottom {
  transform: rotateX(-90deg) translateZ(var(--prism-half));
}

.scene-particle {
  position: absolute;
  width: 4px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--brand-accent);
  box-shadow: 0 0 12px var(--brand-accent);
}

.scene-particle--one {
  top: 18%;
  left: 12%;
  animation: particle-one 8s ease-in-out infinite;
}

.scene-particle--two {
  top: 64%;
  right: 22%;
  width: 7px;
  background: var(--brand-node);
  box-shadow: 0 0 14px var(--brand-node);
  animation: particle-two 10s ease-in-out -3s infinite;
}

.scene-particle--three {
  right: 4%;
  bottom: 29%;
  animation: particle-two 7s ease-in-out -5s infinite;
}

.scene-particle--four {
  bottom: 18%;
  left: 27%;
  width: 3px;
  background: var(--hero-foreground);
  box-shadow: 0 0 12px var(--hero-foreground);
  animation: particle-one 9s ease-in-out -2s infinite;
}

.presentation-content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 50px 8.5% 42px;
}

.login-logo {
  --cyber-logo-mark-size: 56px;
  --cyber-logo-wordmark-size: 19px;
  --cyber-logo-descriptor-size: 8px;
}

.manifesto {
  max-width: 650px;
  margin: auto 0;
  padding: 46px 0;
}

.manifesto > p {
  margin: 0 0 25px;
  color: var(--brand-accent);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.25em;
}

.manifesto h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(44px, 5vw, 72px);
  font-weight: 800;
  letter-spacing: -0.055em;
  line-height: 1.12;
  text-wrap: balance;
}

.manifesto h1 em {
  color: var(--brand-accent);
  font-style: normal;
  text-shadow: 0 0 34px color-mix(in srgb, var(--brand-accent), transparent 68%);
}

.manifesto > span {
  display: block;
  max-width: 510px;
  margin-top: 28px;
  color: var(--hero-muted);
  font-size: 14px;
  line-height: 1.9;
}

.manifesto ol {
  display: flex;
  gap: 36px;
  margin: 44px 0 0;
  padding: 0;
  list-style: none;
  color: var(--hero-muted);
  font-size: 11px;
}

.manifesto li {
  display: grid;
  gap: 8px;
}

.manifesto li b {
  color: var(--brand-accent);
  font-size: 9px;
  letter-spacing: 0.12em;
}

.presentation-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.signature {
  color: var(--hero-meta);
  font-size: 8px;
  font-weight: 650;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

@keyframes grid-flow {
  to {
    background-position: 0 46px;
  }
}

@keyframes rail-glow {
  0%,
  100% {
    opacity: 0.32;
    transform: scaleX(0.92);
    transform-origin: right;
  }

  50% {
    opacity: 0.94;
    transform: scaleX(1);
  }
}

@keyframes node-flash {
  0%,
  100% {
    filter: brightness(0.9);
    transform: scale(0.82) rotate(0deg);
  }

  50% {
    filter: brightness(1.35);
    transform: scale(1.18) rotate(45deg);
  }
}

@keyframes stage-float {
  0%,
  100% {
    transform: translate3d(0, 0, 0) rotateZ(-1deg);
  }

  50% {
    transform: translate3d(-10px, -16px, 0) rotateZ(1.5deg);
  }
}

@keyframes stage-float-compact {
  0%,
  100% {
    transform: scale(0.82) translate3d(0, 0, 0) rotateZ(-1deg);
  }

  50% {
    transform: scale(0.82) translate3d(-10px, -16px, 0) rotateZ(1.5deg);
  }
}

@keyframes halo-breathe {
  0%,
  100% {
    opacity: 0.62;
    transform: translateZ(-80px) scale(0.9);
  }

  50% {
    opacity: 1;
    transform: translateZ(-80px) scale(1.12);
  }
}

@keyframes sphere-drift {
  0%,
  100% {
    transform: rotateX(-11deg) rotateY(8deg) translate3d(0, 0, 0);
  }

  50% {
    transform: rotateX(5deg) rotateY(-10deg) translate3d(-7px, -11px, 22px);
  }
}

@keyframes orbit-one {
  to {
    transform: rotateX(74deg) rotateZ(385deg);
  }
}

@keyframes orbit-two {
  to {
    transform: rotateY(67deg) rotateZ(-376deg);
  }
}

@keyframes orbit-three {
  to {
    transform: rotateX(48deg) rotateY(42deg) rotateZ(360deg);
  }
}

@keyframes core-pulse {
  0%,
  100% {
    filter: brightness(0.92);
    transform: translate(-50%, -50%) translateZ(32px) scale(0.86);
  }

  50% {
    filter: brightness(1.3);
    transform: translate(-50%, -50%) translateZ(46px) scale(1.12);
  }
}

@keyframes prism-turn-primary {
  0%,
  100% {
    transform: translate3d(0, 0, 0) rotateX(-22deg) rotateY(20deg) rotateZ(-5deg);
  }

  50% {
    transform: translate3d(-20px, -34px, 56px) rotateX(28deg) rotateY(218deg) rotateZ(19deg);
  }
}

@keyframes prism-turn-secondary {
  0%,
  100% {
    transform: translate3d(0, 0, 0) rotateX(20deg) rotateY(-12deg);
  }

  50% {
    transform: translate3d(18px, 22px, 30px) rotateX(196deg) rotateY(170deg);
  }
}

@keyframes particle-one {
  0%,
  100% {
    opacity: 0.2;
    transform: translate3d(0, 0, 0) scale(0.7);
  }

  50% {
    opacity: 1;
    transform: translate3d(38px, -56px, 42px) scale(1.3);
  }
}

@keyframes particle-two {
  0%,
  100% {
    opacity: 0.18;
    transform: translate3d(0, 0, 0) scale(0.65);
  }

  50% {
    opacity: 1;
    transform: translate3d(-46px, 33px, 58px) scale(1.25);
  }
}

@media (max-width: 1180px) {
  .hologram-stage {
    right: -22%;
    opacity: 0.78;
    transform-origin: right center;
    animation-name: stage-float-compact;
  }

  .manifesto ol {
    gap: 22px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .perspective-grid,
  .signal-rail,
  .data-node,
  .hologram-stage,
  .hologram-stage__halo,
  .wireframe-sphere,
  .sphere-ring,
  .sphere-core,
  .hologram-prism,
  .scene-particle {
    animation: none;
  }

  .hologram-stage {
    transform: none;
  }

  .hologram-prism--primary {
    transform: rotateX(-22deg) rotateY(20deg) rotateZ(-5deg);
  }

  .hologram-prism--secondary {
    transform: rotateX(20deg) rotateY(-12deg);
  }
}

@media (max-width: 900px) {
  .login-presentation {
    display: none;
  }
}
</style>
