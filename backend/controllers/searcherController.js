const { Pinecone } = require('@pinecone-database/pinecone');
const Creator = require('../models/Creator');
const fetch = globalThis.fetch;
const { Groq } = require('groq-sdk');

// Initialize Pinecone and Groq clients
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index(process.env.PINECONE_INDEX, process.env.PINECONE_INDEX_HOST || 'https://talentsearch-8ez6h41.svc.aped-4627-b74a.pinecone.io');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Function to extract location, budget, category, experience, and responseTime
async function extractQueryDetails(query) {
  try {
    const prompt = `
      You are a JSON extraction tool. Extract the location (city name), budget (amount), category (e.g., "Photography", "Content Writing"), experience (years, e.g., "5 years"), and responseTime (hours, e.g., "24 hours" or "fast response") from the query below. Return *only* a valid JSON object with "location", "budget", "category", "experience", and "responseTime" fields. Set fields to null if not found. Extract the location only if explicitly mentioned with indicators like "in", "near", or "at" (e.g., "in Lucknow"). Extract the category exactly as mentioned unless vague (e.g., "portraits" maps to "Photography"). If the category is vague, map to the closest match from: ["Photography", "Content Writing", "Content Creation", "3D Modeling", "Graphic Design"]. If no match, set category to null. For experience, extract numeric years (e.g., "5 years" → 5). For responseTime, extract numeric hours (e.g., "24 hours" → 24) or map "fast response" to 24. Do not include explanatory text.
      Query: "${query}"
      Examples:
      - Query: "Need a photographer in Lucknow for ₹75000 with 5 years experience, fast response" → {"location": "Lucknow", "budget": "₹75000", "category": "Photography", "experience": 5, "responseTime": 24}
      - Query: "Best photographer within 75000 budget" → {"location": null, "budget": "₹75000", "category": "Photography", "experience": null, "responseTime": null}
      - Query: "Content writer in Mumbai with 3 years experience" → {"location": "Mumbai", "budget": null, "category": "Content Writing", "experience": 3, "responseTime": null}
      - Query: "Need candid portraits" → {"location": null, "budget": null, "category": "Photography", "experience": null, "responseTime": null}
      Output:
    `;
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192',
      temperature: 0.2,
      max_tokens: 150,
      top_p: 1,
      stream: false,
    });

    const rawResponse = chatCompletion.choices[0].message.content;
    console.log('Groq raw response (extract):', rawResponse);

    let result;
    try {
      result = JSON.parse(rawResponse);
      if (!result || typeof result !== 'object' || !('location' in result) || !('budget' in result) || !('category' in result) || !('experience' in result) || !('responseTime' in result)) {
        throw new Error('Invalid JSON structure: missing required fields');
      }
    } catch (parseError) {
      console.error('JSON parse error (extract):', parseError.message);
      const jsonMatch = rawResponse.match(/{[\s\S]*}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from Groq');
      }
    }

    console.log('Parsed result (extract):', result);
    return {
      location: typeof result.location === 'string' ? result.location : null,
      budget: typeof result.budget === 'string' ? result.budget : null,
      category: typeof result.category === 'string' ? result.category : null,
      experience: typeof result.experience === 'number' ? result.experience : null,
      responseTime: typeof result.responseTime === 'number' ? result.responseTime : null,
    };
  } catch (error) {
    console.error('Groq extraction error:', error.stack);
    return { location: null, budget: null, category: null, experience: null, responseTime: null };
  }
}

