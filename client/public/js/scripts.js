function loadBlogs() {
    fetch('/getBlogs')
        .then(response => response.json())
        .then(blogs => {
            const blogsContainer = document.getElementById('blogsContainer');
            blogsContainer.innerHTML = '';

            blogs.forEach((blog, index) => {
                const blogCard = document.createElement('div');
                blogCard.className = 'blog-card';
                
                blogCard.innerHTML = `
                    <h3>${index + 1}. ${blog.title}</h3>
                    <p>${blog.description}</p>
                `;
                
                blogsContainer.appendChild(blogCard);
            });
        })
        .catch(error => console.error("Error loading blogs:", error));
}

document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('blogsContainer')) {
        loadBlogs();
    }
});
