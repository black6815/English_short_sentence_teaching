#!/usr/bin/env node
import { writeDailyPhraseDraft } from "./phrases.mjs";

function parseArgs(argv) {
  const options = {
    force: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--force") {
      options.force = true;
      continue;
    }

    if (arg === "--date") {
      options.date = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--output-root") {
      options.outputRoot = argv[index + 1];
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

try {
  const result = await writeDailyPhraseDraft(parseArgs(process.argv.slice(2)));
  console.log(`Created ${result.outputFile}`);
  console.log(`Phrase count: ${result.draft.phrases.length}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
