// Gift posts storage
let currentGiftId = null;
let giftsArray = []; // Store gifts for drag-and-drop
let draggedElement = null;

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
        .onSnapshot((snapshot) => {
            console.log('Real-time update received! Total gifts:', snapshot.size);
            container.innerHTML = '';

            if (snapshot.empty) {
                showEmptyState();
                hideLoading();
                return;
            }

            // Convert to array
            giftsArray = [];
            snapshot.forEach((doc) => {
                giftsArray.push({ id: doc.id, ...doc.data() });
            });

            // Sort by priority (lower number = higher priority), then by createdAt
            giftsArray.sort((a, b) => {
                const priorityA = a.priority ?? 999999;
                const priorityB = b.priority ?? 999999;
                if (priorityA !== priorityB) {
                    return priorityA - priorityB;
                }
                const timeA = a.createdAt?.toMillis() || 0;
                const timeB = b.createdAt?.toMillis() || 0;
                return timeB - timeA;
            });

            // Render sorted gifts with ranking
            renderGifts();

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

// Render gifts with drag-and-drop
function renderGifts() {
    container.innerHTML = '';

    giftsArray.forEach((gift, index) => {
        const card = createCard(gift, index + 1);
        container.appendChild(card);
    });
}

// Create a gift card element with ranking
function createCard(gift, rank) {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-gift-id', gift.id);

    const commentCount = gift.comments ? gift.comments.length : 0;

    card.innerHTML = `
        <div class="rank-badge">#${rank}</div>
        <img src="${gift.imageUrl}" alt="${gift.description}" loading="lazy">
        <div class="card-info">
            <div class="card-description">${gift.description}</div>
            <div class="card-meta">
                <span class="card-avatar">🎁</span>
                <span>${commentCount} comments</span>
            </div>
        </div>
    `;

    // Click to open modal (but not when dragging)
    card.addEventListener('click', (e) => {
        if (!card.classList.contains('dragging')) {
            openModal(gift.id);
        }
    });

    // Drag events
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
    card.addEventListener('dragover', handleDragOver);
    card.addEventListener('drop', handleDrop);
    card.addEventListener('dragenter', handleDragEnter);
    card.addEventListener('dragleave', handleDragLeave);

    // Touch events for mobile
    card.addEventListener('touchstart', handleTouchStart, { passive: false });
    card.addEventListener('touchmove', handleTouchMove, { passive: false });
    card.addEventListener('touchend', handleTouchEnd);

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

// Drag and Drop Handlers
function handleDragStart(e) {
    draggedElement = e.currentTarget;
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
}

function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');

    // Remove all drag-over classes
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('drag-over');
    });

    draggedElement = null;
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    if (e.currentTarget !== draggedElement) {
        e.currentTarget.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

async function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    e.preventDefault();

    const dropTarget = e.currentTarget;
    dropTarget.classList.remove('drag-over');

    if (draggedElement && draggedElement !== dropTarget) {
        // Get IDs
        const draggedId = draggedElement.getAttribute('data-gift-id');
        const targetId = dropTarget.getAttribute('data-gift-id');

        // Find indices
        const draggedIndex = giftsArray.findIndex(g => g.id === draggedId);
        const targetIndex = giftsArray.findIndex(g => g.id === targetId);

        if (draggedIndex !== -1 && targetIndex !== -1) {
            // Reorder array
            const [removed] = giftsArray.splice(draggedIndex, 1);
            giftsArray.splice(targetIndex, 0, removed);

            // Save new order to Firestore
            await saveGiftOrder();

            // Re-render
            renderGifts();
        }
    }

    return false;
}

// Touch event handlers for mobile
let touchStartY = 0;
let touchElement = null;

function handleTouchStart(e) {
    touchElement = e.currentTarget;
    touchStartY = e.touches[0].clientY;
    touchElement.classList.add('dragging');
}

function handleTouchMove(e) {
    e.preventDefault();

    if (!touchElement) return;

    const touchY = e.touches[0].clientY;
    const currentElement = document.elementFromPoint(e.touches[0].clientX, touchY);

    // Remove all drag-over classes
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('drag-over');
    });

    // Add drag-over to element under touch
    if (currentElement && currentElement.classList.contains('card') && currentElement !== touchElement) {
        currentElement.classList.add('drag-over');
    }
}

async function handleTouchEnd(e) {
    if (!touchElement) return;

    const touchY = e.changedTouches[0].clientY;
    const targetElement = document.elementFromPoint(e.changedTouches[0].clientX, touchY);

    touchElement.classList.remove('dragging');

    // Remove all drag-over classes
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('drag-over');
    });

    if (targetElement && targetElement.classList.contains('card') && targetElement !== touchElement) {
        const draggedId = touchElement.getAttribute('data-gift-id');
        const targetId = targetElement.getAttribute('data-gift-id');

        const draggedIndex = giftsArray.findIndex(g => g.id === draggedId);
        const targetIndex = giftsArray.findIndex(g => g.id === targetId);

        if (draggedIndex !== -1 && targetIndex !== -1) {
            const [removed] = giftsArray.splice(draggedIndex, 1);
            giftsArray.splice(targetIndex, 0, removed);

            await saveGiftOrder();
            renderGifts();
        }
    }

    touchElement = null;
}

// Save gift order to Firestore
async function saveGiftOrder() {
    try {
        const batch = db.batch();

        giftsArray.forEach((gift, index) => {
            const giftRef = db.collection('gifts').doc(gift.id);
            batch.update(giftRef, { priority: index });
        });

        await batch.commit();
        console.log('✅ Gift order saved');
    } catch (error) {
        console.error('Error saving gift order:', error);
        showError('Failed to save order');
    }
}

// Initialize app
loadGifts();
