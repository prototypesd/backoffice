/* Documentos demo del expediente (SVG embebidos, sin peticiones) */

function svg(s: string) {
  return `data\:image/svg+xml,${encodeURIComponent(s.replace(/\s+/g, " "))}`;
}

export type DemoDoc = {
  id: string;
  title: string;
  short: string;
  demo: string;
};

const ANVERSO = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 856 540" width="856" height="540">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E9F7FF"/><stop offset="1" stop-color="#FFF4E3"/></linearGradient></defs>
<rect width="856" height="540" rx="32" fill="url(#g)" stroke="#C9D3DA" stroke-width="2"/>
<rect width="856" height="78" fill="#00AEFF"/>
<text x="40" y="50" font-family="Arial" font-size="24" font-weight="700" fill="#000">DOCUMENTO DE IDENTIDAD</text>
<text x="816" y="50" font-family="Arial" font-size="16" font-weight="700" fill="#000" text-anchor="end">DEMO · ANVERSO</text>
<rect x="40" y="112" width="200" height="250" rx="14" fill="#D4F1FF" stroke="#80D7FF" stroke-width="2"/>
<circle cx="140" cy="205" r="52" fill="#F2C9A5"/>
<path d="M88 190 q52 -80 104 0 q-10 -40 -52 -42 q-42 2 -52 42z" fill="#2B1D14"/>
<path d="M56 362 q0 -86 84 -86 q84 0 84 86z" fill="#24313B"/>
<text x="280" y="140" font-family="Arial" font-size="12" fill="#4A5560" letter-spacing="1">NOMBRES</text>
<text x="280" y="162" font-family="Arial" font-size="18" font-weight="700" fill="#0F1A22">HUGO</text>
<text x="280" y="200" font-family="Arial" font-size="12" fill="#4A5560" letter-spacing="1">APELLIDOS</text>
<text x="280" y="222" font-family="Arial" font-size="18" font-weight="700" fill="#0F1A22">SOLIZ LÓPEZ</text>
<text x="280" y="260" font-family="Arial" font-size="12" fill="#4A5560" letter-spacing="1">N.º DE DOCUMENTO</text>
<text x="280" y="282" font-family="Arial" font-size="18" font-weight="700" fill="#0F1A22">5125096</text>
<text x="560" y="260" font-family="Arial" font-size="12" fill="#4A5560" letter-spacing="1">FECHA DE NACIMIENTO</text>
<text x="560" y="282" font-family="Arial" font-size="18" font-weight="700" fill="#0F1A22">20/02/2000</text>
<text x="280" y="320" font-family="Arial" font-size="12" fill="#4A5560" letter-spacing="1">LUGAR DE EMISIÓN</text>
<text x="280" y="342" font-family="Arial" font-size="18" font-weight="700" fill="#0F1A22">LA PAZ</text>
<text x="560" y="320" font-family="Arial" font-size="12" fill="#4A5560" letter-spacing="1">SEXO</text>
<text x="560" y="342" font-family="Arial" font-size="18" font-weight="700" fill="#0F1A22">M</text>
<path d="M290 430 c30 -40 50 30 80 -6 s40 -20 60 10 s30 -30 60 -4" fill="none" stroke="#0F1A22" stroke-width="3" stroke-linecap="round"/>
<text x="290" y="470" font-family="Arial" font-size="12" fill="#4A5560" letter-spacing="1">FIRMA DEL TITULAR</text>
<circle cx="746" cy="430" r="58" fill="none" stroke="#FF9900" stroke-width="3" stroke-dasharray="6 6"/>
<text x="746" y="436" font-family="Arial" font-size="14" font-weight="700" fill="#A35F00" text-anchor="middle">SELLO DEMO</text>
<text x="428" y="270" font-family="Arial" font-size="110" font-weight="700" fill="#0F1A22" fill-opacity="0.06" text-anchor="middle" transform="rotate(-20 428 270)">MUESTRA</text>
</svg>`);

const REVERSO = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 856 540" width="856" height="540">
<rect width="856" height="540" rx="32" fill="#F7FBFE" stroke="#C9D3DA" stroke-width="2"/>
<rect width="856" height="78" fill="#00AEFF"/>
<text x="40" y="50" font-family="Arial" font-size="24" font-weight="700" fill="#000">DOCUMENTO DE IDENTIDAD</text>
<text x="816" y="50" font-family="Arial" font-size="16" font-weight="700" fill="#000" text-anchor="end">DEMO · REVERSO</text>
<text x="40" y="140" font-family="Arial" font-size="12" fill="#4A5560" letter-spacing="1">DOMICILIO</text>
<text x="40" y="162" font-family="Arial" font-size="18" font-weight="700" fill="#0F1A22">AV. HECTOR ORMACHEA 5362, LA PAZ</text>
<text x="40" y="200" font-family="Arial" font-size="12" fill="#4A5560" letter-spacing="1">ESTADO CIVIL</text>
<text x="40" y="222" font-family="Arial" font-size="18" font-weight="700" fill="#0F1A22">SOLTERO</text>
<text x="300" y="200" font-family="Arial" font-size="12" fill="#4A5560" letter-spacing="1">OCUPACIÓN</text>
<text x="300" y="222" font-family="Arial" font-size="18" font-weight="700" fill="#0F1A22">CONTROL</text>
<text x="40" y="260" font-family="Arial" font-size="12" fill="#4A5560" letter-spacing="1">FECHA DE EMISIÓN</text>
<text x="40" y="282" font-family="Arial" font-size="18" font-weight="700" fill="#0F1A22">05/11/2026</text>
<text x="300" y="260" font-family="Arial" font-size="12" fill="#4A5560" letter-spacing="1">VÁLIDO HASTA</text>
<text x="300" y="282" font-family="Arial" font-size="18" font-weight="700" fill="#0F1A22">05/11/2036</text>
<rect x="626" y="120" width="180" height="200" rx="14" fill="#EEF3F7" stroke="#C9D3DA" stroke-width="2"/>
<ellipse cx="716" cy="220" rx="20" ry="28" fill="none" stroke="#6B7A86" stroke-width="2"/>
<ellipse cx="716" cy="220" rx="29" ry="39" fill="none" stroke="#6B7A86" stroke-width="2"/>
<ellipse cx="716" cy="220" rx="38" ry="50" fill="none" stroke="#6B7A86" stroke-width="2"/>
<ellipse cx="716" cy="220" rx="47" ry="61" fill="none" stroke="#6B7A86" stroke-width="2"/>
<ellipse cx="716" cy="220" rx="56" ry="72" fill="none" stroke="#6B7A86" stroke-width="2"/>
<ellipse cx="716" cy="220" rx="65" ry="83" fill="none" stroke="#6B7A86" stroke-width="2"/>
<text x="716" y="345" font-family="Arial" font-size="12" fill="#4A5560" text-anchor="middle" letter-spacing="1">HUELLA</text>
<g fill="#0F1A22">
${Array.from({ length: 52 }, (_, i) => `<rect x="${40 + i * 12}" y="400" width="${i % 4 === 0 ? 3 : 6}" height="80"/>`).join("")}
</g>
<text x="40" y="505" font-family="Arial" font-size="14" fill="#24313B" letter-spacing="3">DEMO 5125096 · KIVO · MOLO PARA PRUEBAS</text>
<text x="428" y="270" font-family="Arial" font-size="110" font-weight="700" fill="#0F1A22" fill-opacity="0.06" text-anchor="middle" transform="rotate(-20 428 270)">MUESTRA</text>
</svg>`);

