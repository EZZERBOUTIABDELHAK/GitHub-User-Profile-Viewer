   // DOM Elements
   const searchButton = document.getElementById('search-btn');
   const usernameInput = document.getElementById('username');
   const profileCard = document.getElementById('profile');
   const errorDiv = document.getElementById('error');
   const loadingDiv = document.getElementById('loading');
   const reposList = document.getElementById('repos-list');

   // Event Listeners
   searchButton.addEventListener('click', fetchUserData);
   usernameInput.addEventListener('keypress', (e) => {
       if (e.key === 'Enter') {
           fetchUserData();
       }
   });

   // Fetch user data from GitHub API
   function fetchUserData() {
       const username = usernameInput.value.trim();
       
       if (!username) {
           showError('Please enter a GitHub username');
           return;
       }

       // Reset previous data
       resetUI();
       showLoading();

       // Fetch user profile
       fetch(`https://api.github.com/users/${username}`)
           .then(response => {
               if (!response.ok) {
                   throw new Error(`User not found or API rate limit exceeded`);
               }
               return response.json();
           })
           .then(userData => {
               displayUserData(userData);
               return fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`);
           })
           .then(response => {
               if (!response.ok) {
                   throw new Error('Failed to fetch repositories');
               }
               return response.json();
           })
           .then(reposData => {
               displayRepos(reposData);
           })
           .catch(error => {
               showError(error.message);
           })
           .finally(() => {
               hideLoading();
           });
   }

   function displayUserData(user) {
       document.getElementById('avatar').src = user.avatar_url || '/api/placeholder/100/100';
       document.getElementById('name').textContent = user.name || user.login;
       document.getElementById('login').textContent = `@${user.login}`;
       document.getElementById('bio').textContent = user.bio || 'No bio available';
       
       document.getElementById('repos').textContent = user.public_repos;
       document.getElementById('followers').textContent = user.followers;
       document.getElementById('following').textContent = user.following;
       
       document.getElementById('company').textContent = user.company || 'Not specified';
       document.getElementById('location').textContent = user.location || 'Not specified';
       document.getElementById('email').textContent = user.email || 'Not specified';
       
       if (user.blog) {
           const blogElement = document.getElementById('blog');
           blogElement.innerHTML = `<a href="${ensureHttps(user.blog)}" target="_blank">${user.blog}</a>`;
       } else {
           document.getElementById('blog').textContent = 'Not specified';
       }
       
       // Update Twitter
       if (user.twitter_username) {
           const twitterElement = document.getElementById('twitter');
           twitterElement.innerHTML = `<a href="https://twitter.com/${user.twitter_username}" target="_blank">@${user.twitter_username}</a>`;
       } else {
           document.getElementById('twitter').textContent = 'Not specified';
       }
       
       // Update created date
       const createdDate = new Date(user.created_at);
       document.getElementById('created').textContent = `Joined on ${createdDate.toLocaleDateString()}`;
       
       // Update "View all repos" link
       document.getElementById('view-all').href = `https://github.com/${user.login}?tab=repositories`;
       
       // Show the profile card
       profileCard.style.display = 'block';
   }

   // Display repositories
   function displayRepos(repos) {
       if (repos.length === 0) {
           reposList.innerHTML = '<p>No public repositories found</p>';
           return;
       }

       reposList.innerHTML = '';
       
       repos.forEach(repo => {
           const li = document.createElement('li');
           li.className = 'repo-item';
           
           const description = repo.description || 'No description available';
           const language = repo.language || 'Not specified';
           
           li.innerHTML = `
               <div class="repo-name">
                   <a href="${repo.html_url}" target="_blank">${repo.name}</a>
               </div>
               <div class="repo-description">${description}</div>
               <div class="repo-stats">
                   <div class="repo-stat">
                       <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
                           <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8z"></path>
                       </svg>
                       ${language}
                   </div>
                   <div class="repo-stat">
                       <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
                           <path fill-rule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"></path>
                       </svg>
                       ${repo.stargazers_count}
                   </div>
                   <div class="repo-stat">
                       <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
                           <path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path>
                       </svg>
                       ${repo.forks_count}
                   </div>
               </div>
           `;
           
           reposList.appendChild(li);
       });
   }

   function ensureHttps(url) {
       if (!url) return '';
       if (!url.startsWith('http://') && !url.startsWith('https://')) {
           return 'https://' + url;
       }
       return url;
   }

   function resetUI() {
       profileCard.style.display = 'none';
       errorDiv.style.display = 'none';
       reposList.innerHTML = '';
   }

   function showLoading() {
       loadingDiv.style.display = 'block';
   }

   function hideLoading() {
       loadingDiv.style.display = 'none';
   }

   function showError(message) {
       errorDiv.textContent = message;
       errorDiv.style.display = 'block';
       profileCard.style.display = 'none';
   }