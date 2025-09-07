// ==UserScript==
// @name         WarosuX - Conversation Threading
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Reorganize Warosu threads with proper conversation threading
// @author       arc x
// @match        https://warosu.org/*/thread/*
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // Add custom CSS for threading
    GM_addStyle(`
        .warosu-thread-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 10px;
        }

        .warosu-post {
            margin: 10px 0;
            padding: 8px;
            border-left: 3px solid #ddd;
            background: #f9f9f9;
        }

        .warosu-post.level-0 { margin-left: 0px; border-color: #0066cc; }
        .warosu-post.level-1 { margin-left: 20px; border-color: #2d8a2f; }
        .warosu-post.level-2 { margin-left: 40px; border-color: #d4691a; }
        .warosu-post.level-3 { margin-left: 60px; border-color: #b02db0; }
        .warosu-post.level-4 { margin-left: 80px; border-color: #c41e3a; }
        .warosu-post.level-5 { margin-left: 100px; border-color: #8b4513; }
        .warosu-post.level-6 { margin-left: 120px; border-color: #4b0082; }
        .warosu-post.level-7 { margin-left: 140px; border-color: #ff1493; }
        .warosu-post.level-8 { margin-left: 160px; border-color: #00ced1; }

        .warosu-post.op {
            background: #e6f3ff;
            border-color: #0066cc;
            border-width: 4px;
        }

        .warosu-level-indicator {
            display: inline-block;
            font-weight: bold;
            font-size: 11px;
            margin-right: 5px;
            padding: 2px 6px;
            border-radius: 3px;
            background: #333;
            color: white;
        }

        .warosu-quote-count {
            background: #666;
            color: #fff;
            font-size: 10px;
            padding: 1px 4px;
            border-radius: 2px;
            margin-left: 5px;
        }

        .warosu-controls {
            text-align: center;
            margin: 20px 0;
            padding: 10px;
            background: #f0f0f0;
            border-radius: 5px;
        }

        .warosu-btn {
            background: #0066cc;
            color: white;
            border: none;
            padding: 8px 16px;
            margin: 0 5px;
            cursor: pointer;
            border-radius: 4px;
        }

        .warosu-btn:hover {
            background: #0052a3;
        }

        .warosu-stats {
            font-size: 12px;
            color: #666;
            margin: 10px 0;
            text-align: center;
        }

        @media (max-width: 768px) {
            .warosu-post.level-1 { margin-left: 10px; }
            .warosu-post.level-2 { margin-left: 20px; }
            .warosu-post.level-3 { margin-left: 30px; }
            .warosu-post.level-4 { margin-left: 40px; }
            .warosu-post.level-5 { margin-left: 50px; }
            .warosu-post.level-6 { margin-left: 60px; }
            .warosu-post.level-7 { margin-left: 70px; }
            .warosu-post.level-8 { margin-left: 80px; }
        }
    `);

  GM_addStyle(`
    /* Container */
    .warosu-thread-container {
        max-width: 1200px !important;
        margin: 0 auto !important;
        padding: 10px !important;
        background: #fff !important;
    }

    /* Individual posts */
    .warosu-post {
        margin: 10px 0 !important;
        padding: 12px !important;
        border-left: 4px solid #ddd !important;
        background: #f9f9f9 !important;
        display: block !important;
        width: calc(100% - 20px) !important;
        box-sizing: border-box !important;
        border-radius: 4px !important;
    }

    /* Level colors and indentation */
    .warosu-post.level-0 { margin-left: 0px !important; border-left-color: #0066cc !important; }
    .warosu-post.level-1 { margin-left: 25px !important; border-left-color: #2d8a2f !important; }
    .warosu-post.level-2 { margin-left: 50px !important; border-left-color: #d4691a !important; }
    .warosu-post.level-3 { margin-left: 75px !important; border-left-color: #b02db0 !important; }
    .warosu-post.level-4 { margin-left: 100px !important; border-left-color: #c41e3a !important; }
    .warosu-post.level-5 { margin-left: 125px !important; border-left-color: #8b4513 !important; }
    .warosu-post.level-6 { margin-left: 150px !important; border-left-color: #4b0082 !important; }
    .warosu-post.level-7 { margin-left: 175px !important; border-left-color: #ff1493 !important; }
    .warosu-post.level-8 { margin-left: 200px !important; border-left-color: #00ced1 !important; }

    /* OP styling */
    .warosu-post.op {
        background: #e6f3ff !important;
        border-left-color: #0066cc !important;
        border-left-width: 6px !important;
        font-weight: bold !important;
    }

    /* Images in threaded posts */
    .warosu-post img {
        max-width: 150px !important;
        height: auto !important;
        display: block !important;
        margin: 8px 0 !important;
        border: 1px solid #ddd !important;
        border-radius: 3px !important;
    }

    /* File info */
    .warosu-post .fileinfo {
        display: block !important;
        margin: 5px 0 !important;
        font-size: 11px !important;
        color: #666 !important;
    }

    /* Post content */
    .warosu-post blockquote {
        margin: 10px 0 !important;
        padding: 0 !important;
        border: none !important;
        font-size: 13px !important;
        line-height: 1.4 !important;
    }

    /* Level indicators */
    .warosu-level-indicator {
        display: inline-block !important;
        font-weight: bold !important;
        font-size: 10px !important;
        margin-right: 8px !important;
        padding: 2px 6px !important;
        border-radius: 3px !important;
        background: #333 !important;
        color: white !important;
        vertical-align: middle !important;
    }

    .warosu-quote-count {
        background: #666 !important;
        color: #fff !important;
        font-size: 9px !important;
        padding: 1px 4px !important;
        border-radius: 2px !important;
        margin-left: 5px !important;
        display: inline-block !important;
        vertical-align: middle !important;
    }

    /* Post metadata */
    .warosu-post .postername {
        font-weight: bold !important;
        color: #0066cc !important;
    }

    .warosu-post .postertrip {
        color: #228b22 !important;
        font-weight: normal !important;
    }

    .warosu-post .posttime {
        color: #999 !important;
        font-size: 11px !important;
    }

    /* Links */
    .warosu-post a {
        color: #0066cc !important;
        text-decoration: underline !important;
    }

    .warosu-post a:hover {
        color: #0052a3 !important;
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
        .warosu-post.level-1 { margin-left: 15px !important; }
        .warosu-post.level-2 { margin-left: 30px !important; }
        .warosu-post.level-3 { margin-left: 45px !important; }
        .warosu-post.level-4 { margin-left: 60px !important; }
        .warosu-post.level-5 { margin-left: 75px !important; }
        .warosu-post.level-6 { margin-left: 90px !important; }
        .warosu-post.level-7 { margin-left: 105px !important; }
        .warosu-post.level-8 { margin-left: 120px !important; }

        .warosu-post img {
            max-width: 100px !important;
        }
    }
`);
  GM_addStyle(`
    /* DESTROY TABLE LAYOUT BUT PRESERVE IMAGES */
    .warosu-thread-container table:not(.image-table),
    .warosu-thread-container tbody,
    .warosu-thread-container tr:not(.image-row),
    .warosu-thread-container td:not(.image-cell) {
        display: block !important;
        width: 100% !important;
        border: none !important;
        padding: 0 !important;
        margin: 0 !important;
    }

    /* PRESERVE IMAGE STRUCTURE */
    .warosu-thread-container img {
        display: block !important;
        max-width: 150px !important; /* Reasonable thumbnail size */
        height: auto !important;
        margin: 5px 0 !important;
        border: 1px solid #ddd !important;
    }

    .warosu-thread-container .thumb {
        display: block !important;
        margin: 5px 0 !important;
    }

    .warosu-thread-container .fileinfo {
        display: block !important;
        margin: 5px 0 !important;
        font-size: 11px !important;
        color: #666 !important;
    }

    .warosu-thread-container a[href*="image/"],
    .warosu-thread-container a[href*=".jpg"],
    .warosu-thread-container a[href*=".png"],
    .warosu-thread-container a[href*=".gif"],
    .warosu-thread-container a[href*=".webm"] {
        display: inline-block !important;
        margin: 5px 0 !important;
    }

    /* Remove the >> arrows from table cells */
    .warosu-thread-container .doubledash {
        display: none !important;
    }

    .warosu-thread-container {
        max-width: 1200px !important;
        margin: 0 auto !important;
        padding: 10px !important;
    }

    .warosu-post {
        margin: 10px 0 !important;
        padding: 8px !important;
        border-left: 3px solid #ddd !important;
        background: #f9f9f9 !important;
        display: block !important;
        width: 100% !important;
        clear: both !important;
        box-sizing: border-box !important;
    }

    /* Level indentation */
    .warosu-post.level-0 { margin-left: 0px !important; border-color: #0066cc !important; }
    .warosu-post.level-1 { margin-left: 20px !important; border-color: #2d8a2f !important; }
    .warosu-post.level-2 { margin-left: 40px !important; border-color: #d4691a !important; }
    .warosu-post.level-3 { margin-left: 60px !important; border-color: #b02db0 !important; }
    .warosu-post.level-4 { margin-left: 80px !important; border-color: #c41e3a !important; }
    .warosu-post.level-5 { margin-left: 100px !important; border-color: #8b4513 !important; }
    .warosu-post.level-6 { margin-left: 120px !important; border-color: #4b0082 !important; }
    .warosu-post.level-7 { margin-left: 140px !important; border-color: #ff1493 !important; }
    .warosu-post.level-8 { margin-left: 160px !important; border-color: #00ced1 !important; }

    .warosu-post.op {
        background: #e6f3ff !important;
        border-color: #0066cc !important;
        border-width: 4px !important;
    }

    /* Level indicators */
    .warosu-level-indicator {
        display: inline-block !important;
        font-weight: bold !important;
        font-size: 11px !important;
        margin-right: 5px !important;
        padding: 2px 6px !important;
        border-radius: 3px !important;
        background: #333 !important;
        color: white !important;
    }

    .warosu-quote-count {
        background: #666 !important;
        color: #fff !important;
        font-size: 10px !important;
        padding: 1px 4px !important;
        border-radius: 2px !important;
        margin-left: 5px !important;
        display: inline-block !important;
    }

    /* Better post structure */
    .warosu-post .postername {
        font-weight: bold !important;
        color: #0066cc !important;
    }

    .warosu-post .postertrip {
        color: #228b22 !important;
    }

    .warosu-post .posttime {
        color: #666 !important;
        font-size: 11px !important;
    }

    .warosu-post blockquote {
        margin: 8px 0 !important;
        padding-left: 10px !important;
        border-left: 2px solid #ccc !important;
        color: #333 !important;
    }
`);
  GM_addStyle(`
    /* Make OP stand out more */
    .warosu-post.op {
        background: linear-gradient(135deg, #e6f3ff 0%, #f0f8ff 100%) !important;
        border-left-color: #0066cc !important;
        border-left-width: 6px !important;
        margin-bottom: 15px !important;
    }

    .warosu-post.op .warosu-level-indicator {
        background: #0066cc !important;
        color: white !important;
    }

    .warosu-post.op::before {
        content: "OP";
        display: inline-block;
        background: #0066cc;
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
        font-weight: bold;
        margin-right: 8px;
        vertical-align: middle;
    }
`);
    class WarosuThreader {
        constructor() {
            this.posts = new Map();
            this.postElements = new Map();
            this.quotedBy = new Map();
            this.debugMode = false;
            this.isThreaded = false;

            this.log('🧵 WarosuX initializing...');
            this.init();
        }

        log(...args) {
            if (this.debugMode) {
                console.log('[WarosuX]', ...args);
            }
        }

        init() {
            // Wait for page load
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.start());
            } else {
                this.start();
            }
        }

        start() {
            this.extractPosts();
            this.buildQuoteMap();
            this.addControls();

            // Auto-thread if more than 5 posts
            if (this.posts.size > 5) {
                this.threadConversation();
            }
        }

        extractPosts() {
            // Extract OP post
            const $opPost = $('.comment#p16645852').first(); // Adjust ID extraction
            if ($opPost.length) {
                const opId = this.extractPostId($opPost);
                if (opId) {
                    this.posts.set(opId, {
                        id: opId,
                        element: $opPost,
                        isOP: true,
                        quotedPosts: this.extractQuotes($opPost),
                        name: this.extractName($opPost),
                        time: this.extractTime($opPost),
                        content: this.extractContent($opPost)
                    });
                    this.postElements.set(opId, $opPost);
                    this.log(`📝 Found OP: ${opId}`);
                }
            }

            // Extract reply posts
            $('.comment.reply').each((i, elem) => {
                const $post = $(elem);
                const postId = this.extractPostId($post);

                if (postId) {
                    this.posts.set(postId, {
                        id: postId,
                        element: $post,
                        isOP: false,
                        quotedPosts: this.extractQuotes($post),
                        name: this.extractName($post),
                        time: this.extractTime($post),
                        content: this.extractContent($post)
                    });
                    this.postElements.set(postId, $post);
                    this.log(`💬 Found post: ${postId}`);
                }
            });

            this.log(`📊 Extracted ${this.posts.size} posts total`);
        }

        extractPostId($post) {
            // Try multiple methods to extract post ID
            const id = $post.attr('id');
            if (id) return id.replace(/^p/, '');

            // Try from post number links
            const $postLink = $post.find('a[href*="#p"]').first();
            if ($postLink.length) {
                const match = $postLink.attr('href').match(/#p(\d+)/);
                if (match) return match[1];
            }

            // Try from javascript insert links
            const $insertLink = $post.find('a[href^="javascript:insert"]').first();
            if ($insertLink.length) {
                const match = $insertLink.attr('href').match(/>>(\d+)/);
                if (match) return match[1];
            }

            return null;
        }

        extractQuotes($post) {
            const quotes = [];

            // Find backlinks (quote links)
            $post.find('.backlink, a[href*="#p"]').each((i, elem) => {
                const $link = $(elem);
                const href = $link.attr('href');
                if (href) {
                    const match = href.match(/#p(\d+)/) || href.match(/>>(\d+)/);
                    if (match) {
                        quotes.push(match[1]);
                    }
                }
            });

            // Also check blockquote text for >>numbers
            const content = $post.find('blockquote').html() || '';
            const quoteMatches = content.match(/>>(\d+)/g);
            if (quoteMatches) {
                quoteMatches.forEach(match => {
                    const quotedId = match.replace(/>>/g, '');
                    if (!quotes.includes(quotedId)) {
                        quotes.push(quotedId);
                    }
                });
            }

            return quotes;
        }

        extractName($post) {
            return $post.find('.postername').text().trim() || 'Anonymous';
        }

        extractTime($post) {
            const $time = $post.find('.posttime');
            return $time.attr('title') || $time.text().trim() || '';
        }

        extractContent($post) {
            return $post.find('blockquote').text().trim().slice(0, 100) + '...';
        }

        buildQuoteMap() {
            // Build reverse quote map (who quotes whom)
            this.posts.forEach(post => {
                post.quotedPosts.forEach(quotedId => {
                    if (!this.quotedBy.has(quotedId)) {
                        this.quotedBy.set(quotedId, []);
                    }
                    this.quotedBy.get(quotedId).push(post.id);
                });
            });

            this.log('🔗 Built quote relationships');
        }

        addControls() {
            const controls = $(`
                <div class="warosu-controls">
                    <button class="warosu-btn" id="warosu-thread-btn">
                        ${this.isThreaded ? 'Original Order' : 'Thread View'}
                    </button>
                    <button class="warosu-btn" id="warosu-debug-btn">Debug Info</button>
                    <div class="warosu-stats">
                        Posts: ${this.posts.size} |
                        Conversations: ${this.countConversations()}
                    </div>
                </div>
            `);

            $('hr').first().after(controls);

            $('#warosu-thread-btn').click(() => {
                if (this.isThreaded) {
                    this.restoreOriginal();
                } else {
                    this.threadConversation();
                }
            });

            $('#warosu-debug-btn').click(() => {
                this.debugMode = !this.debugMode;
                this.showDebugInfo();
            });
        }

        countConversations() {
            const roots = [];
            this.posts.forEach(post => {
                if (post.isOP || post.quotedPosts.length === 0) {
                    roots.push(post.id);
                }
            });
            return roots.length;
        }

        threadConversation() {
            this.log('🧵 Threading conversation...');

            // Create threaded container
            const $container = $('<div class="warosu-thread-container"></div>');

            // Build conversation tree
            const tree = this.buildConversationTree();

            // Render threaded posts
            this.renderThreadedPosts(tree, $container, 0);

            // Replace original content
            $('form#postform .content').html($container);

            this.isThreaded = true;
            $('#warosu-thread-btn').text('Original Order');

            this.log('✅ Threading complete');
        }
buildConversationTree() {
    const tree = [];
    const processed = new Set();

    // FIXED: Find OP post by looking for the thread ID in the URL
    const threadId = window.location.pathname.match(/\/thread\/(\d+)/)?.[1];
    const opPost = Array.from(this.posts.values()).find(p => p.id === threadId);

    if (opPost) {
        this.log(`📌 Found OP: ${opPost.id}`);
        const opNode = this.buildPostNode(opPost.id, processed, 0);
        if (opNode) {
            tree.push(opNode);
        }
    } else {
        this.log('⚠️ OP not found, using first post');
        // Fallback: use first post as OP
        const firstPost = Array.from(this.posts.values())[0];
        if (firstPost) {
            const opNode = this.buildPostNode(firstPost.id, processed, 0);
            if (opNode) {
                tree.push(opNode);
            }
        }
    }

    // Add remaining orphaned posts (posts that don't quote anything)
    this.posts.forEach(post => {
        if (!processed.has(post.id) && !post.isOP) {
            // Only add as root if it doesn't quote anyone
            if (post.quotedPosts.length === 0) {
                const node = this.buildPostNode(post.id, processed, 0);
                if (node) {
                    tree.push(node);
                }
            }
        }
    });

    return tree;
}

buildPostNode(postId, processed, level) {
    if (processed.has(postId)) return null;

    processed.add(postId);
    const post = this.posts.get(postId);
    if (!post) return null;

    const node = {
        post: post,
        level: level,
        children: []
    };

    // Get replies to this post, sorted by time
    const replies = this.quotedBy.get(postId) || [];
    const sortedReplies = replies.sort((a, b) => {
        const postA = this.posts.get(a);
        const postB = this.posts.get(b);
        if (!postA || !postB) return 0;

        // Extract timestamp from time attribute or text
        const timeA = this.extractTimestamp(postA);
        const timeB = this.extractTimestamp(postB);

        return timeA - timeB;
    });

    // Build children in chronological order
    sortedReplies.forEach(replyId => {
        if (!processed.has(replyId)) {
            const childNode = this.buildPostNode(replyId, processed, level + 1);
            if (childNode) {
                node.children.push(childNode);
            }
        }
    });

    return node;
}

// NEW: Extract timestamp for proper sorting
extractTimestamp(post) {
    // Try to get timestamp from title attribute
    const $time = post.element.find('.posttime');
    const timestamp = $time.attr('title');
    if (timestamp) {
        return parseInt(timestamp);
    }

    // Fallback: parse from post ID (later posts have higher IDs)
    return parseInt(post.id) || 0;
}

// UPDATED: Fix OP detection in extractPosts
extractPosts() {
    const threadId = window.location.pathname.match(/\/thread\/(\d+)/)?.[1];

    // Extract OP post - look for the thread ID specifically
    const $opPost = $(`.comment#p${threadId}`).first();
    if ($opPost.length) {
        this.posts.set(threadId, {
            id: threadId,
            element: $opPost,
            isOP: true,
            quotedPosts: this.extractQuotes($opPost),
            name: this.extractName($opPost),
            time: this.extractTime($opPost),
            content: this.extractContent($opPost)
        });
        this.postElements.set(threadId, $opPost);
        this.log(`📝 Found OP: ${threadId}`);
    }

    // Extract reply posts
    $('.comment.reply').each((i, elem) => {
        const $post = $(elem);
        const postId = this.extractPostId($post);

        if (postId && postId !== threadId) {
            this.posts.set(postId, {
                id: postId,
                element: $post,
                isOP: false,
                quotedPosts: this.extractQuotes($post),
                name: this.extractName($post),
                time: this.extractTime($post),
                content: this.extractContent($post)
            });
            this.postElements.set(postId, $post);
            this.log(`💬 Found post: ${postId}`);
        }
    });

    this.log(`📊 Extracted ${this.posts.size} posts total`);
}

        buildPostNode(postId, processed, level) {
            if (processed.has(postId)) return null;

            processed.add(postId);
            const post = this.posts.get(postId);
            if (!post) return null;

            const node = {
                post: post,
                level: level,
                children: []
            };

            // Add replies as children
            const replies = this.quotedBy.get(postId) || [];
            replies.forEach(replyId => {
                const childNode = this.buildPostNode(replyId, processed, level + 1);
                if (childNode) {
                    node.children.push(childNode);
                }
            });

            return node;
        }
      renderThreadedPosts(tree, $container, level) {
    // Sort tree nodes: OP first, then by post ID
    const sortedTree = tree.sort((a, b) => {
        if (a.post.isOP) return -1;
        if (b.post.isOP) return 1;
        return parseInt(a.post.id) - parseInt(b.post.id);
    });

    sortedTree.forEach(node => {
        if (!node) return;

        // Extract clean content
        const $cleanPost = this.createCleanPost(node.post.element, node.level);

        if (node.post.isOP) {
            $cleanPost.addClass('op');
        }

        // Add level indicator and reply count
        const $levelIndicator = $(`<span class="warosu-level-indicator">L${node.level}</span>`);

        if (node.children.length > 0) {
            const $quoteCount = $(`<span class="warosu-quote-count">${node.children.length}↓</span>`);
            $levelIndicator.after($quoteCount);
        }

        $cleanPost.find('label').first().prepend($levelIndicator);
        $container.append($cleanPost);

        // Render children
        if (node.children.length > 0) {
            this.renderThreadedPosts(node.children, $container, level + 1);
        }
    });
}

// NEW METHOD: Create clean post without table structure
createCleanPost($originalPost, level) {
    const $cleanPost = $('<div>').addClass('warosu-post').addClass(`level-${Math.min(level, 8)}`);

    // Copy post ID
    const postId = $originalPost.attr('id');
    if (postId) {
        $cleanPost.attr('id', postId + '-threaded');
    }

    // Extract file info (images)
    const $fileInfo = $originalPost.find('.fileinfo').first();
    if ($fileInfo.length) {
        $cleanPost.append($fileInfo.clone());
    }

    // Extract and fix image links
    const $imageLink = $originalPost.find('a[href*="/img/"]').first();
    if ($imageLink.length) {
        const $img = $imageLink.find('img').clone();
        $img.css({
            'max-width': '150px',
            'height': 'auto',
            'display': 'block',
            'margin': '5px 0'
        });

        const $newImageLink = $imageLink.clone().empty().append($img);
        $cleanPost.append($newImageLink);
    }

    // Extract post metadata (name, trip, time, etc.)
    const $label = $originalPost.find('label').first().clone();
    $cleanPost.append($label);

    // Extract post number and reply links
    const $postLinks = $originalPost.find('a[onclick*="replyhighlight"], a[href*="javascript:insert"]').clone();
    $cleanPost.append(' ');
    $postLinks.each((i, link) => {
        $cleanPost.append($(link)).append(' ');
    });

    // Extract deleted indicator if present
    const $deleted = $originalPost.find('img[alt="[DELETED]"]').first();
    if ($deleted.length) {
        $cleanPost.append($deleted.clone());
    }

    // Extract reply/original links
    const $replyLinks = $originalPost.find('a[href*="/thread/"], a[href*="Original"]').clone();
    if ($replyLinks.length) {
        $cleanPost.append(' [').append($replyLinks).append(']');
    }

    // Extract blockquote (the actual post content)
    const $blockquote = $originalPost.find('blockquote').first();
    if ($blockquote.length) {
        $cleanPost.append($blockquote.clone());
    }

    return $cleanPost;
}

        restoreOriginal() {
            this.log('🔄 Restoring original layout...');

            // This would require storing original HTML,
            // for now just reload the page
            location.reload();
        }

        showDebugInfo() {
            if (!this.debugMode) return;

            let debugInfo = '🔍 DEBUG INFO:\n\n';
            debugInfo += `Posts found: ${this.posts.size}\n`;
            debugInfo += `Quote relationships: ${this.quotedBy.size}\n\n`;

            debugInfo += 'POSTS:\n';
            this.posts.forEach(post => {
                debugInfo += `${post.id}: ${post.name} (quotes: [${post.quotedPosts.join(',')}]) (replies: ${this.quotedBy.get(post.id)?.length || 0})\n`;
            });

            debugInfo += '\nQUOTE MAP:\n';
            this.quotedBy.forEach((replies, postId) => {
                debugInfo += `${postId} ← [${replies.join(', ')}]\n`;
            });

            console.log(debugInfo);

            // Show in alert for easy copy
            const shortDebug = `Posts: ${this.posts.size} | Quotes: ${this.quotedBy.size} conversations`;
            alert('WarosuX Debug Info logged to console\n\n' + shortDebug);
        }

        // Enhanced quote extraction for better accuracy
        extractQuotesAdvanced($post) {
            const quotes = new Set();

            // Method 1: Direct backlinks
            $post.find('a.backlink').each((i, elem) => {
                const href = $(elem).attr('href');
                const match = href?.match(/#p(\d+)/);
                if (match) quotes.add(match[1]);
            });

            // Method 2: Manual >>number parsing from content
            const content = $post.find('blockquote').html() || '';
            const quoteRegex = /&gt;&gt;(\d+)/g;
            let match;
            while ((match = quoteRegex.exec(content)) !== null) {
                quotes.add(match[1]);
            }

            // Method 3: onclick replyhighlight calls
            $post.find('a[onclick*="replyhighlight"]').each((i, elem) => {
                const onclick = $(elem).attr('onclick');
                const match = onclick?.match(/replyhighlight\('p(\d+)'\)/);
                if (match) quotes.add(match[1]);
            });

            return Array.from(quotes);
        }

        // Mobile-responsive threading
        handleMobile() {
            if (window.innerWidth <= 768) {
                GM_addStyle(`
                    .warosu-thread-container {
                        padding: 5px;
                    }

                    .warosu-post {
                        margin: 5px 0;
                        padding: 5px;
                        font-size: 14px;
                    }

                    .warosu-controls {
                        padding: 8px;
                    }

                    .warosu-btn {
                        padding: 6px 12px;
                        font-size: 12px;
                    }
                `);
            }
        }

        // Auto-collapse deep threads
        addCollapseFeature() {
            GM_addStyle(`
                .warosu-post.collapsed {
                    height: 40px;
                    overflow: hidden;
                    opacity: 0.6;
                    cursor: pointer;
                }

                .warosu-post.collapsed::after {
                    content: '[Click to expand...]';
                    position: absolute;
                    right: 10px;
                    color: #666;
                    font-size: 11px;
                }

                .warosu-collapse-toggle {
                    background: none;
                    border: none;
                    color: #666;
                    cursor: pointer;
                    font-size: 11px;
                    margin-left: 5px;
                }
            `);

            // Add collapse buttons to deep posts
            $(document).on('click', '.warosu-collapse-toggle', function(e) {
                e.stopPropagation();
                const $post = $(this).closest('.warosu-post');
                $post.toggleClass('collapsed');
                $(this).text($post.hasClass('collapsed') ? '[+]' : '[-]');
            });

            // Auto-collapse level 4+ posts
            $('.warosu-post').each(function() {
                const $post = $(this);
                const level = parseInt($post.attr('class').match(/level-(\d+)/)?.[1]);

                if (level >= 4) {
                    const $toggle = $('<button class="warosu-collapse-toggle">[-]</button>');
                    $post.find('.warosu-level-indicator').after($toggle);

                    if (level >= 6) {
                        $post.addClass('collapsed');
                        $toggle.text('[+]');
                    }
                }
            });
        }

        // Highlight conversation chains
        addHighlighting() {
            GM_addStyle(`
                .warosu-post.highlighted {
                    background: #fff3cd !important;
                    border-color: #ffc107 !important;
                }

                .warosu-post:hover {
                    background: #f0f8ff !important;
                }
            `);

            // Click to highlight conversation chain
            $(document).on('click', '.warosu-post', function(e) {
                if (e.target.tagName.toLowerCase() === 'a') return;

                $('.warosu-post').removeClass('highlighted');
                const postId = this.id?.replace('p', '');

                if (postId) {
                    this.highlightChain(postId);
                }
            });
        }

        highlightChain(postId) {
            const visited = new Set();
            const toHighlight = new Set();

            // Highlight upward chain (quotes)
            this.highlightUpward(postId, visited, toHighlight);

            // Highlight downward chain (replies)
            this.highlightDownward(postId, visited, toHighlight);

            // Apply highlighting
            toHighlight.forEach(id => {
                $(`#p${id}`).addClass('highlighted');
            });
        }

        highlightUpward(postId, visited, toHighlight) {
            if (visited.has(postId)) return;
            visited.add(postId);
            toHighlight.add(postId);

            const post = this.posts.get(postId);
            if (post) {
                post.quotedPosts.forEach(quotedId => {
                    this.highlightUpward(quotedId, visited, toHighlight);
                });
            }
        }

        highlightDownward(postId, visited, toHighlight) {
            if (visited.has(postId)) return;
            visited.add(postId);
            toHighlight.add(postId);

            const replies = this.quotedBy.get(postId) || [];
            replies.forEach(replyId => {
                this.highlightDownward(replyId, visited, toHighlight);
            });
        }

        // Export thread data
        exportThread() {
            const threadData = {
                url: window.location.href,
                extracted: new Date().toISOString(),
                posts: [],
                relationships: {}
            };

            this.posts.forEach(post => {
                threadData.posts.push({
                    id: post.id,
                    isOP: post.isOP,
                    name: post.name,
                    time: post.time,
                    content: post.content,
                    quotes: post.quotedPosts
                });
            });

            this.quotedBy.forEach((replies, postId) => {
                threadData.relationships[postId] = replies;
            });

            const json = JSON.stringify(threadData, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `warosu-thread-${threadData.posts[0]?.id || 'unknown'}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    // Enhanced initialization with error handling
    function initWarosuX() {
        try {
            // Check if we're on a thread page
            if (!window.location.pathname.includes('/thread/')) {
                console.log('[WarosuX] Not a thread page, skipping...');
                return;
            }

            // Check if posts exist
            if ($('.comment').length === 0) {
                console.log('[WarosuX] No posts found, retrying in 1s...');
                setTimeout(initWarosuX, 1000);
                return;
            }

            // Initialize threader
            const threader = new WarosuThreader();

            // Add to global scope for debugging
            window.WarosuX = threader;

            // Add keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 't') {
                    e.preventDefault();
                    $('#warosu-thread-btn').click();
                }
                if (e.ctrlKey && e.key === 'd') {
                    e.preventDefault();
                    $('#warosu-debug-btn').click();
                }
                if (e.ctrlKey && e.key === 'e') {
                    e.preventDefault();
                    threader.exportThread();
                }
            });

            console.log('🧵 WarosuX initialized successfully!');
            console.log('📋 Shortcuts: Ctrl+T (thread), Ctrl+D (debug), Ctrl+E (export)');

        } catch (error) {
            console.error('[WarosuX] Initialization failed:', error);
        }
    }
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWarosuX);
    } else {
      console.log("Starting WarosuX")
        initWarosuX();
    }

})();