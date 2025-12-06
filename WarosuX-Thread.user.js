// ==UserScript==
// @name         WarosuX - Conversation Threading (Corrected)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Reorganize Warosu threads with proper conversation threading, fixing missing posts.
// @author       half
// @match        https://warosu.org/*/thread/*
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // --- Injected CSS for styling the threaded view ---

GM_addStyle(`
    /* === CONFIGURATION VARIABLES === */
    :root {
        /* Font Settings */
        --warosu-font-scale: 1.8;
        --warosu-post-font-scale: 2.2;
        --warosu-font-color: #333333;
        --warosu-font-weight: 400;
        --warosu-font-weight-bold: 600;

        /* Background Colors */
        --warosu-bg-main: #ffffff;
        --warosu-bg-post: #f9f9f9;
        --warosu-bg-op: #e6f3ff;
        --warosu-bg-container: #ffffff;

        /* Post Sizing */
        --warosu-post-padding: 8px;
        --warosu-post-margin: 10px 0;
        --warosu-post-border-width: 4px;
        --warosu-post-border-radius: 4px;

        /* Reply Indentation */
        --warosu-indent-base: 15px;
        --warosu-indent-mobile: 12px;
    }

    /* === MAIN STYLES WITH VARIABLES === */
    .warosu-thread-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 10px;
        background: var(--warosu-bg-container) !important;
        font-size: calc(14px * var(--warosu-font-scale));
        color: var(--warosu-font-color);
        font-weight: var(--warosu-font-weight);
    }

    .warosu-post {
        margin: var(--warosu-post-margin) !important;
        padding: var(--warosu-post-padding) !important;
        border-left: var(--warosu-post-border-width) solid #ddd !important;
        background: var(--warosu-bg-post) !important;
        display: block !important;
        width: calc(100% - 20px) !important;
        box-sizing: border-box !important;
        border-radius: var(--warosu-post-border-radius) !important;
        font-size: calc(13px * var(--warosu-font-scale)) !important;
        color: var(--warosu-font-color) !important;
        font-weight: var(--warosu-font-weight) !important;
        line-height: 1.0 !important;
    }

    /* Level colors and indentation with variables */
    .warosu-post.level-0 {
        margin-left: 0px !important;
        border-left-color: #0066cc !important;
    }
    .warosu-post.level-1 {
        margin-left: calc(var(--warosu-indent-base) * 1) !important;
        border-left-color: #2d8a2f !important;
    }
    .warosu-post.level-2 {
        margin-left: calc(var(--warosu-indent-base) * 2) !important;
        border-left-color: #d4691a !important;
    }
    .warosu-post.level-3 {
        margin-left: calc(var(--warosu-indent-base) * 3) !important;
        border-left-color: #b02db0 !important;
    }
    .warosu-post.level-4 {
        margin-left: calc(var(--warosu-indent-base) * 4) !important;
        border-left-color: #c41e3a !important;
    }
    .warosu-post.level-5 {
        margin-left: calc(var(--warosu-indent-base) * 5) !important;
        border-left-color: #8b4513 !important;
    }
    .warosu-post.level-6 {
        margin-left: calc(var(--warosu-indent-base) * 6) !important;
        border-left-color: #4b0082 !important;
    }
    .warosu-post.level-7 {
        margin-left: calc(var(--warosu-indent-base) * 7) !important;
        border-left-color: #ff1493 !important;
    }
    .warosu-post.level-8 {
        margin-left: calc(var(--warosu-indent-base) * 8) !important;
        border-left-color: #00ced1 !important;
    }

    /* OP styling with variables */
    .warosu-post.op {
        background: var(--warosu-bg-op) !important;
        border-left-color: #0066cc !important;
        border-left-width: calc(var(--warosu-post-border-width) + 2px) !important;
        font-weight: var(--warosu-font-weight-bold) !important;
        margin-bottom: calc(var(--warosu-post-margin) + 5px) !important;
    }

    .warosu-post.op::before {
        content: "OP";
        display: inline-block;
        background: #0066cc;
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: calc(10px * var(--warosu-font-scale));
        font-weight: var(--warosu-font-weight-bold);
        margin-right: 8px;
        vertical-align: middle;
    }

    /* Text elements with font scaling */
    .warosu-post .postername {
        font-weight: var(--warosu-font-weight-bold) !important;
        color: #0066cc !important;
        font-size: calc(13px * var(--warosu-font-scale)) !important;
    }

    .warosu-post .postertrip {
        color: #228b22 !important;
        font-weight: var(--warosu-font-weight) !important;
        font-size: calc(13px * var(--warosu-font-scale)) !important;
    }

    .warosu-post .posttime {
        color: #999 !important;
        font-size: calc(11px * var(--warosu-font-scale)) !important;
        font-weight: var(--warosu-font-weight) !important;
    }

    .warosu-post .fileinfo {
        display: block !important;
        margin: 5px 0 !important;
        font-size: calc(11px * var(--warosu-font-scale)) !important;
        color: #666 !important;
        font-weight: var(--warosu-font-weight) !important;
    }
blockquote > p{
  margin: 0 !important;
}
    .warosu-post blockquote {
        margin: calc(10px * var(--warosu-font-scale)) 0 !important;
        padding: 0 !important;
        border: none !important;
        font-size: calc(13px * var(--warosu-font-scale) * var(--warosu-post-font-scale)) !important;
        line-height: 1.2 !important;
        color: var(--warosu-font-color) !important;
        font-weight: var(--warosu-font-weight) !important;
    }

    /* Level indicators with scaling */
    .warosu-level-indicator {
        display: inline-block !important;
        font-weight: var(--warosu-font-weight-bold) !important;
        font-size: calc(10px * var(--warosu-font-scale)) !important;
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
        font-size: calc(9px * var(--warosu-font-scale)) !important;
        font-weight: var(--warosu-font-weight-bold) !important;
        padding: 1px 4px !important;
        border-radius: 2px !important;
        margin-left: 5px !important;
        display: inline-block !important;
        vertical-align: middle !important;
    }

    /* Links with font scaling */
    .warosu-post a {
        color: #0066cc !important;
        text-decoration: underline !important;
        font-size: calc(13px * var(--warosu-font-scale)) !important;
        font-weight: var(--warosu-font-weight) !important;
    }

    .warosu-post a:hover {
        color: #0052a3 !important;
    }

    /* Images */
    .warosu-post img {
        max-width: 150px !important;
        height: auto !important;
        display: block !important;
        margin: calc(8px * var(--warosu-font-scale)) 0 !important;
        border: 1px solid #ddd !important;
        border-radius: 3px !important;
    }

    /* Controls and buttons with scaling */
    .warosu-controls {
        text-align: center;
        margin: 20px 0;
        padding: 10px;
        background: #f0f0f0;
        border-radius: 5px;
        font-size: calc(14px * var(--warosu-font-scale));
    }

    .warosu-btn {
        background: #0066cc;
        color: white;
        border: none;
        padding: 8px 16px;
        margin: 0 5px;
        cursor: pointer;
        border-radius: 4px;
        font-size: calc(13px * var(--warosu-font-scale));
        font-weight: var(--warosu-font-weight-bold);
    }

    .warosu-btn:hover {
        background: #0052a3;
    }

    .warosu-stats {
        font-size: calc(12px * var(--warosu-font-scale));
        color: #666;
        margin: 10px 0;
        text-align: center;
        font-weight: var(--warosu-font-weight);
    }
s.warosu-thread-container {
width: 920px !important;
margin: 0 !important;
}

    /* Mobile responsive with variables */
    @media (max-width: 768px) {
        .warosu-post.level-1 { margin-left: calc(var(--warosu-indent-mobile) * 1) !important; }
        .warosu-post.level-2 { margin-left: calc(var(--warosu-indent-mobile) * 2) !important; }
        .warosu-post.level-3 { margin-left: calc(var(--warosu-indent-mobile) * 3) !important; }
        .warosu-post.level-4 { margin-left: calc(var(--warosu-indent-mobile) * 4) !important; }
        .warosu-post.level-5 { margin-left: calc(var(--warosu-indent-mobile) * 5) !important; }
        .warosu-post.level-6 { margin-left: calc(var(--warosu-indent-mobile) * 6) !important; }
        .warosu-post.level-7 { margin-left: calc(var(--warosu-indent-mobile) * 7) !important; }
        .warosu-post.level-8 { margin-left: calc(var(--warosu-indent-mobile) * 8) !important; }

        .warosu-post img {
            max-width: 100px !important;
        }

        :root {
            --warosu-font-scale: 0.9; /* Smaller fonts on mobile */
            --warosu-post-padding: 10px; /* Less padding on mobile */
        }
    }

    /* Table layout fixes */
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

    .warosu-thread-container .doubledash {
        display: none !important;
    }
`);

    class WarosuThreader {
        constructor() {
            this.posts = new Map();
            this.postElements = new Map();
            this.quotedBy = new Map();
            this.originalContent = null;
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
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.start());
            } else {
                this.start();
            }
        }

        start() {
            this.originalContent = $('form#postform .content').html();
            this.extractPosts();
            this.buildQuoteMap();
            this.addControls();

            if (this.posts.size > 5) {
                this.threadConversation();
            }
        }

        // --- CORE LOGIC ---

        extractPosts() {
            this.posts.clear();
            this.postElements.clear();
            const threadIdMatch = window.location.pathname.match(/\/thread\/(\d+)/);
            if (!threadIdMatch) {
                console.error('[WarosuX] Could not determine thread ID from URL.');
                return;
            }
            const threadId = threadIdMatch[1];

            // Extract OP - it's a div.comment, not a .reply
            const $opPost = $(`.comment#p${threadId}`).not('.reply').first();
            if ($opPost.length) {
                this.posts.set(threadId, {
                    id: threadId,
                    element: $opPost,
                    isOP: true,
                    quotedPosts: this.extractQuotes($opPost)
                });
                this.postElements.set(threadId, $opPost);
                this.log(`📝 Found OP: ${threadId}`);
            } else {
                 this.log(`⚠️ OP with ID ${threadId} not found!`);
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
                        quotedPosts: this.extractQuotes($post)
                    });
                    this.postElements.set(postId, $post);
                }
            });
            this.log(`📊 Extracted ${this.posts.size} posts total.`);
        }

        extractPostId($post) {
            const id = $post.attr('id');
            if (id) return id.replace(/^p/, '');
            return null; // Simplified, as ID is reliable
        }

        extractQuotes($post) {
            const quotes = new Set();
            $post.find('blockquote a.backlink').each((i, elem) => {
                const href = $(elem).attr('href');
                const match = href?.match(/#p(\d+)/);
                if (match) quotes.add(match[1]);
            });
            return Array.from(quotes);
        }

        buildQuoteMap() {
            this.quotedBy.clear();
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

        buildConversationTree() {
            const tree = [];
            const processed = new Set();
            const threadId = window.location.pathname.match(/\/thread\/(\d+)/)?.[1];

            // 1. Start with the OP
            if (this.posts.has(threadId)) {
                const opNode = this.buildPostNode(threadId, processed, 0);
                if (opNode) tree.push(opNode);
            } else {
                this.log('⚠️ OP not in post map, cannot build tree from it.');
            }

            // 2. Add all other posts that haven't been processed yet
            // This catches orphan posts and replies to posts that might have been deleted.
            const sortedPosts = Array.from(this.posts.values()).sort((a,b) => parseInt(a.id) - parseInt(b.id));

            for (const post of sortedPosts) {
                if (!processed.has(post.id)) {
                    const node = this.buildPostNode(post.id, processed, 0);
                    if (node) tree.push(node);
                }
            }
            return tree;
        }

        buildPostNode(postId, processed, level) {
            if (processed.has(postId) || !this.posts.has(postId)) return null;

            processed.add(postId);
            const post = this.posts.get(postId);

            const node = { post: post, level: level, children: [] };

            const replies = this.quotedBy.get(postId) || [];
            const sortedReplies = replies.sort((a, b) => parseInt(a) - parseInt(b));

            sortedReplies.forEach(replyId => {
                const childNode = this.buildPostNode(replyId, processed, level + 1);
                if (childNode) {
                    node.children.push(childNode);
                }
            });

            return node;
        }

        // --- UI AND RENDERING ---

        renderThreadedPosts(tree, $container) {
            tree.forEach(node => {
                if (!node) return;
                const $cleanPost = this.createCleanPost(node.post.element, node.level, node.children.length);
                $container.append($cleanPost);

                if (node.children.length > 0) {
                    this.renderThreadedPosts(node.children, $container);
                }
            });
        }

        createCleanPost($originalPost, level, replyCount) {
            const postData = this.posts.get(this.extractPostId($originalPost));
            if (!postData) return $();

            const $cleanPost = $('<div>')
                .addClass('warosu-post')
                .addClass(`level-${Math.min(level, 8)}`)
                .attr('id', $originalPost.attr('id') + '-threaded');

             if (postData.isOP) {
                $cleanPost.addClass('op');
            }

            // Image
            const $imageLink = $originalPost.find('a[href*="/img/"]').first().clone();
            $imageLink.find('img').addClass('thumb');
            if ($imageLink.length) $cleanPost.append($imageLink);

            // Metadata
            const $label = $originalPost.find('label').first().clone();
            const $levelIndicator = $(`<span class="warosu-level-indicator">L${level}</span>`);
            const $collapseToggle = $(`<span class="warosu-collapse-toggle" title="Collapse/Expand Post">[–]</span>`);
            $label.prepend($levelIndicator, $collapseToggle);

            if (replyCount > 0) {
                const $quoteCount = $(`<span class="warosu-quote-count" title="${replyCount} replies">${replyCount}↓</span>`);
                $label.append($quoteCount);
            }
            $cleanPost.append($label);

            // Links (No., Reply, etc.)
            $cleanPost.append($originalPost.find('a.js[href*="javascript:insert"]').first().clone());
            $cleanPost.append($originalPost.find('a:contains("Reply"), a:contains("Original")').parent().clone());

            // Content
            $cleanPost.append($originalPost.find('blockquote').first().clone());

            return $cleanPost;
        }

        threadConversation() {
            this.log('🧵 Threading conversation...');
            const $container = $('<div class="warosu-thread-container"></div>');
            const tree = this.buildConversationTree();
            this.renderThreadedPosts(tree, $container);

            $('form#postform .content').empty().append($container);
            this.addFeatureEventListeners();

            this.isThreaded = true;
            $('#warosu-thread-btn').text('Original Order');
            this.log('✅ Threading complete.');
        }

        restoreOriginal() {
            this.log('🔄 Restoring original layout...');
            $('form#postform .content').html(this.originalContent);
            this.isThreaded = false;
            $('#warosu-thread-btn').text('Thread View');
        }

        addControls() {
            const controls = $(`
                <div class="warosu-controls">
                    <button class="warosu-btn" id="warosu-thread-btn">Thread View</button>
                    <button class="warosu-btn" id="warosu-debug-btn">Debug Info</button>
                    <div class="warosu-stats">
                        Posts: ${this.posts.size}
                    </div>
                </div>
            `);

            $('hr').first().after(controls);

            $('#warosu-thread-btn').click(() => this.isThreaded ? this.restoreOriginal() : this.threadConversation());
            $('#warosu-debug-btn').click(() => {
                this.debugMode = !this.debugMode;
                alert(`Debug mode is now ${this.debugMode ? 'ON' : 'OFF'}. Check the console.`);
                this.showDebugInfo();
            });
        }

        addFeatureEventListeners() {
            // Collapse feature
            $('.warosu-collapse-toggle').on('click', function(e) {
                e.stopPropagation();
                const $post = $(this).closest('.warosu-post');
                $post.toggleClass('collapsed');
                $(this).text($post.hasClass('collapsed') ? '[+]' : '[–]');
            });

            // Highlight feature
            $('.warosu-post').on('click', (e) => {
                if ($(e.target).is('a, a *, .warosu-collapse-toggle')) return;

                const $post = $(e.currentTarget);
                const postId = $post.attr('id').replace('-threaded', '').replace('p','');

                if ($post.hasClass('highlighted')) {
                    $('.warosu-post').removeClass('highlighted');
                } else {
                    $('.warosu-post').removeClass('highlighted');
                    this.highlightChain(postId);
                }
            });
        }

        highlightChain(startPostId) {
            const toHighlight = new Set();
            const findParents = (id) => {
                if (toHighlight.has(id)) return;
                toHighlight.add(id);
                const post = this.posts.get(id);
                post?.quotedPosts.forEach(findParents);
            };
             const findChildren = (id) => {
                if (toHighlight.has(id)) return;
                toHighlight.add(id);
                const replies = this.quotedBy.get(id) || [];
                replies.forEach(findChildren);
            };
            findParents(startPostId);
            findChildren(startPostId);
            toHighlight.forEach(id => $(`#p${id}-threaded`).addClass('highlighted'));
        }

        showDebugInfo() {
            if (!this.debugMode) return;
            console.log("--- WarosuX Debug Info ---");
            console.log(`Total posts extracted: ${this.posts.size}`);
            console.log("Posts Map:", this.posts);
            console.log("QuotedBy Map:", this.quotedBy);
            console.log("--- End Debug Info ---");
        }
    }

    // --- Script Initialization ---
    try {
        if ($('.comment').length > 0) {
            window.WarosuX = new WarosuThreader();
            console.log('🧵 WarosuX initialized successfully!');
        } else {
             console.log('[WarosuX] No posts found on page.');
        }
    } catch (error) {
        console.error('[WarosuX] An error occurred during initialization:', error);
    }

})();// ==UserScript==
// @name         WarosuX - Conversation Threading (Corrected)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Reorganize Warosu threads with proper conversation threading, fixing missing posts.
// @author       half
// @match        https://warosu.org/*/thread/*
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // --- Injected CSS for styling the threaded view ---

