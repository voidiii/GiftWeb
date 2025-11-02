// Gift posts storage
let currentGiftId = null;
let giftsArray = []; // Store gifts for drag-and-drop
let draggedElement = null;
let draggedIndex = null;

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

// Create a gift card element
function createCard(gift, rank) {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-gift-id', gift.id);

    const commentCount = gift.comments ? gift.comments.length : 0;
    const likeCount = Math.floor(Math.random() * 1000) + 100; // Mock like count

    card.innerHTML = `
        <img src="${gift.imageUrl}" alt="${gift.description}" loading="lazy">
        <div class="card-info">
            <div class="card-header">
                <div class="card-avatar">🎁</div>
                <span class="card-username">Gift Enthusiast</span>
            </div>
            <div class="card-description">${gift.description}</div>
            <div class="card-footer">
                <div class="card-meta">
                    <span>${commentCount} comments</span>
                </div>
                <div class="card-likes">
                    <span class="heart-icon">❤️</span>
                    <span>${likeCount}</span>
                </div>
            </div>
        </div>
    `;

    // Click to open modal (but not when dragging)
    card.addEventListener('click', (e) => {
        if (!isDraggingCard && !card.classList.contains('dragging')) {
            openModal(gift.id);
        }
    });

    // Drag events for desktop
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

        // Set title and description
        const modalTitle = document.getElementById('modalTitle');
        modalTitle.textContent = gift.description;
        modalDescription.textContent = gift.description;

        // Render comments and update count
        const comments = gift.comments || [];
        renderComments(comments);
        document.getElementById('commentCount').textContent = `(${comments.length})`;

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Reset comment input and button state
        commentInput.value = '';
        updateCommentButtonState();

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

// Update comment button state based on input
function updateCommentButtonState() {
    const hasText = commentInput.value.trim().length > 0;
    if (hasText) {
        addCommentBtn.disabled = false;
        addCommentBtn.classList.remove('comment-btn-disabled');
    } else {
        addCommentBtn.disabled = true;
        addCommentBtn.classList.add('comment-btn-disabled');
    }
}

// Render comments
function renderComments(comments) {
    commentsList.innerHTML = '';

    if (!comments || comments.length === 0) {
        commentsList.innerHTML = '<p class="no-comments-text">No comments yet. Be the first to share your thoughts!</p>';
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
        const comments = gift.comments || [];
        renderComments(comments);
        document.getElementById('commentCount').textContent = `(${comments.length})`;

        commentInput.value = '';
        updateCommentButtonState();
    } catch (error) {
        console.error('Error adding comment:', error);
        showError('Failed to add comment');
    }
}

// Delete current gift
async function deleteGift() {
    if (!currentGiftId) return;

    // Create a better confirmation dialog
    const confirmed = confirm('Are you sure you want to delete this gift from your wishlist? This action cannot be undone.');
    if (!confirmed) return;

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

        // Show success message
        const successDiv = document.createElement('div');
        successDiv.className = 'error-message';
        successDiv.style.backgroundColor = '#10b981';
        successDiv.textContent = 'Gift removed from your wishlist';
        document.body.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 3000);
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

// Update comment button state on input change
commentInput.addEventListener('input', updateCommentButtonState);

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
    if (e.target === addModal) {
        closeAddModal();
    }
});

// Allow Enter key to add comment (only if button is not disabled)
commentInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !addCommentBtn.disabled) {
        addComment();
    }
});

