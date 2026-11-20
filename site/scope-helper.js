import {buildScopeDraft,getScopeGuidance} from './scope-core.js';
const $=id=>document.getElementById(id);
const fields=['audience','features','operations','environment','acceptance'];
let draft=null;
function message(text,error=false){$('scope-status').textContent=text;$('scope-status').classList.toggle('error',error);}
function invalidate(){draft=null;$('scope-preview').value='';$('scope-use').disabled=true;message('항목이 바뀌었습니다. 초안을 다시 만들어 주세요.');}
fields.forEach(key=>['input','change'].forEach(event=>$('scope-'+key).addEventListener(event,invalidate)));
function refreshGuidance(){
 try{
  const guidance=getScopeGuidance($('scope-kind').value);$('scope-guidance').textContent=guidance.tip;
  ['features','operations','environment','acceptance'].forEach(key=>{$('scope-'+key).placeholder=guidance[key];});
 }catch(error){message(error.message,true);}
}
$('scope-kind').addEventListener('change',()=>{invalidate();refreshGuidance();});
$('scope-build').addEventListener('click',()=>{
 try{
  draft=buildScopeDraft({kind:$('scope-kind').value,...Object.fromEntries(fields.map(key=>[key,$('scope-'+key).value]))});
  $('scope-preview').value=draft;$('scope-use').disabled=false;message('초안을 만들었습니다. 내용 확인 후 빈 문의칸에 옮길 수 있습니다. 아직 접수되지 않았습니다.');
 }catch(error){draft=null;$('scope-preview').value='';$('scope-use').disabled=true;message(error.message,true);}
});
$('scope-use').addEventListener('click',()=>{
 if(!draft)return;
 const target=$('contact-message');
 if(target.value!==''){message('이미 작성한 문의 내용은 바꾸지 않았습니다. 직접 합치거나 문의칸을 비운 뒤 다시 옮겨 주세요.',true);return;}
 target.value=draft;target.dispatchEvent(new Event('input',{bubbles:true}));$('scope-use').disabled=true;
 message('문의칸에 옮겼습니다. 수정·연락처·작업 종류·동의를 직접 확인하고 별도 보내기 버튼을 눌러야 접수됩니다.');target.focus();
});
refreshGuidance();$('scope-fields').disabled=false;
