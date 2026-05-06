import fs from "node:fs/promises";
import path from "node:path";

const phraseBank = [
  { english: "Give it a try.", chinese: "試試看。" },
  { english: "Take your time.", chinese: "慢慢來。" },
  { english: "I am on my way.", chinese: "我在路上。" },
  { english: "That sounds good.", chinese: "聽起來不錯。" },
  { english: "Let me check.", chinese: "我查一下。" },
  { english: "Keep it simple.", chinese: "保持簡單。" },
  { english: "What do you mean?", chinese: "你是什麼意思？" },
  { english: "I got your point.", chinese: "我懂你的意思。" },
  { english: "Can you say that again?", chinese: "你可以再說一次嗎？" },
  { english: "It is up to you.", chinese: "由你決定。" },
  { english: "I need a minute.", chinese: "我需要一分鐘。" },
  { english: "Let's make a plan.", chinese: "我們來訂計畫。" },
  { english: "Do not worry.", chinese: "別擔心。" },
  { english: "I will handle it.", chinese: "我會處理。" },
  { english: "That makes sense.", chinese: "這說得通。" },
  { english: "See you soon.", chinese: "很快見。" },
  { english: "I am almost done.", chinese: "我快完成了。" },
  { english: "Please go ahead.", chinese: "請繼續。" },
  { english: "What is next?", chinese: "接下來是什麼？" },
  { english: "I like this idea.", chinese: "我喜歡這個想法。" },
  { english: "Let us start now.", chinese: "我們現在開始。" },
  { english: "That was helpful.", chinese: "那很有幫助。" },
  { english: "I will be right back.", chinese: "我馬上回來。" },
  { english: "Could you help me?", chinese: "你可以幫我嗎？" },
  { english: "No problem at all.", chinese: "完全沒問題。" },
  { english: "This is good enough.", chinese: "這樣夠好了。" },
  { english: "I am ready now.", chinese: "我現在準備好了。" },
  { english: "Tell me more.", chinese: "多告訴我一點。" },
  { english: "Let us try again.", chinese: "我們再試一次。" },
  { english: "You did a great job.", chinese: "你做得很好。" }
];

function formatLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateSeed(dateText) {
  return [...dateText].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function getTodayDateText() {
  return formatLocalDate();
}

export function generateDailyPhraseDraft({ date = getTodayDateText(), count = 20 } = {}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Date must use YYYY-MM-DD format.");
  }

  if (!Number.isInteger(count) || count < 1 || count > phraseBank.length) {
    throw new Error(`Count must be between 1 and ${phraseBank.length}.`);
  }

  const offset = dateSeed(date) % phraseBank.length;
  const selected = Array.from({ length: count }, (_, index) => {
    const source = phraseBank[(offset + index) % phraseBank.length];
    return {
      id: `phrase-${String(index + 1).padStart(2, "0")}`,
      english: source.english,
      chinese: source.chinese,
      repeatCount: 3,
      passes: [
        { index: 1, subtitles: [] },
        { index: 2, subtitles: ["english"] },
        { index: 3, subtitles: ["english", "chinese"] }
      ]
    };
  });

  return {
    schemaVersion: 1,
    date,
    title: `Daily English Short Sentences - ${date}`,
    style: {
      music: "retro funk rhythm",
      visuals: "exaggerated comic minimal design",
      subtitles: "burned-in, high readability"
    },
    phrases: selected
  };
}

export function validatePhraseDraft(draft, { expectedCount = 20 } = {}) {
  const errors = [];

  if (!draft || typeof draft !== "object") {
    return ["Draft must be an object."];
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date || "")) {
    errors.push("date must use YYYY-MM-DD format.");
  }

  if (!Array.isArray(draft.phrases)) {
    errors.push("phrases must be an array.");
    return errors;
  }

  if (draft.phrases.length !== expectedCount) {
    errors.push(`phrases must contain exactly ${expectedCount} items.`);
  }

  const seenEnglish = new Set();

  draft.phrases.forEach((phrase, index) => {
    const label = `phrases[${index}]`;
    const english = phrase?.english;
    const chinese = phrase?.chinese;

    if (!phrase?.id) errors.push(`${label}.id is required.`);
    if (!english) errors.push(`${label}.english is required.`);
    if (!chinese) errors.push(`${label}.chinese is required.`);
    if (english && english.length > 60) errors.push(`${label}.english is too long.`);
    if (chinese && chinese.length > 30) errors.push(`${label}.chinese is too long.`);
    if (phrase?.repeatCount !== 3) errors.push(`${label}.repeatCount must be 3.`);
    if (!Array.isArray(phrase?.passes) || phrase.passes.length !== 3) {
      errors.push(`${label}.passes must describe the 3 teaching passes.`);
    }

    if (english) {
      const normalized = english.toLowerCase();
      if (seenEnglish.has(normalized)) errors.push(`${label}.english is duplicated.`);
      seenEnglish.add(normalized);
    }
  });

  return errors;
}

export async function writeDailyPhraseDraft({
  date = getTodayDateText(),
  outputRoot = "outputs",
  force = false
} = {}) {
  const draft = generateDailyPhraseDraft({ date });
  const errors = validatePhraseDraft(draft);

  if (errors.length > 0) {
    throw new Error(`Phrase draft validation failed:\n${errors.join("\n")}`);
  }

  const outputDir = path.join(outputRoot, date);
  const outputFile = path.join(outputDir, "phrases.json");

  await fs.mkdir(outputDir, { recursive: true });

  if (!force) {
    try {
      await fs.access(outputFile);
      throw new Error(`${outputFile} already exists. Use --force to overwrite it.`);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }

  await fs.writeFile(outputFile, `${JSON.stringify(draft, null, 2)}\n`, "utf8");

  return {
    draft,
    outputFile
  };
}
