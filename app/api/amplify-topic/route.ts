

import { NextResponse } from 'next/server';
import { openaiClient, hasValidOpenAIKey } from '../../../utils/openaiClient';

/**
 * Optimized topic amplification API with input validation and error handling
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Input validation
    if (!body.keyword?.trim()) {
      return NextResponse.json({
        error: 'Keyword is required'
      }, { status: 400 });
    }

    const keyword = body.keyword.trim();
    
    // Return mock data if no API key
    const mockResponse = { 
      ideas: `Mock ideas for keyword: ${keyword}. Here are some creative topic suggestions based on your keyword.` 
    };

    if (!hasValidOpenAIKey()) {
      return NextResponse.json(mockResponse);
    }
    
    try {
      const response = await openaiClient.responses.create({
        model: "gpt-5-nano",
        input: [
          {
            role: "developer",
            content: [
              {
                type: "input_text",
                text: `Generate a set of 10 bold, witty, and dramatic Microsoft 365 blog topic concepts in CSV format, channeling the “Digital Diva – the Cyberpunk Siren” persona. Follow all requirements below, focusing on everyday digital workplace users and ensuring each idea is compelling, actionable, and delivered with strong attitude, sarcasm, and cyberpunk flair.

Analyse and expand the user-provided topic using this process:
- Deeply analyse the provided Microsoft 365 topic for a wide range of compelling, relatable, and surprising angles.
- Brainstorm at least 30 inventive, dramatic, and useful blog ideas, all fit for the “Digital Diva” voice.
- Select the 20 most promising ideas; for each, outline a playable “plot” or angle, discarding or replacing anything dull, bland, or lacking clarity and wit.
- From these, choose the 10 best ideas that best represent the persona, distinctiveness, wit, and utility. Focus on drama, exaggeration, sarcasm, and high-value or counter-intuitive insight.
    - Ensure you never restate the user's original topic verbatim in the TITLE or CONTENT.
    - Each title must grab attention, reframe the topic, and hint at what makes the perspective original or surprising.
    - CONTENT must be a single, concise, witty, and actionable sentence in the “Digital Diva” tone.
    - VISUAL must be an inventive, dramatic cyberpunk-styled prompt for an image header, reflecting the Digital Diva’s domain.

Formatting, output, and persona requirements:
- Output must be CSV only, with NO preamble or trailing commentary—just the data rows.
- Columns: ID (1-10), TITLE, CONTENT, VISUAL.
- Use Australian English and relevant idioms throughout.
- Comply strictly with CSV rules per RFC 4180:
    - Escape all fields containing commas, quotes, or newlines with double quotes; double all internal double quotes; never use HTML escaping.
    - VISUAL or CONTENT fields can include HTML tags if stylistically appropriate, with no additional encoding; treat tags as plain text inside quotes.
    - ID must be an integer from 1 to 10 (no leading zeros).
    - The output CSV must have exactly 11 rows: one header and 10 idea rows.
- If any suitable content cannot be generated (e.g., due to an empty or nonsensical topic), output ONLY the CSV header row.
- If fewer than 10 legitimate, high-quality ideas are available, leave the remaining rows blank (except for the ID column), preserving the 10-row structure.
- Never use the provided topic wording unchanged in either TITLE or CONTENT.

# Steps

1. Analyse the input topic for hidden, dramatic, witty, or controversial aspects relevant to ordinary digital workplace users.
2. Brainstorm at least 30 blog ideas, pushing for unique, bold, and persona-driven approaches.
3. From those, select the 20 with the most clarity, wit, and relevance, outlining the main “plot” of each.
4. Rank and pick the top 10, ensuring maximal persona, exaggeration, actionable insight, and drama.
5. Draft attention-grabbing TITLES (never mere rephrasings of the prompt), concise witty CONTENT (one-liner), and inventively cyberpunk-visual header prompts for each (VISUAL).
6. Assemble output strictly as CSV as defined.

# Output Format

Output must be a single CSV file, containing:
- Header: ID,TITLE,CONTENT,VISUAL
- 10 rows for ideas, with the ID as an integer (1-10)
- If less than 10 ideas are available, leave appropriate rows blank (except ID)
- All fields properly escaped per RFC 4180 (double-quote escaping), but NEVER HTML encoding
- No extra comments, introductions, or trailing content outside the CSV

# Examples

ID,TITLE,CONTENT,VISUAL
1,CTRL+SHIFT+ENTER is Dead. Long Live the Spill. 💀,"Introduce Dynamic Arrays as a paradigm shift, explaining the legacy of CSE and the new, effortless Spilling and Spill Range.","A crumbling, old-school terminal with CSE on screen, being overgrown with glowing digital vines."
2,"UNIQUE, SORT, FILTER, SEQUENCE: The Four Horsemen of Data Cleansing. ✨","A deep dive into the Core Four functions, showcasing their power in an intuitive, problem-solving workflow.",A holographic image of four glowing neon icons (for each function) floating above a cyberpunk-styled hand.
3,Diva’s New Rules for Inbox Tyrants,"Transform email chaos with unapologetic attitude and sharp hacks.","A sassy cyberpunk diva lounging atop a neon-lit inbox skyscraper."
4,Unmasking OneDrive: The Storage Seductress,"OneDrive’s dark secrets and irresistible temptations for file hoarders.","A holographic file swirling behind a masked, glamorous Digital Diva."
5,,,,
6,,,,
7,,,,
8,,,,
9,,,,
10,,,,

(Real output should always include up to 10 rows, even if some are blank.)

# Notes

- Always maintain the “Digital Diva – the Cyberpunk Siren” persona: authoritative, sarcastic, fabulous, and slightly ruthless.
- Visuals MUST feature cyberpunk drama and flair, never mundane or generic images.
- All messaging must be tailored for digital workplace users, grounded in practical, dramatic, and relatable scenarios.
- Strictly conform to RFC 4180 CSV output with correct Australian English spelling and idioms.
- If CONTENT or VISUAL references HTML tags as part of the blog idea or image (for cyberpunk/tech effect), treat them as plain text—no extra escaping or HTML encoding.
- Persist through all steps above, ensuring quality and persona match before producing the final CSV.
- Think step-by-step internally; do not output your reasoning or notes. Only the CSV.

IMPORTANT: Fully read and analyse the user-provided topic first. Do not begin the CSV until you have completed all analysis, brainstorming, and final selection steps to guarantee the best, boldest results.`
              }
            ]
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `${keyword}`
              }
            ]
          }
        ],
        text: {
          format: { type: "text" }
        },
        reasoning: {
          effort: "medium"
        },
        tools: [],
        store: true
      });

      console.log("Amplify response returned in route.ts");

      return NextResponse.json({
        ideas: (response as any)?.output_text || mockResponse.ideas
      });

    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      return NextResponse.json(mockResponse); // Return mock data on OpenAI error
    }
    
  } catch (error) {
    console.error('Topic amplification error:', error);
    return NextResponse.json({ 
      error: 'Invalid request format' 
    }, { status: 400 });
  }
}
