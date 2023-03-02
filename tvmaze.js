"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesUl = $("#episodesList");
const $searchForm = $("#searchForm");
const $showName = $("#showName");

const defaultImg = "https://images.unsplash.com/photo-1560109947-543149eceb16?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=735&q=80";


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  // ADD: make request to TVMaze search shows API.
  $("#searchForm-term").val("");
  const res = await axios.get("https://api.tvmaze.com/search/shows", {params: {q: term}});
  return res.data;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();
  for (let show of shows) {
    const showImg = show.show.image === null ? defaultImg : show.show.image.medium;
    const $show = $(
      `<div data-show-id="${show.show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src= ${showImg}
              alt="Bletchly Circle San Francisco"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.show.name}</h5>
             <div><small>${show.show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes" data-show-id="${show.show.id}" data-show-name="${show.show.name}">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);
    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const episodes = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
  return episodes.data;
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes, showName) {
  $episodesUl.empty();
  console.log(episodes);
  for (let e of episodes) {
    if (e.image) $episodesUl.append($(`<img src="${e.image.medium}">`));
    if (e.season && e.number) $episodesUl.append($(`<li>Season ${e.season} Episode ${e.number}</li>`));
    if (e.name) $episodesUl.append(`<li>"${e.name}"</li>`);
    if (e.url) $episodesUl.append($(`<li><a href="${e.url}" target="_blank">${e.url}</a></li>`));
    if (e.summary) $episodesUl.append($(`<li><u>Summary:</u>${e.summary}</li>`));
    $episodesUl.append(`<hr class="my-3">`);
  }
  $showName.text(showName);
  $episodesArea.show();
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

$showsList.on("click", async function (e) {
  if (e.target.getAttribute("data-show-id")) {
    const epsArr = await getEpisodesOfShow(e.target.getAttribute("data-show-id"));
    populateEpisodes(epsArr, e.target.getAttribute("data-show-name"));
  }
});