import AbstractView from "./AbstractView.js";
import PostComments from "../components/PostComments.js";
import { API_BASE_URL } from "../index.js"
import FormatDate from "../functions/FormatDate.js"
import AvatarSrc from "../functions/AvatarSrc.js"

export default class PostView extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Viewing Post");
  }

  async getPost(id) {
    let post = await fetch(`${API_BASE_URL}/posts/${id}`).then(function (response) {
      return response.json();
    }).catch(function (error) {
      console.error('Error in retrieving post with id: ' + id);
      console.error(error);
    })
    return post
  }

  async getHtml() {
    const post = await this.getPost(this.params.id);
    const dateString = FormatDate(post.publish_date);
    
    return `
      <div class="postBackground">
        <div class="container">
          <div class="postContainer">
            <header>
              <a href="/" class="pb-3" title="Back to home page">
                <img src="../static/images/logo-with-text.png" id="logo" class="d-block mx-auto my-2" width="200" alt="Site logo">
              </a>
            </header>

            <main>
              <article>
                <h1 class="py-2">${ post.title }</h1>

                <div class="row row-cols-auto mb-2" style="align-items:center">
                  <div class="col py-2">
                    <img src="${ AvatarSrc(post.author) }" class="avatar mr-1" alt="Author avatar">
                    <span>By ${ post.author }</span>
                  </div>

                  <div class="col py-2">
                    <svg width="1em" height="30px" viewBox="0 0 16 16" class="bi bi-calendar" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                    </svg>
                    <span class="my-2">${ dateString }</span>
                  </div>
                </div>

                ${ post.content }
              </article>

              <br>

              <section aria-label="post comments">
                <post-comments postID="${ post.id }"></post-comments>
              </section>
            </main>
          </div>
        </div>
      </div>
    `;
  }
}