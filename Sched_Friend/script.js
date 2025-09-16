// script.js 
// ================================================================================= 
// SECTION 1: AI AGENT AND SYSTEM CLASSES 
// This section defines the core logic for the multi-agent system. 
// ================================================================================= 
class EnhancedAIAgent { 
    constructor(name, type, capabilities = []) { 
        this.name = name; 
        this.type = type; 
        this.capabilities = capabilities; 
        this.status = 'Idle'; 
        this.lastAction = 'Initialized'; 
        this.isActive = false; 
    } 
    updateStatus(status, action) { 
        this.status = status; 
        this.lastAction = action; 
        this.updateUI(); 
    } 
    updateUI() { 
        const statusEl = document.getElementById(`${this.type}-status`); 
        const actionEl = document.getElementById(`${this.type}-action`); 
        const indicatorEl = document.getElementById(`${this.type}-indicator`); 
        if (statusEl) statusEl.textContent = this.status; 
        if (actionEl) actionEl.textContent = this.lastAction; 
        if (indicatorEl) { 
            indicatorEl.className = `status-indicator ${this.isActive ? 'status-active' : 'status-idle'}`; 
        } 
    } 
    delay(ms) { 
        return new Promise(resolve => setTimeout(resolve, ms)); 
    } 
} 
class FileProcessingAgent extends EnhancedAIAgent { 
    constructor() { 
        super('FileProcessor', 'file-processor', ['PDF', 'DOCX', 'Images', 'Text']); 
    } 
    async processFile(file) { 
        this.updateStatus('Analyzing file...', `Processing ${file.name}`); 
        this.isActive = true; 
        this.updateUI(); 
        const fileType = this.getFileType(file.name); 
        let extractedContent = '', analysis = {}; 
        try { 
            switch (fileType) { 
                case 'pdf': extractedContent = await this.processPDF(file); break; 
                case 'docx': extractedContent = await this.processDocx(file); break; 
                case 'image': extractedContent = await this.processImage(file); break; 
                case 'txt': extractedContent = await this.processText(file); break; 
                default: throw new Error('Unsupported file type'); 
            } 
            analysis = await this.analyzeContent(extractedContent); 
            this.updateStatus('File processed', `Extracted ${extractedContent.split(' ').length} words`); 
            return { 
                success: true, content: extractedContent, analysis, fileType, 
                metadata: { name: file.name, size: file.size, lastModified: file.lastModified } 
            }; 
        } catch (error) { 
            this.updateStatus('Processing failed', error.message); 
            return { success: false, error: error.message }; 
        } finally { 
            this.isActive = false; 
            this.updateUI(); 
        } 
    } 
    
    getFileType(filename) { 
        const ext = filename.toLowerCase().split('.').pop(); 
        if (ext === 'pdf') return 'pdf'; 
        if (['doc', 'docx'].includes(ext)) return 'docx'; 
        if (['png', 'jpg', 'jpeg'].includes(ext)) return 'image'; 
        if (['txt'].includes(ext)) return 'txt'; 
        return 'unknown'; 
    } 
    async processPDF(file) { 
        await this.delay(1500);  
        return `[Simulated PDF Content: ${file.name}]\n\nKey topics identified: Calculus, Linear Algebra. A real app would use PDF.js to extract text.`; 
    } 
    async processDocx(file) { 
        await this.delay(1200); 
        try { 
            const res = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() }); 
            return res.value || `[Simulated DOCX Content: ${file.name}]`; 
        } catch (e) {  
            return `[Simulated DOCX Content: ${file.name}]\n\nThemes detected: Time management.`;  
        } 
    } 
    async processImage(file) { 
        await this.delay(2000);  
        return `[Simulated OCR Content: ${file.name}]\n\nDetected text: "Chapter 5: Thermodynamics". A real app would use Tesseract.js.`; 
    } 
    processText(file) { 
        return new Promise(resolve => { 
            const reader = new FileReader(); 
            reader.onload = e => resolve(e.target.result); 
            reader.readAsText(file); 
        }); 
    } 
    async analyzeContent(content) { 
        const words = content.split(/\s+/).length; 
        const topicKeywords={ 
            'Mathematics':['math','calculus','algebra','geometry','statistics'], 
            'Physics':['physics','force','energy','quantum','mechanics','thermodynamics'], 
            'Chemistry':['chemistry','molecule','reaction','organic','inorganic'], 
            'Biology':['biology','cell','genetics','evolution','ecology'], 
            'Computer Science':['programming','algorithm','data structure','software','database'], 
            'Operating Systems':['operating system','process','thread','scheduling','memory management'], 
            'History':['history','war','civilization','revolution','ancient'], 
            'Literature':['literature','novel','poetry','drama','author'], 
            'Psychology':['psychology','mind','behavior','cognitive','therapy'] 
        }; 
        const foundTopics = new Set(); 
        const contentLower = content.toLowerCase(); 
        for (const [topic, keywords] of Object.entries(topicKeywords)) { 
           if (keywords.some(k => contentLower.includes(k))) foundTopics.add(topic); 
        } 
        const complexWords = (content.match(/[a-zA-Z]{9,}/g) || []).length; 
        const difficulty = (complexWords/words > 0.08) ? 'Advanced' : (complexWords/words > 0.04) ? 'Intermediate' : 'Beginner'; 
        return { wordCount: words, topics: Array.from(foundTopics), difficulty }; 
    } 
} 
class ChatbotAgent extends EnhancedAIAgent { 
    constructor() { 
        super('Chatbot', 'chatbot', ['Q&A', 'Study Tips', 'Concept Explanation', 'Motivation']); 
        this.responses = { 
            greetings: [ 
                "Hello! I'm your AI study assistant. How can I help you today?", 
                "Hi there! Ready to tackle your study goals? What can I assist you with?", 
                "Greetings! I'm here to support your learning journey. What's on your mind?" 
            ], 
            studyTips: [ 
                "Try the Pomodoro Technique: study for 25 minutes, then take a 5-minute break.", 
                "Active recall is more effective than passive reading. Test yourself regularly.", 
                "Spaced repetition helps with long-term retention. Review material at increasing intervals." 
            ], 
            motivation: [ 
                "Remember why you started. Every small step brings you closer to your goal!", 
                "You're capable of amazing things. Keep pushing forward!", 
                "Progress, not perfection. Celebrate your small wins along the way." 
            ], 
            default: [ 
                "I'm here to help with your studies. Could you tell me more about what you're working on?", 
                "That's an interesting question. Let me think about how I can best assist you.", 
                "I'd be happy to help with that. Could you provide a bit more context?" 
            ] 
        }; 
    } 
    
    generateResponse(message) { 
        const lowerMessage = message.toLowerCase(); 
        
        // Check for greetings 
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) { 
            return this.getRandomResponse('greetings'); 
        } 
        
        // Check for study-related questions 
        if (lowerMessage.includes('study') || lowerMessage.includes('learn') || lowerMessage.includes('how to')) { 
            return this.getRandomResponse('studyTips'); 
        } 
        
        // Check for motivation requests 
        if (lowerMessage.includes('motivat') || lowerMessage.includes('discourage') || lowerMessage.includes('give up')) { 
            return this.getRandomResponse('motivation'); 
        } 
        
        // Check for specific subjects 
        if (lowerMessage.includes('operating system') || lowerMessage.includes('os')) { 
            return "Operating Systems is a fascinating subject! Key concepts include processes, threads, memory management, and file systems. Would you like me to explain any of these in more detail?"; 
        } 
        
        // Default response 
        return this.getRandomResponse('default'); 
    } 
    
    getRandomResponse(category) { 
        const responses = this.responses[category]; 
        return responses[Math.floor(Math.random() * responses.length)]; 
    } 
    
    async processQuery(query) { 
        this.updateStatus('Processing query...', 'Analyzing your question'); 
        this.isActive = true; 
        this.updateUI(); 
        
        await this.delay(1000); 
        
        const response = this.generateResponse(query); 
        
        this.updateStatus('Query processed', 'Provided answer'); 
        this.isActive = false; 
        this.updateUI(); 
        
        return response; 
    } 
} 
class EnhancedStudySystem { 
    constructor() { 
        this.agents = { 
            planner: new EnhancedAIAgent('Planner', 'planner'), 
            executor: new EnhancedAIAgent('Executor', 'executor'), 
            monitor: new EnhancedAIAgent('Monitor', 'monitor'), 
            rag: new EnhancedAIAgent('RAG', 'rag'), 
            file: new FileProcessingAgent(), 
            chatbot: new ChatbotAgent() 
        }; 
        this.users = new Map(); 
        this.currentUser = null; 
        this.userSchedules = new Map(); 
        this.userProgress = new Map(); 
        this.uploadedFiles = new Map(); 
        this.subjectFiles = new Map(); // userId -> Map<subject, [files]> 
        this.knowledgeBase = new Map(); 
        this.notes = new Map(); 
        this.calendarNotes = new Map(); // userId -> Map<date, {note, files}> 
        this.settings = { 
            darkMode: true, 
            notifications: false, 
            focusMode: false, 
            autoSave: true, 
            smartScheduling: true, 
            adaptiveLearning: true 
        }; 
        this.currentMonth = new Date(); 
        this.progressChart = null; 
        this.timer = { 
            minutes: 25, 
            seconds: 0, 
            interval: null, 
            isRunning: false 
        }; 
        this.currentSubject = null; 
        this.currentFilter = 'all'; 
        this.currentSort = 'time'; 
        this.currentNotesFilter = 'all'; 
        this.currentFileTab = 'all'; 
        this.sessionTypes = { 
            learning: { color: '#3b82f6', label: 'Learning' }, 
            practice: { color: '#f59e0b', label: 'Practice' }, 
            review: { color: '#8b5cf6', label: 'Review' } 
        }; 
        this.learningStyles = { 
            visual: { icon: 'fa-eye', label: 'Visual' }, 
            auditory: { icon: 'fa-headphones', label: 'Auditory' }, 
            kinesthetic: { icon: 'fa-hand-paper', label: 'Kinesthetic' }, 
            reading: { icon: 'fa-book', label: 'Reading/Writing' } 
        }; 
        this.studyPreferences = { 
            morning: { label: 'Morning (6AM-12PM)', hours: [6, 7, 8, 9, 10, 11] }, 
            afternoon: { label: 'Afternoon (12PM-6PM)', hours: [12, 13, 14, 15, 16, 17] }, 
            evening: { label: 'Evening (6PM-12AM)', hours: [18, 19, 20, 21, 22, 23] }, 
            night: { label: 'Night (12AM-6AM)', hours: [0, 1, 2, 3, 4, 5] } 
        }; 
        this.topicsDatabase = { 
            'mathematics': { 
                'beginner': ['Basic Algebra', 'Geometry Fundamentals', 'Introduction to Statistics'], 
                'intermediate': ['Calculus I', 'Linear Algebra', 'Probability Theory'], 
                'advanced': ['Multivariable Calculus', 'Differential Equations', 'Abstract Algebra'] 
            }, 
            'physics': { 
                'beginner': ['Classical Mechanics', 'Thermodynamics Basics', 'Introduction to Waves'], 
                'intermediate': ['Electromagnetism', 'Quantum Mechanics', 'Relativity'], 
                'advanced': ['Quantum Field Theory', 'Particle Physics', 'General Relativity'] 
            }, 
            'chemistry': { 
                'beginner': ['Atomic Structure', 'Chemical Bonding', 'Introduction to Organic Chemistry'], 
                'intermediate': ['Chemical Kinetics', 'Thermodynamics', 'Organic Reactions'], 
                'advanced': ['Quantum Chemistry', 'Biochemistry', 'Inorganic Complexes'] 
            }, 
            'biology': { 
                'beginner': ['Cell Biology', 'Genetics Basics', 'Introduction to Evolution'], 
                'intermediate': ['Molecular Biology', 'Physiology', 'Ecology'], 
                'advanced': ['Bioinformatics', 'Genomics', 'Advanced Genetics'] 
            }, 
            'computer science': { 
                'beginner': ['Programming Fundamentals', 'Data Structures', 'Algorithms Basics'], 
                'intermediate': ['Object-Oriented Programming', 'Database Systems', 'Software Engineering'], 
                'advanced': ['Machine Learning', 'Computer Graphics', 'Distributed Systems'] 
            }, 
            'operating systems': { 
                'beginner': ['Introduction to OS', 'Process Management', 'Memory Management Basics'], 
                'intermediate': ['Process Scheduling', 'File Systems', 'I/O Systems'], 
                'advanced': ['Distributed Systems', 'Virtualization', 'Security in OS'] 
            } 
        }; 
        this.sessionResources = { 
            'mathematics': [ 
                { type: 'video', title: 'Khan Academy - Algebra Basics', url: '#' }, 
                { type: 'article', title: 'MIT OpenCourseWare - Calculus', url: '#' }, 
                { type: 'practice', title: 'Brilliant - Math Problems', url: '#' } 
            ], 
            'physics': [ 
                { type: 'video', title: 'Crash Course Physics', url: '#' }, 
                { type: 'simulation', title: 'PhET Interactive Simulations', url: '#' }, 
                { type: 'article', title: 'Physics Classroom - Tutorials', url: '#' } 
            ], 
            'chemistry': [ 
                { type: 'video', title: 'Crash Course Chemistry', url: '#' }, 
                { type: 'simulation', title: 'ChemCollective Virtual Labs', url: '#' }, 
                { type: 'article', title: 'ChemGuide - Concepts', url: '#' } 
            ], 
            'biology': [ 
                { type: 'video', title: 'Crash Course Biology', url: '#' }, 
                { type: 'simulation', title: 'BioInteractive Virtual Labs', url: '#' }, 
                { type: 'article', title: 'Biology Corner - Lessons', url: '#' } 
            ], 
            'computer science': [ 
                { type: 'video', title: 'Harvard CS50', url: '#' }, 
                { type: 'interactive', title: 'Codecademy - Interactive Coding', url: '#' }, 
                { type: 'article', title: 'GeeksforGeeks - Algorithms', url: '#' } 
            ], 
            'operating systems': [ 
                { type: 'video', title: 'Operating Systems - Crash Course', url: '#' }, 
                { type: 'book', title: 'Operating System Concepts by Silberschatz', url: '#' }, 
                { type: 'simulation', title: 'OS Simulations - Interactive Learning', url: '#' } 
            ] 
        }; 
        
        // Quiz question templates
        this.quizTemplates = {
            definition: {
                question: "What is the definition of {topic}?",
                options: [
                    "A concept related to {topic}",
                    "Another concept related to {topic}",
                    "A misleading concept about {topic}",
                    "The correct definition of {topic}"
                ],
                correct: 3
            },
            concept: {
                question: "Which of the following best describes {topic}?",
                options: [
                    "Incorrect description of {topic}",
                    "Partially correct description of {topic}",
                    "Misleading information about {topic}",
                    "Accurate description of {topic}"
                ],
                correct: 3
            },
            application: {
                question: "How would you apply {topic} in a real-world scenario?",
                options: [
                    "Incorrect application of {topic}",
                    "Partially correct application of {topic}",
                    "Misleading application of {topic}",
                    "Correct application of {topic}"
                ],
                correct: 3
            }
        };
    } 
    
