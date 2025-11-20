"use strict";(()=>{var a={};a.id=5386,a.ids=[5386,7108],a.modules={261:a=>{a.exports=require("next/dist/shared/lib/router/utils/app-paths")},1932:a=>{a.exports=require("url")},3295:a=>{a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},5486:a=>{a.exports=require("bcrypt")},10846:a=>{a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},14985:a=>{a.exports=require("dns")},21820:a=>{a.exports=require("os")},27910:a=>{a.exports=require("stream")},28354:a=>{a.exports=require("util")},29021:a=>{a.exports=require("fs")},29294:a=>{a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33873:a=>{a.exports=require("path")},34631:a=>{a.exports=require("tls")},37108:(a,b,c)=>{c.d(b,{sendEmail:()=>g});var d=c(35924);class e{constructor(){this.transporter=d.createTransport({host:process.env.SMTP_HOST,port:parseInt(process.env.SMTP_PORT||"587"),secure:"true"===process.env.SMTP_SECURE,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}})}async sendEmail(a){try{let b={from:process.env.SMTP_FROM||"NSC Bot Platform <noreply@nscbot.com>",to:a.to,subject:a.subject,html:a.html,text:a.text};return await this.transporter.sendMail(b),console.log(`Email sent successfully to ${a.to}`),!0}catch(a){return console.error("Email sending failed:",a),!1}}async sendVerificationEmail(a,b){let c=`http://localhost:3000/verify-email?token=${b}`,d=`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email - NSC Bot Platform</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #111; border-radius: 10px; padding: 30px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { color: #00ff00; font-size: 24px; font-weight: bold; }
          .button { display: inline-block; background-color: #00ff00; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NSC Bot Platform</div>
          </div>
          
          <h2>Verify Your Email Address</h2>
          
          <p>Welcome to NSC Bot Platform! Please verify your email address to complete your registration.</p>
          
          <div style="text-align: center;">
            <a href="${c}" class="button">Verify Email Address</a>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #00ff00;">${c}</p>
          
          <p>This verification link will expire in 24 hours.</p>
          
          <div class="footer">
            <p>If you didn't create an account with NSC Bot Platform, please ignore this email.</p>
            <p>&copy; 2025 NSC Bot Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;return this.sendEmail({to:a,subject:"Verify Your Email - NSC Bot Platform",html:d,text:`Welcome to NSC Bot Platform! Please verify your email by visiting: ${c}`})}async sendPasswordResetEmail(a,b){let c=`http://localhost:3000/reset-password?token=${b}`,d=`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password - NSC Bot Platform</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #111; border-radius: 10px; padding: 30px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { color: #00ff00; font-size: 24px; font-weight: bold; }
          .button { display: inline-block; background-color: #00ff00; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NSC Bot Platform</div>
          </div>
          
          <h2>Reset Your Password</h2>
          
          <p>We received a request to reset your password for your NSC Bot Platform account.</p>
          
          <div style="text-align: center;">
            <a href="${c}" class="button">Reset Password</a>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #00ff00;">${c}</p>
          
          <p>This reset link will expire in 1 hour for security reasons.</p>
          
          <div class="footer">
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            <p>&copy; 2025 NSC Bot Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;return this.sendEmail({to:a,subject:"Reset Your Password - NSC Bot Platform",html:d,text:`Reset your NSC Bot Platform password by visiting: ${c}`})}async sendWelcomeEmail(a,b){let c="http://localhost:3000/login",d=`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to NSC Bot Platform</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #111; border-radius: 10px; padding: 30px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { color: #00ff00; font-size: 24px; font-weight: bold; }
          .button { display: inline-block; background-color: #00ff00; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .feature { margin: 15px 0; padding: 15px; background-color: #1a1a1a; border-radius: 5px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NSC Bot Platform</div>
          </div>
          
          <h2>Welcome to NSC Bot Platform, ${b}!</h2>
          
          <p>Congratulations! Your account has been successfully created and verified.</p>
          
          <div class="feature">
            <h3 style="color: #00ff00; margin-top: 0;">🚀 What's Next?</h3>
            <ul>
              <li>Explore our investment packages (NEO, NEURAL, ORACLE)</li>
              <li>Activate trading bots to earn referral commissions</li>
              <li>Build your network and earn up to 6 levels deep</li>
              <li>Start earning monthly ROI on your investments</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${c}" class="button">Access Your Dashboard</a>
          </div>
          
          <div class="feature">
            <h3 style="color: #00ff00; margin-top: 0;">💰 Investment Packages</h3>
            <p><strong>NEO:</strong> $500-$3,000 | 3% monthly ROI</p>
            <p><strong>NEURAL:</strong> $5,000-$10,000 | 4% monthly ROI</p>
            <p><strong>ORACLE:</strong> $25,000-$50,000 | 5% monthly ROI</p>
          </div>
          
          <div class="footer">
            <p>Need help? Contact our support team at ${process.env.SUPPORT_EMAIL||"support@nscbot.com"}</p>
            <p>&copy; 2025 NSC Bot Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;return this.sendEmail({to:a,subject:"Welcome to NSC Bot Platform - Start Your Journey!",html:d,text:`Welcome to NSC Bot Platform, ${b}! Your account is ready. Login at: ${c}`})}async sendWithdrawalNotification(a,b,c){let d=`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Withdrawal ${c} - NSC Bot Platform</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #111; border-radius: 10px; padding: 30px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { color: #00ff00; font-size: 24px; font-weight: bold; }
          .status { padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; font-weight: bold; }
          .approved { background-color: #00ff00; color: #000; }
          .rejected { background-color: #ff4444; color: #fff; }
          .pending { background-color: #ffaa00; color: #000; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NSC Bot Platform</div>
          </div>
          
          <h2>Withdrawal Update</h2>
          
          <div class="status ${c.toLowerCase()}">
            Withdrawal ${c.toUpperCase()}: $${b} USDT
          </div>
          
          <p>Your withdrawal request for $${b} USDT has been ${c.toLowerCase()}.</p>
          
          ${"APPROVED"===c?"<p>Your funds have been processed and sent to your wallet address. Please check your wallet and allow up to 30 minutes for the transaction to confirm on the blockchain.</p>":"REJECTED"===c?"<p>Your withdrawal request was rejected. Please contact support for more information or check your dashboard for details.</p>":"<p>Your withdrawal request is being reviewed by our team. You will receive another notification once it has been processed.</p>"}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/dashboard" style="display: inline-block; background-color: #00ff00; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Dashboard</a>
          </div>
          
          <div class="footer">
            <p>Questions? Contact support at ${process.env.SUPPORT_EMAIL||"support@nscbot.com"}</p>
            <p>&copy; 2025 NSC Bot Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;return this.sendEmail({to:a,subject:`Withdrawal ${c} - NSC Bot Platform`,html:d,text:`Your withdrawal request for $${b} USDT has been ${c.toLowerCase()}.`})}}let f=new e,g=f.sendEmail.bind(f)},44870:a=>{a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:a=>{a.exports=require("crypto")},55591:a=>{a.exports=require("https")},63033:a=>{a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},64939:a=>{a.exports=import("pg")},65405:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{POST:()=>k});var e=c(45592),f=c(8216),g=c(75775),h=c(86848),i=c(37108),j=a([f,g]);[f,g]=j.then?(await j)():j;let l=h.Ik({reason:h.Yj().min(1,"Rejection reason is required")});async function k(a,{params:b}){let c=await (0,g.Xp)(a);if(c instanceof e.NextResponse)return c;let{user:d}=c,h=(0,g.ZT)(d);if(h instanceof e.NextResponse)return h;try{let c=await a.json(),{id:g}=await b,h=l.safeParse(c);if(!h.success)return e.NextResponse.json({error:"Invalid request data",details:h.error.errors},{status:400});let{reason:j}=h.data,k=await (0,f.Zy)(`SELECT
        w.*,
        u.email as "user_email",
        u."fullName" as "user_fullName"
       FROM "Withdrawal" w
       LEFT JOIN "User" u ON w."userId" = u.id
       WHERE w.id = $1`,[g]);if(k&&(k.user={email:k.user_email,fullName:k.user_fullName},delete k.user_email,delete k.user_fullName),!k)return e.NextResponse.json({error:"Withdrawal not found"},{status:404});if("PENDING"!==k.status)return e.NextResponse.json({error:"Withdrawal already processed"},{status:400});await (0,f.g7)(`UPDATE "Withdrawal"
       SET status = $1, "processedBy" = $2, "processedDate" = $3, "rejectionReason" = $4, "updatedAt" = $5
       WHERE id = $6`,["REJECTED",d.userId,new Date,j,new Date,g]),await (0,f.g7)(`INSERT INTO "AdminLog" (id, "adminId", action, description, metadata, "createdAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5)`,[d.userId,"REJECT_WITHDRAWAL",`Rejected withdrawal ${g} - Reason: ${j}`,JSON.stringify({withdrawalId:g,reason:j}),new Date]);try{await (0,i.sendEmail)({to:k.user.email,subject:"Withdrawal Request Rejected - NSC Bot",text:`Dear ${k.user.fullName},

Your withdrawal request of $${k.amount} has been rejected.

Reason: ${j}

If you have any questions, please contact our support team.

Best regards,
NSC Bot Team`,html:`
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #00ff00 0%, #00cc00 100%); padding: 30px; text-align: center;">
              <h1 style="color: #000; margin: 0; font-size: 28px;">NSC Bot Platform</h1>
            </div>
            
            <div style="padding: 40px 30px; background: #f9f9f9;">
              <h2 style="color: #333; margin-top: 0;">Withdrawal Request Rejected</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Dear ${k.user.fullName},
              </p>
              
              <div style="background: #fff; border-left: 4px solid #ff0000; padding: 20px; margin: 20px 0;">
                <p style="margin: 0; color: #333; font-size: 16px;">
                  Your withdrawal request of <strong style="color: #00ff00;">$${k.amount} USDT</strong> has been rejected.
                </p>
              </div>
              
              <div style="background: #fff; padding: 20px; margin: 20px 0; border-radius: 5px;">
                <h3 style="color: #333; margin-top: 0;">Rejection Reason:</h3>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">${j}</p>
              </div>
              
              <div style="background: #fff; padding: 20px; margin: 20px 0; border-radius: 5px;">
                <h3 style="color: #333; margin-top: 0;">Withdrawal Details:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Amount:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: bold;">$${k.amount} USDT</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Network:</td>
                    <td style="padding: 8px 0; color: #333;">${k.network}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Wallet Address:</td>
                    <td style="padding: 8px 0; color: #333; font-size: 12px; word-break: break-all;">${k.walletAddress}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Request Date:</td>
                    <td style="padding: 8px 0; color: #333;">${new Date(k.createdAt).toLocaleString()}</td>
                  </tr>
                </table>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                If you have any questions or believe this rejection was made in error, please contact our support team.
              </p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/withdrawals" 
                   style="background: #00ff00; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  View Withdrawals
                </a>
              </div>
            </div>
            
            <div style="background: #333; color: #fff; padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 14px;">
                \xa9 2025 NSC Bot Platform. All rights reserved.
              </p>
              <p style="margin: 10px 0 0; font-size: 12px; color: #999;">
                This is an automated email. Please do not reply directly to this message.
              </p>
            </div>
          </div>
        `})}catch(a){console.error("Failed to send rejection email:",a)}return e.NextResponse.json({success:!0,message:"Withdrawal rejected successfully"})}catch(a){return console.error("Reject withdrawal error:",a),e.NextResponse.json({error:"Failed to reject withdrawal"},{status:500})}}d()}catch(a){d(a)}})},71437:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{handler:()=>z,patchFetch:()=>y,routeModule:()=>A,serverHooks:()=>D,workAsyncStorage:()=>B,workUnitAsyncStorage:()=>C});var e=c(19225),f=c(84006),g=c(8317),h=c(99373),i=c(34775),j=c(98564),k=c(48575),l=c(261),m=c(54365),n=c(90771),o=c(73461),p=c(67798),q=c(92280),r=c(62018),s=c(45696),t=c(47929),u=c(86439),v=c(37527),w=c(65405),x=a([w]);w=(x.then?(await x)():x)[0];let A=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/admin/withdrawals/[id]/reject/route",pathname:"/api/admin/withdrawals/[id]/reject",filename:"route",bundlePath:"app/api/admin/withdrawals/[id]/reject/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"C:\\Users\\LENOVO\\Desktop\\nsc-test\\vercel-download\\src\\app\\api\\admin\\withdrawals\\[id]\\reject\\route.ts",nextConfigOutput:"",userland:w}),{workAsyncStorage:B,workUnitAsyncStorage:C,serverHooks:D}=A;function y(){return(0,g.patchFetch)({workAsyncStorage:B,workUnitAsyncStorage:C})}async function z(a,b,c){A.isDev&&(0,h.addRequestMeta)(a,"devRequestTimingInternalsEnd",process.hrtime.bigint());let d="/api/admin/withdrawals/[id]/reject/route";"/index"===d&&(d="/");let e=await A.prepare(a,b,{srcPage:d,multiZoneDraftMode:!1});if(!e)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:g,params:w,nextConfig:x,parsedUrl:y,isDraftMode:z,prerenderManifest:B,routerServerContext:C,isOnDemandRevalidate:D,revalidateOnlyGenerated:E,resolvedPathname:F,clientReferenceManifest:G,serverActionsManifest:H}=e,I=(0,l.normalizeAppPath)(d),J=!!(B.dynamicRoutes[I]||B.routes[F]),K=async()=>((null==C?void 0:C.render404)?await C.render404(a,b,y,!1):b.end("This page could not be found"),null);if(J&&!z){let a=!!B.routes[F],b=B.dynamicRoutes[I];if(b&&!1===b.fallback&&!a){if(x.experimental.adapterPath)return await K();throw new u.NoFallbackError}}let L=null;!J||A.isDev||z||(L=F,L="/index"===L?"/":L);let M=!0===A.isDev||!J,N=J&&!M;H&&G&&(0,j.setReferenceManifestsSingleton)({page:d,clientReferenceManifest:G,serverActionsManifest:H,serverModuleMap:(0,k.createServerModuleMap)({serverActionsManifest:H})});let O=a.method||"GET",P=(0,i.getTracer)(),Q=P.getActiveScopeSpan(),R={params:w,prerenderManifest:B,renderOpts:{experimental:{authInterrupts:!!x.experimental.authInterrupts},cacheComponents:!!x.cacheComponents,supportsDynamicResponse:M,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:x.cacheLife,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>A.onRequestError(a,b,d,C)},sharedContext:{buildId:g}},S=new m.NodeNextRequest(a),T=new m.NodeNextResponse(b),U=n.NextRequestAdapter.fromNodeNextRequest(S,(0,n.signalFromNodeResponse)(b));try{let e=async a=>A.handle(U,R).finally(()=>{if(!a)return;a.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let c=P.getRootSpanAttributes();if(!c)return;if(c.get("next.span_type")!==o.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${c.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=c.get("next.route");if(e){let b=`${O} ${e}`;a.setAttributes({"next.route":e,"http.route":e,"next.span_name":b}),a.updateName(b)}else a.updateName(`${O} ${d}`)}),g=!!(0,h.getRequestMeta)(a,"minimalMode"),j=async h=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!g&&D&&E&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let d=await e(h);a.fetchMetrics=R.renderOpts.fetchMetrics;let i=R.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=R.renderOpts.collectedTags;if(!J)return await (0,q.I)(S,T,d,R.renderOpts.pendingWaitUntil),null;{let a=await d.blob(),b=(0,r.toNodeOutgoingHttpHeaders)(d.headers);j&&(b[t.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==R.renderOpts.collectedRevalidate&&!(R.renderOpts.collectedRevalidate>=t.INFINITE_CACHE)&&R.renderOpts.collectedRevalidate,e=void 0===R.renderOpts.collectedExpire||R.renderOpts.collectedExpire>=t.INFINITE_CACHE?void 0:R.renderOpts.collectedExpire;return{value:{kind:v.CachedRouteKind.APP_ROUTE,status:d.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:e}}}}catch(b){throw(null==f?void 0:f.isStale)&&await A.onRequestError(a,b,{routerKind:"App Router",routePath:d,routeType:"route",revalidateReason:(0,p.c)({isStaticGeneration:N,isOnDemandRevalidate:D})},C),b}},l=await A.handleResponse({req:a,nextConfig:x,cacheKey:L,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:B,isRoutePPREnabled:!1,isOnDemandRevalidate:D,revalidateOnlyGenerated:E,responseGenerator:k,waitUntil:c.waitUntil,isMinimalMode:g});if(!J)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==v.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});g||b.setHeader("x-nextjs-cache",D?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),z&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,r.fromNodeOutgoingHttpHeaders)(l.value.headers);return g&&J||m.delete(t.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,s.getCacheControlHeader)(l.cacheControl)),await (0,q.I)(S,T,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};Q?await j(Q):await P.withPropagatedContext(a.headers,()=>P.trace(o.BaseServerSpan.handleRequest,{spanName:`${O} ${d}`,kind:i.SpanKind.SERVER,attributes:{"http.method":O,"http.target":a.url}},j))}catch(b){if(b instanceof u.NoFallbackError||await A.onRequestError(a,b,{routerKind:"App Router",routePath:I,routeType:"route",revalidateReason:(0,p.c)({isStaticGeneration:N,isOnDemandRevalidate:D})}),J)throw b;return await (0,q.I)(S,T,new Response(null,{status:500})),null}}d()}catch(a){d(a)}})},74075:a=>{a.exports=require("zlib")},79428:a=>{a.exports=require("buffer")},79646:a=>{a.exports=require("child_process")},81630:a=>{a.exports=require("http")},86439:a=>{a.exports=require("next/dist/shared/lib/no-fallback-error.external")},91645:a=>{a.exports=require("net")},94735:a=>{a.exports=require("events")}};var b=require("../../../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[134,1813,3759,5171,6848,5924,1204,5775],()=>b(b.s=71437));module.exports=c})();