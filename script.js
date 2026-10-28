

/* =========================================================
   MINDX WEBSITE HEARTBEAT
   ========================================================= */

const MINDX_BACKEND_URL = "http://127.0.0.1:8000";
const MINDX_SESSION_KEY = "mindxSessionId";

function getMindxSessionId() {
    let sessionId = sessionStorage.getItem(MINDX_SESSION_KEY);

    if (!sessionId) {
        sessionId =
            typeof crypto.randomUUID === "function"
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`;

        sessionStorage.setItem(MINDX_SESSION_KEY, sessionId);
    }

    return sessionId;
}

async function sendMindxHeartbeat() {
    try {
        await fetch(`${MINDX_BACKEND_URL}/mindx/heartbeat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                session_id: getMindxSessionId()
            })
        });
    } catch (error) {
        console.warn("MINDX heartbeat failed:", error);
    }
}

sendMindxHeartbeat();
setInterval(sendMindxHeartbeat, 3000);




const commandInput = document.getElementById("command");
const sendBtn = document.getElementById("sendBtn");
const startBtn = document.getElementById("startBtn");
const activityLog = document.getElementById("activityLog");
const statusText = document.getElementById("status");
const orb = document.getElementById("orb");
const title = document.getElementById("title");
const message = document.getElementById("message");

const aiChatInput = document.getElementById("aiChatInput");
const aiChatSend = document.getElementById("aiChatSend");
const aiChatMessages = document.getElementById("aiChatMessages");

const voiceStartButton = document.getElementById("voiceStartButton");
const voiceCommandText = document.getElementById("voiceCommandText");
const voiceOrb = document.getElementById("voiceOrb");


/* =========================================================
   PAGE NAVIGATION
   ========================================================= */

function showSection(sectionId, clickedButton = null) {

    const sections = document.querySelectorAll(".page-section");

    sections.forEach((section) => {
        section.classList.remove("active-section");
    });

    const selectedSection = document.getElementById(sectionId);

    if (selectedSection) {
        selectedSection.classList.add("active-section");
    }

    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach((item) => {
        item.classList.remove("selected");
    });

    if (clickedButton) {
        clickedButton.classList.add("selected");
    }

    const pageTitles = {
        dashboard: "Welcome to MINDX",
        commands: "MINDX Commands",
        "ai-chat": "AI Chat",
        "voice-assistant": "Voice Assistant",
        activity: "Activity Log"
    };

    if (pageTitleExists()) {
        document.getElementById("pageTitle").textContent =
            pageTitles[sectionId] || "MINDX";
    }
}


function pageTitleExists() {
    return Boolean(document.getElementById("pageTitle"));
}


/* =========================================================
   UPDATE MINDX SCREEN
   ========================================================= */

function updateStatus(status, heading, detail) {

    if (statusText) {
        statusText.textContent = status;
    }

    if (title) {
        title.textContent = heading;
    }

    if (message) {
        message.textContent = detail;
    }

    if (orb) {
        orb.classList.toggle("active", status === "LISTENING");
    }

    if (voiceOrb) {
        voiceOrb.classList.toggle("active", status === "LISTENING");
    }
}


/* =========================================================
   ACTIVITY LOG
   ========================================================= */

function logActivity(text, sender = "MINDX") {

    if (!activityLog) {
        return;
    }

    const entry = document.createElement("p");

    entry.textContent = `${sender}: ${text}`;

    activityLog.replaceChildren(entry);
}


/* =========================================================
   AI CHAT MESSAGE
   ========================================================= */

function addAIChatMessage(text, sender = "MINDX") {

    if (!aiChatMessages) {
        return;
    }

    const wrapper = document.createElement("div");

    wrapper.className =
        sender === "YOU"
            ? "ai-message user-message"
            : "ai-message mindx-message";

    const avatar = document.createElement("div");

    avatar.className = "message-avatar";

    avatar.textContent =
        sender === "YOU"
            ? "U"
            : "M";

    const content = document.createElement("div");

    content.className = "message-content";

    const name = document.createElement("strong");

    name.textContent =
        sender === "YOU"
            ? "YOU"
            : "MINDX";

    const small = document.createElement("span");

    small.textContent =
        sender === "YOU"
            ? "USER"
            : "AI ASSISTANT";

    name.appendChild(small);

    const paragraph = document.createElement("p");

    paragraph.textContent = text;

    content.appendChild(name);
    content.appendChild(paragraph);

    wrapper.appendChild(avatar);
    wrapper.appendChild(content);

    aiChatMessages.appendChild(wrapper);

    aiChatMessages.scrollTop =
        aiChatMessages.scrollHeight;
}


