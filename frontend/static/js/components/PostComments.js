export default class PostComments extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  get postID() {
    return this.getAttribute("postID");
  }

  async getComments(id) {
    let comments = await fetch(`http://localhost:9001/posts/${id}/comments`).then(function (response) {
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

  elapsedDateText(date) {
    if (!date instanceof Date)
      return '';

    const ms = (new Date()).getTime() - date.getTime();
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (seconds < 10) {
      return 'Just now';
    } if (seconds < 60) {
      return seconds + ' seconds ago';
    } if (minutes == 1) {
      return 'a minute ago';
    } if (minutes < 60) {
      return minutes + ' minutes ago';
    } if (hours == 1) {
      return 'an hour ago';
    } if (hours < 24) {
      return hours + ' hours ago';
    } if (days == 1) {
      return 'a day ago';
    } if (days < 30) {
      return days + ' days ago';
    } if (months == 1) {
      return 'a month ago';
    } if (months < 12) {
      return months + ' months ago';
    } if (years == 1) {
      return 'a year ago';
    } if (years > 1) {
      return years + ' years ago';
    } else {
      return ''
    }
  }

  async getNestedCommentsHtml(comments) {
    let html = '';
    comments.forEach(comment => {
      const userSlug = comment.user.replace(/\s/g, '-');
      html += `
      <div class="row row-cols-auto mb-4" style="align-items:center">
        <div class="col">
          <img src="https://api.adorable.io/avatars/20/${userSlug}.png" style="border-radius:50%">
        </div>
        <div class="col">
          <span class="comment__author">
            ${ comment.user }
            <span class="comment__date">${ this.elapsedDateText(new Date(comment.date)) }</span>
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
            <img src="https://api.adorable.io/avatars/20/${userSlug}.png" style="border-radius:50%">
          </div>
          <div class="col">
            <span class="comment__author">
              ${ reply.user }
              <span class="comment__date">${ this.elapsedDateText(new Date(reply.date)) }</span>
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
    const response = await fetch(`http://localhost:9001/posts/${id}/comments`, {
      method: 'POST',
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'manual', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
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