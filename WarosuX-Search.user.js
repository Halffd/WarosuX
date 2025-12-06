// ==UserScript==
// @name         WarosuX Search & Expand
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Threading for Warosu with Search support and Reply Chain expansion
// @author       arc x
// @match        https://warosu.org/*/thread/*
// @match        https://warosu.org/*/?task=search*
// @match        https://warosu.org/*/search*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// ==/UserScript==

(function() {
    'use strict';

    class WarosuXEnhanced {
        constructor() {
            this.posts = new Map();
            this.postElements = new Map();
            this.quotedBy = new Map();
            this.isThreading = false;
            this.isSearchPage = this.detectSearchPage();
            this.expandedChains = new Set();
            this.allPostsExpanded = false;

            this.init();
        }

        detectSearchPage() {
            return window.location.search.includes('task=search') ||
                   window.location.pathname.includes('/search') ||
                   document.querySelector('h2') && document.querySelector('h2').textContent.includes('Search:');
        }

        init() {
            this.log('🚀 WarosuX Enhanced initializing...');

            // Add CSS
            this.addStyles();

            // Add controls
            this.addControls();

            if (this.isSearchPage) {
                this.log('📝 Search page detected');
                this.initSearchPage();
            } else {
                this.log('🧵 Thread page detected');
                this.initThreadPage();
            }

            this.log('✅ WarosuX Enhanced ready!');
        }

        addStyles() {
            GM_addStyle(`
                /* === CONFIGURATION VARIABLES === */
                :root {
                    --warosu-font-scale: 1.0;
                    --warosu-font-color: #333333;
                    --warosu-font-weight: 400;
                    --warosu-font-weight-bold: 600;
                    --warosu-bg-main: #ffffff;
                    --warosu-bg-post: #f9f9f9;
                    --warosu-bg-op: #e6f3ff;
                    --warosu-bg-container: #ffffff;
                    --warosu-post-padding: 12px;
                    --warosu-post-margin: 10px 0;
                    --warosu-post-border-width: 4px;
                    --warosu-post-border-radius: 4px;
                    --warosu-indent-base: 25px;
                    --warosu-indent-mobile: 15px;
                }

                /* Enhanced Controls */
                .warosuX-controls {
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 12px;
                    margin: 10px 0;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    text-align: center;
                }

                .warosuX-btn {
                    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    margin: 0 4px;
                    cursor: pointer;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 500;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 4px rgba(0,123,255,0.3);
                }

                .warosuX-btn:hover {
                    background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
                    box-shadow: 0 4px 8px rgba(0,123,255,0.4);
                    transform: translateY(-1px);
                }

                .warosuX-btn.active {
                    background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
                    box-shadow: 0 2px 4px rgba(40,167,69,0.3);
                }

                .warosuX-btn.expand {
                    background: linear-gradient(135deg, #17a2b8 0%, #117a8b 100%);
                    font-size: 11px;
                    padding: 4px 8px;
                    margin: 2px;
                }

                .warosuX-btn.expand:hover {
                    background: linear-gradient(135deg, #117a8b 0%, #0c5460 100%);
                }

                .warosuX-stats {
                    font-size: 12px;
                    color: #6c757d;
                    margin: 8px 0 0 0;
                    font-weight: 500;
                }

                /* Search Page Enhancements */
                .search-post {
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 6px;
                    margin: 10px 0;
                    padding: 12px;
                    position: relative;
                }

                .search-post .expand-chain {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                }

                .expanded-chain {
                    border-left: 4px solid #007bff;
                    margin-left: 20px;
                    padding-left: 15px;
                    background: #f0f8ff;
                }

                .chain-post {
                    background: #fff;
                    border: 1px solid #e9ecef;
                    border-radius: 4px;
                    margin: 8px 0;
                    padding: 10px;
                    font-size: 13px;
                }

                .chain-loading {
                    text-align: center;
                    color: #6c757d;
                    font-style: italic;
                    padding: 20px;
                }

                /* Threading Styles */
                .warosu-thread-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 10px;
                    background: var(--warosu-bg-container);
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
                    line-height: calc(1.4 * var(--warosu-font-scale)) !important;
                }

                /* Level indentation */
                .warosu-post.level-0 { margin-left: 0px !important; border-left-color: #0066cc !important; }
                .warosu-post.level-1 { margin-left: calc(var(--warosu-indent-base) * 1) !important; border-left-color: #2d8a2f !important; }
                .warosu-post.level-2 { margin-left: calc(var(--warosu-indent-base) * 2) !important; border-left-color: #d4691a !important; }
                .warosu-post.level-3 { margin-left: calc(var(--warosu-indent-base) * 3) !important; border-left-color: #b02db0 !important; }
                .warosu-post.level-4 { margin-left: calc(var(--warosu-indent-base) * 4) !important; border-left-color: #c41e3a !important; }
                .warosu-post.level-5 { margin-left: calc(var(--warosu-indent-base) * 5) !important; border-left-color: #8b4513 !important; }
                .warosu-post.level-6 { margin-left: calc(var(--warosu-indent-base) * 6) !important; border-left-color: #4b0082 !important; }
                .warosu-post.level-7 { margin-left: calc(var(--warosu-indent-base) * 7) !important; border-left-color: #ff1493 !important; }
                .warosu-post.level-8 { margin-left: calc(var(--warosu-indent-base) * 8) !important; border-left-color: #00ced1 !important; }

                .warosu-post.op {
                    background: var(--warosu-bg-op) !important;
                    border-left-color: #0066cc !important;
                    border-left-width: calc(var(--warosu-post-border-width) + 2px) !important;
                    font-weight: var(--warosu-font-weight-bold) !important;
                }

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
                    padding: 1px 4px !important;
                    border-radius: 2px !important;
                    margin-left: 5px !important;
                    display: inline-block !important;
                    vertical-align: middle !important;
                }

                /* Hide original posts when threading */
                .threading-active .comment:not(.warosu-post) {
                    display: none !important;
                }

                .threading-active table:not(.warosuX-controls table) {
                    display: none !important;
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .warosu-post.level-1 { margin-left: calc(var(--warosu-indent-mobile) * 1) !important; }
                    .warosu-post.level-2 { margin-left: calc(var(--warosu-indent-mobile) * 2) !important; }
                    .warosu-post.level-3 { margin-left: calc(var(--warosu-indent-mobile) * 3) !important; }
                    .warosu-post.level-4 { margin-left: calc(var(--warosu-indent-mobile) * 4) !important; }
                    .warosu-post.level-5 { margin-left: calc(var(--warosu-indent-mobile) * 5) !important; }
                    .warosu-post.level-6 { margin-left: calc(var(--warosu-indent-mobile) * 6) !important; }
                    .warosu-post.level-7 { margin-left: calc(var(--warosu-indent-mobile) * 7) !important; }
                    .warosu-post.level-8 { margin-left: calc(var(--warosu-indent-mobile) * 8) !important; }

                    :root {
                        --warosu-font-scale: 0.9;
                        --warosu-post-padding: 10px;
                    }
                }
            `);
        }

        addControls() {
            const $controls = $(`
                <div class="warosuX-controls">
                    ${this.isSearchPage ?
                        `<button class="warosuX-btn" id="expandAll">Expand All Posts</button>
                         <button class="warosuX-btn" id="collapseAll">Collapse All</button>` :
                        `<button class="warosuX-btn" id="toggleThreading">Thread View</button>
                         <button class="warosuX-btn" id="debugInfo">Debug Info</button>`
                    }
                    <div class="warosuX-stats" id="warosuXStats">Ready</div>
                </div>
            `);

            $('.content').prepend($controls);

            // Bind events
            if (this.isSearchPage) {
                $('#expandAll').click(() => this.expandAllPosts());
                $('#collapseAll').click(() => this.collapseAllPosts());
            } else {
                $('#toggleThreading').click(() => this.toggleThreading());
                $('#debugInfo').click(() => this.showDebugInfo());
            }
        }

        // === SEARCH PAGE METHODS ===
        initSearchPage() {
            this.enhanceSearchPosts();
            this.updateStats(`Found ${$('.comment.reply').length} search results`);
        }

        enhanceSearchPosts() {
            $('.comment.reply').each((i, elem) => {
                const $post = $(elem).closest('table');
                $post.addClass('search-post');

                const postId = this.extractPostId($(elem));
                if (postId) {
                    const $expandBtn = $(`
                        <button class="warosuX-btn expand expand-chain" data-post="${postId}">
                            📋 Chain
                        </button>
                    `);

                    $post.find('.comment.reply').first().append($expandBtn);
                    $expandBtn.click((e) => {
                        e.preventDefault();
                        this.toggleReplyChain(postId, $post);
                    });
                }
            });
        }
        async toggleReplyChain(postId, $postElement) {
            const chainId = `chain-${postId}`;

            if (this.expandedChains.has(chainId)) {
                // Collapse chain
                $postElement.find('.expanded-chain').remove();
                this.expandedChains.delete(chainId);
                $postElement.find('.expand-chain').text('📋 Chain');
            } else {
                // Expand chain
                this.expandedChains.add(chainId);
                $postElement.find('.expand-chain').text('⌛ Loading...');

                try {
                    await this.fetchAndDisplayReplyChain(postId, $postElement);
                } catch (error) {
                    this.log(`❌ Error fetching chain for ${postId}:`, error);
                    $postElement.find('.expand-chain').text('❌ Error');
                }
            }
        }

        async fetchAndDisplayReplyChain(postId, $postElement) {
            // Extract thread ID from the post link
            const $viewLink = $postElement.find('a[href*="/thread/"]').first();
            if (!$viewLink.length) {
                throw new Error('No thread link found');
            }

            const threadUrl = $viewLink.attr('href');
            const threadId = threadUrl.match(/\/thread\/(\d+)/)?.[1];

            if (!threadId) {
                throw new Error('Could not extract thread ID');
            }

            // Construct full thread URL
            const fullThreadUrl = `https://warosu.org${threadUrl}`;

            // Fetch thread content
            const threadHtml = await this.fetchUrl(fullThreadUrl);
            const $threadDoc = $(threadHtml);

            // Build reply chain
            const replyChain = this.buildReplyChainFromThread($threadDoc, postId);

            // Display chain
            const $chainContainer = $('<div class="expanded-chain">');

            if (replyChain.length === 0) {
                $chainContainer.html('<div class="chain-loading">No replies found</div>');
            } else {
                replyChain.forEach((post, index) => {
                    const $chainPost = $(`
                        <div class="chain-post">
                            <div class="chain-meta">
                                <strong>${post.name || 'Anonymous'}</strong>
                                ${post.trip ? `<span class="trip">${post.trip}</span>` : ''}
                                <span class="time">${post.time}</span>
                                <a href="${fullThreadUrl}#p${post.id}" target="_blank">#${post.id}</a>
                            </div>
                            <div class="chain-content">${post.content}</div>
                        </div>
                    `);
                    $chainContainer.append($chainPost);
                });
            }

            $postElement.append($chainContainer);
            $postElement.find('.expand-chain').text('📋 Collapse');
        }

        buildReplyChainFromThread($threadDoc, startPostId) {
            const posts = [];
            const postMap = new Map();
            const quotedBy = new Map();

            // Extract all posts from thread
            $threadDoc.find('.comment').each((i, elem) => {
                const $post = $(elem);
                const postId = this.extractPostId($post);

                if (postId) {
                    const post = {
                        id: postId,
                        element: $post,
                        name: this.extractName($post),
                        trip: this.extractTrip($post),
                        time: this.extractTime($post),
                        content: this.extractContent($post),
                        quotedPosts: this.extractQuotes($post)
                    };

                    postMap.set(postId, post);

                    // Build quoted-by relationships
                    post.quotedPosts.forEach(quotedId => {
                        if (!quotedBy.has(quotedId)) {
                            quotedBy.set(quotedId, []);
                        }
                        quotedBy.get(quotedId).push(postId);
                    });
                }
            });

            // Build reply chain starting from the post
            const visited = new Set();
            const collectReplies = (postId, level = 0) => {
                if (visited.has(postId) || level > 10) return; // Prevent infinite loops
                visited.add(postId);

                const replies = quotedBy.get(postId) || [];
                replies.forEach(replyId => {
                    const post = postMap.get(replyId);
                    if (post) {
                        posts.push(post);
                        collectReplies(replyId, level + 1);
                    }
                });
            };

            collectReplies(startPostId);

            // Sort by timestamp
            return posts.sort((a, b) => {
                const timeA = this.extractTimestamp(a.element);
                const timeB = this.extractTimestamp(b.element);
                return timeA - timeB;
            });
        }

        async fetchUrl(url) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: url,
                    onload: (response) => {
                        if (response.status === 200) {
                            resolve(response.responseText);
                        } else {
                            reject(new Error(`HTTP ${response.status}`));
                        }
                    },
                    onerror: (error) => reject(error),
                    ontimeout: () => reject(new Error('Request timeout'))
                });
            });
        }

        expandAllPosts() {
            const $expandBtns = $('.expand-chain');
            this.updateStats(`Expanding ${$expandBtns.length} posts...`);

            let expanded = 0;
            $expandBtns.each(async (i, btn) => {
                const $btn = $(btn);
                const postId = $btn.data('post');
                const $postElement = $btn.closest('.search-post');

                if (!this.expandedChains.has(`chain-${postId}`)) {
                    try {
                        await this.toggleReplyChain(postId, $postElement);
                        expanded++;
                        this.updateStats(`Expanded ${expanded}/${$expandBtns.length} posts`);

                        // Small delay to avoid overwhelming the server
                        await new Promise(resolve => setTimeout(resolve, 500));
                    } catch (error) {
                        this.log(`❌ Failed to expand ${postId}:`, error);
                    }
                }
            });

            $('#expandAll').addClass('active');
            this.allPostsExpanded = true;
        }

        collapseAllPosts() {
            $('.expanded-chain').remove();
            this.expandedChains.clear();
            $('.expand-chain').text('📋 Chain');
            $('#expandAll').removeClass('active');
            this.allPostsExpanded = false;
            this.updateStats('All posts collapsed');
        }

        // === THREAD PAGE METHODS ===
        initThreadPage() {
            this.extractPosts();
            this.buildQuoteRelationships();
        }

        toggleThreading() {
            if (this.isThreading) {
                this.showOriginalView();
            } else {
                this.showThreadedView();
            }
        }

        showThreadedView() {
            this.isThreading = true;
            $('body').addClass('threading-active');

            const tree = this.buildConversationTree();
            const $container = $('<div class="warosu-thread-container">');

            this.renderThreadedPosts(tree, $container, 0);

            $('.content').append($container);
            $('#toggleThreading').addClass('active').text('Original View');

            this.updateStats(`Threading: ${this.posts.size} posts in ${tree.length} conversations`);
        }

        showOriginalView() {
            this.isThreading = false;
            $('body').removeClass('threading-active');
            $('.warosu-thread-container').remove();
            $('#toggleThreading').removeClass('active').text('Thread View');
            this.updateStats('Original view restored');
        }

        // === COMMON UTILITY METHODS ===
        extractPostId($post) {
            const id = $post.attr('id');
            return id ? id.replace('p', '') : null;
        }

        extractName($post) {
            return $post.find('.postername').text().trim();
        }

        extractTrip($post) {
            return $post.find('.postertrip').text().trim();
        }

        extractTime($post) {
            return $post.find('.posttime').text().trim();
        }

        extractContent($post) {
            const $blockquote = $post.find('blockquote');
            return $blockquote.length ? $blockquote.html() : '';
        }

        extractQuotes($post) {
            const quotes = [];
            $post.find('a[href*="/post/"], .backlink').each((i, elem) => {
                const href = $(elem).attr('href') || '';
                const match = href.match(/(\d+)/);
                if (match) {
                    quotes.push(match[1]);
                }
            });
            return [...new Set(quotes)]; // Remove duplicates
        }

        extractTimestamp($post) {
            const $time = $post.find('.posttime');
            const timestamp = $time.attr('title');
            if (timestamp) {
                return parseInt(timestamp);
            }
            return parseInt(this.extractPostId($post)) || 0;
        }

        extractPosts() {
            const threadId = window.location.pathname.match(/\/thread\/(\d+)/)?.[1];

            // Extract OP
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
            }

            // Extract replies
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
                }
            });
        }

        buildQuoteRelationships() {
            this.posts.forEach(post => {
                post.quotedPosts.forEach(quotedId => {
                    if (!this.quotedBy.has(quotedId)) {
                        this.quotedBy.set(quotedId, []);
                    }
                    this.quotedBy.get(quotedId).push(post.id);
                });
            });
        }

        buildConversationTree() {
            const tree = [];
            const processed = new Set();

            // Find OP and add as root
            const threadId = window.location.pathname.match(/\/thread\/(\d+)/)?.[1];
            const opPost = this.posts.get(threadId);

            if (opPost) {
                const opNode = this.buildPostNode(opPost.id, processed, 0);
                if (opNode) tree.push(opNode);
            }

            // Add orphaned posts
            this.posts.forEach(post => {
                if (!processed.has(post.id) && !post.isOP && post.quotedPosts.length === 0) {
                    const node = this.buildPostNode(post.id, processed, 0);
                    if (node) tree.push(node);
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

            const replies = this.quotedBy.get(postId) || [];
            const sortedReplies = replies.sort((a, b) => {
                const postA = this.posts.get(a);
                const postB = this.posts.get(b);
                if (!postA || !postB) return 0;
                return this.extractTimestamp(postA.element) - this.extractTimestamp(postB.element);
            });

            sortedReplies.forEach(replyId => {
                if (!processed.has(replyId)) {
                    const childNode = this.buildPostNode(replyId, processed, level + 1);
                    if (childNode) node.children.push(childNode);
                }
            });

            return node;
        }

        renderThreadedPosts(tree, $container, level) {
            const sortedTree = tree.sort((a, b) => {
                if (a.post.isOP) return -1;
                if (b.post.isOP) return 1;
                return parseInt(a.post.id) - parseInt(b.post.id);
            });

            sortedTree.forEach(node => {
                if (!node) return;

                const $cleanPost = this.createCleanPost(node.post.element, node.level);

                if (node.post.isOP) {
                    $cleanPost.addClass('op');
                }

                const $levelIndicator = $(`<span class="warosu-level-indicator">L${node.level}</span>`);

                if (node.children.length > 0) {
                    const $quoteCount = $(`<span class="warosu-quote-count">${node.children.length}↓</span>`);
                    $levelIndicator.after($quoteCount);
                }

                $cleanPost.find('label').first().prepend($levelIndicator);
                $container.append($cleanPost);

                if (node.children.length > 0) {
                    this.renderThreadedPosts(node.children, $container, level + 1);
                }
            });
        }

        createCleanPost($originalPost, level) {
            const $cleanPost = $('<div>').addClass('warosu-post').addClass(`level-${Math.min(level, 8)}`);

            const postId = $originalPost.attr('id');
            if (postId) {
                $cleanPost.attr('id', postId + '-threaded');
            }

            // Copy all elements
            const $fileInfo = $originalPost.find('.fileinfo').first();
            if ($fileInfo.length) {
                $cleanPost.append($fileInfo.clone());
            }

            const $imageLink = $originalPost.find('a[href*="/img/"]').first();
            if ($imageLink.length) {
                const $img = $imageLink.find('img').clone();
                $img.css({
                    'max-width': '150px',
                    'height': 'auto',
                    'display': 'block',
                    'margin': '5px 0'
                });
                $cleanPost.append($img);
            }

            const $label = $originalPost.find('label').first().clone();
            $cleanPost.append($label);

            const $blockquote = $originalPost.find('blockquote').first().clone();
            if ($blockquote.length) {
                $cleanPost.append($blockquote);
            }

            return $cleanPost;
        }

        showDebugInfo() {
            const debugInfo = {
                'Total Posts': this.posts.size,
                'Quote Relationships': this.quotedBy.size,
                'Threading Active': this.isThreading,
                'Search Page': this.isSearchPage,
                'Expanded Chains': this.expandedChains.size,
                'Posts with Quotes': Array.from(this.posts.values()).filter(p => p.quotedPosts.length > 0).length,
                'Posts with Replies': this.quotedBy.size,
                'URL': window.location.href,
                'Thread ID': window.location.pathname.match(/\/thread\/(\d+)/)?.[1] || 'N/A'
            };

            let debugText = '🔍 WarosuX Debug Information:\n\n';
            for (const [key, value] of Object.entries(debugInfo)) {
                debugText += `${key}: ${value}\n`;
            }

            debugText += '\n📊 Post Details:\n';
            this.posts.forEach((post, id) => {
                const replies = this.quotedBy.get(id) || [];
                debugText += `${id}: ${post.quotedPosts.length} quotes, ${replies.length} replies\n`;
            });

            console.log(debugText);
            alert('Debug info logged to console. Press F12 to view.');
        }

        updateStats(message) {
            $('#warosuXStats').text(message);
            this.log(`📊 ${message}`);
        }

        log(...args) {
            console.log('[WarosuX]', ...args);
        }
    }

    // Initialize when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.WarosuX = new WarosuXEnhanced();
        });
    } else {
        window.WarosuX = new WarosuXEnhanced();
    }
})();