/* =========================================================
   SPEAK AI REPLIES
   ========================================================= */

function speakWithFemaleVoice(text) {

    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(text);

    const voices =
        window.speechSynthesis.getVoices();

    const preferredVoice =
        voices.find((voice) =>
            /zira|samantha|karen|susan|aria|jenny|female/i
                .test(voice.name)
        );

    if (preferredVoice) {
        speech.voice = preferredVoice;
        speech.lang = preferredVoice.lang;
    } else {
        speech.lang = "en-IN";
    }

    speech.rate = 1;
    speech.pitch = 1.05;

    window.speechSynthesis.speak(speech);
}


/* =========================================================
   WINDOWS APP / FOLDER ACTIONS
   ========================================================= */

function getWindowsAction(rawCommand) {

    const text = rawCommand
        .trim()
        .toLowerCase()
        .replace(/[.!?]+$/g, "");

    const hasOpenIntent =
        /\b(open|launch|start)\b/.test(text) ||
        /(open pannu|open pannunga|thira|thiranthu kudu)/.test(text);

    const hasNoteIntent =
        /(write|take|create|make|type|jot down|jot|record|draft|save).{0,50}\b(note|notes|memo|something down|ideas?)\b/i
            .test(text) ||
        /\b(quick note|text editor|write something down|need to jot something down)\b/i
            .test(text);

    if (!hasOpenIntent && !hasNoteIntent) {
        return null;
    }

    if (
        text.includes("mindx") &&
        (text.includes("project") || text.includes("folder"))
    ) {
        return "mindx project";
    }

    if (text.includes("download")) {
        return "downloads";
    }

    if (text.includes("documents")) {
        return "documents";
    }

    if (text.includes("desktop")) {
        return "desktop";
    }

    if (text.includes("pictures")) {
        return "pictures";
    }

    if (
        text.includes("file explorer") ||
        text.includes("explorer")
    ) {
        return "file explorer";
    }

    if (text.includes("notepad")) {
        return "notepad";
    }

    if (hasNoteIntent) {
        return "notepad";
    }

    if (
        text.includes("calculator") ||
        /\bcalc\b/.test(text)
    ) {
        return "calculator";
    }

    if (text.includes("paint")) {
        return "paint";
    }

    return null;
}


/* =========================================================
   SUPPORTED WEBSITES
   ========================================================= */

const websites = {

    youtube: "https://www.youtube.com/",
    google: "https://www.google.com/",
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
    gmail: "https://mail.google.com/",
    whatsapp: "https://web.whatsapp.com/",
    github: "https://github.com/",
    chatgpt: "https://chatgpt.com/",
    gemini: "https://gemini.google.com/",
    linkedin: "https://www.linkedin.com/",
    googlemaps: "https://maps.google.com/",
    maps: "https://maps.google.com/"

};


/* =========================================================
   WEBSITE / SEARCH COMMANDS
   ========================================================= */

function openWebsite(rawCommand) {

    const text =
        rawCommand.toLowerCase().trim();


    /* YouTube */

    if (text.includes("youtube")) {

        let query =
            rawCommand
                .replace(
                    /\b(?:please\s+)?play\b/i,
                    ""
                )
                .replace(
                    /\b(?:please\s+)?search\b/i,
                    ""
                )
                .replace(
                    /\b(?:for|on|in)\s+youtube\b/i,
                    ""
                )
                .replace(
                    /\byoutube\b/i,
                    ""
                )
                .replace(
                    /\b(?:please|song|video)\b/gi,
                    ""
                )
                .trim();

        if (query) {

            const url =
                "https://www.youtube.com/results?search_query=" +
                encodeURIComponent(query);

            window.open(
                url,
                "_blank",
                "noopener,noreferrer"
            );

            return `Searching YouTube for ${query}.`;
        }

        window.open(
            "https://www.youtube.com/",
            "_blank",
            "noopener,noreferrer"
        );

        return "Opening YouTube.";
    }


    /* Google search */

    const searchMatch =
        rawCommand.match(
            /^(?:please\s+)?(?:search|find|google)\s+(?:for\s+)?(.+)$/i
        );

    if (searchMatch) {

        const query =
            searchMatch[1]
                .replace(/\bon google\b/gi, "")
                .trim();

        if (query) {

            window.open(
                "https://www.google.com/search?q=" +
                encodeURIComponent(query),
                "_blank",
                "noopener,noreferrer"
            );

            return `Searching Google for ${query}.`;
        }
    }


    /* Open supported website */

    const hasOpenIntent =
        /\b(open|launch|start|go to|visit)\b/i.test(text) ||
        /(thira|thiranthu kudu)/.test(text);

    if (!hasOpenIntent) {
        return null;
    }


    for (const [name, url] of Object.entries(websites)) {

        const readableName =
            name === "googlemaps"
                ? "google maps"
                : name;

        if (
            text.includes(name) ||
            text.includes(readableName)
        ) {

            window.open(
                url,
                "_blank",
                "noopener,noreferrer"
            );

            return `Opening ${readableName}.`;
        }
    }


    /* Typed website URL */

    const urlMatch =
        rawCommand.match(
            /(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s]*)?/i
        );

    if (urlMatch) {

        let url = urlMatch[0];

        if (!/^https?:\/\//i.test(url)) {
            url = "https://" + url;
        }

        try {

            const parsedUrl = new URL(url);

            if (
                parsedUrl.protocol === "https:" ||
                parsedUrl.protocol === "http:"
            ) {

                window.open(
                    parsedUrl.href,
                    "_blank",
                    "noopener,noreferrer"
                );

                return `Opening ${parsedUrl.hostname}.`;
            }

        } catch (error) {

            console.error(
                "Invalid URL:",
                error
            );
        }
    }

    return null;
}