    initializeSystem() { 
        this.loadState(); 
        this.initializeKnowledgeBase(); 
        this.startSystemMonitoring(); 
        this.renderUserCards(); 
        this.initializeCalendar(); 
        this.initializeProgressChart(); 
        this.initializeTimer(); 
        this.initializeSettings(); 
        this.initializeEventListeners(); 
        
        // Only show add user option initially 
        if (this.users.size === 0) { 
            showToast('Please add a user to get started', 'info'); 
        } else { 
            // Switch to first user if users exist 
            this.switchUser(this.users.keys().next().value); 
        } 
    } 
    
    saveState() { 
        const state = { 
            users: [...this.users], 
            userSchedules: [...this.userSchedules], 
            userProgress: [...this.userProgress], 
            uploadedFiles: [...this.uploadedFiles], 
            subjectFiles: [...this.subjectFiles], 
            notes: [...this.notes], 
            calendarNotes: [...this.calendarNotes], 
            settings: this.settings 
        }; 
        sessionStorage.setItem('aiStudyNexusState', JSON.stringify(state)); 
    } 
    
    loadState() { 
        const stateJSON = sessionStorage.getItem('aiStudyNexusState'); 
        if (stateJSON) { 
            try { 
                const state = JSON.parse(stateJSON); 
                this.users = new Map(state.users || []); 
                this.userSchedules = new Map(state.userSchedules || []); 
                this.userProgress = new Map(state.userProgress || []); 
                this.uploadedFiles = new Map(state.uploadedFiles || []); 
                this.subjectFiles = new Map(state.subjectFiles || []); 
                this.notes = new Map(state.notes || []); 
                this.calendarNotes = new Map(state.calendarNotes || []); 
                this.settings = { ...this.settings, ...(state.settings || {}) }; 
                showToast('Welcome back! Your data has been loaded.', 'success'); 
            } catch (e) { 
                sessionStorage.removeItem('aiStudyNexusState'); 
            } 
        } 
    } 
    
    addUser(id, name, avatarColor) { 
        if ([...this.users.values()].some(u => u.name.toLowerCase() === name.toLowerCase())) { 
            showToast(`User "${name}" already exists.`, 'error'); return null; 
        } 
        this.users.set(id, { id, name, avatarColor }); 
        this.userSchedules.set(id, []); 
        this.uploadedFiles.set(id, []); 
        this.subjectFiles.set(id, new Map()); 
        this.userProgress.set(id, {  
            completionRate: 0,  
            studyStreak: 0,  
            totalHours: 0,  
            daysLeft: 0,  
            formHistory: null, 
            subjectProgress: new Map() 
        }); 
        this.notes.set(id, []); 
        this.calendarNotes.set(id, new Map()); 
        this.saveState(); 
        return this.users.get(id); 
    } 
    
    renderUserCards() { 
        const selector = document.querySelector('.user-selector'); 
        selector.querySelectorAll('.user-card:not([data-user="add-user"])').forEach(c => c.remove()); 
        const addCard = selector.querySelector('[data-user="add-user"]'); 
        this.users.forEach(user => { 
            const card = document.createElement('div'); 
            card.className = 'user-card'; 
            card.dataset.user = user.id; 
            card.onclick = () => this.switchUser(user.id); 
            card.innerHTML = `<div class="user-avatar" style="background:${user.avatarColor}">${user.name[0].toUpperCase()}</div><div>${user.name}</div>`; 
            selector.insertBefore(card, addCard); 
        }); 
    } 
    
    switchUser(userId) { 
        if (!this.users.has(userId)) return; 
        this.currentUser = userId; 
        document.querySelectorAll('.user-card').forEach(c => c.classList.toggle('active', c.dataset.user === userId)); 
        this.loadUserData(userId); 
        const user = this.users.get(userId); 
        this.agents.planner.updateStatus('User switched', `Loading ${user.name}'s profile`); 
        this.agents.monitor.updateStatus('Monitoring user', `Tracking ${user.name}'s progress`); 
        showToast(`Switched to ${user.name}'s profile`, 'info'); 
    } 
    
    loadUserData(userId) { 
        const schedule = this.userSchedules.get(userId) || []; 
        const progress = this.userProgress.get(userId); 
        const { formHistory } = progress; 
        document.getElementById('examDate').value = formHistory?.examDate || document.getElementById('examDate').value; 
        document.getElementById('studyGoals').value = formHistory?.studyGoals || ''; 
        
        updateSubjectTags(formHistory?.subjects || ''); 
        updateCustomSelect('studyHours', formHistory?.studyHours || '4'); 
        updateCustomSelect('difficulty', formHistory?.difficulty || 'intermediate'); 
        
        // Load learning style 
        if (formHistory?.learningStyle) { 
            document.querySelectorAll('.learning-style').forEach(style => { 
                style.classList.toggle('active', style.dataset.style === formHistory.learningStyle); 
            }); 
            document.getElementById('learningStyle').value = formHistory.learningStyle; 
        } 
        
        // Load study preferences 
        if (formHistory?.studyPreferences) { 
            document.querySelectorAll('input[name="studyTime"]').forEach(checkbox => { 
                checkbox.checked = formHistory.studyPreferences.includes(checkbox.value); 
            }); 
        } 
        
        this.updateScheduleUI(schedule); 
        this.updateProgressUI(progress); 
        this.updateFilesUI(); 
        this.updateNotesUI(); 
        this.updateCalendar(); 
        this.updateProgressChart(); 
        this.updateSubjectProgress(); 
    } 
    
    async generateSchedule(formData) { 
        if (!this.currentUser) return showToast('No user selected.', 'error'); 
        const subjects = formData.subjects.replace(/,/g, ' ').split(/\s+/).filter(Boolean); 
        if (subjects.length === 0) return showToast('Please add at least one subject.', 'error'); 
        
        try { 
            const progress = this.userProgress.get(this.currentUser); 
            progress.formHistory = formData; 
            await this.runAgentTask(this.agents.planner, 'Analyzing requirements...', 1000); 
            
            // Check if we have subject-specific files 
            const subjectFilesMap = this.subjectFiles.get(this.currentUser) || new Map(); 
            const hasSubjectFiles = subjects.some(subject => subjectFilesMap.has(subject) && subjectFilesMap.get(subject).length > 0); 
            
            if (hasSubjectFiles) { 
                await this.runAgentTask(this.agents.planner, 'Analyzing subject materials...', 1500); 
            } else if ((this.uploadedFiles.get(this.currentUser) || []).length > 0) { 
                await this.runAgentTask(this.agents.planner, 'Analyzing materials...', 1500); 
            } 
            
            await this.runAgentTask(this.agents.planner, 'Optimizing learning paths...', 1500); 
            const schedule = this.createEnhancedSchedule({ ...formData, subjects }); 
            if (schedule.length === 0) { 
                showToast('Could not generate schedule. Is the exam date in the future?', 'warning'); 
                this.agents.planner.updateStatus('Idle', 'Generation failed'); 
                return; 
            } 
            this.agents.planner.updateStatus('Schedule optimized', `Generated ${schedule.length} sessions`); 
            await this.runAgentTask(this.agents.executor, `Implementing ${schedule.length} sessions...`, 1000); 
            
            this.userSchedules.set(this.currentUser, schedule); 
            this.updateScheduleUI(schedule); 
            this.updateUserProgress(formData); 
            this.updateCalendar(); 
            this.updateProgressChart(); 
            this.updateSubjectProgress(); 
            this.saveState(); 
            this.agents.executor.updateStatus('Implementation complete', 'Schedule is live'); 
            showToast('AI-optimized schedule generated!', 'success'); 
        } catch (error) { 
            showToast('An unexpected error occurred.', 'error'); 
            this.agents.planner.updateStatus('Error', 'Generation failed'); 
        } 
    } 
    
    async runAgentTask(agent, status, duration) { 
        agent.isActive = true; 
        agent.updateStatus(status, 'AI processing...'); 
        await agent.delay(duration); 
        agent.isActive = false; 
        agent.updateUI(); 
    } 
    
    generateGenericTopics(subject) { 
        const formatted = subject.split(' ').map(w => w[0].toUpperCase() + w.substring(1)).join(' '); 
        return [ 
            `Introduction to ${formatted}`,  
            `Core Concepts of ${formatted}`,  
            `Advanced ${formatted} Principles`,  
            `Practice Problems for ${formatted}` 
        ]; 
    } 
    
    createEnhancedSchedule(formData) { 
        const { subjects, examDate, studyHours, difficulty, learningStyle, studyPreferences } = formData; 
        const totalDays = this.calculateDaysUntilExam(examDate); 
        if (totalDays <= 0) return []; 
        
        let schedule = []; 
        const daysToPlan = Math.min(totalDays, 30); 
        
        // Get subject-specific files if available 
        const subjectFilesMap = this.subjectFiles.get(this.currentUser) || new Map(); 
        
        // Get available study hours based on preferences 
        let availableHours = []; 
        if (studyPreferences && studyPreferences.length > 0) { 
            studyPreferences.forEach(pref => { 
                if (this.studyPreferences[pref]) { 
                    availableHours = [...availableHours, ...this.studyPreferences[pref].hours]; 
                } 
            }); 
        } else { 
            // Default hours if no preference selected 
            availableHours = [9, 10, 11, 14, 15, 16, 19, 20, 21]; 
        } 
        
        // Create a pool of topics for each subject 
        const subjectTopics = {}; 
        subjects.forEach(subject => { 
            const subjectLower = subject.toLowerCase(); 
            
            // Get topics based on subject and difficulty 
            let topics; 
            if (this.topicsDatabase[subjectLower] && this.topicsDatabase[subjectLower][difficulty]) { 
                topics = this.topicsDatabase[subjectLower][difficulty]; 
            } else { 
                topics = this.generateGenericTopics(subject); 
            } 
            
            // If we have subject-specific files, prioritize topics from those files 
            const subjectFiles = subjectFilesMap.get(subject) || []; 
            if (subjectFiles.length > 0) { 
                // Extract topics from files (simplified for demo) 
                const fileTopics = []; 
                subjectFiles.forEach(file => { 
                    if (file.analysis && file.analysis.topics) { 
                        file.analysis.topics.forEach(topic => { 
                            if (!fileTopics.includes(topic)) { 
                                fileTopics.push(topic); 
                            } 
                        }); 
                    } 
                }); 
                
                if (fileTopics.length > 0) { 
                    // Use file topics instead of generic topics 
                    topics = fileTopics; 
                } 
            } 
            
            subjectTopics[subject] = topics; 
        }); 
        
        // Create a spaced repetition system 
        const reviewQueue = {}; 
        subjects.forEach(subject => { 
            reviewQueue[subject] = []; 
        }); 
        
        // Generate schedule day by day 
        for (let day = 1; day <= daysToPlan; day++) { 
            const sessionsForDay = []; 
            
            // Determine session types for the day based on learning style and day number 
            const sessionTypesForDay = this.getSessionTypesForDay(day, daysToPlan, learningStyle); 
            
            // Assign sessions based on available hours 
            for (let i = 0; i < Math.min(parseInt(studyHours), availableHours.length); i++) { 
                const hour = availableHours[i % availableHours.length]; 
                const time = `${String(hour).padStart(2, '0')}:00`; 
                
                // Determine subject for this session 
                const subjectIndex = (day + i - 1) % subjects.length; 
                const subject = subjects[subjectIndex]; 
                
                // Determine session type 
                const sessionType = sessionTypesForDay[i % sessionTypesForDay.length]; 
                
                let topic; 
                if (sessionType === 'review' && reviewQueue[subject].length > 0) { 
                    // Get a topic from the review queue 
                    topic = reviewQueue[subject].shift(); 
                } else { 
                    // Get a new topic 
                    const topics = subjectTopics[subject]; 
                    topic = topics[Math.floor(Math.random() * topics.length)]; 
                    
                    // Schedule this topic for review in the future 
                    if (sessionType === 'learning') { 
                        const reviewDays = [day + 1, day + 3, day + 7, day + 14, day + 30]; 
                        reviewDays.forEach(reviewDay => { 
                            if (reviewDay <= daysToPlan) { 
                                reviewQueue[subject].push(topic); 
                            } 
                        }); 
                    } 
                } 
                
                // Assign priority based on topic complexity and proximity to exam 
                let priority; 
                if (day <= totalDays * 0.3) { 
                    priority = 'low'; 
                } else if (day <= totalDays * 0.7) { 
                    priority = 'medium'; 
                } else { 
                    priority = 'high'; 
                } 
                
                sessionsForDay.push({ 
                    day,  
                    time,  
                    subject,  
                    topic,  
                    sessionType, 
                    priority, 
                    completed: false,  
                    duration: 1, 
                    notes: '', 
                    resources: this.sessionResources[subject.toLowerCase()] || [] 
                }); 
            } 
            
            // Add sessions to the schedule 
            schedule = [...schedule, ...sessionsForDay]; 
        } 
        
        return schedule; 
    } 
    
