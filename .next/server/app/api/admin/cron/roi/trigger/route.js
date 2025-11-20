"use strict";(()=>{var a={};a.id=6920,a.ids=[6920],a.modules={261:a=>{a.exports=require("next/dist/shared/lib/router/utils/app-paths")},1932:a=>{a.exports=require("url")},3295:a=>{a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},5107:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{handler:()=>z,patchFetch:()=>y,routeModule:()=>A,serverHooks:()=>D,workAsyncStorage:()=>B,workUnitAsyncStorage:()=>C});var e=c(19225),f=c(84006),g=c(8317),h=c(99373),i=c(34775),j=c(98564),k=c(48575),l=c(261),m=c(54365),n=c(90771),o=c(73461),p=c(67798),q=c(92280),r=c(62018),s=c(45696),t=c(47929),u=c(86439),v=c(37527),w=c(88935),x=a([w]);w=(x.then?(await x)():x)[0];let A=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/admin/cron/roi/trigger/route",pathname:"/api/admin/cron/roi/trigger",filename:"route",bundlePath:"app/api/admin/cron/roi/trigger/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"C:\\Users\\LENOVO\\Desktop\\nsc-test\\vercel-download\\src\\app\\api\\admin\\cron\\roi\\trigger\\route.ts",nextConfigOutput:"",userland:w}),{workAsyncStorage:B,workUnitAsyncStorage:C,serverHooks:D}=A;function y(){return(0,g.patchFetch)({workAsyncStorage:B,workUnitAsyncStorage:C})}async function z(a,b,c){A.isDev&&(0,h.addRequestMeta)(a,"devRequestTimingInternalsEnd",process.hrtime.bigint());let d="/api/admin/cron/roi/trigger/route";"/index"===d&&(d="/");let e=await A.prepare(a,b,{srcPage:d,multiZoneDraftMode:!1});if(!e)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:g,params:w,nextConfig:x,parsedUrl:y,isDraftMode:z,prerenderManifest:B,routerServerContext:C,isOnDemandRevalidate:D,revalidateOnlyGenerated:E,resolvedPathname:F,clientReferenceManifest:G,serverActionsManifest:H}=e,I=(0,l.normalizeAppPath)(d),J=!!(B.dynamicRoutes[I]||B.routes[F]),K=async()=>((null==C?void 0:C.render404)?await C.render404(a,b,y,!1):b.end("This page could not be found"),null);if(J&&!z){let a=!!B.routes[F],b=B.dynamicRoutes[I];if(b&&!1===b.fallback&&!a){if(x.experimental.adapterPath)return await K();throw new u.NoFallbackError}}let L=null;!J||A.isDev||z||(L=F,L="/index"===L?"/":L);let M=!0===A.isDev||!J,N=J&&!M;H&&G&&(0,j.setReferenceManifestsSingleton)({page:d,clientReferenceManifest:G,serverActionsManifest:H,serverModuleMap:(0,k.createServerModuleMap)({serverActionsManifest:H})});let O=a.method||"GET",P=(0,i.getTracer)(),Q=P.getActiveScopeSpan(),R={params:w,prerenderManifest:B,renderOpts:{experimental:{authInterrupts:!!x.experimental.authInterrupts},cacheComponents:!!x.cacheComponents,supportsDynamicResponse:M,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:x.cacheLife,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>A.onRequestError(a,b,d,C)},sharedContext:{buildId:g}},S=new m.NodeNextRequest(a),T=new m.NodeNextResponse(b),U=n.NextRequestAdapter.fromNodeNextRequest(S,(0,n.signalFromNodeResponse)(b));try{let e=async a=>A.handle(U,R).finally(()=>{if(!a)return;a.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let c=P.getRootSpanAttributes();if(!c)return;if(c.get("next.span_type")!==o.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${c.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=c.get("next.route");if(e){let b=`${O} ${e}`;a.setAttributes({"next.route":e,"http.route":e,"next.span_name":b}),a.updateName(b)}else a.updateName(`${O} ${d}`)}),g=!!(0,h.getRequestMeta)(a,"minimalMode"),j=async h=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!g&&D&&E&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let d=await e(h);a.fetchMetrics=R.renderOpts.fetchMetrics;let i=R.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=R.renderOpts.collectedTags;if(!J)return await (0,q.I)(S,T,d,R.renderOpts.pendingWaitUntil),null;{let a=await d.blob(),b=(0,r.toNodeOutgoingHttpHeaders)(d.headers);j&&(b[t.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==R.renderOpts.collectedRevalidate&&!(R.renderOpts.collectedRevalidate>=t.INFINITE_CACHE)&&R.renderOpts.collectedRevalidate,e=void 0===R.renderOpts.collectedExpire||R.renderOpts.collectedExpire>=t.INFINITE_CACHE?void 0:R.renderOpts.collectedExpire;return{value:{kind:v.CachedRouteKind.APP_ROUTE,status:d.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:e}}}}catch(b){throw(null==f?void 0:f.isStale)&&await A.onRequestError(a,b,{routerKind:"App Router",routePath:d,routeType:"route",revalidateReason:(0,p.c)({isStaticGeneration:N,isOnDemandRevalidate:D})},C),b}},l=await A.handleResponse({req:a,nextConfig:x,cacheKey:L,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:B,isRoutePPREnabled:!1,isOnDemandRevalidate:D,revalidateOnlyGenerated:E,responseGenerator:k,waitUntil:c.waitUntil,isMinimalMode:g});if(!J)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==v.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});g||b.setHeader("x-nextjs-cache",D?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),z&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,r.fromNodeOutgoingHttpHeaders)(l.value.headers);return g&&J||m.delete(t.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,s.getCacheControlHeader)(l.cacheControl)),await (0,q.I)(S,T,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};Q?await j(Q):await P.withPropagatedContext(a.headers,()=>P.trace(o.BaseServerSpan.handleRequest,{spanName:`${O} ${d}`,kind:i.SpanKind.SERVER,attributes:{"http.method":O,"http.target":a.url}},j))}catch(b){if(b instanceof u.NoFallbackError||await A.onRequestError(a,b,{routerKind:"App Router",routePath:I,routeType:"route",revalidateReason:(0,p.c)({isStaticGeneration:N,isOnDemandRevalidate:D})}),J)throw b;return await (0,q.I)(S,T,new Response(null,{status:500})),null}}d()}catch(a){d(a)}})},5486:a=>{a.exports=require("bcrypt")},10846:a=>{a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},14985:a=>{a.exports=require("dns")},21820:a=>{a.exports=require("os")},27910:a=>{a.exports=require("stream")},27972:(a,b,c)=>{c.d(b,{A:()=>e});let d=/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i,e=function(a){return"string"==typeof a&&d.test(a)}},28354:a=>{a.exports=require("util")},29021:a=>{a.exports=require("fs")},29294:a=>{a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33873:a=>{a.exports=require("path")},34631:a=>{a.exports=require("tls")},39121:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{V6:()=>l,jq:()=>n,tW:()=>m});var e=c(42703),f=c.n(e),g=c(86165),h=c(74771),i=a([g]);g=(i.then?(await i)():i)[0];let o=!1,p=null,q=0;async function j(a,b){let c=`${b}_ROI_PERCENTAGE`,{rows:d}=await g.Ay.query('SELECT value FROM "SystemSetting" WHERE key = $1',[c]);if(0===d.length)return console.error(`[ROI Cron] No SystemSetting found for ${c}, using fallback`),a*(({NEO:3,NEURAL:4,ORACLE:5,TEST_1:3,TEST_2:4,TEST_3:5})[b]||3)/100;let e=parseFloat(d[0].value);return a*e/100}async function k(){if(o)return void console.log("[ROI Cron] Already processing, skipping...");try{o=!0,console.log("[ROI Cron] Starting ROI payout processing...");let f=new Date,i=`
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
  `)})}catch(a){console.error(`[ROI Cron] Failed to send email for package ${i.id}:`,a)}}catch(a){await k.query("ROLLBACK"),console.error(`[ROI Cron] Error processing ROI for package ${i.id}:`,a),m++}finally{k.release()}}p=f,q+=l,console.log(`[ROI Cron] ROI payout processing completed: ${l} successful, ${m} errors`)}catch(a){console.error("[ROI Cron] Error during ROI payout processing:",a)}finally{o=!1}}function l(){console.log("[ROI Cron] Initializing ROI payout cron job...");let a=f().schedule("*/15 * * * *",async()=>{await k()});return a.start(),console.log("[ROI Cron] Cron job started - runs daily at midnight"),a}function m(){return{isProcessing:o,lastRunTime:p,totalProcessed:q}}async function n(){return console.log("[ROI Cron] Manual ROI payout triggered"),await k(),m()}d()}catch(a){d(a)}})},42703:a=>{a.exports=require("node-cron")},44870:a=>{a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:a=>{a.exports=require("crypto")},55591:a=>{a.exports=require("https")},57692:(a,b,c)=>{c.d(b,{A:()=>h});var d=c(55511),e=c.n(d);let f=new Uint8Array(256),g=f.length;function h(){return g>f.length-16&&(e().randomFillSync(f),g=0),f.slice(g,g+=16)}},63033:a=>{a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},64939:a=>{a.exports=import("pg")},74075:a=>{a.exports=require("zlib")},74771:(a,b,c)=>{c.d(b,{A:()=>f});var d=c(57692),e=c(77760);let f=function(a,b,c){let f=(a=a||{}).random||(a.rng||d.A)();if(f[6]=15&f[6]|64,f[8]=63&f[8]|128,b){c=c||0;for(let a=0;a<16;++a)b[c+a]=f[a];return b}return(0,e.A)(f)}},77760:(a,b,c)=>{c.d(b,{A:()=>f});var d=c(27972);let e=[];for(let a=0;a<256;++a)e.push((a+256).toString(16).substr(1));let f=function(a,b=0){let c=(e[a[b+0]]+e[a[b+1]]+e[a[b+2]]+e[a[b+3]]+"-"+e[a[b+4]]+e[a[b+5]]+"-"+e[a[b+6]]+e[a[b+7]]+"-"+e[a[b+8]]+e[a[b+9]]+"-"+e[a[b+10]]+e[a[b+11]]+e[a[b+12]]+e[a[b+13]]+e[a[b+14]]+e[a[b+15]]).toLowerCase();if(!(0,d.A)(c))throw TypeError("Stringified UUID is invalid");return c}},79428:a=>{a.exports=require("buffer")},79646:a=>{a.exports=require("child_process")},81630:a=>{a.exports=require("http")},86439:a=>{a.exports=require("next/dist/shared/lib/no-fallback-error.external")},88935:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{POST:()=>i});var e=c(45592),f=c(75775),g=c(39121),h=a([f,g]);async function i(a){try{let b=await (0,f.Xp)(a);if(b instanceof e.NextResponse)return b;let{user:c}=b,d=(0,f.ZT)(c);if(d instanceof e.NextResponse)return d;console.log(`[Admin] Manual ROI payout triggered by admin: ${c.id}`);let h=await (0,g.jq)();return e.NextResponse.json({success:!0,message:"ROI payout triggered successfully",data:h})}catch(a){return console.error("Error triggering ROI payout:",a),e.NextResponse.json({error:"Failed to trigger ROI payout",message:a instanceof Error?a.message:"Unknown error"},{status:500})}}[f,g]=h.then?(await h)():h,d()}catch(a){d(a)}})},91645:a=>{a.exports=require("net")},94735:a=>{a.exports=require("events")}};var b=require("../../../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[134,1813,3759,5171,1204,5775],()=>b(b.s=5107));module.exports=c})();