/* =========================================================
   WINDOWS AGENT
   ========================================================= */

async function runWindowsAction(action) {

    try {

        const response =
            await fetch(
                "http://127.0.0.1:8001/action",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        command: action
                    })
                }
            );


        const data =
            await response.json();


        logActivity(
            data.message ||
            "Windows action finished."
        );


        updateStatus(
            data.success
                ? "ONLINE"
                : "READY",

            data.success
                ? "Action completed"
                : "Action not completed",

            data.message ||
            "No additional details."
        );


    } catch (error) {

        console.error(error);

        logActivity(
            "Windows Agent connect aagala. Port 8001 server check pannu."
        );

        updateStatus(
            "OFFLINE",
            "Agent not connected",
            "Windows Agent server running-ah check pannu."
        );
    }
}


/* =========================================================
   MUSIC SOURCE
   ========================================================= */

let pendingMusicSong = "";

const musicSources = {

    youtube: "YouTube",
    spotify: "Spotify",
    "apple music": "Apple Music",
    jiosaavn: "JioSaavn",
    "amazon music": "Amazon Music"

};


/* =========================================================
   MAIN MINDX COMMAND PROCESSOR
   ========================================================= */

async function sendToMINDX(rawCommand) {

    const text = rawCommand.trim();

    if (!text) {
        return;
    }

    const selectedSource =
        text.toLowerCase().trim();


    /* ---------------------------------
       MUSIC SOURCE SELECTION
       --------------------------------- */

    if (
        pendingMusicSong &&
        musicSources[selectedSource]
    ) {

        const song =
            pendingMusicSong;

        pendingMusicSong = "";


        if (selectedSource === "youtube") {

            await runWindowsAction(
                "play youtube: " + song
            );

        } else {

            const query =
                encodeURIComponent(song);

            const urls = {

                spotify:
                    "https://open.spotify.com/search/" +
                    query,

                "apple music":
                    "https://music.apple.com/search?term=" +
                    query,

                jiosaavn:
                    "https://www.jiosaavn.com/search/" +
                    query,

                "amazon music":
                    "https://music.amazon.com/search/" +
                    query

            };


            window.open(
                urls[selectedSource],
                "_blank",
                "noopener,noreferrer"
            );


            logActivity(
                "Opening " +
                musicSources[selectedSource] +
                " search for " +
                song
            );


            updateStatus(
                "ONLINE",
                "Music source opened",
                song
            );
        }

        return;
    }


    logActivity(
        text,
        "YOU"
    );


    updateStatus(
        "WORKING",
        "MINDX is working...",
        "Un command process pannitu irukken."
    );


    /* =================================
       YOUTUBE PLAYBACK CONTROLS
       ================================= */

    const youtubeControlCommands = {

        "play": "play",
        "play video": "play",
        "resume": "play",
        "resume video": "play",

        "pause": "pause",
        "pause video": "pause",

        "volume up": "volume up",
        "volume down": "volume down",
        "increase volume": "volume up",
        "decrease volume": "volume down",
        "louder": "volume up",
        "quieter": "volume down",

        "mute": "mute",
        "unmute": "unmute",

        "forward": "forward",
        "backward": "backward"

    };


    /* =================================
       EXACT VOLUME
       ================================= */

    const volumeMatch =
        text.match(
            /^(?:set\s+)?volume(?:\s+to)?\s+(\d{1,3})\s*%?$/i
        );


    if (volumeMatch) {

        const volumeValue =
            Number(volumeMatch[1]);


        if (
            volumeValue >= 0 &&
            volumeValue <= 100
        ) {

            await runWindowsAction(
                `volume ${volumeValue}`
            );

            return;
        }


        logActivity(
            "Volume 0 to 100 kulla irukkanum."
        );


        updateStatus(
            "ONLINE",
            "Invalid volume",
            "Volume 0 to 100 kulla sollu."
        );

        return;
    }


    /* =================================
       FORWARD
       ================================= */

    const forwardMatch =
        text.match(
            /^forward(?:\s+(.+))?$/i
        );


    if (forwardMatch) {

        const duration =
            forwardMatch[1];


        if (!duration) {

            await runWindowsAction(
                "forward"
            );

            return;
        }


        await runWindowsAction(
            `forward ${duration}`
        );

        return;
    }


    /* =================================
       BACKWARD
       ================================= */

    const backwardMatch =
        text.match(
            /^backward(?:\s+(.+))?$/i
        );


    if (backwardMatch) {

        const duration =
            backwardMatch[1];


        if (!duration) {

            await runWindowsAction(
                "backward"
            );

            return;
        }


        await runWindowsAction(
            `backward ${duration}`
        );

        return;
    }


    /* =================================
       NORMAL YOUTUBE COMMANDS
       ================================= */

    const youtubeCommand =
        youtubeControlCommands[
            text.toLowerCase()
        ];


    if (youtubeCommand) {

        await runWindowsAction(
            youtubeCommand
        );

        return;
    }


    /* =================================
       PLAY MUSIC
       ================================= */

    const playMatch =
        text.match(
            /^play\s+(.+?)(?:\s+(?:on|in)\s+(youtube|spotify|apple music|jiosaavn|amazon music))?$/i
        );


    if (playMatch) {

        const song =
            playMatch[1].trim();

        const source =
            playMatch[2]?.toLowerCase();


        if (
            song &&
            source === "youtube"
        ) {

            await runWindowsAction(
                "play youtube: " + song
            );

            return;
        }


        if (
            song &&
            source &&
            musicSources[source]
        ) {

            pendingMusicSong = song;

            await sendToMINDX(
                source
            );

            return;
        }


        if (song) {

            pendingMusicSong =
                song;

            const question =
                `Which app should I use to play "${song}"? Reply YouTube, Spotify, Apple Music, JioSaavn, or Amazon Music.`;


            logActivity(
                question
            );


            updateStatus(
                "ONLINE",
                "Choose music source",
                question
            );


            speakWithFemaleVoice(
                question
            );

            return;
        }
    }


    /* =================================
       WEBSITE / SEARCH
       ================================= */

    const websiteResult =
        openWebsite(text);


    if (websiteResult) {

        logActivity(
            websiteResult
        );


        updateStatus(
            "ONLINE",
            "Done!",
            websiteResult
        );

        return;
    }


    /* =================================
       WINDOWS ACTIONS
       ================================= */

    const windowsAction =
        getWindowsAction(text);


    console.log(
        "MINDX action check:",
        text,
        windowsAction
    );


    if (windowsAction) {

        await runWindowsAction(
            windowsAction
        );

        return;
    }


    /* =================================
       AI BACKEND
       ================================= */

    console.log(
        "MINDX COMMAND SENT:",
        text
    );


    try {

        const response =
            await fetch(
                "http://127.0.0.1:8000/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: text
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Backend request failed."
            );
        }


        const answer =
            data.reply ||
            data.response ||
            data.message ||
            "AI response empty-ah irukku.";


        logActivity(
            answer
        );


        updateStatus(
            "ONLINE",
            "MINDX replied",
            answer
        );


        speakWithFemaleVoice(
            answer
        );


    } catch (error) {

        console.error(error);


        logActivity(
            "AI backend connect aagala. Port 8000 server check pannu."
        );


        updateStatus(
            "OFFLINE",
            "AI backend not connected",
            "Backend server running-ah check pannu."
        );
    }
}


