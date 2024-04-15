import { Buffer } from "node:buffer";
import { readdir, rmSync, writeFile } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "@dotenvx/dotenvx";
import axios from "axios";
import decompress from "decompress";
import { asString, generateCsv, mkConfig } from "export-to-csv";
import pdfUtil from "pdf-to-text";

import entities from "./entities.json" assert { type: "json" };

config();

const OUTPUT_FOLDER = "dist";

try {
  rmSync(OUTPUT_FOLDER, { recursive: true, force: true });
  await decompress(process.argv[2], OUTPUT_FOLDER);
  console.log("Extraction done!");
} catch (error) {
  console.error("Error while extracting files", error);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const directoryPath = join(__dirname, OUTPUT_FOLDER);

readdir(directoryPath, (err, files) => {
  if (err) return console.log(`Unable to scan directory: ${err}`);

  const extractionPromises = [];

  files
    .filter((file) => file.endsWith(".pdf"))
    .forEach((file) => {
      const filePath = `${directoryPath}/${file}`;

      extractionPromises.push(
        new Promise((resolve, reject) => {
          pdfUtil.pdfToText(filePath, (err, data) => {
            if (err) reject(err);

            const options = {
              method: "POST",
              url: "https://ai-textraction.p.rapidapi.com/textraction",
              headers: {
                "content-type": "application/json",
                "X-RapidAPI-Host": "ai-textraction.p.rapidapi.com",
                "X-RapidAPI-Key": process.env.API_KEY,
              },
              data: {
                entities,
                text: data,
              },
            };

            axios
              .request(options)
              .then(({ data: { results } }) => resolve(results))
              .catch(reject);
          });
        })
      );
    });

  Promise.all(extractionPromises).then((results) => saveCsv(results));
});

function saveCsv(results) {
  const config = mkConfig({ useKeysAsHeaders: true });
  const csv = generateCsv(config)(transformCsv(results));
  const filename = `${config.filename}.csv`;
  const buffer = new Uint8Array(Buffer.from(asString(csv)));
  writeFile(filename, buffer, (err) => {
    if (err) throw err;
    console.log("file saved: ", filename);
  });
}

function transformCsv(results) {
  return results.map((result) =>
    Object.keys(result).reduce(
      (acc, key) => ({
        ...acc,
        [key]: transformDatum(result[key]),
      }),
      {}
    )
  );
}

function transformDatum(datum) {
  if (Array.isArray(datum)) {
    return datum.join("|");
  }

  return datum;
}