const SELFIE = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
<defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D4F1FF"/><stop offset="1" stop-color="#AAE4FF"/></linearGradient></defs>
<rect width="600" height="800" rx="24" fill="url(#b)"/>
<rect x="60" y="40" width="480" height="40" rx="20" fill="#FFFFFF" fill-opacity="0.8"/>
<text x="300" y="66" font-family="Arial" font-size="16" font-weight="700" fill="#0F1A22" text-anchor="middle">SELFIE DEL CLIENTE · DEMO</text>
<path d="M80 800 q0 -230 220 -230 q220 0 220 230z" fill="#24313B"/>
<path d="M255 560 h90 v50 q-45 30 -90 0z" fill="#E7B58E"/>
<ellipse cx="300" cy="430" rx="120" ry="145" fill="#F2C9A5"/>
<path d="M178 420 q-6 -170 122 -172 q128 2 122 172 q-12 -90 -122 -96 q-110 6 -122 96z" fill="#2B1D14"/>
<ellipse cx="255" cy="440" rx="11" ry="13" fill="#2B1D14"/>
<ellipse cx="345" cy="440" rx="11" ry="13" fill="#2B1D14"/>
<path d="M265 510 q35 26 70" fill="none" stroke="#9C4F3A" stroke-width="6" stroke-linecap="round"/>
<rect x="150" y="690" width="300" height="56" rx="28" fill="#1E7A46"/>
<text x="300" y="726" font-family="Arial" font-size="20" font-weight="700" fill="#FFFFFF" text-anchor="middle">Rostro detectado ✓</text>
</svg>`);

const BIC = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 820" width="620" height="820">
<rect width="620" height="820" fill="#FFFFFF" stroke="#C9D3DA" stroke-width="2"/>
<rect width="620" height="12" fill="#00AEFF"/>
<text x="60" y="80" font-family="Arial" font-size="14" font-weight="700" fill="#0079B3" letter-spacing="2">KIVO · DOCUMENTO DEMO</text>
<text x="60" y="130" font-family="Arial" font-size="26" font-weight="700" fill="#0F1A22">Autorización de consulta</text>
<text x="60" y="164" font-family="Arial" font-size="26" font-weight="700" fill="#0F1A22">Buró / BIC</text>
<text x="60" y="214" font-family="Arial" font-size="15" fill="#24313B">Autorizo la consulta de mi histórico crediticio.</text>
${[250, 276, 302, 354, 380, 406].map((y) => `<rect x="60" y="${y}" width="500" height="10" rx="5" fill="#C9D3DA"/>`).join("")}
<text x="60" y="470" font-family="Arial" font-size="12" fill="#4A5560" letter-spacing="1">NOMBRE COMPLETO</text>
<text x="60" y="492" font-family="Arial" font-size="18" font-weight="700" fill="#0F1A22">HUGO SOLIZ LÓPEZ</text>
<text x="60" y="530" font-family="Arial" font-size="12" fill="#4A5560" letter-spacing="1">CARNET DE IDENTIDAD</text>
<text x="60" y="552" font-family="Arial" font-size="18" font-weight="700" fill="#0F1A22">5125096</text>
<text x="340" y="530" font-family="Arial" font-size="12" fill="#4A5560" letter-spacing="1">FECHA</text>
<text x="340" y="552" font-family="Arial" font-size="18" font-weight="700" fill="#0F1A22">05/11/2026</text>
<path d="M70 680 c30 -50 60 30 90 -8 s40 -24 70 12 s340 -34 70 -6" fill="none" stroke="#0F1A22" stroke-width="3" stroke-linecap="round"/>
<line x1="60" y1="700" x2="340" y2="700" stroke="#6B7A86" stroke-width="2"/>
<text x="60" y="724" font-family="Arial" font-size="12" fill="#4A5560" letter-spacing="1">FIRMA DEL SOLICITANTE</text>
<circle cx="470" cy="670" r="64" fill="none" stroke="#FF9900" stroke-width="3" stroke-dasharray="6 6"/>
<text x="470" y="676" font-family="Arial" font-size="14" font-weight="700" fill="#A35F00" text-anchor="middle">SELLO DEMO</text>
</svg>`);

