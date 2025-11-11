const express = require('express');
const { OpenAI } = require('openai');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const port = 3001; // Choose a different port than Docusaurus

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to read all markdown files from the docs directory
async function loadBookContent() {
  const docsPath = path.join(__dirname, '..', 'docs'); // Adjust path to your docs directory
  let fullContent = '';

  const readDirRecursive = (currentPath) => {
    const files = fs.readdirSync(currentPath);
    files.forEach(file => {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        readDirRecursive(filePath);
      } else if (filePath.endsWith('.md') || filePath.endsWith('.mdx')) {
        fullContent += fs.readFileSync(filePath, 'utf8') + '\n\n---\n\n';
      }
    });
  };

  readDirRecursive(docsPath);
  return fullContent;
}

let bookContent = '';
loadBookContent().then(content => {
  bookContent = content;
  console.log('Book content loaded for AI agent.');
}).catch(err => {
  console.error('Failed to load book content:', err);
});

// Simple function to get relevant chunks from a larger text
function getRelevantChunks(question, context, maxTokens = 1000) {
  const paragraphs = context.split(/\n\s*\n/); // Split by paragraphs
  const keywords = question.toLowerCase().split(/\s+/).filter(word => word.length > 2);

  let relevantChunks = [];
  let currentTokens = 0;

  for (const paragraph of paragraphs) {
    const paragraphLower = paragraph.toLowerCase();
    const paragraphTokens = paragraph.split(/\s+/).length; // Estimate tokens by word count

    // Check if paragraph contains any keywords
    const isRelevant = keywords.some(keyword => paragraphLower.includes(keyword));

    if (isRelevant || relevantChunks.length < 2) { // Always include first few paragraphs for general context
      if (currentTokens + paragraphTokens <= maxTokens) {
        relevantChunks.push(paragraph);
        currentTokens += paragraphTokens;
      } else if (relevantChunks.length === 0) { // If even the first relevant chunk exceeds maxTokens, take a substring
        relevantChunks.push(paragraph.substring(0, maxTokens * 4)); // Rough char estimate for tokens
        currentTokens = maxTokens;
      }
    }
    if (currentTokens >= maxTokens) break;
  }
  return relevantChunks.join('\n\n');
}


app.post('/api/ask-agent', async (req, res) => {
  const { question, pageContent } = req.body; // Receive pageContent

  if (!question) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  try {
    let contextToUse = bookContent; // Default to full book content
    if (pageContent && pageContent.length > 0) {
      contextToUse = pageContent; // Use page-specific content if available
    }

    // Get only the most relevant chunks from the context
    const relevantContext = getRelevantChunks(question, contextToUse, 1500); // Limit context to ~1500 tokens

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Or another suitable model
      messages: [
        { role: "system", content: "You are an expert assistant for a book. Answer questions based *only* on the provided content. If the answer is not in the provided content, state that you don't have enough information from the current context to answer." },
        { role: "system", content: `Provided Content:\n${relevantContext}` }, // Use dynamic relevant context
        { role: "user", content: question },
      ],
      max_tokens: 500,
    });

    res.json({ answer: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    // Provide more specific error details to the frontend if possible (for debugging)
    if (error.response && error.response.data && error.response.data.error) {
      res.status(500).json({ error: `Failed to get answer from AI agent: ${error.response.data.error.message}` });
    } else {
      res.status(500).json({ error: 'Failed to get answer from AI agent. Please ensure the server is running and your API key is valid.' });
    }
  }
});

app.listen(port, () => {
  console.log(`AI Agent server listening at http://localhost:${port}`);
});
