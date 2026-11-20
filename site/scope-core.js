const FIELDS=[
 ['audience','사용자와 목적',200,true],
 ['features','먼저 필요한 기능 1~3개',600,true],
 ['operations','저장·권한·외부 연동',400,false],
 ['environment','기존 서비스·개발 환경',300,false],
 ['acceptance','검수 조건·목표 시점',400,false]
];
export function buildScopeDraft(values){
 if(!values||typeof values!=='object'||Array.isArray(values))throw new Error('범위 항목을 확인해 주세요.');
 const sections=FIELDS.map(([key,label,max,required])=>{
  const raw=values[key]??'';
  if(typeof raw!=='string')throw new Error(label+'은 텍스트로 입력해 주세요.');
  if(raw.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(raw))throw new Error(label+'의 길이('+max+'자 이하)와 문자를 확인해 주세요.');
  const text=raw.trim();
  if(required&&!text)throw new Error(label+'을 입력해 주세요.');
  return label+'\n'+(text||'미정 — 상담이 필요합니다.');
 });
 return '개발 범위 상담 초안 (확정 견적·계약이 아닙니다.)\n\n'+sections.join('\n\n');
}
