// Function to handle AI test case generation
export async function generateAITestCases(prompt: string, testType: string, count: number) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY environment variable is not set");
  }
  
  try {
    const apiKey = process.env.GROQ_API_KEY;
    
    // System prompt instructs the model how to create test cases
    const systemPrompt = `You are a test case generation assistant. Create ${count} detailed test cases for the following requirements, focusing on ${testType} tests. Each test case should include:
1. A specific title
2. A brief description
3. Numbered steps with expected results
4. An overall expected result
5. A priority level (critical, high, medium, or low)`;

    // User prompt includes the user's requirements and the expected format
    const userPrompt = `Requirements: ${prompt}

Format each test case as a JSON object with the following structure:
{
  "title": "Test Case Title",
  "description": "Brief description of the test case",
  "steps": [
    {
      "description": "Step 1 description",
      "expected_result": "Expected result for step 1"
    },
    {
      "description": "Step 2 description", 
      "expected_result": "Expected result for step 2"
    }
  ],
  "expected_result": "Overall expected result",
  "priority": "high/medium/low",
  "type": "${testType}"
}

Return the output as a JSON array containing ${count} test cases.`;

    // Call the Groq API directly from the server
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${error}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content returned from Groq API');
    }

    // Extract the JSON array from the response
    // The response might include markdown code block formatting
    let jsonStr;
    if (content.includes('```json')) {
      jsonStr = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      jsonStr = content.split('```')[1].split('```')[0].trim();
    } else {
      jsonStr = content.trim();
    }
    
    // Try to find JSON array in the response
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      console.log("Failed to parse JSON directly, attempting to extract JSON array");
      
      // Look for array-like structure in the text (common with LLM responses)
      const arrayMatch = jsonStr.match(/\[\s*{[\s\S]*}\s*\]/);
      if (arrayMatch) {
        try {
          return JSON.parse(arrayMatch[0]);
        } catch (e2) {
          console.log("Failed to extract JSON array");
        }
      }
      
      // As a fallback, convert the text response to a structured JSON array
      console.log("Converting text response to structured format");
      
      // Create a processed version to return
      const testCases = [];
      for (let i = 0; i < count; i++) {
        testCases.push({
          title: `Generated Test Case ${i+1}`,
          description: "Test case generated from AI response",
          steps: [
            {
              description: "Execute test steps as described in notes",
              expected_result: "See notes for expected results"
            }
          ],
          expected_result: "See description",
          priority: "medium",
          type: testType,
          notes: content // Store the full AI response as notes
        });
      }
      
      return testCases;
    }
  } catch (error) {
    console.error("Error generating test cases:", error);
    throw error;
  }
}