import AbstractView from "./AbstractView.js";
import BlogCard from "../components/BlogCard.js";
import { API_BASE_URL } from "../index.js"
import FormatDate from "../functions/FormatDate.js"

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("My Blog");
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
        <div class="homeContainer">
          <h1>Welcome to my blog</h1>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc efficitur mauris leo, sed finibus tortor facilisis vitae. Nunc tincidunt at tortor vitae porta. Vivamus luctus ut dui vitae consequat.
          </p>

          <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
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
          <blog-card id="${ post.id }" class="h-100">
            <div slot="title">${ post.title }</div>
            <div slot="author">
              By ${ post.author }
            </div>
            <div slot="date">${ FormatDate(post.publish_date, dateLocale, dateOptions) }</div>
            <div slot="description">${ post.description }</div>
            <a href="posts/${ post.slug }" slot="link" class="btn btn-primary">Read more</a>
          </blog-card>
        </div>`
    });

    return html += '</div></div></div></div>';
  }
}


