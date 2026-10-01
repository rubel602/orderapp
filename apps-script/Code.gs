// Google Sheets backend. Sheets (Users, Orders, Sessions) are created automatically.
const HEAD = {Users:['email','salt','hash','role'], Orders:['id','email','item','qty','status','createdAt'], Sessions:['token','email','created']};
function sh(n){ if(!HEAD[n]) throw new Error('sh() is a helper: it needs a sheet name (Users, Orders or Sessions). Run setup() instead.');
  const ss=SpreadsheetApp.getActive(); let s=ss.getSheetByName(n);
  if(!s){ s=ss.insertSheet(n); s.appendRow(HEAD[n]); } return s; }
function hash(p,salt){ return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt+p)); }
function findRow(s,col,val){ const d=s.getDataRange().getValues();
  for(let i=1;i<d.length;i++) if(String(d[i][col]).toLowerCase()===String(val).toLowerCase()) return i+1; return 0; }
function safe(t){ t=String(t||'').slice(0,200); return /^[=+\-@]/.test(t)?"'"+t:t; }
function newSession(em){ const t=Utilities.getUuid(); sh('Sessions').appendRow([t,em,new Date()]); return t; }
function sessionUser(tok){ if(!tok) return null; const r=findRow(sh('Sessions'),0,tok); if(!r) return null;
  const em=sh('Sessions').getRange(r,2).getValue(); const U=sh('Users'); const ur=findRow(U,0,em);
  return ur?{email:em,row:ur,role:U.getRange(ur,4).getValue()}:null; }
// Run this ONCE from the editor (select 'setup' in the dropdown, click Run) to authorize and create the tabs.
function setup(){ Object.keys(HEAD).forEach(sh); Logger.log('Sheets ready'); }
function out(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function doPost(e){
  if(!e||!e.postData) return out({error:'Call this from the app, not from the editor'});
  const lock=LockService.getScriptLock(); lock.waitLock(15000);
  try { return out(handle(JSON.parse(e.postData.contents))); }
  catch(err){ return out({error:String(err.message||err)}); }
  finally { lock.releaseLock(); }
}
function doGet(){ return out({ok:true}); }

function handle(b){
  const U=sh('Users'), O=sh('Orders'), a=b.action;
  const em=String(b.email||'').trim().toLowerCase();
  if(a==='register'){
    if(!/^\S+@\S+\.\S+$/.test(em)) throw new Error('Invalid email');
    if(String(b.password||'').length<6) throw new Error('Password must be 6+ characters');
    if(findRow(U,0,em)) throw new Error('Email already registered');
    const salt=Utilities.getUuid(); U.appendRow([em,salt,hash(b.password,salt),'user']);
    return {token:newSession(em)};
  }
  if(a==='login'){
    const r=findRow(U,0,em); const bad=new Error('Wrong email or password'); if(!r) throw bad;
    const row=U.getRange(r,1,1,4).getValues()[0];
    if(hash(b.password,row[1])!==row[2]) throw bad;
    return {token:newSession(em)};
  }
  const me=sessionUser(b.token); if(!me) throw new Error('Please log in again');
  if(a==='me') return {email:me.email, role:me.role};
  if(a==='changePassword'){
    const row=U.getRange(me.row,1,1,4).getValues()[0];
    if(hash(b.oldPassword,row[1])!==row[2]) throw new Error('Current password is wrong');
    if(String(b.newPassword||'').length<6) throw new Error('New password must be 6+ characters');
    const salt=Utilities.getUuid(); U.getRange(me.row,2,1,2).setValues([[salt,hash(b.newPassword,salt)]]);
    return {ok:true};
  }
  if(a==='createOrder'){
    O.appendRow([Utilities.getUuid(), me.email, safe(b.item), Math.max(1,parseInt(b.qty)||1), 'PENDING', Date.now()]);
    return {ok:true};
  }
  if(a==='orders'){
    const list=O.getDataRange().getValues().slice(1)
      .filter(r=>me.role==='manager'||r[1]===me.email)
      .map(r=>({id:r[0],userEmail:r[1],item:r[2],qty:r[3],status:r[4],createdAt:r[5]}));
    return {orders:list};
  }
  if(a==='setStatus'){
    if(me.role!=='manager') throw new Error('Managers only');
    if(['APPROVED','REJECTED','SHIPPED','DELIVERED'].indexOf(b.status)<0) throw new Error('Bad status');
    const r=findRow(O,0,b.id); if(!r) throw new Error('Order not found');
    O.getRange(r,5).setValue(b.status); return {ok:true};
  }
  throw new Error('Unknown action');
}
