
        // Set current date
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', dateOptions);

        // Theme toggle functionality
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = themeToggle.querySelector('i');

        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            
            if (document.body.classList.contains('dark-mode')) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
        });

        // Mood selection functionality
        const moodButtons = document.querySelectorAll('.mood-btn');
        const saveNoteBtn = document.getElementById('saveNote');
        const moodNoteInput = document.getElementById('moodNote');
        const moodHistoryContainer = document.getElementById('moodHistory');
        let selectedMood = null;

        // Load saved moods from localStorage
        let moodHistory = JSON.parse(localStorage.getItem('moodHistory')) || [];
        
        // Display mood history
        function displayMoodHistory() {
            if (moodHistory.length === 0) {
                moodHistoryContainer.innerHTML = `
                    <div class="text-center py-5 text-muted">
                        <i class="fas fa-cloud fs-1 mb-3"></i>
                        <p>Your mood history will appear here</p>
                    </div>
                `;
                return;
            }

            moodHistoryContainer.innerHTML = '';
            
            // Sort moods by date (newest first)
            moodHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            moodHistory.forEach(entry => {
                const date = new Date(entry.date);
                const formattedDate = date.toLocaleDateString('en-US', dateOptions);
                const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                
                // Get emoji based on mood
                let emoji;
                let bgColor;
                switch(entry.mood) {
                    case 'happy': emoji = '😊'; bgColor = 'var(--happy-color)'; break;
                    case 'sad': emoji = '😢'; bgColor = 'var(--sad-color)'; break;
                    case 'excited': emoji = '🤩'; bgColor = 'var(--excited-color)'; break;
                    case 'calm': emoji = '😌'; bgColor = 'var(--calm-color)'; break;
                    default: emoji = '😐'; bgColor = 'var(--neutral-color)';
                }
                
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item p-3 mb-3';
                historyItem.style.backgroundColor = bgColor + '33'; // Add transparency
                historyItem.style.borderLeft = `5px solid ${bgColor}`;
                
                historyItem.innerHTML = `
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h5>${emoji} ${entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}</h5>
                            <div class="text-muted small">${formattedDate} at ${formattedTime}</div>
                            ${entry.note ? `<div class="mt-2">${entry.note}</div>` : ''}
                        </div>
                        <button class="btn btn-sm btn-outline-danger delete-mood" data-id="${entry.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                
                moodHistoryContainer.appendChild(historyItem);
            });
            
            // Add event listeners to delete buttons
            document.querySelectorAll('.delete-mood').forEach(btn => {
                btn.addEventListener('click', e => {
                    const id = e.currentTarget.getAttribute('data-id');
                    deleteMood(id);
                });
            });
        }

        // Delete a mood from history
        function deleteMood(id) {
            moodHistory = moodHistory.filter(entry => entry.id !== id);
            localStorage.setItem('moodHistory', JSON.stringify(moodHistory));
            displayMoodHistory();
        }

        // Display initial mood history
        displayMoodHistory();

        moodButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove 'selected' class from all buttons
                moodButtons.forEach(b => b.classList.remove('selected'));
                
                // Add 'selected' class to the clicked button
                btn.classList.add('selected');
                btn.classList.add('animate-mood');
                
                // Set the background color based on the selected mood
                const color = btn.getAttribute('data-color');
                document.body.style.backgroundColor = color + '33'; // Add transparency
                
                // Store the selected mood
                selectedMood = btn.getAttribute('data-mood');
                
                // Remove animation class after animation completes
                setTimeout(() => {
                    btn.classList.remove('animate-mood');
                }, 500);
            });
        });

        // Save mood and note to history
        saveNoteBtn.addEventListener('click', () => {
            if (!selectedMood) {
                alert('Please select a mood first!');
                return;
            }
            
            const note = moodNoteInput.value.trim();
            const currentDate = new Date();
            
            // Create a new mood entry
            const moodEntry = {
                id: Date.now().toString(), // Use timestamp as unique ID
                mood: selectedMood,
                note: note,
                date: currentDate.toISOString()
            };
            
            // Add to mood history
            moodHistory.push(moodEntry);
            
            // Save to localStorage
            localStorage.setItem('moodHistory', JSON.stringify(moodHistory));
            
            // Update the display
            displayMoodHistory();
            
            // Reset inputs
            moodButtons.forEach(btn => btn.classList.remove('selected'));
            moodNoteInput.value = '';
            selectedMood = null;
            
            // Hide note collapse
            bootstrap.Collapse.getInstance(document.getElementById('noteCollapse')).hide();
            
            // Reset background color after a delay
            setTimeout(() => {
                document.body.style.backgroundColor = '';
            }, 1000);
        });
