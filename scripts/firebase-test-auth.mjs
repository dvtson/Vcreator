const adminEmail='sondvt@vrbank.com.vn';
const adminUid='FBeRHAsHrNPeuhmfUF6yeF8QmMs2';
export const fixturePassword='qa-fixture-password';
function token(uid,email){
 const now=Math.floor(Date.now()/1000);const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
 return `${encode({alg:'RS256',kid:'isolated-test'})}.${encode({iss:'https://securetoken.google.com/vrb-creator',aud:'vrb-creator',auth_time:now,user_id:uid,sub:uid,iat:now,exp:now+3600,email,email_verified:true,firebase:{identities:{email:[email]},sign_in_provider:'password'}})}.isolated-test-signature`;
}
export async function installMockFirebaseAuth(context){
 const stats={authRequests:0,cloudRequests:0,unexpected:[]};
 await context.route('https://identitytoolkit.googleapis.com/**',async route=>{
  stats.authRequests++;const request=route.request();let body={};try{body=request.postDataJSON()||{};}catch{}
  const endpoint=new URL(request.url()).pathname;
  const respond=async data=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  if(endpoint.endsWith('accounts:signInWithPassword')){
   if(body.password!==fixturePassword)return route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({error:{code:400,message:'INVALID_LOGIN_CREDENTIALS'}})});
   const email=body.email;const uid=email===adminEmail?adminUid:'unauthorized-test-user';
   return respond({localId:uid,email,idToken:token(uid,email),refreshToken:'isolated-refresh-token',expiresIn:'3600',registered:true});
  }
  if(endpoint.endsWith('accounts:lookup')){
   const decoded=JSON.parse(Buffer.from(String(body.idToken).split('.')[1],'base64url').toString());
   return respond({users:[{localId:decoded.sub,email:decoded.email,emailVerified:true,providerUserInfo:[{providerId:'password',email:decoded.email,federatedId:decoded.email}],createdAt:'1792544400000',lastLoginAt:String(Date.now()),passwordUpdatedAt:1792544400000,validSince:'1792544400'}]});
  }
  if(endpoint.endsWith('recaptchaConfig'))return respond({recaptchaEnforcementState:[]});
  if(endpoint.endsWith('projects'))return respond({projectId:'vrb-creator',authorizedDomains:['localhost','127.0.0.1','vrb-creator.firebaseapp.com']});
  stats.unexpected.push(endpoint);await route.abort();
 });
 await context.route('https://securetoken.googleapis.com/**',async route=>{stats.unexpected.push('unexpected token refresh');await route.abort();});
 await context.route('https://firestore.googleapis.com/**',async route=>{stats.cloudRequests++;await route.abort();});
 return stats;
}
