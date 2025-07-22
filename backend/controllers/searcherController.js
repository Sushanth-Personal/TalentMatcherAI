const { Pinecone } = require('@pinecone-database/pinecone');
const Creator = require('../models/Creator');
const fetch = globalThis.fetch;
const { Groq } = require('groq-sdk');

// Initialize Pinecone and Groq clients
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index(process.env.PINECONE_INDEX, process.env.PINECONE_INDEX_HOST || 'https://talentsearch-8ez6h41.svc.aped-4627-b74a.pinecone.io');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Function to get coordinates from city name using Open-Meteo
async function getCoordinates(cityName) {
  try {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${data.message || 'Failed to fetch coordinates'}`);
    }
    if (!data.results || data.results.length === 0) {
      throw new Error(`No coordinates found for city: ${cityName}`);
    }
    return {
      latitude: data.results[0].latitude,
      longitude: data.results[0].longitude,
    };
  } catch (error) {
    console.error('Geocoding error:', error.stack);
    throw new Error(`Failed to get coordinates for ${cityName}`);
  }
}

// Function to parse and filter LLM response
function parseAndFilterLLMResponse(rawResponse, creatorIds) {
  try {
    // Attempt to parse the raw response directly
    let result = JSON.parse(rawResponse);
    if (Array.isArray(result) && result.every(item => 
      typeof item.id === 'string' &&
      typeof item.comment === 'string' &&
      typeof item.exclude === 'boolean' &&
      (item.exclusion_reason === 'none' || ['category', 'charges', 'experience', 'rating', 'workMode', 'budget'].includes(item.exclusion_reason))
    )) {
      // Ensure all IDs match input creatorIds
      const validIds = new Set(creatorIds.map(id => id.toString()));
      return result.filter(item => validIds.has(item.id));
    }

    // Try to extract JSON array if direct parsing fails
    const jsonMatch = rawResponse.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0]);
      if (Array.isArray(result) && result.every(item => 
        typeof item.id === 'string' &&
        typeof item.comment === 'string' &&
        typeof item.exclude === 'boolean' &&
        (item.exclusion_reason === 'none' || ['category', 'charges', 'experience', 'rating', 'workMode', 'budget'].includes(item.exclusion_reason))
      )) {
        const validIds = new Set(creatorIds.map(id => id.toString()));
        return result.filter(item => validIds.has(item.id));
      }
    }

    throw new Error('Invalid JSON structure: expected array of {id, comment, exclude, exclusion_reason} objects');
  } catch (error) {
    console.error('JSON parse error (final check):', error.message);
    // Return default result for all creators
    return creatorIds.map(id => ({
      id: id.toString(),
      comment: 'Included by default due to response parsing error.',
      exclude: false,
      exclusion_reason: 'none',
    }));
  }
}

// Function to perform final check on top creators
async function finalCheck(query, creators, targetCategory) {
  if (!targetCategory || targetCategory === 'Not detected') {
    return creators.map(creator => ({
      id: creator._id.toString(),
      comment: 'No category specified, included based on semantic relevance.',
      exclude: false,
      exclusion_reason: 'none',
    }));
  }

  try {
    const profiles = creators.map(creator => ({
      id: creator._id.toString(),
      serviceDescription: creator.serviceDescription || '',
      category: creator.category || '',
      preferredGigTypes: creator.preferredGigTypes || [],
      workMode: creator.workMode || 'onsite',
      charges: creator.charges,
      experience: creator.experience,
    }));

    console.log('Profiles for final check:', profiles);

    const prompt = `
      Output *only* a JSON array of objects: [{"id": "id1", "comment": "Reason", "exclude": false, "exclusion_reason": "none"}, ...].
      No extra text, comments, or formatting (e.g., no \`\`\`json).
      Role: Decision-making and ranking AI for top 3 talent profiles.
      Task: Evaluate profiles for relevance to query "${query}" and category "${targetCategory}".
      Rules:
      - Each object must have:
        - id: Profile ID.
        - comment: 1-2 lines on selection/exclusion and rank (based on query, category, workMode, budget, experience).
        - exclude: true only if category seriously mismatches (e.g., Baker for Photography).
        - exclusion_reason: "none" or one of ["category", "charges", "experience", "rating", "workMode", "budget"].
      - Check if category or preferredGigTypes match "${targetCategory}".
      - Assess serviceDescription for query alignment.
      - Comment on rank (index-based) and priorities (e.g., budget, workMode).
      - Currency in Rs.
      Profiles:
      ${profiles.map((profile, index) => `
        Profile ${index + 1} (Rank ${index + 1}):
        ID: "${profile.id}"
        Service Description: "${profile.serviceDescription}"
        Category: "${profile.category}"
        Preferred Gig Types: "${profile.preferredGigTypes.join(', ')}"
        Work Mode: "${profile.workMode}"
        Charges: ${profile.charges}
        Experience: ${profile.experience}
      `).join('\n')}
    `;

    console.log('Prompt:', prompt);
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192',
      temperature: 0.5,
      max_tokens: 500,
      top_p: 1,
      stream: false,
    });

    const rawResponse = chatCompletion.choices[0].message.content;
    console.log('Groq raw response (final check):', rawResponse);

    // Parse and validate response
    const result = parseAndFilterLLMResponse(rawResponse, creators.map(c => c._id));
    console.log('Final check result:', result);
    return result;
  } catch (error) {
    console.error('Groq final check error:', error.stack);
    return creators.map(creator => ({
      id: creator._id.toString(),
      comment: 'Included by default due to final check error.',
      exclude: false,
      exclusion_reason: 'none',
    }));
  }
}