    getSessionTypesForDay(day, totalDays, learningStyle) { 
        // Default session types distribution 
        let sessionTypes = ['learning', 'learning', 'practice', 'review']; 
        
        // Adjust based on learning style 
        if (learningStyle === 'visual') { 
            sessionTypes = ['learning', 'practice', 'practice', 'review']; 
        } else if (learningStyle === 'auditory') { 
            sessionTypes = ['learning', 'review', 'learning', 'practice']; 
        } else if (learningStyle === 'kinesthetic') { 
            sessionTypes = ['practice', 'practice', 'learning', 'review']; 
        } else if (learningStyle === 'reading') { 
            sessionTypes = ['learning', 'learning', 'review', 'practice']; 
        } 
        
        // Adjust based on proximity to exam 
        if (day > totalDays * 0.7) { 
            // More review and practice as exam approaches 
            sessionTypes = ['review', 'practice', 'review', 'practice']; 
        } 
        
        return sessionTypes; 
    } 
    
    updateUserProgress(formData) { 
        if (!this.currentUser) return; 
        const progress = this.userProgress.get(this.currentUser); 
        const schedule = this.userSchedules.get(this.currentUser) || []; 
        const totalTasks = schedule.length; 
        const completedTasks = schedule.filter(s => s.completed).length; 
        progress.daysLeft = this.calculateDaysUntilExam(formData.examDate); 
        progress.completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0; 
        progress.totalHours = schedule.filter(s => s.completed).reduce((sum, s) => sum + s.duration, 0); 
        
        // Calculate study streak 
        let streak = 0; 
        const today = new Date(); 
        today.setHours(0, 0, 0, 0); 
        
        for (let i = 0; i < 365; i++) { 
            const checkDate = new Date(today); 
            checkDate.setDate(today.getDate() - i); 
            
            const hasCompletedSession = schedule.some(s => { 
                const sessionDate = new Date(); 
                sessionDate.setDate(sessionDate.getDate() - (s.day - 1)); 
                return s.completed &&  
                       sessionDate.getDate() === checkDate.getDate() && 
                       sessionDate.getMonth() === checkDate.getMonth() && 
                       sessionDate.getFullYear() === checkDate.getFullYear(); 
            }); 
            
            if (hasCompletedSession) { 
                streak++; 
            } else if (i > 0) { 
                break; 
            } 
        } 
        
        progress.studyStreak = streak; 
        
        // Calculate subject progress 
        const subjectProgress = new Map(); 
        const subjects = [...new Set(schedule.map(s => s.subject))]; 
        
        subjects.forEach(subject => { 
            const subjectSessions = schedule.filter(s => s.subject === subject); 
            const completedSubjectSessions = subjectSessions.filter(s => s.completed); 
            const subjectCompletion = subjectSessions.length > 0  
                ? Math.round((completedSubjectSessions.length / subjectSessions.length) * 100)  
                : 0; 
            subjectProgress.set(subject, subjectCompletion); 
        }); 
        
        progress.subjectProgress = subjectProgress; 
        
        this.updateProgressUI(progress); 
        this.updateProgressChart(); 
        this.updateSubjectProgress(); 
        this.saveState(); 
    } 
    
    updateProgressUI(progress) { 
        if (!progress) return; 
        document.getElementById('completionRate').textContent = `${progress.completionRate}%`; 
        document.getElementById('studyStreak').textContent = progress.studyStreak; 
        document.getElementById('totalHours').textContent = `${progress.totalHours}h`; 
        document.getElementById('daysLeft').textContent = progress.daysLeft; 
    } 
    
    updateScheduleUI(schedule) { 
        const container = document.getElementById('scheduleContainer'); 
        container.innerHTML = schedule.length === 0  
            ? `<div style="text-align: center; color: rgba(255,255,255,0.6); padding: 40px;"><div style="font-size: 3rem; margin-bottom: 20px;">📚</div><p>No schedule generated yet. Configure your plan to begin!</p></div>`  
            : ''; 
        if (schedule.length === 0) return; 
        
        // Apply current filter and sort 
        let filteredSchedule = schedule; 
        
        // Apply filter 
        if (this.currentFilter !== 'all') { 
            filteredSchedule = schedule.filter(session => session.sessionType === this.currentFilter); 
        } 
        
        // Apply sort 
        if (this.currentSort === 'time') { 
            filteredSchedule.sort((a, b) => { 
                if (a.day !== b.day) return a.day - b.day; 
                return a.time.localeCompare(b.time); 
            }); 
        } else if (this.currentSort === 'priority') { 
            const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 }; 
            filteredSchedule.sort((a, b) => { 
                if (priorityOrder[a.priority] !== priorityOrder[b.priority]) { 
                    return priorityOrder[a.priority] - priorityOrder[b.priority]; 
                } 
                return a.day - b.day; 
            }); 
        } else if (this.currentSort === 'subject') { 
            filteredSchedule.sort((a, b) => { 
                if (a.subject !== b.subject) return a.subject.localeCompare(b.subject); 
                return a.day - b.day; 
            }); 
        } 
        
