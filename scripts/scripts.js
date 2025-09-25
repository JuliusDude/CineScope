// --- Movie data ---
const movies = [
  {id:1,title:"John Wick",year:2014,genre:"Action",desc:"John Wick is a retired assassin who returns to his old ways after a group of Russian gangsters steal his car and kill his puppy which was given to him by his late wife Helen.",poster:"https://m.media-amazon.com/images/M/MV5BMTU2NjA1ODgzMF5BMl5BanBnXkFtZTgwMTM2MTI4MjE@._V1_FMjpg_UY2048_.jpg"},
  {id:2,title:"Ford v Ferrari",year:2019,genre:"Sport",desc:"The plot follows a determined team of American and English engineers and designers, led by automotive designer Carroll Shelby and his English driver, Ken Miles, who are hired by Henry Ford II and Lee Iacocca to build a race car to defeat the perennially dominant Italian racing team Scuderia Ferrari at the 1966 24 Hours of Le Mans race in France.",poster:"https://m.media-amazon.com/images/M/MV5BOTBjNTEyNjYtYjdkNi00YzE5LTljYzUtZjVlYmYwZmJmZWYxXkEyXkFqcGc@._V1_FMjpg_UY6000_.jpg"},
  {id:3,title:"The Shawshank Redemption",year:1994,genre:"Crime",desc:"A banker convicted of uxoricide forms a friendship over a quarter century with a hardened convict, while maintaining his innocence and trying to remain hopeful through simple compassion.",poster:"https://m.media-amazon.com/images/M/MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtY2UxYWVkNGY2ZjljXkEyXkFqcGc@._V1_FMjpg_UX1200_.jpg"},
  {id:4,title:"Inception",year:2020,genre:"Documentary",desc:"A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.",poster:"https://m.media-amazon.com/images/M/MV5BMjExMjkwNTQ0Nl5BMl5BanBnXkFtZTcwNTY0OTk1Mw@@._V1_FMjpg_UY466_.jpg"},
  {id:5,title:"La La Land",year:2016,genre:"Romance",desc:"When Sebastian, a pianist, and Mia, an actress, follow their passion and achieve success in their respective fields, they find themselves torn between their love for each other and their careers.",poster:"https://m.media-amazon.com/images/M/MV5BMzUzNDM2NzM2MV5BMl5BanBnXkFtZTgwNTM3NTg4OTE@._V1_FMjpg_UY6000_.jpg"}
];

const STORAGE_KEY = 'cine_reviews_v1';

// --- Utility to load/save reviews ---
function loadReviews(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw? JSON.parse(raw): {};
  }catch(e){console.warn('load error', e); return {}}
}
function saveReviews(obj){ localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); }

// --- App state ---
let reviewsDB = loadReviews(); // { movieId: [ {name, rating, comment, date} ] }

// --- Render genres in filter ---
function populateGenres(){
  const genres = ['All', ...new Set(movies.map(m=>m.genre))];
  const select = $('#genreFilter'); select.empty();
  genres.forEach(g=>{ const val = g.toLowerCase(); select.append(`<option value="${val=='all'?'all':g}">${g}</option>`); });
}

// --- Compute average rating ---
function avgRating(id){
  const list = reviewsDB[id]||[];
  if(!list.length) return null;
  const s = list.reduce((a,b)=>a+b.rating,0);
  return (s/list.length).toFixed(1);
}

// --- Build movie card ---
function movieCardHTML(m){
  const avg = avgRating(m.id);
  const reviewCount = (reviewsDB[m.id]||[]).length;
  const truncatedDesc = truncateText(m.desc, 120);
  const ratingDisplay = avg ? `${avg} ★` : '<span class="small-muted">No ratings</span>';
  const reviewText = reviewCount === 1 ? 'review' : 'reviews';
  
  return `
  <div class="col-12 col-sm-6 col-lg-4 mb-4">
    <div class="movie-card overflow-hidden">
      <img src="${m.poster}" class="movie-poster" alt="${m.title}">
      <div class="p-3 text-white card-content">
        <div class="mb-2">
          <h5 class="mb-1 card-title">${m.title} <small class="small-muted">(${m.year})</small></h5>
          <div class="d-flex justify-content-between align-items-center mb-1">
            <div class="small-muted">${m.genre}</div>
            <div class="rating-info">
              <span class="fw-bold">${ratingDisplay}</span>
              <span class="small-muted ms-2">${reviewCount} ${reviewText}</span>
            </div>
          </div>
        </div>
        <p class="small-muted mb-2 card-description">${truncatedDesc}</p>
        <div class="d-flex gap-2 mt-auto">
          <button class="btn btn-sm btn-outline-light view-btn" data-id="${m.id}">View</button>
          <button class="btn btn-sm btn-primary review-btn" data-id="${m.id}">Add Review</button>
        </div>
      </div>
    </div>
  </div>
  `;
}

