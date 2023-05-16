import { readLines } from "https://deno.land/std/io/mod.ts";
import { hiraToRoma } from "https://raw.githubusercontent.com/marmooo/hiraroma/main/mod.js";

function kanaToHira(str) {
  return str.replace(/[ァ-ヶ]/g, function (match) {
    const chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

async function build() {
  const result = [];
  const fileReader = await Deno.open("emoji-ja.lst");
  for await (const line of readLines(fileReader)) {
    const [emoji, category, ja, jaStrict] = line.split(",");
    const roma = hiraToRoma(kanaToHira(ja));
    const row = [emoji, category, roma, ja, jaStrict];
    result.push(row.join(","));
  }
  Deno.writeTextFileSync("src/data/ja.csv", result.join("\n"));
}

await build();
