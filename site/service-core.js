export const LABELS={new:'신규',reviewing:'검토 중',done:'처리 완료'};
export function initialRequests(){return [{id:1,name:'샘플 고객 A',goal:'상담 신청과 관리자 확인 화면이 필요해요.',status:'reviewing',history:[{kind:'sample',from:null,to:'reviewing'}]},{id:2,name:'샘플 고객 B',goal:'예약 서비스를 작은 MVP로 검증하고 싶어요.',status:'new',history:[{kind:'sample',from:null,to:'new'}]}];}
function text(value,min,max){if(typeof value!=='string')throw new Error('텍스트로 입력해 주세요.');const v=value.trim();if(v.length<min||v.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v))throw new Error(`입력 길이(${min}~${max}자)와 문자를 확인해 주세요.`);return v;}
export function addRequest(rows,name,goal){if(rows.length>=50)throw new Error('데모는 최대 50개 요청까지 등록합니다. 샘플을 초기화해 주세요.');const item={id:Math.max(0,...rows.map(r=>r.id))+1,name:text(name,1,40),goal:text(goal,10,300),status:'new',history:[{kind:'created',from:null,to:'new'}]};return [...rows,item];}
export function transitionRequest(rows,id,next){const item=rows.find(r=>r.id===id);if(!item)throw new Error('요청을 찾을 수 없습니다.');if(!((item.status==='new'&&next==='reviewing')||(item.status==='reviewing'&&next==='done')))throw new Error('현재 상태에서 가능한 변경을 선택해 주세요.');return rows.map(r=>r.id===id?{...r,status:next,history:[...r.history,{kind:'status',from:item.status,to:next}]}:r);}
export function selectRequests(rows,status='all',query=''){
 if(status!=='all'&&!Object.hasOwn(LABELS,status))throw new Error('지원하지 않는 필터입니다.');
 if(typeof query!=='string')throw new Error('찾기어는 텍스트로 입력해 주세요.');
 const terms=query.normalize('NFC').toLowerCase().trim().split(/\s+/).filter(Boolean);
 return rows.filter(row=>{
  if(status!=='all'&&row.status!==status)return false;
  const searchable=`${row.id} ${row.name} ${row.goal}`.normalize('NFC').toLowerCase();
  return terms.every(term=>/^#\d+$/.test(term)?'#'+row.id===term:searchable.includes(term));
 });
}
