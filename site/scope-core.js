const GUIDANCE={
 undecided:{label:'범위 상담 · 아직 미정',tip:'무엇을 해결하고 싶은지부터 적어주세요. 기술·저장·권한이 정해지지 않았다면 선택 항목은 비워도 됩니다.',features:'예: 신청을 받고 처리 결과를 확인하고 싶습니다.',operations:'예: 저장·로그인·알림이 필요한지 상담하고 싶습니다.',environment:'예: 신규인지 기존 서비스 개선인지 아직 미정',acceptance:'예: 먼저 확인하고 싶은 결과와 목표 시점, 또는 협의 필요'},
 mvp:{label:'신규 웹서비스 · MVP',tip:'첫 사용자가 어떤 행동을 끝내야 하는지 적어주세요. 첫 버전과 나중으로 미룰 기능, 실제 서버 저장이 필요한지를 구분하면 좋습니다.',features:'예: 고객 신청 입력 → 운영자 확인. 결제는 다음 버전',operations:'예: 서버 저장 필요, 고객은 자기 신청만 확인, 알림은 미정',environment:'예: 신규 개발, 배포 계정과 도메인은 상담 후 결정',acceptance:'예: 신청 후 운영 목록에 보이고 재접속해도 유지. 목표 시점은 협의'},
 admin:{label:'관리자 페이지 · 운영 도구',tip:'관리할 대상·상태 순서와 누가 조회/수정할 수 있는지 적어주세요. 기존 API/저장소가 있다면 연결 가능 여부만 설명하고 인증정보는 보내지 마세요.',features:'예: 예약 목록 → 담당자 검토 → 처리 완료',operations:'예: 담당자는 상태 변경, 조회 전용 역할은 수정 불가',environment:'예: 기존 API 있음, 기술 구성과 테스트 환경은 협의',acceptance:'예: 조회 전용 역할의 수정 거부와 상태 변경 기록 확인. 시점은 협의'},
 improve:{label:'기존 웹서비스 기능 개선',tip:'문제 화면과 재현 순서, 현재 결과·원하는 결과를 나란히 적어주세요. 고객 자료·로그 원본이나 비밀번호 대신 민감한 내용을 뺀 설명을 사용하세요.',features:'예: 신청 화면에서 어떤 입력/순서로 문제가 생기는지, 기대 결과',operations:'예: 기존 저장/권한 유지, 서버 요청 영향 범위는 확인 필요',environment:'예: 기존 서비스 기술 구성, 재현 기기·브라우저와 테스트 환경',acceptance:'예: 기존 정상 신청은 유지하고 잘못된 입력 안내 후 재시도 가능. 목표 시점은 협의'}
};
Object.values(GUIDANCE).forEach(Object.freeze);
export function getScopeGuidance(kind){
 if(typeof kind!=='string'||!Object.hasOwn(GUIDANCE,kind))throw new Error('상담 목적을 목록에서 선택해 주세요.');
 return GUIDANCE[kind];
}
const FIELDS=[
 ['audience','사용자와 목적',200,true],
 ['features','먼저 필요한 기능 1~3개',600,true],
 ['operations','저장·권한·외부 연동',400,false],
 ['environment','기존 서비스·개발 환경',300,false],
 ['acceptance','검수 조건·목표 시점',400,false]
];
export function buildScopeDraft(values){
 if(!values||typeof values!=='object'||Array.isArray(values))throw new Error('범위 항목을 확인해 주세요.');
 const guidance=getScopeGuidance(values.kind===undefined?'undecided':values.kind);
 const sections=FIELDS.map(([key,label,max,required])=>{
  const raw=values[key]??'';
  if(typeof raw!=='string')throw new Error(label+'은 텍스트로 입력해 주세요.');
  if(raw.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(raw))throw new Error(label+'의 길이('+max+'자 이하)와 문자를 확인해 주세요.');
  const text=raw.trim();
  if(required&&!text)throw new Error(label+'을 입력해 주세요.');
  return label+'\n'+(text||'미정 — 상담이 필요합니다.');
 });
 return '개발 범위 상담 초안 (확정 견적·계약이 아닙니다.)\n상담 목적: '+guidance.label+'\n\n'+sections.join('\n\n');
}
