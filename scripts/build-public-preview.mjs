import{spawnSync}from'node:child_process';import{createRequire}from'node:module';import{writeFileSync,rmSync}from'node:fs';const require=createRequire(import.meta.url);
const env={...process.env,VITE_PUBLIC_PREVIEW_ONLY:'true',VITE_SUPABASE_URL:'',VITE_SUPABASE_ANON_KEY:'',VITE_SUPABASE_PUBLISHABLE_KEY:''};
for(const [bin,args]of [[require.resolve('typescript/bin/tsc'),['--noEmit']],[require.resolve('vite/package.json').replace(/package\.json$/,'bin/vite.js'),['build']]]){const r=spawnSync(process.execPath,[bin,...args],{stdio:'inherit',env});if(r.status!==0)process.exit(r.status??1);}
rmSync('dist/assets/sacombank-owner-qr.jpg',{force:true});
writeFileSync('dist/release-profile.json',JSON.stringify({profile:'public-preview',checkout:false,customerData:false,built:new Date().toISOString()},null,2));
console.log('Built public preview: no Auth or order forms. Run npm run check:deploy before publishing.');