// iOS-style Drag and Drop Handlers
function handleDragStart(e) {
    draggedElement = e.currentTarget;
    const draggedId = draggedElement.getAttribute('data-gift-id');
    draggedIndex = giftsArray.findIndex(g => g.id === draggedId);

    // Create custom drag image
    const dragImage = new Image();
    dragImage.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"%3E%3C/svg%3E';
    e.dataTransfer.setDragImage(dragImage, 0, 0);

    e.currentTransfer = {
        effectAllowed: 'move',
        setData: () => {}
    };

    // Scale down the dragged card immediately
    draggedElement.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => {
        card.classList.remove('dragging', 'swap-move', 'drag-over');
    });
    draggedElement = null;
    draggedIndex = null;
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';

    if (!draggedElement) return false;

    const targetCard = e.currentTarget;
    if (targetCard === draggedElement) return false;

    const targetId = targetCard.getAttribute('data-gift-id');
    const targetIndex = giftsArray.findIndex(g => g.id === targetId);

    if (targetIndex !== -1 && draggedIndex !== null) {
        // Perform swap animation in the array
        const [removed] = giftsArray.splice(draggedIndex, 1);
        giftsArray.splice(targetIndex, 0, removed);
        draggedIndex = targetIndex;

        // Re-render with smooth animations
        renderGiftsWithAnimation();
    }

    return false;
}

function handleDragEnter(e) {
    if (e.currentTarget === draggedElement) return;
    e.currentTarget.classList.add('swap-move');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('swap-move');
}

async function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    e.preventDefault();

    // Save the new order to Firestore
    if (draggedIndex !== null) {
        await saveGiftOrder();
    }

    // Clean up
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => {
        card.classList.remove('dragging', 'swap-move', 'drag-over');
    });

    return false;
}

// Render with smooth animations for iOS-style reordering
function renderGiftsWithAnimation() {
    container.innerHTML = '';

    giftsArray.forEach((gift, index) => {
        const card = createCard(gift, index + 1);
        container.appendChild(card);
    });
}

// Touch event handlers for mobile - iOS-style reordering
let touchStartY = 0;
let touchStartX = 0;
let touchElement = null;
let touchDraggedIndex = null;
let isDraggingCard = false;
let dragStartTime = 0;

function handleTouchStart(e) {
    touchElement = e.currentTarget;
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
    dragStartTime = Date.now();
    isDraggingCard = false;

    const touchId = touchElement.getAttribute('data-gift-id');
    touchDraggedIndex = giftsArray.findIndex(g => g.id === touchId);
}

function handleTouchMove(e) {
    if (!touchElement) return;

    const touchY = e.touches[0].clientY;
    const touchX = e.touches[0].clientX;

    // Calculate distance moved
    const distanceY = Math.abs(touchY - touchStartY);
    const distanceX = Math.abs(touchX - touchStartX);
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    // Only activate dragging if user has moved more than 10px
    if (distance > 10 && !isDraggingCard) {
        isDraggingCard = true;
        e.preventDefault();
        touchElement.classList.add('dragging');
    }

    if (!isDraggingCard) return;

    e.preventDefault();

    const currentElement = document.elementFromPoint(touchX, touchY);

    // Remove all swap-move classes
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('swap-move');
    });

    // Add swap-move to element under touch
    if (currentElement && currentElement.classList.contains('card') && currentElement !== touchElement) {
        const targetId = currentElement.getAttribute('data-gift-id');
        const targetIndex = giftsArray.findIndex(g => g.id === targetId);

        if (targetIndex !== -1 && touchDraggedIndex !== null && targetIndex !== touchDraggedIndex) {
            // Perform swap in array
            const [removed] = giftsArray.splice(touchDraggedIndex, 1);
            giftsArray.splice(targetIndex, 0, removed);
            touchDraggedIndex = targetIndex;

            // Re-render with smooth animations
            renderGiftsWithAnimation();
        }

        currentElement.classList.add('swap-move');
    }
}

async function handleTouchEnd(e) {
    if (!touchElement) return;

    const wasCardDragged = isDraggingCard;

    touchElement.classList.remove('dragging');

    // Remove all swap-move classes
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('swap-move');
    });

    // Save the new order to Firestore if card was actually dragged
    if (wasCardDragged && touchDraggedIndex !== null) {
        await saveGiftOrder();
    }

    touchElement = null;
    touchDraggedIndex = null;
    isDraggingCard = false;
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