const BURO = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 820" width="620" height="820">
<rect width="620" height="820" fill="#FFFFFF" stroke="#C9D3DA" stroke-width="2"/>
<rect width="620" height="96" fill="#0F1A22"/>
<text x="40" y="44" font-family="Arial" font-size="14" font-weight="700" fill="#80D7FF">REPORTE DE INFORMACIÓN CREDITICIA</text>
<text x="40" y="74" font-family="Arial" font-size="22" font-weight="700" fill="#FFFFFF">Buró / BIC · Documento demo</text>
<text x="40" y="136" font-family="Arial" font-size="12" fill="#4A5560">TITULAR</text>
<text x="40" y="158" font-family="Arial" font-size="18" font-weight="700" fill="#0F1A22">HUGO SOLIZ LÓPEZ</text>
<text x="340" y="136" font-family="Arial" font-size="12" fill="#4A5560">CARNET</text>
<text x="340" y="158" font-family="Arial" font-size="18" font-weight="700" fill="#0F1A22">5125096</text>
<text x="40" y="196" font-family="Arial" font-size="12" fill="#4A5560">FECHA DE CONSULTA</text>
<text x="40" y="218" font-family="Arial" font-size="18" font-weight="700" fill="#0F1A22">23/11/2026</text>
<text x="340" y="196" font-family="Arial" font-size="12" fill="#4A5560">ENTIDADES</text>
<text x="340" y="218" font-family="Arial" font-size="18" font-weight="700" fill="#0F1A22">1</text>
<rect x="40" y="250" width="540" height="120" rx="14" fill="#F1FAF4" stroke="#BFE3CC" stroke-width="2"/>
<text x="64" y="284" font-family="Arial" font-size="13" font-weight="700" fill="#14603A">CALIFICACIÓN (DEMO)</text>
<text x="64" y="344" font-family="Arial" font-size="54" font-weight="700" fill="#1E7A46">A</text>
<text x="150" y="300" font-family="Arial" font-size="15" fill="#24313B">Sin atrasos en los últimos 24 meses</text>
<text x="150" y="326" font-family="Arial" font-size="15" fill="#24313B">Sin deudas castigadas ni en ejecución</text>
<text x="150" y="352" font-family="Arial" font-size="15" fill="#24313B">Endeudamiento: Bs 200 / mes</text>
<text x="40" y="412" font-family="Arial" font-size="16" font-weight="700" fill="#0F1A22">Detalle de deudas</text>
<rect x="40" y="426" width="540" height="36" fill="#EEF3F7"/>
<text x="52" y="449" font-family="Arial" font-size="12" font-weight="700" fill="#4A5560">ENTIDAD</text>
<text x="190" y="449" font-family="Arial" font-size="12" font-weight="700" fill="#4A5560">TIPO</text>
<text x="290" y="449" font-family="Arial" font-size="12" font-weight="700" fill="#4A5560">ESTADO</text>
<text x="400" y="449" font-family="Arial" font-size="12" font-weight="700" fill="#4A5560">CUOTA</text>
<text x="490" y="449" font-family="Arial" font-size="12" font-weight="700" fill="#4A5560">MORA</text>
<text x="52" y="492" font-family="Arial" font-size="14" fill="#0F1A22">Banco Demo</text>
<text x="190" y="492" font-family="Arial" font-size="14" fill="#0F1A22">Consumo</text>
<text x="290" y="492" font-family="Arial" font-size="14" font-weight="700" fill="#14603A">Vigente</text>
<text x="400" y="492" font-family="Arial" font-size="14" fill="#0F1A22">Bs 200</text>
<text x="490" y="492" font-family="Arial" font-size="14" fill="#0F1A22">0 días</text>
<line x1="40" y1="510" x2="580" y2="510" stroke="#DCE3E8"/>
<text x="40" y="552" font-family="Arial" font-size="16" font-weight="700" fill="#0F1A22">Historial de pagos (24 meses)</text>
${Array.from({ length: 22 }, (_, i) => `<rect x="${40 + i * 24.5}" y="568" width="18" height="28" rx="3" fill="#1E7A46"/>`).join("")}
<text x="40" y="620" font-family="Arial" font-size="12" fill="#4A5560">Cada barra es un mes · verde = pago puntual</text>
<rect x="40" y="660" width="540" height="9" rx="4" fill="#DCE3E8"/>
<rect x="40" y="682" width="540" height="9" rx="4" fill="#DCE3E8"/>
<rect x="40" y="704" width="360" height="9" rx="4" fill="#DCE3E8"/>
<rect x="40" y="726" width="540" height="9" rx="4" fill="#DCE3E8"/>
<rect x="40" y="748" width="540" height="9" rx="4" fill="#DCE3E8"/>
<text x="310" y="410" font-family="Arial" font-size="88" font-weight="700" fill="#0F1A22" fill-opacity="0.06" text-anchor="middle" transform="rotate(-20 310 410)">MUESTRA</text>
</svg>`);

export const DOCS: DemoDoc[] = [
  { id: "anverso", title: "Carnet de identidad (anverso)", short: "Carnet · anverso", demo: ANVERSO },
  { id: "reverso", title: "Carnet de identidad (reverso)", short: "Carnet · reverso", demo: REVERSO },
  { id: "selfie", title: "Selfie del cliente", short: "Selfie", demo: SELFIE },
  { id: "bic", title: "Autorización Buró/BIC", short: "Autorización BIC", demo: BIC },
];

export const BURO_DEMO = BURO;
