/**
 * Email extraction and validation utilities
 */

// Comprehensive email regex pattern
const EMAIL_REGEX = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid
 */
export const isValidEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
};

/**
 * Extracts email addresses from text
 * @param {string} text - Text to extract emails from
 * @returns {Array<string>} - Array of unique email addresses
 */
export const extractEmails = (text) => {
    if (!text) return [];

    const matches = text.match(EMAIL_REGEX) || [];
    const uniqueEmails = [...new Set(matches)];

    return uniqueEmails.filter(isValidEmail);
};

/**
 * Determines platform from URL
 * @param {string} url - URL to analyze
 * @returns {string} - Platform name
 */
export const getPlatformFromUrl = (url) => {
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('facebook.com')) return 'facebook';
    if (url.includes('x.com') || url.includes('twitter.com')) return 'x';
    return 'unknown';
};

/**
 * Extracts potential business name from title or snippet
 * @param {string} title - Page title
 * @param {string} snippet - Page snippet
 * @returns {string} - Extracted name or empty string
 */
export const extractBusinessName = (title, snippet) => {
    // Try to extract name from title (usually before platform name)
    const titleParts = title.split(/[-|•@]/);
    if (titleParts.length > 0) {
        return titleParts[0].trim();
    }

    return '';
};

/**
 * Processes search results and extracts client information
 * @param {Array} searchResults - Raw search results
 * @returns {Array} - Processed client data with emails
 */
export const processSearchResults = (searchResults) => {
    const clients = [];
    const seenEmails = new Set();

    for (const result of searchResults) {
        const combinedText = `${result.title} ${result.snippet} ${result.url}`;
        const emails = extractEmails(combinedText);

        for (const email of emails) {
            // Skip duplicates
            if (seenEmails.has(email.toLowerCase())) {
                continue;
            }

            seenEmails.add(email.toLowerCase());

            const client = {
                email: email.toLowerCase(),
                name: extractBusinessName(result.title, result.snippet),
                niche: result.niche,
                platform: getPlatformFromUrl(result.url),
                profileUrl: result.url,
                foundDate: new Date().toISOString(),
                snippet: result.snippet.substring(0, 200), // Keep snippet for context
            };

            clients.push(client);
        }
    }

    console.log(`📧 Extracted ${clients.length} unique email addresses`);
    return clients;
};
