/* =====================================================================
   mapa.js — Mapa ilustrado de acesso (sugestão do roteiro)
   Comunidades fictícias longe do hospital. Feito em SVG puro,
   então funciona offline e fica nítido em qualquer tela.
   ===================================================================== */

const MAPA_SVG = `
<svg viewBox="0 0 800 520" xmlns="http://www.w3.org/2000/svg" role="img"
     aria-label="Mapa: comunidades isoladas longe do hospital, conectadas ao posto de saúde pela IA">
  <!-- terreno -->
  <rect width="800" height="520" fill="#dcedc8"/>
  <!-- rio -->
  <path d="M-10 380 C 120 330, 200 420, 330 360 S 560 250, 640 300 S 760 360, 820 320"
        fill="none" stroke="#64b5f6" stroke-width="34" stroke-linecap="round"/>
  <path d="M-10 380 C 120 330, 200 420, 330 360 S 560 250, 640 300 S 760 360, 820 320"
        fill="none" stroke="#90caf9" stroke-width="14" stroke-linecap="round"/>

  <!-- florestas -->
  <g fill="#7cb342">
    <circle cx="90" cy="110" r="34"/><circle cx="135" cy="85" r="28"/><circle cx="60" cy="150" r="24"/>
    <circle cx="420" cy="470" r="34"/><circle cx="470" cy="455" r="26"/><circle cx="380" cy="490" r="22"/>
    <circle cx="300" cy="120" r="26"/><circle cx="335" cy="95" r="20"/>
    <circle cx="720" cy="470" r="30"/><circle cx="660" cy="490" r="22"/>
  </g>

  <!-- estrada de terra longa até o hospital -->
  <path d="M 230 250 C 380 200, 480 140, 680 110" fill="none" stroke="#a1887f"
        stroke-width="10" stroke-dasharray="2 16" stroke-linecap="round"/>

  <!-- HOSPITAL (longe) -->
  <g transform="translate(640 50)">
    <rect width="120" height="90" rx="10" fill="#fff" stroke="#9e9e9e" stroke-width="3"/>
    <rect x="48" y="16" width="24" height="56" fill="#c62828"/>
    <rect x="32" y="32" width="56" height="24" fill="#c62828"/>
    <text x="60" y="120" text-anchor="middle" font-size="22" font-weight="700" fill="#1f2328" font-family="sans-serif">Hospital</text>
  </g>
  <text x="470" y="160" font-size="20" font-weight="700" fill="#5d4037" font-family="sans-serif" transform="rotate(-14 470 160)">120 km · 4 h de estrada</text>

  <!-- POSTO DE SAÚDE (centro, com o totem) -->
  <g transform="translate(170 200)">
    <rect width="120" height="80" rx="10" fill="#fff" stroke="#c62828" stroke-width="4"/>
    <polygon points="-8,4 60,-36 128,4" fill="#c62828"/>
    <rect x="50" y="22" width="20" height="40" fill="#c62828"/>
    <rect x="40" y="32" width="40" height="20" fill="#c62828"/>
    <text x="60" y="108" text-anchor="middle" font-size="20" font-weight="700" fill="#1f2328" font-family="sans-serif">Posto de Saúde</text>
  </g>

  <!-- sinal da IA chegando ao posto -->
  <g>
    <circle cx="230" cy="80" r="38" fill="#fff" stroke="#c62828" stroke-width="4"/>
    <text x="230" y="92" text-anchor="middle" font-size="34" font-family="sans-serif">🤖</text>
    <text x="230" y="30" text-anchor="middle" font-size="18" font-weight="700" fill="#c62828" font-family="sans-serif">IA</text>
    <line x1="230" y1="120" x2="230" y2="160" stroke="#c62828" stroke-width="5" class="sinal"/>
  </g>

  <!-- COMUNIDADES -->
  <g font-family="sans-serif" font-size="18" font-weight="700" fill="#1f2328">
    <!-- ribeirinha -->
    <g transform="translate(70 420)">
      <polygon points="0,30 25,8 50,30" fill="#8d6e63"/><rect x="6" y="30" width="38" height="26" fill="#d7ccc8"/>
      <polygon points="56,36 76,18 96,36" fill="#8d6e63"/><rect x="61" y="36" width="30" height="20" fill="#d7ccc8"/>
      <text x="48" y="82" text-anchor="middle">Comunidade ribeirinha</text>
    </g>
    <!-- aldeia -->
    <g transform="translate(520 360)">
      <ellipse cx="25" cy="40" rx="26" ry="18" fill="#a1887f"/><ellipse cx="80" cy="44" rx="22" ry="15" fill="#a1887f"/>
      <text x="52" y="86" text-anchor="middle">Aldeia</text>
    </g>
    <!-- sítio -->
    <g transform="translate(40 230)">
      <polygon points="0,30 25,8 50,30" fill="#8d6e63"/><rect x="6" y="30" width="38" height="26" fill="#d7ccc8"/>
      <text x="25" y="80" text-anchor="middle">Sítios</text>
    </g>
  </g>

  <!-- caminhos das comunidades até o posto (curtos) -->
  <g fill="none" stroke="#c62828" stroke-width="5" stroke-linecap="round" class="sinal">
    <path d="M 130 420 C 140 360, 170 320, 205 290"/>
    <path d="M 560 360 C 460 330, 340 300, 290 260"/>
    <path d="M 95 260 L 168 250"/>
  </g>

  <!-- legenda -->
  <g transform="translate(470 470)" font-family="sans-serif" font-size="16" fill="#1f2328">
    <rect x="-10" y="-22" width="330" height="44" rx="10" fill="#fff" opacity=".9"/>
    <line x1="0" y1="0" x2="30" y2="0" stroke="#c62828" stroke-width="5" class="sinal"/>
    <text x="40" y="6">orientação rápida com apoio da IA</text>
  </g>
</svg>`;