// Function to filter MongoDB creators by category
async function filterByCategory(creators, targetCategory) {
  if (!targetCategory || targetCategory === 'Not detected') {
    return creators; // No category filter if not specified
  }

  try {
    // Construct a single prompt with all creators
    const profiles = creators.map(creator => ({
      id: creator._id.toString(),
      serviceDescription: creator.serviceDescription || '',
      category: creator.category || '',
    }));

    console.log('Profiles for category filtering:', profiles);

    const prompt = `
      You are a category classification tool. Determine which talent profiles match the category "${targetCategory}". For each profile, base your decision primarily on the category field matching "${targetCategory}" exactly. Use the service description for context only if the category field is missing or ambiguous. Return *only* a JSON array containing the IDs of profiles that match the category. Do not include explanatory text.
      Profiles:
      ${profiles.map((profile, index) => `
        Profile ${index + 1}:
        - ID: "${profile.id}"
        - Service Description: "${profile.serviceDescription}"
        - Category: "${profile.category}"
      `).join('\n')}
      Output: ["id1", "id2", ...] ( Don't add any comments at the beginning or end)
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192',
      temperature: 0.5,
      max_tokens: 200,
      top_p: 1,
      stream: false,
    });

    const rawResponse = chatCompletion.choices[0].message.content;
    console.log('Groq raw response (filter):', rawResponse);

    let result;
    try {
      result = JSON.parse(rawResponse);
      if (!Array.isArray(result)) {
        throw new Error('Invalid JSON structure: expected an array of IDs');
      }
    } catch (parseError) {
      console.error('JSON parse error (filter):', parseError.message);
      const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from Groq');
      }
    }

    // Filter creators based on matching IDs
    const filteredCreators = creators.filter(creator => result.includes(creator._id.toString()));
    console.log('LLaMA filtered creators:', filteredCreators.length);
    return filteredCreators;
  } catch (error) {
    console.error('Groq filtering error:', error.stack);
    return []; // Return empty array on error
  }
}

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

// Function to score creators based on user priorities and Pinecone semantic scores
function scoreCreators(creators, pineconeScores, priorities, queryBudget, queryExperience, queryResponseTime) {
  const budgetWeight = priorities.includes('budget') ? 0.3 : 0.2;
  const responseTimeWeight = priorities.includes('responseTime') ? 0.3 : 0.15;
  const experienceWeight = priorities.includes('experience') ? 0.2 : 0.1;
  const ratingsWeight = priorities.includes('ratings') ? 0.2 : 0.1;
  const completionRateWeight = priorities.includes('completionRate') ? 0.2 : 0.1;
  const semanticWeight = 1.2;

  const maxBudget = queryBudget ? parseFloat(queryBudget.replace('₹', '')) : 100000;
  const maxResponseTime = queryResponseTime || 48;
  
  const maxExperience = queryExperience|| 10;
  const maxRatings = 5;
  const maxCompletionRate = 100;

  return creators
    .map((creator, index) => {
      console.log(creator.name, creator.charges, queryBudget, creator.experience,queryExperience);
      const semanticScore = pineconeScores[creator._id.toString()] || 0;
      queryBudget = queryBudget?.replace('₹', '');
      const budgetScore = (creator.charges < queryBudget ) ? 0.3 : -(1-queryBudget/creator.charges);
      const responseTimeScore = queryResponseTime
        ? Math.max(0, 1 - creator.responseTime / maxResponseTime)
        : 1;
        
        const actualExprience = parseInt(creator.experience.replace(' years',''));
        
      const experienceScore = ( actualExprience >= queryExperience)? 0.2 : -(1-actualExprience/queryExperience);
      const ratingsScore = creator.ratingsAverage ? creator.ratingsAverage / maxRatings : 1;
      const completionRateScore = creator.completionRate ? creator.completionRate / maxCompletionRate : 1;
console.log(pineconeScores[creator._id.toString()],semanticScore,budgetScore,responseTimeScore, experienceScore, ratingsScore, completionRateScore)
      const totalScore =
        (semanticScore * semanticWeight) +
        (budgetScore * budgetWeight) +
        (responseTimeScore * responseTimeWeight) +
        (experienceScore * experienceWeight) +
        (ratingsScore * ratingsWeight) +
        (completionRateScore * completionRateWeight);

      return { creator, score: totalScore, originalIndex: index };
    })
    .sort((a, b) => b.score - a.score || a.originalIndex - b.originalIndex)
    .slice(0, 3)
    .map(item => item.creator);
}

// New endpoint to extract query details
exports.extractData = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: 'Query is required' });

    const extracted = await extractQueryDetails(query);
    res.json(extracted);
  } catch (error) {
    console.error('Extract error:', error.stack);
    res.status(500).json({ message: 'Extraction error', error: error.message });
  }
};

// Search talents endpoint
exports.searchTalents = async (req, res) => {
  try {
    const { query, location, budget, category, experience, responseTime, priorities } = req.body;
    console.log('Search request:', { query, location, budget, category, experience, responseTime, priorities, user: req.user });
    if (!query) return res.status(400).json({ message: 'Query is required' });

    // Initialize Pinecone namespace
    const talentIndex = index.namespace('__default__');

    // Prepare geographic filter for Pinecone
    let filter = {};
    if (location && location !== 'Not detected') {
      try {
        const coordinates = await getCoordinates(location);
        filter = {
          latitude: {
            $gte: coordinates.latitude - 2,
            $lte: coordinates.latitude + 2,
          },
          longitude: {
            $gte: coordinates.longitude - 2,
            $lte: coordinates.longitude + 2,
          },
        };
      } catch (error) {
        console.error('Geocoding failed:', error.message);
        // Continue without geographic filter
      }
    }

    // Perform Pinecone search
    const results = await talentIndex.searchRecords({
      query: {
        topK: 10,
        inputs: { text: `${query} category: ${category} `},
        includeMetadata: true,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
      },
    });

    console.log('Pinecone search results:', results.result.hits);

    // Step 1: Create Pinecone scores object and fetch MongoDB creators
    const pineconeScores = results.result.hits.reduce((acc, hit) => {
      acc[hit._id] = hit._score || 0;
      return acc;
    }, {});
    const creatorIds = results.result.hits.map(match => match._id);
    let creatorsQuery = Creator.find({ _id: { $in: creatorIds } });
    let creators = await creatorsQuery.exec();
    console.log('MongoDB creators found:', creators.length);

    // Preserve Pinecone order
    creators = creatorIds
      .map(id => creators.find(creator => creator._id.toString() === id))
      .filter(creator => creator);

    // If no creators found, return empty
    if (creators.length === 0) {
      return res.status(200).json({ message: 'No results found', creators: [] });
    }

    // Step 2: Filter by category
    // creators = await filterByCategory(creators, category);
    // console.log('Creators after category filtering:', creators.length);

    // If no results after category filtering, return empty
    // if (creators.length === 0) {
    //   return res.status(200).json({ message: 'No results found after category filtering', creators: [] });
    // }

    // Step 3: Apply hard filters
    let filteredQuery = Creator.find({ _id: { $in: creators.map(creator => creator._id) } });

    // if (budget) {
    //   const budgetValue = parseFloat(budget.replace('₹', ''));
    //   filteredQuery = filteredQuery.where('charges').lte(budgetValue);
    // }
    // if (experience) {
    //   if (isNaN(experience)) {
    //     const experienceValue = parseFloat(experience.replace(' years', '')) || experience;
    //   }

    //   filteredQuery = filteredQuery.where('experience').gte(experience);
    // }
    // if (responseTime) {
    //   filteredQuery = filteredQuery.where('responseTime').lte(responseTime);
    // }

    creators = await filteredQuery.exec();
    console.log('Creators after hard filters:', creators.length);

    // If no results after hard filtering, return empty
    if (creators.length === 0) {
      return res.status(200).json({ message: 'No results found after hard filtering', creators: [] });
    }

    // Step 4: Score and return top 3
    const topCreators = scoreCreators(creators, pineconeScores, priorities || [], budget, experience, responseTime);
    console.log('Top 3 creators after scoring:', topCreators.length);

    if (topCreators.length === 0) {
      return res.status(200).json({ message: 'No results found after scoring', creators: [] });
    }

    res.json({ message: 'Search completed', creators: topCreators });
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

