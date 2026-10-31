/** Distinguish a holding spiral from a wide approach with turns in opposite directions. */
export function turnMetrics(headings:number[]){
 let sign=0,run=0,reverse=0,maxContinuous=0,total=0;
 for(let i=1;i<headings.length;i++){
  const raw=headings[i]-headings[i-1],delta=Math.atan2(Math.sin(raw),Math.cos(raw)),amount=Math.abs(delta);
  if(amount<1e-5)continue;
  total+=amount;const next=Math.sign(delta);
  if(!sign){sign=next;run=amount;}
  else if(next===sign){run+=amount;reverse=0;}
  else{reverse+=amount;if(reverse>Math.PI/60){maxContinuous=Math.max(maxContinuous,run);run=reverse;reverse=0;sign=next;}}
  maxContinuous=Math.max(maxContinuous,run);
 }
 return {total,maxContinuous};
}
