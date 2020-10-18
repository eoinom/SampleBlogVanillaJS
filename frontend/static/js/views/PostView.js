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
          <a href="/" class="pb-3">Home</a>
            <h1>${ post.title }</h1>

            <div class="row row-cols-auto mb-4" style="align-items:center">
              <div class="col">
                <img src="${AvatarSrc(post.author)}" style="border-radius:50%" class="mr-1">
                <span>By ${ post.author }</span>
              </div>

              <div class="col">
                <svg width="1em" height="30px" viewBox="0 0 16 16" class="bi bi-calendar" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                </svg>
                <span>${ dateString }</span>
              </div>
            </div>

            ${ post.content }

            <br>

            <post-comments postID="${ post.id }"></post-comments>

          </div>
        </div>
      </div>
    `;
  }
}