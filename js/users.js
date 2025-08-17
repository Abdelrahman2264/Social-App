const usersContainer = document.getElementById('users-container');
const userSearch = document.getElementById('user-search');
const userProfileContainer = document.getElementById('user-profile-container');
const viewUserPostsBtn = document.getElementById('view-user-posts');

async function fetchUsers() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

async function displayUsers(users) {
    if (!usersContainer) return;
    
    usersContainer.innerHTML = '';
    
    if (users.length === 0) {
        usersContainer.innerHTML = '<p>No users found.</p>';
        return;
    }
    
    for (const user of users) {
        const userElement = document.createElement('div');
        userElement.className = 'user-card';
        userElement.innerHTML = `
            <div class="user-avatar">${user.name.charAt(0)}</div>
            <h3 class="user-name">${user.name}</h3>
            <p class="user-username">@${user.username}</p>
            <p class="user-email">${user.email}</p>
            <div class="user-actions">
                <a href="user-profile.html?userId=${user.id}" class="btn btn-primary">View Profile</a>
            </div>
        `;
        usersContainer.appendChild(userElement);
    }
}

async function displayUserProfile() {
    if (!userProfileContainer) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    
    if (!userId) {
        window.location.href = 'users.html';
        return;
    }
    
    const user = await fetchUser(userId);
    
    if (!user) {
        userProfileContainer.innerHTML = '<p>User not found.</p>';
        return;
    }
    
    userProfileContainer.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar">${user.name.charAt(0)}</div>
            <div class="profile-info">
                <h2>${user.name}</h2>
                <p class="profile-username">@${user.username}</p>
                <p><a href="mailto:${user.email}">${user.email}</a></p>
            </div>
        </div>
        
        <div class="profile-details">
            <div class="detail-card">
                <h3>Address</h3>
                <p>${user.address.street}</p>
                <p>${user.address.suite}</p>
                <p>${user.address.city}, ${user.address.zipcode}</p>
            </div>
            
            <div class="detail-card">
                <h3>Phone</h3>
                <p>${user.phone}</p>
            </div>
            
            <div class="detail-card">
                <h3>Website</h3>
                <p><a href="http://${user.website}" target="_blank">${user.website}</a></p>
            </div>
            
            <div class="detail-card">
                <h3>Company</h3>
                <p>${user.company.name}</p>
                <p>${user.company.catchPhrase}</p>
                <p>${user.company.bs}</p>
            </div>
        </div>
    `;
    
    if (viewUserPostsBtn) {
        viewUserPostsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = `user-posts.html?userId=${user.id}`;
        });
    }
}

if (userSearch) {
    userSearch.addEventListener('input', async function() {
        const searchTerm = this.value.toLowerCase();
        const users = await fetchUsers();
        
        if (searchTerm.trim() === '') {
            displayUsers(users);
            return;
        }
        
        const filteredUsers = users.filter(user => 
            user.name.toLowerCase().includes(searchTerm) || 
            user.username.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
        
        displayUsers(filteredUsers);
    });
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

async function initUsersPage() {
    if (usersContainer) {
        const users = await fetchUsers();
        displayUsers(users);
    } else if (userProfileContainer) {
        displayUserProfile();
    }
}

document.addEventListener('DOMContentLoaded', initUsersPage);