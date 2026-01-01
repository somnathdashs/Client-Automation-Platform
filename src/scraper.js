import { getJson } from 'serpapi';
import config from './config.js';

/**
 * Constructs Google search query
 * @param {string} niche - Business niche to search for
 * @returns {string} - Formatted Google search query
 */
/**
 * Constructs Google search query
 * Format: site:{platform} "{niche}" "{country}" "@{emailProvider}"
 */
export const buildSearchQuery = (platform, niche, country, emailProvider) => {
    return `site:${platform} "${niche}" "${country}" "@${emailProvider}"`;
};

/**
 * Searches Google using SerpAPI with pagination
 * @param {string} query - Search query
 * @param {number} maxPages - Maximum number of pages to fetch
 * @returns {Promise<Array>} - Array of search results
 */
export const searchGoogleWithSerpAPI = async (query, maxPages = 1) => {
    console.log(`🔍 Searching Google for: ${query}`);
    console.log(`   Fetching up to ${maxPages} pages...`);

    const allResults = [];

    try {
        for (let page = 0; page < maxPages; page++) {
            const params = {
                engine: 'google',
                q: query,
                api_key: config.serpapi.apiKey,
                num: 10, // Default to 10 for organic
                start: page * 10,
            };

            // Wrap callback-based getJson in a Promise
            const response = await new Promise((resolve, reject) => {
                try {
                    getJson(params, (json) => {
                        try {
                            if (!json) {
                                reject(new Error('SerpAPI returned empty response'));
                                return;
                            }
                            // Sometimes the API returns an error in the JSON response
                            if (json.error) {
                                reject(new Error(json.error));
                            } else {
                                resolve(json);
                            }
                        } catch (callbackError) {
                            reject(callbackError);
                        }
                    });
                } catch (e) {
                    reject(e);
                }
            });

            if (response.organic_results && response.organic_results.length > 0) {
                const results = response.organic_results.map(result => ({
                    title: result.title || '',
                    url: result.link || '',
                    snippet: result.snippet || '',
                }));

                allResults.push(...results);
                console.log(`   Page ${page + 1}: Found ${results.length} results`);
            } else {
                console.log(`   Page ${page + 1}: No more results`);
                break; // No more results, stop pagination
            }

            // Rate limiting between page requests
            if (page < maxPages - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        console.log(`   Total results: ${allResults.length}`);
        return allResults;

    } catch (error) {
        const errorMessage = error?.message || String(error);
        console.error(`❌ Error searching with SerpAPI: ${errorMessage}`);

        if (errorMessage.includes('Invalid API key')) {
            console.error('   Please check your SERPAPI_KEY in .env file');
        } else if (errorMessage.includes('rate limit')) {
            console.error('   Rate limit exceeded. You have 250/month and 50/hour limit.');
        }

        return [];
    }
};

/**
 * Searches for clients across configured parameters
 * @param {object} params - { niche, country, emailProvider, platforms }
 * @returns {Promise<Array>} - Array of all search results with niche info
 */
export const searchAllNiches = async (searchParams) => {
    const { niche, country, emailProvider, platforms } = searchParams;
    const allResults = [];

    // Parse platforms if comma-separated string
    const platformList = typeof platforms === 'string'
        ? platforms.split(',').map(p => p.trim()).filter(p => p)
        : platforms;

    console.log(`\n📊 Starting Search:`);
    console.log(`   Niche: ${niche}`);
    console.log(`   Country: ${country}`);
    console.log(`   Email: @${emailProvider}`);
    console.log(`   Platforms: ${platformList.join(', ')}\n`);

    for (const platform of platformList) {
        const query = buildSearchQuery(platform, niche, country, emailProvider);

        // Use a default max pages if not in config, or use config default
        const pagesToFetch = config.search?.maxPagesPerSearch || 1;

        const results = await searchGoogleWithSerpAPI(query, pagesToFetch);

        // Add context info to each result
        const enrichedResults = results.map(r => ({
            ...r,
            niche,
            platform,
            searchedAt: new Date().toISOString(),
        }));

        allResults.push(...enrichedResults);

        // Rate limiting between platform searches
        if (platformList.indexOf(platform) < platformList.length - 1) {
            const delay = config.rateLimit?.searchDelay || 2000;
            console.log(`   Waiting ${delay}ms before next search...\n`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    console.log(`\n✅ Search Summary:`);
    console.log(`   Total results collected: ${allResults.length}\n`);

    return allResults;
};
