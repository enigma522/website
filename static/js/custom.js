// // Force dark mode by default
// if (!localStorage.getItem('theme')) {
//   document.documentElement.setAttribute('data-theme', 'dark');
//   localStorage.setItem('theme', 'dark');
// }
// localStorage.setItem('theme', 'dark');


const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
const tocLinks = document.querySelectorAll(".post-toc a");

window.addEventListener("scroll", () => {
  let current = "";

  headings.forEach((heading) => {
    const headingTop = heading.offsetTop;
    if (scrollY >= headingTop - 100) {
      current = heading.getAttribute("id");
    }
  });

  tocLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("active");
    }
  });
});