// Function to score creators based on user priorities and Pinecone semantic scores
function scoreCreators(creators, pineconeScores, priorities, queryBudget, queryExperience, queryResponseTime, queryWorkMode) {
  const budgetWeight = priorities.includes('budget') ? 0.3 : 0.2;
  const responseTimeWeight = priorities.includes('responseTime') ? 0.3 : 0.15;
  const experienceWeight = priorities.includes('experience') ? 0.2 : 0.1;
  const ratingsWeight = priorities.includes('ratings') ? 0.2 : 0.1;
  const completionRateWeight = priorities.includes('completionRate') ? 0.2 : 0.1;
  const workModeWeight = priorities.includes('workMode-onsite') || priorities.includes('workMode-remote') ? 0.3 : 0.15;
  const semanticWeight = 1.2;

  const maxBudget = queryBudget ? parseFloat(queryBudget.replace('₹', '')) : 100000;
  const maxResponseTime = queryResponseTime || 48;
  const maxExperience = queryExperience || 10;
  const maxRatings = 5;
  const maxCompletionRate = 100;

  return creators
    .map((creator, index) => {
      console.log('Creator:', creator.name, 'Charges:', creator.charges, 'Query Budget:', queryBudget, 'Experience:', creator.experience, 'Query Experience:', queryExperience, 'Work Mode:', creator.workMode, 'Query Work Mode:', queryWorkMode);
      const semanticScore = pineconeScores[creator._id.toString()] || 0;
      const budgetValue = queryBudget ? parseFloat(queryBudget.replace('₹', '')) : null;
      const budgetScore = budgetValue && creator.charges <= budgetValue ? 0.3 : (budgetValue ? Math.max(-0.3, -Math.abs(1 - budgetValue / creator.charges)) : 0);
      const responseTimeScore = queryResponseTime && creator.responseTime
        ? Math.max(0, 1 - creator.responseTime / maxResponseTime)
        : 0.5;
      const experienceScore = queryExperience && creator.experience
        ? (creator.experience >= queryExperience ? 0.2 : Math.max(-0.2, -Math.abs(1 - creator.experience / queryExperience)))
        : 0;
      const ratingsScore = creator.ratingsAverage ? creator.ratingsAverage / maxRatings : 0.5;
      const completionRateScore = creator.completionRate ? creator.completionRate / maxCompletionRate : 0.5;
      const workModeScore = queryWorkMode && creator.workMode
        ? (creator.workMode === queryWorkMode || creator.workMode === 'hybrid' ? 0.3 : -0.3)
        : 0.5;

      console.log('Scores:', { semanticScore, budgetScore, responseTimeScore, experienceScore, ratingsScore, completionRateScore, workModeScore });

      const totalScore =
        (semanticScore * semanticWeight) +
        (budgetScore * budgetWeight) +
        (responseTimeScore * responseTimeWeight) +
        (experienceScore * experienceWeight) +
        (ratingsScore * ratingsWeight) +
        (completionRateScore * completionRateWeight) +
        (workModeScore * workModeWeight);

      return { creator, score: totalScore, originalIndex: index };
    })
    .sort((a, b) => b.score - a.score || a.originalIndex - b.originalIndex)
    .slice(0, 3)
    .map(item => item.creator);
}

