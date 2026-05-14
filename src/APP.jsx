import { useState, useEffect } from "react";
import { Camera, Plus, Trash2, Download, ChevronLeft, ChevronRight, ImagePlus, X, ChevronDown, FileDown, User, Shirt } from "lucide-react";

const TEAL     = "#1A7A7A";
const TEAL_D   = "#0F5959";
const TEAL_PAL = "#EEF7F7";
const INK      = "#1A1A1A";
const SMOKE    = "#8A8A8A";
const RULE     = "#E2E2E2";
const CREAM    = "#F8F8F5";
const BRAND    = "HIGHTON FASHION";
const SERIF    = '"Cormorant Garamond", "Playfair Display", Georgia, serif';
const SANS     = '"DM Sans", "Inter", system-ui, sans-serif';

const FIT_OPTS = ["Slim","Tailored","Regular","Relaxed","Oversized","Tapered","Straight","Cropped","Athletic","Boxy","Other"];
const OCC_OPTS = ["Meetings","Daily wear","Sports activities","Holiday","Lounge","Other"];
const blankLifestyle = () => ({
  jobRoles:"", activities:"", events:"", style:"", budget:"", styleIcons:"", notes:""
});

const blank = () => ({
  id: crypto.randomUUID(), images:[], imgIdx:0,
  item:"", brand:"", fit:"", fitCustom:"",
  occasion:"", occasionCustom:"", condition:"", decision:"", rating:0, notes:""
});

function loadImg(src) {
  return new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=src; });
}

function drawStarPDF(doc,cx,cy,r,state,teal,grey) {
  const pts=[];
  for(let i=0;i<10;i++){
    const a=(Math.PI/5)*i-Math.PI/2, rad=i%2===0?r:r*0.4;
    pts.push([cx+Math.cos(a)*rad, cy+Math.sin(a)*rad]);
  }
  doc.setLineWidth(0.25);
  if(state==="full"){
    doc.setFillColor(...teal); doc.setDrawColor(...teal);
    for(let i=0;i<10;i++){const a=pts[i],b=pts[(i+1)%10]; doc.triangle(cx,cy,a[0],a[1],b[0],b[1],"F");}
  } else if(state==="half"){
    doc.setFillColor(...teal); doc.setDrawColor(...teal);
    for(let i=0;i<10;i++){const a=pts[i],b=pts[(i+1)%10]; if((a[0]+b[0])/2<=cx+0.1) doc.triangle(cx,cy,a[0],a[1],b[0],b[1],"F");}
  }
  doc.setDrawColor(...(state==="empty"?grey:teal));
  for(let i=0;i<10;i++){const a=pts[i],b=pts[(i+1)%10]; doc.line(a[0],a[1],b[0],b[1]);}
}

function picPlaceholder(doc,x,y,w,h,teal,smoke){
  doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(...teal); doc.setCharSpace(2);
  doc.text("PHOTOGRAPH",x+w/2,y+h/2-3,{align:"center"}); doc.setCharSpace(0);
  doc.setFont("times","italic"); doc.setFontSize(8); doc.setTextColor(...smoke);
  doc.text("(no image added)",x+w/2,y+h/2+5,{align:"center"});
}

