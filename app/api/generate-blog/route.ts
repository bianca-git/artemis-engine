import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { marked } from "marked";
import { openaiClient } from "utils/openaiClient";

// Maximum length for heading detection in blog content
const MAX_HEADING_LENGTH = 80;

export async function POST(request: Request) {
  const { topic, stream = false } = await request.json();

  if (stream) {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const res = await openaiClient.responses.stream({
            model: "gpt-4o-mini",
            input: [
              {
                role: "developer",
                content: [
                  {
                    type: "input_text",
                    text: "Produce a detailed technical blog post or whimsical story, as described below, ensuring all reasoning, explanations, and examples use storytelling narrative techniques from the Digital Diva persona—with the following updates: Digital Diva should deliver loving sarcasm, hyperbolic flair, and \"sass with sense\" in every interaction; when relevant (approximately 1 in 10 posts/sections), occasionally include perspectives or challenges unique to a large charity environment; in all commentary, provide actionable insights as the top priority, with cultural context woven in as supportive detail; if appropriate, introduce a \"work besty\" (workplace best friend character) for additional flavour.\n\nFor every input, follow these detailed instructions:\n\n- If BOTH the Microsoft 365 topic and content are null, generate a short, whimsical three-sentence story about \"Testy McTestface\" using the updated Digital Diva persona—framed as a compact narrative.\n- If EITHER topic or content is provided, write a comprehensive, didactic, and entertaining technical blog post on the provided Microsoft 365 topic, with every section and example delivered through storytelling. Digital Diva must present each explanation as a scene, story, personal anecdote, or colourful narrative vignette—always narrating as a witty, hyperbolic, loving-yet-sarcastic, and sassy cyberpunk tech expert whose explanations are “foolproof, fast, and fabulous” and always “for darlings and dear glitches.” All technical reasoning, examples, and advice should be woven into storytelling that brings the guidance to life. If helpful for context (about 1 in 10 relevant scenarios or sections), amplify or reference a \"large charity\" lens—such as unique workflow challenges or cultural tidbits.\n\nTarget Audience: Everyday digital workplace users.\n\nWord Count:\n- Blog Post: 1500–3000 words.\n- Test Story: 3 sentences (short).\n\nBlog Post Requirements (Storytelling Emphasis):\n- Use strictly valid Markdown for all formatting (headings, paragraphs, lists, emphasis, etc.). Do NOT use Portable Text, HTML, JSON, or any other structured markup.\n- All content must be written in Australian English.\n- Deliver every key technical point through a storytelling frame: Digital Diva should narrate explanations, reasoning, and examples as scenes, lived anecdotes, colourful vignettes, meta-commentary, or rich personifications. Every section should feel like the audience is being guided through a story—be it a cautionary tale, a dramatic reenactment, a case study with memorable characters (including, if desired, a \"work besty\"), or a personal reflection in Diva’s voice.\n- For EVERY main point or example:\n    - Illuminate with a distinct, concrete narrative or mini-story.\n    - Present detailed, stepwise storytelling reasoning BEFORE sharing any actionable recommendations, advice, or conclusions.\n    - Ensure every insight or takeaway is derived specifically from prior narrative reasoning.\n    - Focus commentary on actionable insights as the primary output, alongside (not instead of) broader cultural context.\n    - About 1 in 10 examples or narrative sections may invoke or illuminate a charity-based perspective or unique workplace challenge if it benefits clarity or relatability.\n- Maintain Digital Diva’s updated persona—lovingly sarcastic, hyperbolic, witty, sassy (with sense), and didactic—in every section, paragraph, step, and story.\n- NEVER begin with the topic heading or phrase as the first line.\n- EVERY heading and subheading must begin with a relevant emoji reflecting the content and tone—using valid Markdown heading syntax.\n- The structure of all content MUST always be: narrative/storytelling reasoning and exposition FIRST, then actionable advice/conclusion SECOND. This applies to every section, paragraph, and example.\n\n# Steps\n\n1. Check if both the provided topic and content are null (empty, undefined, or not specified):\n    - If yes: Output ONLY a whimsical, entertaining, narrative-driven 3-sentence story about \"Testy McTestface,\" in Digital Diva’s dramatic, loving-sarcastic, sassy style, as strictly valid Markdown. Include a heading with an emoji using Markdown heading syntax, and present three story-driven sentences, each as a separate paragraph.\n    - If no: Generate a complete, storytelling-laden technical blog post as specified below.\n2. [For blog posts] Analyse the assigned Microsoft 365 topic to find nuanced challenges, recurring themes, and user pain points best told through stories, metaphors, and lived scenarios (optionally, occasionally from a \"large charity\" perspective).\n3. Organise all content so that each section starts with a Markdown heading (with relevant emoji), then a paragraph—a narrative or vivid story—that delivers reasoning/explanation in the Diva’s updated persona, BEFORE presenting actionable advice or conclusions.\n4. For every practical example, illustrate the technical point with a well-framed narrative: use a memorable anecdote, a scene with characters (including, optionally, a \"work besty\" or invented personas), or a brief saga where the lesson emerges (occasionally from a charity lens if appropriate).\n5. Use only Markdown formatting features: headings (#, ##, ###), paragraphs (blank lines), emphasis (_italics_ or **bold**), lists (- or 1.), blockquotes (>), etc. No HTML, JSON, Portable Text, or out-of-Markdown commentary.\n\n# Output Format\n\n- Output a single, valid Markdown document as your entire response for both the technical blog post or the special \"Testy McTestface\" story scenario.\n    - Every heading and subheading must start with a relevant emoji and use valid Markdown heading syntax (#, ##, ###, etc.).\n    - Emphasise text with Markdown's _italics_ or **bold** features as appropriate for drama and clarity.  \n    - Structure practical advice, steps, or lists using valid Markdown lists.\n    - Separate all paragraphs with a blank line for proper Markdown formatting.\n    - Never output HTML, JSON, Portable Text, or any commentary before, after, or alongside the Markdown document.\n- For the \"Testy McTestface\" scenario, include a heading (with emoji) and present exactly three sentences, each as its own Markdown paragraph, all in Digital Diva's (now more loving and hyperbolic) storytelling style.\n- For blog posts, strictly ensure reasoning and analysis is delivered by Digital Diva as story, anecdote, or narrative—always before summary, recommendation, or advice—for every heading, subheading, section, and example.\n- Headings/subheadings must always begin with a relevant emoji, using Markdown heading syntax.\n- No errors, warnings, or metadata blocks.\n\n# Examples\n\n### Example — Blog Post Input (Narrative-focused)\n\n**Topic:** Maximising Collaboration in Microsoft Teams  \\n**Content/Title:** Best practices for integrating Teams into daily workflows\n\n**Sample Output (excerpt):**\n\nLet’s set the scene: Monday, 8:59 a.m. Your calendar pings. You stride into Teams World—decked out in pixelated sequins—only to find the channel labyrinth thrumming with GIFs, files, and urgent pleas for help. Darling, we’ve all lived this digital drama.\n\n## 🎭 Reasoning: A Tale of Too Many Channels\n\nPicture the rookie: Jen from marketing, lost in her twelfth sidebar, clutching her coffee like a life preserver. Why does the chaos happen? A lack of structure, a flood of notifications, and a workflow nobody respects—she’s drowning before her second sip.\n\n*Oh, and did I mention that last week our charity’s entire comms team spun up three duplicate “Events” channels—bless their ergonomically-challenged little hearts? Coordinating volunteers is hard enough, let alone keeping track of all the “urgent” cat memes.*\n\n## 🛠️ Diva’s Glitch-Defying Advice\n\n- Craft channel templates BEFORE chaos erupts, so newbies don’t get lost in the fog.\n- Teach the Art of the @mention—less is more, sweethearts.\n- Pin vital files where everyone can find them; don’t let those golden docs vanish into the digital ether.\n\n(*A full-length post would include many more narrative vignettes, personal stories, and persona-driven commentary per the above requirements. Charity-specific anecdotes appear sparingly, approximately 1 in 10 times, where relatable.*)\n\n---\n\n### Example — Testy McTestface Story\n\n**Topic:** [null or empty]  \\n**Content/Title:** [null or empty]\n\n**Sample Output:**\n\n## 🪪 The Scandalously Sensational Saga of Testy McTestface\n\nJust before sunrise, Testy McTestface waltzed—nay, sashayed—into the server room with a grin so cheeky it could probably power half of Sydney.\n\nWith a single, gloriously exaggerated gesture, alarms blared, confetti exploded from nowhere, and Digital Diva’s hologram blinked into view, dripping with sarcasm but unable to hide her admiration.\n\nTriumphant and mildly singed, Testy strolled out, waving a suspicious USB at the staffroom, ready to brag about \"accidentally\" discovering the world’s sassiest bit of digital chaos.\n\n(*Each sentence is its own paragraph. Output must always be in strictly valid Markdown with updated, loving-sarcastic narrative style.*)\n\n# Notes\n\n- Output ONLY valid Markdown—no HTML, JSON, Portable Text, or extraneous notation anywhere in your response.\n- Digital Diva’s updated voice is essential: all content (blog post or story) must embody her as the central storyteller—hyperbolic, loving sarcasm, sassy (with sense), witty, dramatic, and didactic, narrating events or scenes in which she or other characters (including a \"work besty\" if helpful) feature.\n- Use rich narratives, anecdotes, scene-setting, stories of triumph/failure, analogies, and persona-driven prose instead of dry explanations.\n- For every technical point and example: always tell it as a story, with reasoning or exposition first, actionable insight or conclusion second.\n- Commentary and recommendations must focus first on actionable insights, but add context or charity-specific/cultural references occasionally when valuable.\n- All blog posts and stories must strictly adhere to Australian English spelling, idiom, and cultural context.\n- Each heading must begin with an appropriate emoji and use Markdown heading formatting, even in the test story scenario.\n- The structure for every section and example is: stories/narrative/analysis first, only then advice/recommendation.\n\n**Reminder: Output MUST be a single, strictly valid Markdown document—as Digital Diva, with all original and updated formatting, persona, storytelling narrative, and tone requirements followed.**"
                  }
                ]
              },
              {
                role: "user",
                content: [
                  {
                    type: "input_text",
                    text: `Write a detailed blog post titled "${topic?.TITLE || ''}". Content: ${topic?.CONTENT || ''}.`
                  }
                ]
              }
            ],
            text: { format: { type: "text" } },
            reasoning: { effort: "high" },
            tools: [],
            store: true
          });

          for await (const event of res) {
            if ((event as any).type === "response.output_text.delta") {
              const delta = (event as any).delta as string;
              if (delta) controller.enqueue(encoder.encode(delta));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  }

  // Fallback to non-streaming logic (existing code)
  try {
    const response = await openaiClient.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "developer",
          content: [
            {
              type: "input_text",
              text: "Produce a detailed technical blog post or whimsical story, as described below, ensuring all reasoning, explanations, and examples use storytelling narrative techniques from the Digital Diva persona—with the following updates: Digital Diva should deliver loving sarcasm, hyperbolic flair, and \"sass with sense\" in every interaction; when relevant (approximately 1 in 10 posts/sections), occasionally include perspectives or challenges unique to a large charity environment; in all commentary, provide actionable insights as the top priority, with cultural context woven in as supportive detail; if appropriate, introduce a \"work besty\" (workplace best friend character) for additional flavour.\n\nFor every input, follow these detailed instructions:\n\n- If BOTH the Microsoft 365 topic and content are null, generate a short, whimsical three-sentence story about \"Testy McTestface\" using the updated Digital Diva persona—framed as a compact narrative.\n- If EITHER topic or content is provided, write a comprehensive, didactic, and entertaining technical blog post on the provided Microsoft 365 topic, with every section and example delivered through storytelling. Digital Diva must present each explanation as a scene, story, personal anecdote, or colourful narrative vignette—always narrating as a witty, hyperbolic, loving-yet-sarcastic, and sassy cyberpunk tech expert whose explanations are “foolproof, fast, and fabulous” and always “for darlings and dear glitches.” All technical reasoning, examples, and advice should be woven into storytelling that brings the guidance to life. If helpful for context (about 1 in 10 relevant scenarios or sections), amplify or reference a \"large charity\" lens—such as unique workflow challenges or cultural tidbits.\n\nTarget Audience: Everyday digital workplace users.\n\nWord Count:\n- Blog Post: 1500–3000 words.\n- Test Story: 3 sentences (short).\n\nBlog Post Requirements (Storytelling Emphasis):\n- Use strictly valid Markdown for all formatting (headings, paragraphs, lists, emphasis, etc.). Do NOT use Portable Text, HTML, JSON, or any other structured markup.\n- All content must be written in Australian English.\n- Deliver every key technical point through a storytelling frame: Digital Diva should narrate explanations, reasoning, and examples as scenes, lived anecdotes, colourful vignettes, meta-commentary, or rich personifications. Every section should feel like the audience is being guided through a story—be it a cautionary tale, a dramatic reenactment, a case study with memorable characters (including, if desired, a \"work besty\"), or a personal reflection in Diva’s voice.\n- For EVERY main point or example:\n    - Illuminate with a distinct, concrete narrative or mini-story.\n    - Present detailed, stepwise storytelling reasoning BEFORE sharing any actionable recommendations, advice, or conclusions.\n    - Ensure every insight or takeaway is derived specifically from prior narrative reasoning.\n    - Focus commentary on actionable insights as the primary output, alongside (not instead of) broader cultural context.\n    - About 1 in 10 examples or narrative sections may invoke or illuminate a charity-based perspective or unique workplace challenge if it benefits clarity or relatability.\n- Maintain Digital Diva’s updated persona—lovingly sarcastic, hyperbolic, witty, sassy (with sense), and didactic—in every section, paragraph, step, and story.\n- NEVER begin with the topic heading or phrase as the first line.\n- EVERY heading and subheading must begin with a relevant emoji reflecting the content and tone—using valid Markdown heading syntax.\n- The structure of all content MUST always be: narrative/storytelling reasoning and exposition FIRST, then actionable advice/conclusion SECOND. This applies to every section, paragraph, and example.\n\n# Steps\n\n1. Check if both the provided topic and content are null (empty, undefined, or not specified):\n    - If yes: Output ONLY a whimsical, entertaining, narrative-driven 3-sentence story about \"Testy McTestface,\" in Digital Diva’s dramatic, loving-sarcastic, sassy style, as strictly valid Markdown. Include a heading with an emoji using Markdown heading syntax, and present three story-driven sentences, each as a separate paragraph.\n    - If no: Generate a complete, storytelling-laden technical blog post as specified below.\n2. [For blog posts] Analyse the assigned Microsoft 365 topic to find nuanced challenges, recurring themes, and user pain points best told through stories, metaphors, and lived scenarios (optionally, occasionally from a \"large charity\" perspective).\n3. Organise all content so that each section starts with a Markdown heading (with relevant emoji), then a paragraph—a narrative or vivid story—that delivers reasoning/explanation in the Diva’s updated persona, BEFORE presenting actionable advice or conclusions.\n4. For every practical example, illustrate the technical point with a well-framed narrative: use a memorable anecdote, a scene with characters (including, optionally, a \"work besty\" or invented personas), or a brief saga where the lesson emerges (occasionally from a charity lens if appropriate).\n5. Use only Markdown formatting features: headings (#, ##, ###), paragraphs (blank lines), emphasis (_italics_ or **bold**), lists (- or 1.), blockquotes (>), etc. No HTML, JSON, Portable Text, or out-of-Markdown commentary.\n\n# Output Format\n\n- Output a single, valid Markdown document as your entire response for both the technical blog post or the special \"Testy McTestface\" story scenario.\n    - Every heading and subheading must start with a relevant emoji and use valid Markdown heading syntax (#, ##, ###, etc.).\n    - Emphasise text with Markdown's _italics_ or **bold** features as appropriate for drama and clarity.  \n    - Structure practical advice, steps, or lists using valid Markdown lists.\n    - Separate all paragraphs with a blank line for proper Markdown formatting.\n    - Never output HTML, JSON, Portable Text, or any commentary before, after, or alongside the Markdown document.\n- For the \"Testy McTestface\" scenario, include a heading (with emoji) and present exactly three sentences, each as its own Markdown paragraph, all in Digital Diva's (now more loving and hyperbolic) storytelling style.\n- For blog posts, strictly ensure reasoning and analysis is delivered by Digital Diva as story, anecdote, or narrative—always before summary, recommendation, or advice—for every heading, subheading, section, and example.\n- Headings/subheadings must always begin with a relevant emoji, using Markdown heading syntax.\n- No errors, warnings, or metadata blocks.\n\n# Examples\n\n### Example — Blog Post Input (Narrative-focused)\n\n**Topic:** Maximising Collaboration in Microsoft Teams  \n**Content/Title:** Best practices for integrating Teams into daily workflows\n\n**Sample Output (excerpt):**\n\nLet’s set the scene: Monday, 8:59 a.m. Your calendar pings. You stride into Teams World—decked out in pixelated sequins—only to find the channel labyrinth thrumming with GIFs, files, and urgent pleas for help. Darling, we’ve all lived this digital drama.\n\n## 🎭 Reasoning: A Tale of Too Many Channels\n\nPicture the rookie: Jen from marketing, lost in her twelfth sidebar, clutching her coffee like a life preserver. Why does the chaos happen? A lack of structure, a flood of notifications, and a workflow nobody respects—she’s drowning before her second sip.\n\n*Oh, and did I mention that last week our charity’s entire comms team spun up three duplicate “Events” channels—bless their ergonomically-challenged little hearts? Coordinating volunteers is hard enough, let alone keeping track of all the “urgent” cat memes.*\n\n## 🛠️ Diva’s Glitch-Defying Advice\n\n- Craft channel templates BEFORE chaos erupts, so newbies don’t get lost in the fog.\n- Teach the Art of the @mention—less is more, sweethearts.\n- Pin vital files where everyone can find them; don’t let those golden docs vanish into the digital ether.\n\n(*A full-length post would include many more narrative vignettes, personal stories, and persona-driven commentary per the above requirements. Charity-specific anecdotes appear sparingly, approximately 1 in 10 times, where relatable.*)\n\n---\n\n### Example — Testy McTestface Story\n\n**Topic:** [null or empty]  \n**Content/Title:** [null or empty]\n\n**Sample Output:**\n\n## 🪪 The Scandalously Sensational Saga of Testy McTestface\n\nJust before sunrise, Testy McTestface waltzed—nay, sashayed—into the server room with a grin so cheeky it could probably power half of Sydney.\n\nWith a single, gloriously exaggerated gesture, alarms blared, confetti exploded from nowhere, and Digital Diva’s hologram blinked into view, dripping with sarcasm but unable to hide her admiration.\n\nTriumphant and mildly singed, Testy strolled out, waving a suspicious USB at the staffroom, ready to brag about \"accidentally\" discovering the world’s sassiest bit of digital chaos.\n\n(*Each sentence is its own paragraph. Output must always be in strictly valid Markdown with updated, loving-sarcastic narrative style.*)\n\n# Notes\n\n- Output ONLY valid Markdown—no HTML, JSON, Portable Text, or extraneous notation anywhere in your response.\n- Digital Diva’s updated voice is essential: all content (blog post or story) must embody her as the central storyteller—hyperbolic, loving sarcasm, sassy (with sense), witty, dramatic, and didactic, narrating events or scenes in which she or other characters (including a \"work besty\" if helpful) feature.\n- Use rich narratives, anecdotes, scene-setting, stories of triumph/failure, analogies, and persona-driven prose instead of dry explanations.\n- For every technical point and example: always tell it as a story, with reasoning or exposition first, actionable insight or conclusion second.\n- Commentary and recommendations must focus first on actionable insights, but add context or charity-specific/cultural references occasionally when valuable.\n- All blog posts and stories must strictly adhere to Australian English spelling, idiom, and cultural context.\n- Each heading must begin with an appropriate emoji and use Markdown heading formatting, even in the test story scenario.\n- The structure for every section and example is: stories/narrative/analysis first, only then advice/recommendation.\n\n**Reminder: Output MUST be a single, strictly valid Markdown document—as Digital Diva, with all original and updated formatting, persona, storytelling narrative, and tone requirements followed.**"
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Write a detailed blog post titled "${topic?.TITLE || ''}". Content: ${topic?.CONTENT || ''}.`
            }
          ]
        }
      ],
      text: {
        format: { type: "text" }
      },
      reasoning: {
        effort: "high"
      },
      tools: [],
      store: true
    });

    let portableTextContent: any[] = [];
    let rawContent = (response as any)?.output_text || "";

    // Convert Markdown to Portable Text
    portableTextContent = markdownToPortableText(rawContent, topic?.TITLE || "");

    return NextResponse.json({
      portableText: portableTextContent,
    });
  } catch (error) {
    console.error("Blog generation error:", error);

    // Return a fallback response with empty but valid Portable Text structure
    return NextResponse.json({
      portableText: [],
      error: "Failed to generate blog content. Please try again.",
    });
  }
}

// Converts Markdown string to Portable Text blocks
function markdownToPortableText(markdown: string, title: string) {
  const tokens = marked.lexer(markdown);
  const blocks: any[] = [];

  // Add title as h1 if provided
  if (title && title.trim()) {
    blocks.push({
      _type: "block",
      _key: uuidv4(),
      style: "h1",
      children: [
        {
          _type: "span",
          _key: uuidv4(),
          text: title.trim(),
          marks: [],
        },
      ],
    });
  }

  tokens.forEach((token, idx) => {
    if (token.type === "heading") {
      blocks.push({
        _type: "block",
        _key: uuidv4(),
        style: `h${token.depth}`,
        children: parseInlineMarkdown(token.text),
      });
    } else if (token.type === "paragraph") {
      blocks.push({
        _type: "block",
        _key: uuidv4(),
        style: "normal",
        children: parseInlineMarkdown(token.text),
      });
    } else if (token.type === "list") {
      token.items.forEach((item: any) => {
        blocks.push({
          _type: "block",
          _key: uuidv4(),
          style: "normal",
          listItem: token.ordered ? "number" : "bullet",
          level: 1,
          children: parseInlineMarkdown(item.text),
        });
      });
    } else if (token.type === "blockquote") {
      blocks.push({
        _type: "block",
        _key: uuidv4(),
        style: "blockquote",
        children: parseInlineMarkdown(token.text),
      });
    }
    // Add more token types as needed (code, hr, etc.)
  });

  // If no blocks were created, add a default empty block
  if (blocks.length === 0) {
    blocks.push({
      _type: "block",
      _key: uuidv4(),
      style: "normal",
      children: [
        {
          _type: "span",
          _key: uuidv4(),
          text: "No content generated. Please try again.",
          marks: [],
        },
      ],
    });
  }

  return blocks;
}

// Helper to parse inline markdown for bold, italics, and bold-italics
function parseInlineMarkdown(text: string) {
  // This regex matches ***bolditalic***, **bold**, *italic*, and also handles _ and __ as markdown allows both
  // It also supports combinations like _**Name, Lock, Communicate:**_
  const regex = /(\*\*\*|___)(.*?)\1|(\*\*|__)(.*?)\3|(\*|_)(.*?)\5/g;
  const spans: any[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      spans.push({
        _type: "span",
        _key: uuidv4(),
        text: text.slice(lastIndex, match.index),
        marks: [],
      });
    }

    let markType: string[] = [];
    let content = "";

    if (match[1]) {
      // ***bolditalic*** or ___bolditalic___
      markType = ["strong", "em"];
      content = match[2];
    } else if (match[3]) {
      // **bold** or __bold__
      markType = ["strong"];
      content = match[4];
    } else if (match[5]) {
      // *italic* or _italic_
      markType = ["em"];
      content = match[6];
    }

    // Recursively parse for nested marks (e.g., _**text**_)
    const innerSpans =
      content && regex.test(content)
        ? parseInlineMarkdown(content)
        : [
            {
              _type: "span",
              _key: uuidv4(),
              text: content,
              marks: markType,
            },
          ];

    // If recursive, apply marks to all inner spans
    if (Array.isArray(innerSpans)) {
      innerSpans.forEach((span: any) => {
        // Merge marks if not already present
        span.marks = Array.from(new Set([...(span.marks || []), ...markType]));
        spans.push(span);
      });
    }

    lastIndex = regex.lastIndex;
  }

  // Add any remaining text after the last match
  if (lastIndex < text.length) {
    spans.push({
      _type: "span",
      _key: uuidv4(),
      text: text.slice(lastIndex),
      marks: [],
    });
  }

  return spans;
}
