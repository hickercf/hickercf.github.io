// All reading and navigation work without JavaScript.
const tocLinks = [...document.querySelectorAll('.reader-toc a')];
const headings = tocLinks.map(link => document.getElementById(decodeURIComponent(link.hash.slice(1)))).filter(Boolean);
if (headings.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      for (const link of tocLinks) {
        if (decodeURIComponent(link.hash.slice(1)) === entry.target.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    }
  }, {rootMargin:'-5% 0px -70% 0px'});
  for (const heading of headings) observer.observe(heading);
}
const backToTop = document.querySelector('.back-to-top');
if (backToTop) {
  const update = () => { backToTop.classList.toggle('visible', window.scrollY > 500); };
  window.addEventListener('scroll', update, {passive:true});
  update();
}