function StarSvg({state,size=30}){
  const id=`g${Math.random().toString(36).slice(2,7)}`;
  const fill=state==="full"?TEAL:state==="half"?`url(#${id})`:"none";
  const stroke=state==="empty"?RULE:TEAL;
  return(
    <svg width={size} height={size} viewBox="0 0 24 24">
      <defs><linearGradient id={id} x1="0" x2="1"><stop offset="50%" stopColor={TEAL}/><stop offset="50%" stopColor="transparent"/></linearGradient></defs>
      <path d="M12 2l2.39 6.26L21 9.27l-5 4.87 1.18 6.86L12 17.77l-5.18 3.23L8 14.14 3 9.27l6.61-1.01Z"
        fill={fill} stroke={stroke} strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
}

function Pill({label,selected,onClick}){
  return(
    <button onClick={onClick} style={{
      padding:"9px 18px",cursor:"pointer",
      background:selected?TEAL:"white", color:selected?"white":INK,
      border:`1px solid ${selected?TEAL:RULE}`,
      fontFamily:SERIF, fontSize:15, fontStyle:selected?"normal":"italic", transition:"all .15s"
    }}>{label}</button>
  );
}

function DropField({label,options,value,onChange}){
  return(
    <div>
      <label style={{display:"block",fontSize:10,fontWeight:600,letterSpacing:"0.18em",textTransform:"uppercase",color:TEAL,marginBottom:6}}>{label}</label>
      <div style={{position:"relative"}}>
        <select value={value} onChange={e=>onChange(e.target.value)} style={{
          appearance:"none",background:"transparent",border:"none",
          borderBottom:`1px solid ${RULE}`,padding:"8px 28px 8px 0",
          fontFamily:SERIF,fontSize:18,color:value?INK:SMOKE,width:"100%",cursor:"pointer"
        }}>
          <option value="">Select...</option>
          {options.map(o=><option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={15} style={{position:"absolute",right:0,top:"50%",transform:"translateY(-50%)",color:SMOKE,pointerEvents:"none"}}/>
      </div>
    </div>
  );
}

// ─── Lifestyle Page ───────────────────────────────────────────────────────────

function LifestylePage({ lifestyle, setLifestyle, onGoToWardrobe }) {
  const lf = lifestyle;
  const up = patch => setLifestyle(p => ({ ...p, ...patch }));
  const lbl = (text,mb=6) => <label style={{display:"block",fontSize:10,fontWeight:600,letterSpacing:"0.18em",textTransform:"uppercase",color:TEAL,marginBottom:mb}}>{text}</label>;
  const textIn = (field,placeholder) => (
    <input type="text" value={lf[field]} onChange={e=>up({[field]:e.target.value})} placeholder={placeholder}
      style={{width:"100%",background:"transparent",border:"none",borderBottom:`1px solid ${RULE}`,padding:"8px 0",fontFamily:SERIF,fontSize:18,color:INK}}/>
  );
  const filled = [lf.jobRoles,lf.activities,lf.events,lf.style,lf.budget,lf.styleIcons].filter(Boolean).length;

  return (
    <main style={{maxWidth:1100,margin:"0 auto",padding:"32px 28px 60px"}}>

      <div style={{marginBottom:40,padding:"16px 20px",background:"white",border:`1px solid ${RULE}`,display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div style={{fontSize:10,letterSpacing:"0.16em",fontWeight:600,color:TEAL}}>PROFILE COMPLETION</div>
        <div style={{flex:1,minWidth:120,height:4,background:RULE,borderRadius:2}}>
          <div style={{height:"100%",background:TEAL,borderRadius:2,width:`${Math.round((filled/6)*100)}%`,transition:"width .3s"}}/>
        </div>
        <div style={{fontFamily:SERIF,fontSize:14,color:SMOKE,fontStyle:"italic"}}>{filled} of 6 fields</div>
      </div>

      {/* Professional Life */}
      <div style={{marginBottom:44}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24,paddingBottom:12,borderBottom:`1px solid ${RULE}`}}>
          <div style={{width:28,height:28,background:TEAL,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><User size={14} color="white"/></div>
          <div>
            <div style={{fontFamily:SERIF,fontSize:22,color:INK}}>Professional Life</div>
            <div style={{fontSize:11,color:SMOKE,fontStyle:"italic",marginTop:1}}>Roles, responsibilities and working environment</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"28px 32px"}}>
          <div>{lbl("Job Roles & Industry")}{textIn("jobRoles","e.g. CEO, Financial Services, frequent board meetings")}</div>
          <div>{lbl("Style Direction")}{textIn("style","e.g. Sharp, authoritative, approachable")}</div>
        </div>
      </div>

      {/* Lifestyle & Occasions */}
      <div style={{marginBottom:44}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24,paddingBottom:12,borderBottom:`1px solid ${RULE}`}}>
          <div style={{width:28,height:28,background:TEAL,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Shirt size={14} color="white"/></div>
          <div>
            <div style={{fontFamily:SERIF,fontSize:22,color:INK}}>Lifestyle & Occasions</div>
            <div style={{fontSize:11,color:SMOKE,fontStyle:"italic",marginTop:1}}>How this client actually lives and where they need to dress for</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"28px 32px"}}>
          <div>{lbl("Activities")}{textIn("activities","e.g. Golf, cycling, gym, travel")}</div>
          <div>{lbl("Events")}{textIn("events","e.g. Charity galas, client dinners, weddings")}</div>
        </div>
      </div>

      {/* Style Identity */}
      <div style={{marginBottom:44}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24,paddingBottom:12,borderBottom:`1px solid ${RULE}`}}>
          <div style={{width:28,height:28,background:INK,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{color:"white",fontSize:12,fontWeight:700}}>✦</span></div>
          <div>
            <div style={{fontFamily:SERIF,fontSize:22,color:INK}}>Style Identity</div>
            <div style={{fontSize:11,color:SMOKE,fontStyle:"italic",marginTop:1}}>Budget, aesthetic direction and style icons</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"28px 32px"}}>
          <div>{lbl("Budget")}{textIn("budget","e.g. £3,000–£5,000 per season")}</div>
          <div>
            {lbl("Style Icons")}
            <input type="text" value={lf.styleIcons} onChange={e=>up({styleIcons:e.target.value})}
              placeholder="e.g. Tom Ford, David Beckham, Roger Federer"
              style={{width:"100%",background:"transparent",border:"none",borderBottom:`1px solid ${RULE}`,padding:"8px 0",fontFamily:SERIF,fontSize:18,color:INK}}/>
          </div>
        </div>
      </div>

      {/* Consultant Notes */}
      <div style={{marginBottom:44}}>
        {lbl("Consultant Notes",10)}
        <textarea value={lf.notes} onChange={e=>up({notes:e.target.value})} rows={5}
          placeholder="Initial impressions, client goals, key observations, personality notes..."
          style={{width:"100%",border:`1px solid ${RULE}`,background:"white",padding:"14px 16px",fontFamily:SERIF,fontSize:16,color:INK,resize:"vertical",lineHeight:1.65}}/>
      </div>

      <div style={{borderTop:`1px solid ${RULE}`,paddingTop:32,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:20}}>
        <div>
          <div style={{fontFamily:SERIF,fontSize:22,color:INK,marginBottom:8}}>Ready to assess the wardrobe?</div>
          <div style={{color:SMOKE,fontSize:14,lineHeight:1.7,maxWidth:440}}>
            Lifestyle profile saves automatically. Move to <strong style={{color:INK}}>Wardrobe Assessment</strong> to catalogue each piece.
          </div>
        </div>
        <button onClick={onGoToWardrobe} className="btn" style={{
          display:"inline-flex",alignItems:"center",gap:10,padding:"16px 28px",
          background:TEAL,color:"white",border:"none",cursor:"pointer",
          fontSize:12,letterSpacing:"0.18em",fontWeight:600,transition:"opacity .15s"
        }}>
          <Shirt size={16}/> WARDROBE ASSESSMENT
        </button>
      </div>
    </main>
  );
}

// ─── Wardrobe Page ────────────────────────────────────────────────────────────

function WardrobePage({ items, setItems, idx, setIdx, busy, exportPDF }) {
  const item = items[idx];
  const up = patch => setItems(p => p.map((it,i) => i===idx ? {...it,...patch} : it));
  const addPiece = () => { setItems(p=>[...p,blank()]); setIdx(items.length); };
  const delPiece = () => {
    if(items.length===1){ setItems([blank()]); setIdx(0); return; }
    setItems(p=>p.filter((_,i)=>i!==idx)); setIdx(Math.max(0,idx-1));
  };
  const addImgs = e => {
    const files=Array.from(e.target.files||[]); if(!files.length) return;
    Promise.all(files.map(f=>new Promise(r=>{const rd=new FileReader();rd.onload=ev=>r(ev.target.result);rd.readAsDataURL(f);})))
      .then(urls=>{const prev=item.images; up({images:[...prev,...urls],imgIdx:prev.length});});
    e.target.value="";
  };
  const delImg = i => { const imgs=item.images.filter((_,j)=>j!==i); up({images:imgs,imgIdx:Math.max(0,Math.min(item.imgIdx,imgs.length-1))}); };
  const tapStar = n => {
    const half=n-0.5,full=n;
    if(item.rating===full) up({rating:0}); else if(item.rating===half) up({rating:full}); else up({rating:half});
  };
  const lbl=(text,mb=6)=><label style={{display:"block",fontSize:10,fontWeight:600,letterSpacing:"0.18em",textTransform:"uppercase",color:TEAL,marginBottom:mb}}>{text}</label>;

  return (
    <main style={{maxWidth:1100,margin:"0 auto",padding:"32px 28px 60px"}}>

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 0",borderTop:`1px solid ${RULE}`,borderBottom:`1px solid ${RULE}`,marginBottom:32}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setIdx(Math.max(0,idx-1))} disabled={idx===0}
            style={{background:"none",border:"none",cursor:idx===0?"default":"pointer",opacity:idx===0?.3:1,display:"flex",alignItems:"center"}}><ChevronLeft size={20}/></button>
          <div>
            <div style={{fontSize:9,letterSpacing:"0.2em",fontWeight:600,color:TEAL}}>PIECE</div>
            <div style={{fontFamily:SERIF,fontSize:24,color:INK,lineHeight:1.2}}>
              {idx+1} <span style={{color:SMOKE,fontStyle:"italic",fontSize:18}}>of {items.length}</span>
            </div>
          </div>
          <button onClick={()=>setIdx(Math.min(items.length-1,idx+1))} disabled={idx===items.length-1}
            style={{background:"none",border:"none",cursor:idx===items.length-1?"default":"pointer",opacity:idx===items.length-1?.3:1,display:"flex",alignItems:"center"}}><ChevronRight size={20}/></button>
        </div>
        <div style={{display:"flex",gap:6}}>
          {items.length>1&&(
            <button onClick={delPiece} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"8px 14px",background:"none",border:`1px solid ${RULE}`,cursor:"pointer",fontSize:11,letterSpacing:"0.12em",color:SMOKE}}>
              <Trash2 size={13}/> REMOVE
            </button>
          )}
          <button onClick={addPiece} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"8px 16px",background:TEAL,color:"white",border:"none",cursor:"pointer",fontSize:11,letterSpacing:"0.14em",fontWeight:600}}>
            <Plus size={13}/> ADD PIECE
          </button>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:36,marginBottom:32}}>
        <div>
          <div style={{marginBottom:10}}>{lbl(item.images.length>0?`Photographs (${item.images.length})`:"Photographs",0)}</div>
          <div style={{background:TEAL_PAL,border:`1.5px solid ${TEAL}`,aspectRatio:"4/5",position:"relative",overflow:"hidden"}}>
            {item.images.length>0?(
              <>
                <img src={item.images[item.imgIdx]} alt={`view ${item.imgIdx+1}`} style={{width:"100%",height:"100%",objectFit:"contain",padding:10}}/>
                {item.images.length>1&&(
                  <>
                    <button onClick={()=>up({imgIdx:item.imgIdx===0?item.images.length-1:item.imgIdx-1})}
                      style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,.92)",border:`1px solid ${RULE}`,width:34,height:34,borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><ChevronLeft size={17}/></button>
                    <button onClick={()=>up({imgIdx:(item.imgIdx+1)%item.images.length})}
                      style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,.92)",border:`1px solid ${RULE}`,width:34,height:34,borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><ChevronRight size={17}/></button>
                    <div style={{position:"absolute",top:10,left:10,background:"rgba(26,26,26,.72)",color:"white",fontSize:11,padding:"3px 10px",borderRadius:20}}>{item.imgIdx+1} / {item.images.length}</div>
                  </>
                )}
                <button onClick={()=>delImg(item.imgIdx)} style={{position:"absolute",top:10,right:10,background:"rgba(255,255,255,.92)",border:`1px solid ${RULE}`,width:28,height:28,borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#8B3A3A"}}><X size={13}/></button>
                <label style={{position:"absolute",bottom:12,right:12,background:INK,color:"white",fontSize:10,padding:"8px 13px",cursor:"pointer",letterSpacing:"0.1em",fontWeight:600,display:"inline-flex",alignItems:"center",gap:6}}>
                  <ImagePlus size={12}/>ADD ADDITIONAL PHOTOS<input type="file" accept="image/*" multiple onChange={addImgs} style={{display:"none"}}/>
                </label>
              </>
            ):(
              <label style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",cursor:"pointer",textAlign:"center",padding:"0 24px"}}>
                <Camera size={34} color={TEAL} strokeWidth={1.2}/>
                <div style={{fontFamily:SERIF,fontSize:21,color:TEAL_D,marginTop:14}}>Add Photographs</div>
                <div style={{fontSize:12,color:SMOKE,marginTop:6,fontStyle:"italic"}}>Click to upload — multiple supported</div>
                <input type="file" accept="image/*" multiple onChange={addImgs} style={{display:"none"}}/>
              </label>
            )}
          </div>
          {item.images.length>1&&(
            <div className="sc" style={{display:"flex",gap:8,marginTop:10,overflowX:"auto",paddingBottom:2}}>
              {item.images.map((src,i)=>(
                <button key={i} onClick={()=>up({imgIdx:i})} style={{flex:"0 0 auto",width:54,height:54,border:`2px solid ${i===item.imgIdx?TEAL:RULE}`,background:TEAL_PAL,cursor:"pointer",padding:0,overflow:"hidden"}}>
                  <img src={src} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                </button>
              ))}
              <label style={{flex:"0 0 auto",width:54,height:54,border:`2px dashed ${TEAL}`,background:"white",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:TEAL}}>
                <Plus size={18}/><input type="file" accept="image/*" multiple onChange={addImgs} style={{display:"none"}}/>
              </label>
            </div>
          )}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"22px 20px",alignContent:"start"}}>
          <div>
            {lbl("Item")}
            <input type="text" value={item.item} onChange={e=>up({item:e.target.value})} placeholder="e.g. Navy wool blazer"
              style={{width:"100%",background:"transparent",border:"none",borderBottom:`1px solid ${RULE}`,padding:"8px 0",fontFamily:SERIF,fontSize:18,color:INK}}/>
          </div>
          <div>
            {lbl("Brand")}
            <input type="text" value={item.brand} onChange={e=>up({brand:e.target.value})} placeholder="e.g. Canali"
              style={{width:"100%",background:"transparent",border:"none",borderBottom:`1px solid ${RULE}`,padding:"8px 0",fontFamily:SERIF,fontSize:18,color:INK}}/>
          </div>
          <div>
            <DropField label="Fit" options={FIT_OPTS} value={item.fit} onChange={v=>up({fit:v,fitCustom:v==="Other"?item.fitCustom:""})}/>
            {item.fit==="Other"&&<input type="text" value={item.fitCustom} onChange={e=>up({fitCustom:e.target.value})} placeholder="Describe fit..." autoFocus style={{width:"100%",background:"transparent",border:"none",borderBottom:`1px solid ${TEAL}`,padding:"8px 0",fontFamily:SERIF,fontSize:16,color:INK,marginTop:10}}/>}
          </div>
          <div>
            <DropField label="Occasion" options={OCC_OPTS} value={item.occasion} onChange={v=>up({occasion:v,occasionCustom:v==="Other"?item.occasionCustom:""})}/>
            {item.occasion==="Other"&&<input type="text" value={item.occasionCustom} onChange={e=>up({occasionCustom:e.target.value})} placeholder="Describe occasion..." autoFocus style={{width:"100%",background:"transparent",border:"none",borderBottom:`1px solid ${TEAL}`,padding:"8px 0",fontFamily:SERIF,fontSize:16,color:INK,marginTop:10}}/>}
          </div>
          <div style={{gridColumn:"1/-1"}}>
            {lbl("Condition",10)}
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {["Good","Fair","Worn"].map(o=><Pill key={o} label={o} selected={item.condition===o} onClick={()=>up({condition:item.condition===o?"":o})}/>)}
            </div>
          </div>
          <div style={{gridColumn:"1/-1"}}>
            {lbl("Decision",10)}
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {["Keep","Tailor","Donate"].map(o=><Pill key={o} label={o} selected={item.decision===o} onClick={()=>up({decision:item.decision===o?"":o})}/>)}
            </div>
          </div>
          <div style={{gridColumn:"1/-1"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              {lbl("Client Rating",0)}
              {item.rating>0&&<button onClick={()=>up({rating:0})} style={{fontSize:10,color:SMOKE,letterSpacing:"0.1em",background:"none",border:"none",cursor:"pointer"}}>CLEAR</button>}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              {[1,2,3,4,5].map(n=>{
                const state=item.rating>=n?"full":item.rating>=n-0.5?"half":"empty";
                return <button key={n} onClick={()=>tapStar(n)} style={{background:"none",border:"none",cursor:"pointer",padding:3}}><StarSvg state={state} size={32}/></button>;
              })}
              <span style={{marginLeft:10,fontFamily:SERIF,fontStyle:"italic",color:SMOKE,fontSize:14}}>{item.rating>0?`${item.rating} of 5`:"Not rated"}</span>
            </div>
            <div style={{fontSize:11,color:SMOKE,fontStyle:"italic",marginTop:6}}>Tap once = half star · Tap twice = full star</div>
          </div>
        </div>
      </div>

      <div style={{marginBottom:36}}>
        {lbl("Stylist Notes",10)}
        <textarea value={item.notes} onChange={e=>up({notes:e.target.value})} rows={4}
          placeholder="Observations on fit, styling potential, key opportunities..."
          style={{width:"100%",border:`1px solid ${RULE}`,background:"white",padding:"14px 16px",fontFamily:SERIF,fontSize:16,color:INK,resize:"vertical",lineHeight:1.65}}/>
      </div>

      {items.length>1&&(
        <div style={{borderTop:`1px solid ${RULE}`,paddingTop:20,marginBottom:36}}>
          {lbl("All Pieces",12)}
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {items.map((it,i)=>(
              <button key={it.id} onClick={()=>setIdx(i)} style={{
                display:"inline-flex",alignItems:"center",gap:8,padding:"8px 14px",
                background:i===idx?INK:"white",color:i===idx?"white":INK,
                border:`1px solid ${i===idx?INK:RULE}`,cursor:"pointer",fontSize:12,letterSpacing:"0.08em"
              }}>
                {it.images[0]&&<img src={it.images[0]} alt="" style={{width:22,height:22,objectFit:"cover"}}/>}
                <span style={{fontWeight:600}}>{String(i+1).padStart(2,"0")}</span>
                {it.item&&<span style={{fontFamily:SERIF,fontStyle:"italic",letterSpacing:0}}>{it.item}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{borderTop:`1px solid ${RULE}`,paddingTop:32,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:20}}>
        <div>
          <div style={{fontFamily:SERIF,fontSize:22,color:INK,marginBottom:8}}>Ready to export?</div>
          <div style={{color:SMOKE,fontSize:14,lineHeight:1.7,maxWidth:460}}>
            Click <strong style={{color:INK}}>Export PDF</strong> to download the full report — lifestyle profile first, then one page per wardrobe piece.
          </div>
        </div>
        <button onClick={exportPDF} disabled={busy} className="btn" style={{
          display:"inline-flex",alignItems:"center",gap:10,padding:"16px 28px",
          background:TEAL,color:"white",border:"none",cursor:busy?"wait":"pointer",
          fontSize:12,letterSpacing:"0.18em",fontWeight:600,opacity:busy?.55:1,transition:"opacity .15s"
        }}>
          <FileDown size={18}/>{busy?"GENERATING...":"EXPORT PDF"}
        </button>
      </div>
    </main>
  );
}

// ─── Storage & Root App ───────────────────────────────────────────────────────

const STORAGE_KEY = "highton_wardrobe_session";
function loadSession(){ try{ const r=localStorage.getItem(STORAGE_KEY); return r?JSON.parse(r):null; }catch{ return null; } }

export default function App(){
  const saved = loadSession();
  const [page, setPage] = useState(saved?.page ?? "lifestyle");
  const [client, setClient] = useState(saved?.client ?? "");
  const [date, setDate] = useState(saved?.date ?? new Date().toISOString().slice(0,10));
  const [lifestyle, setLifestyle] = useState(saved?.lifestyle ?? blankLifestyle());
  const [items, setItems] = useState(()=>saved?.items?.length?saved.items:[blank()]);
  const [idx, setIdx] = useState(()=>Math.min(saved?.idx??0,(saved?.items?.length??1)-1));
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(()=>{
    try{ localStorage.setItem(STORAGE_KEY,JSON.stringify({page,client,date,lifestyle,items,idx})); }
    catch(e){ console.warn("Storage error:",e); }
  },[page,client,date,lifestyle,items,idx]);

  const clearSession = () => {
    try{ localStorage.removeItem(STORAGE_KEY); }catch{}
    setClient(""); setDate(new Date().toISOString().slice(0,10));
    setLifestyle(blankLifestyle()); setItems([blank()]); setIdx(0); setPage("lifestyle");
    setToast({ok:true,msg:"Session cleared — ready for a new client."});
  };

  const exportPDF = async () => {
    setBusy(true); setToast(null);
    try{
      if(!window.jspdf) await new Promise((res,rej)=>{
        const s=document.createElement("script");
        s.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        s.onload=res; s.onerror=()=>rej(new Error("Could not load PDF library"));
        document.head.appendChild(s);
      });

      const {jsPDF}=window.jspdf;
      const doc=new jsPDF({unit:"mm",format:"a4"});
      const W=210,H=297,M=16;
      const teal=[26,122,122],tPal=[238,247,247],ink=[26,26,26],smoke=[138,138,138],rule=[226,226,226];
      const ds=date?new Date(date).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}):"";
      const lf=lifestyle;

      // Page 1 – Lifestyle
      doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.setTextColor(...smoke); doc.setCharSpace(1.2);
      doc.text(BRAND,M,M); doc.setCharSpace(0);
      doc.text(ds.toUpperCase(),W-M,M,{align:"right"});
      doc.setDrawColor(...rule); doc.setLineWidth(0.15); doc.line(M,M+3,W-M,M+3);
      doc.setFont("times","normal"); doc.setFontSize(36); doc.setTextColor(...ink); doc.text("Lifestyle",M,M+20);
      doc.setFont("times","italic"); doc.setTextColor(...teal); doc.text("Assessment",M,M+32);
      doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.setTextColor(...smoke); doc.setCharSpace(1.2);
      doc.text("CLIENT",W-M,M+16,{align:"right"}); doc.setCharSpace(0);
      doc.setFont("times","normal"); doc.setFontSize(15); doc.setTextColor(...ink);
      doc.text(client||"—",W-M,M+23,{align:"right"});
      doc.setDrawColor(...teal); doc.setLineWidth(0.5); doc.line(M,M+42,W-M,M+42);

      const lifFields=[
        ["JOB ROLES & INDUSTRY",lf.jobRoles],["STYLE DIRECTION",lf.style],
        ["ACTIVITIES",lf.activities],["EVENTS",lf.events],
        ["BUDGET",lf.budget],["STYLE ICONS",lf.styleIcons],
      ];
      const colW2=(W-M*2-8)/2, col1=M, col2=M+colW2+8;
      let ly=M+56;
      lifFields.forEach(([label,val],fi)=>{
        const x=fi%2===0?col1:col2;
        if(fi%2===0&&fi>0) ly+=36;
        doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.setTextColor(...teal); doc.setCharSpace(1.5);
        doc.text(label,x,ly); doc.setCharSpace(0);
        doc.setFont("times","normal"); doc.setFontSize(12); doc.setTextColor(...ink);
        doc.text(doc.splitTextToSize(val||"—",colW2).slice(0,2),x,ly+7);
        doc.setDrawColor(...rule); doc.setLineWidth(0.2); doc.line(x,ly+18,x+colW2,ly+18);
      });
      ly+=44;
      if(lf.notes&&lf.notes.trim()){
        doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.setTextColor(...teal); doc.setCharSpace(1.5);
        doc.text("CONSULTANT NOTES",M,ly); doc.setCharSpace(0);
        doc.setFont("times","normal"); doc.setFontSize(11); doc.setTextColor(...ink);
        doc.text(doc.splitTextToSize(lf.notes,W-M*2).slice(0,8),M,ly+9);
      }
      doc.setDrawColor(...teal); doc.setLineWidth(0.4); doc.line(M,H-14,W-M,H-14);
      doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(...ink); doc.setCharSpace(1.5);
      doc.text(BRAND,M,H-9); doc.setCharSpace(0);
      doc.setFont("helvetica","normal"); doc.setTextColor(...smoke);
      doc.text("CONFIDENTIAL CLIENT DOCUMENT",W-M,H-9,{align:"right"});

      // Pages 2+ – Wardrobe
      const toRender=items.filter(it=>it.item||it.brand||it.images.length||it.notes);
      const list=toRender.length?toRender:items;

      for(let pi=0;pi<list.length;pi++){
        doc.addPage();
        const it=list[pi];
        const fit=it.fit==="Other"?it.fitCustom:it.fit;
        const occ=it.occasion==="Other"?it.occasionCustom:it.occasion;

        doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.setTextColor(...smoke); doc.setCharSpace(1.2);
        doc.text(BRAND,M,M); doc.setCharSpace(0);
        doc.text(ds.toUpperCase(),W-M,M,{align:"right"});
        doc.setDrawColor(...rule); doc.setLineWidth(0.15); doc.line(M,M+3,W-M,M+3);
        doc.setFont("times","normal"); doc.setFontSize(36); doc.setTextColor(...ink); doc.text("Wardrobe",M,M+20);
        doc.setFont("times","italic"); doc.setTextColor(...teal); doc.text("Assessment",M,M+32);
        doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.setTextColor(...smoke); doc.setCharSpace(1.2);
        doc.text("CLIENT",W-M,M+16,{align:"right"}); doc.setCharSpace(0);
        doc.setFont("times","normal"); doc.setFontSize(15); doc.setTextColor(...ink);
        doc.text(client||"—",W-M,M+23,{align:"right"});
        doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.setTextColor(...smoke); doc.setCharSpace(1.2);
        doc.text("PIECE",W-M,M+30,{align:"right"}); doc.setCharSpace(0);
        doc.setFont("times","normal"); doc.setFontSize(15); doc.setTextColor(...ink);
        doc.text(`${pi+1} of ${list.length}`,W-M,M+37,{align:"right"});
        doc.setDrawColor(...teal); doc.setLineWidth(0.5); doc.line(M,M+42,W-M,M+42);

        const px=M,py=M+50,pw=85,ph=108;
        doc.setFillColor(...tPal); doc.rect(px,py,pw,ph,"F");
        doc.setDrawColor(...teal); doc.setLineWidth(0.3); doc.rect(px,py,pw,ph);
        if(it.images[0]){
          try{
            const src=it.images[0],img=await loadImg(src),fmt=src.includes("data:image/png")?"PNG":"JPEG";
            const r=img.width/img.height,aW=pw-6,aH=ph-6;
            let dW,dH; if(r>aW/aH){dW=aW;dH=aW/r;}else{dH=aH;dW=aH*r;}
            doc.addImage(src,fmt,px+(pw-dW)/2,py+(ph-dH)/2,dW,dH);
          }catch{ picPlaceholder(doc,px,py,pw,ph,teal,smoke); }
        } else { picPlaceholder(doc,px,py,pw,ph,teal,smoke); }

        if(it.images.length>1){
          const ty=py+ph+4,ts=14,tg=2,max=Math.min(it.images.length-1,4);
          for(let t=0;t<max;t++){
            const tx=px+t*(ts+tg),tsrc=it.images[t+1];
            doc.setFillColor(...tPal); doc.rect(tx,ty,ts,ts,"F");
            doc.setDrawColor(...rule); doc.setLineWidth(0.15); doc.rect(tx,ty,ts,ts);
            try{
              const img=await loadImg(tsrc),fmt=tsrc.includes("data:image/png")?"PNG":"JPEG";
              const r=img.width/img.height; let dW,dH;
              if(r>1){dW=ts-1;dH=dW/r;}else{dH=ts-1;dW=dH*r;}
              doc.addImage(tsrc,fmt,tx+(ts-dW)/2,ty+(ts-dH)/2,dW,dH);
            }catch{}
          }
          if(it.images.length>5){ doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.setTextColor(...smoke); doc.text(`+${it.images.length-5}`,px+4*(ts+tg)+2,ty+ts/2+1); }
        }

        const fx=px+pw+10,fw=W-M-fx,cw=(fw-4)/2;
        const field=(lb,val,x,y,w)=>{
          doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.setTextColor(...teal); doc.setCharSpace(1.5);
          doc.text(lb.toUpperCase(),x,y); doc.setCharSpace(0);
          doc.setFont("times","normal"); doc.setFontSize(12); doc.setTextColor(...ink);
          doc.text(doc.splitTextToSize(val||"—",w).slice(0,2),x,y+7);
          doc.setDrawColor(...ink); doc.setLineWidth(0.25); doc.line(x,y+16,x+w,y+16);
        };
        field("Item",it.item,fx,py+6,cw); field("Brand",it.brand,fx+cw+4,py+6,cw);
        field("Fit",fit,fx,py+28,cw); field("Occasion",occ,fx+cw+4,py+28,cw);

        const cy2=py+ph+24;
        const choices=(lb,opts,sel,x,y)=>{
          doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.setTextColor(...teal); doc.setCharSpace(1.5);
          doc.text(lb.toUpperCase(),x,y); doc.setCharSpace(0);
          let cx2=x;
          opts.forEach(o=>{
            const s2=o===sel;
            doc.setDrawColor(...(s2?teal:rule)); doc.setLineWidth(0.3); doc.circle(cx2+2,y+7,1.8);
            if(s2){doc.setFillColor(...teal); doc.circle(cx2+2,y+7,1.1,"F");}
            doc.setFont("times",s2?"bold":"normal"); doc.setFontSize(10); doc.setTextColor(...(s2?ink:smoke));
            doc.text(o,cx2+6,y+7.8); cx2+=doc.getTextWidth(o)+11;
          });
        };
        const hw=(W-M*2-6)/2;
        choices("Condition",["Good","Fair","Worn"],it.condition,M,cy2);
        choices("Decision",["Keep","Tailor","Donate"],it.decision,M+hw+6,cy2);
        doc.setDrawColor(...rule); doc.setLineWidth(0.15);
        doc.line(M,cy2+14,M+hw,cy2+14); doc.line(M+hw+6,cy2+14,W-M,cy2+14);

        const ry=cy2+24;
        doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.setTextColor(...teal); doc.setCharSpace(1.5);
        doc.text("CLIENT RATING",M,ry); doc.setCharSpace(0);
        for(let s=1;s<=5;s++){
          const sx=M+4+(s-1)*10,state=it.rating>=s?"full":it.rating>=s-0.5?"half":"empty";
          drawStarPDF(doc,sx,ry+8,3,state,teal,rule);
        }
        doc.setFont("times","italic"); doc.setFontSize(9); doc.setTextColor(...smoke);
        doc.text(`${it.rating} / 5`,M+60,ry+9);

        const ny=ry+22;
        doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.setTextColor(...teal); doc.setCharSpace(1.5);
        doc.text("STYLIST NOTES",M,ny); doc.setCharSpace(0);
        if(it.notes&&it.notes.trim()){
          doc.setFont("times","normal"); doc.setFontSize(11); doc.setTextColor(...ink);
          doc.text(doc.splitTextToSize(it.notes,W-M*2).slice(0,6),M,ny+9);
        } else {
          doc.setDrawColor(...rule); doc.setLineWidth(0.12);
          for(let i=0;i<4;i++) doc.line(M,ny+10+i*7,W-M,ny+10+i*7);
        }

        doc.setDrawColor(...teal); doc.setLineWidth(0.4); doc.line(M,H-14,W-M,H-14);
        doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(...ink); doc.setCharSpace(1.5);
        doc.text(BRAND,M,H-9); doc.setCharSpace(0);
        doc.setFont("helvetica","normal"); doc.setTextColor(...smoke);
        doc.text("CONFIDENTIAL CLIENT DOCUMENT",W-M,H-9,{align:"right"});
      }

      const fname=`Highton_Assessment_${(client||"Client").replace(/\s+/g,"_")}_${date}.pdf`;
      doc.save(fname);
      setToast({ok:true,msg:`PDF saved — "${fname}" in your Downloads folder`});
    } catch(e){
      console.error(e);
      setToast({ok:false,msg:`Could not generate PDF: ${e.message}`});
    } finally {
      setBusy(false);
      setTimeout(()=>setToast(null),14000);
    }
  };

  return(
    <div style={{minHeight:"100vh",background:CREAM,fontFamily:SANS}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        select,input,textarea{outline:none;}
        .sc::-webkit-scrollbar{display:none;} .sc{scrollbar-width:none;}
        .btn:hover{opacity:.85;} .btn:active{transform:scale(.97);}
        input[type=date]{color-scheme:light;}
      `}</style>

      <header style={{background:"white",borderBottom:`1px solid ${RULE}`}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"20px 28px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{fontSize:10,letterSpacing:"0.22em",fontWeight:600,color:SMOKE}}>{BRAND}</span>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <button onClick={clearSession} className="btn" style={{padding:"8px 14px",background:"white",color:SMOKE,border:`1px solid ${RULE}`,cursor:"pointer",fontSize:10,letterSpacing:"0.16em",fontWeight:600}}>NEW SESSION</button>
              <button onClick={exportPDF} disabled={busy} className="btn" style={{display:"inline-flex",alignItems:"center",gap:6,padding:"8px 16px",background:INK,color:"white",border:"none",cursor:busy?"wait":"pointer",fontSize:10,letterSpacing:"0.16em",fontWeight:600,opacity:busy?.55:1}}>
                <Download size={12}/>{busy?"GENERATING...":"EXPORT PDF"}
              </button>
            </div>
          </div>
          <div style={{borderTop:`1px solid ${RULE}`,marginBottom:16}}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:28,marginBottom:16}}>
            <div>
              <label style={{display:"block",fontSize:9,fontWeight:600,letterSpacing:"0.18em",textTransform:"uppercase",color:TEAL,marginBottom:4}}>Client Name</label>
              <input type="text" value={client} onChange={e=>setClient(e.target.value)} placeholder="Full name"
                style={{width:"100%",background:"transparent",border:"none",borderBottom:`1px solid ${RULE}`,padding:"6px 0",fontFamily:SERIF,fontSize:18,color:INK}}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:9,fontWeight:600,letterSpacing:"0.18em",textTransform:"uppercase",color:TEAL,marginBottom:4}}>Assessment Date</label>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)}
                style={{width:"100%",background:"transparent",border:"none",borderBottom:`1px solid ${RULE}`,padding:"6px 0",fontFamily:SERIF,fontSize:18,color:INK}}/>
            </div>
          </div>
          <div style={{display:"flex",gap:0}}>
            {[
              {key:"lifestyle",icon:<User size={13}/>,label:"Lifestyle Assessment"},
              {key:"wardrobe",icon:<Shirt size={13}/>,label:`Wardrobe (${items.length})`}
            ].map(tab=>(
              <button key={tab.key} onClick={()=>setPage(tab.key)} style={{
                display:"inline-flex",alignItems:"center",gap:7,padding:"12px 22px",
                background:"none",border:"none",borderBottom:`2px solid ${page===tab.key?TEAL:"transparent"}`,
                color:page===tab.key?TEAL:SMOKE,fontSize:11,letterSpacing:"0.14em",fontWeight:600,cursor:"pointer",transition:"color .15s",fontFamily:SANS
              }}>{tab.icon}{tab.label.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </header>

      {toast&&(
        <div style={{background:toast.ok?"#EEF7F7":"#FDF2F2",borderBottom:`1px solid ${toast.ok?"#A8D4D4":"#E5B5B5"}`,padding:"14px 28px"}}>
          <div style={{maxWidth:1100,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontFamily:SERIF,fontSize:15,color:toast.ok?TEAL_D:"#8B3A3A"}}>{toast.ok?"✓ ":""}{toast.msg}</span>
            <button onClick={()=>setToast(null)} style={{background:"none",border:"none",cursor:"pointer",color:SMOKE}}><X size={16}/></button>
          </div>
        </div>
      )}

      {page==="lifestyle"
        ? <LifestylePage lifestyle={lifestyle} setLifestyle={setLifestyle} onGoToWardrobe={()=>setPage("wardrobe")}/>
        : <WardrobePage items={items} setItems={setItems} idx={idx} setIdx={setIdx} busy={busy} exportPDF={exportPDF}/>
      }

      <footer style={{borderTop:`1px solid ${RULE}`,background:"white",padding:"18px 28px"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:10,letterSpacing:"0.2em",fontWeight:600,color:INK}}>{BRAND}</span>
          <span style={{fontSize:10,letterSpacing:"0.18em",color:SMOKE}}>CONFIDENTIAL CLIENT DOCUMENT</span>
        </div>
      </footer>
    </div>
  );
}
