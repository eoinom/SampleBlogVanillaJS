import Home from "./views/Home.js";
import PostView from "./views/PostView.js";

async function getPosts() {
  let posts = await fetch('http://localhost:9001/posts').then(function (response) {
    return response.json();
  });
  return posts;
}

const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const getParams = match => {
  const values = match.result.slice(1);
  const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);
  
  return Object.fromEntries(keys.map((key, i) => {
    return [key, values[i]];
  }));
}

const navigateTo = url => {
  history.pushState(null, null, url);
  router();
}

const router = async () => {
  const posts = await getPosts();
  const routes = [
    { path: "/", view: Home },
    { path: "/posts/:slug", view: PostView },
  ];

  // Test each route for a potential match
  const potentialMatches = routes.map(route => {
    return {
      route: route,
      result: location.pathname.match(pathToRegex(route.path))  // window.location.pathname property returns the pathname of the current page
    }
  });

  let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);

  if (!match) {
    match = {
      route: routes[0],
      result: [location.pathname]
    }
  }

  const params = getParams(match);

  if (match.route.path === '/posts/:slug') {
    const post = posts.filter(post => {
      return post.slug == params.slug;
    })[0];
    var view = new match.route.view(post);
  } else {
    view = new match.route.view(params);
  }

  document.querySelector("#app").innerHTML = await view.getHtml();
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", e => {
    if (e.target.matches("[data-link]")) {
      console.log('in DOMContentLoaded, data-link')
      e.preventDefault();
      navigateTo(e.target.href);
    }
  });
  router();
});