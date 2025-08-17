const postsContainer = document.getElementById('posts-container');
const userPostsContainer = document.getElementById('user-posts-container');
const postSearch = document.getElementById('post-search');
const userPostsTitle = document.getElementById('user-posts-title');

async function fetchPosts(userId = null) {
    try {
        let url = 'https://jsonplaceholder.typicode.com/posts';
        if (userId) {
            url += `?userId=${userId}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [
            {
                userId: 1,
                id: 1,
                title: "Sample Post (API Failed)",
                body: "This is sample data because the API request failed when running without a server."
            }
        ];
    }
}

async function fetchUser(userId) {
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

async function displayPosts(posts, container) {
    if (!container) return;
    
    container.innerHTML = '';
    
    if (posts.length === 0) {
        container.innerHTML = '<p>No posts found.</p>';
        return;
    }
    
    for (const post of posts) {
        const user = await fetchUser(post.userId);
        const postElement = document.createElement('div');
        postElement.className = 'post-card';
        postElement.innerHTML = `
            <h3 class="post-title">${post.title}</h3>
            <p class="post-body">${post.body}</p>
            ${user ? `<a href="user-posts.html?userId=${user.id}" class="post-author">
                <i class="fas fa-user"></i> ${user.name}
            </a>` : ''}
        `;
        postElement.addEventListener('click', (e) => {
            if (!e.target.closest('a')) {
                window.location.href = `user-posts.html?userId=${post.userId}`;
            }
        });
        container.appendChild(postElement);
    }
}

async function displayUserPosts() {
    if (!userPostsContainer) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    
    if (!userId) {
        window.location.href = 'index.html';
        return;
    }
    
    const posts = await fetchPosts(userId);
    const user = await fetchUser(userId);
    
    if (user) {
        userPostsTitle.textContent = `${user.name}'s Posts`;
    }
    
    displayPosts(posts, userPostsContainer);
}

if (postSearch) {
    postSearch.addEventListener('input', async function() {
        const searchTerm = this.value.toLowerCase();
        const posts = await fetchPosts();
        
        if (searchTerm.trim() === '') {
            displayPosts(posts, postsContainer);
            return;
        }
        
        const filteredPosts = posts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) || 
            post.body.toLowerCase().includes(searchTerm)
        );
        
        displayPosts(filteredPosts, postsContainer);
    });
}

async function initPostsPage() {
    if (postsContainer) {
        const posts = await fetchPosts();
        displayPosts(posts, postsContainer);
    } else if (userPostsContainer) {
        displayUserPosts();
    }
}

document.addEventListener('DOMContentLoaded', initPostsPage);