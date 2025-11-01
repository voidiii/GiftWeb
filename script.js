// Gift posts storage
let currentGiftId = null;

// DOM elements
const container = document.getElementById('container');
const modal = document.getElementById('modal');
const addModal = document.getElementById('addModal');
const addBtn = document.getElementById('addBtn');
const closeBtn = document.getElementById('closeBtn');
const closeAddBtn = document.getElementById('closeAddBtn');
const deleteBtn = document.getElementById('deleteBtn');
const modalImage = document.getElementById('modalImage');
const modalDescription = document.getElementById('modalDescription');
const commentsList = document.getElementById('commentsList');
const commentInput = document.getElementById('commentInput');
const addCommentBtn = document.getElementById('addCommentBtn');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const descriptionInput = document.getElementById('descriptionInput');
const submitBtn = document.getElementById('submitBtn');
const loadingOverlay = document.getElementById('loadingOverlay');

// Show/hide loading
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// Load gifts from Firestore with real-time updates
function loadGifts() {
    showLoading();

    db.collection('gifts')
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            console.log('Real-time update received! Total gifts:', snapshot.size);
            container.innerHTML = '';

            if (snapshot.empty) {
                showEmptyState();
                hideLoading();
                return;
            }

            snapshot.forEach((doc) => {
                const gift = { id: doc.id, ...doc.data() };
                const card = createCard(gift);
                container.appendChild(card);
            });

            hideLoading();
            console.log('✅ Gifts loaded successfully');
        }, (error) => {
            console.error('❌ Error loading gifts:', error);
            hideLoading();
            showError('Failed to load gifts. Please refresh the page.');
        });
}

// Show empty state when no gifts
function showEmptyState() {
    container.innerHTML = `
        <div class="empty-state">
            <h2>No gifts yet!</h2>
            <p>Click the "+ Add Gift" button to start your wishlist</p>
        </div>
    `;
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Create a gift card element
function createCard(gift) {
    const card = document.createElement('div');
    card.className = 'card';
    card.onclick = () => openModal(gift.id);

    const commentCount = gift.comments ? gift.comments.length : 0;

    card.innerHTML = `
        <img src="${gift.imageUrl}" alt="${gift.description}" loading="lazy">
        <div class="card-info">
            <div class="card-description">${gift.description}</div>
            <div class="card-meta">
                <span class="card-avatar">🎁</span>
                <span>${commentCount} comments</span>
            </div>
        </div>
    `;

    return card;
}

// Open modal to view gift details
async function openModal(giftId) {
    try {
        showLoading();
        const doc = await db.collection('gifts').doc(giftId).get();

        if (!doc.exists) {
            hideLoading();
            showError('Gift not found');
            return;
        }

        const gift = { id: doc.id, ...doc.data() };
        currentGiftId = giftId;
        modalImage.src = gift.imageUrl;
        modalDescription.textContent = gift.description;

        renderComments(gift.comments || []);

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        hideLoading();
    } catch (error) {
        console.error('Error opening gift:', error);
        hideLoading();
        showError('Failed to load gift details');
    }
}

// Close modal
function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentGiftId = null;
    commentInput.value = '';
}

// Render comments
function renderComments(comments) {
    commentsList.innerHTML = '';

    if (!comments || comments.length === 0) {
        commentsList.innerHTML = '<p style="color: #999; font-size: 14px;">No comments yet. Be the first to comment!</p>';
        return;
    }

    comments.forEach(comment => {
        const commentEl = document.createElement('div');
        commentEl.className = 'comment';
        commentEl.innerHTML = `
            <div class="comment-user">${comment.user}</div>
            <div class="comment-text">${comment.text}</div>
            <div class="comment-time">${comment.time}</div>
        `;
        commentsList.appendChild(commentEl);
    });
}

// Add comment
async function addComment() {
    const text = commentInput.value.trim();
    if (!text || !currentGiftId) return;

    try {
        const comment = {
            user: 'You',
            text: text,
            time: new Date().toLocaleString()
        };

        await db.collection('gifts').doc(currentGiftId).update({
            comments: firebase.firestore.FieldValue.arrayUnion(comment)
        });

        // Reload comments
        const doc = await db.collection('gifts').doc(currentGiftId).get();
        const gift = doc.data();
        renderComments(gift.comments || []);
        commentInput.value = '';
    } catch (error) {
        console.error('Error adding comment:', error);
        showError('Failed to add comment');
    }
}

// Delete current gift
async function deleteGift() {
    if (!currentGiftId) return;

    if (!confirm('Are you sure you want to delete this gift?')) return;

    try {
        showLoading();

        // Get the gift to find the image URL
        const doc = await db.collection('gifts').doc(currentGiftId).get();
        const gift = doc.data();

        // Delete the image from Storage
        if (gift.imagePath) {
            const imageRef = storage.ref(gift.imagePath);
            await imageRef.delete();
        }

        // Delete the document from Firestore
        await db.collection('gifts').doc(currentGiftId).delete();

        closeModal();
        hideLoading();
    } catch (error) {
        console.error('Error deleting gift:', error);
        hideLoading();
        showError('Failed to delete gift');
    }
}

// Open add modal
function openAddModal() {
    addModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close add modal
function closeAddModal() {
    addModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    imageInput.value = '';
    descriptionInput.value = '';
    imagePreview.innerHTML = '';
}

// Preview image before upload
imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
});

// Add new gift
async function addNewGift() {
    const file = imageInput.files[0];
    const description = descriptionInput.value.trim();

    if (!file) {
        alert('Please select an image');
        return;
    }

    if (!description) {
        alert('Please add a description');
        return;
    }

    try {
        showLoading();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading...';

        // Create a unique filename
        const timestamp = Date.now();
        const filename = `${timestamp}_${file.name}`;
        const storageRef = storage.ref(`gifts/${filename}`);

        // Upload the image
        const uploadTask = await storageRef.put(file);

        // Get the download URL
        const imageUrl = await uploadTask.ref.getDownloadURL();

        // Create the gift document in Firestore
        await db.collection('gifts').add({
            imageUrl: imageUrl,
            imagePath: `gifts/${filename}`,
            description: description,
            comments: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Reset button state first
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add to Wishlist';

        // Hide loading overlay
        hideLoading();

        // Close modal and show success
        closeAddModal();

        // Optional: Show success message
        const successDiv = document.createElement('div');
        successDiv.className = 'error-message';
        successDiv.style.backgroundColor = '#10b981';
        successDiv.textContent = 'Gift added successfully!';
        document.body.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 3000);

    } catch (error) {
        console.error('Error adding gift:', error);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add to Wishlist';
        hideLoading();
        showError('Failed to add gift. Please try again.');
    }
}

// Event listeners
addBtn.addEventListener('click', openAddModal);
closeBtn.addEventListener('click', closeModal);
closeAddBtn.addEventListener('click', closeAddModal);
deleteBtn.addEventListener('click', deleteGift);
addCommentBtn.addEventListener('click', addComment);
submitBtn.addEventListener('click', addNewGift);

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
    if (e.target === addModal) {
        closeAddModal();
    }
});

// Allow Enter key to add comment
commentInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addComment();
    }
});

// Initialize app
loadGifts();