GM_addStyle(`
    /* === CONFIGURATION VARIABLES === */
    :root {
        /* Font Settings */
        --warosu-font-scale: 1.8;
        --warosu-post-font-scale: 2.2;
        --warosu-font-color: #333333;
        --warosu-font-weight: 400;
        --warosu-font-weight-bold: 600;

        /* Background Colors */
        --warosu-bg-main: #ffffff;
        --warosu-bg-post: #f9f9f9;
        --warosu-bg-op: #e6f3ff;
        --warosu-bg-container: #ffffff;

        /* Post Sizing */
        --warosu-post-padding: 8px;
        --warosu-post-margin: 10px 0;
        --warosu-post-border-width: 4px;
        --warosu-post-border-radius: 4px;

        /* Reply Indentation */
        --warosu-indent-base: 15px;
        --warosu-indent-mobile: 12px;
    }

    /* === MAIN STYLES WITH VARIABLES === */
    .warosu-thread-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 10px;
        background: var(--warosu-bg-container) !important;
        font-size: calc(14px * var(--warosu-font-scale));
        color: var(--warosu-font-color);
        font-weight: var(--warosu-font-weight);
    }

    .warosu-post {
        margin: var(--warosu-post-margin) !important;
        padding: var(--warosu-post-padding) !important;
        border-left: var(--warosu-post-border-width) solid #ddd !important;
        background: var(--warosu-bg-post) !important;
        display: block !important;
        width: calc(100% - 20px) !important;
        box-sizing: border-box !important;
        border-radius: var(--warosu-post-border-radius) !important;
        font-size: calc(13px * var(--warosu-font-scale)) !important;
        color: var(--warosu-font-color) !important;
        font-weight: var(--warosu-font-weight) !important;
        line-height: 1.0 !important;
    }

    /* Level colors and indentation with variables */
    .warosu-post.level-0 {
        margin-left: 0px !important;
        border-left-color: #0066cc !important;
    }
    .warosu-post.level-1 {
        margin-left: calc(var(--warosu-indent-base) * 1) !important;
        border-left-color: #2d8a2f !important;
    }
    .warosu-post.level-2 {
        margin-left: calc(var(--warosu-indent-base) * 1.4) !important;
        border-left-color: #d4691a !important;
    }
    .warosu-post.level-3 {
        margin-left: calc(var(--warosu-indent-base) * 1.8) !important;
        border-left-color: #b02db0 !important;
    }
    .warosu-post.level-4 {
        margin-left: calc(var(--warosu-indent-base) * 2.2) !important;
        border-left-color: #c41e3a !important;
    }
    .warosu-post.level-5 {
        margin-left: calc(var(--warosu-indent-base) * 2.6) !important;
        border-left-color: #8b4513 !important;
    }
    .warosu-post.level-6 {
        margin-left: calc(var(--warosu-indent-base) * 3) !important;
        border-left-color: #4b0082 !important;
    }
    .warosu-post.level-7 {
        margin-left: calc(var(--warosu-indent-base) * 3.2) !important;
        border-left-color: #ff1493 !important;
    }
    .warosu-post.level-8 {
        margin-left: calc(var(--warosu-indent-base) * 3.5) !important;
        border-left-color: #00ced1 !important;
    }

    /* OP styling with variables */
    .warosu-post.op {
        background: var(--warosu-bg-op) !important;
        border-left-color: #0066cc !important;
        border-left-width: calc(var(--warosu-post-border-width) + 2px) !important;
        font-weight: var(--warosu-font-weight-bold) !important;
        margin-bottom: calc(var(--warosu-post-margin) + 5px) !important;
    }

    .warosu-post.op::before {
        content: "OP";
        display: inline-block;
        background: #0066cc;
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: calc(10px * var(--warosu-font-scale));
        font-weight: var(--warosu-font-weight-bold);
        margin-right: 8px;
        vertical-align: middle;
    }

    /* Text elements with font scaling */
    .warosu-post .postername {
        font-weight: var(--warosu-font-weight-bold) !important;
        color: #0066cc !important;
        font-size: calc(13px * var(--warosu-font-scale)) !important;
    }

    .warosu-post .postertrip {
        color: #228b22 !important;
        font-weight: var(--warosu-font-weight) !important;
        font-size: calc(13px * var(--warosu-font-scale)) !important;
    }

    .warosu-post .posttime {
        color: #999 !important;
        font-size: calc(11px * var(--warosu-font-scale)) !important;
        font-weight: var(--warosu-font-weight) !important;
    }

    .warosu-post .fileinfo {
        display: block !important;
        margin: 5px 0 !important;
        font-size: calc(11px * var(--warosu-font-scale)) !important;
        color: #666 !important;
        font-weight: var(--warosu-font-weight) !important;
    }
blockquote > p{
  margin: 0 !important;
}
    .warosu-post blockquote {
        margin: calc(10px * var(--warosu-font-scale)) 0 !important;
        padding: 0 !important;
        border: none !important;
        font-size: calc(13px * var(--warosu-font-scale) * var(--warosu-post-font-scale)) !important;
        line-height: 1.2 !important;
        color: var(--warosu-font-color) !important;
        font-weight: var(--warosu-font-weight) !important;
    }

    /* Level indicators with scaling */
    .warosu-level-indicator {
        display: inline-block !important;
        font-weight: var(--warosu-font-weight-bold) !important;
        font-size: calc(10px * var(--warosu-font-scale)) !important;
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
        font-size: calc(9px * var(--warosu-font-scale)) !important;
        font-weight: var(--warosu-font-weight-bold) !important;
        padding: 1px 4px !important;
        border-radius: 2px !important;
        margin-left: 5px !important;
        display: inline-block !important;
        vertical-align: middle !important;
    }

    /* Links with font scaling */
    .warosu-post a {
        color: #0066cc !important;
        text-decoration: underline !important;
        font-size: calc(13px * var(--warosu-font-scale)) !important;
        font-weight: var(--warosu-font-weight) !important;
    }

    .warosu-post a:hover {
        color: #0052a3 !important;
    }

    /* Images */
    .warosu-post img {
        max-width: 150px !important;
        height: auto !important;
        display: block !important;
        margin: calc(8px * var(--warosu-font-scale)) 0 !important;
        border: 1px solid #ddd !important;
        border-radius: 3px !important;
    }

    /* Controls and buttons with scaling */
    .warosu-controls {
        text-align: center;
        margin: 20px 0;
        padding: 10px;
        background: #f0f0f0;
        border-radius: 5px;
        font-size: calc(14px * var(--warosu-font-scale));
    }

    .warosu-btn {
        background: #0066cc;
        color: white;
        border: none;
        padding: 8px 16px;
        margin: 0 5px;
        cursor: pointer;
        border-radius: 4px;
        font-size: calc(13px * var(--warosu-font-scale));
        font-weight: var(--warosu-font-weight-bold);
    }

    .warosu-btn:hover {
        background: #0052a3;
    }

    .warosu-stats {
        font-size: calc(12px * var(--warosu-font-scale));
        color: #666;
        margin: 10px 0;
        text-align: center;
        font-weight: var(--warosu-font-weight);
    }
s.warosu-thread-container {
width: 920px !important;
margin: 0 !important;
}

    /* Mobile responsive with variables */
    @media (max-width: 768px) {
        .warosu-post.level-1 { margin-left: calc(var(--warosu-indent-mobile) * 1) !important; }
        .warosu-post.level-2 { margin-left: calc(var(--warosu-indent-mobile) * 2) !important; }
        .warosu-post.level-3 { margin-left: calc(var(--warosu-indent-mobile) * 3) !important; }
        .warosu-post.level-4 { margin-left: calc(var(--warosu-indent-mobile) * 4) !important; }
        .warosu-post.level-5 { margin-left: calc(var(--warosu-indent-mobile) * 5) !important; }
        .warosu-post.level-6 { margin-left: calc(var(--warosu-indent-mobile) * 6) !important; }
        .warosu-post.level-7 { margin-left: calc(var(--warosu-indent-mobile) * 7) !important; }
        .warosu-post.level-8 { margin-left: calc(var(--warosu-indent-mobile) * 8) !important; }

        .warosu-post img {
            max-width: 100px !important;
        }

        :root {
            --warosu-font-scale: 0.9; /* Smaller fonts on mobile */
            --warosu-post-padding: 10px; /* Less padding on mobile */
        }
    }

    /* Table layout fixes */
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

    .warosu-thread-container .doubledash {
        display: none !important;
    }
`);

    class WarosuThreader {
        constructor() {
            this.posts = new Map();
            this.postElements = new Map();
            this.quotedBy = new Map();
            this.originalContent = null;
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
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.start());
            } else {
                this.start();
            }
        }

        start() {
            this.originalContent = $('form#postform .content').html();
            this.extractPosts();
            this.buildQuoteMap();
            this.addControls();

            if (this.posts.size > 5) {
                this.threadConversation();
            }
        }

        // --- CORE LOGIC ---

        extractPosts() {
            this.posts.clear();
            this.postElements.clear();
            const threadIdMatch = window.location.pathname.match(/\/thread\/(\d+)/);
            if (!threadIdMatch) {
                console.error('[WarosuX] Could not determine thread ID from URL.');
                return;
            }
            const threadId = threadIdMatch[1];

            // Extract OP - it's a div.comment, not a .reply
            const $opPost = $(`.comment#p${threadId}`).not('.reply').first();
            if ($opPost.length) {
                this.posts.set(threadId, {
                    id: threadId,
                    element: $opPost,
                    isOP: true,
                    quotedPosts: this.extractQuotes($opPost)
                });
                this.postElements.set(threadId, $opPost);
                this.log(`📝 Found OP: ${threadId}`);
            } else {
                 this.log(`⚠️ OP with ID ${threadId} not found!`);
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
                        quotedPosts: this.extractQuotes($post)
                    });
                    this.postElements.set(postId, $post);
                }
            });
            this.log(`📊 Extracted ${this.posts.size} posts total.`);
        }

        extractPostId($post) {
            const id = $post.attr('id');
            if (id) return id.replace(/^p/, '');
            return null; // Simplified, as ID is reliable
        }

        extractQuotes($post) {
            const quotes = new Set();
            $post.find('blockquote a.backlink').each((i, elem) => {
                const href = $(elem).attr('href');
                const match = href?.match(/#p(\d+)/);
                if (match) quotes.add(match[1]);
            });
            return Array.from(quotes);
        }

        buildQuoteMap() {
            this.quotedBy.clear();
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

        buildConversationTree() {
            const tree = [];
            const processed = new Set();
            const threadId = window.location.pathname.match(/\/thread\/(\d+)/)?.[1];

            // 1. Start with the OP
            if (this.posts.has(threadId)) {
                const opNode = this.buildPostNode(threadId, processed, 0);
                if (opNode) tree.push(opNode);
            } else {
                this.log('⚠️ OP not in post map, cannot build tree from it.');
            }

            // 2. Add all other posts that haven't been processed yet
            // This catches orphan posts and replies to posts that might have been deleted.
            const sortedPosts = Array.from(this.posts.values()).sort((a,b) => parseInt(a.id) - parseInt(b.id));

            for (const post of sortedPosts) {
                if (!processed.has(post.id)) {
                    const node = this.buildPostNode(post.id, processed, 0);
                    if (node) tree.push(node);
                }
            }
            return tree;
        }

        buildPostNode(postId, processed, level) {
            if (processed.has(postId) || !this.posts.has(postId)) return null;

            processed.add(postId);
            const post = this.posts.get(postId);

            const node = { post: post, level: level, children: [] };

            const replies = this.quotedBy.get(postId) || [];
            const sortedReplies = replies.sort((a, b) => parseInt(a) - parseInt(b));

            sortedReplies.forEach(replyId => {
                const childNode = this.buildPostNode(replyId, processed, level + 1);
                if (childNode) {
                    node.children.push(childNode);
                }
            });

            return node;
        }

        // --- UI AND RENDERING ---

        renderThreadedPosts(tree, $container) {
            tree.forEach(node => {
                if (!node) return;
                const $cleanPost = this.createCleanPost(node.post.element, node.level, node.children.length);
                $container.append($cleanPost);

                if (node.children.length > 0) {
                    this.renderThreadedPosts(node.children, $container);
                }
            });
        }

        createCleanPost($originalPost, level, replyCount) {
            const postData = this.posts.get(this.extractPostId($originalPost));
            if (!postData) return $();

            const $cleanPost = $('<div>')
                .addClass('warosu-post')
                .addClass(`level-${Math.min(level, 8)}`)
                .attr('id', $originalPost.attr('id') + '-threaded');

             if (postData.isOP) {
                $cleanPost.addClass('op');
            }

            // Image
            const $imageLink = $originalPost.find('a[href*="/img/"]').first().clone();
            $imageLink.find('img').addClass('thumb');
            if ($imageLink.length) $cleanPost.append($imageLink);

            // Metadata
            const $label = $originalPost.find('label').first().clone();
            const $levelIndicator = $(`<span class="warosu-level-indicator">L${level}</span>`);
            const $collapseToggle = $(`<span class="warosu-collapse-toggle" title="Collapse/Expand Post">[–]</span>`);
            $label.prepend($levelIndicator, $collapseToggle);

            if (replyCount > 0) {
                const $quoteCount = $(`<span class="warosu-quote-count" title="${replyCount} replies">${replyCount}↓</span>`);
                $label.append($quoteCount);
            }
            $cleanPost.append($label);

            // Links (No., Reply, etc.)
            $cleanPost.append($originalPost.find('a.js[href*="javascript:insert"]').first().clone());
            $cleanPost.append($originalPost.find('a:contains("Reply"), a:contains("Original")').parent().clone());

            // Content
            $cleanPost.append($originalPost.find('blockquote').first().clone());

            return $cleanPost;
        }

        threadConversation() {
            this.log('🧵 Threading conversation...');
            const $container = $('<div class="warosu-thread-container"></div>');
            const tree = this.buildConversationTree();
            this.renderThreadedPosts(tree, $container);

            $('form#postform .content').empty().append($container);
            this.addFeatureEventListeners();

            this.isThreaded = true;
            $('#warosu-thread-btn').text('Original Order');
            this.log('✅ Threading complete.');
        }

        restoreOriginal() {
            this.log('🔄 Restoring original layout...');
            $('form#postform .content').html(this.originalContent);
            this.isThreaded = false;
            $('#warosu-thread-btn').text('Thread View');
        }

        addControls() {
            const controls = $(`
                <div class="warosu-controls">
                    <button class="warosu-btn" id="warosu-thread-btn">Thread View</button>
                    <button class="warosu-btn" id="warosu-debug-btn">Debug Info</button>
                    <div class="warosu-stats">
                        Posts: ${this.posts.size}
                    </div>
                </div>
            `);

            $('hr').first().after(controls);

            $('#warosu-thread-btn').click(() => this.isThreaded ? this.restoreOriginal() : this.threadConversation());
            $('#warosu-debug-btn').click(() => {
                this.debugMode = !this.debugMode;
                alert(`Debug mode is now ${this.debugMode ? 'ON' : 'OFF'}. Check the console.`);
                this.showDebugInfo();
            });
        }

        addFeatureEventListeners() {
            // Collapse feature
            $('.warosu-collapse-toggle').on('click', function(e) {
                e.stopPropagation();
                const $post = $(this).closest('.warosu-post');
                $post.toggleClass('collapsed');
                $(this).text($post.hasClass('collapsed') ? '[+]' : '[–]');
            });

            // Highlight feature
            $('.warosu-post').on('click', (e) => {
                if ($(e.target).is('a, a *, .warosu-collapse-toggle')) return;

                const $post = $(e.currentTarget);
                const postId = $post.attr('id').replace('-threaded', '').replace('p','');

                if ($post.hasClass('highlighted')) {
                    $('.warosu-post').removeClass('highlighted');
                } else {
                    $('.warosu-post').removeClass('highlighted');
                    this.highlightChain(postId);
                }
            });
        }

        highlightChain(startPostId) {
            const toHighlight = new Set();
            const findParents = (id) => {
                if (toHighlight.has(id)) return;
                toHighlight.add(id);
                const post = this.posts.get(id);
                post?.quotedPosts.forEach(findParents);
            };
             const findChildren = (id) => {
                if (toHighlight.has(id)) return;
                toHighlight.add(id);
                const replies = this.quotedBy.get(id) || [];
                replies.forEach(findChildren);
            };
            findParents(startPostId);
            findChildren(startPostId);
            toHighlight.forEach(id => $(`#p${id}-threaded`).addClass('highlighted'));
        }

        showDebugInfo() {
            if (!this.debugMode) return;
            console.log("--- WarosuX Debug Info ---");
            console.log(`Total posts extracted: ${this.posts.size}`);
            console.log("Posts Map:", this.posts);
            console.log("QuotedBy Map:", this.quotedBy);
            console.log("--- End Debug Info ---");
        }
    }

    // --- Script Initialization ---
    try {
        if ($('.comment').length > 0) {
            window.WarosuX = new WarosuThreader();
            console.log('🧵 WarosuX initialized successfully!');
        } else {
             console.log('[WarosuX] No posts found on page.');
        }
    } catch (error) {
        console.error('[WarosuX] An error occurred during initialization:', error);
    }

})();