function renderMovies(filterText=''){
  const grid = $('#moviesGrid'); grid.empty();
  const genreFilter = $('#genreFilter').val();
  const text = filterText.trim().toLowerCase();
  movies.forEach(m=>{
    if(genreFilter && genreFilter.toLowerCase()!=='all' && m.genre.toLowerCase()!==genreFilter.toLowerCase()) return;
    if(text && !m.title.toLowerCase().includes(text) && !m.genre.toLowerCase().includes(text)) return;
    grid.append(movieCardHTML(m));
  });
}

// --- Render reviews list for a movie ---
function renderReviewsFor(movieId){
  const list = reviewsDB[movieId]||[];
  if(!list.length) return '<div class="small-muted">No reviews yet — be the first!</div>';
  return list.map(r=>`<div class="review text-white"><div class="d-flex justify-content-between align-items-start"><div><strong>${escapeHtml(r.name)}</strong> <span class="small-muted">• ${new Date(r.date).toLocaleString()}</span><div class="mt-1">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div></div></div><p class="mb-0 small-muted mt-2">${escapeHtml(r.comment)}</p></div>`).join('');
}

// --- Helpers ---
function escapeHtml(s){ return (s||'').toString().replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]; }); }
function truncateText(text, maxLength = 120) {
  if (!text || text.length <= maxLength) return text;
  return text.substr(0, maxLength).trim() + '...';
}

$(function(){
  populateGenres();
  renderMovies();

  // Search & filter
  $('#searchInput').on('input', function(){ renderMovies($(this).val()); });
  $('#genreFilter').on('change', function(){ renderMovies($('#searchInput').val()); });

  // Delegate: open modal view
  $(document).on('click', '.view-btn', function(){
    const id = $(this).data('id');
    const movie = movies.find(m=>m.id===id);
    if(!movie) return;
    $('#movieModalLabel').text(movie.title + ' ('+movie.year+')');
    $('#modalPoster').attr('src', movie.poster);
    $('#modalDesc').text(movie.desc);
    $('#modalGenre').text(movie.genre);
    $('#reviewsList').html(renderReviewsFor(id));
    $('#openReviewPanel').data('id', id);
    const modal = new bootstrap.Modal(document.getElementById('movieModal'));
    modal.show();
  });

  // Open review offcanvas
  $(document).on('click', '.review-btn, #openReviewPanel', function(){
    const id = $(this).data('id');
    $('#movieId').val(id);
    $('#reviewer').val(''); $('#ratingValue').val(5); $('#comment').val('');
    // highlight stars
    highlightStars(5);
    const off = new bootstrap.Offcanvas(document.getElementById('reviewPanel'));
    off.show();
  });

  // star selection UI
  function highlightStars(n){ $('#starSelect .star-btn').each(function(){ const v = $(this).data('value'); $(this).css('color', v<=n? 'goldenrod' : 'rgba(255,255,255,0.3)'); }); }
  $('#starSelect').on('click', '.star-btn', function(){ const v = $(this).data('value'); $('#ratingValue').val(v); highlightStars(v); });
  $('#ratingValue').on('change', function(){ let v = parseInt($(this).val())||1; if(v<1) v=1; if(v>5) v=5; $(this).val(v); highlightStars(v); });

  // Submit review
  $('#reviewForm').on('submit', function(e){
    e.preventDefault();
    const movieId = $('#movieId').val();
    const name = $('#reviewer').val().trim() || 'Anonymous';
    const rating = Math.max(1, Math.min(5, parseInt($('#ratingValue').val())||5));
    const comment = $('#comment').val().trim();
    const entry = {name, rating, comment, date: new Date().toISOString()};
    if(!reviewsDB[movieId]) reviewsDB[movieId]=[];
    reviewsDB[movieId].unshift(entry); // newest first
    saveReviews(reviewsDB);
    // update UI
    renderMovies($('#searchInput').val());
    $('#reviewsList').html(renderReviewsFor(movieId));
    // close offcanvas
    const offEl = document.getElementById('reviewPanel');
    const off = bootstrap.Offcanvas.getInstance(offEl);
    if(off) off.hide();
  });

  // Reset local storage
  $('#resetData').on('click', function(){ if(confirm('Clear all saved reviews?')){ reviewsDB={}; saveReviews(reviewsDB); renderMovies($('#searchInput').val()); $('#reviewsList').html(''); } });

});