/**
 * Applies the stored theme before first paint.
 *
 * Must be a blocking inline script. Doing this in an effect produces a visible
 * flash of the wrong theme, which is the loudest quality tell on a themed site.
 * Default is light; the stored preference and the OS setting both override it.
 */
export function ThemeScript() {
  const js = `(function(){try{
    var s=localStorage.getItem('theme');
    var t=s||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
    document.documentElement.dataset.theme=t;
    var m=document.querySelector('meta[name="theme-color"]');
    if(m)m.setAttribute('content',t==='dark'?'#0C1013':'#FAF8F4');
  }catch(e){document.documentElement.dataset.theme='light'}})()`
  return <script dangerouslySetInnerHTML={{ __html: js }} />
}