        // Group by day for display 
        const scheduleByDay = this.groupBy(filteredSchedule, 'day'); 
        for (const [day, daySchedule] of Object.entries(scheduleByDay)) { 
            const dayHeader = document.createElement('h3'); 
            dayHeader.style.cssText = "margin: 25px 0 15px 0; color: #667eea; font-size: 1.3rem;"; 
            dayHeader.textContent = `Day ${day}`; 
            container.appendChild(dayHeader); 
            daySchedule.forEach((s, i) => { 
                const el = document.createElement('div'); 
                el.className = `schedule-item ${s.priority}-priority ${s.sessionType}`; 
                el.innerHTML = ` 
                    <div class="schedule-time">${s.time}</div> 
                    <div class="schedule-subject">${s.subject}</div> 
                    <div class="schedule-topic">${s.topic}</div> 
                    <div class="schedule-type ${s.sessionType}">${this.sessionTypes[s.sessionType].label}</div> 
                    ${s.notes ? `<div class="schedule-topic" style="font-style: italic;">${s.notes}</div>` : ''} 
                    <div class="schedule-actions"> 
                        <button class="btn btn-small btn-secondary" onclick="viewSessionDetails(${day}, ${i})">📋 Details</button> 
                        <button class="btn btn-small btn-secondary" onclick="editScheduleItem(${day}, ${i})">✏️ Edit</button> 
                        <button class="btn btn-small btn-success" onclick="markCompleted(${day}, ${i})">${s.completed ? '✅ Done' : '⭕ Mark'}</button> 
                        <button class="btn btn-small btn-purple" onclick="addNoteToSession(${day}, ${i})">📝 Note</button> 
                    </div> 
                `; 
                container.appendChild(el); 
            }); 
        } 
    } 
    
    updateFilesUI() { 
        if (!this.currentUser) return; 
        const grid = document.getElementById('filesGrid'); 
        const files = this.uploadedFiles.get(this.currentUser) || []; 
        
        // Apply current file tab filter 
        let filteredFiles = files; 
        if (this.currentFileTab !== 'all') { 
            if (this.currentFileTab === 'pdf') { 
                filteredFiles = files.filter(file => file.fileType === 'pdf'); 
            } else if (this.currentFileTab === 'documents') { 
                filteredFiles = files.filter(file => file.fileType === 'docx'); 
            } else if (this.currentFileTab === 'images') { 
                filteredFiles = files.filter(file => file.fileType === 'image'); 
            } else if (this.currentFileTab === 'notes') { 
                filteredFiles = files.filter(file => file.fileType === 'txt'); 
            } 
        } 
        
        grid.innerHTML = filteredFiles.length === 0  
            ? `<p style="grid-column: 1 / -1; text-align: center; color: rgba(255,255,255,0.6);">No files found in this category.</p>`  
            : ''; 
        filteredFiles.forEach(file => { 
            const card = document.createElement('div'); 
            card.className = 'file-card'; 
            const type = file.fileType; 
            card.innerHTML = ` 
                <div class="file-icon file-${type}">${{
                    'pdf':'📕',  
                    'docx':'📘',  
                    'image':'🖼️',  
                    'txt':'📄' 
                }[type] || '📄'}</div> 
                <h4>${file.metadata.name}</h4> 
                <div style="font-size:0.85rem;color:rgba(255,255,255,0.7);margin-bottom:15px;"> 
                    <div>Size: ${this.formatFileSize(file.metadata.size)}</div> 
                    <div>Difficulty: ${file.analysis.difficulty}</div> 
                    ${file.analysis.topics.length > 0 ? `<div>Topics: ${file.analysis.topics.join(', ')}</div>` : ''} 
                </div> 
                <div style="display:flex;gap:10px;"> 
                    <button class="btn btn-small btn-secondary" onclick="viewFileAnalysis('${file.metadata.name}')">📈 Analysis</button> 
                    <button class="btn btn-small" onclick="removeFile('${file.metadata.name}')">🗑️ Remove</button> 
                </div> 
            `; 
            grid.appendChild(card); 
        }); 
    } 
    
    updateNotesUI() { 
        if (!this.currentUser) return; 
        const notesList = document.getElementById('notesList'); 
        const notes = this.notes.get(this.currentUser) || []; 
        
        // Apply current notes filter 
        let filteredNotes = notes; 
        const now = new Date(); 
        
        if (this.currentNotesFilter === 'today') { 
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); 
            filteredNotes = notes.filter(note => { 
                const noteDate = new Date(note.date); 
                return noteDate >= today && noteDate < new Date(today.getTime() + 24 * 60 * 60 * 1000); 
            }); 
        } else if (this.currentNotesFilter === 'week') { 
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); 
            filteredNotes = notes.filter(note => new Date(note.date) >= weekAgo); 
        } else if (this.currentNotesFilter === 'month') { 
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); 
            filteredNotes = notes.filter(note => new Date(note.date) >= monthAgo); 
        } 
        
        if (filteredNotes.length === 0) { 
            notesList.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.6);">No notes found for this time period.</p>'; 
            return; 
        } 
        
        notesList.innerHTML = ''; 
        filteredNotes.forEach((note, index) => { 
            const noteItem = document.createElement('div'); 
            noteItem.className = 'note-item'; 
            noteItem.innerHTML = ` 
                <div class="note-date">${new Date(note.date).toLocaleString()}</div> 
                <div class="note-content">${note.content}</div> 
                <div style="margin-top: 10px;"> 
                    <button class="btn btn-small" onclick="deleteNote(${index})">Delete</button> 
                </div> 
            `; 
            notesList.appendChild(noteItem); 
        }); 
    } 
    
    initializeCalendar() { 
        this.updateCalendar(); 
    } 
    
    updateCalendar() { 
        const grid = document.getElementById('calendarGrid'); 
        const monthElement = document.getElementById('calendarMonth'); 
        
        const year = this.currentMonth.getFullYear(); 
        const month = this.currentMonth.getMonth(); 
        
        monthElement.textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); 
        
        // Clear previous calendar 
        grid.innerHTML = ''; 
        
        // Add day headers 
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; 
        dayHeaders.forEach(day => { 
            const header = document.createElement('div'); 
            header.style.textAlign = 'center'; 
            header.style.fontWeight = 'bold'; 
            header.style.padding = '10px 0'; 
            header.textContent = day; 
            grid.appendChild(header); 
        }); 
        
        // Get first day of month and number of days 
        const firstDay = new Date(year, month, 1).getDay(); 
        const daysInMonth = new Date(year, month + 1, 0).getDate(); 
        
        // Add empty cells for days before the first day of the month 
        for (let i = 0; i < firstDay; i++) { 
            const emptyDay = document.createElement('div'); 
            grid.appendChild(emptyDay); 
        } 
        
        // Add days of the month 
        const today = new Date(); 
        const schedule = this.userSchedules.get(this.currentUser) || []; 
        const calendarNotes = this.calendarNotes.get(this.currentUser) || new Map(); 
        
        for (let day = 1; day <= daysInMonth; day++) { 
            const dayElement = document.createElement('div'); 
            dayElement.className = 'calendar-day'; 
            
            // Check if this is today 
            if (year === today.getFullYear() &&  
                month === today.getMonth() &&  
                day === today.getDate()) { 
                dayElement.classList.add('today'); 
            } 
            
            // Check if there are study sessions on this day 
            const sessionsOnDay = schedule.filter(s => s.day === day); 
            if (sessionsOnDay.length > 0) { 
                dayElement.classList.add('has-sessions'); 
                dayElement.innerHTML = ` 
                    <div class="calendar-day-number">${day}</div> 
                    <div class="calendar-day-sessions">${sessionsOnDay.length} session${sessionsOnDay.length > 1 ? 's' : ''}</div> 
                `; 
            } else { 
                // Check if there are notes for this day 
                const dateKey = `${year}-${month + 1}-${day}`; 
                const dayNotes = calendarNotes.get(dateKey); 
                if (dayNotes && (dayNotes.note || (dayNotes.files && dayNotes.files.length > 0))) { 
                    dayElement.classList.add('has-sessions'); 
                    dayElement.innerHTML = ` 
                        <div class="calendar-day-number">${day}</div> 
                        <div class="calendar-day-sessions">📝</div> 
                    `; 
                } else { 
                    dayElement.innerHTML = `<div class="calendar-day-number">${day}</div>`; 
                } 
            } 
            
            // Add click event to open note modal 
            dayElement.addEventListener('click', () => { 
                openCalendarDayModal(year, month, day); 
            }); 
            
            grid.appendChild(dayElement); 
        } 
    } 
    
    initializeProgressChart() { 
        const ctx = document.getElementById('progressChart').getContext('2d'); 
        this.progressChart = new Chart(ctx, { 
            type: 'line', 
            data: { 
                labels: [], 
                datasets: [{ 
                    label: 'Completion Rate', 
                    data: [], 
                    borderColor: '#667eea', 
                    backgroundColor: 'rgba(102, 126, 234, 0.1)', 
                    tension: 0.4, 
                    fill: true 
                }] 
            }, 
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { 
                    legend: { 
                        labels: { 
                            color: 'rgba(255, 255, 255, 0.8)' 
                        } 
                    } 
                }, 
                scales: { 
                    y: { 
                        beginAtZero: true, 
                        max: 100, 
                        ticks: { 
                            color: 'rgba(255, 255, 255, 0.6)', 
                            callback: function(value) { 
                                return value + '%'; 
                            } 
                        }, 
                        grid: { 
                            color: 'rgba(255, 255, 255, 0.1)' 
                        } 
                    }, 
                    x: { 
                        ticks: { 
                            color: 'rgba(255, 255, 255, 0.6)' 
                        }, 
                        grid: { 
                            color: 'rgba(255, 255, 255, 0.1)' 
                        } 
                    } 
                } 
            } 
        }); 
        
        this.updateProgressChart(); 
    } 
    
    updateProgressChart() { 
        if (!this.progressChart || !this.currentUser) return; 
        
        const schedule = this.userSchedules.get(this.currentUser) || []; 
        if (schedule.length === 0) return; 
        
        // Group by day and calculate completion rate for each day 
        const scheduleByDay = this.groupBy(schedule, 'day'); 
        const labels = []; 
        const data = []; 
        
        for (const [day, daySchedule] of Object.entries(scheduleByDay)) { 
            labels.push(`Day ${day}`); 
            const completed = daySchedule.filter(s => s.completed).length; 
            const total = daySchedule.length; 
            data.push(Math.round((completed / total) * 100)); 
        } 
        
        this.progressChart.data.labels = labels; 
        this.progressChart.data.datasets[0].data = data; 
        this.progressChart.update(); 
    } 
    
    updateSubjectProgress() { 
        if (!this.currentUser) return; 
        
        const progress = this.userProgress.get(this.currentUser); 
        const subjectProgress = progress.subjectProgress || new Map(); 
        
        const container = document.getElementById('subjectProgressContainer'); 
        
        if (subjectProgress.size === 0) { 
            container.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.6);">Generate a schedule to see subject progress</p>'; 
            return; 
        } 
        
        container.innerHTML = ''; 
        
        subjectProgress.forEach((percentage, subject) => { 
            const item = document.createElement('div'); 
            item.className = 'subject-progress-item'; 
            item.innerHTML = ` 
                <div class="subject-progress-header"> 
                    <div class="subject-progress-name">${subject}</div> 
                    <div class="subject-progress-percentage">${percentage}%</div> 
                </div> 
                <div class="subject-progress-bar"> 
                    <div class="subject-progress-fill" style="width: ${percentage}%"></div> 
                </div> 
            `; 
            container.appendChild(item); 
        }); 
    } 
    
    initializeTimer() { 
        const timerDisplay = document.getElementById('timerDisplay'); 
        const startBtn = document.getElementById('startTimer'); 
        const pauseBtn = document.getElementById('pauseTimer'); 
        const resetBtn = document.getElementById('resetTimer'); 
        const minutesInput = document.getElementById('timerMinutes'); 
        
        const updateDisplay = () => { 
            const minutes = String(this.timer.minutes).padStart(2, '0'); 
            const seconds = String(this.timer.seconds).padStart(2, '0'); 
            timerDisplay.textContent = `${minutes}:${seconds}`; 
        }; 
        
        startBtn.addEventListener('click', () => { 
            if (!this.timer.isRunning) { 
                this.timer.isRunning = true; 
                this.timer.interval = setInterval(() => { 
                    if (this.timer.seconds === 0) { 
                        if (this.timer.minutes === 0) { 
                            clearInterval(this.timer.interval); 
                            this.timer.isRunning = false; 
                            showToast('Timer completed! Take a break.', 'success'); 
                            // Play notification sound if enabled 
                            if (this.settings.notifications) { 
                                this.playNotificationSound(); 
                            } 
                            return; 
                        } 
                        this.timer.minutes--; 
                        this.timer.seconds = 59; 
                    } else { 
                        this.timer.seconds--; 
                    } 
                    updateDisplay(); 
                }, 1000); 
            } 
        }); 
        
        pauseBtn.addEventListener('click', () => { 
            if (this.timer.isRunning) { 
                clearInterval(this.timer.interval); 
                this.timer.isRunning = false; 
            } 
        }); 
        
        resetBtn.addEventListener('click', () => { 
            clearInterval(this.timer.interval); 
            this.timer.isRunning = false; 
            this.timer.minutes = parseInt(minutesInput.value) || 25; 
            this.timer.seconds = 0; 
            updateDisplay(); 
        }); 
        
        minutesInput.addEventListener('change', () => { 
            if (!this.timer.isRunning) { 
                this.timer.minutes = parseInt(minutesInput.value) || 25; 
                this.timer.seconds = 0; 
                updateDisplay(); 
            } 
        }); 
        
        // Timer preset buttons 
        document.querySelectorAll('.timer-preset').forEach(btn => { 
            btn.addEventListener('click', () => { 
                if (!this.timer.isRunning) { 
                    this.timer.minutes = parseInt(btn.dataset.minutes); 
                    this.timer.seconds = 0; 
                    minutesInput.value = btn.dataset.minutes; 
                    updateDisplay(); 
                } 
            }); 
        }); 
        
        updateDisplay(); 
    } 
    
    playNotificationSound() { 
        // Create a simple beep sound using Web Audio API 
        const audioContext = new (window.AudioContext || window.webkitAudioContext)(); 
        const oscillator = audioContext.createOscillator(); 
        const gainNode = audioContext.createGain(); 
        
        oscillator.connect(gainNode); 
        gainNode.connect(audioContext.destination); 
        
        oscillator.type = 'sine'; 
        oscillator.frequency.value = 880; // A5 note 
        gainNode.gain.value = 0.3; 
        
        oscillator.start(); 
        setTimeout(() => { 
            oscillator.stop(); 
        }, 300); 
    } 
    
    initializeSettings() { 
        const darkModeToggle = document.getElementById('darkModeToggle'); 
        const notificationsToggle = document.getElementById('notificationsToggle'); 
        const focusModeToggle = document.getElementById('focusModeToggle'); 
        const autoSaveToggle = document.getElementById('autoSaveToggle'); 
        const smartSchedulingToggle = document.getElementById('smartSchedulingToggle'); 
        const adaptiveLearningToggle = document.getElementById('adaptiveLearningToggle'); 
        
        // Set initial states 
        darkModeToggle.classList.toggle('active', this.settings.darkMode); 
        notificationsToggle.classList.toggle('active', this.settings.notifications); 
        focusModeToggle.classList.toggle('active', this.settings.focusMode); 
        autoSaveToggle.classList.toggle('active', this.settings.autoSave); 
        smartSchedulingToggle.classList.toggle('active', this.settings.smartScheduling); 
        adaptiveLearningToggle.classList.toggle('active', this.settings.adaptiveLearning); 
        
        // Add event listeners 
        darkModeToggle.addEventListener('click', () => { 
            this.settings.darkMode = !this.settings.darkMode; 
            darkModeToggle.classList.toggle('active'); 
            this.applyTheme(); 
            this.saveState(); 
        }); 
        
        notificationsToggle.addEventListener('click', () => { 
            this.settings.notifications = !this.settings.notifications; 
            notificationsToggle.classList.toggle('active'); 
            this.saveState(); 
            
            if (this.settings.notifications) { 
                this.requestNotificationPermission(); 
            } 
        }); 
        
        focusModeToggle.addEventListener('click', () => { 
            this.settings.focusMode = !this.settings.focusMode; 
            focusModeToggle.classList.toggle('active'); 
            this.applyFocusMode(); 
            this.saveState(); 
        }); 
        
        autoSaveToggle.addEventListener('click', () => { 
            this.settings.autoSave = !this.settings.autoSave; 
            autoSaveToggle.classList.toggle('active'); 
            this.saveState(); 
        }); 
        
        smartSchedulingToggle.addEventListener('click', () => { 
            this.settings.smartScheduling = !this.settings.smartScheduling; 
            smartSchedulingToggle.classList.toggle('active'); 
            this.saveState(); 
            
            if (this.settings.smartScheduling) { 
                showToast('Smart scheduling enabled! Your schedule will adapt based on your progress.', 'success'); 
            } else { 
                showToast('Smart scheduling disabled.', 'info'); 
            } 
        }); 
        
        adaptiveLearningToggle.addEventListener('click', () => { 
            this.settings.adaptiveLearning = !this.settings.adaptiveLearning; 
            adaptiveLearningToggle.classList.toggle('active'); 
            this.saveState(); 
            
            if (this.settings.adaptiveLearning) { 
                showToast('Adaptive learning enabled! Content difficulty will adjust based on your performance.', 'success'); 
            } else { 
                showToast('Adaptive learning disabled.', 'info'); 
            } 
        }); 
    } 
    
    initializeEventListeners() { 
        // Schedule filter buttons 
        document.querySelectorAll('.filter-btn').forEach(btn => { 
            btn.addEventListener('click', () => { 
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active')); 
                btn.classList.add('active'); 
                this.currentFilter = btn.dataset.filter; 
                this.updateScheduleUI(this.userSchedules.get(this.currentUser) || []); 
            }); 
        }); 
        
        // Schedule sort dropdown 
        document.getElementById('sortSchedule').addEventListener('change', (e) => { 
            this.currentSort = e.target.value; 
            this.updateScheduleUI(this.userSchedules.get(this.currentUser) || []); 
        }); 
        
        // File tabs 
        document.querySelectorAll('.file-tab').forEach(tab => { 
            tab.addEventListener('click', () => { 
                document.querySelectorAll('.file-tab').forEach(t => t.classList.remove('active')); 
                tab.classList.add('active'); 
                this.currentFileTab = tab.dataset.tab; 
                this.updateFilesUI(); 
            }); 
        }); 
        
        // Notes filters 
        document.querySelectorAll('.notes-filter').forEach(filter => { 
            filter.addEventListener('click', () => { 
                document.querySelectorAll('.notes-filter').forEach(f => f.classList.remove('active')); 
                filter.classList.add('active'); 
                this.currentNotesFilter = filter.dataset.filter; 
                this.updateNotesUI(); 
            }); 
        }); 
        
        // Learning style selection 
        document.querySelectorAll('.learning-style').forEach(style => { 
            style.addEventListener('click', () => { 
                document.querySelectorAll('.learning-style').forEach(s => s.classList.remove('active')); 
                style.classList.add('active'); 
                document.getElementById('learningStyle').value = style.dataset.style; 
            }); 
        }); 
        
        // Knowledge categories 
        document.querySelectorAll('.category-card').forEach(card => { 
            card.addEventListener('click', () => { 
                const category = card.dataset.category; 
                this.showKnowledgeCategory(category); 
            }); 
        }); 
    } 
    
    showKnowledgeCategory(category) { 
        const container = document.getElementById('ragResults'); 
        const items = this.knowledgeBase.get(category) || []; 
        
        if (items.length === 0) { 
            container.innerHTML = `<div class="knowledge-item">No information available for this category.</div>`; 
            return; 
        } 
        
        container.innerHTML = items.map(item =>  
            `<div class="knowledge-item"><strong>${item.t}:</strong><p>${item.c}</p></div>` 
        ).join(''); 
        
        // Scroll to results 
        container.scrollIntoView({ behavior: 'smooth' }); 
    } 
    
    applyTheme() { 
        if (this.settings.darkMode) { 
            document.body.style.background = 'var(--dark-gradient)'; 
            document.body.style.color = '#fff'; 
        } else { 
            document.body.style.background = '#f3f4f6'; 
            document.body.style.color = '#1f2937'; 
        } 
    } 
    
    applyFocusMode() { 
        if (this.settings.focusMode) { 
            document.getElementById('main-content').style.filter = 'blur(5px)'; 
            document.getElementById('main-content').style.pointerEvents = 'none'; 
            
            // Create focus mode overlay 
            const overlay = document.createElement('div'); 
            overlay.id = 'focusModeOverlay'; 
            overlay.style.position = 'fixed'; 
            overlay.style.top = '0'; 
            overlay.style.left = '0'; 
            overlay.style.width = '100%'; 
            overlay.style.height = '100%'; 
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; 
            overlay.style.zIndex = '9999'; 
            overlay.style.display = 'flex'; 
            overlay.style.flexDirection = 'column'; 
            overlay.style.justifyContent = 'center'; 
            overlay.style.alignItems = 'center'; 
            overlay.style.color = 'white'; 
            overlay.style.textAlign = 'center'; 
            overlay.style.padding = '20px'; 
            
            overlay.innerHTML = ` 
                <h1 style="font-size: 2.5rem; margin-bottom: 20px;">Focus Mode</h1> 
                <p style="font-size: 1.2rem; max-width: 600px; margin-bottom: 30px;"> 
                    All distractions are now hidden. Focus on your study session. 
                </p> 
                <button class="btn" onclick="studySystem.exitFocusMode()">Exit Focus Mode</button> 
            `; 
            
            document.body.appendChild(overlay); 
        } else { 
            this.exitFocusMode(); 
        } 
    } 
    
    exitFocusMode() { 
        document.getElementById('main-content').style.filter = ''; 
        document.getElementById('main-content').style.pointerEvents = ''; 
        
        const overlay = document.getElementById('focusModeOverlay'); 
        if (overlay) { 
            overlay.remove(); 
        } 
    } 
    
    requestNotificationPermission() { 
        if ('Notification' in window) { 
            Notification.requestPermission().then(permission => { 
                if (permission === 'granted') { 
                    showToast('Notifications enabled!', 'success'); 
                } else { 
                    showToast('Notifications permission denied.', 'warning'); 
                    this.settings.notifications = false; 
                    document.getElementById('notificationsToggle').classList.remove('active'); 
                    this.saveState(); 
                } 
            }); 
        } else { 
            showToast('Notifications not supported in this browser.', 'warning'); 
            this.settings.notifications = false; 
            document.getElementById('notificationsToggle').classList.remove('active'); 
            this.saveState(); 
        } 
    } 
    
    calculateDaysUntilExam(date) {  
        return Math.max(0, Math.ceil((new Date(date) - new Date()) / (1000*3600*24)));  
    } 
    
    groupBy(arr, key) {  
        return arr.reduce((acc, i) => ({...acc, [i[key]]: [...(acc[i[key]]||[]), i]}), {});  
    } 
    
    formatFileSize(b) {  
        if(b===0)return'0 B';const k=1024,s=['B','KB','MB','GB'],i=Math.floor(Math.log(b)/Math.log(k));return`${parseFloat((b/Math.pow(k,i)).toFixed(2))} ${s[i]}`;  
    } 
    
    async handleFiles(files, subject = null) { 
        if (!this.currentUser) return showToast('Please select a user first', 'warning'); 
        for (const file of files) { 
            showToast(`Processing ${file.name}...`, 'info'); 
            const result = await this.agents.file.processFile(file); 
            if (result.success) { 
                if (subject) { 
                    // Add to subject-specific files 
                    const subjectFilesMap = this.subjectFiles.get(this.currentUser) || new Map(); 
                    if (!subjectFilesMap.has(subject)) { 
                        subjectFilesMap.set(subject, []); 
                    } 
                    subjectFilesMap.get(subject).push(result); 
                    this.subjectFiles.set(this.currentUser, subjectFilesMap); 
                } else { 
                    // Add to general files 
                    this.uploadedFiles.get(this.currentUser).push(result); 
                } 
                showToast(`${file.name} processed successfully`, 'success'); 
            } else showToast(`Failed to process ${file.name}: ${result.error}`, 'error'); 
        } 
        this.updateFilesUI();  
        this.saveState(); 
        
        // Update subject materials if in subject modal 
        if (subject) { 
            this.updateSubjectMaterialsList(subject); 
        } 
    } 
    
    initializeKnowledgeBase() { 
        this.knowledgeBase.set('study-techniques', [ 
            {t:'Pomodoro Technique',c:'Work for 25 minutes, then take a 5-minute break. After four cycles, take a longer 15-30 minute break.'}, 
            {t:'Active Recall',c:'Test yourself on the material instead of passively reviewing it. Use flashcards or practice questions.'}, 
            {t:'Spaced Repetition',c:'Review information at increasing intervals to combat the forgetting curve. Use apps like Anki or Quizlet.'}, 
            {t:'Feynman Technique',c:'Explain concepts in simple terms as if teaching someone else. This reveals gaps in your understanding.'}, 
            {t:'Mind Mapping',c:'Create visual diagrams to connect ideas and concepts. Great for visual learners and complex subjects.'} 
        ]); 
        
        this.knowledgeBase.set('memory-improvement', [ 
            {t:'Chunking',c:'Break down large amounts of information into smaller, manageable chunks.'}, 
            {t:'Mnemonics',c:'Use acronyms, acrostics, or vivid imagery to remember information.'}, 
            {t:'Association',c:'Connect new information to something you already know.'}, 
            {t:'Visualization',c:'Create mental images to represent information you want to remember.'}, 
            {t:'Sleep',c:'Get adequate sleep as it\'s crucial for memory consolidation. Aim for 7-9 hours per night.'} 
        ]); 
        
        this.knowledgeBase.set('motivation', [ 
            {t:'SMART Goals',c:'Set Specific, Measurable, Achievable, Relevant, and Time-bound goals.'}, 
            {t:'Reward System',c:'Reward yourself after completing study sessions or reaching milestones.'}, 
            {t:'Study Environment',c:'Create a dedicated study space that is comfortable and free from distractions.'}, 
            {t:'Accountability Partner',c:'Find a study partner or join a study group to stay motivated and accountable.'}, 
            {t:'Visual Progress',c:'Track your progress visually to see how far you\'ve come and stay motivated.'} 
        ]); 
        
        this.knowledgeBase.set('exam-preparation', [ 
            {t:'Past Papers',c:'Practice with past exam papers to familiarize yourself with the format and types of questions.'}, 
            {t:'Time Management',c:'Allocate specific time for each question during the exam based on its marks.'}, 
            {t:'Exam Conditions',c:'Simulate exam conditions when doing practice tests to build stamina and reduce anxiety.'}, 
            {t:'Review Mistakes',c:'Analyze your mistakes in practice tests to identify patterns and areas for improvement.'}, 
            {t:'Healthy Routine',c:'Maintain a healthy routine with proper nutrition, exercise, and sleep before the exam.'} 
        ]); 
        
        this.knowledgeBase.set('operating-systems', [ 
            {t:'Process Management',c:'Processes are the active instances of programs. The OS manages process creation, scheduling, and termination.'}, 
            {t:'Memory Management',c:'The OS allocates and deallocates memory for processes, ensuring efficient use of RAM.'}, 
            {t:'File Systems',c:'File systems organize and store data on storage devices, providing a hierarchical structure.'}, 
            {t:'I/O Systems',c:'Input/Output systems manage communication between the computer and external devices.'}, 
            {t:'Scheduling Algorithms',c:'Different algorithms like FCFS, SJF, and Round Robin determine the order of process execution.'} 
        ]); 
    } 
    
    queryKnowledgeBase(query) { 
        const results = []; 
        const q = query.toLowerCase(); 
        
        this.knowledgeBase.forEach(items => { 
            items.forEach(item => { 
                if (item.t.toLowerCase().includes(q) ||  
                    item.c.toLowerCase().includes(q) || 
                    q.split(' ').some(word => item.t.toLowerCase().includes(word) || item.c.toLowerCase().includes(word))) { 
                    results.push(item); 
                } 
            }); 
        }); 
        
        return results; 
    } 
    
    startSystemMonitoring() { 
        this.agents.monitor.isActive = true; 
        setInterval(() => { 
            const actions = [ 
                'Updated learning analytics',  
                'Optimized recommendations',  
                'Detected productivity patterns', 
                'Analyzed study session data', 
                'Generated progress insights' 
            ]; 
            this.agents.monitor.updateStatus('Active monitoring', actions[Math.floor(Math.random() * actions.length)]); 
        }, 12000); 
    } 
    
    addNote(content) { 
        if (!this.currentUser || !content.trim()) return; 
        
        const notes = this.notes.get(this.currentUser) || []; 
        notes.push({ 
            content: content.trim(), 
            date: new Date().toISOString() 
        }); 
        
        this.notes.set(this.currentUser, notes); 
        this.updateNotesUI(); 
        this.saveState(); 
        showToast('Note added successfully!', 'success'); 
    } 
    
    deleteNote(index) { 
        if (!this.currentUser) return; 
        
        const notes = this.notes.get(this.currentUser) || []; 
        if (index >= 0 && index < notes.length) { 
            notes.splice(index, 1); 
            this.notes.set(this.currentUser, notes); 
            this.updateNotesUI(); 
            this.saveState(); 
            showToast('Note deleted', 'info'); 
        } 
    } 
    
    addNoteToSession(day, index) { 
        if (!this.currentUser) return; 
        
        const schedule = this.userSchedules.get(this.currentUser) || []; 
        const session = schedule.find(s => s.day === day && schedule.indexOf(s) === index); 
        
        if (session) { 
            const note = prompt('Add a note for this session:', session.notes || ''); 
            if (note !== null) { 
                session.notes = note; 
                this.updateScheduleUI(schedule); 
                this.saveState(); 
                showToast('Note added to session', 'success'); 
            } 
        } 
    } 
    
    // Calendar day notes functionality 
    openCalendarDayModal(year, month, day) { 
        if (!this.currentUser) return; 
        
        const dateKey = `${year}-${month + 1}-${day}`; 
        const calendarNotes = this.calendarNotes.get(this.currentUser) || new Map(); 
        const dayNote = calendarNotes.get(dateKey) || { note: '', files: [] }; 
        
        document.getElementById('calendarDayDate').textContent = `${year}-${month + 1}-${day}`; 
        document.getElementById('calendarDayNote').value = dayNote.note || ''; 
        
        // Display files for this day 
        const fileList = document.getElementById('calendarDayFileList'); 
        fileList.innerHTML = ''; 
        if (dayNote.files && dayNote.files.length > 0) { 
            dayNote.files.forEach((file, index) => { 
                const fileItem = document.createElement('div'); 
                fileItem.className = 'subject-material-item'; 
                fileItem.innerHTML = ` 
                    <div> 
                        <div class="subject-material-name">${file.name}</div> 
                        <div class="subject-material-type">PDF • ${this.formatFileSize(file.size)}</div> 
                    </div> 
                    <button class="btn btn-small" onclick="removeCalendarDayFile('${dateKey}', ${index})">Remove</button> 
                `; 
                fileList.appendChild(fileItem); 
            }); 
        } 
        
        // Store current date key for saving 
        document.getElementById('calendarDayModal').dataset.dateKey = dateKey; 
        
        openModal('calendarDayModal'); 
    } 
    
    saveCalendarDayNote() { 
        if (!this.currentUser) return; 
        
        const dateKey = document.getElementById('calendarDayModal').dataset.dateKey; 
        const note = document.getElementById('calendarDayNote').value.trim(); 
        
        const calendarNotes = this.calendarNotes.get(this.currentUser) || new Map(); 
        const dayNote = calendarNotes.get(dateKey) || { note: '', files: [] }; 
        
        dayNote.note = note; 
        calendarNotes.set(dateKey, dayNote); 
        this.calendarNotes.set(this.currentUser, calendarNotes); 
        
        this.updateCalendar(); 
        this.saveState(); 
        closeModal('calendarDayModal'); 
        showToast('Note saved for this day!', 'success'); 
    } 
    
    async handleCalendarDayFile(file) { 
        if (!this.currentUser) return; 
        
        const dateKey = document.getElementById('calendarDayModal').dataset.dateKey; 
        
        // Process the file 
        showToast(`Processing ${file.name}...`, 'info'); 
        const result = await this.agents.file.processFile(file); 
        
        if (result.success) { 
            const calendarNotes = this.calendarNotes.get(this.currentUser) || new Map(); 
            const dayNote = calendarNotes.get(dateKey) || { note: '', files: [] }; 
            
            dayNote.files.push({ 
                name: file.name, 
                size: file.size, 
                type: file.type, 
                content: result.content 
            }); 
            
            calendarNotes.set(dateKey, dayNote); 
            this.calendarNotes.set(this.currentUser, calendarNotes); 
            
            // Update file list in modal 
            const fileList = document.getElementById('calendarDayFileList'); 
            const fileItem = document.createElement('div'); 
            fileItem.className = 'subject-material-item'; 
            fileItem.innerHTML = ` 
                <div> 
                    <div class="subject-material-name">${file.name}</div> 
                    <div class="subject-material-type">PDF • ${this.formatFileSize(file.size)}</div> 
                </div> 
                <button class="btn btn-small" onclick="removeCalendarDayFile('${dateKey}', ${dayNote.files.length - 1})">Remove</button> 
            `; 
            fileList.appendChild(fileItem); 
            
            this.updateCalendar(); 
            this.saveState(); 
            showToast(`${file.name} uploaded successfully!`, 'success'); 
        } else { 
            showToast(`Failed to process ${file.name}: ${result.error}`, 'error'); 
        } 
    } 
    
    removeCalendarDayFile(dateKey, fileIndex) { 
        if (!this.currentUser) return; 
        
        const calendarNotes = this.calendarNotes.get(this.currentUser) || new Map(); 
        const dayNote = calendarNotes.get(dateKey); 
        
        if (dayNote && dayNote.files && fileIndex >= 0 && fileIndex < dayNote.files.length) { 
            dayNote.files.splice(fileIndex, 1); 
            calendarNotes.set(dateKey, dayNote); 
            this.calendarNotes.set(this.currentUser, calendarNotes); 
            
            // Update file list in modal 
            const fileList = document.getElementById('calendarDayFileList'); 
            fileList.innerHTML = ''; 
            if (dayNote.files.length > 0) { 
                dayNote.files.forEach((file, index) => { 
                    const fileItem = document.createElement('div'); 
                    fileItem.className = 'subject-material-item'; 
                    fileItem.innerHTML = ` 
                        <div> 
                            <div class="subject-material-name">${file.name}</div> 
                            <div class="subject-material-type">PDF • ${this.formatFileSize(file.size)}</div> 
                        </div> 
                        <button class="btn btn-small" onclick="removeCalendarDayFile('${dateKey}', ${index})">Remove</button> 
                    `; 
                    fileList.appendChild(fileItem); 
                }); 
            } 
            
            this.updateCalendar(); 
            this.saveState(); 
            showToast('File removed', 'info'); 
        } 
    } 
    
    exportToPDF() { 
        if (!this.currentUser) return; 
        
        const schedule = this.userSchedules.get(this.currentUser) || []; 
        if (schedule.length === 0) { 
            showToast('No schedule data to export', 'warning'); 
            return; 
        } 
        
        const { jsPDF } = window.jspdf; 
        const doc = new jsPDF(); 
        
        // Add title 
        doc.setFontSize(18); 
        doc.text('Study Schedule', 105, 15, { align: 'center' }); 
        
        // Add user info 
        doc.setFontSize(12); 
        const user = this.users.get(this.currentUser); 
        const progress = this.userProgress.get(this.currentUser); 
        doc.text(`User: ${user.name}`, 20, 30); 
        doc.text(`Exam Date: ${progress.formHistory.examDate}`, 20, 40); 
        
        // Prepare table data 
        const tableData = schedule.map(session => [ 
            session.day, 
            session.time, 
            session.subject, 
            session.topic, 
            session.sessionType, 
            session.priority, 
            session.completed ? 'Completed' : 'Pending' 
        ]); 
        
        doc.autoTable({ 
            head: [['Day', 'Time', 'Subject', 'Topic', 'Type', 'Priority', 'Status']], 
            body: tableData, 
            startY: 50, 
            styles: { fontSize: 10 }, 
            headStyles: { fillColor: [102, 126, 234] } 
        }); 
        
        doc.save(`study-schedule-${user.name}.pdf`); 
        showToast('PDF export completed!', 'success'); 
    } 
    
    exportToCSV() { 
        if (!this.currentUser) return; 
        
        const schedule = this.userSchedules.get(this.currentUser) || []; 
        if (schedule.length === 0) { 
            showToast('No schedule data to export', 'warning'); 
            return; 
        } 
        
        // Create CSV content 
        let csv = 'Day,Time,Subject,Topic,Session Type,Priority,Completed,Notes\n'; 
        
        schedule.forEach(session => { 
            csv += `${session.day},${session.time},"${session.subject}","${session.topic}","${session.sessionType}",${session.priority},${session.completed ? 'Yes' : 'No'},"${session.notes}"\n`; 
        }); 
        
        // Create download link 
        const blob = new Blob([csv], { type: 'text/csv' }); 
        const url = URL.createObjectURL(blob); 
        const a = document.createElement('a'); 
        a.href = url; 
        a.download = `study-schedule-${this.users.get(this.currentUser).name}.csv`; 
        document.body.appendChild(a); 
        a.click(); 
        document.body.removeChild(a); 
        URL.revokeObjectURL(url); 
        
        showToast('CSV export completed!', 'success'); 
    } 
    
    exportToJSON() { 
        if (!this.currentUser) return; 
        
        const userData = { 
            user: this.users.get(this.currentUser), 
            schedule: this.userSchedules.get(this.currentUser) || [], 
            progress: this.userProgress.get(this.currentUser), 
            files: this.uploadedFiles.get(this.currentUser) || [], 
            subjectFiles: [...(this.subjectFiles.get(this.currentUser) || new Map()).entries()], 
            notes: this.notes.get(this.currentUser) || [], 
            calendarNotes: [...(this.calendarNotes.get(this.currentUser) || new Map()).entries()] 
        }; 
        
        const json = JSON.stringify(userData, null, 2); 
        const blob = new Blob([json], { type: 'application/json' }); 
        const url = URL.createObjectURL(blob); 
        const a = document.createElement('a'); 
        a.href = url; 
        a.download = `study-data-${this.users.get(this.currentUser).name}.json`; 
        document.body.appendChild(a); 
        a.click(); 
        document.body.removeChild(a); 
        URL.revokeObjectURL(url); 
        
        showToast('Data export completed!', 'success'); 
    } 
    
    exportToCalendar() { 
        if (!this.currentUser) return; 
        
        const schedule = this.userSchedules.get(this.currentUser) || []; 
        if (schedule.length === 0) { 
            showToast('No schedule data to export', 'warning'); 
            return; 
        } 
        
        // Create iCalendar content 
        let ical = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//AI Study Nexus//Study Schedule//EN\n'; 
        
        // Get current date as reference 
        const currentDate = new Date(); 
        const examDate = new Date(this.userProgress.get(this.currentUser).formHistory.examDate); 
        
        schedule.forEach(session => { 
            // Calculate session date 
            const sessionDate = new Date(currentDate); 
            sessionDate.setDate(currentDate.getDate() + (session.day - 1)); 
            
            // Parse time 
            const [hours, minutes] = session.time.split(':').map(Number); 
            sessionDate.setHours(hours, minutes, 0, 0); 
            
            // End time (1 hour later) 
            const endDate = new Date(sessionDate); 
            endDate.setHours(endDate.getHours() + 1); 
            
            // Format dates for iCalendar 
            const formatDate = (date) => { 
                return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'; 
            }; 
            
            ical += `BEGIN:VEVENT\n`; 
            ical += `UID:${session.day}-${session.time.replace(':', '')}@study-nexus\n`; 
            ical += `DTSTAMP:${formatDate(new Date())}\n`; 
            ical += `DTSTART:${formatDate(sessionDate)}\n`; 
            ical += `DTEND:${formatDate(endDate)}\n`; 
            ical += `SUMMARY:${session.subject} - ${session.topic}\n`; 
            ical += `DESCRIPTION:${session.notes || 'Study session'}\n`; 
            ical += `CATEGORIES:${session.sessionType}\n`; 
            ical += `END:VEVENT\n`; 
        }); 
        
        ical += 'END:VCALENDAR\n'; 
        
        // Create download link 
        const blob = new Blob([ical], { type: 'text/calendar' }); 
        const url = URL.createObjectURL(blob); 
        const a = document.createElement('a'); 
        a.href = url; 
        a.download = `study-calendar-${this.users.get(this.currentUser).name}.ics`; 
        document.body.appendChild(a); 
        a.click(); 
        document.body.removeChild(a); 
        URL.revokeObjectURL(url); 
        
        showToast('Calendar export completed!', 'success'); 
    } 
    
    // Subject-specific file management 
    openSubjectMaterialModal(subject) { 
        this.currentSubject = subject; 
        document.getElementById('subjectMaterialName').textContent = subject; 
        document.getElementById('subjectUploadedFiles').innerHTML = ''; 
        this.updateSubjectMaterialsList(subject); 
        openModal('subjectMaterialModal'); 
    } 
    
    updateSubjectMaterialsList(subject) { 
        const list = document.getElementById('subjectMaterialsList'); 
        const subjectFilesMap = this.subjectFiles.get(this.currentUser) || new Map(); 
        const files = subjectFilesMap.get(subject) || []; 
        
        list.innerHTML = ''; 
        
        if (files.length === 0) { 
            list.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.6);">No materials uploaded for this subject yet.</p>'; 
            return; 
        } 
        
        files.forEach(file => { 
            const item = document.createElement('div'); 
            item.className = 'subject-material-item'; 
            item.innerHTML = ` 
                <div> 
                    <div class="subject-material-name">${file.metadata.name}</div> 
                    <div class="subject-material-type">${file.fileType.toUpperCase()} • ${this.formatFileSize(file.metadata.size)}</div> 
                </div> 
                <button class="btn btn-small" onclick="removeSubjectFile('${subject}', '${file.metadata.name}')">Remove</button> 
            `; 
            list.appendChild(item); 
        }); 
    } 
    
    removeSubjectFile(subject, fileName) { 
        const subjectFilesMap = this.subjectFiles.get(this.currentUser) || new Map(); 
        const files = subjectFilesMap.get(subject) || []; 
        const index = files.findIndex(f => f.metadata.name === fileName); 
        
        if (index > -1) { 
            files.splice(index, 1); 
            subjectFilesMap.set(subject, files); 
            this.subjectFiles.set(this.currentUser, subjectFilesMap); 
            this.updateSubjectMaterialsList(subject); 
            this.saveState(); 
            showToast(`Removed ${fileName} from ${subject}`, 'info'); 
        } 
    } 
    
    // Session details modal 
    viewSessionDetails(day, index) { 
        if (!this.currentUser) return; 
        
        const schedule = this.userSchedules.get(this.currentUser) || []; 
        const session = schedule.find(s => s.day === day && schedule.indexOf(s) === index); 
        
        if (!session) return; 
        
        const content = document.getElementById('sessionDetailsContent'); 
        content.innerHTML = ` 
            <div class="session-detail"> 
                <h3>${session.subject} - ${session.topic}</h3> 
                <div class="session-meta"> 
                    <div><strong>Day:</strong> ${session.day}</div> 
                    <div><strong>Time:</strong> ${session.time}</div> 
                    <div><strong>Type:</strong> <span class="session-type ${session.sessionType}">${this.sessionTypes[session.sessionType].label}</span></div> 
                    <div><strong>Priority:</strong> ${session.priority.charAt(0).toUpperCase() + session.priority.slice(1)}</div> 
                    <div><strong>Status:</strong> ${session.completed ? 'Completed' : 'Pending'}</div> 
                </div> 
                ${session.notes ? `<div class="session-notes"><strong>Notes:</strong> ${session.notes}</div>` : ''} 
            </div> 
        `; 
        
        // Show resources if available 
        const resourcesContainer = document.getElementById('sessionResourcesList'); 
        if (session.resources && session.resources.length > 0) { 
            resourcesContainer.innerHTML = ''; 
            session.resources.forEach(resource => { 
                const resourceItem = document.createElement('div'); 
                resourceItem.className = 'session-resource-item'; 
                resourceItem.innerHTML = ` 
                    <div class="session-resource-icon"> 
                        <i class="fas ${this.getResourceIcon(resource.type)}"></i> 
                    </div> 
                    <div> 
                        <div class="resource-title">${resource.title}</div> 
                        <div class="resource-type">${resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}</div> 
                    </div> 
                `; 
                resourcesContainer.appendChild(resourceItem); 
            }); 
        } else { 
            resourcesContainer.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.6);">No resources available for this session.</p>'; 
        } 
        
        openModal('sessionDetailsModal'); 
    } 
    
    getResourceIcon(type) { 
        const icons = { 
            video: 'fa-play-circle', 
            article: 'fa-file-alt', 
            practice: 'fa-pencil-alt', 
            simulation: 'fa-flask', 
            interactive: 'fa-mouse-pointer', 
            book: 'fa-book' 
        }; 
        return icons[type] || 'fa-link'; 
    } 
    
    // Study statistics modal 
    showStudyStatistics() { 
        if (!this.currentUser) return; 
        
        const schedule = this.userSchedules.get(this.currentUser) || []; 
        if (schedule.length === 0) { 
            showToast('No schedule data to show statistics', 'warning'); 
            return; 
        } 
        
        openModal('statsModal'); 
        
        // Calculate statistics 
        const totalSessions = schedule.length; 
        const completedSessions = schedule.filter(s => s.completed).length; 
        const completionRate = Math.round((completedSessions / totalSessions) * 100); 
        
        // Session type distribution 
        const sessionTypes = { 
            learning: schedule.filter(s => s.sessionType === 'learning').length, 
            practice: schedule.filter(s => s.sessionType === 'practice').length, 
            review: schedule.filter(s => s.sessionType === 'review').length 
        }; 
        
        // Subject distribution 
        const subjects = {}; 
        schedule.forEach(session => { 
            if (!subjects[session.subject]) { 
                subjects[session.subject] = { total: 0, completed: 0 }; 
            } 
            subjects[session.subject].total++; 
            if (session.completed) { 
                subjects[session.subject].completed++; 
            } 
        }); 
        
        // Create chart 
        const ctx = document.getElementById('statsChart').getContext('2d'); 
        new Chart(ctx, { 
            type: 'doughnut', 
            data: { 
                labels: ['Learning', 'Practice', 'Review'], 
                datasets: [{ 
                    data: [sessionTypes.learning, sessionTypes.practice, sessionTypes.review], 
                    backgroundColor: [ 
                        'rgba(59, 130, 246, 0.8)', 
                        'rgba(245, 158, 11, 0.8)', 
                        'rgba(139, 92, 246, 0.8)' 
                    ], 
                    borderColor: [ 
                        'rgba(59, 130, 246, 1)', 
                        'rgba(245, 158, 11, 1)', 
                        'rgba(139, 92, 246, 1)' 
                    ], 
                    borderWidth: 1 
                }] 
            }, 
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { 
                    legend: { 
                        position: 'bottom', 
                        labels: { 
                            color: 'rgba(255, 255, 255, 0.8)' 
                        } 
                    } 
                } 
            } 
        }); 
        
        // Update summary 
        const summaryContent = document.getElementById('statsSummaryContent'); 
        summaryContent.innerHTML = ` 
            <div class="stat-item"> 
                <div class="stat-value">${completionRate}%</div> 
                <div class="stat-label">Completion Rate</div> 
            </div> 
            <div class="stat-item"> 
                <div class="stat-value">${completedSessions}/${totalSessions}</div> 
                <div class="stat-label">Sessions Completed</div> 
            </div> 
            <div class="stat-item"> 
                <div class="stat-value">${Object.keys(subjects).length}</div> 
                <div class="stat-label">Subjects</div> 
            </div> 
            <div class="stat-item"> 
                <div class="stat-value">${this.userProgress.get(this.currentUser).studyStreak}</div> 
                <div class="stat-label">Study Streak</div> 
            </div> 
        `; 
    } 
    
    // Generate quiz questions based on user's schedule
    generateQuizQuestions() {
        const schedule = this.userSchedules.get(this.currentUser) || [];
        if (schedule.length === 0) {
            return [];
        }
        
        // Get unique subjects and topics from schedule
        const subjects = new Set();
        const topics = new Set();
        
        schedule.forEach(session => {
            subjects.add(session.subject);
            topics.add(session.topic);
        });
        
        const questions = [];
        const templateTypes = Object.keys(this.quizTemplates);
        
        // Generate 3 questions
        for (let i = 0; i < 3; i++) {
            // Pick a random topic
            const topicArray = Array.from(topics);
            const topic = topicArray[Math.floor(Math.random() * topicArray.length)];
            
            // Pick a random template
            const templateType = templateTypes[Math.floor(Math.random() * templateTypes.length)];
            const template = this.quizTemplates[templateType];
            
            // Create question by replacing {topic} in template
            const question = template.question.replace(/{topic}/g, topic);
            const options = template.options.map(option => option.replace(/{topic}/g, topic));
            
            questions.push({
                question,
                options,
                correct: template.correct
            });
        }
        
        return questions;
    }
} 
// ================================================================================= 
// SECTION 2: GLOBAL FUNCTIONS AND UI INTERACTION 
// ================================================================================= 
let studySystem;  
let currentEditingItem = null; 
function showToast(message, type = 'info') { 
    const toast = document.createElement('div'); 
    toast.className = `toast ${type}`; 
    toast.textContent = message; 
    document.body.appendChild(toast); 
    setTimeout(() => toast.classList.add('show'), 10); 
    setTimeout(() => { 
        toast.classList.remove('show'); 
        setTimeout(() => document.body.removeChild(toast), 300); 
    }, 4000); 
} 
function addNewUser() {  
    openModal('userModal');  
} 
function closeModal(id) {  
    document.getElementById(id).style.display = 'none';  
} 
function openModal(id) {  
    document.getElementById(id).style.display = 'flex';  
} 
function editScheduleItem(day, index) { 
    const item = studySystem.groupBy(studySystem.userSchedules.get(studySystem.currentUser), 'day')[day][index]; 
    currentEditingItem = { item }; 
    document.getElementById('editTime').value = item.time; 
    document.getElementById('editSubject').value = item.subject; 
    document.getElementById('editTopic').value = item.topic; 
    updateCustomSelect('editSessionType', item.sessionType); 
    openModal('editModal'); 
} 
function markCompleted(day, index) { 
    const schedule = studySystem.userSchedules.get(studySystem.currentUser); 
    const item = studySystem.groupBy(schedule, 'day')[day][index]; 
    item.completed = !item.completed; 
    studySystem.updateScheduleUI(schedule); 
    studySystem.updateUserProgress(studySystem.userProgress.get(studySystem.currentUser).formHistory); 
} 
function viewSessionDetails(day, index) { 
    studySystem.viewSessionDetails(day, index); 
} 
function viewFileAnalysis(fileName) { 
    const file = studySystem.uploadedFiles.get(studySystem.currentUser).find(f => f.metadata.name === fileName); 
    if (!file) return; 
    document.getElementById('fileModalTitle').textContent = `Analysis: ${file.metadata.name}`; 
    document.getElementById('fileAnalysisContent').innerHTML = ` 
        <div class="knowledge-item"> 
            <strong>Summary:</strong> 
            <p>${file.content.substring(0,300)}...</p> 
        </div> 
        <div class="knowledge-item"> 
            <strong>Word Count:</strong> ${file.analysis.wordCount} 
        </div> 
        <div class="knowledge-item"> 
            <strong>Difficulty Level:</strong> ${file.analysis.difficulty} 
        </div> 
        <div class="knowledge-item"> 
            <strong>Detected Topics:</strong> ${file.analysis.topics.join(', ') || 'None detected'} 
        </div> 
    `; 
    openModal('fileModal'); 
} 
function removeFile(fileName) { 
    const files = studySystem.uploadedFiles.get(studySystem.currentUser); 
    const index = files.findIndex(f => f.metadata.name === fileName); 
    if (index > -1) { 
        files.splice(index, 1); 
        studySystem.updateFilesUI(); 
        studySystem.saveState(); 
        showToast(`Removed ${fileName}`, 'info'); 
    } 
} 
function removeSubjectFile(subject, fileName) { 
    studySystem.removeSubjectFile(subject, fileName); 
} 
function addNote() { 
    const noteInput = document.getElementById('noteInput'); 
    const content = noteInput.value.trim(); 
    
    if (content) { 
        studySystem.addNote(content); 
        noteInput.value = ''; 
    } 
} 
function addNoteToSession(day, index) { 
    studySystem.addNoteToSession(day, index); 
} 
function deleteNote(index) { 
    studySystem.deleteNote(index); 
} 
function previousMonth() { 
    studySystem.currentMonth.setMonth(studySystem.currentMonth.getMonth() - 1); 
    studySystem.updateCalendar(); 
} 
function nextMonth() { 
    studySystem.currentMonth.setMonth(studySystem.currentMonth.getMonth() + 1); 
    studySystem.updateCalendar(); 
} 
async function queryRAG() { 
    const query = document.getElementById('ragQuery').value.trim();  
    if (!query) return; 
    
    const container = document.getElementById('ragResults'); 
    container.innerHTML = `<div class="loading"></div>`; 
    
    await studySystem.agents.rag.delay(1000); 
    const results = studySystem.queryKnowledgeBase(query); 
    
    if (results.length > 0) { 
        container.innerHTML = results.map(r =>  
            `<div class="knowledge-item"><strong>${r.t}:</strong><p>${r.c}</p></div>` 
        ).join(''); 
    } else { 
        container.innerHTML = ` 
            <div class="knowledge-item"> 
                <p>No specific results found for "${query}". Here's a general study tip:</p> 
                <p>Break your study sessions into focused 25-minute blocks with short breaks in between. This technique, known as the Pomodoro Technique, can significantly improve focus and retention.</p> 
            </div> 
        `; 
    } 
} 
function generateQuiz() {
    const subjects = document.getElementById('subjects').value.split(' ').filter(Boolean);
    if (subjects.length === 0) {
        showToast('Please add subjects first to generate a quiz', 'warning');
        return;
    }
    
    openModal('quizModal');
    document.getElementById('quizContent').innerHTML = '<div class="loading"></div>';
    
    // Simulate quiz generation
    setTimeout(() => {
        // Get questions from the study system
        const questions = studySystem.generateQuizQuestions();
        
        if (questions.length === 0) {
            document.getElementById('quizContent').innerHTML = '<p>No questions could be generated. Please create a schedule first.</p>';
            document.getElementById('quizActions').innerHTML = '';
            return;
        }
        
        let quizHTML = '<form id="quizForm">';
        questions.forEach((q, i) => {
            quizHTML += `
                <div class="form-group" style="margin-bottom: 25px;">
                    <h3>Question ${i+1}: ${q.question}</h3>
                    ${q.options.map((opt, j) => `
                        <div style="margin: 10px 0;">
                            <input type="radio" id="q${i}_opt${j}" name="q${i}" value="${j}">
                            <label for="q${i}_opt${j}" style="margin-left: 10px;">${opt}</label>
                        </div>
                    `).join('')}
                </div>
            `;
        });
        quizHTML += '</form>';
        
        document.getElementById('quizContent').innerHTML = quizHTML;
        document.getElementById('quizActions').innerHTML = `
            <button class="btn btn-success" onclick="checkQuizAnswers(${JSON.stringify(questions).replace(/"/g, '&quot;')})">Check Answers</button>
        `;
    }, 1500);
} 
function checkQuizAnswers(questionsStr) { 
    const questions = JSON.parse(questionsStr.replace(/&quot;/g, '"')); 
    let score = 0; 
    
    questions.forEach((q, i) => { 
        const selected = document.querySelector(`input[name="q${i}"]:checked`); 
        if (selected && parseInt(selected.value) === q.correct) { 
            score++; 
        } 
    }); 
    
    const percentage = Math.round((score / questions.length) * 100); 
    let message = `You scored ${score} out of ${questions.length} (${percentage}%)`; 
    
    if (percentage >= 80) { 
        message += " - Excellent work!"; 
    } else if (percentage >= 60) { 
        message += " - Good job, but there's room for improvement."; 
    } else { 
        message += " - Keep studying and try again!"; 
    } 
    
    document.getElementById('quizActions').innerHTML = ` 
        <div style="margin-bottom: 20px; font-size: 1.2rem;">${message}</div> 
        <button class="btn btn-secondary" onclick="closeModal('quizModal')">Close</button> 
        <button class="btn btn-success" onclick="generateQuiz()">Try Another Quiz</button> 
    `; 
} 
async function sendChatMessage() { 
    const input = document.getElementById('chatInput'); 
    const message = input.value.trim(); 
    if (!message) return; 
    
    const chatMessages = document.getElementById('chatMessages'); 
    
    // Add user message 
    const userMsg = document.createElement('div'); 
    userMsg.className = 'chat-message user'; 
    userMsg.innerHTML = `<strong>You:</strong> ${message}`; 
    chatMessages.appendChild(userMsg); 
    
    // Clear input 
    input.value = ''; 
    
    // Add AI response after delay 
    setTimeout(async () => { 
        const aiMsg = document.createElement('div'); 
        aiMsg.className = 'chat-message ai'; 
        
        // Get response from chatbot agent 
        const response = await studySystem.agents.chatbot.processQuery(message); 
        
        aiMsg.innerHTML = `<strong>AI Coach:</strong> ${response}`; 
        chatMessages.appendChild(aiMsg); 
        
        // Scroll to bottom 
        chatMessages.scrollTop = chatMessages.scrollHeight; 
    }, 1000); 
} 
function exportToPDF() { 
    studySystem.exportToPDF(); 
} 
function exportToCSV() { 
    studySystem.exportToCSV(); 
} 
function exportToJSON() { 
    studySystem.exportToJSON(); 
} 
function exportToCalendar() { 
    studySystem.exportToCalendar(); 
} 
function closeSubjectMaterialModal() { 
    closeModal('subjectMaterialModal'); 
    studySystem.currentSubject = null; 
} 
// --- Functions to manage Tag-Based Subject Input --- 
function updateSubjectTags(subjectString) { 
    const container = document.getElementById('subjectsContainer'); 
    container.querySelectorAll('.tag-item').forEach(tag => tag.remove()); 
    const subjects = subjectString ? subjectString.split(/\s+/).filter(Boolean) : []; 
    subjects.forEach(subject => createTag(subject)); 
    updateHiddenSubjectInput(); 
} 
function createTag(text) { 
    const container = document.getElementById('subjectsContainer'); 
    const subjectInput = document.getElementById('subjectInput'); 
    const tag = document.createElement('div'); 
    tag.className = 'tag-item'; 
    tag.textContent = text; 
    const removeBtn = document.createElement('span'); 
    removeBtn.className = 'tag-remove'; 
    removeBtn.innerHTML = '&times;'; 
    removeBtn.onclick = (e) => { 
        e.stopPropagation(); // prevent container click event 
        tag.remove(); 
        updateHiddenSubjectInput(); 
    }; 
    tag.appendChild(removeBtn); 
    
    // Add click event to open subject material modal 
    tag.addEventListener('click', (e) => { 
        if (!e.target.classList.contains('tag-remove')) { 
            studySystem.openSubjectMaterialModal(text); 
        } 
    }); 
    
    container.insertBefore(tag, subjectInput); 
} 
function updateHiddenSubjectInput() { 
    const container = document.getElementById('subjectsContainer'); 
    const tags = container.querySelectorAll('.tag-item'); 
    const subjects = [...tags].map(tag => tag.firstChild.textContent.trim()); 
    document.getElementById('subjects').value = subjects.join(' '); 
} 
function updateCustomSelect(id, value) { 
    const wrapper = document.querySelector(`.custom-select-wrapper[data-hidden-input="${id}"]`); 
    if (!wrapper) return; 
    document.getElementById(id).value = value; 
    const option = wrapper.querySelector(`.custom-select-option[data-value="${value}"]`); 
    if (option) { 
        wrapper.querySelector('.selected-value-title').textContent = option.querySelector('.option-title').textContent; 
        if (option.querySelector('.option-desc')) { 
            wrapper.querySelector('.selected-value-desc').textContent = option.querySelector('.option-desc').textContent; 
        } 
        wrapper.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('selected')); 
        option.classList.add('selected'); 
    } 
} 
// --- Calendar day notes functionality --- 
function openCalendarDayModal(year, month, day) { 
    studySystem.openCalendarDayModal(year, month, day); 
} 
function saveCalendarDayNote() { 
    studySystem.saveCalendarDayNote(); 
} 
function removeCalendarDayFile(dateKey, fileIndex) { 
    studySystem.removeCalendarDayFile(dateKey, fileIndex); 
} 
// --- Study statistics --- 
function showStudyStatistics() { 
    studySystem.showStudyStatistics(); 
} 
// ================================================================================= 
// SECTION 3: INITIALIZATION AND EVENT LISTENERS 
// ================================================================================= 
document.addEventListener('DOMContentLoaded', () => { 
    studySystem = new EnhancedStudySystem(); 
    studySystem.initializeSystem(); 
    
    const tomorrow = new Date(); 
    tomorrow.setDate(tomorrow.getDate() + 30); 
    document.getElementById('examDate').value = tomorrow.toISOString().split('T')[0]; 
    
    // --- Event Listeners for new Subject Tag Input --- 
    const subjectsContainer = document.getElementById('subjectsContainer'); 
    const subjectInput = document.getElementById('subjectInput'); 
    subjectsContainer.addEventListener('click', () => subjectInput.focus()); 
    subjectInput.addEventListener('keydown', (e) => { 
        if (e.key === 'Enter') { 
            e.preventDefault(); 
            const text = subjectInput.value.trim(); 
            if (text) { 
                createTag(text); 
                updateHiddenSubjectInput(); 
                subjectInput.value = ''; 
                
                // Open subject material modal for the new subject 
                studySystem.openSubjectMaterialModal(text); 
            } 
        } 
    }); 
    
    // --- Custom Select Dropdown Logic --- 
    document.querySelectorAll('.custom-select-wrapper').forEach(wrapper => { 
        wrapper.querySelector('.custom-select-trigger').addEventListener('click', () => wrapper.classList.toggle('open')); 
        wrapper.querySelectorAll('.custom-select-option').forEach(option => { 
            option.addEventListener('click', () => { 
                updateCustomSelect(wrapper.dataset.hiddenInput, option.dataset.value); 
                wrapper.classList.remove('open'); 
            }); 
        }); 
    }); 
    
    window.addEventListener('click', e => { 
        document.querySelectorAll('.custom-select-wrapper.open').forEach(w => { 
            if (!w.contains(e.target)) { 
                w.classList.remove('open'); 
            } 
        }); 
    }); 
    
    // --- Form Submission Handlers --- 
    document.getElementById('studyForm').addEventListener('submit', (e) => { 
        e.preventDefault(); 
        
        // Collect study preferences 
        const studyPreferences = []; 
        document.querySelectorAll('input[name="studyTime"]:checked').forEach(checkbox => { 
            studyPreferences.push(checkbox.value); 
        }); 
        
        studySystem.generateSchedule({ 
            examDate: document.getElementById('examDate').value, 
            subjects: document.getElementById('subjects').value, 
            studyHours: document.getElementById('studyHours').value, 
            difficulty: document.getElementById('difficulty').value, 
            studyGoals: document.getElementById('studyGoals').value, 
            learningStyle: document.getElementById('learningStyle').value, 
            studyPreferences: studyPreferences 
        }); 
    }); 
    
    document.getElementById('editForm').addEventListener('submit', (e) => { 
        e.preventDefault(); 
        if (currentEditingItem) { 
            currentEditingItem.item.time = document.getElementById('editTime').value; 
            currentEditingItem.item.subject = document.getElementById('editSubject').value; 
            currentEditingItem.item.topic = document.getElementById('editTopic').value; 
            currentEditingItem.item.sessionType = document.getElementById('editSessionType').value; 
            studySystem.updateScheduleUI(studySystem.userSchedules.get(studySystem.currentUser)); 
            studySystem.saveState(); 
            closeModal('editModal'); 
            showToast('Session updated!', 'success'); 
        } 
    }); 
    
    document.getElementById('userForm').addEventListener('submit', e => { 
        e.preventDefault(); 
        const name = document.getElementById('userName').value.trim(); 
        if (!name) return showToast('Name is required.', 'warning'); 
        const user = studySystem.addUser(`user_${Date.now()}`, name, document.getElementById('userAvatarColor').value); 
        if (user) { 
            studySystem.renderUserCards();  
            studySystem.switchUser(user.id); 
            closeModal('userModal');  
            showToast(`User ${name} added!`, 'success'); 
            e.target.reset(); 
        } 
    }); 
    
    const fileInput = document.getElementById('fileInput'); 
    const uploadArea = document.getElementById('fileUploadArea'); 
    ['dragover', 'dragleave', 'drop'].forEach(evt => uploadArea.addEventListener(evt, e => e.preventDefault())); 
    uploadArea.addEventListener('dragover', () => uploadArea.classList.add('drag-over')); 
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over')); 
    uploadArea.addEventListener('drop', e => {  
        uploadArea.classList.remove('drag-over');  
        studySystem.handleFiles(e.dataTransfer.files);  
    }); 
    fileInput.addEventListener('change', e => studySystem.handleFiles(e.target.files)); 
    
    // Subject file upload 
    const subjectFileInput = document.getElementById('subjectFileInput'); 
    const subjectUploadArea = document.getElementById('subjectFileUploadArea'); 
    ['dragover', 'dragleave', 'drop'].forEach(evt => subjectUploadArea.addEventListener(evt, e => e.preventDefault())); 
    subjectUploadArea.addEventListener('dragover', () => subjectUploadArea.classList.add('drag-over')); 
    subjectUploadArea.addEventListener('dragleave', () => subjectUploadArea.classList.remove('drag-over')); 
    subjectUploadArea.addEventListener('drop', e => {  
        subjectUploadArea.classList.remove('drag-over');  
        studySystem.handleFiles(e.dataTransfer.files, studySystem.currentSubject);  
    }); 
    subjectFileInput.addEventListener('change', e => studySystem.handleFiles(e.target.files, studySystem.currentSubject)); 
    
    // Calendar day file upload 
    const calendarDayFileInput = document.getElementById('calendarDayFileInput'); 
    const calendarDayUploadArea = document.getElementById('calendarDayFileUploadArea'); 
    ['dragover', 'dragleave', 'drop'].forEach(evt => calendarDayUploadArea.addEventListener(evt, e => e.preventDefault())); 
    calendarDayUploadArea.addEventListener('dragover', () => calendarDayUploadArea.classList.add('drag-over')); 
    calendarDayUploadArea.addEventListener('dragleave', () => calendarDayUploadArea.classList.remove('drag-over')); 
    calendarDayUploadArea.addEventListener('drop', e => {  
        calendarDayUploadArea.classList.remove('drag-over');  
        if (e.dataTransfer.files.length > 0) { 
            studySystem.handleCalendarDayFile(e.dataTransfer.files[0]); 
        } 
    }); 
    calendarDayFileInput.addEventListener('change', e => { 
        if (e.target.files.length > 0) { 
            studySystem.handleCalendarDayFile(e.target.files[0]); 
        } 
    }); 
    
    // Initialize color swatches for user avatar 
    const colors = ['#667eea', '#f093fb', '#4facfe', '#fa709a', '#fee140', '#10b981', '#f59e0b', '#ef4444']; 
    const selector = document.getElementById('userAvatarSelector'); 
    colors.forEach(color => { 
        const swatch = document.createElement('div'); 
        swatch.className = 'color-swatch'; 
        swatch.style.background = color; 
        swatch.addEventListener('click', () => { 
            document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active')); 
            swatch.classList.add('active'); 
            document.getElementById('userAvatarColor').value = color; 
        }); 
        if (color === '#667eea') swatch.classList.add('active'); 
        selector.appendChild(swatch); 
    }); 
    
    // Add event listener for Enter key in chat input 
    document.getElementById('chatInput').addEventListener('keydown', e => { 
        if (e.key === 'Enter') { 
            sendChatMessage(); 
        } 
    }); 
    
    // Add event listener for Enter key in note input 
    document.getElementById('noteInput').addEventListener('keydown', e => { 
        if (e.key === 'Enter' && e.ctrlKey) { 
            addNote(); 
        } 
    }); 
    
    // Add event listener for Enter key in RAG query 
    document.getElementById('ragQuery').addEventListener('keydown', e => { 
        if (e.key === 'Enter') { 
            queryRAG(); 
        } 
    }); 
    
    // Add event listener for saving calendar day note 
    document.getElementById('calendarDayNote').addEventListener('keydown', e => { 
        if (e.key === 'Enter' && e.ctrlKey) { 
            saveCalendarDayNote(); 
        } 
    }); 
    
    // Add event listener for stats button in progress section 
    document.addEventListener('click', e => { 
        if (e.target.closest('.progress-card')) { 
            showStudyStatistics(); 
        } 
    }); 
    
    showToast('Welcome to the Enhanced AI Study Nexus Pro!', 'success'); 
});