// Search talents endpoint
exports.searchTalents = async (req, res) => {
  try {
    const { query, location, budget, category, experience, workMode, responseTime, priorities } = req.body;
    console.log('Search request:', { query, location, budget, category, experience, workMode, responseTime, priorities, user: req.user });
    if (!query) return res.status(400).json({ message: 'Query is required' });

    // Validate priorities
    const validPriorities = ['budget', 'responseTime', 'experience', 'ratings', 'completionRate', 'workMode-onsite', 'workMode-remote'];
    const sanitizedPriorities = Array.isArray(priorities) ? priorities.filter(p => validPriorities.includes(p)) : [];

    // Initialize Pinecone namespace
    const talentIndex = index.namespace('__default__');

    // Prepare geographic filter
    let filter = {};
    if (location) {
      try {
        const coordinates = await getCoordinates(location);
        filter = {
          latitude: { $gte: coordinates.latitude - 2, $lte: coordinates.latitude + 2 },
          longitude: { $gte: coordinates.longitude - 2, $lte: coordinates.longitude + 2 },
        };
      } catch (error) {
        console.error('Geocoding failed:', error.message);
      }
    }

    // Perform Pinecone search
    const results = await talentIndex.searchRecords({
      query: {
        topK: 20,
        inputs: { text: `${query} ${category ? 'category: ' + category : ''} ${workMode ? 'workMode: ' + workMode : ''}` },
        includeMetadata: true,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
      },
    });

    console.log('Pinecone search results:', results.result.hits);

    // Create Pinecone scores object and fetch MongoDB creators
    const pineconeScores = results.result.hits.reduce((acc, hit) => {
      acc[hit._id] = hit._score || 0;
      return acc;
    }, {});
    const creatorIds = results.result.hits.map(match => match._id);
    let creators = await Creator.find({ _id: { $in: creatorIds } });
    console.log('MongoDB creators found:', creators.length);

    // Preserve Pinecone order
    creators = creatorIds
      .map(id => creators.find(creator => creator._id.toString() === id))
      .filter(creator => creator);

    if (creators.length === 0) {
      return res.status(200).json({ message: 'No results found', creators: [], finalCheck: [] });
    }

    // Apply hard filters
    let filteredQuery = Creator.find({ _id: { $in: creators.map(creator => creator._id) } });
  
 
    creators = await filteredQuery.exec();
   

    if (creators.length === 0) {
      return res.status(200).json({ message: 'No results found after hard filtering', creators: [], finalCheck: [] });
    }

    // Score top creators
    const topCreators = scoreCreators(creators, pineconeScores, sanitizedPriorities, budget, experience, responseTime, workMode);
    console.log('Top 3 creators after scoring:', topCreators.length);

    if (topCreators.length === 0) {
      return res.status(200).json({ message: 'No results found after scoring', creators: [], finalCheck: [] });
    }

    // Perform final check
    const finalCheckResults = await finalCheck(
      `${query}, Requested workmode: ${workMode ? workMode : 'None'}, priorities: ${priorities ? priorities.join(', ') : 'No priorities'}`,
      topCreators,
      category
    );
    console.log('Final check results:', finalCheckResults);

    // Filter creators based on finalCheckResults
    const finalCreatorIds = finalCheckResults
      .filter(profile => !profile.exclude || profile.exclusion_reason !== 'category')
      .map(result => result.id);
    const finalCreators = topCreators.filter(creator => finalCreatorIds.includes(creator._id.toString()));

    res.json({
      message: 'Search completed',
      creators: finalCreators,
      finalCheck: finalCheckResults,
    });
  } catch (error) {
    console.error('Search error:', error.stack);
    if (error.status === 401) {
      return res.status(401).json({ message: 'Unauthorized: Invalid or missing Pinecone API key' });
    }
    res.status(500).json({ message: 'Search error', error: error.message });
  }
};

// Test Pinecone connectivity
exports.testPinecone = async (req, res) => {
  try {
    const stats = await index.describeIndexStats();
    res.json({ message: 'Pinecone connection successful', stats });
  } catch (error) {
    console.error('Pinecone test error:', error.stack);
    res.status(500).json({ message: 'Pinecone test failed', error: error.message });
  }
};