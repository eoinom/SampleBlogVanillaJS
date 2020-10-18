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

  nestComments(comments) {
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
      <form name="addComment" id="addCommentForm_${ parentId }" action="" method="POST" class="needs-validation mb-2" novalidate>
        <div class="mb-3">
          <label for="addCommentName" class="form-label">Name</label>
          <input type="text" class="form-control" id="addCommentName" name="user" required>
          <div class="invalid-feedback">
            Please provide your name
          </div>
        </div>
        <div class="mb-3">
          <label for="addCommentTextarea" class="form-label">Submit a Comment</label>
          <textarea class="form-control" id="addCommentTextarea" rows="3" placeholder="Join the discussion" name="content" required></textarea>
          <div class="invalid-feedback">
            Please add your comment
          </div>
        </div>
        <div class="d-flex justify-content-end">
          <button type="submit" class="btn btn-primary" data-link>Post Comment</button>
        </div>
      </form>`
  }

  getNestedCommentsHtml(comments) {
    let html = '';
    comments.forEach(comment => {
      html += `
      <div class="comments row row-cols-auto mb-4" style="align-items:center">
        <div class="col">
          <img src="${ AvatarSrc(comment.user) }" class="avatar" alt="Comment user avatar">
        </div>
        <div class="col-10">
          <span class="comments__author">
            ${ comment.user }
            <span class="comments__date">${ ElapsedDateText(new Date(comment.date)) }</span>
          </span>          
          <span class="comments__text">${ comment.content }</span>
          <div class="comments__replyText" id="comment_${ comment.id }">Reply</div>
        </div>
      </div>
      <div class="row ml-0 ml-sm-5 pl-md-3">
        <div id="reply_${ comment.id }" class="pl-0"></div>
      </div>`;

      comment.replies.forEach(reply => {
        html += `
        <div class="comments row row-cols-auto ml-5 mb-4" style="align-items:center">
          <div class="col">
            <img src="${ AvatarSrc(reply.user) }" class="avatar" alt="Comment user avatar">
          </div>
          <div class="col-10">
            <span class="comments__author">
              ${ reply.user }
              <span class="comments__date">${ ElapsedDateText(new Date(reply.date)) }</span>
            </span>
            <span class="comments__text">@${ reply.parent_user }: ${ reply.content }</span>
            <div class="comments__replyText" id="comment_${ reply.id }">Reply</div>            
          </div>
        </div>
        <div class="row ml-5 pl-md-5">
          <div id="reply_${ reply.id }" class="mx-md-1 px-md-4"></div>
        </div>`;
      });
      html += '<hr>'
    });
    return html;
  }

  onCommentSubmit(parentId) {
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
    let HH = today.getHours();
    let MM = today.getMinutes();
    let SS = today.getSeconds();

    if (dd < 10) {
      dd = `0${dd}`;
    } 
    if (mm < 10) {
      mm = `0${mm}`;
    }
    if (HH < 10) {
      HH = `0${HH}`;
    }
    if (MM < 10) {
      MM = `0${MM}`;
    }
    if (SS < 10) {
      SS = `0${SS}`;
    }
    data.date = `${yyyy}-${mm}-${dd} ${HH}:${MM}:${SS}`;
    
    this.postComment(this.postID, data).then(response => {
      this.render();
    });
  }

  showCommentReplyForm(replyId) {
    this.shadow.querySelector(`#reply_${ replyId }`).innerHTML = this.formHtml(replyId);
    
    let form = this.shadow.querySelector(`#addCommentForm_${ replyId }.needs-validation`);
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
      }
      else {
        this.onCommentSubmit(replyId);
      }
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
    const nestedComments = this.nestComments(comments);
    const commentsHtml = this.getNestedCommentsHtml(nestedComments);

    let numCommentsText = `${ comments.length }`;
    numCommentsText += comments.length == 1 ? ' Comment' : ' Comments'

    this.shadow.innerHTML = `
      <link href="../static/css/main.css" rel="stylesheet">
      
      <br>
      <div class="comments comments__count mb-2">${ numCommentsText }</div>

      ${ this.formHtml(null) }

      ${ commentsHtml }
    `;

    let form = this.shadow.querySelector('.needs-validation');
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
      }
      else {
        this.onCommentSubmit(null);
      }
    });

    let replyElements = this.shadow.querySelectorAll(".comments__replyText");
    for (let i = 0; i < replyElements.length; i++) {
      replyElements[i].addEventListener("click", e => {
        let replyId = parseInt(e.target.id.substring(8));
        this.showCommentReplyForm(replyId);
      })
    };
  }
}

window.customElements.define('post-comments', PostComments);