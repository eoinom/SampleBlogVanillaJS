import { API_BASE_URL } from "../index.js"
import ElapsedDateText from "../functions/ElapsedDateText.js"
import AvatarSrc from "../functions/AvatarSrc.js"

export default class PostComments extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  get postID() {
    return this.getAttribute("postID");
  }

  async getComments(id) {
    let comments = await fetch(`${API_BASE_URL}/posts/${id}/comments`).then(function (response) {
      return response.json();
    }).catch(function (error) {
      console.error('Error in retrieving comments for post with id: ' + id);
      console.error(error);
    })
    return comments
  }

  async nestComments(comments) {
    let rootComments = comments.filter(comment => {
      return !comment.parent_id;
    });
    let replyComments = comments.filter(comment => {
      return comment.parent_id;
    });

    function getUserName(commentId) {
      const comment = comments.find(obj => obj.id == commentId);
      return comment.user;
    }

    rootComments.forEach(comment => {
      comment.replies = [];
      comment.commentIds = [ comment.id ];
      replyComments.forEach(reply => {
        if (comment.commentIds.includes(reply.parent_id)) {
          reply.parent_user = getUserName(reply.parent_id);
          comment.replies.push(reply);
          comment.commentIds.push(reply.id);
        }
      });
    });
    return rootComments;
  }

  formHtml(parentId) {
    return `
      <form name="addComment" id="addCommentForm_${ parentId }" action="" method="POST" class="mb-2">
        <div class="mb-3">
          <label for="addCommentName" class="form-label">Name</label>
          <input type="text" class="form-control" id="addCommentName" name="user">
        </div>
        <div class="mb-3">
          <label for="addCommentTextarea" class="form-label">Submit a Comment</label>
          <textarea class="form-control" id="addCommentTextarea" rows="3" placeholder="Join the discussion" name="content"></textarea>
        </div>
        <div class="d-flex justify-content-end">
          <button type="" id="submitBtn_${ parentId }" class="btn btn-primary" data-link>Post Comment</button>
        </div>
      </form>`
  }

  async getNestedCommentsHtml(comments) {
    let html = '';
    comments.forEach(comment => {
      html += `
      <div class="row row-cols-auto mb-4" style="align-items:center">
        <div class="col">
          <img src="${AvatarSrc(comment.user)}" style="border-radius:50%">
        </div>
        <div class="col">
          <span class="comment__author">
            ${ comment.user }
            <span class="comment__date">${ ElapsedDateText(new Date(comment.date)) }</span>
          </span>          
          <span class="comment__text">${ comment.content }</span>
          <div class="replyText" id="comment_${ comment.id }">Reply</div>
        </div>
      </div>
      <div class="row" style="margin-left:53px">
        <div id="reply_${ comment.id }"></div>
      </div>`;

      comment.replies.forEach(reply => {
        const userSlug = reply.user.replace(/\s/g, '-');
        html += `
        <div class="row row-cols-auto ml-5 mb-4" style="align-items:center">
          <div class="col">
            <img src="${AvatarSrc(reply.user)}" style="border-radius:50%">
          </div>
          <div class="col">
            <span class="comment__author">
              ${ reply.user }
              <span class="comment__date">${ ElapsedDateText(new Date(reply.date)) }</span>
            </span>
            <span class="comment__text">@${ reply.parent_user }: ${ reply.content }</span>
            <div class="replyText" id="comment_${ reply.id }">Reply</div>            
          </div>
        </div>
        <div class="row" style="margin-left:110px">
          <div id="reply_${ reply.id }"></div>
        </div>`;
      });
      html += '<hr>'
    });
    return html;
  }

  async onCommentSubmit(parentId) {
    const form = this.shadow.querySelector(`#addCommentForm_${parentId}`);
    const elements = form.elements;
    let data = {};
    for (let i = 0; i < form.elements.length; i++) {
      if (elements[i].nodeName !== "BUTTON") {
        const item = form.elements.item(i);
        data[item.name] = item.value; 
      }
    }

    data.parent_id = parentId;

    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; 
    const yyyy = today.getFullYear();
    if (dd < 10) {
      dd = `0${dd}`;
    } 
    if (mm < 10) {
      mm = `0${mm}`;
    }
    data.date = `${yyyy}-${mm}-${dd}`;
    
    this.postComment(this.postID, data).then(response => {
      this.render();
    });
  }

  async showCommentReplyForm(replyId) {
    this.shadow.querySelector(`#reply_${ replyId }`).innerHTML = this.formHtml(replyId);
    this.shadow.querySelector(`#submitBtn_${ replyId }`).addEventListener("click", e => {
      e.preventDefault();
      this.onCommentSubmit(replyId);
    });
  }

  async postComment(id, data) {
    const response = await fetch(`${API_BASE_URL}/posts/${id}/comments`, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      redirect: 'manual',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }

  async connectedCallback() {
    this.render();
  }

  async render() {
    const comments = await this.getComments(this.postID);
    const nestedComments = await this.nestComments(comments);
    const commentsHtml = await this.getNestedCommentsHtml(nestedComments);

    let numCommentsText = `${ comments.length }`;
    numCommentsText += comments.length == 1 ? ' Comment' : ' Comments'

    this.shadow.innerHTML = `
      <link href="../static/css/main.css" rel="stylesheet">
      <link href="../static/css/index.css" rel="stylesheet">
      
      <br>
      <div class="comments__count mb-2">${ numCommentsText }</div>

      ${ this.formHtml(null) }

      ${ commentsHtml }
    `;

    this.shadow.querySelector('#submitBtn_null').addEventListener("click", e => {
      e.preventDefault();
      this.onCommentSubmit(null);
    });

    let replyElements = this.shadow.querySelectorAll(".replyText");
    for (let i = 0; i < replyElements.length; i++) {
      replyElements[i].addEventListener("click", e => {
        let replyId = parseInt(e.target.id.substring(8));
        this.showCommentReplyForm(replyId);
      })
    };
  }
}

window.customElements.define('post-comments', PostComments);