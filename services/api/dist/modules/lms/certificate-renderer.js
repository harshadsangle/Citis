"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderCertificateSvg = renderCertificateSvg;
function escapeXml(value) {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function text(value) {
    return escapeXml(value.trim());
}
function renderCertificateSvg(input) {
    const learnerName = text(input.learnerName);
    const courseTitle = text(input.courseTitle);
    const courseCode = text(input.courseCode);
    const institutionName = text(input.institutionName);
    const certificateNumber = text(input.certificateNumber);
    const issueDate = text(input.issueDate);
    const verificationId = text(input.verificationId);
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="860" viewBox="0 0 1200 860" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="surface" x1="600" y1="38" x2="600" y2="822" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFFFFF"/><stop offset="1" stop-color="#F8FCFD"/>
    </linearGradient>
    <linearGradient id="accent" x1="96" y1="0" x2="1104" y2="0" gradientUnits="userSpaceOnUse">
      <stop stop-color="#1E5AA8" stop-opacity="0"/><stop offset=".18" stop-color="#1E5AA8"/>
      <stop offset=".5" stop-color="#F9E8A2"/><stop offset=".82" stop-color="#FF7A00"/>
      <stop offset="1" stop-color="#FF7A00" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="rule" x1="330" y1="0" x2="870" y2="0" gradientUnits="userSpaceOnUse">
      <stop stop-color="#8FC1D5" stop-opacity="0"/><stop offset=".2" stop-color="#8FC1D5"/>
      <stop offset=".8" stop-color="#8FC1D5"/><stop offset="1" stop-color="#8FC1D5" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="860" fill="#F5FAFC"/>
  <rect x="20" y="20" width="1160" height="820" rx="28" stroke="#E4F0F4" stroke-width="2"/>
  <rect x="38" y="38" width="1124" height="784" rx="20" fill="url(#surface)" stroke="#78B3CB" stroke-width="4"/>
  <rect x="50" y="50" width="1100" height="760" rx="13" stroke="#D9EBF1" stroke-width="2"/>
  <path d="M40 190H1160" stroke="#D5E8EE" stroke-width="3"/>
  <path d="M96 190H1104" stroke="url(#accent)" stroke-width="3"/>
  <circle cx="1060" cy="108" r="36" fill="#FFF9E5" stroke="#E2B52C" stroke-width="3"/>
  <circle cx="1060" cy="108" r="27" stroke="#F0D77C" stroke-width="2"/>
  <path d="M1044 108L1055 119L1077 94" stroke="#C9930F" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="600" y="282" text-anchor="middle" fill="#C49319" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" letter-spacing="7">CITIS LEARNING CREDENTIAL</text>
  <path d="M520 304H680" stroke="#F1D978" stroke-width="3" stroke-linecap="round"/>
  <text x="600" y="356" text-anchor="middle" fill="#123D5C" font-family="Arial, Helvetica, sans-serif" font-size="50" font-weight="700">Certificate of Achievement</text>
  <text x="600" y="410" text-anchor="middle" fill="#6D8794" font-family="Arial, Helvetica, sans-serif" font-size="20">This certificate is presented to</text>
  <text x="600" y="480" text-anchor="middle" fill="#0F4C81" font-family="Georgia, serif" font-size="42" font-weight="700">${learnerName}</text>
  <path d="M330 515H870" stroke="url(#rule)" stroke-width="3"/>
  <text x="600" y="552" text-anchor="middle" fill="#123D5C" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700">${courseTitle}</text>
  <text x="600" y="582" text-anchor="middle" fill="#6D8794" font-family="Arial, Helvetica, sans-serif" font-size="16">${courseCode} · ${institutionName}</text>
  <path d="M80 630H1120" stroke="#D9EBF1" stroke-width="2"/>
  <path d="M80 630H350" stroke="#F2D978" stroke-width="3"/>
  <g transform="translate(102 668)">
    <text fill="#6D8794" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" letter-spacing="2.5">ISSUED BY</text>
    <text y="28" fill="#123D5C" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="700">CITIS InfoTech</text>
  </g>
  <g transform="translate(420 668)">
    <text fill="#6D8794" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" letter-spacing="2.5">CERTIFICATE NUMBER</text>
    <text y="28" fill="#123D5C" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700">${certificateNumber}</text>
    <text y="52" fill="#6D8794" font-family="Arial, Helvetica, sans-serif" font-size="13">Issued ${issueDate}</text>
  </g>
  <g transform="translate(850 650)">
    <rect width="220" height="106" rx="10" fill="#F4FAFC" stroke="#C9E1E9" stroke-width="2"/>
    <text x="110" y="30" text-anchor="middle" fill="#123D5C" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700">VERIFY ONLINE</text>
    <text x="110" y="56" text-anchor="middle" fill="#6D8794" font-family="Arial, Helvetica, sans-serif" font-size="11">Verification ID</text>
    <text x="110" y="77" text-anchor="middle" fill="#123D5C" font-family="Arial, Helvetica, sans-serif" font-size="12">${verificationId}</text>
  </g>
</svg>`;
}
//# sourceMappingURL=certificate-renderer.js.map