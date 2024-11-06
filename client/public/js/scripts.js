// Function to load blogs dynamically
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
                    <h3><a href="#" class="blog-title" data-id="${blog.id}">${blog.title}</a></h3>
                    <div class="blog-content" id="blog-content-${blog.id}">
                        <p>${blog.description}</p>
                    </div>
                    <a href="#" class="edit-blog" data-id="${blog.id}">Edit</a> | 
                    <a href="#" class="delete-blog" data-id="${blog.id}">Delete</a>
                `;
                
                blogsContainer.appendChild(blogCard);

                // Hide the content initially
                document.getElementById(`blog-content-${blog.id}`).style.display = "none";

                // Add event listener for showing/hiding blog description
                document.querySelector(`.blog-title[data-id="${blog.id}"]`).addEventListener('click', (e) => {
                    e.preventDefault();
                    const blogContent = document.getElementById(`blog-content-${blog.id}`);
                    blogContent.style.display = (blogContent.style.display === "none") ? "block" : "none";
                });
            });

            // Add event listeners for Edit and Delete actions
            document.querySelectorAll('.edit-blog').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const blogId = e.target.dataset.id;
                    editBlog(blogId);
                });
            });

            document.querySelectorAll('.delete-blog').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const blogId = e.target.dataset.id;
                    deleteBlog(blogId);
                });
            });
        })
        .catch(error => console.error("Error loading blogs:", error));
}

// Function to edit a blog
function editBlog(blogId) {
    window.location.href = `/editBlog/${blogId}`; // Navigate to an edit page with the blogId to edit the blog
}

// Function to delete a blog
function deleteBlog(blogId) {
    if (confirm("Are you sure you want to delete this blog?")) {
        fetch(`/deleteBlog/${blogId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                alert("Blog deleted successfully!");
                loadBlogs(); // Reload the list of blogs
            } else {
                alert("Failed to delete the blog.");
            }
        })
        .catch(error => console.error("Error deleting blog:", error));
    }
}

// Initial load when page is ready
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('blogsContainer')) {
        loadBlogs();
    }
});