/* =========================================================
   COMMAND INPUT SEND
   ========================================================= */

if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        () => {

            const text =
                commandInput.value.trim();

            if (!text) {
                return;
            }

            commandInput.value = "";

            sendToMINDX(text);
        }
    );
}


if (commandInput) {

    commandInput.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

                event.preventDefault();

                sendBtn.click();
            }
        }
    );
}


/* =========================================================
   VOICE RECOGNITION
   ========================================================= */

let recognition = null;


function startVoiceRecognition(button = startBtn) {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        updateStatus(
            "ONLINE",
            "Text mode ready",
            "Voice support illaina command type panni SEND click pannu."
        );


        logActivity(
            "Voice support unavailable. Text mode use pannalaam."
        );

        return;
    }


    if (recognition) {

        try {
            recognition.stop();
        } catch (error) {
            console.log(error);
        }
    }


    recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-IN";

    recognition.interimResults =
        false;

    recognition.maxAlternatives =
        1;


    recognition.onstart = () => {

        updateStatus(
            "LISTENING",
            "Listening...",
            "Ippo un command-a pesu."
        );


        logActivity(
            "Listening for your command..."
        );


        if (button) {

            button.textContent =
                "🎙 LISTENING...";
        }

        if (voiceCommandText) {

            voiceCommandText.textContent =
                "Listening...";
        }
    };


    recognition.onresult = (event) => {

        const transcript =
            event.results[0][0]
                .transcript
                .trim();


        if (commandInput) {
            commandInput.value =
                transcript;
        }


        if (voiceCommandText) {

            voiceCommandText.textContent =
                transcript;
        }


        if (transcript) {

            sendToMINDX(
                transcript
            );
        }
    };


    recognition.onerror = (event) => {

        logActivity(
            `Voice error: ${event.error}`
        );


        updateStatus(
            "ONLINE",
            "Voice stopped",
            "Command-a type panni SEND click pannalaam."
        );


        if (voiceCommandText) {

            voiceCommandText.textContent =
                "Voice error. Try again.";
        }
    };


    recognition.onend = () => {

        if (button) {

            if (button === startBtn) {

                button.textContent =
                    "▶ START MINDX";

            } else {

                button.textContent =
                    "🎙 START LISTENING";
            }
        }


        if (
            statusText &&
            statusText.textContent ===
            "LISTENING"
        ) {

            updateStatus(
                "ONLINE",
                "Ready when you are",
                "Next command sollu illa type pannu."
            );
        }
    };


    recognition.start();
}


