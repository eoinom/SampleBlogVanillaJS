import AbstractView from "./AbstractView.js";
import BlogCard from "../components/BlogCard.js";
import { API_BASE_URL } from "../index.js"
import FormatDate from "../functions/FormatDate.js"
import AvatarSrc from "../functions/AvatarSrc.js"

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Sample Blog");
  }

  async getPosts() {
    let posts = await fetch(`${API_BASE_URL}/posts`).then(function (response) {
      return response.json();
    }).catch(function (error) {
      console.error('Error in retrieving posts');
      console.error(error);
    })
    return posts
  }


  async getHtml() {
    let posts = await this.getPosts();
    
    let html = `
    <div class="homeBackground">
      <div class="container">
        <div class="homeContainer pb-4">
          <header>
            <img src="static/images/logo-with-text.png" id="logo" class="d-block mx-auto mt-1 mb-4" width="300" alt="Site logo">
          </header>

          <main>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc efficitur mauris leo, sed finibus tortor facilisis vitae. Nunc tincidunt at tortor vitae porta. Vivamus luctus ut dui vitae consequat.
            </p>

            <section class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4" aria-label="blog posts">
    `;
    
    // sort by date (newest first)
    posts.sort((a, b) => {
      return new Date(b.publish_date) - new Date(a.publish_date);
    });

    const dateLocale = 'en-GB';
    const dateOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
    
    posts.forEach(post => {
      html += `
        <div class="col">
          <blog-card id="${ post.id }">
            <div slot="title">${ post.title }</div>
            <div slot="author">
              <img src="${ AvatarSrc(post.author) }" class="avatar mr-1" alt="Author avatar">
              By ${ post.author }
            </div>
            <div slot="date">${ FormatDate(post.publish_date, dateLocale, dateOptions) }</div>
            <div slot="description">${ post.description }</div>
            <a href="posts/${ post.slug }" slot="link" class="btn btn-primary">Read more</a>
          </blog-card>
        </div>`
    });

    return html += '</section></main></div></div></div>';
  }
}


