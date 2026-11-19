export const CSV_SAMPLE = '상품코드,분류,상품명\n00127, 생활용품 , 텀블러\n00308,문구,노트\n00127,생활용품,텀블러\n00516, 문구 ,펜\n';
export const REPORT_SAMPLE = '분류,작업,상태\n사이트,소개 문구 정리,완료\n사이트,문의폼 점검,완료\n자동화,CSV 변환 규칙 확인,진행\n문서,사용 방법 작성,대기\n자동화,오류 항목 검토,완료\n';
export function parseCsv(text) {
  if (typeof text !== 'string') throw new Error('텍스트 형식의 CSV를 넣어주세요.');
  if (new TextEncoder().encode(text).length > 200000) throw new Error('데모에서는 200KB 이하의 UTF-8 CSV를 사용할 수 있습니다.');
  text = text.replace(/^\uFEFF/, '');
  if (!text.trim()) throw new Error('CSV를 입력하거나 합성 샘플을 넣어주세요.');
  const rows = []; let row = [], cell = '', quoted = false, closed = false, atStart = true;
  function pushCell() { row.push(cell); cell = ''; closed = false; atStart = true; }
  function pushRow() { pushCell(); rows.push(row); row = []; if (rows.length > 1001) throw new Error('데모에서는 데이터 1,000행까지 처리합니다.'); }
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else { quoted = false; closed = true; } }
      else cell += ch;
    } else if (ch === ',' ) pushCell();
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; pushRow(); }
    else if (ch === '"' && atStart) { quoted = true; atStart = false; }
    else { if (closed || ch === '"') throw new Error('따옴표 형식이 올바르지 않습니다. 쉼표가 있는 값은 큰따옴표로 감싸주세요.'); cell += ch; atStart = false; }
  }
  if (quoted) throw new Error('닫히지 않은 큰따옴표가 있습니다.');
  if (cell !== '' || row.length || closed) pushRow();
  return rows;
}
export function cleanCsv(text, {trim = true, dedupe = true} = {}) {
  const parsed = parseCsv(text); const rawHeaders = parsed.shift();
  if (!rawHeaders || !rawHeaders.length) throw new Error('첫 행에 열 이름이 필요합니다.');
  const headers = rawHeaders.map(v => trim ? v.trim() : v);
  if (headers.some(v => !v) || new Set(headers).size !== headers.length) throw new Error('비어 있거나 중복된 열 이름을 확인해 주세요.');
  let changedCells = headers.reduce((n, v, i) => n + (v !== rawHeaders[i] ? 1 : 0), 0);
  let duplicates = 0, blanks = 0; const rows = [], seen = new Set();
  parsed.forEach((raw, index) => {
    if (raw.every(v => !v.trim())) { blanks++; return; }
    if (raw.length !== headers.length) throw new Error('데이터 ' + (index + 1) + '행의 열 수가 ' + headers.length + '개와 다릅니다.');
    const values = raw.map(v => trim ? v.trim() : v);
    changedCells += values.reduce((n, v, i) => n + (v !== raw[i] ? 1 : 0), 0);
    const key = JSON.stringify(values);
    if (dedupe && seen.has(key)) { duplicates++; return; }
    seen.add(key); rows.push(values);
  });
  const formulaCells = [headers, ...rows].flat().filter(v => /^[\s]*[=+\-@\t\r]/.test(v)).length;
  return {headers, rows, duplicates, blanks, changedCells, formulaCells};
}
export function toCsv(result) {
  return '\uFEFF' + [result.headers, ...result.rows].map(row => row.map(v => '"' + String(v).replaceAll('"','""') + '"').join(',')).join('\r\n') + '\r\n';
}
export function toJson(result) {
  return JSON.stringify(result.rows.map(row => Object.fromEntries(result.headers.map((h,i) => [h,row[i]]))), null, 2);
}
export function summarizeTasks(text) {
  const result = cleanCsv(text, {trim:true,dedupe:false});
  if (result.headers.join(',') !== '분류,작업,상태') throw new Error('첫 행을 분류,작업,상태 세 열로 맞춰주세요.');
  const counts = {완료:0,진행:0,대기:0};
  result.rows.forEach((row, i) => {
    if (!row[0] || !row[1] || !Object.hasOwn(counts,row[2])) throw new Error('데이터 ' + (i+1) + '행의 분류·작업·상태(완료/진행/대기)를 확인해 주세요.');
    counts[row[2]]++;
  });
  if (!result.rows.length) throw new Error('요약할 업무가 한 행 이상 필요합니다.');
  return {rows:result.rows,counts,total:result.rows.length};
}
export function escapeHtml(value) { return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#39;"); }
export function reportHtml(report) {
  return '<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>업무표 요약 | MoruPatch Lab</title><style>body{font:16px/1.8 system-ui,sans-serif;max-width:800px;margin:50px auto;padding:0 24px;color:#111c2d}h1{font-size:30px}table{width:100%;border-collapse:collapse}td,th{padding:12px;border-bottom:1px solid #dde5e0;text-align:left}small{color:#5d6873}@media print{body{margin:0}}</style><h1>업무표 요약</h1><p>총 ' + report.total + '건 · 완료 ' + report.counts.완료 + ' / 진행 ' + report.counts.진행 + ' / 대기 ' + report.counts.대기 + '</p><table><thead><tr><th>분류</th><th>작업</th><th>상태</th></tr></thead><tbody>' + report.rows.map(row => '<tr>'+row.map(v=>'<td>'+escapeHtml(v)+'</td>').join('')+'</tr>').join('') + '</tbody></table><p><small>MoruPatch Lab 브라우저 데모에서 생성했습니다. 입력된 업무표를 요약한 결과입니다.</small></p></html>';
}