/* =========================================================
   MAIN START MINDX BUTTON
   ========================================================= */

if (startBtn) {

    startBtn.addEventListener(
        "click",
        async () => {

            try {
                await fetch("http://127.0.0.1:8000/start-mindx", {
                    method: "POST"
                });
            } catch (error) {
                console.warn("MINDX backend start failed:", error);
            }

            startVoiceRecognition(
                startBtn
            );
        }
    );
}


/* =========================================================
   VOICE ASSISTANT PAGE BUTTON
   ========================================================= */

if (voiceStartButton) {

    voiceStartButton.addEventListener(
        "click",
        () => {

            startVoiceRecognition(
                voiceStartButton
            );
        }
    );
}


/* =========================================================
   AI CHAT
   ========================================================= */

async function sendAIChatMessage() {

    if (!aiChatInput) {
        return;
    }


    const text =
        aiChatInput.value.trim();


    if (!text) {
        return;
    }


    addAIChatMessage(
        text,
        "YOU"
    );


    aiChatInput.value = "";


    updateStatus(
        "WORKING",
        "MINDX is thinking...",
        "AI Chat response prepare pannitu irukken."
    );


    try {

        const response =
            await fetch(
                "http://127.0.0.1:8000/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: text
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "AI backend request failed."
            );
        }


        const answer =
            data.reply ||
            data.response ||
            data.message ||
            "AI response empty-ah irukku.";


        addAIChatMessage(
            answer,
            "MINDX"
        );


        logActivity(
            answer
        );


        updateStatus(
            "ONLINE",
            "MINDX replied",
            answer
        );


        speakWithFemaleVoice(
            answer
        );


    } catch (error) {

        console.error(error);


        const errorMessage =
            "AI backend connect aagala. Port 8000 server check pannu.";


        addAIChatMessage(
            errorMessage,
            "MINDX"
        );


        logActivity(
            errorMessage
        );


        updateStatus(
            "OFFLINE",
            "AI backend not connected",
            errorMessage
        );
    }
}


if (aiChatSend) {

    aiChatSend.addEventListener(
        "click",
        sendAIChatMessage
    );
}


if (aiChatInput) {

    aiChatInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendAIChatMessage();
            }
        }
    );
}


/* =========================================================
   INITIAL SCREEN
   ========================================================= */

updateStatus(
    "ONLINE",
    "Ready when you are",
    "Type a command or click START MINDX to speak."
);