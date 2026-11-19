import {CSV_SAMPLE,REPORT_SAMPLE,cleanCsv,toCsv,toJson,summarizeTasks,reportHtml} from './demo-core.js';
const $ = (id) => document.getElementById(id);
let csvResult = null, taskReport = null, inquiryContext = null, submitting = false;
function message(id, text, error = false) { const el = $(id); el.textContent = text; el.classList.toggle('error', error); }
function event(name) { fetch('/api/events', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event:name}),keepalive:true}).catch(()=>{}); }
function download(name, text, type) { const blob = new Blob([text], {type}); const link = document.createElement('a'); const url=URL.createObjectURL(blob); link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000); }
function table(result) {
  const el = document.createElement('table'); const head = el.createTHead().insertRow();
  result.headers.forEach(h=>{const th=document.createElement('th');th.scope='col';th.textContent=h;head.append(th);});
  const body=el.createTBody();result.rows.slice(0,30).forEach(row=>{const tr=body.insertRow();row.forEach(v=>{const td=tr.insertCell();td.textContent=v;});});
  const wrap=$('csv-result');wrap.replaceChildren(el);
  if(result.rows.length>30){const p=document.createElement('p');p.className='field-help';p.textContent='미리보기는 처음 30행입니다. 다운로드에는 전체 결과가 포함됩니다.';wrap.append(p);}
}
function runCsv(track = true) {
  try {
    csvResult=cleanCsv($('csv-input').value,{trim:$('trim-values').checked,dedupe:$('remove-duplicates').checked});table(csvResult);
    const stats=$('csv-stats').querySelectorAll('strong');[csvResult.rows.length,csvResult.duplicates,csvResult.changedCells].forEach((v,i)=>stats[i].textContent=String(v));
    $('csv-download').disabled=csvResult.formulaCells>0;$('json-download').disabled=false;
    $('formula-warning').hidden=!csvResult.formulaCells;
    $('formula-warning').textContent=csvResult.formulaCells+'개 값이 수식처럼 해석될 수 있어 이 데모에서는 CSV 다운로드를 막았습니다. JSON은 원래 문자열로 받을 수 있습니다. 모든 스프레드시트의 해석을 보장하지 않습니다.';
    message('csv-message','결과 '+csvResult.rows.length+'행을 만들었습니다. 빈 행 '+csvResult.blanks+'개를 제외했습니다.');
    if(track)event('csv_run');
  } catch(error){csvResult=null;$('csv-download').disabled=true;$('json-download').disabled=true;message('csv-message',error.message,true);}
}
function renderReport(report, all = false) {
  const output=$('report-output');output.replaceChildren();const title=document.createElement('h4');title.className='report-title';title.textContent='업무표 요약';output.append(title);
  const stats=document.createElement('div');stats.className='report-summary';
  [['전체',report.total],...Object.entries(report.counts)].forEach(([name,n])=>{const box=document.createElement('div'),number=document.createElement('strong'),label=document.createElement('span');number.textContent=String(n);label.textContent=name;box.append(number,label);stats.append(box);});output.append(stats);
  const list=document.createElement('ul');list.className='report-list';(all ? report.rows : report.rows.slice(0,50)).forEach(row=>{const item=document.createElement('li');item.textContent='['+row[2]+'] '+row[0]+' · '+row[1];list.append(item);});output.append(list);
  if(!all && report.rows.length>50){const p=document.createElement('p');p.className='field-help';p.textContent='화면에는 처음 50개 작업을 표시합니다. HTML 다운로드에는 전체 목록이 포함됩니다.';output.append(p);}
}
function runReport() {
  try {taskReport=summarizeTasks($('report-input').value);renderReport(taskReport);$('report-download').disabled=false;$('report-print').disabled=false;message('report-message',taskReport.total+'개 작업을 요약했습니다.');event('report_run');}
  catch(error){taskReport=null;$('report-download').disabled=true;$('report-print').disabled=true;message('report-message',error.message,true);}
}
function selectTab(kind) {
  ['csv','report'].forEach(k=>{const active=k===kind;$('tab-'+k).setAttribute('aria-selected',String(active));$('tab-'+k).tabIndex=active?0:-1;$('panel-'+k).hidden=!active;});
}
$('csv-input').value=CSV_SAMPLE;$('report-input').value=REPORT_SAMPLE;
$('csv-sample').addEventListener('click',()=>{$('csv-input').value=CSV_SAMPLE;message('csv-message','합성 샘플을 넣었습니다. 정리 결과를 확인해 보세요.');});
$('report-sample').addEventListener('click',()=>{$('report-input').value=REPORT_SAMPLE;message('report-message','합성 샘플을 넣었습니다.');});
$('csv-run').addEventListener('click',()=>runCsv());$('report-run').addEventListener('click',runReport);
$('csv-download').addEventListener('click',()=>{if(csvResult&&!csvResult.formulaCells)download('morupatch-cleaned.csv',toCsv(csvResult),'text/csv;charset=utf-8');});
$('json-download').addEventListener('click',()=>{if(csvResult)download('morupatch-cleaned.json',toJson(csvResult),'application/json;charset=utf-8');});
$('report-download').addEventListener('click',()=>{if(taskReport)download('morupatch-report.html',reportHtml(taskReport),'text/html;charset=utf-8');});
$('report-print').addEventListener('click',()=>{if(taskReport){renderReport(taskReport,true);window.print();renderReport(taskReport);}});
['csv','report'].forEach(kind=>{$('tab-'+kind).addEventListener('click',()=>selectTab(kind));$('tab-'+kind).addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const next=kind==='csv'?'report':'csv';selectTab(next);$('tab-'+next).focus();}});});
$('csv-file').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;if(file.size>200000){message('csv-message','200KB 이하의 UTF-8 CSV를 선택해 주세요.',true);return;}try{$('csv-input').value=new TextDecoder('utf-8',{fatal:true}).decode(await file.arrayBuffer());message('csv-message','파일 내용을 브라우저에서 읽었습니다. 정리 결과를 확인해 보세요.');}catch{message('csv-message','파일을 읽지 못했습니다. UTF-8 텍스트인지 확인해 주세요.',true);}});
document.querySelectorAll('[data-service]').forEach(link=>link.addEventListener('click',()=>{$('contact-service').value=link.dataset.service;}));
let opened=false;$('inquiry-form').addEventListener('focusin',()=>{if(!opened){opened=true;event('contact_open');}});
async function context() {
  if(inquiryContext)return inquiryContext;const response=await fetch('/api/context',{cache:'no-store'});
  if(!response.ok)throw new Error('문의 연결을 준비하지 못했습니다. 잠시 뒤 다시 시도해 주세요.');
  inquiryContext=await response.json();return inquiryContext;
}
$('inquiry-form').addEventListener('submit',async e=>{
  e.preventDefault();if(submitting||!e.target.reportValidity())return;submitting=true;$('inquiry-submit').disabled=true;message('inquiry-status','문의 내용을 안전하게 접수하고 있습니다.');
  try {
    const proof=await context();
    const payload={requestId:proof.requestId,issuedAt:proof.issuedAt,token:proof.token,name:$('contact-name').value.trim(),email:$('contact-email').value.trim(),service:$('contact-service').value,budget:$('contact-budget').value,message:$('contact-message').value.trim(),consent:$('contact-consent').checked,website:$('contact-website').value};
    const response=await fetch('/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const result=await response.json().catch(()=>({}));
    if(!response.ok){if(response.status===403)inquiryContext=null;throw new Error(result.error||'접수하지 못했습니다. 잠시 뒤 다시 시도해 주세요.');}
    message('inquiry-status','문의가 접수되었습니다. 접수번호: '+result.receipt+'. 내용을 확인한 뒤 안내하겠습니다.');
    $('inquiry-submit').textContent='문의 접수 완료';
  } catch(error){message('inquiry-status',error.message,true);$('inquiry-submit').disabled=false;submitting=false;}
});
