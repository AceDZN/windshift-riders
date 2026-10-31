import type {Level} from './levels';
export type FlightMode='ready'|'flying'|'paused'|'landed'|'short';
export type Input={bank:number;pitch:number;brake:boolean};
export type FlightState={x:number;y:number;z:number;heading:number;bank:number;pitch:number;speed:number;vy:number;time:number;mode:FlightMode;gate:number;score:number;combo:number;usedHint:boolean;decision:boolean;controlPenalty:number;liftGain:number;liftTime:number;maxY:number;assist:boolean;message:string;trace:{x:number;y:number;z:number}[]};
export const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
export function coastX(z:number){return -365+45*Math.sin(z*.004)+25*Math.sin(z*.009);}
export function terrainHeight(l:Level,x:number,z:number){
 const coast=coastX(z); if(x<coast-12)return -5;
 const inland=clamp((x-coast)/65,0,1);
 let y=22+5*Math.sin(x*.012+z*.004)+4*Math.cos(z*.018);
 for(const h of l.hills)y+=h.height*Math.exp(-(((x-h.x)/h.rx)**2)-((z-h.z)/h.rz)**2);
 // Remote relief keeps the horizon legible; it lies beyond the authored courses.
 y+=380*Math.exp(-(((x-900)/430)**2)-((z+1800)/750)**2);
 y+=480*Math.exp(-(((x-1500)/520)**2)-((z+2300)/650)**2);
 y+=280*Math.exp(-(((x-100)/360)**2)-((z+2500)/400)**2);
 // A flat landing meadow blends smoothly into the same terrain used by collision.
 const d=Math.hypot(x-l.landing.x,z-l.landing.z);const flatten=clamp(1-d/(l.landing.r+35),0,1);
 y=y*(1-flatten)+24*flatten;
 return y*inland;
}
export function airAt(l:Level,x:number,y:number,z:number,time:number){
 const w=l.windShift&&time>=l.windShift.at?l.windShift:l.wind;
 const ground=terrainHeight(l,x,z),agl=y-ground;
 let sun=l.night?0:l.sunset?clamp(1-time/100,0,1):1;
 let thermal=0,source='אוויר שקט',maxContribution=0;
 const shadow=l.shadow?Math.exp(-(((x-l.shadow.x-l.shadow.speed*time)/l.shadow.r)**2)-((z-l.shadow.z)/l.shadow.r)**2):0;
 for(const p of l.patches){
  const distance=Math.hypot(x-p.x,z-p.z)/p.r;
  const localSun=sun*p.sun*(1-.88*shadow);
  const t=13*localSun*(1-p.moisture)/p.capacity*Math.exp(-distance*distance*1.6)*clamp(1-Math.max(0,agl-240)/300,0,1);
  thermal+=t;
  if(t>maxContribution){maxContribution=t;source=p.label;}
 }
 let ridge=0;
 if(l.ridge){
  const dx=(terrainHeight(l,x+3,z)-terrainHeight(l,x-3,z))/6;
  const dz=(terrainHeight(l,x,z+3)-terrainHeight(l,x,z-3))/6;
  ridge=clamp((w.x*dx+w.z*dz)*2.3,-8,12)*Math.exp(-Math.max(0,agl-25)/170);
  if(Math.abs(ridge)>maxContribution)source=ridge>0?'מדרון מול הרוח · אוויר עולה':'צד חסוי · אוויר יורד';
 }
 const lift=clamp(thermal+ridge,-10,15)*clamp((agl+5)/20,0,1);
 return {lift,thermal,ridge,windX:w.x,windZ:w.z,sun,shadow,source};
}
export function createState(l:Level,assist=false):FlightState{return {...l.launch,bank:0,pitch:0,speed:28,vy:0,time:0,mode:'ready',gate:0,score:0,combo:1,usedHint:false,decision:false,controlPenalty:0,liftGain:0,liftTime:0,maxY:l.launch.y,assist,message:'',trace:[]};}
export function step(s:FlightState,l:Level,input:Input,dt:number){
 if(s.mode!=='flying'||dt<=0)return;
 dt=Math.min(dt,.05); s.time+=dt;
 const target=clamp(input.bank,-1,1)*.82;
 s.bank+=(target-s.bank)*(1-Math.exp(-dt*4.2));
 s.pitch+=(clamp(input.pitch,-1,1)-s.pitch)*(1-Math.exp(-dt*3));
 s.heading+=Math.tan(s.bank)*.8*dt;
 const a=airAt(l,s.x,s.y,s.z,s.time);
 const oldSpeed=s.speed;
 // Only deliberate pitch exchanges kinetic energy for height. Drag dissipates energy.
 const pitchedSpeed=clamp(oldSpeed-s.pitch*5.5*dt,13,48);
 let speedTrade=-(pitchedSpeed*pitchedSpeed-oldSpeed*oldSpeed)/(2*9.81*dt);
 const regulation=(28-pitchedSpeed)*.18;
 const regulatedSpeed=clamp(pitchedSpeed+Math.max(0,regulation)*dt,13,48);
 speedTrade-=Math.max(0,regulatedSpeed*regulatedSpeed-pitchedSpeed*pitchedSpeed)/(2*9.81*dt);
 s.speed=clamp(regulatedSpeed+(Math.min(0,regulation)-(input.brake?8:0))*dt,13,48);
 const bankLoss=1.9*Math.abs(s.bank)**2;
 const sink=1.45+bankLoss+(s.speed<19?(19-s.speed)*.6:0)+(input.brake?5.5:0);
 s.vy=a.lift-sink+speedTrade;
 s.y+=s.vy*dt;
 s.x+=(Math.sin(s.heading)*s.speed+a.windX)*dt;
 s.z+=(-Math.cos(s.heading)*s.speed+a.windZ)*dt;
 s.maxY=Math.max(s.maxY,s.y);
 if(a.lift>2.2){s.liftTime+=dt;s.liftGain+=Math.max(0,s.vy)*dt;}
 if(Math.abs(s.bank)>.7)s.controlPenalty+=dt;
 if(s.speed<18)s.controlPenalty+=dt*2;
 const ground=terrainHeight(l,s.x,s.z),agl=s.y-ground;
 s.combo=agl<40&&agl>9?1+clamp((40-agl)/15,0,2):1;
 s.score+=dt*(s.speed*.8)*s.combo;
 const g=l.gates[s.gate];
 if(g&&Math.hypot(s.x-g.x,s.z-g.z)<g.r&&Math.abs(s.y-g.y)<g.r){s.gate++;s.score+=600;s.message='מעבר נקי!';}
 if(l.decision==='track')s.decision=s.gate>0&&s.time>5;
 else s.decision=s.liftTime>6&&s.liftGain>24;
 if(Math.floor(s.time*5)>s.trace.length&&s.trace.length<1800)s.trace.push({x:s.x,y:s.y,z:s.z});
 const landingDistance=Math.hypot(s.x-l.landing.x,s.z-l.landing.z);
 if(agl<=4){
  s.y=ground+4;
  if(s.gate===l.gates.length&&landingDistance<l.landing.r&&s.speed<=31){s.mode='landed';s.score+=Math.max(0,Math.round((l.par-s.time)*12))+1200;s.message='נחיתה נהדרת';}
  else{s.mode='short';s.message=s.speed>31?'הגישה הייתה מהירה מדי':'נחתתם לפני היעד';}
 }
 if(s.y<2||Math.abs(s.x)>1600||s.z< -2200||s.z>1000||s.time>240){s.mode='short';s.message='יצאתם מטווח המסלול';}
}
export function medals(s:FlightState){return {finish:s.mode==='landed',control:s.mode==='landed'&&s.controlPenalty<8&&s.speed<30,environment:s.mode==='landed'&&s.decision&&!s.usedHint&&!s.assist};}
