"use strict";(()=>{var a={};a.id=8215,a.ids=[8215,9227],a.modules={261:a=>{a.exports=require("next/dist/shared/lib/router/utils/app-paths")},1932:a=>{a.exports=require("url")},3295:a=>{a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},5486:a=>{a.exports=require("bcrypt")},7169:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{ve:()=>i,xI:()=>j});var e=c(42703),f=c.n(e),g=c(14552),h=a([g]);g=(h.then?(await h)():h)[0];let k=null;function i(){k?console.log("⚠️  Payment scanner already running"):((k=f().schedule("*/2 * * * *",async()=>{console.log("\uD83D\uDD0D Running payment scanner...");try{await g.G.scanPendingPayments()}catch(a){console.error("Payment scanner error:",a)}})).start(),console.log("✅ Payment scanner initialized (runs every 2 minutes)"))}function j(){k&&(k.stop(),k=null,console.log("\uD83D\uDED1 Payment scanner stopped"))}d()}catch(a){d(a)}})},8086:a=>{a.exports=require("module")},10846:a=>{a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},12412:a=>{a.exports=require("assert")},13734:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{Se:()=>o});var e=c(61053),f=c(39121),g=c(16542),h=c(99395),i=c(88320),j=c(7169),k=c(30148),l=c(95798),m=a([e,f,g,h,i,j,k,l]);[e,f,g,h,i,j,k,l]=m.then?(await m)():m;let p={},q=!1;function n(){console.log("[Cron Manager] Stopping all cron jobs...");try{(0,j.xI)(),Object.keys(p).forEach(a=>{p[a]&&"function"==typeof p[a].stop&&(p[a].stop(),console.log(`[Cron Manager] Stopped ${a}`))}),q=!1,console.log("[Cron Manager] All cron jobs stopped")}catch(a){console.error("[Cron Manager] Error stopping cron jobs:",a)}}function o(){let a,b,c,d;return{isInitialized:q,totalJobs:Object.keys(p).length,jobs:(a=(0,e.R0)(),b=(0,f.tW)(),c=(0,i._e)(),d=l.u.getCleanupStats(),[{name:"Payment Scanner",description:"Scans blockchain for incoming payments",schedule:"Every 2 minutes",isRunning:!a.isScanning,lastRunTime:a.lastScanTime,stats:{scanCount:a.scanCount,uptime:a.uptime}},{name:"ROI Payout",description:"Processes monthly ROI payments",schedule:"Daily at 00:00",isRunning:!b.isProcessing,lastRunTime:b.lastRunTime,stats:{totalProcessed:b.totalProcessed}},{name:"Expiration Checker",description:"Checks and processes expired packages and bots",schedule:"Daily at 01:00",isRunning:!c.isProcessing,lastRunTime:c.lastRunTime,stats:{packagesExpired:c.packagesExpired,botsExpired:c.botsExpired}},{name:"Session Management",description:"Cleans up expired sessions and monitors security",schedule:"Every 24 hours",isRunning:!d.isCurrentlyRunning,lastRunTime:d.lastCleanup,stats:{totalCleanups:d.totalCleanups,totalSessionsCleaned:d.totalSessionsCleaned,averageSessionsCleaned:d.averageSessionsCleaned}}])}}process.on("SIGINT",()=>{console.log("[Cron Manager] Received SIGINT, stopping cron jobs..."),n(),process.exit(0)}),process.on("SIGTERM",()=>{console.log("[Cron Manager] Received SIGTERM, stopping cron jobs..."),n(),process.exit(0)}),d()}catch(a){d(a)}})},14552:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{G:()=>h});var e=c(8216),f=c(33398),g=a([e,f]);[e,f]=g.then?(await g)():g;class h{static async scanPendingPayments(){try{let a=await (0,e.P)("SELECT * FROM \"PaymentRequest\" WHERE status = 'PENDING'");for(let b of(console.log(`📡 Scanning ${a.length} pending payments...`),a))if(b.transactionHash&&b.network)try{let a=await f.W.verifyTransaction(b.transactionHash,b.network,b.walletAddress,Number(b.amount));a.verified&&(console.log(`✅ Payment verified: ${b.id} - ${b.amount} USDT`),await (0,e.g7)(`UPDATE "PaymentRequest"
               SET status = 'CONFIRMED',
                   "confirmedAt" = $1,
                   confirmations = $2,
                   "updatedAt" = $3
               WHERE id = $4`,[new Date,a.confirmations,new Date,b.id]),await (0,e.Zy)(`INSERT INTO "PaymentConfirmation" (
                id, "paymentRequestId", "transactionHash", network, confirmations, "verifiedAt", "createdAt", "updatedAt"
              ) VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7) RETURNING *`,[b.id,b.transactionHash,b.network,a.confirmations,new Date,new Date,new Date]),b.metadata?.packageId&&await this.processPackageActivation(b.userId,b.metadata.packageId))}catch(a){console.error(`Error verifying payment ${b.id}:`,a)}}catch(a){throw console.error("Error scanning pending payments:",a),a}}static async processPackageActivation(a,b){try{await (0,e.g7)(`UPDATE "Package"
         SET status = 'ACTIVE',
             "activatedAt" = $1,
             "expiryDate" = $2,
             "updatedAt" = $3
         WHERE id = $4 AND "userId" = $5`,[new Date,new Date(Date.now()+31536e6),new Date,b,a]),console.log(`✅ Package ${b} activated for user ${a}`)}catch(a){throw console.error("Error activating package:",a),a}}static async updateScanState(a,b){await (0,e.g7)(`INSERT INTO "BlockchainScanState" (
        id, network, "lastScannedBlock", "lastScanAt", "createdAt", "updatedAt"
      ) VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5)
      ON CONFLICT (network)
      DO UPDATE SET
        "lastScannedBlock" = $2,
        "lastScanAt" = $3,
        "updatedAt" = $5`,[a,b,new Date,new Date,new Date])}static async getScanState(a){return await (0,e.Zy)('SELECT * FROM "BlockchainScanState" WHERE network = $1',[a])}}d()}catch(a){d(a)}})},14985:a=>{a.exports=require("dns")},16542:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{A:()=>j});var e=c(42703),f=c.n(e),g=c(8216),h=a([g]);g=(h.then?(await h)():h)[0];let i=!1,j={startReferralDistributionCron:function(){console.log("[Referral Cron] Initializing referral distribution cron...");let a=f().schedule("*/5 * * * *",async()=>{if(!i){i=!0;try{let{rows:a}=await (0,g.P)('SELECT DISTINCT e."packageId", p.network FROM "Earning" e JOIN "Transaction" t ON e."transactionId" = t.id JOIN "Package" p ON e."packageId" = p.id WHERE e.status IN (\'PAID\', \'PENDING\') AND (t."txHash" IS NULL OR t."txHash" = \'\')');for(let b of a)try{console.log(`[Referral Cron] Queueing distribution job for package ${b.packageId} (network: ${b.network})`);let a=await Promise.resolve().then(c.bind(c,39227)),d=a.default||a.referralDistributionQueue;await d.add({packageId:b.packageId,network:b.network})}catch(a){console.error("[Referral Cron] Failed to distribute for package",b.packageId,a)}}finally{i=!1}}});return a.start(),console.log("[Referral Cron] Started - runs every 5 minutes"),a}};d()}catch(a){d(a)}})},21820:a=>{a.exports=require("os")},27910:a=>{a.exports=require("stream")},28354:a=>{a.exports=require("util")},29021:a=>{a.exports=require("fs")},29294:a=>{a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},30148:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{A:()=>h});var e=c(86165),f=c(32575),g=a([e]);e=(g.then?(await g)():g)[0];let h=async function(){console.log("[Blockchain Sync] Starting blockchain data sync...");let a=await e.Ay.connect();try{let b=(await a.query(`SELECT 
        id,
        "txHash",
        network,
        amount,
        "blockchainVerified",
        "blockchainLastChecked",
        "blockchainStatus"
      FROM "Transaction"
      WHERE 
        "txHash" IS NOT NULL 
        AND "txHash" != 'N/A'
        AND "txHash" NOT LIKE 'ADMIN_%'
        AND "txHash" NOT LIKE 'BOT-%'
        AND network IN ('BEP20', 'TRC20')
        AND (
          "blockchainLastChecked" IS NULL -- Never checked
          OR "blockchainVerified" = false -- Not verified yet
          OR "blockchainStatus" = 'pending' -- Still pending
          OR ("blockchainStatus" = 'confirmed' 
              AND "blockchainLastChecked" < CURRENT_TIMESTAMP - INTERVAL '7 days') -- Recheck confirmed after 7 days
        )
      ORDER BY 
        CASE 
          WHEN "blockchainLastChecked" IS NULL THEN 0 -- Never checked = highest priority
          WHEN "blockchainStatus" = 'pending' THEN 1 -- Pending = high priority
          WHEN "blockchainVerified" = false THEN 2 -- Not verified = medium priority
          ELSE 3 -- Rechecking confirmed = low priority
        END,
        "createdAt" DESC
      LIMIT 100`)).rows;if(console.log(`[Blockchain Sync] Found ${b.length} transactions to sync`),0===b.length)return console.log("[Blockchain Sync] No transactions need updating"),{success:!0,processed:0,verified:0,failed:0};let c=0,d=0;for(let e=0;e<b.length;e+=10){let g=b.slice(e,e+10);await Promise.all(g.map(async b=>{try{console.log(`[Blockchain Sync] Fetching data for txHash: ${b.txHash}`);let e=await (0,f.SM)(b.txHash,b.network);if(e){await a.query(`UPDATE "Transaction"
                 SET 
                   "blockchainData" = $1,
                   "blockchainVerified" = true,
                   "blockchainLastChecked" = CURRENT_TIMESTAMP,
                   "fromAddress" = $2,
                   "toAddress" = $3,
                   "blockNumber" = $4,
                   "onChainValue" = $5,
                   "blockchainStatus" = $6,
                   "blockTimestamp" = $7,
                   "explorerUrl" = $8,
                   "updatedAt" = CURRENT_TIMESTAMP
                 WHERE id = $9`,[JSON.stringify(e),e.from,e.to,e.blockNumber,e.value,e.status,e.timestamp,e.explorerUrl,b.id]),c++,console.log(`[Blockchain Sync] ✓ Verified ${b.txHash} - Status: ${e.status}`);let d=Math.abs(parseFloat(b.amount)-e.value);d>.01&&console.warn(`[Blockchain Sync] ⚠️ DISCREPANCY DETECTED!`,`TxHash: ${b.txHash}`,`Claimed: $${b.amount}`,`Actual: $${e.value}`,`Difference: $${d}`)}else await a.query(`UPDATE "Transaction"
                 SET 
                   "blockchainLastChecked" = CURRENT_TIMESTAMP,
                   "updatedAt" = CURRENT_TIMESTAMP
                 WHERE id = $1`,[b.id]),d++,console.log(`[Blockchain Sync] ✗ Not found: ${b.txHash}`)}catch(c){console.error(`[Blockchain Sync] Error processing ${b.txHash}:`,c.message),d++,await a.query(`UPDATE "Transaction"
               SET 
                 "blockchainLastChecked" = CURRENT_TIMESTAMP
               WHERE id = $1`,[b.id])}})),e+10<b.length&&await new Promise(a=>setTimeout(a,2e3))}return console.log(`[Blockchain Sync] Completed! Verified: ${c}, Failed: ${d}`),{success:!0,processed:b.length,verified:c,failed:d}}catch(a){return console.error("[Blockchain Sync] Error:",a),{success:!1,error:a.message,processed:0,verified:0,failed:0}}finally{a.release()}};d()}catch(a){d(a)}})},30266:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{GET:()=>i,dynamic:()=>j});var e=c(45592),f=c(75775),g=c(13734),h=a([f,g]);[f,g]=h.then?(await h)():h;let j="force-dynamic";async function i(a){try{let b=await (0,f.Xp)(a);if(b instanceof e.NextResponse)return b;let{user:c}=b,d=(0,f.ZT)(c);if(d instanceof e.NextResponse)return d;let h=(0,g.Se)();return e.NextResponse.json({success:!0,data:h})}catch(a){return console.error("Error getting cron status:",a),e.NextResponse.json({error:"Failed to get cron status",message:a instanceof Error?a.message:"Unknown error"},{status:500})}}d()}catch(a){d(a)}})},32575:(a,b,c)=>{c.d(b,{SM:()=>i});let d=async a=>{try{let b=process.env.NEXT_PUBLIC_BSCSCAN_API_KEY||"",c=`https://api.bscscan.com/api?module=proxy&action=eth_getTransactionByHash&txhash=${a}&apikey=${b}`,d=await fetch(c),e=await d.json();if(e.result){let b=e.result,c=parseInt(b.value,16)/1e18;return{hash:b.hash,from:b.from,to:b.to,value:c,blockNumber:parseInt(b.blockNumber,16),timestamp:null,status:"confirmed",network:"BEP20",explorerUrl:`https://bscscan.com/tx/${a}`}}return null}catch(a){return console.error("Error fetching BSC transaction:",a),null}},e=async a=>{try{let b=`https://api.trongrid.io/v1/transactions/${a}`,c=await fetch(b),d=await c.json();if(d&&d.txID){let b=d.raw_data?.contract?.[0]?.parameter?.value?.amount||0,c=d.block_timestamp||Date.now();return{hash:d.txID,from:d.raw_data?.contract?.[0]?.parameter?.value?.owner_address||"",to:d.raw_data?.contract?.[0]?.parameter?.value?.to_address||"",value:b/1e6,blockNumber:d.blockNumber||0,timestamp:new Date(c),status:d.ret?.[0]?.contractRet==="SUCCESS"?"confirmed":"pending",network:"TRC20",explorerUrl:`https://tronscan.org/#/transaction/${a}`}}return null}catch(a){return console.error("Error fetching TRON transaction:",a),null}},f=async(a,b)=>!a||"N/A"===a||a.startsWith("ADMIN_")||a.startsWith("BOT-")?null:"BEP20"===b?await d(a):"TRC20"===b?await e(a):null,g=async a=>{try{let b=process.env.NEXT_PUBLIC_BSCSCAN_API_KEY||"",c=`https://api.bscscan.com/api?module=proxy&action=eth_getTransactionReceipt&txhash=${a}&apikey=${b}`,d=await fetch(c),e=await d.json();if(e.result){let a=e.result;return{status:"0x1"===a.status?"confirmed":"failed",blockNumber:parseInt(a.blockNumber,16),gasUsed:parseInt(a.gasUsed,16),confirmations:0}}return null}catch(a){return console.error("Error fetching BSC receipt:",a),null}},h=async a=>{try{let b=process.env.NEXT_PUBLIC_BSCSCAN_API_KEY||"",c="0x"+a.toString(16),d=`https://api.bscscan.com/api?module=proxy&action=eth_getBlockByNumber&tag=${c}&boolean=true&apikey=${b}`,e=await fetch(d),f=await e.json();if(f.result){let a=parseInt(f.result.timestamp,16);return new Date(1e3*a)}return null}catch(a){return console.error("Error fetching block timestamp:",a),null}},i=async(a,b)=>{let c=await f(a,b);if(!c)return null;if("BEP20"===b){let b=await g(a);if(b&&(c.status=b.status,c.confirmations=b.confirmations,c.gasUsed=b.gasUsed),c.blockNumber){let a=await h(c.blockNumber);a&&(c.timestamp=a)}}return c}},33398:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{W:()=>m});var e=c(8216),f=c(74771),g=c(81473),h=c(36984),i=c(55511),j=c.n(i),k=a([e]);e=(k.then?(await k)():k)[0],"true"===process.env.WEB3_DISABLED||process.env.NEXT_PUBLIC_WEB3_DISABLED;let l=process.env.WALLET_ENCRYPTION_KEY;if(!l||l.length<32)throw Error("CRITICAL SECURITY ERROR: WALLET_ENCRYPTION_KEY environment variable must be set and be at least 32 characters. Never use default encryption keys in production. Generate a secure key with: openssl rand -hex 32");class m{static async getDepositAddress(a,b){let c=await (0,e.Zy)('SELECT * FROM "CryptoWallet" WHERE "userId" = $1 AND "network" = $2 AND "isDeposit" = true LIMIT 1',[a,b]);if(!c){var d;let g,h,i,k;g="TRC20"===b?`OFFCHAIN_TRC20_${(0,f.A)()}`:`OFFCHAIN_BEP20_${(0,f.A)()}`;let m=(d=`OFFCHAIN_PRIVATE_KEY_${(0,f.A)()}`,h=j().randomBytes(16),k=(i=j().createCipheriv("aes-256-cbc",Buffer.from(l.substring(0,32)),h)).update(d),k=Buffer.concat([k,i.final()]),h.toString("hex")+":"+k.toString("hex"));c=await (0,e.Zy)(`INSERT INTO "CryptoWallet" ("userId", "address", "network", "privateKey", "isDeposit", "isActive", "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, true, true, NOW(), NOW()) RETURNING *`,[a,g,b,m])}let h=await (0,g.C)(c.address);return{address:c.address,network:b,qrCode:h}}static async verifyTransaction(a,b,c,d){try{let e=await h.kE(a,b,d,c);return{verified:e,amount:d,from:e?"OFFCHAIN_SIMULATION":void 0}}catch(a){return console.error("Transaction verification error:",a),{verified:!1}}}}d()}catch(a){d(a)}})},33873:a=>{a.exports=require("path")},34631:a=>{a.exports=require("tls")},39121:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{V6:()=>l,jq:()=>n,tW:()=>m});var e=c(42703),f=c.n(e),g=c(86165),h=c(74771),i=a([g]);g=(i.then?(await i)():i)[0];let o=!1,p=null,q=0;async function j(a,b){let c=`${b}_ROI_PERCENTAGE`,{rows:d}=await g.Ay.query('SELECT value FROM "SystemSetting" WHERE key = $1',[c]);if(0===d.length)return console.error(`[ROI Cron] No SystemSetting found for ${c}, using fallback`),a*(({NEO:3,NEURAL:4,ORACLE:5,TEST_1:3,TEST_2:4,TEST_3:5})[b]||3)/100;let e=parseFloat(d[0].value);return a*e/100}async function k(){if(o)return void console.log("[ROI Cron] Already processing, skipping...");try{o=!0,console.log("[ROI Cron] Starting ROI payout processing...");let f=new Date,i=`
      SELECT p.*, u.email, u."fullName", u.username 
      FROM "Package" p
      JOIN "User" u ON p."userId" = u.id
      WHERE p.status = 'ACTIVE'
      AND p."isExpired" = false
      AND p."nextRoiDate" <= $1
    `,{rows:k}=await g.Ay.query(i,[f]);console.log(`[ROI Cron] Found ${k.length} packages due for ROI payment`);let l=0,m=0;for(let i of k){let k=await g.Ay.connect();try{await k.query("BEGIN");let g=`
          SELECT * FROM "BotActivation"
          WHERE "userId" = $1 
          AND "botType" = $2 
          AND status = 'ACTIVE' 
          AND "isExpired" = false
        `,{rows:m}=await k.query(g,[i.userId,i.packageType]);if(0===m.length){console.log(`[ROI Cron] Skipping package ${i.id} - User has no active ${i.packageType} bot`),await k.query("ROLLBACK"),k.release();continue}let n=await j(Number(i.amount),i.packageType),o=i.roiPaidCount;if(o>=12){console.log(`[ROI Cron] Package ${i.id} has reached maximum ROI payments (12)`),await k.query("ROLLBACK"),k.release();continue}let p=(0,h.A)(),q=`
          INSERT INTO "RoiPayment" (id, "packageId", "userId", amount, "monthNumber", "paymentDate", "createdAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;await k.query(q,[p,i.id,i.userId,n,o+1,f,f]);let r=(0,h.A)(),s=`
          INSERT INTO "Transaction" (id, "userId", type, amount, status, description, network, "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;await k.query(s,[r,i.userId,"ROI_PAYMENT",n,"COMPLETED",`ROI payment month ${o+1}`,i.network,f,f]);let t=new Date(f);["TEST_1","TEST_2","TEST_3"].includes(i.packageType)?t.setMinutes(t.getMinutes()+15):t.setDate(t.getDate()+30);let u=`
          UPDATE "Package"
          SET "lastRoiDate" = $1,
              "nextRoiDate" = $2,
              "roiPaidCount" = $3,
              "totalRoiPaid" = $4,
              "updatedAt" = $5
          WHERE id = $6
        `;await k.query(u,[f,t,o+1,Number(i.totalRoiPaid)+n,f,i.id]),await k.query("COMMIT"),console.log(`[ROI Cron] Processed ROI payment for package ${i.id}: ${n} USDT (Month ${o+1})`),l++;try{var a,b,d,e;let{sendEmail:f}=await Promise.all([c.e(5924),c.e(7108)]).then(c.bind(c,37108));await f({to:i.email,subject:`ROI Payment Received - Month ${o+1}`,html:(a=i.fullName||i.username,b=n,d=o+1,e=i.packageType,`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ROI Payment Received</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
    <h1 style="color: #28a745; margin-bottom: 20px;">💰 ROI Payment Received!</h1>

    <p>Hello ${a},</p>

    <p>Your monthly ROI payment has been processed and credited to your account.</p>

    <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h2 style="color: #333; font-size: 18px; margin-top: 0;">Payment Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Amount:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; color: #28a745; font-size: 20px; font-weight: bold;">${b} USDT</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Month:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${d} of 12</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Package Type:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${e}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0;"><strong>Payment Date:</strong></td>
          <td style="padding: 10px 0; text-align: right;">${new Date().toLocaleDateString()}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
      <p style="margin: 0;"><strong>✓ Payment Successful</strong></p>
      <p style="margin: 10px 0 0 0; font-size: 14px;">The ROI amount has been credited to your account balance and is available for withdrawal.</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="http://localhost:3000/dashboard"
         style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        View Dashboard
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="font-size: 14px; color: #666;">
      Your next ROI payment will be processed in 30 days.
    </p>

    <p style="font-size: 14px; color: #666;">
      Best regards,<br>
      <strong>NSC Bot Platform Team</strong>
    </p>
  </div>
</body>
</html>
  `)})}catch(a){console.error(`[ROI Cron] Failed to send email for package ${i.id}:`,a)}}catch(a){await k.query("ROLLBACK"),console.error(`[ROI Cron] Error processing ROI for package ${i.id}:`,a),m++}finally{k.release()}}p=f,q+=l,console.log(`[ROI Cron] ROI payout processing completed: ${l} successful, ${m} errors`)}catch(a){console.error("[ROI Cron] Error during ROI payout processing:",a)}finally{o=!1}}function l(){console.log("[ROI Cron] Initializing ROI payout cron job...");let a=f().schedule("*/15 * * * *",async()=>{await k()});return a.start(),console.log("[ROI Cron] Cron job started - runs daily at midnight"),a}function m(){return{isProcessing:o,lastRunTime:p,totalProcessed:q}}async function n(){return console.log("[ROI Cron] Manual ROI payout triggered"),await k(),m()}d()}catch(a){d(a)}})},39227:(a,b,c)=>{c.r(b),c.d(b,{default:()=>h,referralDistributionQueue:()=>g});var d=c(24503),e=c.n(d);let f=process.env.REDIS_URL||"redis://127.0.0.1:6379",g=new(e())("referralDistribution",f),h=g},41204:a=>{a.exports=require("string_decoder")},42703:a=>{a.exports=require("node-cron")},44870:a=>{a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:a=>{a.exports=require("crypto")},55591:a=>{a.exports=require("https")},57329:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{handler:()=>z,patchFetch:()=>y,routeModule:()=>A,serverHooks:()=>D,workAsyncStorage:()=>B,workUnitAsyncStorage:()=>C});var e=c(19225),f=c(84006),g=c(8317),h=c(99373),i=c(34775),j=c(98564),k=c(48575),l=c(261),m=c(54365),n=c(90771),o=c(73461),p=c(67798),q=c(92280),r=c(62018),s=c(45696),t=c(47929),u=c(86439),v=c(37527),w=c(30266),x=a([w]);w=(x.then?(await x)():x)[0];let A=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/admin/cron/status/route",pathname:"/api/admin/cron/status",filename:"route",bundlePath:"app/api/admin/cron/status/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"C:\\Users\\LENOVO\\Desktop\\nsc-test\\vercel-download\\src\\app\\api\\admin\\cron\\status\\route.ts",nextConfigOutput:"",userland:w}),{workAsyncStorage:B,workUnitAsyncStorage:C,serverHooks:D}=A;function y(){return(0,g.patchFetch)({workAsyncStorage:B,workUnitAsyncStorage:C})}async function z(a,b,c){A.isDev&&(0,h.addRequestMeta)(a,"devRequestTimingInternalsEnd",process.hrtime.bigint());let d="/api/admin/cron/status/route";"/index"===d&&(d="/");let e=await A.prepare(a,b,{srcPage:d,multiZoneDraftMode:!1});if(!e)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:g,params:w,nextConfig:x,parsedUrl:y,isDraftMode:z,prerenderManifest:B,routerServerContext:C,isOnDemandRevalidate:D,revalidateOnlyGenerated:E,resolvedPathname:F,clientReferenceManifest:G,serverActionsManifest:H}=e,I=(0,l.normalizeAppPath)(d),J=!!(B.dynamicRoutes[I]||B.routes[F]),K=async()=>((null==C?void 0:C.render404)?await C.render404(a,b,y,!1):b.end("This page could not be found"),null);if(J&&!z){let a=!!B.routes[F],b=B.dynamicRoutes[I];if(b&&!1===b.fallback&&!a){if(x.experimental.adapterPath)return await K();throw new u.NoFallbackError}}let L=null;!J||A.isDev||z||(L=F,L="/index"===L?"/":L);let M=!0===A.isDev||!J,N=J&&!M;H&&G&&(0,j.setReferenceManifestsSingleton)({page:d,clientReferenceManifest:G,serverActionsManifest:H,serverModuleMap:(0,k.createServerModuleMap)({serverActionsManifest:H})});let O=a.method||"GET",P=(0,i.getTracer)(),Q=P.getActiveScopeSpan(),R={params:w,prerenderManifest:B,renderOpts:{experimental:{authInterrupts:!!x.experimental.authInterrupts},cacheComponents:!!x.cacheComponents,supportsDynamicResponse:M,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:x.cacheLife,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>A.onRequestError(a,b,d,C)},sharedContext:{buildId:g}},S=new m.NodeNextRequest(a),T=new m.NodeNextResponse(b),U=n.NextRequestAdapter.fromNodeNextRequest(S,(0,n.signalFromNodeResponse)(b));try{let e=async a=>A.handle(U,R).finally(()=>{if(!a)return;a.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let c=P.getRootSpanAttributes();if(!c)return;if(c.get("next.span_type")!==o.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${c.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=c.get("next.route");if(e){let b=`${O} ${e}`;a.setAttributes({"next.route":e,"http.route":e,"next.span_name":b}),a.updateName(b)}else a.updateName(`${O} ${d}`)}),g=!!(0,h.getRequestMeta)(a,"minimalMode"),j=async h=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!g&&D&&E&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let d=await e(h);a.fetchMetrics=R.renderOpts.fetchMetrics;let i=R.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=R.renderOpts.collectedTags;if(!J)return await (0,q.I)(S,T,d,R.renderOpts.pendingWaitUntil),null;{let a=await d.blob(),b=(0,r.toNodeOutgoingHttpHeaders)(d.headers);j&&(b[t.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==R.renderOpts.collectedRevalidate&&!(R.renderOpts.collectedRevalidate>=t.INFINITE_CACHE)&&R.renderOpts.collectedRevalidate,e=void 0===R.renderOpts.collectedExpire||R.renderOpts.collectedExpire>=t.INFINITE_CACHE?void 0:R.renderOpts.collectedExpire;return{value:{kind:v.CachedRouteKind.APP_ROUTE,status:d.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:e}}}}catch(b){throw(null==f?void 0:f.isStale)&&await A.onRequestError(a,b,{routerKind:"App Router",routePath:d,routeType:"route",revalidateReason:(0,p.c)({isStaticGeneration:N,isOnDemandRevalidate:D})},C),b}},l=await A.handleResponse({req:a,nextConfig:x,cacheKey:L,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:B,isRoutePPREnabled:!1,isOnDemandRevalidate:D,revalidateOnlyGenerated:E,responseGenerator:k,waitUntil:c.waitUntil,isMinimalMode:g});if(!J)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==v.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});g||b.setHeader("x-nextjs-cache",D?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),z&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,r.fromNodeOutgoingHttpHeaders)(l.value.headers);return g&&J||m.delete(t.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,s.getCacheControlHeader)(l.cacheControl)),await (0,q.I)(S,T,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};Q?await j(Q):await P.withPropagatedContext(a.headers,()=>P.trace(o.BaseServerSpan.handleRequest,{spanName:`${O} ${d}`,kind:i.SpanKind.SERVER,attributes:{"http.method":O,"http.target":a.url}},j))}catch(b){if(b instanceof u.NoFallbackError||await A.onRequestError(a,b,{routerKind:"App Router",routePath:I,routeType:"route",revalidateReason:(0,p.c)({isStaticGeneration:N,isOnDemandRevalidate:D})}),J)throw b;return await (0,q.I)(S,T,new Response(null,{status:500})),null}}d()}catch(a){d(a)}})},63033:a=>{a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},64939:a=>{a.exports=import("pg")},74075:a=>{a.exports=require("zlib")},79428:a=>{a.exports=require("buffer")},79646:a=>{a.exports=require("child_process")},81473:(a,b,c)=>{c.d(b,{C:()=>e});var d=c(5932);async function e(a){try{return await d.toDataURL(a,{width:300,margin:2,color:{dark:"#000000",light:"#FFFFFF"}})}catch(a){throw console.error("Error generating QR code:",a),Error("Failed to generate QR code")}}},81630:a=>{a.exports=require("http")},83997:a=>{a.exports=require("tty")},86439:a=>{a.exports=require("next/dist/shared/lib/no-fallback-error.external")},88320:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{_e:()=>n,sg:()=>m,yy:()=>o});var e=c(42703),f=c.n(e),g=c(86165),h=c(74771),i=a([g]);g=(i.then?(await i)():i)[0];let p=!1,q=null,r=0,s=0;async function j(){try{let f=new Date,i=`
      SELECT p.*, u.email, u."fullName", u.username 
      FROM "Package" p
      JOIN "User" u ON p."userId" = u.id
      WHERE p.status = 'ACTIVE'
      AND p."isExpired" = false
      AND p."expiryDate" <= $1
    `,{rows:j}=await g.Ay.query(i,[f]);console.log(`[Expiration Cron] Found ${j.length} packages to expire and return capital`);let k=0,l=0;for(let i of j){let j=await g.Ay.connect();try{await j.query("BEGIN");let g=Number(i.amount),l=`
          UPDATE "Package"
          SET status = 'EXPIRED',
              "isExpired" = true,
              "updatedAt" = $1
          WHERE id = $2
        `;await j.query(l,[f,i.id]);let m=(0,h.A)(),n=`
          INSERT INTO "Transaction" (
            id, "userId", type, amount, status, description, network, "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;await j.query(n,[m,i.userId,"CAPITAL_RETURN",g,"COMPLETED",`Capital return for expired ${i.packageType} package`,i.network,f,f]);let o=(0,h.A)(),p=`
          INSERT INTO "Earning" (
            id, "userId", amount, type, "packageId", description, "createdAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;await j.query(p,[o,i.userId,g,"ROI",i.id,`Capital return - ${i.packageType} package expired after 12 months`,f]),await j.query("COMMIT"),console.log(`[Expiration Cron] Expired package ${i.id} and returned capital: ${g} USDT`),k++;try{var a,b,d,e;let{sendEmail:f}=await Promise.all([c.e(5924),c.e(7108)]).then(c.bind(c,37108));await f({to:i.email,subject:"Package Completed - Capital Returned",html:(a=i.fullName||i.username,b=g,d=Number(i.totalRoiPaid),e=i.packageType,`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Package Completed - Capital Returned</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
    <h1 style="color: #28a745; margin-bottom: 20px;">🎉 Package Completed - Capital Returned!</h1>

    <p>Hello ${a},</p>

    <p>Your ${e} package has completed its 12-month term. Your capital has been returned to your account!</p>

    <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h2 style="color: #333; font-size: 18px; margin-top: 0;">Investment Summary</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Original Investment:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${b} USDT</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Total ROI Received:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; color: #28a745;">+${d} USDT</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Capital Returned:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; color: #28a745;">+${b} USDT</td>
        </tr>
        <tr style="font-weight: bold; font-size: 18px;">
          <td style="padding: 15px 0;"><strong>Total Return:</strong></td>
          <td style="padding: 15px 0; text-align: right; color: #28a745;">${b+d} USDT</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
      <p style="margin: 0;"><strong>✓ Capital Available for Withdrawal</strong></p>
      <p style="margin: 10px 0 0 0; font-size: 14px;">Your capital of ${b} USDT is now available in your account balance and can be withdrawn or reinvested in a new package.</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="http://localhost:3000/dashboard/withdraw"
         style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">
        Withdraw Funds
      </a>
      <a href="http://localhost:3000/pricing"
         style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Invest Again
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="font-size: 14px; color: #666;">
      Thank you for investing with NSC Bot Platform! We hope you had a great experience with your ${e} package.
    </p>

    <p style="font-size: 14px; color: #666;">
      Best regards,<br>
      <strong>NSC Bot Platform Team</strong>
    </p>
  </div>
</body>
</html>
  `)})}catch(a){console.error(`[Expiration Cron] Failed to send email for package ${i.id}:`,a)}}catch(a){await j.query("ROLLBACK"),console.error(`[Expiration Cron] Error expiring package ${i.id}:`,a),l++}finally{j.release()}}return r+=k,console.log(`[Expiration Cron] Package expiration completed: ${k} expired, ${l} errors`),{success:k,errors:l}}catch(a){throw console.error("[Expiration Cron] Error processing expired packages:",a),a}}async function k(){try{let e=new Date,f=`
      SELECT b.*, u.email, u."fullName", u.username 
      FROM "BotActivation" b
      JOIN "User" u ON b."userId" = u.id
      WHERE b.status = 'ACTIVE'
      AND b."isExpired" = false
      AND b."expiryDate" <= $1
    `,{rows:h}=await g.Ay.query(f,[e]);console.log(`[Expiration Cron] Found ${h.length} bots to expire`);let i=0,j=0;for(let f of h){let h=await g.Ay.connect();try{await h.query("BEGIN");let g=`
          UPDATE "BotActivation"
          SET status = 'EXPIRED',
              "isExpired" = true,
              "updatedAt" = $1
          WHERE id = $2
        `;await h.query(g,[e,f.id]),await h.query("COMMIT"),console.log(`[Expiration Cron] Expired bot ${f.id} (${f.botType})`),i++;try{var a,b,d;let{sendEmail:e}=await Promise.all([c.e(5924),c.e(7108)]).then(c.bind(c,37108));await e({to:f.email,subject:`${f.botType} Bot Subscription Expired`,html:(a=f.fullName||f.username,b=f.botType,d=new Date(f.expiryDate).toLocaleDateString(),`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Bot Subscription Expired</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
    <h1 style="color: #ff9800; margin-bottom: 20px;">🤖 Bot Subscription Expired</h1>

    <p>Hello ${a},</p>

    <p>Your ${b} bot subscription has expired as of ${d}.</p>

    <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <p style="margin: 0;"><strong>⚠️ Access Restricted</strong></p>
      <p style="margin: 10px 0 0 0; font-size: 14px;">Your bot features are now inactive. To continue using the ${b} bot, please renew your subscription.</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="http://localhost:3000/dashboard/bots"
         style="background-color: #ff9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Renew Subscription
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="font-size: 14px; color: #666;">
      If you have any questions, please contact our support team.
    </p>

    <p style="font-size: 14px; color: #666;">
      Best regards,<br>
      <strong>NSC Bot Platform Team</strong>
    </p>
  </div>
</body>
</html>
  `)})}catch(a){console.error(`[Expiration Cron] Failed to send email for bot ${f.id}:`,a)}}catch(a){await h.query("ROLLBACK"),console.error(`[Expiration Cron] Error expiring bot ${f.id}:`,a),j++}finally{h.release()}}return s+=i,console.log(`[Expiration Cron] Bot expiration completed: ${i} expired, ${j} errors`),{success:i,errors:j}}catch(a){throw console.error("[Expiration Cron] Error processing expired bots:",a),a}}async function l(){if(p)return void console.log("[Expiration Cron] Already processing, skipping...");try{p=!0,console.log("[Expiration Cron] Starting expiration processing...");let[a,b]=await Promise.all([j(),k()]);q=new Date,console.log("[Expiration Cron] Expiration processing completed"),console.log(`  - Packages: ${a.success} expired`),console.log(`  - Bots: ${b.success} expired`)}catch(a){console.error("[Expiration Cron] Error during expiration processing:",a)}finally{p=!1}}function m(){console.log("[Expiration Cron] Initializing expiration cron job...");let a=f().schedule("0 1 * * *",async()=>{await l()});return a.start(),console.log("[Expiration Cron] Cron job started - runs daily at 1:00 AM"),a}function n(){return{isProcessing:p,lastRunTime:q,packagesExpired:r,botsExpired:s}}async function o(){return console.log("[Expiration Cron] Manual expiration check triggered"),await l(),n()}d()}catch(a){d(a)}})},91645:a=>{a.exports=require("net")},94735:a=>{a.exports=require("events")},95798:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{u:()=>g});var e=c(36759),f=a([e]);e=(f.then?(await f)():f)[0];class g{static{this.isRunning=!1}static{this.lastCleanup=null}static{this.cleanupHistory=[]}static async performSessionCleanup(){if(this.isRunning)throw console.log("⚠️ Session cleanup already running, skipping..."),Error("Session cleanup already in progress");try{this.isRunning=!0,console.log("\uD83E\uDDF9 Starting session cleanup...");let a=await e.X.cleanupExpiredSessions(),b=await e.X.getSessionStats(),c={cleanedSessions:a,activeSessionsAfterCleanup:b.activeSessions,uniqueUsersAfterCleanup:b.uniqueUsers,timestamp:new Date};return this.cleanupHistory.push(c),this.cleanupHistory.length>100&&(this.cleanupHistory=this.cleanupHistory.slice(-100)),this.lastCleanup=new Date,console.log(`✅ Session cleanup completed:
        🗑️ Cleaned: ${a} expired sessions
        💾 Active: ${b.activeSessions} sessions
        👥 Users: ${b.uniqueUsers} unique users
        ⏰ Time: ${new Date().toISOString()}`),c}catch(a){throw console.error("❌ Session cleanup failed:",a),a}finally{this.isRunning=!1}}static async performSessionMonitoring(){try{console.log("\uD83D\uDCCA Performing session monitoring...");let a=await e.X.getSessionStats();if(a.activeSessions>1e3&&console.warn(`⚠️ HIGH SESSION COUNT ALERT: ${a.activeSessions} active sessions`),a.uniqueUsers>500&&console.warn(`⚠️ HIGH USER COUNT ALERT: ${a.uniqueUsers} unique users`),this.cleanupHistory.length>=2){let a=this.cleanupHistory[this.cleanupHistory.length-1],b=this.cleanupHistory[this.cleanupHistory.length-2];a.activeSessionsAfterCleanup>2*b.activeSessionsAfterCleanup&&console.warn(`⚠️ RAPID SESSION GROWTH ALERT: Sessions grew from ${b.activeSessionsAfterCleanup} to ${a.activeSessionsAfterCleanup}`)}console.log(`📈 Session monitoring complete:
        📊 Current Stats: ${a.activeSessions} active, ${a.uniqueUsers} users
        📈 24h Sessions: ${a.sessionsLast24h}
        🕐 Last Cleanup: ${this.lastCleanup?.toISOString()||"Never"}`)}catch(a){console.error("❌ Session monitoring failed:",a)}}static getCleanupStats(){let a=this.cleanupHistory.reduce((a,b)=>a+b.cleanedSessions,0),b=this.cleanupHistory.length>0?a/this.cleanupHistory.length:0;return{lastCleanup:this.lastCleanup,totalCleanups:this.cleanupHistory.length,totalSessionsCleaned:a,averageSessionsCleaned:Math.round(100*b)/100,isCurrentlyRunning:this.isRunning}}static getRecentCleanupHistory(a=10){return this.cleanupHistory.slice(-a)}static async forceCleanup(){return console.log("\uD83D\uDD27 Manual session cleanup triggered..."),await this.performSessionCleanup()}static async healthCheck(){try{let a=await e.X.getSessionStats();if(!this.lastCleanup||Date.now()-this.lastCleanup.getTime()>9e7)return{status:"warning",details:"Session cleanup is overdue. Last cleanup: "+(this.lastCleanup?.toISOString()||"Never"),stats:a};return{status:"healthy",details:"Session management system is operating normally",stats:{...a,lastCleanup:this.lastCleanup,cleanupStats:this.getCleanupStats()}}}catch(a){return{status:"error",details:`Session management system error: ${a.message}`,stats:null}}}}d()}catch(a){d(a)}})},99395:(a,b,c)=>{c.a(a,async(a,b)=>{try{var d=c(39227),e=c(31833),f=a([e]);e=(f.then?(await f)():f)[0],d.default.process(async a=>{let{packageId:b,network:c}=a.data;try{let a=await (0,e.distributeReferralEarningsOnChain)(b,c);return{success:a.success,failed:a.failed}}catch(a){throw console.error("[Worker] referral distribution worker error: ",a),a}}),d.default.on("failed",(a,b)=>{console.error("[Worker] Job failed",a.id,b)}),d.default.on("completed",(a,b)=>{console.log(`[Worker] Job ${a.id} completed`,b)}),b()}catch(a){b(a)}})}};var b=require("../../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[134,1813,3759,5171,5932,4503,1204,5775,8278,1833,1053],()=>b(b.s=57329));module.exports=c})();