/* WCAG 2.1 relative-luminance contrast + OKLCH readout for token validation. */
const hex2rgb = h => { h=h.replace('#',''); if(h.length===3) h=h.split('').map(c=>c+c).join('');
  return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255) }
const lin = c => c<=0.04045 ? c/12.92 : ((c+0.055)/1.055)**2.4
const L = h => { const [r,g,b]=hex2rgb(h).map(lin); return 0.2126*r+0.7152*g+0.0722*b }
export const ratio = (a,b) => { const l1=L(a), l2=L(b); const [hi,lo]=l1>l2?[l1,l2]:[l2,l1]; return (hi+0.05)/(lo+0.05) }

/* sRGB → OKLCH (for the lightness band check) */
export function oklch(hexs){
  const [r,g,b]=hex2rgb(hexs).map(lin)
  const l=Math.cbrt(0.4122214708*r+0.5363325363*g+0.0514459929*b)
  const m=Math.cbrt(0.2119034982*r+0.6806995451*g+0.1073969566*b)
  const s=Math.cbrt(0.0883024619*r+0.2817188376*g+0.6299787005*b)
  const Lo=0.2104542553*l+0.7936177850*m-0.0040720468*s
  const A =1.9779984951*l-2.4285922050*m+0.4505937099*s
  const B =0.0259040371*l+0.7827717662*m-0.8086757660*s
  return { L:Lo, C:Math.hypot(A,B), h:(Math.atan2(B,A)*180/Math.PI+360)%360 }
}

export function report(name, pairs){
  let fail=0
  console.log(`\n\x1b[1m${name}\x1b[0m`)
  for (const [label, fg, bg, min, note] of pairs){
    const r = ratio(fg,bg)
    const ok = r >= min
    if(!ok) fail++
    console.log(`  ${ok?'\x1b[32m✓\x1b[0m':'\x1b[31m✗\x1b[0m'} ${label.padEnd(34)} ${r.toFixed(2).padStart(5)}:1  (min ${min})  ${note??''}`)
  }
  return fail
}
