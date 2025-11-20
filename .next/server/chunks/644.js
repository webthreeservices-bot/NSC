"use strict";exports.id=644,exports.ids=[644],exports.modules={11646:(a,b,c)=>{c.d(b,{J1:()=>h,Ky:()=>i,fC:()=>g,mW:()=>e,tV:()=>f});let d=c(35924).createTransport({host:process.env.SMTP_HOST,port:parseInt(process.env.SMTP_PORT||"587"),secure:!1,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});async function e(a,b,c){await d.sendMail({from:process.env.SMTP_FROM,to:a,subject:`ROI Payment - Month ${c}`,html:`
      <h2>ROI Payment Received</h2>
      <p>Your monthly ROI payment has been credited to your account.</p>
      <p><strong>Amount:</strong> ${b} USDT</p>
      <p><strong>Month:</strong> ${c}/12</p>
    `})}async function f(a,b,c){await d.sendMail({from:process.env.SMTP_FROM,to:a,subject:"Package Activated Successfully",html:`
      <h2>Package Activated</h2>
      <p>Your investment package has been activated successfully.</p>
      <p><strong>Amount:</strong> ${b} USDT</p>
      <p><strong>Type:</strong> ${c}</p>
      <p><strong>Duration:</strong> 12 months</p>
    `})}async function g(a,b,c){await d.sendMail({from:process.env.SMTP_FROM,to:a,subject:"Withdrawal Processed",html:`
      <h2>Withdrawal Completed</h2>
      <p>Your withdrawal has been processed successfully.</p>
      <p><strong>Amount:</strong> ${b} USDT</p>
      <p><strong>Transaction Hash:</strong> ${c}</p>
    `})}async function h(a,b){let c=`http://localhost:3000/auth/reset-password?token=${b}`;await d.sendMail({from:process.env.SMTP_FROM,to:a,subject:"Password Reset Request",html:`
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${c}">${c}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `})}async function i(a){await d.sendMail({from:process.env.SMTP_FROM,to:process.env.ADMIN_EMAIL,subject:"New Withdrawal Request",html:`
      <h2>New Withdrawal Request</h2>
      <p><strong>User:</strong> ${a.userId}</p>
      <p><strong>Amount:</strong> ${a.amount} USDT</p>
      <p><strong>Net Amount:</strong> ${a.netAmount} USDT</p>
      <p><strong>Wallet:</strong> ${a.walletAddress}</p>
      <p><strong>Network:</strong> ${a.network}</p>
    `})}},22374:(a,b,c)=>{c.d(b,{Ab:()=>h,DS:()=>i,PK:()=>k,Xe:()=>e,jj:()=>f,oL:()=>j,q_:()=>g});var d=c(40686);function e(a,b){return a*({NEO:.03,NEURAL:.04,ORACLE:.05,TEST_1:.03,TEST_2:.04,TEST_3:.05})[b]}function f(a){if(1===a)return d.Rn.TEST_1;if(2===a)return d.Rn.TEST_2;if(3===a)return d.Rn.TEST_3;if(a>=500&&a<=3e3)return d.Rn.NEO;if(a>=5e3&&a<=1e4)return d.Rn.NEURAL;if(a>=25e3&&a<=5e4)return d.Rn.ORACLE;throw Error("Invalid package amount")}function g(a){return({NEO:50,NEURAL:100,ORACLE:150,TEST_1:1,TEST_2:2,TEST_3:3})[a]}function h(a){return .1*a}function i(a){if(!a)return!0;let b=new Date;return b.setDate(b.getDate()-30),a<=b}function j(a,b){let c=new Date(a||b);return c.setDate(c.getDate()+30),c}function k(a){return[1,2,3,500,1e3,3e3,5e3,1e4,25e3,5e4].includes(a)}},27972:(a,b,c)=>{c.d(b,{A:()=>e});let d=/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i,e=function(a){return"string"==typeof a&&d.test(a)}},40686:(a,b,c)=>{c.d(b,{II:()=>i,Rn:()=>g,lg:()=>h});var d,e,f,g=((d={}).NEO="NEO",d.NEURAL="NEURAL",d.ORACLE="ORACLE",d.TEST_1="TEST_1",d.TEST_2="TEST_2",d.TEST_3="TEST_3",d),h=((e={}).BEP20="BEP20",e.TRC20="TRC20",e),i=((f={}).ROI_ONLY="ROI_ONLY",f.CAPITAL="CAPITAL",f.FULL_AMOUNT="FULL_AMOUNT",f)},57692:(a,b,c)=>{c.d(b,{A:()=>h});var d=c(55511),e=c.n(d);let f=new Uint8Array(256),g=f.length;function h(){return g>f.length-16&&(e().randomFillSync(f),g=0),f.slice(g,g+=16)}},74771:(a,b,c)=>{c.d(b,{A:()=>f});var d=c(57692),e=c(77760);let f=function(a,b,c){let f=(a=a||{}).random||(a.rng||d.A)();if(f[6]=15&f[6]|64,f[8]=63&f[8]|128,b){c=c||0;for(let a=0;a<16;++a)b[c+a]=f[a];return b}return(0,e.A)(f)}},77760:(a,b,c)=>{c.d(b,{A:()=>f});var d=c(27972);let e=[];for(let a=0;a<256;++a)e.push((a+256).toString(16).substr(1));let f=function(a,b=0){let c=(e[a[b+0]]+e[a[b+1]]+e[a[b+2]]+e[a[b+3]]+"-"+e[a[b+4]]+e[a[b+5]]+"-"+e[a[b+6]]+e[a[b+7]]+"-"+e[a[b+8]]+e[a[b+9]]+"-"+e[a[b+10]]+e[a[b+11]]+e[a[b+12]]+e[a[b+13]]+e[a[b+14]]+e[a[b+15]]).toLowerCase();if(!(0,d.A)(c))throw TypeError("Stringified UUID is invalid");return c}},90644:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{F3:()=>j,a4:()=>k});var e=c(86165),f=c(22374),g=c(11646),h=c(74771),i=a([e]);async function j(){let a,b=new Date;try{a=await (0,e.jG)(15e3)}catch(a){throw console.error("❌ Failed to get database connection for ROI distribution:",a),Error("Database connection timeout during ROI distribution initialization")}let c=[];try{if(await a.query("BEGIN"),!(await a.query("SELECT pg_try_advisory_xact_lock(123456789) as acquired")).rows[0].acquired){console.log("⚠️ Another ROI distribution process is already running. Skipping."),await a.query("ROLLBACK"),a.release();return}console.log("\uD83D\uDD12 Advisory lock acquired for ROI distribution");let d=`
      SELECT p.*, u.email as user_email, p."roiPercentage"
      FROM "Package" p
      JOIN "User" u ON p."userId" = u.id
      WHERE p.status = 'ACTIVE'
      AND p."isExpired" = false
      AND p."nextRoiDate" <= $1
      AND p."roiPaidCount" < 12
      FOR UPDATE OF p SKIP LOCKED
    `;c=(await a.query(d,[b])).rows,console.log(`Processing ROI for ${c.length} packages`)}catch(b){throw await a.query("ROLLBACK"),a.release(),b}let d=0,i=0,j=0;for(let e of c){let k=null;try{if(!e.id||!e.userId||!e.amount||!e.roiPercentage){console.error(`❌ Invalid package data for package ${e.id}:`,e),i++;continue}let l=Number(e.amount),m=Number(e.roiPercentage);if(isNaN(l)||isNaN(m)||l<=0||m<=0){console.error(`❌ Invalid numeric values for package ${e.id}:`,{amount:l,roiPercentage:m}),i++;continue}let n=Number((l*m/100).toFixed(2)),o=e.roiPaidCount+1;if(n<=0||isNaN(n)){console.error(`❌ Invalid ROI amount calculated for package ${e.id}: ${n}`),i++;continue}k=a;let p=(0,h.A)();await k.query(`INSERT INTO "RoiPayment" ("id", "packageId", "userId", "amount", "monthNumber", "paymentDate", "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,[p,e.id,e.userId,n,o,b,b]);let q=(0,h.A)();await k.query(`INSERT INTO "Transaction" ("id", "userId", "type", "amount", "status", "description", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,[q,e.userId,"ROI_PAYMENT",n,"COMPLETED",`ROI payment - Month ${o}`,b,b]);let r=(0,f.oL)(b,new Date(e.investmentDate)),s=o>=12;await k.query(`UPDATE "Package"
         SET "totalRoiPaid" = "totalRoiPaid" + $1,
             "roiPaidCount" = $2,
             "lastRoiDate" = $3,
             "nextRoiDate" = $4,
             "status" = $5,
             "isExpired" = $6,
             "updatedAt" = $7
         WHERE "id" = $8`,[n,o,b,s?null:r,s?"EXPIRED":"ACTIVE",s,b,e.id]),d++,console.log(`✅ Paid ROI: ${n} USDT to user ${e.userId} for package ${e.id} (${d}/${c.length})`);try{await (0,g.mW)(e.user_email,n,o)}catch(a){j++,console.error(`⚠️  Failed to send email for package ${e.id}:`,a)}}catch(a){i++,console.error(`❌ Error processing ROI for package ${e.id}:`,a)}}try{await a.query("COMMIT"),console.log(`✅ ROI distribution completed: ${d} successful, ${i} failed, ${j} email failures out of ${c.length} total packages`),i>0&&console.warn(`⚠️  WARNING: ${i} packages failed to process. Manual review recommended.`),j>0&&console.warn(`⚠️  WARNING: ${j} notification emails failed to send.`)}catch(b){throw await a.query("ROLLBACK"),console.error("❌ Failed to commit ROI distribution transaction:",b),b}finally{a.release()}}async function k(a){try{let b=await e.Ay.query("SELECT * FROM get_user_balance($1)",[a]);if(0===b.rows.length)return{roiBalance:0,referralBalance:0,levelBalance:0,totalBalance:0,lockedCapital:0};let c=b.rows[0],d=Number(c.roiBalance??0)||0,f=Number(c.referralBalance??0)||0,g=Number(c.levelBalance??0)||0,h=Number(c.totalBalance??0)||0,i=Number(c.lockedCapital??0)||0;if(isNaN(d)||isNaN(f)||isNaN(g)||isNaN(h)||isNaN(i))throw console.error("❌ Invalid optimized balance values:",{roiBalance:d,referralBalance:f,levelBalance:g,totalBalance:h,lockedCapital:i}),Error("Invalid optimized balance calculation: NaN detected");return{roiBalance:Number(d.toFixed(2)),referralBalance:Number(f.toFixed(2)),levelBalance:Number(g.toFixed(2)),totalBalance:Math.max(0,Number(h.toFixed(2))),lockedCapital:Number(i.toFixed(2))}}catch(b){return console.error("❌ Error getting optimized balance:",b),console.log("⚠️  Falling back to original method..."),l(a)}}async function l(a){let b;for(let c=1;c<=3;c++)try{c>1&&(console.log(`⚠️  Retry attempt ${c}/3 for balance calculation`),await new Promise(a=>setTimeout(a,1e3*c)));let b=`
      SELECT COALESCE(SUM("amount")::numeric, 0) as sum_amount 
      FROM "Transaction" 
      WHERE "userId" = $1 
      AND "type" = 'ROI_PAYMENT' 
      AND "status" = 'COMPLETED'
    `,d=`
      SELECT COALESCE(SUM("amount")::numeric, 0) as sum_amount
      FROM "Earning"
      WHERE "userId" = $1
      AND "earningType" = 'DIRECT_REFERRAL'::"EarningType"
    `,f=`
      SELECT COALESCE(SUM("amount")::numeric, 0) as sum_amount
      FROM "Earning"
      WHERE "userId" = $1
      AND "earningType" = 'LEVEL_INCOME'::"EarningType"
    `,g=`
      SELECT COALESCE(SUM("amount")::numeric, 0) as sum_amount 
      FROM "Withdrawal" 
      WHERE "userId" = $1 
      AND "status" = 'COMPLETED'
    `,h=`
      SELECT COALESCE(SUM("amount")::numeric, 0) as sum_amount 
      FROM "Package" 
      WHERE "userId" = $1 
      AND "status" = 'ACTIVE'
    `,[i,j,k,l,m]=await Promise.all([e.Ay.query(b,[a]),e.Ay.query(d,[a]),e.Ay.query(f,[a]),e.Ay.query(g,[a]),e.Ay.query(h,[a])]),n=Number(i.rows[0]?.sum_amount??0)||0,o=Number(j.rows[0]?.sum_amount??0)||0,p=Number(k.rows[0]?.sum_amount??0)||0,q=Number(l.rows[0]?.sum_amount??0)||0,r=Number(m.rows[0]?.sum_amount??0)||0;if(isNaN(n)||isNaN(o)||isNaN(p)||isNaN(q)||isNaN(r))throw console.error("❌ Invalid balance values detected:",{roiBalance:n,referralBalance:o,levelBalance:p,totalWithdrawn:q,lockedCapital:r}),Error("Invalid balance calculation: NaN detected");let s=Number((n+o+p).toFixed(2)),t=Number((s-q).toFixed(2));return{roiBalance:Number(n.toFixed(2)),referralBalance:Number(o.toFixed(2)),levelBalance:Number(p.toFixed(2)),totalBalance:Math.max(0,t),lockedCapital:Number(r.toFixed(2))}}catch(a){if(b=a,console.error(`❌ Error calculating withdrawable balance (attempt ${c}/3):`,a),3===c)throw Error(`Failed to calculate balance after 3 attempts: ${a instanceof Error?a.message:"Unknown error"}`)}throw b}e=(i.then?(await i)():i)[0],d()}catch(a){d(a)}})}};