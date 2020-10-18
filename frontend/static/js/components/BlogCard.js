function getTemplate(id) {
  const imgId = id * 5;
  return `  
  <link rel="stylesheet" href="/static/css/main.css">

  <div class="card mx-auto" style="width: 18rem;">
    <img src="https://picsum.photos/id/${ imgId }/300/200" class="card-img-top" alt="random image">
    <div class="card-body">
      <h5 class="card-title"><slot name="title" /></h5>
      <h6><slot name="author" /></h6>
      <small><slot name="date" /></small>
      <p class="card-text"><slot name="description" /></p>
      <div><slot name="link" /></div>
    </div>
  </div>
`;
}

export default class BlogCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    const id = this.getAttribute("id");
    const template = document.createElement('template');
    template.innerHTML = getTemplate(id); 
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }  
}

window.customElements.define('blog-card', BlogCard);